import {
  ExperimentTemplate,
  MAX_BULLETS,
  MAX_ROUNDS,
  Tactic,
  getTemplate,
} from "../data/experiments";

/* ------------------------------------------------------------------ */
/* 类型                                                                */
/* ------------------------------------------------------------------ */

export interface Bullet {
  text: string;
  aff: Record<string, number>;
}

export type OpKind = "add" | "refine" | "prune" | "focus" | "insight";

export const OP_META: Record<OpKind, { label: string; color: string }> = {
  add: { label: "新增", color: "#22d3ee" },
  refine: { label: "强化", color: "#a78bfa" },
  prune: { label: "剪枝", color: "#fb7185" },
  focus: { label: "整合", color: "#a3e635" },
  insight: { label: "反思大变异", color: "#fbbf24" },
};

export interface Candidate {
  op: OpKind;
  opDesc: string;
  bullets: Bullet[];
  /** 真实质量（上帝视角，仅用于图表对照） */
  trueTotal: number;
  trueScores: Record<string, number>;
  /** 评估器给出的观测分（含噪声） */
  observed: number;
  accepted: boolean;
}

export interface RoundRecord {
  round: number;
  candidates: Candidate[];
  acceptedIdx: number | null;
  sigma: number;
}

export type LogType = "accept" | "reject" | "insight" | "meta";

export interface LogEntry {
  round: number;
  type: LogType;
  text: string;
}

export interface ExperimentState {
  id: string;
  templateId: string;
  objective: string;
  createdAt: number;
  rngState: number;
  round: number;
  best: {
    bullets: Bullet[];
    observed: number;
    trueTotal: number;
    trueScores: Record<string, number>;
  };
  history: { round: number; observed: number; true: number }[];
  rounds: RoundRecord[];
  log: LogEntry[];
  patterns: string[];
  stagnation: number;
  objectiveTokens: string[];
}

/* ------------------------------------------------------------------ */
/* 随机数（mulberry32，状态可序列化）                                    */
/* ------------------------------------------------------------------ */

function rngNext(s: number): { v: number; s: number } {
  let t = (s + 0x6d2b79f5) | 0;
  let r = t;
  r = Math.imul(r ^ (r >>> 15), r | 1);
  r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
  return { v: ((r ^ (r >>> 14)) >>> 0) / 4294967296, s: t };
}

function gauss(state: number): { v: number; s: number } {
  // Box-Muller
  const a = rngNext(state);
  const b = rngNext(a.s);
  const u = Math.max(a.v, 1e-9);
  const v = b.v;
  return { v: Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v), s: b.s };
}

/* ------------------------------------------------------------------ */
/* 评估（上帝视角的真实质量）                                             */
/* ------------------------------------------------------------------ */

const DECAY = [1, 0.62, 0.46, 0.36, 0.29, 0.24, 0.21];

function dimScore(bullets: Bullet[], dim: string): number {
  const contribs = bullets
    .map((b) => b.aff[dim] ?? 0)
    .sort((x, y) => y - x);
  let s = 25;
  contribs.forEach((c, i) => {
    s += c * 29 * (DECAY[i] ?? 0.2);
  });
  return Math.min(100, s);
}

function objectiveCoverage(bullets: Bullet[], tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const corpus = bullets.map((b) => b.text).join("");
  const hit = tokens.filter((t) => corpus.includes(t)).length;
  return hit / tokens.length;
}

export function trueScore(
  template: ExperimentTemplate,
  bullets: Bullet[],
  tokens: string[]
): { total: number; scores: Record<string, number> } {
  const scores: Record<string, number> = {};
  let sum = 0;
  for (const d of template.dims) {
    scores[d.key] = dimScore(bullets, d.key);
    sum += scores[d.key];
  }
  let total = sum / template.dims.length;
  const vals = template.dims.map((d) => scores[d.key]);
  if (Math.min(...vals) >= 62) total += 3; // 均衡加成
  if (Math.max(...vals) >= 88) total += 2; // 尖峰加成
  total += 4 * objectiveCoverage(bullets, tokens); // 目标对齐加成
  return { total: Math.min(99, Math.round(total * 10) / 10), scores };
}

/* ------------------------------------------------------------------ */
/* 变异算子                                                             */
/* ------------------------------------------------------------------ */

const REFINE_SUFFIX = "——并设定可量化的成功指标";

function unusedTactics(template: ExperimentTemplate, bullets: Bullet[]): Tactic[] {
  return template.tactics.filter((t) => !bullets.some((b) => b.text === t.text));
}

function pickWeighted<T>(items: T[], weights: number[], r: number): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let x = r * total;
  for (let i = 0; i < items.length; i++) {
    x -= weights[i];
    if (x <= 0) return items[i];
  }
  return items[items.length - 1];
}

function mutate(
  template: ExperimentTemplate,
  bullets: Bullet[],
  rng: number,
  forceInsight: boolean
): { op: OpKind; opDesc: string; bullets: Bullet[]; rng: number } {
  let s = rng;
  const rand = () => {
    const n = rngNext(s);
    s = n.s;
    return n.v;
  };
  const unused = unusedTactics(template, bullets);

  if (forceInsight) {
    // 反思大变异：剪掉最弱的 2 条 + 引入 2 条全新方向
    const sorted = [...bullets].sort(
      (a, b) => sumAff(b) - sumAff(a)
    );
    const kept = sorted.slice(0, Math.max(2, bullets.length - 2));
    const fresh = unused.slice(0, 2).map((t) => ({ text: t.text, aff: { ...t.aff } }));
    const merged = [...kept, ...fresh].slice(0, MAX_BULLETS);
    return {
      op: "insight",
      opDesc: "反思事件：剪除低效方向 ×2，引入全新方向 ×2",
      bullets: merged,
      rng: s,
    };
  }

  // 操作权重
  const wAdd = unused.length > 0 ? 0.34 : 0;
  const wRefine = bullets.length >= 2 ? 0.3 : 0.5;
  const wPrune = bullets.length > 3 ? 0.18 : 0.04;
  const wFocus = 0.18;
  const ops: OpKind[] = ["add", "refine", "prune", "focus"];
  const weights = [wAdd, wRefine, wPrune, wFocus];
  let op = pickWeighted(ops, weights, rand());

  // 满员时 add 变为「替换」
  if (op === "add" && bullets.length >= MAX_BULLETS) {
    const sorted = [...bullets].sort((a, b) => sumAff(b) - sumAff(a));
    const dropped = sorted[sorted.length - 1];
    const fresh = pickWeighted(unused, unused.map(() => 1), rand());
    return {
      op: "add",
      opDesc: `替换：剪掉「${clip(dropped.text)}」，换入「${clip(fresh.text)}」`,
      bullets: [...sorted.slice(0, -1), { text: fresh.text, aff: { ...fresh.aff } }],
      rng: s,
    };
  }

  if (op === "add" && unused.length > 0) {
    const t = pickWeighted(unused, unused.map(() => 1), rand());
    return {
      op,
      opDesc: `新增要点「${clip(t.text)}」`,
      bullets: [...bullets, { text: t.text, aff: { ...t.aff } }],
      rng: s,
    };
  }

  if (op === "refine") {
    const idx = pickWeighted(
      bullets.map((_, i) => i),
      bullets.map((b) => 0.3 + sumAff(b)),
      rand()
    );
    const b = bullets[idx];
    const refinedCount = (b.text.match(/——/g) ?? []).length;
    if (refinedCount >= 2) {
      // 已强化两次，收益趋零 → 转为新增
      const t = unused.length > 0 ? pickWeighted(unused, unused.map(() => 1), rand()) : null;
      if (t) {
        return {
          op: "add",
          opDesc: `新增要点「${clip(t.text)}」`,
          bullets: [...bullets, { text: t.text, aff: { ...t.aff } }],
          rng: s,
        };
      }
      op = "prune";
    } else {
      const boost = refinedCount === 0 ? 0.07 : 0.03;
      const aff: Record<string, number> = {};
      for (const [k, v] of Object.entries(b.aff)) aff[k] = Math.min(0.95, v + boost);
      const next = [...bullets];
      next[idx] = { text: b.text + REFINE_SUFFIX, aff };
      return {
        op: "refine",
        opDesc: `强化「${clip(b.text, 12)}」：落到可量化指标`,
        bullets: next,
        rng: s,
      };
    }
  }

  if (op === "prune" && bullets.length > 3) {
    // 剪掉边际贡献最低的一条
    let worst = 0;
    let worstDelta = Infinity;
    for (let i = 0; i < bullets.length; i++) {
      const without = bullets.filter((_, j) => j !== i);
      const d =
        trueScore(template, without, []).total - trueScore(template, bullets, []).total;
      if (d < worstDelta) {
        worstDelta = d;
        worst = i;
      }
    }
    return {
      op: "prune",
      opDesc: `剪枝「${clip(bullets[worst].text)}」（边际贡献最低）`,
      bullets: bullets.filter((_, i) => i !== worst),
      rng: s,
    };
  }

  // focus：同主维的两条合并为组合拳
  const primary = (b: Bullet) => {
    let best = "";
    let v = -1;
    for (const [k, x] of Object.entries(b.aff)) if (x > v) { v = x; best = k; }
    return best;
  };
  const pair: [number, number] | null = (() => {
    for (let i = 0; i < bullets.length; i++)
      for (let j = i + 1; j < bullets.length; j++)
        if (primary(bullets[i]) === primary(bullets[j])) return [i, j];
    return null;
  })();
  if (pair) {
    const [i, j] = pair;
    const a1 = bullets[i];
    const a2 = bullets[j];
    const aff: Record<string, number> = {};
    for (const k of new Set([...Object.keys(a1.aff), ...Object.keys(a2.aff)])) {
      aff[k] = Math.min(0.95, Math.max(a1.aff[k] ?? 0, a2.aff[k] ?? 0) + 0.05);
    }
    const merged: Bullet = { text: `${a1.text} ＋ ${a2.text}`, aff };
    const next = bullets.filter((_, x) => x !== i && x !== j).concat(merged);
    return {
      op: "focus",
      opDesc: `整合「${clip(a1.text, 10)}」与「${clip(a2.text, 10)}」为组合策略`,
      bullets: next,
      rng: s,
    };
  }

  // 兜底：新增或强化
  if (unused.length > 0) {
    const t = pickWeighted(unused, unused.map(() => 1), rand());
    return {
      op: "add",
      opDesc: `新增要点「${clip(t.text)}」`,
      bullets: [...bullets, { text: t.text, aff: { ...t.aff } }],
      rng: s,
    };
  }
  return { op: "refine", opDesc: "维持并微调", bullets, rng: s };
}

function sumAff(b: Bullet): number {
  return Object.values(b.aff).reduce((a, v) => a + v, 0);
}

function clip(s: string, n = 16): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

/* ------------------------------------------------------------------ */
/* 主循环                                                              */
/* ------------------------------------------------------------------ */

function extractTokens(objective: string): string[] {
  const tokens = objective
    .split(/[，。、；;:：,.\s()（）\-—/|·!?！？]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && t.length <= 8);
  return Array.from(new Set(tokens)).slice(0, 10);
}

export function createExperiment(
  templateId: string,
  objective: string
): ExperimentState {
  const template = getTemplate(templateId);
  const seedBullets: Bullet[] = template.seedBullets.map((text) => ({
    text,
    aff: { ...template.seedAff },
  }));
  const tokens = extractTokens(objective);
  const { total, scores } = trueScore(template, seedBullets, tokens);
  const st: ExperimentState = {
    id: `exp-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`,
    templateId,
    objective: objective.trim(),
    createdAt: Date.now(),
    rngState: (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0,
    round: 0,
    best: {
      bullets: seedBullets,
      observed: total,
      trueTotal: total,
      trueScores: scores,
    },
    history: [{ round: 0, observed: total, true: total }],
    rounds: [],
    log: [
      {
        round: 0,
        type: "meta",
        text: `实验初始化：初始方案真实质量 ${total.toFixed(1)}，评估器噪声 σ=5.5`,
      },
    ],
    patterns: [],
    stagnation: 0,
    objectiveTokens: tokens,
  };
  return st;
}

export function sigmaAt(round: number): number {
  return Math.max(0.6, Math.round(5.5 * Math.exp(-round / 5) * 10) / 10);
}

export function stepRound(state: ExperimentState): ExperimentState {
  if (state.round >= MAX_ROUNDS) return state;
  const template = getTemplate(state.templateId);
  const next: ExperimentState = JSON.parse(JSON.stringify(state));
  const roundNo = next.round + 1;
  const sigma = sigmaAt(roundNo);

  let rng = next.rngState;
  const rand = () => {
    const n = rngNext(rng);
    rng = n.s;
    return n.v;
  };

  const insightRound = next.stagnation >= 3;
  const candidates: Candidate[] = [];
  const seenTexts = new Set<string>();

  for (let k = 0; k < 3; k++) {
    const force = insightRound && k === 0;
    const m = mutate(template, next.best.bullets, rng, force);
    rng = m.rng;
    // 防重复候选
    const key = m.bullets.map((b) => b.text).join("|");
    if (seenTexts.has(key) && k < 2) continue;
    seenTexts.add(key);
    const { total, scores } = trueScore(template, m.bullets, next.objectiveTokens);
    const g = gauss(rng);
    rng = g.s;
    const obs = Math.max(0, Math.min(100, Math.round((total + g.v * sigma) * 10) / 10));
    candidates.push({
      op: m.op,
      opDesc: m.opDesc,
      bullets: m.bullets,
      trueTotal: total,
      trueScores: scores,
      observed: obs,
      accepted: false,
    });
  }

  // 择优（按观测分——回路只知道观测值）
  let bestIdx = -1;
  let bestObs = next.best.observed;
  candidates.forEach((c, i) => {
    if (c.observed > bestObs) {
      bestObs = c.observed;
      bestIdx = i;
    }
  });

  let insightText: string | null = null;
  if (bestIdx >= 0) {
    const c = candidates[bestIdx];
    c.accepted = true;
    const delta = c.observed - next.best.observed;
    next.best = {
      bullets: c.bullets,
      observed: c.observed,
      trueTotal: c.trueTotal,
      trueScores: c.trueScores,
    };
    next.stagnation = 0;
    next.log.push({
      round: roundNo,
      type: "accept",
      text: `第 ${roundNo} 轮 · 采纳${OP_META[c.op].label}变异（${c.opDesc}）——观测分 +${delta.toFixed(1)} → ${c.observed.toFixed(1)}`,
    });
    if (delta >= 2.2) {
      const pat = `${OP_META[c.op].label}：${c.opDesc}`;
      if (!next.patterns.includes(pat)) next.patterns.push(pat);
    }
    if (c.op === "insight") {
      insightText = template.insights[Math.floor(rand() * template.insights.length)];
      next.log.push({ round: roundNo, type: "insight", text: `🔄 反思事件生效：${insightText}` });
    }
  } else {
    next.stagnation += 1;
    const top = candidates.reduce((a, b) => (b.observed > a.observed ? b : a));
    next.log.push({
      round: roundNo,
      type: "reject",
      text: `第 ${roundNo} 轮 · 全部变异被拒绝（最优 ${top.observed.toFixed(1)} < 现有 ${next.best.observed.toFixed(1)}），连续停滞 ×${next.stagnation}`,
    });
    if (next.stagnation === 3) {
      next.log.push({
        round: roundNo,
        type: "meta",
        text: "⚠ 停滞达到阈值，下一轮将触发反思事件：放大变异幅度，跳出局部最优",
      });
    }
  }

  // 评估器元改进日志
  if (roundNo % 4 === 0 || roundNo === 1) {
    next.log.push({
      round: roundNo,
      type: "meta",
      text: `🛠 评估器自校准：噪声 σ ${sigmaAt(roundNo - 1)} → ${sigma}（回路正在改进自己的眼睛）`,
    });
  }

  next.rounds.push({
    round: roundNo,
    candidates,
    acceptedIdx: bestIdx,
    sigma,
  });
  next.history.push({
    round: roundNo,
    observed: next.best.observed,
    true: next.best.trueTotal,
  });
  next.round = roundNo;
  next.rngState = rng;
  return next;
}
