'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import { getLotteryResults } from '@/lib/mock-lottery-data';
import { RegionLotteryBoard } from '@/components/lottery/region-lottery-board';
import { AiLotoSummaryWidget } from '@/components/lottery/ai-loto-summary-widget';
import { LiveCountdownBanner } from '@/components/lottery/live-countdown-banner';
import { WeeklyScheduleMatrix } from '@/components/lottery/weekly-schedule-matrix';
import { TicketCheckerModal } from '@/components/lottery/ticket-checker-modal';
import { VietlottKenoWidget } from '@/components/lottery/vietlott-keno-widget';
import { MinhLuanHeader } from '@/components/minhluan/minhluan-header';
import { RotatingPromoBanner } from '@/components/minhluan/rotating-promo-banner';
import { Stats3ColTable } from '@/components/minhluan/stats-3col-table';
import { LeftSidebar, RightSidebar } from '@/components/minhluan/sidebars';
import { SiteFooter } from '@/components/site/site-footer';
import { audioSynth } from '@/lib/audio-synthesizer';
import { formatDate } from '@/lib/format';

export default function Page() {
  const [dark, setDark] = useState(false);
  const [checkerOpen, setCheckerOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeDate, setActiveDate] = useState<Date>(() => new Date());
  const [priorityRegion, setPriorityRegion] = useState<'south' | 'north' | 'central'>('south');
  const [activeRegionTab, setActiveRegionTab] = useState<'all' | 'south' | 'central' | 'north' | 'vietlott'>('all');
  const [showYesterdayFull, setShowYesterdayFull] = useState(true);

  // Dữ liệu ngày đang chọn (mặc định Hôm nay)
  const lotteryData = useMemo(() => getLotteryResults(activeDate), [activeDate]);

  // Dữ liệu ngày trước đó (Hôm qua so với ngày đang chọn)
  const prevDate = useMemo(() => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() - 1);
    return d;
  }, [activeDate]);
  const prevLotteryData = useMemo(() => getLotteryResults(prevDate), [prevDate]);

  const allProvinces = useMemo(
    () => [...lotteryData.south, ...lotteryData.central, ...lotteryData.north],
    [lotteryData]
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem('minhluan_theme');
      const isDark = saved === 'dark';
      setDark(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    } catch {
      // ignore
    }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    try {
      localStorage.setItem('minhluan_theme', next ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', next);
    } catch {
      // ignore
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

  const handleSelectRegionTab = (tab: 'all' | 'south' | 'central' | 'north' | 'vietlott') => {
    setActiveRegionTab(tab);
    if (tab === 'south' || tab === 'central' || tab === 'north') {
      setPriorityRegion(tab);
    }
  };

  const isToday = useMemo(() => {
    const now = new Date();
    return (
      activeDate.getFullYear() === now.getFullYear() &&
      activeDate.getMonth() === now.getMonth() &&
      activeDate.getDate() === now.getDate()
    );
  }, [activeDate]);

  // Sắp xếp thứ tự 3 miền theo miền ưu tiên
  const orderedRegions = useMemo(() => {
    const items = [
      {
        key: 'south' as const,
        id: 'xsmn',
        title: `KẾT QUẢ XỔ SỐ MIỀN NAM - ${lotteryData.formattedDate}`,
        regionCode: '18 Giải',
        drawTime: '16:15',
        results: lotteryData.south,
      },
      {
        key: 'central' as const,
        id: 'xsmt',
        title: `KẾT QUẢ XỔ SỐ MIỀN TRUNG - ${lotteryData.formattedDate}`,
        regionCode: '18 Giải',
        drawTime: '17:15',
        results: lotteryData.central,
      },
      {
        key: 'north' as const,
        id: 'xsmb',
        title: `KẾT QUẢ XỔ SỐ MIỀN BẮC - ${lotteryData.formattedDate}`,
        regionCode: '27 Giải',
        drawTime: '18:15',
        results: lotteryData.north,
      },
    ];

    if (activeRegionTab === 'south' || activeRegionTab === 'central' || activeRegionTab === 'north') {
      return items.filter((item) => item.key === activeRegionTab);
    }

    const prioritized = items.find((i) => i.key === priorityRegion);
    const others = items.filter((i) => i.key !== priorityRegion);
    return prioritized ? [prioritized, ...others] : items;
  }, [lotteryData, priorityRegion, activeRegionTab]);

  const activeDateFormatted = formatDate(activeDate);
  const dateSlug = `${activeDate.getFullYear()}${String(activeDate.getMonth() + 1).padStart(2, '0')}${String(activeDate.getDate()).padStart(2, '0')}`;

  return (
    <div id="top" className={`min-h-screen bg-background text-foreground ${dark ? 'dark' : ''}`}>
      {/* Header chuẩn Minh Ngọc / Minh Luân (#1, #2, #3 + Red Nav Bar) */}
      <MinhLuanHeader
        activeDateStr={activeDateFormatted}
        allProvinces={allProvinces}
        activeRegionTab={activeRegionTab}
        onSelectRegionTab={handleSelectRegionTab}
        dark={dark}
        onToggleDark={toggleDark}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onOpenCheckerModal={() => setCheckerOpen(true)}
      />

      {/* Main 3-Column Minh Ngọc Layout */}
      <main className="mx-auto max-w-[1260px] px-2.5 py-4 lg:px-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[215px_minmax(0,1fr)_235px]">
          {/* CỘT TRÁI (#4, #7, #8 & Section 2 #1, #2, #3) */}
          <div className="order-2 lg:order-1">
            <LeftSidebar
              activeDate={activeDate}
              onSelectDate={(d) => setActiveDate(d)}
              lotteryData={lotteryData}
            />
          </div>

          {/* CỘT GIỮA (#9 ở vị trí #5 -> #10 KQXS Hôm nay & Hôm qua -> #5 Bảng Thống Kê 3 Cột) */}
          <div className="order-1 lg:order-2 min-w-0">
            {/* #9 ĐẶT Ở VỊ TRÍ SỐ 5: Banner thay đổi 2 dòng chữ MUA VÉ SỐ ONLINE <-> ĐĂNG KÝ THÀNH VIÊN NGAY */}
            <RotatingPromoBanner />

            {/* Live Countdown Bar gọn gàng */}
            <LiveCountdownBanner />

            {/* #10 MOVE LÊN NGAY DƯỚI #9: Tiêu đề KQXS & Bộ chọn miền ưu tiên */}
            <div id="kqxs-hom-nay" className="mb-4 rounded-xl border bg-card p-3.5 text-center shadow-2xs">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground">
                KẾT QUẢ XỔ SỐ KIẾN THIẾT {lotteryData.formattedDate}
              </h1>

              {/* Chọn miền ưu tiên (giống Minh Ngọc) */}
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-bold">
                <span className="text-muted-foreground">Chọn miền ưu tiên:</span>
                {[
                  { id: 'south', label: 'Miền Nam' },
                  { id: 'north', label: 'Miền Bắc' },
                  { id: 'central', label: 'Miền Trung' },
                ].map((reg) => (
                  <label key={reg.id} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="priorityRegion"
                      checked={priorityRegion === reg.id}
                      onChange={() => {
                        setPriorityRegion(reg.id as any);
                        setActiveRegionTab('all');
                      }}
                      className="accent-red-600"
                    />
                    <span className={priorityRegion === reg.id ? 'text-red-600 dark:text-red-400 font-extrabold' : ''}>
                      {reg.label}
                    </span>
                  </label>
                ))}
              </div>

              {/* Nút chuyển nhanh Hôm nay / Hôm qua */}
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveDate(new Date())}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition-all ${
                    isToday
                      ? 'bg-[#b80c0c] text-white shadow-xs'
                      : 'border bg-muted/50 text-foreground hover:bg-muted'
                  }`}
                >
                  <span className={`size-2 rounded-full ${isToday ? 'bg-amber-300 animate-pulse' : 'bg-red-500'}`} />
                  Hôm nay ({formatDate(new Date())})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const y = new Date();
                    y.setDate(y.getDate() - 1);
                    setActiveDate(y);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition-all ${
                    !isToday
                      ? 'bg-[#b80c0c] text-white shadow-xs'
                      : 'border bg-muted/50 text-foreground hover:bg-muted'
                  }`}
                >
                  <CalendarDays className="size-3.5" />
                  Hôm qua ({prevLotteryData.formattedDate})
                </button>
              </div>

              {/* Dòng trạng thái xanh chuẩn Minh Ngọc */}
              <div className="mt-2.5 flex items-center justify-center gap-1.5 rounded-md border border-blue-200/70 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/30 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
                <Check className="size-4 text-emerald-600 stroke-[3]" />
                <span>
                  Xổ Số {isToday ? 'hôm nay' : `ngày ${lotteryData.formattedDate}`} đã cập nhật »{' '}
                  <Link href={`/ngay/${dateSlug}`} className="underline hover:text-red-600">
                    Xem thêm trang kết quả xổ số theo ngày!...
                  </Link>
                </span>
              </div>
            </div>

            {/* BẢNG KẾT QUẢ XỔ SỐ NGÀY HÔM NAY (3 MIỀN) */}
            {activeRegionTab !== 'vietlott' && (
              <div className="flex flex-col gap-6">
                {orderedRegions.map((board) => (
                  <RegionLotteryBoard
                    key={board.id}
                    id={board.id}
                    title={board.title}
                    regionCode={board.regionCode}
                    drawTime={board.drawTime}
                    dateStr={lotteryData.formattedDate}
                    results={board.results}
                  />
                ))}
              </div>
            )}

            {/* KHỐI HIỂN THỊ KẾT QUẢ XỔ SỐ NGÀY TRƯỚC ĐÓ (HÔM QUA) */}
            {activeRegionTab !== 'vietlott' && (
              <section className="mt-8 overflow-hidden rounded-xl border-2 border-amber-500/40 bg-card shadow-sm">
                <button
                  type="button"
                  onClick={() => setShowYesterdayFull((v) => !v)}
                  className="flex w-full items-center justify-between gap-2 bg-gradient-to-r from-amber-500/15 via-red-500/10 to-amber-500/15 px-4 py-3 text-left transition-colors hover:bg-amber-500/20"
                >
                  <div className="flex items-center gap-2">
                    <CalendarDays className="size-5 text-red-600" />
                    <div>
                      <h2 className="text-sm sm:text-base font-black uppercase text-foreground">
                        KẾT QUẢ XỔ SỐ NGÀY TRƯỚC ĐÓ ({prevLotteryData.formattedDate})
                      </h2>
                      <p className="text-[11px] text-muted-foreground">
                        Đầy đủ 3 miền Nam · Trung · Bắc ngày hôm qua để bạn đối chiếu nhanh
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-lg border bg-background px-2.5 py-1 text-xs font-bold">
                    {showYesterdayFull ? (
                      <>
                        Thu gọn <ChevronUp className="size-4" />
                      </>
                    ) : (
                      <>
                        Mở xem <ChevronDown className="size-4" />
                      </>
                    )}
                  </span>
                </button>

                {showYesterdayFull && (
                  <div className="space-y-6 p-3 sm:p-4">
                    <RegionLotteryBoard
                      id="xsmn-yesterday"
                      title={`XSMN Hôm Qua — ${prevLotteryData.formattedDate}`}
                      regionCode="18 Giải"
                      drawTime="16:15"
                      dateStr={prevLotteryData.formattedDate}
                      results={prevLotteryData.south}
                    />
                    <RegionLotteryBoard
                      id="xsmt-yesterday"
                      title={`XSMT Hôm Qua — ${prevLotteryData.formattedDate}`}
                      regionCode="18 Giải"
                      drawTime="17:15"
                      dateStr={prevLotteryData.formattedDate}
                      results={prevLotteryData.central}
                    />
                    <RegionLotteryBoard
                      id="xsmb-yesterday"
                      title={`XSMB Hôm Qua — ${prevLotteryData.formattedDate}`}
                      regionCode="27 Giải"
                      drawTime="18:15"
                      dateStr={prevLotteryData.formattedDate}
                      results={prevLotteryData.north}
                    />
                  </div>
                )}
              </section>
            )}

            {/* #5 MOVE XUỐNG DƯỚI: Bảng Thống Kê 3 Cột (ĐÃ BỎ CỘT LỊCH XỔ SỐ + IN ĐẬM TITLE) */}
            <div className="mt-8">
              <Stats3ColTable lotteryData={lotteryData} />
            </div>

            {/* AI Loto Intelligence Hub tổng hợp Tần suất & Gan cực đại */}
            <div className="mt-6">
              <AiLotoSummaryWidget />
            </div>

            {/* Khối Điện toán Vietlott & Keno */}
            <div id="vietlott" className="mt-6">
              <VietlottKenoWidget />
            </div>

            {/* Lịch Mở Thưởng 3 Miền Trong Tuần */}
            <div id="lich-mo-thuong" className="mt-6">
              <WeeklyScheduleMatrix />
            </div>
          </div>

          {/* CỘT PHẢI (#6 Đổi Số Trúng Minh Luân, Section 2 #4 Tin tức, Section 2 #5 YouTube Logo @xosominhluan) */}
          <div className="order-3">
            <RightSidebar />
          </div>
        </div>
      </main>

      {/* Modal Dò Vé Số Nâng Cao */}
      <TicketCheckerModal
        isOpen={checkerOpen}
        onClose={() => setCheckerOpen(false)}
        availableResults={allProvinces}
      />

      {/* Footer 4 Cột Nền Tối Chuẩn Spec (THƯƠNG HIỆU | TRA CỨU NHANH | THÔNG TIN & CHÍNH SÁCH | KẾT NỐI) */}
      <SiteFooter />
    </div>
  );
}
