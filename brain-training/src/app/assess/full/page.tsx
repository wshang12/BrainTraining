"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FullAssessPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const steps = ["专注1", "专注2", "记忆1", "记忆2", "逻辑", "图形/空间", "速度1", "速度2"];

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else router.push("/assess/result?type=full");
  };

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">完整评测</h1>
      <div className="rounded-xl border p-6 text-center space-y-3">
        <div className="text-lg">任务：{steps[step]}</div>
        <div className="text-sm text-gray-500">每个任务约 75 秒（演示占位）。</div>
        <button onClick={next} className="px-4 py-2 bg-sky-700 text-white rounded-md">{step < steps.length - 1 ? "下一项" : "完成"}</button>
      </div>
    </main>
  );
}