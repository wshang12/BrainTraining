"use client";
export default function Fastmatch() {
  return (
    <main className="min-h-dvh p-4">
      <div className="flex items-center justify-between mb-4">
        <a href="/today" className="px-3 py-2 rounded-md border">返回</a>
        <div className="text-lg font-semibold">快速匹配 Pro</div>
        <div />
      </div>
      <div className="h-[70vh] rounded-xl border grid place-items-center text-gray-500">
        Canvas 占位（Same/Diff）
      </div>
    </main>
  );
}