'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Menu,
  Moon,
  Sun,
  Trophy,
  X,
  BookOpen,
  TrendingUp,
  Radio,
  Flame,
  Search,
  Volume2,
  VolumeX,
  Dices,
  ScrollText,
  Printer,
} from 'lucide-react';
import { getLotteryResults } from '@/lib/mock-lottery-data';
import { RegionLotteryBoard } from '@/components/lottery/region-lottery-board';
import { LiveCountdownBanner } from '@/components/lottery/live-countdown-banner';
import { WeeklyScheduleMatrix } from '@/components/lottery/weekly-schedule-matrix';
import { TicketCheckerModal } from '@/components/lottery/ticket-checker-modal';
import { VietlottKenoWidget } from '@/components/lottery/vietlott-keno-widget';
import { audioSynth } from '@/lib/audio-synthesizer';
import { formatDate, shortDate } from '@/lib/format';
import { siteConfig } from '@/config/site';

const navItems = [
  { label: 'Trang chủ', href: '#top' },
  { label: 'XSMN', href: '#xsmn' },
  { label: 'XSMT', href: '#xsmt' },
  { label: 'XSMB', href: '#xsmb' },
  { label: 'Quay Thử', href: '/quay-thu', icon: Dices },
  { label: 'Sớ Đầu Đuôi', href: '/so-dau-duoi', icon: ScrollText },
  { label: 'Sổ Mơ', href: '/so-mo', icon: BookOpen },
  { label: 'Lô Gan', href: '/thong-ke/lo-gan', icon: TrendingUp },
  { label: 'In Vé Dò', href: '/in-ve-do', icon: Printer },
];

export default function Page() {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkerOpen, setCheckerOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);

  // Tính ngày được chọn
  const activeDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - selectedDayOffset);
    return d;
  }, [selectedDayOffset]);

  const lotteryData = useMemo(() => getLotteryResults(activeDate), [activeDate]);

  // Danh sách toàn bộ các đài mở thưởng trong ngày để dò vé
  const allProvinces = useMemo(
    () => [...lotteryData.south, ...lotteryData.central, ...lotteryData.north],
    [lotteryData]
  );

  const quickDates = [0, 1, 2, 3, 4, 5, 6].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return {
      offset,
      label: offset === 0 ? 'Hôm nay' : offset === 1 ? 'Hôm qua' : shortDate(d),
      fullDate: formatDate(d),
    };
  });

  const toggleDark = () => {
    setDark(!dark);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', !dark);
    }
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    audioSynth.enabled = nextState;
    if (nextState) {
      audioSynth.playDrawChime();
    }
  };

  return (
    <div id="top" className={`min-h-screen bg-background text-foreground ${dark ? 'dark' : ''}`}>
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 hover:bg-muted lg:hidden"
              aria-label="Mở menu"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <a href="/" className="flex items-center gap-2.5 font-black text-red-600 dark:text-red-500">
              <span className="grid size-9 place-items-center rounded-xl bg-red-600 text-white shadow-sm">
                <Trophy className="size-5" />
              </span>
              <span className="text-xl tracking-tight">XSKT Minh Ngọc</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Menu chính">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold hover:bg-muted transition-colors"
              >
                {item.icon && <item.icon className="size-4 text-red-500" />}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Nút Dò vé số nhanh */}
            <button
              type="button"
              onClick={() => setCheckerOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-all hover:scale-105"
            >
              <Search className="size-3.5" /> Dò Vé Nhanh
            </button>

            {/* Nút Âm thanh chuông báo */}
            <button
              type="button"
              onClick={toggleSound}
              className={`rounded-lg border p-2 transition-colors ${
                soundEnabled ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40' : 'text-muted-foreground hover:bg-muted'
              }`}
              title={soundEnabled ? 'Chuông báo xổ số: Bật' : 'Chuông báo xổ số: Tắt'}
            >
              {soundEnabled ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
            </button>

            {/* Nút Dark/Light mode */}
            <button
              type="button"
              onClick={toggleDark}
              className="rounded-lg border p-2 hover:bg-muted transition-colors"
              aria-label="Giao diện tối/sáng"
            >
              {dark ? <Sun className="size-5 text-amber-400" /> : <Moon className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {menuOpen && (
          <div className="border-t bg-card px-4 py-3 lg:hidden">
            <div className="grid gap-1 font-semibold text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg p-2.5 hover:bg-muted"
                >
                  {item.icon && <item.icon className="size-4 text-red-500" />}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:px-8">
        {/* Live Countdown & Direct Status Bar */}
        <LiveCountdownBanner />

        {/* Banner Tra Cứu & Bộ Chọn Ngày */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              <Flame className="size-4" />
              Bảng Kết Quả Nhanh Minh Ngọc
            </div>
            <h1 className="mt-1 text-2xl sm:text-4xl font-black tracking-tight text-foreground">
              Kết Quả Xổ Số {lotteryData.formattedDate}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Cập nhật bảng vàng kết quả 3 miền, thống kê đầu đuôi loto 0 đến 9 và sổ mơ chính xác.
            </p>
          </div>

          {/* Quick Date Selector */}
          <div className="rounded-xl border bg-card p-2 shadow-xs">
            <div className="mb-1.5 flex items-center gap-1.5 px-1 text-xs font-bold text-muted-foreground">
              <CalendarDays className="size-3.5 text-primary" />
              Xem theo ngày:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickDates.map((item) => {
                const isActive = selectedDayOffset === item.offset;
                return (
                  <button
                    key={item.offset}
                    type="button"
                    onClick={() => setSelectedDayOffset(item.offset)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-red-600 text-white shadow-xs scale-105'
                        : 'bg-muted/60 hover:bg-muted text-foreground'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3 Regional Lottery Result Boards */}
        <div className="flex flex-col gap-8">
          {/* 1. Xổ số Miền Nam */}
          <RegionLotteryBoard
            id="xsmn"
            title="XSMN · Xổ Số Miền Nam"
            regionCode="18 Giải"
            drawTime="16:15"
            dateStr={lotteryData.formattedDate}
            results={lotteryData.south}
          />

          {/* 2. Xổ số Miền Trung */}
          <RegionLotteryBoard
            id="xsmt"
            title="XSMT · Xổ Số Miền Trung"
            regionCode="18 Giải"
            drawTime="17:15"
            dateStr={lotteryData.formattedDate}
            results={lotteryData.central}
          />

          {/* 3. Xổ số Miền Bắc */}
          <RegionLotteryBoard
            id="xsmb"
            title="XSMB · Xổ Số Miền Bắc"
            regionCode="27 Giải"
            drawTime="18:15"
            dateStr={lotteryData.formattedDate}
            results={lotteryData.north}
          />
        </div>

        {/* Lịch Mở Thưởng 3 Miền Trong Tuần */}
        <WeeklyScheduleMatrix />

        {/* Khối Điện toán Vietlott & Keno */}
        <VietlottKenoWidget />

        {/* Disclaimer & SEO Info */}
        <section className="mt-10 rounded-2xl border bg-muted/20 p-5 text-xs leading-relaxed text-muted-foreground">
          <h2 className="text-sm font-bold text-foreground mb-1">
            Lưu ý về Kết quả Xổ Số Kiến Thiết (XSKT)
          </h2>
          <p>{siteConfig.disclaimer}</p>
          <p className="mt-2 font-medium">
            Lịch quay cố định: Miền Nam 16h15, Miền Trung 17h15, Miền Bắc 18h15 hàng ngày.
          </p>
        </section>
      </main>

      {/* Modal Dò Vé Số Nhanh */}
      <TicketCheckerModal
        isOpen={checkerOpen}
        onClose={() => setCheckerOpen(false)}
        availableResults={allProvinces}
      />

      {/* Footer */}
      <footer className="mt-12 border-t bg-card py-8 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-semibold text-foreground">
            © 2026 XSKT Minh Ngọc Clone — Dữ liệu mẫu phục vụ phát triển
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#xsmn" className="hover:underline">XSMN</a>
            <a href="#xsmt" className="hover:underline">XSMT</a>
            <a href="#xsmb" className="hover:underline">XSMB</a>
            <Link href="/quay-thu" className="hover:underline">Quay Thử</Link>
            <Link href="/so-dau-duoi" className="hover:underline">Sớ Đầu Đuôi</Link>
            <Link href="/so-mo" className="hover:underline">Sổ Mơ</Link>
            <Link href="/thong-ke/lo-gan" className="hover:underline">Lô Gan</Link>
            <Link href="/in-ve-do" className="hover:underline">In Vé Dò</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
