'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Menu, Moon, Radio, Sun, TrendingUp, Trophy, X } from 'lucide-react';
import { siteConfig } from '@/config/site';

const navItems = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Sổ mơ', href: '/so-mo', icon: BookOpen },
  { label: 'Lô gan', href: '/thong-ke/lo-gan', icon: TrendingUp },
];

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={`min-h-screen bg-background text-foreground ${dark ? 'dark' : ''}`}>
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 hover:bg-muted lg:hidden"
              aria-label="Mở menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <Link href="/" className="flex items-center gap-2.5 font-black text-red-600 dark:text-red-500">
              <span className="grid size-9 place-items-center rounded-xl bg-red-600 text-white shadow-sm">
                <Trophy className="size-5" />
              </span>
              <span className="text-xl tracking-tight">XSKT Minh Ngọc</span>
            </Link>
          </div>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Menu chính">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold hover:bg-muted"
              >
                {item.icon ? <item.icon className="size-4 text-red-500" /> : null}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-600 sm:flex dark:text-red-400">
              <Radio className="size-3 animate-pulse text-red-600" />
              Trực tiếp 16h15 - 18h30
            </div>
            <button
              type="button"
              onClick={() => setDark((value) => !value)}
              className="rounded-lg border p-2 hover:bg-muted"
              aria-label="Giao diện tối/sáng"
            >
              {dark ? <Sun className="size-5 text-amber-400" /> : <Moon className="size-5" />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t bg-card px-4 py-3 lg:hidden">
            <div className="grid gap-1 text-sm font-semibold">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg p-2.5 hover:bg-muted"
                >
                  {item.icon ? <item.icon className="size-4 text-red-500" /> : null}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:px-8">{children}</main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        {siteConfig.disclaimer}
      </footer>
    </div>
  );
}
