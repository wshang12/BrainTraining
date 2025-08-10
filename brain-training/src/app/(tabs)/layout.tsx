"use client";
import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

function TabItem({ href, label, isActive }: { href: string; label: string; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`flex-1 flex items-center justify-center gap-1 text-sm font-medium touch-lg ${
        isActive ? "text-foreground" : "text-gray-500"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

function TabBar() {
  const pathname = usePathname();
  const active = (p: string) => pathname?.startsWith(p);
  return (
    <nav className="fixed bottom-0 inset-x-0 border-t border-gray-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 fixed-tabbar">
      <div className="mx-auto max-w-screen-md h-full grid grid-cols-5">
        <TabItem href="/today" label="今日" isActive={!!active("/today")} />
        <TabItem href="/train" label="训练" isActive={!!active("/train")} />
        <TabItem href="/ai" label="AI" isActive={!!active("/ai")} />
        <TabItem href="/assess" label="测评" isActive={!!active("/assess")} />
        <TabItem href="/me" label="我的" isActive={!!active("/me")} />
      </div>
    </nav>
  );
}

export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-screen-md">
      <div className="min-h-dvh">{children}</div>
      <TabBar />
    </div>
  );
}