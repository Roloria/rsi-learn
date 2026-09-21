import {
  Box,
  History,
  Footprints,
  Radar,
  UserCheck,
  ArrowDown,
  ArrowUp,
  Layers as LayersIcon,
  Cpu,
  Bot,
  FlaskConical,
  ChevronRight,
} from "lucide-react";
import {
  IMPROVEMENT_LEVELS,
  LAYERS,
  ROADMAP,
  SAFETY_PRINCIPLES,
} from "../data/architecture";
import { Link } from "react-router-dom";
import { usePageTitle } from "../lib/usePageTitle";

const SAFETY_ICONS: Record<string, typeof Box> = {
  box: Box,
  history: History,
  footprints: Footprints,
  radar: Radar,
  "user-check": UserCheck,
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  done: { label: "已完成", color: "#a3e635" },
  next: { label: "进行中", color: "#22d3ee" },
  future: { label: "规划中", color: "#5b6577" },
};

const LAYER_ICONS = [FlaskConical, Bot, ArrowUp, Cpu];

export default function ArchitecturePage() {
  usePageTitle("架构蓝图");
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="kicker mb-3">Architecture Blueprint</div>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">
        自改进 Agent 底层架构蓝图
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-mist">
        本站的终局目标：沉淀出一个可以被任何应用复用的<b className="text-snow">自改进 Agent 底层架构</b>。
        这一页是它的公开设计文档——四层解剖、四个改进层级、五条安全原则与演进路线。
        它会随着我们在实验场与真实模型上的验证持续修订。
      </p>

      {/* ============ 分层架构 ============ */}
      <section className="mt-14">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
          <LayersIcon size={20} className="text-cyan" />
          四层解剖
        </h2>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-fog">
          改进层是心脏：它把代理层当成「可变异的资产」，在沙箱中实证评估每一个变异，择优整合。
          自下而上读是依赖，自上而下读是控制。
        </p>
        <div className="mt-8 space-y-0">
          {LAYERS.map((layer, i) => {
            const Icon = LAYER_ICONS[i];
            return (
              <div key={layer.id}>
                <div
                  className="card relative p-6"
                  style={{
                    borderColor: `${layer.color}33`,
                    background: `linear-gradient(180deg, ${layer.color}08, rgba(14,20,32,0.5))`,
                  }}
                >
                  <div
                    className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full"
                    style={{ background: layer.color }}
                  />
                  <div className="flex flex-col gap-4 pl-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: `${layer.color}1a`, color: layer.color }}
                      >
                        <Icon size={19} />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2.5">
                          <span className="font-display text-lg font-bold text-snow">
                            {layer.name}
                          </span>
                          <span className="font-mono text-[10px] tracking-widest text-fog">
                            {layer.en.toUpperCase()}
                          </span>
                        </div>
                        <p className="mt-1 max-w-xl text-xs leading-relaxed text-mist">
                          {layer.desc}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 md:max-w-xs md:justify-end">
                      {layer.modules.map((m) => (
                        <span
                          key={m}
                          className="rounded border px-2 py-1 text-[10px]"
                          style={{
                            borderColor: `${layer.color}33`,
                            color: layer.color,
                            background: `${layer.color}0d`,
                          }}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {i < LAYERS.length - 1 && (
                  <div className="flex justify-center py-1.5">
                    <ArrowDown size={16} className="text-line-2" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============ 改进层级 ============ */}
      <section className="mt-16">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
          <ArrowUp size={20} className="text-violet" />
          改进的四个层级（L0–L3）
        </h2>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-fog">
          「改进自己」可以在四个深度上发生。越往下回路增益越大，但成本与不可逆性也越高。
          工程原则：从 L0 起步验证回路，确有增益再逐层下沉。
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {IMPROVEMENT_LEVELS.map((l) => (
            <div key={l.id} className="card card-hover p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet/30 bg-violet/10 font-mono text-sm font-extrabold text-violet">
                    {l.level}
                  </span>
                  <div>
                    <div className="text-base font-bold text-snow">{l.name}</div>
                    <div className="font-mono text-[10px] text-fog">{l.en}</div>
                  </div>
                </div>
                <div className="text-right text-[10px] leading-relaxed text-fog">
                  <div>延迟 {l.latency}</div>
                  <div>{l.reversibility}</div>
                  <div>成本 {l.cost}</div>
                </div>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-mist">{l.desc}</p>
              <div className="mt-3 rounded-md border border-line bg-ink/50 px-3 py-2 font-mono text-[11px] text-cyan/80">
                {l.examples}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ 安全原则 ============ */}
      <section className="mt-16 border-y border-line bg-ink-2 grid-bg">
        <div className="py-14">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
            <Radar size={20} className="text-rose" />
            安全层：五条不可协商的原则
          </h2>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-fog">
            RSI 工程的第一性问题不是「如何跑得更快」，而是「回路坏掉时最坏情况是否有界」。
            以下五条护栏在架构中位于改进层内部、整合器之前——先于一切加速。
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {SAFETY_PRINCIPLES.map((p) => {
              const Icon = SAFETY_ICONS[p.icon] ?? Box;
              return (
                <div key={p.id} className="card p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose/25 bg-rose/10 text-rose">
                    <Icon size={17} />
                  </div>
                  <div className="mt-3 text-sm font-bold text-snow">{p.title}</div>
                  <p className="mt-1.5 text-xs leading-relaxed text-mist">{p.desc}</p>
                </div>
              );
            })}
            <div className="card flex flex-col justify-between border-cyan/25 bg-cyan/[0.03] p-5">
              <div>
                <div className="text-sm font-bold text-cyan">一句话总结</div>
                <p className="mt-1.5 text-xs leading-relaxed text-mist">
                  可回滚 &gt; 可解释 &gt; 可检测 &gt; 无护栏。评估器是方向盘，护栏是保险带——
                  方向盘决定能走多快，保险带决定出事时还活着。
                </p>
              </div>
              <Link
                to="/knowledge?item=reward-hacking"
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-cyan hover:underline"
              >
                为什么？先读「奖励作弊」 <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 路线图 ============ */}
      <section className="mt-16">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
          <History size={20} className="text-lime" />
          演进路线
        </h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {ROADMAP.map((m, i) => {
            const s = STATUS_META[m.status];
            return (
              <div key={m.id} className="relative">
                <div className="card h-full p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-widest text-fog">
                      {m.phase.toUpperCase()}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ color: s.color, background: `${s.color}14` }}
                    >
                      {s.label}
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="font-display text-lg font-bold text-snow">{m.title}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-mist">{m.desc}</p>
                </div>
                {i < ROADMAP.length - 1 && (
                  <ChevronRight
                    size={16}
                    className="absolute -right-[14px] top-1/2 z-10 hidden -translate-y-1/2 text-line-2 lg:block"
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="mt-16">
        <div className="card relative overflow-hidden p-10 text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(167,139,250,0.08),transparent_60%)]" />
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            这份蓝图不是用来读的，是用来被改进的
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-mist">
            它本身就是架构蓝图的第 0 版——一个待变异的基线。去实验场跑一个真实目标，
            把你观察到的回路行为带回来，一起修订它。
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/lab" className="btn-primary">
              <FlaskConical size={16} /> 用实验场验证这些设计
            </Link>
            <Link to="/path" className="btn-ghost">
              先补齐前置知识
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
