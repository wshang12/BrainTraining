import Link from "next/link";

export default async function GameWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="min-h-dvh p-4">
      <div className="flex items-center justify-between mb-4">
        <Link href="/today" className="px-3 py-2 rounded-md border">返回</Link>
        <div className="text-lg font-semibold">{id}</div>
        <div />
      </div>
      <div className="h-[70vh] rounded-xl border grid place-items-center text-gray-500">
        游戏「{id}」将在此处运行（Canvas 占位）
      </div>
    </main>
  );
}