import { NavLink, Link } from "react-router-dom";
import { FlaskConical, BookOpen, Route, Layers, Home } from "lucide-react";
import type { ReactNode } from "react";

export const NAV_ITEMS = [
  { to: "/", label: "首页", icon: Home },
  { to: "/knowledge", label: "知识库", icon: BookOpen },
  { to: "/path", label: "学习路径", icon: Route },
  { to: "/lab", label: "实验场", icon: FlaskConical },
  { to: "/architecture", label: "架构蓝图", icon: Layers },
];

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="relative flex h-8 w-8 items-center justify-center">
        <svg viewBox="0 0 32 32" className="h-8 w-8">
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="4" fill="url(#lg)" />
          <path
            d="M16 3 A13 13 0 0 1 29 16"
            fill="none"
            stroke="url(#lg)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M16 29 A13 13 0 0 1 3 16"
            fill="none"
            stroke="url(#lg)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.55"
          />
          <path
            d="M16 7 A9 9 0 0 0 7 16"
            fill="none"
            stroke="url(#lg)"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.75"
          />
          <path
            d="M16 25 A9 9 0 0 0 25 16"
            fill="none"
            stroke="url(#lg)"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.4"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[15px] font-bold tracking-wide">
          RSI<span className="text-cyan">·</span>学习站
        </span>
        <span className="font-mono text-[9px] tracking-[0.22em] text-fog">
          RECURSIVE SELF-IMPROVEMENT
        </span>
      </span>
    </Link>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ink">
      <header className="sticky top-0 z-50 border-b border-line bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="shrink-0">
            <Logo />
          </div>
          <nav className="flex min-w-0 items-center gap-1 overflow-x-auto">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-panel-2 text-cyan"
                      : "text-mist hover:bg-panel hover:text-snow"
                  }`
                }
              >
                <Icon size={15} strokeWidth={2} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-line bg-ink-2">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-md">
              <Logo />
              <p className="mt-4 text-sm leading-relaxed text-mist">
                一个关于 AI 递归自我改进（Recursive Self-Improvement）的开放学习与实验空间。
                学习它的原理与历史，亲手发起改进实验，并和我们一起走向一个自改进 Agent 的底层架构。
              </p>
            </div>
            <div className="flex gap-12">
              <div>
                <div className="mb-3 font-mono text-[10px] tracking-[0.25em] text-fog">
                  探索
                </div>
                <ul className="space-y-2 text-sm text-mist">
                  {NAV_ITEMS.map((n) => (
                    <li key={n.to}>
                      <Link to={n.to} className="transition-colors hover:text-cyan">
                        {n.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-3 font-mono text-[10px] tracking-[0.25em] text-fog">
                  外部资源
                </div>
                <ul className="space-y-2 text-sm text-mist">
                  <li>
                    <a
                      href="https://arxiv.org/abs/2505.22954"
                      target="_blank"
                      rel="noreferrer"
                      className="transition-colors hover:text-cyan"
                    >
                      Darwin Gödel Machine
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.nickbostrom.com/superintelligence"
                      target="_blank"
                      rel="noreferrer"
                      className="transition-colors hover:text-cyan"
                    >
                      Superintelligence
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://deepmind.google/discover/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/"
                      target="_blank"
                      rel="noreferrer"
                      className="transition-colors hover:text-cyan"
                    >
                      AlphaEvolve
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-line pt-6 font-mono text-[11px] text-fog">
            RSI 学习站 · 实验数据仅保存在你的浏览器本地 · 递归地，让明天比今天更好一点
          </div>
        </div>
      </footer>
    </div>
  );
}
