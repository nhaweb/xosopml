'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Menu,
  Moon,
  Radio,
  Sun,
  TrendingUp,
  X,
  Dices,
  ScrollText,
  Printer,
  BarChart3,
  Table,
  ShoppingBag,
  User,
} from 'lucide-react';
import { SiteFooter } from './site-footer';

const navItems = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Mua Vé Online', href: '/mua-ve-online', icon: ShoppingBag },
  { label: 'Dashboard', href: '/dashboard', icon: User },
  { label: 'Quay thử', href: '/quay-thu', icon: Dices },
  { label: 'Sớ đầu đuôi', href: '/so-dau-duoi', icon: ScrollText },
  { label: 'Tần suất', href: '/thong-ke/tan-suat', icon: BarChart3 },
  { label: 'Bảng ĐB', href: '/thong-ke/giai-dac-biet', icon: Table },
  { label: 'Sổ mơ', href: '/so-mo', icon: BookOpen },
  { label: 'Lô gan', href: '/thong-ke/lo-gan', icon: TrendingUp },
  { label: 'In vé dò', href: '/in-ve-do', icon: Printer },
];

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={`min-h-screen bg-background text-foreground ${dark ? 'dark' : ''}`}>
      <header className="sticky top-0 z-30 border-b bg-gradient-to-r from-[#8b0000] via-[#b80c0c] to-[#8b0000] text-white shadow-md">
        <div className="mx-auto flex max-w-[1260px] items-center justify-between gap-3 px-4 py-2.5 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
              aria-label="Mở menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <Link href="/" className="flex items-center gap-2.5 font-black text-white">
              <img
                src="/favicon-logo.png"
                alt="Xổ số Minh Luân"
                className="size-9 rounded-full border border-amber-300 bg-white object-cover shadow-sm"
              />
              <div className="leading-tight">
                <span className="block text-base sm:text-lg tracking-tight text-amber-300">
                  XỔ SỐ MINH LUÂN
                </span>
                <span className="hidden sm:block text-[10px] font-medium text-white/85">
                  Nắm bắt cơ hội từ con số may mắn!
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Menu chính">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white/95 transition-colors hover:bg-white/15 hover:text-amber-300"
              >
                {item.icon ? <item.icon className="size-3.5 text-amber-300" /> : null}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-full bg-black/25 px-3 py-1 text-[11px] font-bold text-amber-200 xl:flex">
              <Radio className="size-3 animate-pulse text-amber-300" />
              Trực tiếp 16h15 - 18h30
            </div>
            <button
              type="button"
              onClick={() => setDark((value) => !value)}
              className="rounded-lg border border-white/25 bg-white/10 p-2 hover:bg-white/20"
              aria-label="Giao diện tối/sáng"
            >
              {dark ? <Sun className="size-4 text-amber-300" /> : <Moon className="size-4 text-white" />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t border-white/15 bg-[#7a0000] px-4 py-3 lg:hidden">
            <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/10"
                >
                  {item.icon ? <item.icon className="size-4 text-amber-300" /> : null}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <main>{children}</main>

      <SiteFooter />
    </div>
  );
}
