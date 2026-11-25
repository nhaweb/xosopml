'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  HelpCircle,
  Sparkles,
  UserPlus,
  Coins,
  ShieldCheck,
} from 'lucide-react';
import { DayLotteryData } from '@/types/lottery';
import { PROVINCES, sortProvincesCanonical } from '@/config/lottery-provinces';
import { siteConfig } from '@/config/site';

export interface SidebarLookupQuery {
  mode: 'region' | 'province' | 'headtail';
  region: 'mien-nam' | 'mien-trung' | 'mien-bac';
  provinceId: string;
}

interface LeftSidebarProps {
  activeDate: Date;
  onSelectDate: (date: Date) => void;
  lotteryData: DayLotteryData;
  onLookupResult?: (query: SidebarLookupQuery) => void;
}

const WEEKDAYS_VN = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

function getVietnamNow(d: Date = new Date()): Date {
  // Việt Nam luôn ở múi giờ UTC+7 (không có DST)
  return new Date(d.getTime() + 7 * 60 * 60 * 1000);
}

function getVietnamHour(d: Date): number {
  return getVietnamNow(d).getUTCHours();
}

export function LeftSidebar({
  activeDate,
  onSelectDate,
  lotteryData,
  onLookupResult,
}: LeftSidebarProps) {
  const router = useRouter();
  const [calMonth, setCalMonth] = useState<number>(activeDate.getMonth());
  const [calYear, setCalYear] = useState<number>(activeDate.getFullYear());
  const [now, setNow] = useState<Date>(() => new Date());

  React.useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  // Từ sau 16:00 (4h00 chiều) giờ VN trở đi, tự động chuyển sang dấu tích xanh ✓ (mới / đã có kết quả)
  const isAfter16h = getVietnamHour(now) >= 16;

  // State cho hộp Tra cứu (Section 2 #1)
  const [lookupMode, setLookupMode] = useState<'region' | 'province' | 'headtail'>('region');
  const [lookupRegion, setLookupRegion] = useState('mien-nam');
  const [lookupProvince, setLookupProvince] = useState('dong-thap');

  const calendarCells = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1);
    const lastDay = new Date(calYear, calMonth + 1, 0);
    // T2 = 0 ... CN = 6
    const startOffset = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();

    const cells: { date: Date; inMonth: boolean }[] = [];
    for (let i = startOffset - 1; i >= 0; i--) {
      cells.push({ date: new Date(calYear, calMonth, -i), inMonth: false });
    }
    for (let d = 1; d <= totalDays; d++) {
      cells.push({ date: new Date(calYear, calMonth, d), inMonth: true });
    }
    while (cells.length % 7 !== 0) {
      const nextIdx = cells.length - (startOffset + totalDays) + 1;
      cells.push({ date: new Date(calYear, calMonth + 1, nextIdx), inMonth: false });
    }
    return cells;
  }, [calMonth, calYear]);

  const shiftMonth = (delta: number) => {
    const next = new Date(calYear, calMonth + delta, 1);
    setCalMonth(next.getMonth());
    setCalYear(next.getFullYear());
  };

  const shiftActiveDay = (delta: number) => {
    const next = new Date(activeDate);
    next.setDate(activeDate.getDate() + delta);
    onSelectDate(next);
  };

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLookupResult) {
      onLookupResult({
        mode: lookupMode,
        region: lookupRegion as 'mien-nam' | 'mien-trung' | 'mien-bac',
        provinceId: lookupProvince,
      });
      return;
    }
    if (lookupMode === 'headtail') {
      router.push('/so-dau-duoi');
    } else if (lookupMode === 'province') {
      const p = PROVINCES.find((item) => item.id === lookupProvince);
      const regSlug =
        p?.region === 'south' ? 'mien-nam' : p?.region === 'central' ? 'mien-trung' : 'mien-bac';
      router.push(`/ket-qua-xo-so/${regSlug}/${lookupProvince}.html`);
    } else {
      const target = lookupRegion === 'mien-nam' ? '#xsmn' : lookupRegion === 'mien-trung' ? '#xsmt' : '#xsmb';
      window.location.hash = target;
    }
  };

  const vnToday = getVietnamNow(now);
  const today = new Date(vnToday.getUTCFullYear(), vnToday.getUTCMonth(), vnToday.getUTCDate());
  const todayStart = today.getTime();
  const isAtCurrentOrFutureMonth =
    calYear > today.getFullYear() ||
    (calYear === today.getFullYear() && calMonth >= today.getMonth());
  const activeDayStart = new Date(
    activeDate.getFullYear(),
    activeDate.getMonth(),
    activeDate.getDate()
  ).getTime();
  const isAtOrAfterToday = activeDayStart >= todayStart;
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  return (
    <aside className="space-y-3.5 text-xs">
      {/* #4: Tường Thuật Trực Tiếp Xổ Số */}
      <div className="overflow-hidden rounded-lg border bg-card shadow-2xs">
        <div className="border-b bg-gradient-to-b from-muted/80 to-muted px-3 py-2 text-center font-black text-foreground">
          Tường Thuật Trực Tiếp Xổ Số
        </div>
        <div className="divide-y divide-border/60 p-2 text-[12px]">
          {[
            { label: 'Trực Tiếp Xổ Số Miền Nam', href: '#xsmn' },
            { label: 'Trực Tiếp Xổ Số Miền Bắc', href: '#xsmb' },
            { label: 'Trực Tiếp Xổ Số Miền Trung', href: '#xsmt' },
            { label: 'Trực Tiếp Xổ Số Vietlott', href: '#vietlott' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center justify-between py-1.5 font-semibold text-foreground hover:text-red-600"
            >
              <span>▸ {item.label}</span>
              {isAfter16h ? (
                <Check className="size-4 shrink-0 text-emerald-600 stroke-[3]" aria-label="Mới - Đã có kết quả" />
              ) : (
                <span className="shrink-0 text-[10px] font-bold tracking-tighter text-slate-400" title="Đang chờ mở thưởng">
                  ● ● ●
                </span>
              )}
            </a>
          ))}
          <Link
            href="/#lich-mo-thuong"
            className="block py-1.5 font-medium text-muted-foreground hover:text-red-600"
          >
            ▸ Lịch quay số mở thưởng
          </Link>
          <Link
            href="/quay-thu"
            className="block py-1.5 font-medium text-muted-foreground hover:text-red-600"
          >
            ▸ Quay thử cầu may 3 miền
          </Link>
        </div>
        <div className="border-t bg-muted/30 px-2.5 py-1.5 text-center text-[10px] text-muted-foreground">
          <span className="text-slate-400">● ● ●</span> chờ,{' '}
          <span className="text-red-500">■ ■ ■</span> đang xổ,{' '}
          <span className="font-bold text-emerald-600">✓</span> mới
        </div>
      </div>

      {/* #7: Lịch Tháng Tương Tác */}
      <div className="overflow-hidden rounded-lg border bg-card shadow-2xs">
        <div className="flex items-center justify-between border-b bg-muted/70 px-2 py-1.5 font-black text-foreground">
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => shiftMonth(-12)}
              className="rounded p-0.5 hover:bg-muted"
              aria-label="Năm trước"
            >
              <ChevronsLeft className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="rounded p-0.5 hover:bg-muted"
              aria-label="Tháng trước"
            >
              <ChevronLeft className="size-3.5" />
            </button>
          </div>
          <span className="text-xs font-black">
            Tháng {calMonth + 1} {calYear}
          </span>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              disabled={isAtCurrentOrFutureMonth}
              aria-disabled={isAtCurrentOrFutureMonth}
              onClick={() => !isAtCurrentOrFutureMonth && shiftMonth(1)}
              className={`rounded p-0.5 ${isAtCurrentOrFutureMonth ? 'opacity-40 pointer-events-none cursor-not-allowed' : 'hover:bg-muted'}`}
              aria-label="Tháng sau"
            >
              <ChevronRight className="size-3.5" />
            </button>
            <button
              type="button"
              disabled={isAtCurrentOrFutureMonth}
              aria-disabled={isAtCurrentOrFutureMonth}
              onClick={() => !isAtCurrentOrFutureMonth && shiftMonth(12)}
              className={`rounded p-0.5 ${isAtCurrentOrFutureMonth ? 'opacity-40 pointer-events-none cursor-not-allowed' : 'hover:bg-muted'}`}
              aria-label="Năm sau"
            >
              <ChevronsRight className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="p-2">
          <div className="grid grid-cols-7 text-center text-[10px] font-black mb-1">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d, idx) => (
              <span key={d} className={idx >= 5 ? 'text-red-600' : 'text-foreground'}>
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center text-[11px]">
            {calendarCells.map((cell, idx) => {
              const selected = isSameDay(cell.date, activeDate);
              const isToday = isSameDay(cell.date, today);
              const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6;
              const cellDayStart = new Date(
                cell.date.getFullYear(),
                cell.date.getMonth(),
                cell.date.getDate()
              ).getTime();
              const isFuture = cellDayStart > todayStart;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isFuture}
                  aria-disabled={isFuture}
                  onClick={() => !isFuture && onSelectDate(cell.date)}
                  className={`rounded py-1 font-mono transition-colors ${
                    isFuture
                      ? 'opacity-40 pointer-events-none cursor-not-allowed text-muted-foreground/50'
                      : selected
                        ? 'bg-red-600 font-black text-white shadow-2xs'
                        : isToday
                          ? 'bg-blue-600/15 font-black text-blue-700 dark:text-blue-400 ring-1 ring-blue-500'
                          : !cell.inMonth
                            ? 'text-muted-foreground/40 hover:bg-muted/40'
                            : isWeekend
                              ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40'
                              : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              setCalMonth(now.getMonth());
              setCalYear(now.getFullYear());
              onSelectDate(now);
            }}
            className="mt-2 w-full rounded border bg-muted/60 py-1 text-center text-[11px] font-bold text-foreground hover:bg-muted"
          >
            Hôm nay
          </button>
        </div>
      </div>

      {/* #8: Kết quả xổ số Hôm Nay */}
      <div className="overflow-hidden rounded-lg border bg-card shadow-2xs">
        <div className="flex items-center justify-between border-b bg-muted/70 px-2 py-1.5">
          <button
            type="button"
            onClick={() => shiftActiveDay(-1)}
            className="grid size-5 place-items-center rounded-full border bg-background hover:bg-muted"
            aria-label="Ngày trước"
          >
            <ChevronLeft className="size-3" />
          </button>
          <div className="text-center leading-tight">
            <div className="text-[11px] font-black text-foreground">Kết quả xổ số Hôm Nay</div>
            <div className="text-[10px] text-muted-foreground">
              {WEEKDAYS_VN[activeDate.getDay()]} - Ngày {lotteryData.formattedDate}
            </div>
          </div>
          <button
            type="button"
            disabled={isAtOrAfterToday}
            aria-disabled={isAtOrAfterToday}
            onClick={() => !isAtOrAfterToday && shiftActiveDay(1)}
            className={`grid size-5 place-items-center rounded-full border bg-background ${
              isAtOrAfterToday ? 'opacity-40 pointer-events-none cursor-not-allowed' : 'hover:bg-muted'
            }`}
            aria-label="Ngày sau"
          >
            <ChevronRight className="size-3" />
          </button>
        </div>

        <div className="space-y-2 p-2 text-[11px]">
          <div>
            <a href="#xsmn" className="font-black text-red-700 dark:text-red-400 hover:underline">
              ▼ Kết quả xổ số Miền Nam
            </a>
            <ul className="mt-1 space-y-1 pl-2">
              {sortProvincesCanonical(lotteryData.south).map((p) => (
                <li key={p.provinceId} className="flex items-center justify-between">
                  <Link
                    href={`/ket-qua-xo-so/mien-nam/${p.provinceId}.html`}
                    className="hover:text-red-600 hover:underline"
                  >
                    ▸ Kết quả xổ số {p.provinceName}
                  </Link>
                  <Check className="size-3.5 text-emerald-600 stroke-[3]" />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <a href="#xsmb" className="font-black text-red-700 dark:text-red-400 hover:underline">
              ▼ Kết quả xổ số Miền Bắc
            </a>
            <ul className="mt-1 space-y-1 pl-2">
              {lotteryData.north.map((p) => (
                <li key={p.provinceId} className="flex items-center justify-between">
                  <Link
                    href={`/ket-qua-xo-so/mien-bac/${p.provinceId}.html`}
                    className="hover:text-red-600 hover:underline"
                  >
                    ▸ Kết quả xổ số {p.provinceName}
                  </Link>
                  <Check className="size-3.5 text-emerald-600 stroke-[3]" />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <a href="#xsmt" className="font-black text-red-700 dark:text-red-400 hover:underline">
              ▼ Kết quả xổ số Miền Trung
            </a>
            <ul className="mt-1 space-y-1 pl-2">
              {lotteryData.central.map((p) => (
                <li key={p.provinceId} className="flex items-center justify-between">
                  <Link
                    href={`/ket-qua-xo-so/mien-trung/${p.provinceId}.html`}
                    className="hover:text-red-600 hover:underline"
                  >
                    ▸ Kết quả xổ số {p.provinceName}
                  </Link>
                  <Check className="size-3.5 text-emerald-600 stroke-[3]" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Section 2 #1: Tra Cứu Kết Quả Xổ Số */}
      <div className="overflow-hidden rounded-lg border bg-card shadow-2xs">
        <div className="border-b bg-muted/70 px-3 py-1.5 text-center font-black text-foreground">
          Tra Cứu Kết Quả Xổ Số
        </div>
        <form onSubmit={handleLookupSubmit} className="space-y-2 p-2.5 text-[11px]">
          <div className="flex items-center justify-between">
            {[
              { id: 'region', label: 'Miền' },
              { id: 'province', label: 'Tỉnh' },
              { id: 'headtail', label: 'Đầu đuôi' },
            ].map((opt) => (
              <label key={opt.id} className="flex items-center gap-1 cursor-pointer font-semibold">
                <input
                  type="radio"
                  name="lookupMode"
                  checked={lookupMode === opt.id}
                  onChange={() => setLookupMode(opt.id as any)}
                  className="accent-red-600"
                />
                {opt.label}
              </label>
            ))}
          </div>

          {lookupMode === 'province' ? (
            <select
              value={lookupProvince}
              onChange={(e) => setLookupProvince(e.target.value)}
              className="w-full rounded border bg-background px-2 py-1 text-[11px] font-semibold"
            >
              {PROVINCES.map((p) => (
                <option key={p.id} value={p.id}>
                  Xổ số {p.name}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={lookupRegion}
              onChange={(e) => setLookupRegion(e.target.value)}
              className="w-full rounded border bg-background px-2 py-1 text-[11px] font-semibold"
            >
              <option value="mien-nam">Xổ số Miền Nam</option>
              <option value="mien-trung">Xổ số Miền Trung</option>
              <option value="mien-bac">Xổ số Miền Bắc</option>
            </select>
          )}

          <div className="flex items-center justify-center gap-1.5 pt-1">
            <button
              type="submit"
              className="rounded border bg-muted px-3 py-1 font-bold text-foreground hover:bg-red-600 hover:text-white transition-colors"
            >
              Xem kết quả
            </button>
            <HelpCircle className="size-4 text-amber-500" />
          </div>
        </form>
      </div>

      {/* Section 2 #2: Hộp Hướng dẫn & In vé dò */}
      <div className="rounded-lg border bg-card p-2.5 shadow-2xs">
        <ul className="space-y-1.5 text-[11px] font-semibold text-blue-700 dark:text-blue-400">
          <li>
            <Link href="/dashboard" className="hover:underline">
              ▸ Hướng dẫn đăng ký thành viên
            </Link>
          </li>
          <li>
            <Link href="/in-ve-do" className="hover:underline">
              ▸ Hướng Dẫn In Vé Dò Kết Quả Xổ Số
            </Link>
          </li>
          <li>
            <Link href="/in-ve-do" className="hover:underline">
              ▸ IN VÉ DÒ TRÊN CHROME
            </Link>
          </li>
          <li>
            <Link href="/in-ve-do" className="hover:underline">
              ▸ IN VÉ DÒ TRÊN FIREFOX
            </Link>
          </li>
          <li>
            <Link href="/in-ve-do" className="hover:underline">
              ▸ THIẾT LẬP KHỔ GIẤY A4
            </Link>
          </li>
        </ul>
      </div>

      {/* Section 2 #3: Banner NHIỀU TIỆN ÍCH - ĐĂNG KÝ THÀNH VIÊN NGAY (kích thước bề thế cân xứng với thẻ Đổi Số Trúng) */}
      <Link
        href="/dashboard"
        className="group relative flex min-h-[372px] flex-col justify-between overflow-hidden rounded-xl border-2 border-amber-400/90 bg-gradient-to-b from-[#b90c0c] via-[#8f0000] to-[#520000] px-3.5 py-5 text-center text-white shadow-md transition-transform hover:scale-[1.01]"
      >
        <div className="pointer-events-none absolute -top-3 -right-3 opacity-15">
          <Coins className="size-20 text-amber-300" />
        </div>
        <div className="pointer-events-none absolute -bottom-4 -left-4 opacity-10">
          <Sparkles className="size-20 text-amber-200" />
        </div>

        <div className="relative">
          <div className="mx-auto inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-400/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-amber-200">
            <Sparkles className="size-3.5 text-amber-300" /> Hội Viên Minh Luân
          </div>
          <div className="mt-3 text-xl font-black uppercase leading-tight tracking-wide text-amber-300 drop-shadow-xs">
            NHIỀU TIỆN ÍCH
          </div>
          <div className="mt-1 text-base font-black uppercase leading-snug tracking-wide text-white drop-shadow-xs">
            ĐĂNG KÝ THÀNH VIÊN NGAY
          </div>

          <ul className="mt-4 space-y-2 pl-2 text-left text-xs font-bold text-amber-50">
            <li className="flex items-center gap-1.5">
              <Check className="size-3.5 shrink-0 text-amber-300 stroke-[3]" /> Mua vé số Online
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="size-3.5 shrink-0 text-amber-300 stroke-[3]" /> Lưu số yêu thích
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="size-3.5 shrink-0 text-amber-300 stroke-[3]" /> Con số phong thủy
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="size-3.5 shrink-0 text-amber-300 stroke-[3]" /> Trợ lý AI Xổ Số
            </li>
          </ul>
        </div>

        <div className="relative mt-4 flex flex-col items-center gap-3.5">
          <span className="grid size-14 place-items-center rounded-2xl border border-amber-300/50 bg-gradient-to-b from-amber-300/25 to-amber-600/20 text-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.3)]">
            <UserPlus className="size-7 drop-shadow-sm transition-transform duration-300 group-hover:scale-110" />
          </span>

          {/* Nút Đăng ký ngay với hiệu ứng shimmer + nhún nhẹ pulse */}
          <span className="relative inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-500 px-5 py-2 text-xs font-black uppercase tracking-wide text-red-950 ring-2 ring-amber-200/80 animate-[cta-pulse_1.8s_ease-in-out_infinite] group-hover:from-amber-100 group-hover:to-amber-400">
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/75 to-transparent animate-[shimmer_2s_infinite]" />
            <UserPlus className="relative size-3.5 stroke-[2.5]" />
            <span className="relative">Đăng ký ngay</span>
          </span>
        </div>
      </Link>
    </aside>
  );
}

export function RightSidebar() {
  return (
    <aside className="space-y-3.5 text-xs">
      {/* #6: Banner dọc XỔ SỐ MINH LUÂN — ĐỔI SỐ TRÚNG ĐẶC BIỆT */}
      <Link
        href="/mua-ve-online"
        className="group relative block overflow-hidden rounded-xl border-2 border-amber-400/70 bg-gradient-to-b from-[#0f2454] via-[#132c68] to-[#081533] px-2.5 py-4 text-center text-white shadow-md transition-transform hover:scale-[1.01]"
      >
        <div className="text-xs font-extrabold uppercase tracking-wide text-amber-300">
          XỔ SỐ MINH LUÂN
        </div>
        <div className="mt-2 text-base font-black uppercase leading-tight tracking-tight text-white drop-shadow-xs">
          ĐỔI SỐ TRÚNG
        </div>
        <div className="mt-1.5 inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-amber-300/70 bg-gradient-to-r from-red-600 via-red-500 to-red-600 px-3.5 py-1 text-base font-black uppercase tracking-wide text-white animate-[live-pulse-glow_1.6s_ease-in-out_infinite]">
          <span className="inline-block size-2 rounded-full bg-amber-300 animate-ping" />
          <span>ĐẶC BIỆT</span>
        </div>
        <div className="mt-3 rounded-lg border border-amber-400/30 bg-black/30 py-1.5 font-mono text-lg font-extrabold tracking-wide text-amber-300">
          {siteConfig.hotline}
        </div>
        <ul className="mt-3 space-y-1.5 text-left pl-3 text-xs font-bold text-slate-100">
          <li className="flex items-center gap-1.5">
            <Check className="size-3.5 text-amber-400 shrink-0" /> Nhanh nhất
          </li>
          <li className="flex items-center gap-1.5">
            <Check className="size-3.5 text-amber-400 shrink-0" /> Uy Tín
          </li>
          <li className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-amber-400 shrink-0" /> Bảo Mật
          </li>
          <li className="flex items-center gap-1.5">
            <Check className="size-3.5 text-amber-400 shrink-0" /> Tận Nơi
          </li>
        </ul>

        {/* Icon Hũ Vàng / Thùng Vàng Tài Lộc bắt mắt */}
        <div className="my-3.5 flex justify-center">
          <span className="relative grid size-14 place-items-center rounded-2xl border border-amber-400/50 bg-gradient-to-b from-amber-400/25 to-amber-600/15 shadow-[0_0_16px_rgba(251,191,36,0.3)]">
            <svg
              viewBox="0 0 64 64"
              className="size-9 drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-110"
              aria-label="Hũ vàng tài lộc"
            >
              <defs>
                <linearGradient id="potGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF59D" />
                  <stop offset="45%" stopColor="#FFD54F" />
                  <stop offset="80%" stopColor="#FFB300" />
                  <stop offset="100%" stopColor="#E65100" />
                </linearGradient>
                <linearGradient id="ingotGold" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFDE7" />
                  <stop offset="50%" stopColor="#FFD740" />
                  <stop offset="100%" stopColor="#FF8F00" />
                </linearGradient>
                <linearGradient id="rubyRed" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FF5252" />
                  <stop offset="100%" stopColor="#B71C1C" />
                </linearGradient>
              </defs>
              {/* Tia sáng lấp lánh */}
              <circle cx="13" cy="14" r="1.8" fill="#FFF59D" />
              <circle cx="52" cy="13" r="2" fill="#FFF59D" />
              <circle cx="32" cy="7" r="1.6" fill="#FFFFFF" />
              {/* Đống thỏi vàng & đồng xu đầy ắp trên miệng hũ */}
              <circle cx="20" cy="22" r="6" fill="url(#ingotGold)" stroke="#B26A00" strokeWidth="1" />
              <circle cx="44" cy="22" r="6" fill="url(#ingotGold)" stroke="#B26A00" strokeWidth="1" />
              <ellipse cx="32" cy="17" rx="8" ry="4.5" fill="#FFF59D" stroke="#B26A00" strokeWidth="1" />
              <path
                d="M21 18 C23 13, 41 13, 43 18 L40 24 C36 25.5, 28 25.5, 24 24 Z"
                fill="url(#ingotGold)"
                stroke="#B26A00"
                strokeWidth="1"
              />
              {/* Vành miệng hũ vàng */}
              <rect x="13" y="23" width="38" height="5.5" rx="2.75" fill="url(#ingotGold)" stroke="#B26A00" strokeWidth="1.2" />
              {/* Thân hũ vàng tài lộc */}
              <path
                d="M15 28.5 C9 35, 10 49, 19 54.5 C24 57.2, 40 57.2, 45 54.5 C54 49, 55 35, 49 28.5 Z"
                fill="url(#potGold)"
                stroke="#B26A00"
                strokeWidth="1.4"
              />
              {/* Hoa văn ngọc đỏ Lộc Phát giữa thân hũ */}
              <rect
                x="26.5"
                y="36.5"
                width="11"
                height="11"
                rx="2"
                transform="rotate(45 32 42)"
                fill="url(#rubyRed)"
                stroke="#FFF59D"
                strokeWidth="1.3"
              />
              <circle cx="32" cy="42" r="2.2" fill="#FFF59D" />
            </svg>
          </span>
        </div>

        {/* Nút bấm "Click vào đây" kèm hiệu ứng nhún nhẹ + ánh sáng shimmer thu hút */}
        <span className="relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 px-5 py-1.5 text-xs font-extrabold text-slate-950 shadow-[0_0_16px_rgba(251,191,36,0.75)] ring-2 ring-amber-200/80 animate-bounce group-hover:from-amber-200 group-hover:to-amber-400">
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent animate-[shimmer_2s_infinite]" />
          <span className="relative">Click vào đây</span>
        </span>
      </Link>

      {/* Section 2 #4: Tin tức & Quy định đổi số trúng */}
      <div className="rounded-lg border bg-card p-2.5 shadow-2xs">
        <ul className="space-y-1.5 text-[11px] font-semibold text-blue-700 dark:text-blue-400">
          <li>
            <Link href="/dashboard" className="hover:underline">
              ▸ Mức chi hoa hồng đại lý xổ số
            </Link>
          </li>
          <li>
            <Link href="/#xsmb" className="hover:underline">
              ▸ Thay đổi giờ mở thưởng Xổ Số Miền Bắc
            </Link>
          </li>
          <li>
            <Link href="/mua-ve-online" className="hover:underline">
              ▸ ĐỔI SỐ TRÚNG ĐẶC BIỆT Ở ĐÂU &amp; THỦ TỤC
            </Link>
          </li>
          <li>
            <Link href="/dashboard" className="hover:underline">
              ▸ Nghị định 78/2012/NĐ-CP về kinh doanh xổ số
            </Link>
          </li>
          <li>
            <Link href="/dashboard" className="hover:underline">
              ▸ THUẾ THU NHẬP TRÚNG THƯỞNG XỔ SỐ
            </Link>
          </li>
          <li>
            <Link href="/dashboard" className="hover:underline">
              ▸ KHUYẾN CÁO KHI ĐỔI SỐ TRÚNG
            </Link>
          </li>
        </ul>
      </div>

      {/* Section 2 #5: Thay quả địa cầu bằng YouTube Logo chất lượng cao -> https://www.youtube.com/@xosominhluan */}
      <a
        href={siteConfig.youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block overflow-hidden rounded-xl border-2 border-red-500/70 bg-gradient-to-b from-[#0b1f54] via-[#0e2d7d] to-[#081740] p-4 text-center text-white shadow-md transition-all hover:scale-[1.02] hover:border-red-400"
      >
        <div className="text-xs font-bold uppercase tracking-wide text-amber-300">
          KẾT QUẢ XỔ SỐ
        </div>
        <div className="mt-0.5 text-sm font-extrabold uppercase tracking-wide text-white">
          TƯỜNG THUẬT
        </div>
        <div className="mt-1 inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-amber-300/70 bg-gradient-to-r from-red-600 via-red-500 to-red-600 px-3.5 py-1 text-lg font-black uppercase tracking-wide text-white animate-[live-pulse-glow_1.6s_ease-in-out_infinite]">
          <span className="inline-block size-2.5 rounded-full bg-amber-300 animate-ping" />
          <span>TRỰC TIẾP</span>
        </div>

        {/* High-Quality Crisp Vector YouTube Logo */}
        <div className="my-4 flex flex-col items-center justify-center rounded-2xl bg-white px-4 py-4 shadow-inner">
          <div className="flex items-center justify-center gap-1.5">
            <svg
              className="h-11 w-14 drop-shadow-sm transition-transform group-hover:scale-110"
              viewBox="0 0 68 48"
              aria-label="YouTube"
            >
              <path
                d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"
                fill="#FF0000"
              />
              <path d="M45 24 27 14v20" fill="#FFFFFF" />
            </svg>
            <span className="text-2xl font-black tracking-tighter text-neutral-900">
              YouTube
            </span>
          </div>
          <span className="mt-1.5 text-[11px] font-extrabold text-red-600">
            @xosominhluan
          </span>
        </div>

        <div className="whitespace-nowrap text-[11.5px] sm:text-xs font-black tracking-wide text-amber-200">
          Bắc - Trung - Nam
        </div>
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-[11px] font-black text-white shadow group-hover:bg-red-500">
          Xem Trực Tiếp Ngay <ExternalLink className="size-3" />
        </div>
      </a>

      {/* Hộp tiện ích viền xanh lá chuẩn Minh Ngọc */}
      <div className="rounded-lg border-2 border-emerald-500/70 bg-card p-2.5 shadow-2xs">
        <ul className="space-y-1.5 text-[11px] font-semibold text-blue-700 dark:text-blue-400">
          <li>
            <Link href="/dashboard" className="hover:underline">
              ▸ Hướng dẫn đăng ký thành viên
            </Link>
          </li>
          <li>
            <Link href="/in-ve-do" className="hover:underline">
              ▸ Hướng Dẫn In Vé Dò Kết Quả Xổ Số
            </Link>
          </li>
          <li>
            <Link href="/so-mo" className="hover:underline">
              ▸ Giải mã giấc mơ
            </Link>
          </li>
          <li>
            <Link href="/thong-ke/giai-dac-biet" className="hover:underline">
              ▸ Bảng đặc biệt năm 31 ngày × 12 tháng
            </Link>
          </li>
          <li>
            <Link href="/in-ve-do" className="hover:underline">
              ▸ THIẾT LẬP KHỔ GIẤY A4
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}

