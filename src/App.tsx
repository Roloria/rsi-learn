import { HashRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import KnowledgePage from "./pages/KnowledgePage";
import PathPage from "./pages/PathPage";
import LabPage from "./pages/LabPage";
import ArchitecturePage from "./pages/ArchitecturePage";

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="/path" element={<PathPage />} />
          <Route path="/lab" element={<LabPage />} />
          <Route path="/architecture" element={<ArchitecturePage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
