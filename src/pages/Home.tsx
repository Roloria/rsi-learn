import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  GitBranch,
  Scale,
  Sparkles,
  Target,
  TrendingUp,
  Boxes,
  FlaskConical,
} from "lucide-react";
import LoopCanvas from "../components/LoopCanvas";
import { KNOWLEDGE } from "../data/knowledge";

/* ---------------- 核心循环图 ---------------- */

const LOOP_STEPS = [
  {
    icon: Sparkles,
    title: "① 生成变异",
    en: "Propose",
    desc: "系统对自身的一部分（提示 / 流程 / 代码 / 权重）提出若干候选修改。创意可以大胆，成本只是几次尝试。",
  },
  {
    icon: Scale,
    title: "② 评估",
    en: "Evaluate",
    desc: "在可靠的评估器（沙箱、测试、真实基准）中实测每个变异。评估器是回路的方向盘——它歪一寸，改进偏一里。",
  },
  {
    icon: Target,
    title: "③ 选择",
    en: "Select",
    desc: "只保留实测更优的变异，其余淘汰。选择压来自环境，而非系统的自我感觉。",
  },
  {
    icon: GitBranch,
    title: "④ 整合",
    en: "Integrate",
    desc: "把胜出变异合并回主干，成为下一轮变异的新基线。每一轮的产出都抬高下一轮的起点。",
  },
];

function LoopDiagram() {
  const [active, setActive] = useState(0);
  const R = 118;
  const cx = 170;
  const cy = 170;
  const angles = [-90, 0, 90, 180].map((d) => (d * Math.PI) / 180);
  const pts = angles.map((a) => ({ x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) }));
  const cur = LOOP_STEPS[active];

  return (
    <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-4">
      <svg viewBox="0 0 340 340" className="w-full max-w-[340px]">
        {/* 循环箭头 */}
        <defs>
          <marker
            id="arr"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="#3b82a6" />
          </marker>
        </defs>
        {[
          "M 224 76 A 96 96 0 0 1 272 172",
          "M 262 216 A 96 96 0 0 1 168 266",
          "M 116 264 A 96 96 0 0 1 68 168",
          "M 78 124 A 96 96 0 0 1 172 74",
        ].map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={i === active ? "#22d3ee" : "#263650"}
            strokeWidth={i === active ? 2 : 1.5}
            strokeDasharray="5 7"
            className="dash-flow"
            markerEnd="url(#arr)"
            style={{ transition: "stroke .3s" }}
          />
        ))}
        {/* 中心 */}
        <circle cx={cx} cy={cy} r="46" fill="#0d1420" stroke="#1d2739" />
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fill="#e8edf5"
          fontSize="13"
          fontWeight="700"
        >
          RSI 回路
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#8b96a8" fontSize="9.5">
          每轮改进都让
        </text>
        <text x={cx} y={cy + 24} textAnchor="middle" fill="#8b96a8" fontSize="9.5">
          下一轮更高效
        </text>

        {/* 节点 */}
        {pts.map((p, i) => {
          const Icon = LOOP_STEPS[i].icon;
          const on = i === active;
          return (
            <g
              key={i}
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r="30"
                fill={on ? "#12233b" : "#0e1420"}
                stroke={on ? "#22d3ee" : "#243049"}
                strokeWidth={on ? 2 : 1.4}
                style={{ transition: "all .25s" }}
              />
              <foreignObject x={p.x - 15} y={p.y - 15} width="30" height="30">
                <div className="flex h-full w-full items-center justify-center">
                  <Icon
                    size={19}
                    color={on ? "#22d3ee" : "#7c8aa0"}
                    strokeWidth={1.8}
                  />
                </div>
              </foreignObject>
              <text
                x={p.x}
                y={p.y + 44}
                textAnchor="middle"
                fontSize="10.5"
                fill={on ? "#e8edf5" : "#8b96a8"}
                fontWeight={on ? 700 : 400}
              >
                {LOOP_STEPS[i].title}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="w-full max-w-md lg:pl-6">
        <div className="card p-6">
          <div className="mb-2 flex items-baseline justify-between">
            <div className="text-lg font-bold text-snow">{cur.title}</div>
            <div className="font-mono text-[11px] tracking-widest text-cyan">
              {cur.en.toUpperCase()}
            </div>
          </div>
          <p className="text-sm leading-relaxed text-mist">{cur.desc}</p>
          <div className="mt-4 flex gap-1.5">
            {LOOP_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i === active ? "bg-cyan" : "bg-line-2"
                }`}
                aria-label={`步骤 ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 起飞曲线 ---------------- */

function TakeoffChart() {
  return (
    <svg viewBox="0 0 360 210" className="w-full">
      {/* 网格 */}
      {[40, 80, 120, 160].map((y) => (
        <line key={y} x1="34" y1={y} x2="350" y2={y} stroke="#1a2436" strokeWidth="1" />
      ))}
      {/* 坐标 */}
      <text x="6" y="24" fontSize="9" fill="#5b6577">能力</text>
      <text x="320" y="200" fontSize="9" fill="#5b6577">时间 →</text>
      <text x="34" y="204" fontSize="9" fill="#5b6577">t₀</text>
      {/* 软起飞：平滑 S 曲线 */}
      <path
        d="M34,168 C110,150 190,110 350,44"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="2"
      />
      {/* 硬起飞：陡峭跃迁 */}
      <path
        d="M34,170 C140,166 210,158 240,130 C270,100 290,50 350,26"
        fill="none"
        stroke="#a78bfa"
        strokeWidth="2"
        strokeDasharray="1 0"
      />
      {/* 人类水平线 */}
      <line x1="34" y1="120" x2="350" y2="120" stroke="#3a4a6a" strokeDasharray="3 5" />
      <text x="290" y="115" fontSize="8.5" fill="#7c8aa0">人类水平</text>
      {/* 图例 */}
      <circle cx="200" cy="38" r="3.5" fill="#22d3ee" />
      <text x="209" y="41" fontSize="9.5" fill="#8b96a8">软起飞（平滑加速）</text>
      <circle cx="200" cy="54" r="3.5" fill="#a78bfa" />
      <text x="209" y="57" fontSize="9.5" fill="#8b96a8">硬起飞（陡峭跃迁）</text>
    </svg>
  );
}

/* ---------------- 时间线 ---------------- */

const TIMELINE = [
  { year: "1965", title: "智能爆炸假说", desc: "I.J. Good 提出超智能机器的正反馈论证", cat: "theory" },
  { year: "2003", title: "哥德尔机", desc: "可证明安全的自改进架构被形式化", cat: "theory" },
  { year: "2017", title: "AlphaZero", desc: "自我对弈数小时超越人类千年棋艺", cat: "system" },
  { year: "2021", title: "AlphaChip", desc: "AI 开始设计运行 AI 的芯片", cat: "system" },
  { year: "2022", title: "STaR / Constitutional AI", desc: "自举推理与 AI 反馈训练 AI", cat: "system" },
  { year: "2023", title: "Self-Refine · Reflexion · Voyager", desc: "提示层自改进回路与技能库复利", cat: "system" },
  { year: "2024", title: "AI Scientist", desc: "端到端自动科研闭环跑通", cat: "frontier" },
  { year: "2025", title: "AlphaEvolve · Darwin Gödel Machine", desc: "代码级自我重写成为工程现实", cat: "system" },
];

const CAT_COLOR: Record<string, string> = {
  theory: "#22d3ee",
  system: "#a78bfa",
  frontier: "#a3e635",
  risk: "#fb7185",
};

/* ---------------- 页面 ---------------- */

export default function Home() {
  const milestones = KNOWLEDGE.filter((k) => k.category === "system");

  return (
    <div>
      {/* ============ Hero ============ */}
      <section className="relative overflow-hidden border-b border-line">
        <LoopCanvas />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#07090d_78%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-28 text-center sm:px-6 md:py-36">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-panel/70 px-4 py-1.5 text-xs text-mist backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-cyan" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
            </span>
            一个关于递归自我改进的开放学习与实验空间
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl md:text-7xl">
            让改进本身
            <br />
            <span className="grad-text">被递归地改进</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-mist sm:text-lg">
            RSI（Recursive Self-Improvement，递归自我改进）：一个系统用自己当前的能力去改进自己，
            改进后的自己再去改进得更好 —— 从 AlphaZero 到重写自身代码的 Agent，
            这个回路正在成为现实。在这里学透它的原理、亲手跑通它的循环。
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/lab" className="btn-primary">
              <FlaskConical size={17} />
              发起你的第一个实验
            </Link>
            <Link to="/path" className="btn-ghost">
              <ArrowRight size={16} />
              从零开始学习 RSI
            </Link>
          </div>
          <div className="mt-14 grid w-full max-w-2xl grid-cols-3 gap-4">
            {[
              { n: "20+", label: "知识条目" },
              { n: "5", label: "阶段学习路径" },
              { n: "3", label: "可玩实验模板" },
            ].map((s) => (
              <div key={s.label} className="card px-4 py-4">
                <div className="font-display text-2xl font-extrabold text-cyan">{s.n}</div>
                <div className="mt-1 text-xs text-mist">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 什么是 RSI ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="kicker mb-3">01 · What is RSI</div>
        <h2 className="font-display text-3xl font-bold sm:text-4xl">什么是递归自我改进？</h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-5">
          <div className="card p-7 lg:col-span-3">
            <p className="text-[15px] leading-loose text-mist">
              <span className="font-semibold text-snow">定义：</span>
              一个 AI 系统能够修改自身的某个层面（提示、流程、代码或模型权重），
              修改使它变得更强；更强的它再进行<b className="text-snow">更高质量的修改</b>。
              当「改进的能力」本身随改进增长时，就形成了正反馈回路。
            </p>
            <p className="mt-4 text-[15px] leading-loose text-mist">
              这个想法 1965 年就由 I.J. Good 提出，但它不再是科幻：
              AlphaZero 用自我对弈登顶围棋，AlphaEvolve 改进了训练它自己的 Gemini 内核，
              Darwin Gödel Machine 重写自身代码把基准成绩从 20% 提升到 50%。
              回路已经存在，问题只剩下：增益多大、方向是否受控。
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-line bg-panel/50 p-4">
                <div className="text-sm font-semibold text-cyan">RSI ≠ 模型变大</div>
                <div className="mt-1 text-xs leading-relaxed text-mist">
                  Scaling 是外部资源堆能力；RSI 是系统自己当自己的工程师。
                </div>
              </div>
              <div className="rounded-xl border border-line bg-panel/50 p-4">
                <div className="text-sm font-semibold text-cyan">回路增益可正可负</div>
                <div className="mt-1 text-xs leading-relaxed text-mist">
                  评估器不可靠时，自我改进 = 自我漂移。多数领域还没有及格的评估器。
                </div>
              </div>
            </div>
          </div>
          <div className="card p-7 lg:col-span-2">
            <div className="mb-4 text-sm font-semibold text-snow">
              起飞动力学：回路跑通之后
            </div>
            <TakeoffChart />
            <p className="mt-3 text-xs leading-relaxed text-fog">
              硬起飞派认为能力将陡峭跃迁；软起飞派认为算力、数据与物理摩擦会把加速摊平成数年。
              分歧的核心是对「回路净增益」的估计。
            </p>
          </div>
        </div>
      </section>

      {/* ============ 核心循环 ============ */}
      <section className="border-y border-line bg-ink-2 grid-bg">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="kicker mb-3">02 · The Core Loop</div>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            一切 RSI 系统共用的四步回路
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mist">
            从 STaR 的自举微调到 AlphaEvolve 的进化搜索，剥开术语，剩下的都是同一个循环。
            把鼠标放到任一节点上，看看它在回路里扮演什么角色。
          </p>
          <div className="mt-12">
            <LoopDiagram />
          </div>
        </div>
      </section>

      {/* ============ 时间线 ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="kicker mb-3">03 · Sixty Years</div>
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          从思想实验到工程现实
        </h2>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="relative">
            <div className="absolute bottom-2 left-[7px] top-2 w-px bg-line" />
            {TIMELINE.map((t) => (
              <div key={t.year} className="relative mb-6 pl-8">
                <span
                  className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 bg-ink"
                  style={{ borderColor: CAT_COLOR[t.cat] }}
                />
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-mono text-sm font-bold text-cyan">{t.year}</span>
                  <span className="text-sm font-semibold text-snow">{t.title}</span>
                </div>
                <div className="mt-0.5 text-xs text-mist">{t.desc}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-snow">
              <Boxes size={16} className="text-violet" />
              里程碑系统
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {milestones.map((m) => (
                <Link
                  key={m.id}
                  to={`/knowledge?item=${m.id}`}
                  className="card card-hover group p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-fog">{m.year}</span>
                    <TrendingUp
                      size={13}
                      className="text-fog transition-colors group-hover:text-lime"
                    />
                  </div>
                  <div className="mt-2 text-sm font-bold text-snow group-hover:text-cyan">
                    {m.title}
                  </div>
                  <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-mist">
                    {m.summary}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="card relative overflow-hidden p-10 text-center md:p-14">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.09),transparent_60%)]" />
            <div className="kicker mb-4">04 · Your Move</div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              读十篇论文，不如亲手跑一次回路
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-mist">
              在实验场选一个你关心的目标 —— 改进一个产品策略、优化一份课件、拆解一个难题 ——
              观察变异、评估、选择与反思事件如何把分数一轮轮推高，
              以及评估器如何一边评估一边改进它自己。
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/lab" className="btn-primary">
                <FlaskConical size={17} />
                进入实验场
              </Link>
              <Link to="/architecture" className="btn-ghost">
                查看 Agent 架构蓝图
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
