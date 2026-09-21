import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  ChevronDown,
  Lightbulb,
  Microscope,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import {
  CATEGORY_META,
  KNOWLEDGE,
  KnowledgeCategory,
} from "../data/knowledge";

type Filter = KnowledgeCategory | "all";

export default function KnowledgePage() {
  const [params] = useSearchParams();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(params.get("item"));

  useEffect(() => {
    const item = params.get("item");
    if (item) {
      setExpanded(item);
      setFilter("all");
      setQuery("");
      // 等渲染后滚动到目标卡
      requestAnimationFrame(() => {
        document
          .getElementById(`k-${item}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [params]);

  const list = useMemo(() => {
    let arr = KNOWLEDGE;
    if (filter !== "all") arr = arr.filter((k) => k.category === filter);
    const q = query.trim();
    if (q) {
      arr = arr.filter((k) =>
        [k.title, k.subtitle, k.summary, k.keyIdea, ...k.tags]
          .join("\n")
          .toLowerCase()
          .includes(q.toLowerCase())
      );
    }
    return arr;
  }, [filter, query]);

  const cats: Filter[] = ["all", "theory", "system", "risk", "frontier"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="kicker mb-3">Knowledge Base</div>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">RSI 知识库</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist">
        精选 {KNOWLEDGE.length} 个关键概念、系统与争论——每条都给出核心洞见、实证证据与一手材料。
        点击卡片展开深入阅读。
      </p>

      {/* 工具栏 */}
      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => {
            const on = filter === c;
            const color = c === "all" ? "#e8edf5" : CATEGORY_META[c].color;
            const count =
              c === "all" ? KNOWLEDGE.length : KNOWLEDGE.filter((k) => k.category === c).length;
            return (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                  on ? "text-ink" : "border-line bg-panel text-mist hover:border-line-2"
                }`}
                style={on ? { background: color, borderColor: color } : undefined}
              >
                {c === "all" ? "全部" : CATEGORY_META[c].label}
                <span className={`ml-1.5 ${on ? "opacity-60" : "text-fog"}`}>{count}</span>
              </button>
            );
          })}
        </div>
        <div className="relative w-full md:w-64">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-fog"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索概念 / 系统 / 作者…"
            className="w-full rounded-lg border border-line bg-panel py-2 pl-9 pr-3 text-sm text-snow outline-none transition-colors placeholder:text-fog focus:border-cyan/50"
          />
        </div>
      </div>

      {filter !== "all" && (
        <p className="mt-4 text-xs leading-relaxed text-fog">
          {CATEGORY_META[filter].desc}
        </p>
      )}

      {/* 卡片列表 */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {list.map((k) => {
          const open = expanded === k.id;
          const meta = CATEGORY_META[k.category];
          return (
            <div
              key={k.id}
              id={`k-${k.id}`}
              className={`card card-hover cursor-pointer transition-shadow ${
                open ? "border-line-2 shadow-[0_0_40px_-12px_rgba(34,211,238,0.15)]" : ""
              }`}
              onClick={() => setExpanded(open ? null : k.id)}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold"
                        style={{
                          color: meta.color,
                          background: `${meta.color}1a`,
                        }}
                      >
                        {meta.label}
                      </span>
                      <span className="font-mono text-[10px] text-fog">{k.year}</span>
                    </div>
                    <h3 className="mt-2 text-base font-bold text-snow">{k.title}</h3>
                    <div className="mt-0.5 font-mono text-[11px] text-fog">
                      {k.subtitle}
                    </div>
                  </div>
                  <ChevronDown
                    size={17}
                    className={`mt-1 shrink-0 text-fog transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </div>

                <p className="mt-3 text-[13px] leading-relaxed text-mist">{k.summary}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {k.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded border border-line bg-ink px-2 py-0.5 text-[10px] text-fog"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {open && (
                  <div className="fade-up mt-4 space-y-3 border-t border-line pt-4">
                    <div className="rounded-lg border border-cyan/15 bg-cyan/[0.04] p-3.5">
                      <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-cyan">
                        <Lightbulb size={13} /> 核心洞见
                      </div>
                      <p className="text-[13px] leading-relaxed text-snow/90">{k.keyIdea}</p>
                    </div>
                    <div className="rounded-lg border border-line bg-panel/60 p-3.5">
                      <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-violet">
                        <Microscope size={13} /> 实证与案例
                      </div>
                      <p className="text-[13px] leading-relaxed text-mist">{k.evidence}</p>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-mist">
                        <BookOpen size={13} /> 扩展阅读
                      </div>
                      <ul className="space-y-1.5">
                        {k.readings.map((r) => (
                          <li key={r.url}>
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="group inline-flex items-center gap-1.5 text-[13px] text-mist transition-colors hover:text-cyan"
                            >
                              <ExternalLink size={12} className="text-fog group-hover:text-cyan" />
                              {r.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {list.length === 0 && (
        <div className="mt-16 text-center text-sm text-fog">
          没有匹配的条目 —— 试试其他关键词。
        </div>
      )}
    </div>
  );
}
