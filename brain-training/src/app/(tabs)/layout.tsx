"use client";
import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

interface TabConfig {
  href: string;
  label: string;
  icon: string;
  activeIcon: string;
}

const TABS: TabConfig[] = [
  { 
    href: "/today", 
    label: "今日", 
    icon: "🏠",
    activeIcon: "🏠"
  },
  { 
    href: "/train", 
    label: "训练", 
    icon: "🎮",
    activeIcon: "🎮"
  },
  { 
    href: "/ai", 
    label: "AI", 
    icon: "🤖",
    activeIcon: "🤖"
  },
  { 
    href: "/assess", 
    label: "测评", 
    icon: "📊",
    activeIcon: "📊"
  },
  { 
    href: "/me", 
    label: "我的", 
    icon: "👤",
    activeIcon: "👤"
  }
];

function TabItem({ tab, isActive }: { tab: TabConfig; isActive: boolean }) {
  return (
    <Link
      href={tab.href}
      className={`
        flex-1 flex flex-col items-center justify-center gap-1 py-2 touch-target
        transition-all duration-200
        ${isActive 
          ? "text-genius-600 dark:text-genius-400" 
          : "text-foreground/60 hover:text-foreground/80"
        }
      `}
      aria-current={isActive ? "page" : undefined}
    >
      <span className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}>
        {isActive ? tab.activeIcon : tab.icon}
      </span>
      <span className="text-xs font-medium">
        {tab.label}
      </span>
      {isActive && (
        <span className="absolute -bottom-0.5 w-12 h-0.5 bg-genius-600 dark:bg-genius-400 rounded-full" />
      )}
    </Link>
  );
}

function TabBar() {
  const pathname = usePathname();
  
  return (
    <nav className="fixed bottom-0 inset-x-0 border-t border-foreground/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 fixed-tabbar">
      <div className="mx-auto max-w-screen-md h-full grid grid-cols-5">
        {TABS.map((tab) => (
          <TabItem 
            key={tab.href} 
            tab={tab} 
            isActive={pathname?.startsWith(tab.href) || false} 
          />
        ))}
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