import { useEffect } from "react";

/** 设置当前页面标题（路由切换时更新浏览器标签/历史记录标题） */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · RSI 学习站`;
    return () => {
      document.title = "RSI 学习站 · 递归自我改进";
    };
  }, [title]);
}
