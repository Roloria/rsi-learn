import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  BookMarked,
  Globe,
  Code2,
  FlaskConical,
  Video,
  Check,
  RotateCcw,
  Flag,
} from "lucide-react";
import { LEARNING_PATH, PathResource } from "../data/path";
import { loadProgress, saveProgress } from "../lib/storage";

const RES_ICON: Record<PathResource["type"], typeof FileText> = {
  paper: FileText,
  book: BookMarked,
  blog: Globe,
  code: Code2,
  lab: FlaskConical,
  video: Video,
};

const RES_LABEL: Record<PathResource["type"], string> = {
  paper: "论文",
  book: "书籍",
  blog: "文章",
  code: "代码",
  lab: "实验",
  video: "视频",
};

export default function PathPage() {
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    setDone(loadProgress());
  }, []);

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveProgress(next);
      return next;
    });
  };

  const reset = () => {
    setDone(new Set());
    saveProgress(new Set());
  };

  const totalSteps = useMemo(
    () => LEARNING_PATH.reduce((a, s) => a + s.steps.length, 0),
    []
  );
  const pct = Math.round((done.size / totalSteps) * 100);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="kicker mb-3">Learning Path</div>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">学习路径</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist">
        从「听说过智能爆炸」到「能构建自己的自改进 Agent」，五个阶段，每一步都配一手材料。
        勾选完成状态会保存在本地。
      </p>

      {/* 进度条 */}
      <div className="card mt-8 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-mist">
              总进度 · {done.size}/{totalSteps} 步
            </span>
            <span className="font-mono font-bold text-cyan">{pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ink">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan to-violet transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <button
          onClick={reset}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-mist transition-colors hover:border-rose/40 hover:text-rose"
        >
          <RotateCcw size={12} />
          重置进度
        </button>
      </div>

      {/* 阶段 */}
      <div className="mt-10 space-y-10">
        {LEARNING_PATH.map((stage) => {
          const stageDone = stage.steps.filter((s) => done.has(s.id)).length;
          const stagePct = Math.round((stageDone / stage.steps.length) * 100);
          const complete = stageDone === stage.steps.length;
          return (
            <section key={stage.id} className="relative">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex items-center gap-4">
                  <span
                    className={`font-display text-4xl font-extrabold ${
                      complete ? "text-lime" : "text-line-2"
                    }`}
                  >
                    {stage.no}
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-bold text-snow">
                      {stage.title}
                      <span className="ml-2 font-mono text-[11px] font-normal tracking-widest text-fog">
                        {stage.subtitle.toUpperCase()}
                      </span>
                    </h2>
                    <div className="mt-0.5 text-xs text-fog">
                      {stage.duration} · 目标：{stage.goal}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {complete && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-lime/30 bg-lime/10 px-2.5 py-1 font-medium text-lime">
                      <Flag size={11} /> 阶段完成
                    </span>
                  )}
                  <span className="font-mono text-fog">
                    {stageDone}/{stage.steps.length}
                  </span>
                </div>
              </div>
              <div className="mt-3 h-px bg-line" />

              <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {stage.steps.map((step) => {
                  const checked = done.has(step.id);
                  return (
                    <div
                      key={step.id}
                      className={`card min-w-0 p-5 transition-colors ${
                        checked ? "border-lime/25" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggle(step.id)}
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                            checked
                              ? "border-lime bg-lime/15 text-lime"
                              : "border-line-2 text-transparent hover:border-lime/50"
                          }`}
                          aria-label="标记完成"
                        >
                          <Check size={13} strokeWidth={3} />
                        </button>
                        <div className="min-w-0">
                          <div
                            className={`text-sm font-bold leading-snug ${
                              checked ? "text-mist line-through decoration-lime/40" : "text-snow"
                            }`}
                          >
                            {step.title}
                          </div>
                          <p className="mt-1.5 text-xs leading-relaxed text-mist">
                            {step.desc}
                          </p>
                          <ul className="mt-3 space-y-2">
                            {step.resources.map((r) => {
                              const Icon = RES_ICON[r.type];
                              const inner = (
                                <>
                                  <Icon
                                    size={13}
                                    className={
                                      r.type === "lab" ? "text-lime" : "text-cyan"
                                    }
                                  />
                                  <span className="min-w-0 truncate">{r.title}</span>
                                  <span className="shrink-0 text-[10px] text-fog">
                                    {r.source}
                                  </span>
                                </>
                              );
                              return (
                                <li key={r.title}>
                                  {r.url?.startsWith("#") ? (
                                    <Link
                                      to={r.url.slice(1)}
                                      className="flex items-center gap-2 rounded-md border border-line bg-ink/50 px-2.5 py-1.5 text-xs text-mist transition-colors hover:border-cyan/40 hover:text-cyan"
                                    >
                                      {inner}
                                    </Link>
                                  ) : (
                                    <a
                                      href={r.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center gap-2 rounded-md border border-line bg-ink/50 px-2.5 py-1.5 text-xs text-mist transition-colors hover:border-cyan/40 hover:text-cyan"
                                    >
                                      {inner}
                                    </a>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                          <div className="mt-2 font-mono text-[10px] text-fog">
                            {step.resources.map((r) => RES_LABEL[r.type]).join(" · ")}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* 结尾 CTA */}
      <div className="card mt-12 p-8 text-center">
        <h3 className="font-display text-xl font-bold">走完路径之后？</h3>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-mist">
          把学到的东西用起来：去实验场发起一个真实目标的改进实验，
          或者直接阅读我们的 Agent 底层架构蓝图 —— 它正是这条路径的终点站。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/lab" className="btn-primary">
            <FlaskConical size={16} /> 进入实验场
          </Link>
          <Link to="/architecture" className="btn-ghost">
            查看架构蓝图
          </Link>
        </div>
      </div>
    </div>
  );
}
