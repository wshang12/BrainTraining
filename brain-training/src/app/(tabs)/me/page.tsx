"use client";
import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "@/components/ThemeProvider";

export default function MePage() {
  const theme = useContext(ThemeContext);
  const [lt, setLt] = useState(false);
  const [hc, setHc] = useState(false);

  useEffect(() => {
    setLt(theme.largeText);
    setHc(theme.highContrast);
  }, [theme.largeText, theme.highContrast]);

  return (
    <main className="p-4 pb-24 space-y-4">
      <h1 className="text-2xl font-semibold mb-2">我的</h1>

      <section className="rounded-xl border p-4 space-y-3">
        <div className="font-medium">显示与无障碍</div>
        <label className="flex items-center justify-between">
          <span>大字模式</span>
          <input
            type="checkbox"
            checked={lt}
            onChange={(e) => {
              setLt(e.target.checked);
              theme.updateLargeText(e.target.checked);
            }}
          />
        </label>
        <label className="flex items-center justify-between">
          <span>高对比主题</span>
          <input
            type="checkbox"
            checked={hc}
            onChange={(e) => {
              setHc(e.target.checked);
              theme.updateHighContrast(e.target.checked);
            }}
          />
        </label>
      </section>

      <section className="rounded-xl border p-4">
        <div className="font-medium">账号与订阅</div>
        <p className="text-sm text-gray-600">登录、绑定、订阅状态与荣誉将显示在这里。</p>
      </section>
    </main>
  );
}