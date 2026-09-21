import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base "./" 让构建产物可部署在任意子路径（GitHub Pages / 本地 file 预览）。
// 路由使用 HashRouter，无需服务端回退配置。
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
});
