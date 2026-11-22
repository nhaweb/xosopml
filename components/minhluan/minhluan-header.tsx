'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Menu,
  X,
} from 'lucide-react';
import { ProvinceDrawResult } from '@/types/lottery';
import { checkTicket, TicketMatchResult } from '@/lib/ticket-checker';
import { audioSynth } from '@/lib/audio-synthesizer';

interface MinhLuanHeaderProps {
  activeDateStr: string;
  allProvinces: ProvinceDrawResult[];
  activeRegionTab: 'all' | 'south' | 'central' | 'north' | 'vietlott';
  onSelectRegionTab: (tab: 'all' | 'south' | 'central' | 'north' | 'vietlott') => void;
  dark: boolean;
  onToggleDark: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenCheckerModal: () => void;
}

const mainNavLinks = [
  { label: 'MINH LUÂN', href: '/' },
  { label: 'TRỰC TIẾP', href: '#kqxs-hom-nay' },
  { label: 'SỔ KẾT QUẢ', href: '/thong-ke/giai-dac-biet' },
  { label: 'SỚ ĐẦU ĐUÔI', href: '/so-dau-duoi' },
  { label: 'THỐNG KÊ', href: '/thong-ke/tan-suat' },
  { label: 'MUA VÉ ONLINE', href: '/mua-ve-online', highlight: true },
  { label: 'IN VÉ DÒ', href: '/in-ve-do' },
  { label: 'QUAY THỬ', href: '/quay-thu' },
  { label: 'SỔ MƠ', href: '/so-mo' },
  { label: 'USER DASHBOARD', href: '/dashboard', highlight: true },
];

export function MinhLuanHeader({
  activeDateStr,
  allProvinces,
  activeRegionTab,
  onSelectRegionTab,
  dark,
  onToggleDark,
  soundEnabled,
  onToggleSound,
  onOpenCheckerModal,
}: MinhLuanHeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form Đăng nhập nhanh trên top bar (#1)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Form Dò vé số Online (#3)
  const [selectedProvId, setSelectedProvId] = useState<string>('');
  const [ticketNum, setTicketNum] = useState<string>('');
  const [checkResult, setCheckResult] = useState<TicketMatchResult | null>(null);

  const handleQuickLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  const handleInlineCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const targetProv =
      allProvinces.find((p) => p.provinceId === selectedProvId) || allProvinces[0];
    if (!targetProv) return;
    const res = checkTicket(ticketNum, targetProv);
    setCheckResult(res);
    if (res.isWinner) {
      audioSynth.playWinFanfare();
    }
  };

  return (
    <header className="border-b bg-card shadow-xs">
      {/* #1: Top Utility & Quick Login Bar */}
      <div className="border-b bg-muted/40 text-[11px] text-foreground">
        <div className="mx-auto flex max-w-[1260px] flex-wrap items-center justify-between gap-2 px-3 py-1.5 lg:px-4">
          <div className="flex flex-wrap items-center gap-1 font-semibold">
            <Link href="/" className="font-black text-red-700 dark:text-red-400 hover:underline">
              Xổ Số Minh Luân™
            </Link>
            <span className="text-muted-foreground">»</span>
            <a href="#xsmn" className="hover:text-red-600 hover:underline">
              XSMN
            </a>
            <span className="text-muted-foreground">»</span>
            <a href="#kqxs-hom-nay" className="hover:text-red-600 hover:underline">
              Kết quả xổ số trực tiếp
            </a>
            <span className="hidden sm:inline text-muted-foreground">»</span>
            <Link href="/mua-ve-online" className="hidden sm:inline hover:text-red-600 hover:underline">
              Mua Vé Số Online
            </Link>
            <span className="hidden md:inline text-muted-foreground">»</span>
            <span className="hidden md:inline text-muted-foreground">xosominhluan.vn</span>
          </div>

          <form onSubmit={handleQuickLogin} className="hidden items-center gap-1.5 lg:flex">
            <Link href="/dashboard" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Đăng ký
            </Link>
            <span className="text-muted-foreground">|</span>
            <span className="font-semibold">Đăng nhập</span>
            <input
              type="text"
              placeholder="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-28 rounded border bg-background px-2 py-0.5 text-[11px] outline-none focus:border-red-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-24 rounded border bg-background px-2 py-0.5 text-[11px] outline-none focus:border-red-500"
            />
            <label className="flex items-center gap-1 cursor-pointer select-none">
              <input type="checkbox" className="size-3 accent-red-600" />
              <span>Ghi nhớ</span>
            </label>
            <button
              type="submit"
              className="rounded bg-sky-500 px-2.5 py-0.5 font-bold text-white hover:bg-sky-600 transition-colors"
            >
              Login
            </button>
          </form>

          {/* Mobile quick dashboard link */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/dashboard"
              className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white"
            >
              Đăng ký / Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Banner: #2 Logo | Center Title & Tabs | #3 Dò vé số Online */}
      <div className="mx-auto max-w-[1260px] px-3 py-2.5 lg:px-4">
        <div className="grid grid-cols-1 items-center gap-3 lg:grid-cols-12">
          {/* #2: Logo "Nắm bắt cơ hội" Minh Luân */}
          <div className="flex items-center justify-between lg:col-span-4">
            <Link href="/" className="block overflow-hidden rounded-lg border border-amber-500/40 shadow-sm hover:opacity-95 transition-opacity">
              <img
                src="/logo-minh-luan.png"
                alt="Xổ Số Minh Luân - Nắm bắt cơ hội từ con số may mắn!"
                className="h-20 sm:h-24 w-auto max-w-full object-contain bg-[#7d0000]"
              />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="rounded-lg border p-2 lg:hidden"
              aria-label="Mở menu"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>

          {/* Center: CHUYÊN TRANG KẾT QUẢ XỔ SỐ KIẾN THIẾT — MINH LUÂN + Region Tabs */}
          <div className="flex flex-col items-center justify-center text-center lg:col-span-4">
            <div className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wide text-foreground/85">
              CHUYÊN TRANG KẾT QUẢ XỔ SỐ KIẾN THIẾT
            </div>
            <div className="mt-0.5 font-serif text-2xl sm:text-3xl font-black tracking-wider text-[#b31217] dark:text-red-500 drop-shadow-2xs">
              MINH LUÂN
            </div>

            {/* 5 Gray Tabs chuẩn Minh Ngọc */}
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1">
              {[
                { id: 'all', label: 'Home' },
                { id: 'south', label: 'Miền Nam' },
                { id: 'central', label: 'Miền Trung' },
                { id: 'north', label: 'Miền Bắc' },
                { id: 'vietlott', label: 'Vietlott' },
              ].map((tab) => {
                const isActive = activeRegionTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onSelectRegionTab(tab.id as any)}
                    className={`rounded-t-md border px-2.5 py-1 text-xs font-bold transition-colors ${
                      isActive
                        ? 'border-red-600 bg-red-600 text-white shadow-2xs'
                        : 'border-border bg-muted/60 text-foreground hover:bg-muted'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* #3: Khung Dò vé số Online - Kết quả liền tay */}
          <div className="lg:col-span-4">
            <div className="overflow-hidden rounded-lg border-2 border-amber-500 bg-card shadow-xs">
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 px-3 py-1 text-center text-xs font-black text-black">
                Dò vé số Online - Kết quả liền tay
              </div>
              <form onSubmit={handleInlineCheck} className="p-2 text-xs space-y-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="flex items-center gap-1">
                    <span className="shrink-0 font-semibold text-muted-foreground">Ngày:</span>
                    <input
                      type="text"
                      readOnly
                      value={activeDateStr}
                      className="w-full rounded border bg-muted/30 px-1.5 py-0.5 text-[11px] font-mono font-bold"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="shrink-0 font-semibold text-muted-foreground">Tỉnh:</span>
                    <select
                      value={selectedProvId}
                      onChange={(e) => setSelectedProvId(e.target.value)}
                      className="w-full rounded border bg-background px-1 py-0.5 text-[11px] font-semibold outline-none focus:border-red-500"
                    >
                      <option value="">Chọn tỉnh</option>
                      {allProvinces.map((p) => (
                        <option key={p.provinceId} value={p.provinceId}>
                          {p.provinceName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="shrink-0 font-semibold text-muted-foreground">Vé Số:</span>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Nhập 6 số vé..."
                    value={ticketNum}
                    onChange={(e) => setTicketNum(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 rounded border bg-background px-2 py-1 font-mono text-xs font-black tracking-widest outline-none focus:border-red-500"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-full bg-gradient-to-b from-sky-400 to-blue-600 px-3 py-1 text-[11px] font-black text-white shadow-xs hover:from-sky-500 hover:to-blue-700 transition-all"
                  >
                    Dò Kết Quả
                  </button>
                </div>

                {checkResult && (
                  <div
                    className={`flex items-start justify-between gap-2 rounded-md border px-2 py-1 text-[11px] ${
                      checkResult.isWinner
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {checkResult.isWinner ? (
                        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                      ) : (
                        <XCircle className="size-3.5 shrink-0 text-amber-600" />
                      )}
                      <span className="font-bold">{checkResult.details}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCheckResult(null)}
                      className="text-xs font-black opacity-60 hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Red Minh Ngọc Navigation Bar */}
      <div className="bg-gradient-to-b from-[#d31a1a] via-[#a80808] to-[#7c0000] text-white shadow-sm">
        <div className="mx-auto flex max-w-[1260px] items-center justify-between px-3 lg:px-4">
          <nav className="hidden flex-wrap items-center divide-x divide-white/15 lg:flex" aria-label="Menu chính">
            {mainNavLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`px-3 py-2.5 text-[11px] font-black uppercase tracking-wide transition-colors hover:bg-black/20 ${
                  item.highlight ? 'text-amber-300' : 'text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex w-full items-center justify-between py-1.5 lg:w-auto lg:justify-end lg:gap-1.5">
            <span className="text-xs font-black uppercase text-amber-300 lg:hidden">
              Menu Xổ Số Minh Luân
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenCheckerModal}
                className="rounded bg-amber-400 px-2.5 py-1 text-[11px] font-black text-black hover:bg-amber-300 transition-colors"
              >
                Dò Vé Nâng Cao
              </button>
              <button
                type="button"
                onClick={onToggleSound}
                className="rounded border border-white/25 bg-white/10 p-1.5 hover:bg-white/20"
                title={soundEnabled ? 'Chuông báo: Bật' : 'Chuông báo: Tắt'}
              >
                {soundEnabled ? <Volume2 className="size-3.5 text-amber-300" /> : <VolumeX className="size-3.5 text-white/70" />}
              </button>
              <button
                type="button"
                onClick={onToggleDark}
                className="rounded border border-white/25 bg-white/10 p-1.5 hover:bg-white/20"
                aria-label="Giao diện tối/sáng"
              >
                {dark ? <Sun className="size-3.5 text-amber-300" /> : <Moon className="size-3.5 text-white" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-white/15 bg-[#6b0000] px-3 py-2.5 lg:hidden">
            <div className="grid grid-cols-2 gap-1.5">
              {mainNavLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-md bg-white/5 px-3 py-2 text-xs font-bold ${
                    item.highlight ? 'text-amber-300' : 'text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

