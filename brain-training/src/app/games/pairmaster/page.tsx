"use client";
export default function Pairmaster() {
  return (
    <main className="min-h-dvh p-4">
      <div className="flex items-center justify-between mb-4">
        <a href="/today" className="px-3 py-2 rounded-md border">返回</a>
        <div className="text-lg font-semibold">配对大师</div>
        <div />
      </div>
      <div className="h-[70vh] rounded-xl border grid place-items-center text-gray-500">
        Canvas 占位（翻牌配对）
      </div>
    </main>
  );
}