import Link from "next/link";

export default async function AssessResult({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const sp = await searchParams;
  const type = sp.type ?? "quick";
  return (
    <main className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">评测结果</h1>
      <div className="rounded-xl border p-6 space-y-2">
        <div>类型：{type === "full" ? "完整评测" : "极速评测"}</div>
        <div>能力雷达（占位）：专注 52、记忆 48、逻辑 50、图形 47、速度 55</div>
        <p className="text-sm text-gray-500">订阅可解锁高级报告与趋势。</p>
        <Link href="/today" className="px-4 py-2 bg-sky-600 text-white rounded-md inline-block">返回今日</Link>
      </div>
    </main>
  );
}