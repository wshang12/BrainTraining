"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function QuickAssessPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const steps = ["选择性注意", "工作记忆", "处理速度", "快速匹配"];
  const [assessId, setAssessId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/assessment/start", { method: "POST" });
      const data = await res.json();
      setAssessId(data.assessId);
    })();
  }, []);

  const next = async () => {
    if (step < steps.length - 1) setStep(step + 1);
    else {
      // simple mock: random-ish but bounded
      const scores = {
        attention: 45 + Math.round(Math.random() * 10),
        memory: 45 + Math.round(Math.random() * 10),
        speed: 45 + Math.round(Math.random() * 10),
        logic: 45 + Math.round(Math.random() * 10),
        spatial: 45 + Math.round(Math.random() * 10),
      };
      await fetch("/api/assessment/end", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "quick", scores, assessId }) });
      router.push("/assess/result?type=quick");
    }
  };

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">极速评测</h1>
      <div className="rounded-xl border p-6 text-center space-y-3">
        <div className="text-lg">任务：{steps[step]}</div>
        <div className="text-sm text-gray-500">每个任务约 75 秒（演示版）。</div>
        <button onClick={next} className="px-4 py-2 bg-sky-600 text-white rounded-md">{step < steps.length - 1 ? "下一项" : "完成"}</button>
      </div>
    </main>
  );
}