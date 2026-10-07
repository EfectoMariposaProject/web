'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Feather, BookOpen, Layers, History, Shield, LayoutDashboard, Sparkles, Library, ScrollText } from 'lucide-react';
import { GlobalNotificationBell } from './GlobalNotificationBell';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Jornada Diaria', href: '/project/day/1', icon: Layers },
    { name: 'Editorial', href: '/editorial', icon: Feather },
    { name: 'Story Bible', href: '/story-bible', icon: Library },
    { name: 'Lab Literario', href: '/literary-lab', icon: ScrollText },
    { name: 'Manuscrito', href: '/manuscript', icon: BookOpen },
    { name: 'Auditoría', href: '/audit', icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap lg:flex-nowrap items-center justify-between gap-3">
        <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-serif text-base font-bold tracking-wide text-blue-950 block leading-none">
              EMP STORY ENGINE
            </span>
            <span className="text-[9px] tracking-widest text-slate-500 uppercase font-bold">
              Efecto Mariposa Project
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm border border-blue-700'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <GlobalNotificationBell />
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>SUPER_ADMIN</span>
          </div>
          <div className="text-slate-600 text-xs flex items-center gap-1 border-l border-slate-200 pl-3 font-bold">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>v0.1 MVP</span>
          </div>
        </div>
      </div>
    </header>
  );
}

