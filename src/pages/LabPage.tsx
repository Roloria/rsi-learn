import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FlaskConical,
  Play,
  Pause,
  StepForward,
  RotateCcw,
  Trash2,
  ArrowLeft,
  Zap,
  Award,
  ScrollText,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  TEMPLATES,
  getTemplate,
  MAX_ROUNDS,
} from "../data/experiments";
import {
  Candidate,
  ExperimentState,
  OP_META,
  createExperiment,
  sigmaAt,
  stepRound,
} from "../lib/engine";
import { LabMeta, deleteLab, loadLabState, loadLabs, saveLab } from "../lib/storage";

/* ---------------- 分数曲线 ---------------- */

function ScoreChart({ state }: { state: ExperimentState }) {
  const W = 660;
  const H = 250;
  const P = { l: 34, r: 14, t: 16, b: 26 };
  const hist = state.history;
  const xs = (r: number) => P.l + (r / MAX_ROUNDS) * (W - P.l - P.r);
  const all = hist.flatMap((h) => [h.observed, h.true]);
  const lo = Math.max(0, Math.min(...all) - 6);
  const hi = Math.min(105, Math.max(...all) + 6);
  const ys = (v: number) =>
    P.t + (1 - (v - lo) / (hi - lo)) * (H - P.t - P.b);

  const line = (key: "observed" | "true") =>
    hist.map((h, i) => `${i === 0 ? "M" : "L"}${xs(h.round)},${ys(h[key])}`).join(" ");

  // σ 带区域
  const band = (() => {
    const up = hist.map(
      (h, i) => `${i === 0 ? "M" : "L"}${xs(h.round)},${ys(Math.min(100, h.true + 2 * sigmaAt(h.round)))}`
    );
    const down = [...hist]
      .reverse()
      .map(
        (h) =>
          `L${xs(h.round)},${ys(Math.max(0, h.true - 2 * sigmaAt(h.round)))}`
      );
    return [...up, ...down, "Z"].join(" ");
  })();

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* y 网格 */}
      {[Math.round(lo), Math.round((lo + hi) / 2), Math.round(hi)].map((v) => (
        <g key={v}>
          <line
            x1={P.l}
            y1={ys(v)}
            x2={W - P.r}
            y2={ys(v)}
            stroke="#1a2436"
            strokeDasharray="3 5"
          />
          <text x={P.l - 6} y={ys(v) + 3} textAnchor="end" fontSize="9" fill="#5b6577">
            {v}
          </text>
        </g>
      ))}
      {/* x 刻度 */}
      {[0, 5, 10, 15].map((r) => (
        <text key={r} x={xs(r)} y={H - 8} textAnchor="middle" fontSize="9" fill="#5b6577">
          {r === 0 ? "初始" : `第${r}轮`}
        </text>
      ))}

      {/* σ 带真实质量 */}
      <path d={band} fill="rgba(167,139,250,0.07)" />
      <path d={line("true")} fill="none" stroke="#a78bfa" strokeWidth="1.6" strokeDasharray="5 4" />

      {/* 观测分 */}
      <path d={line("observed")} fill="none" stroke="#22d3ee" strokeWidth="2.2" />

      {hist.map((h, i) => {
        const accepted = i > 0 && state.rounds[i - 1]?.acceptedIdx !== null;
        return (
          <g key={i}>
            <circle
              cx={xs(h.round)}
              cy={ys(h.observed)}
              r={i === hist.length - 1 ? 4 : 2.8}
              fill={accepted ? "#a3e635" : "#22d3ee"}
              stroke="#07090d"
              strokeWidth="1"
            />
            <circle
              cx={xs(h.round)}
              cy={ys(h.true)}
              r="2"
              fill="#a78bfa"
              opacity="0.8"
            />
          </g>
        );
      })}

      {/* 图例 */}
      <g fontSize="9.5">
        <circle cx={P.l + 4} cy={12} r="3" fill="#22d3ee" />
        <text x={P.l + 12} y={15} fill="#8b96a8">观测分（评估器视角，含噪声）</text>
        <circle cx={P.l + 204} cy={12} r="3" fill="#a78bfa" />
        <text x={P.l + 212} y={15} fill="#8b96a8">真实质量（上帝视角）</text>
        <rect x={P.l + 320} y={6} width="26" height="10" fill="rgba(167,139,250,0.12)" />
        <text x={P.l + 352} y={15} fill="#8b96a8">±2σ 评估噪声带</text>
      </g>
    </svg>
  );
}

/* ---------------- 候选卡 ---------------- */

function CandidateCard({
  c,
  showTrue,
}: {
  c: Candidate;
  showTrue: boolean;
}) {
  const meta = OP_META[c.op];
  return (
    <div
      className={`card p-4 ${
        c.accepted ? "border-lime/50 shadow-[0_0_24px_-10px_rgba(163,230,53,0.3)]" : "opacity-80"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold"
          style={{ color: meta.color, background: `${meta.color}1a` }}
        >
          {meta.label}
        </span>
        {c.accepted ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-lime">
            <CheckCircle2 size={12} /> 已整合入主干
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] text-fog">
            <XCircle size={12} /> 淘汰
          </span>
        )}
      </div>
      <div className="mt-2.5 text-[13px] leading-relaxed text-snow/90">{c.opDesc}</div>
      <div className="mt-3 flex items-baseline justify-between">
        <div>
          <span className="font-display text-2xl font-extrabold text-cyan">
            {c.observed.toFixed(1)}
          </span>
          <span className="ml-1 text-[10px] text-fog">观测分</span>
        </div>
        {showTrue && (
          <span className="font-mono text-[11px] text-violet/80">
            真实 {c.trueTotal.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------------- 页面 ---------------- */

export default function LabPage() {
  const [exp, setExp] = useState<ExperimentState | null>(null);
  const [labs, setLabs] = useState<LabMeta[]>([]);
  const [tplId, setTplId] = useState(TEMPLATES[0].id);
  const [objective, setObjective] = useState("");
  const [running, setRunning] = useState(false);
  const [showTrue, setShowTrue] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLabs(loadLabs());
  }, []);

  // 每次状态变化持久化
  useEffect(() => {
    if (exp) {
      saveLab(exp);
      setLabs(loadLabs());
    }
  }, [exp]);

  const step = useCallback(() => {
    setExp((prev) => (prev ? stepRound(prev) : prev));
  }, []);

  // 自动运行
  useEffect(() => {
    if (!running || !exp) return;
    if (exp.round >= MAX_ROUNDS) {
      setRunning(false);
      return;
    }
    const timer = setTimeout(step, 850);
    return () => clearTimeout(timer);
  }, [running, exp, step]);

  const start = () => {
    if (!objective.trim()) return;
    const e = createExperiment(tplId, objective.trim());
    setExp(e);
  };

  const restart = () => {
    if (!exp) return;
    const e = createExperiment(exp.templateId, exp.objective);
    setExp(e);
  };

  const back = () => {
    setRunning(false);
    setExp(null);
    setLabs(loadLabs());
  };

  const removeLab = (id: string) => {
    deleteLab(id);
    setLabs(loadLabs());
  };

  /* ================= 配置视图 ================= */
  if (!exp) {
    const tpl = getTemplate(tplId);
    return (
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="kicker mb-3">Experiment Lab</div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">实验场</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-mist">
          这里把 RSI 的核心回路实装为一个可玩的<b className="text-snow">进化式优化器</b>：
          你定义「什么是更好」（目标 + 四个维度的隐性偏好），系统递归地执行
          <span className="text-cyan"> 生成变异 → 评估 → 选择 → 整合</span>，
          每轮还会<b className="text-snow">校准自己的评估器</b>（噪声随轮次下降）——
          改进「评估改进的能力」，正是递归的题中之义。
          连续停滞会触发<span className="text-amber">反思事件</span>：放大变异，跳出局部最优。
        </p>

        {labs.length > 0 && (
          <div className="mt-8">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-snow">
              <ScrollText size={15} className="text-cyan" />
              历史实验
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {labs.map((l) => {
                const t = getTemplate(l.templateId);
                return (
                  <div key={l.id} className="card card-hover flex min-w-0 items-center gap-3 p-4">
                    <button
                      className="min-w-0 flex-1 text-left"
                      onClick={() => {
                        const s = loadLabState(l.id);
                        if (s) setExp(s);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span>{t.emoji}</span>
                        <span className="text-xs font-semibold text-snow">{t.name}</span>
                        <span className="font-mono text-[10px] text-fog">
                          第 {loadLabState(l.id)?.round ?? "?"} 轮
                        </span>
                      </div>
                      <div className="mt-1 truncate text-xs text-mist">{l.objective}</div>
                    </button>
                    <button
                      onClick={() => removeLab(l.id)}
                      className="shrink-0 rounded-md p-1.5 text-fog transition-colors hover:bg-rose/10 hover:text-rose"
                      aria-label="删除实验"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-10 grid gap-5 lg:grid-cols-5">
          {/* 模板选择 */}
          <div className="lg:col-span-2">
            <div className="mb-3 text-sm font-semibold text-snow">① 选择实验模板</div>
            <div className="space-y-3">
              {TEMPLATES.map((t) => {
                const on = t.id === tplId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTplId(t.id)}
                    className={`card w-full p-4 text-left transition-all ${
                      on
                        ? "border-cyan/60 shadow-[0_0_28px_-12px_rgba(34,211,238,0.4)]"
                        : "card-hover"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{t.emoji}</span>
                      <div>
                        <div className={`text-sm font-bold ${on ? "text-cyan" : "text-snow"}`}>
                          {t.name}
                        </div>
                        <div className="font-mono text-[10px] text-fog">
                          {t.en.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-mist">{t.tagline}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 目标输入 */}
          <div className="lg:col-span-3">
            <div className="mb-3 text-sm font-semibold text-snow">② 定义你的目标</div>
            <div className="card p-5">
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder={tpl.objectivePlaceholder}
                rows={4}
                className="w-full resize-none rounded-lg border border-line bg-ink p-3.5 text-sm text-snow outline-none transition-colors placeholder:text-fog focus:border-cyan/50"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  className="text-xs text-fog transition-colors hover:text-cyan"
                  onClick={() => setObjective(tpl.objectiveExample)}
                >
                  使用示例目标
                </button>
                <button
                  onClick={start}
                  disabled={!objective.trim()}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FlaskConical size={16} />
                  初始化实验
                </button>
              </div>
              <div className="mt-5 border-t border-line pt-4">
                <div className="mb-2 text-xs font-semibold text-mist">
                  系统将在这四个维度上评估你的方案：
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {tpl.dims.map((d) => (
                    <div
                      key={d.key}
                      className="rounded-lg border border-line bg-ink/50 px-3 py-2"
                    >
                      <div className="text-xs font-bold text-cyan">{d.label}</div>
                      <div className="mt-0.5 text-[10px] leading-relaxed text-fog">
                        {d.desc}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-fog">
                  提示：目标里包含的具体关键词（产品类型、人群、指标）会参与评分——
                  目标越具体，回路收敛越「像你想要的」。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================= 运行视图 ================= */
  const tpl = getTemplate(exp.templateId);
  const lastRound = exp.rounds[exp.rounds.length - 1];
  const finished = exp.round >= MAX_ROUNDS;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* 头部 */}
      <div className="card flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="text-2xl">{tpl.emoji}</span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-snow">{tpl.name}</span>
              <span className="font-mono text-[10px] text-fog">
                {exp.id.slice(0, 12)}
              </span>
            </div>
            <div className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-mist">
              目标：{exp.objective}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={back} className="btn-ghost !px-3 !py-2 text-xs">
            <ArrowLeft size={14} /> 实验列表
          </button>
          {!finished && (
            <button
              onClick={step}
              disabled={running}
              className="btn-ghost !px-3 !py-2 text-xs disabled:opacity-40"
            >
              <StepForward size={14} /> 单步一轮
            </button>
          )}
          {!finished && (
            <button
              onClick={() => setRunning((r) => !r)}
              className={running ? "btn-ghost !px-3 !py-2 text-xs" : "btn-primary !px-4 !py-2 text-xs"}
            >
              {running ? <Pause size={14} /> : <Play size={14} />}
              {running ? "暂停" : "自动运行 ×15"}
            </button>
          )}
          <button onClick={restart} className="btn-ghost !px-3 !py-2 text-xs">
            <RotateCcw size={14} /> 重跑
          </button>
        </div>
      </div>

      {/* 轮次进度 */}
      <div className="mt-4 flex items-center gap-3">
        <div className="font-mono text-xs text-fog">ROUND</div>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-panel">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan to-violet transition-all duration-700"
            style={{ width: `${(exp.round / MAX_ROUNDS) * 100}%` }}
          />
        </div>
        <div className="font-mono text-xs font-bold text-cyan">
          {exp.round} / {MAX_ROUNDS}
        </div>
      </div>

      {finished && (
        <div className="card fade-up mt-4 flex items-center justify-between gap-4 border-lime/30 bg-lime/[0.03] p-4">
          <div className="flex items-center gap-3">
            <Award className="shrink-0 text-lime" size={22} />
            <div className="text-sm">
              <span className="font-bold text-lime">实验完成。</span>
              <span className="text-mist">
                {" "}
                观测分从 {exp.history[0].observed.toFixed(1)} 演化到{" "}
                <b className="text-cyan">{exp.best.observed.toFixed(1)}</b>
                （真实质量 {exp.best.trueTotal.toFixed(1)}）。带着「当前最佳方案」去实战，再回来跑下一个目标。
              </span>
            </div>
          </div>
          <button onClick={back} className="btn-ghost shrink-0 !px-3 !py-2 text-xs">
            新实验
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        {/* 左列：曲线 + 候选 */}
        <div className="space-y-5 xl:col-span-2">
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-bold text-snow">质量演化曲线</div>
              <button
                onClick={() => setShowTrue((s) => !s)}
                className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-[11px] text-mist transition-colors hover:border-violet/40 hover:text-violet"
              >
                {showTrue ? <EyeOff size={12} /> : <Eye size={12} />}
                {showTrue ? "隐藏真实分" : "显示真实分（上帝视角）"}
              </button>
            </div>
            <ScoreChart state={exp} />
            <p className="mt-2 text-[11px] leading-relaxed text-fog">
              评估器噪声 σ 随轮次指数下降（{sigmaAt(0)} → {sigmaAt(exp.round)}），
              观测分与真实分的偏差随之收窄——回路正在改进它的眼睛。
            </p>
          </div>

          {/* 最近一轮的候选变异 */}
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-bold text-snow">
                最近一轮候选变异
                {lastRound && (
                  <span className="ml-2 font-mono text-[10px] font-normal text-fog">
                    ROUND {lastRound.round} · σ={lastRound.sigma}
                  </span>
                )}
              </div>
            </div>
            {lastRound ? (
              <div className="grid gap-3 md:grid-cols-3">
                {lastRound.candidates.map((c, i) => (
                  <CandidateCard key={i} c={c} showTrue={showTrue} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-line py-10 text-center text-xs text-fog">
                尚未开始——点击「单步一轮」或「自动运行」，观察第一轮变异如何产生。
              </div>
            )}
          </div>

          {/* 演化日志 */}
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-snow">
              <ScrollText size={15} className="text-cyan" />
              演化日志
            </div>
            <div
              ref={logRef}
              className="max-h-72 space-y-1.5 overflow-y-auto pr-2 font-mono text-[11px] leading-relaxed"
            >
              {[...exp.log].reverse().map((l, i) => (
                <div
                  key={i}
                  className={`rounded-md border-l-2 bg-ink/40 px-3 py-1.5 ${
                    l.type === "accept"
                      ? "border-lime/60 text-snow/85"
                      : l.type === "reject"
                        ? "border-fog/40 text-fog"
                        : l.type === "insight"
                          ? "border-amber/70 text-amber/90"
                          : "border-cyan/50 text-mist"
                  }`}
                >
                  {l.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右列：当前最佳 */}
        <div className="space-y-5">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-snow">当前最佳方案</div>
              <div className="text-right">
                <div className="font-display text-2xl font-extrabold text-cyan">
                  {exp.best.observed.toFixed(1)}
                </div>
                <div className="font-mono text-[9px] text-fog">OBSERVED</div>
              </div>
            </div>

            {/* 维度条 */}
            <div className="mt-4 space-y-2.5">
              {tpl.dims.map((d) => {
                const v = exp.best.trueScores[d.key] ?? 0;
                return (
                  <div key={d.key}>
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="text-mist">{d.label}</span>
                      <span className="font-mono text-fog">{v.toFixed(0)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-ink">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${v}%`,
                          background: `linear-gradient(90deg, #22d3ee, #a78bfa)`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 border-t border-line pt-4">
              <div className="mb-2 font-mono text-[10px] tracking-widest text-fog">
                STRATEGY ITEMS
              </div>
              <ol className="space-y-2">
                {exp.best.bullets.map((b, i) => (
                  <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-snow/85">
                    <span className="font-mono text-xs text-cyan/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {b.text}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* 经验库 */}
          <div className="card p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-snow">
              <Zap size={15} className="text-amber" />
              经验库（可复用模式）
            </div>
            {exp.patterns.length === 0 ? (
              <p className="text-[11px] leading-relaxed text-fog">
                显著有效（+2.2 分以上）的变异会沉淀到这里——这是跨实验复利的雏形。
              </p>
            ) : (
              <ul className="space-y-2">
                {exp.patterns.map((p, i) => (
                  <li
                    key={i}
                    className="rounded-md border border-amber/15 bg-amber/[0.04] px-3 py-2 text-[11px] leading-relaxed text-amber/90"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 说明 */}
          <div className="card p-5">
            <div className="mb-2 font-mono text-[10px] tracking-widest text-fog">
              HOW IT WORKS
            </div>
            <p className="text-[11px] leading-relaxed text-mist">
              这是一个真实的（简化版）爬山进化搜索：每轮生成 3 个候选变异（新增 /
              强化 / 剪枝 / 整合），按<b className="text-snow">观测分</b>择优整合。
              观测分 = 真实质量 + 高斯噪声，噪声由「评估器」决定——而评估器每 4
              轮自我校准一次。想深入设计思想，见
              <Link to="/architecture" className="text-cyan hover:underline">
                架构蓝图
              </Link>
              。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
