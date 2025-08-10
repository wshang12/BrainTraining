import Link from "next/link";

export default function AssessPage() {
  return (
    <main className="p-4 pb-24 space-y-4">
      <h1 className="text-2xl font-semibold mb-2">测评</h1>
      <div className="rounded-xl border p-4 space-y-3">
        <div className="font-medium">评测入口</div>
        <Link href="/assess/quick" className="px-3 py-2 rounded-md bg-sky-600 text-white inline-block">极速评测（约5分钟）</Link>
        <Link href="/assess/full" className="px-3 py-2 rounded-md bg-sky-700 text-white inline-block">完整评测（10-12分钟）</Link>
      </div>
    </main>
  );
}