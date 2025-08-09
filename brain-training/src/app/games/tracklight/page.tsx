"use client";
export default function Tracklight() {
  return (
    <main className="min-h-dvh p-4">
      <div className="flex items-center justify-between mb-4">
        <a href="/today" className="px-3 py-2 rounded-md border">返回</a>
        <div className="text-lg font-semibold">专注追光</div>
        <div />
      </div>
      <div className="h-[70vh] rounded-xl border grid place-items-center text-gray-500">
        Canvas 占位（PixiJS 可后续接入）
      </div>
    </main>
  );
}