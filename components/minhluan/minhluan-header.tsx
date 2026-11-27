'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  activeDate?: Date;
  onSelectDate?: (date: Date) => void;
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
  { label: 'TRỰC TIẾP', href: '/truc-tiep' },
  { label: 'SỔ KẾT QUẢ', href: '/thong-ke/giai-dac-biet' },
  { label: 'SỚ ĐẦU ĐUÔI', href: '/so-dau-duoi' },
  { label: 'THỐNG KÊ', href: '/thong-ke/tan-suat' },
  { label: 'MUA VÉ ONLINE', href: '/mua-ve-online', highlight: true },
  { label: 'IN VÉ DÒ', href: '/in-ve-do' },
  { label: 'QUAY THỬ', href: '/quay-thu' },
  { label: 'SỔ MƠ', href: '/so-mo' },
  { label: 'USER DASHBOARD', href: '/dashboard', highlight: true },
];

function toIsoDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function MinhLuanHeader({
  activeDateStr,
  activeDate,
  onSelectDate,
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
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form Đăng nhập nhanh trên top bar (#1)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Form Dò vé số Online (#3)
  const [selectedDateIso, setSelectedDateIso] = useState<string>(() => {
    if (activeDate) return toIsoDateString(activeDate);
    const match = activeDateStr?.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (match) {
      const [, day, mon, yr] = match;
      return `${yr}-${mon.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return toIsoDateString(new Date());
  });
  const [selectedProvId, setSelectedProvId] = useState<string>('');
  const [ticketNum, setTicketNum] = useState<string>('');
  const [checkResult, setCheckResult] = useState<TicketMatchResult | null>(null);
  const [liveProvincesForDate, setLiveProvincesForDate] = useState<ProvinceDrawResult[] | null>(null);
  const [isCheckingTicket, setIsCheckingTicket] = useState<boolean>(false);

  const effectiveProvinces =
    liveProvincesForDate && liveProvincesForDate.length > 0 ? liveProvincesForDate : allProvinces;

  const activeDateIso = activeDate ? toIsoDateString(activeDate) : '';

  React.useEffect(() => {
    if (activeDateIso) {
      setSelectedDateIso(activeDateIso);
      setLiveProvincesForDate(null);
    } else if (activeDateStr) {
      const match = activeDateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (match) {
        const [, day, mon, yr] = match;
        setSelectedDateIso(`${yr}-${mon.padStart(2, '0')}-${day.padStart(2, '0')}`);
        setLiveProvincesForDate(null);
      }
    }
  }, [activeDateIso, activeDateStr]);

  React.useEffect(() => {
    if (effectiveProvinces.length > 0) {
      const exists = effectiveProvinces.some((p) => p.provinceId === selectedProvId);
      if (!exists) {
        setSelectedProvId(effectiveProvinces[0].provinceId);
      }
    }
  }, [effectiveProvinces, selectedProvId]);

  const todayIso = (() => {
    const vn = new Date(Date.now() + 7 * 60 * 60 * 1000);
    return `${vn.getUTCFullYear()}-${String(vn.getUTCMonth() + 1).padStart(2, '0')}-${String(vn.getUTCDate()).padStart(2, '0')}`;
  })();

  const fetchProvincesForIsoDate = async (isoDate: string): Promise<ProvinceDrawResult[]> => {
    try {
      const res = await fetch(`/api/xoso/draws?date=${isoDate}`);
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          const list: ProvinceDrawResult[] = [
            ...(json.data.south || []),
            ...(json.data.central || []),
            ...(json.data.north || []),
          ];
          setLiveProvincesForDate(list);
          return list;
        }
      }
    } catch {
      // ignore
    }
    return effectiveProvinces;
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val || val > todayIso) return;
    setSelectedDateIso(val);
    setCheckResult(null);
    const [y, m, d] = val.split('-').map(Number);
    if (!y || !m || !d) return;
    const picked = new Date(y, m - 1, d, 12, 0, 0);

    if (onSelectDate) {
      onSelectDate(picked);
    }
    await fetchProvincesForIsoDate(val);
  };

  const handleQuickLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/login');
  };

  const handleGoHome = () => {
    onSelectRegionTab('all');
    if (typeof window !== 'undefined' && window.location.hash) {
      window.history.replaceState(null, '', pathname || '/');
    }
  };

  const handleInlineCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingTicket(true);
    try {
      const latestList = await fetchProvincesForIsoDate(selectedDateIso);
      const pool = latestList.length > 0 ? latestList : effectiveProvinces;
      const targetProv = pool.find((p) => p.provinceId === selectedProvId) || pool[0];
      if (!targetProv) return;
      const res = checkTicket(ticketNum, targetProv);
      setCheckResult(res);
      if (res.isWinner) {
        audioSynth.playWinFanfare();
      }
    } finally {
      setIsCheckingTicket(false);
    }
  };

  return (
    <header className="border-b bg-card shadow-xs print:hidden">
      {/* #1: Top Utility & Quick Login Bar */}
      <div className="border-b bg-muted/40 text-[11px] text-foreground">
        <div className="mx-auto flex max-w-[1260px] flex-wrap items-center justify-between gap-2 px-3 py-1.5 lg:px-4">
          <div className="flex flex-wrap items-center gap-1 font-semibold">
            <Link
              href="/"
              onClick={handleGoHome}
              className="font-black text-red-700 dark:text-red-400 hover:underline"
            >
              Xổ Số Minh Luân
            </Link>
            <span className="text-muted-foreground">»</span>
            <Link href="/#xsmn" className="hover:text-red-600 hover:underline">
              XSMN
            </Link>
            <span className="text-muted-foreground">»</span>
            <Link href="/#kqxs-hom-nay" className="hover:text-red-600 hover:underline">
              Kết quả xổ số trực tiếp
            </Link>
            <span className="hidden sm:inline text-muted-foreground">»</span>
            <Link href="/mua-ve-online" className="hidden sm:inline hover:text-red-600 hover:underline">
              Mua Vé Số Online
            </Link>
            <span className="hidden md:inline text-muted-foreground">»</span>
            <span className="hidden md:inline text-muted-foreground">xosominhluan.vn</span>
          </div>

          <form onSubmit={handleQuickLogin} className="hidden items-center gap-1.5 lg:flex">
            <Link href="/register" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Đăng ký
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link href="/login" className="font-semibold hover:text-red-600 hover:underline">
              Đăng nhập
            </Link>
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
              className="rounded-md bg-[#0f2454] px-2.5 py-0.5 font-bold text-white hover:bg-[#1a3673] transition-colors"
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

      {/* Main Header Banner: #1 Logo Minh Luân | Center Chuyên trang... & Menu | #2 Dò vé số Online */}
      <div className="mx-auto max-w-[1260px] px-3 py-2.5 lg:px-4">
        <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-12">
          {/* #1: Logo Minh Luân - Giữ nguyên 100% tỷ lệ gốc tự nhiên, không ép chiều rộng/cao */}
          <div className="flex items-center justify-between lg:col-span-4">
            <Link
              href="/"
              onClick={handleGoHome}
              className="flex w-full items-center justify-center overflow-hidden rounded-lg border border-amber-500/40 bg-[#7d0000] shadow-sm hover:opacity-95 transition-opacity"
            >
              <img
                src="/logo-minh-luan.png"
                alt="Xổ Số Minh Luân - Nắm bắt cơ hội từ con số may mắn!"
                className="block w-auto h-auto max-h-[110px] max-w-full object-contain"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="ml-2 rounded-lg border p-2 lg:hidden shrink-0"
              aria-label="Mở menu"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>

          {/* Center: Canh giữa nội dung Chuyên trang kết quả... và Menu 5 nút ở dưới */}
          <div className="flex flex-col items-center justify-center text-center lg:col-span-4">
            <Link
              href="/"
              onClick={handleGoHome}
              className="group block cursor-pointer transition-opacity hover:opacity-90"
            >
              <div className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wide text-foreground/80">
                CHUYÊN TRANG KẾT QUẢ XỔ SỐ KIẾN THIẾT
              </div>
              <div className="mt-0.5 text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-[#a80808] dark:text-red-400 group-hover:underline">
                MINH LUÂN
              </div>
            </Link>

            {/* Menu 5 nút ở dưới canh giữa — luôn điều hướng thẳng sang /ket-qua-xo-so/ theo vùng miền */}
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1">
              {[
                { id: 'all', label: 'Home', href: '/' },
                { id: 'south', label: 'Miền Nam', href: '/ket-qua-xo-so/mien-nam' },
                { id: 'central', label: 'Miền Trung', href: '/ket-qua-xo-so/mien-trung' },
                { id: 'north', label: 'Miền Bắc', href: '/ket-qua-xo-so/mien-bac' },
                { id: 'vietlott', label: 'Vietlott', href: '/ket-qua-xo-so/vietlott' },
              ].map((tab) => {
                const isActive =
                  tab.href === '/'
                    ? pathname === '/'
                    : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`rounded-t-md border px-2.5 py-1 text-xs font-bold transition-colors ${
                      isActive
                        ? 'border-red-600 bg-red-600 text-white shadow-2xs'
                        : 'border-border bg-muted/60 text-foreground hover:bg-muted'
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* #2: Khung Dò vé số Online - Cân đối chiều dài & chiều cao đồng đều với Logo bên trái */}
          <div className="flex items-center lg:col-span-4">
            <div className="flex min-h-[104px] sm:min-h-[116px] w-full flex-col justify-between overflow-hidden rounded-lg border-2 border-amber-500 bg-card shadow-xs">
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 px-3 py-1.5 text-center text-xs font-black text-black">
                Dò vé số Online - Kết quả liền tay
              </div>
              <form onSubmit={handleInlineCheck} className="flex flex-1 flex-col justify-center space-y-2 p-2.5 text-xs">
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="flex items-center gap-1">
                    <label htmlFor="header-date-input" className="shrink-0 font-semibold text-muted-foreground text-[11px] cursor-pointer">
                      Ngày:
                    </label>
                    <input
                      id="header-date-input"
                      type="date"
                      max={todayIso}
                      value={selectedDateIso}
                      onChange={handleDateChange}
                      className="w-full rounded border border-input bg-background px-1 py-0.5 text-[11px] font-mono font-bold text-foreground outline-none focus:border-red-500 cursor-pointer shadow-2xs"
                      title="Bấm để chọn ngày quay thưởng"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <label htmlFor="header-prov-select" className="shrink-0 font-semibold text-muted-foreground text-[11px] cursor-pointer">
                      Tỉnh:
                    </label>
                    <select
                      id="header-prov-select"
                      value={selectedProvId}
                      onChange={(e) => setSelectedProvId(e.target.value)}
                      className="w-full rounded border border-input bg-background px-1 py-0.5 text-[11px] font-semibold text-foreground outline-none focus:border-red-500 cursor-pointer shadow-2xs"
                    >
                      <option value="">Chọn tỉnh</option>
                      {effectiveProvinces.map((p) => (
                        <option key={p.provinceId} value={p.provinceId}>
                          {p.provinceName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="shrink-0 font-semibold text-muted-foreground text-[11px]">Vé Số:</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Nhập 6 số vé..."
                    value={ticketNum}
                    onChange={(e) => setTicketNum(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="flex-1 rounded border border-input bg-background px-2 py-1 font-mono text-xs font-black tracking-widest outline-none focus:border-red-500"
                  />
                  <button
                    type="submit"
                    disabled={isCheckingTicket}
                    className="shrink-0 rounded-full bg-gradient-to-b from-[#c81010] to-[#990000] px-3.5 py-1 text-[11px] font-extrabold text-white shadow-xs hover:from-[#dc1414] hover:to-[#b30000] disabled:opacity-60 transition-all"
                  >
                    {isCheckingTicket ? 'Đang dò...' : 'Dò Kết Quả'}
                  </button>
                </div>

                {checkResult && (
                  <div
                    className={`flex items-start justify-between gap-2 rounded-md border px-2 py-1.5 text-[11px] ${
                      checkResult.isWinner
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200'
                    }`}
                  >
                    <div className="flex-1">
                      {checkResult.isWinner ? (
                        <div className="space-y-0.5 text-center">
                          <div className="flex items-center justify-center gap-1 font-bold">
                            <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                            <span>
                              {checkResult.prizeName === 'Giải Phụ Đặc Biệt'
                                ? 'Trúng giải phụ Đặc Biệt.'
                                : checkResult.details}
                            </span>
                          </div>
                          {checkResult.rewardAmount && (
                            <div className="text-center text-xs font-black text-red-600 dark:text-red-400">
                              Trị giá {checkResult.rewardAmount.replace(/\s+đ$/, 'đ')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <XCircle className="size-3.5 shrink-0 text-amber-600" />
                          <span className="font-bold">{checkResult.details}</span>
                        </div>
                      )}
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
            {mainNavLinks.map((item) => {
              const isCurrent =
                item.href === '/'
                  ? pathname === '/'
                  : !item.href.startsWith('/#') && pathname.startsWith(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={item.href === '/' ? handleGoHome : undefined}
                  className={`px-3 py-2.5 text-[11px] font-black uppercase tracking-wide transition-colors hover:bg-black/20 ${
                    isCurrent
                      ? 'bg-black/30 text-amber-300 underline decoration-amber-300 underline-offset-4'
                      : item.highlight
                      ? 'text-amber-300'
                      : 'text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
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
                  onClick={() => {
                    if (item.href === '/') handleGoHome();
                    setMobileMenuOpen(false);
                  }}
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

