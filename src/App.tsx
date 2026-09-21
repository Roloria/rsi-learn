import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/700.css";
import "./index.css";

// 首页直接引入保证首屏即时可见；其余页面按需拆分加载
const KnowledgePage = lazy(() => import("./pages/KnowledgePage"));
const PathPage = lazy(() => import("./pages/PathPage"));
const LabPage = lazy(() => import("./pages/LabPage"));
const ArchitecturePage = lazy(() => import("./pages/ArchitecturePage"));

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-fog">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan" />
                加载中…
              </div>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/knowledge" element={<KnowledgePage />} />
            <Route path="/path" element={<PathPage />} />
            <Route path="/lab" element={<LabPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </Layout>
    </HashRouter>
  );
}
