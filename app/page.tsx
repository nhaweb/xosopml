'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import { getFallbackLotteryResults } from '@/lib/fallback-lottery-data';
import { RegionLotteryBoard } from '@/components/lottery/region-lottery-board';
import { AiLotoSummaryWidget } from '@/components/lottery/ai-loto-summary-widget';
import { LiveCountdownBanner } from '@/components/lottery/live-countdown-banner';
import { WeeklyScheduleMatrix } from '@/components/lottery/weekly-schedule-matrix';
import { TicketCheckerModal } from '@/components/lottery/ticket-checker-modal';
import { VietlottKenoWidget } from '@/components/lottery/vietlott-keno-widget';
import {
  ApiDataSourceBanner,
  LotteryBoardSkeleton,
} from '@/components/lottery/lottery-board-skeleton';
import { MinhLuanHeader } from '@/components/minhluan/minhluan-header';
import { RotatingPromoBanner } from '@/components/minhluan/rotating-promo-banner';
import { Stats3ColTable } from '@/components/minhluan/stats-3col-table';
import { LeftSidebar, RightSidebar } from '@/components/minhluan/sidebars';
import { SiteFooter } from '@/components/site/site-footer';
import { audioSynth } from '@/lib/audio-synthesizer';
import { formatDate } from '@/lib/format';
import { DayLotteryData } from '@/types/lottery';

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function Page() {
  const [dark, setDark] = useState(false);
  const [checkerOpen, setCheckerOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeDate, setActiveDate] = useState<Date>(() => new Date());
  const [priorityRegion, setPriorityRegion] = useState<'south' | 'north' | 'central'>('south');
  const [activeRegionTab, setActiveRegionTab] = useState<'all' | 'south' | 'central' | 'north' | 'vietlott'>('all');
  const [showYesterdayFull, setShowYesterdayFull] = useState(true);

  const prevDate = useMemo(() => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() - 1);
    return d;
  }, [activeDate]);

  // State dữ liệu lấy từ Server API (/api/xoso/draws -> xosoapi.online)
  const [lotteryData, setLotteryData] = useState<DayLotteryData>(() =>
    getFallbackLotteryResults(new Date())
  );
  const [prevLotteryData, setPrevLotteryData] = useState<DayLotteryData>(() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return getFallbackLotteryResults(y);
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiMeta, setApiMeta] = useState<{
    source: 'xosoapi.online' | 'fallback';
    warning?: string;
    isLiveWindow?: boolean;
    revalidateSeconds?: number;
  }>({ source: 'xosoapi.online', revalidateSeconds: 3600 });

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

  const loadDrawsFromServer = useCallback(async (targetDate: Date, yesterdayDate: Date) => {
    setIsLoading(true);
    try {
      const [todayRes, prevRes] = await Promise.all([
        fetch(`/api/xoso/draws?date=${toIsoDate(targetDate)}`),
        fetch(`/api/xoso/draws?date=${toIsoDate(yesterdayDate)}`),
      ]);

      if (todayRes.ok) {
        const todayJson = await todayRes.json();
        if (todayJson?.data) {
          setLotteryData(todayJson.data);
          setApiMeta({
            source: todayJson.source || 'fallback',
            warning: todayJson.warning,
            isLiveWindow: todayJson.isLiveWindow,
            revalidateSeconds: todayJson.revalidateSeconds,
          });
        }
      } else {
        setLotteryData(getFallbackLotteryResults(targetDate));
      }

      if (prevRes.ok) {
        const prevJson = await prevRes.json();
        if (prevJson?.data) {
          setPrevLotteryData(prevJson.data);
        }
      } else {
        setPrevLotteryData(getFallbackLotteryResults(yesterdayDate));
      }
    } catch {
      setLotteryData(getFallbackLotteryResults(targetDate));
      setPrevLotteryData(getFallbackLotteryResults(yesterdayDate));
      setApiMeta({
        source: 'fallback',
        warning: 'Không thể kết nối máy chủ API. Đang hiển thị dữ liệu dự phòng.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrawsFromServer(activeDate, prevDate);
  }, [activeDate, prevDate, loadDrawsFromServer]);

  const allProvinces = useMemo(
    () => [...lotteryData.south, ...lotteryData.central, ...lotteryData.north],
    [lotteryData]
  );

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
      {/* Header chuẩn Minh Luân (#1, #2, #3 + Red Nav Bar) */}
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
          {/* CỘT TRÁI */}
          <div className="order-2 lg:order-1">
            <LeftSidebar
              activeDate={activeDate}
              onSelectDate={(d) => setActiveDate(d)}
              lotteryData={lotteryData}
            />
          </div>

          {/* CỘT GIỮA */}
          <div className="order-1 lg:order-2 min-w-0">
            <RotatingPromoBanner />

            <LiveCountdownBanner />

            {/* Trạng thái kết nối xosoapi.online & Caching */}
            <ApiDataSourceBanner
              source={apiMeta.source}
              warning={apiMeta.warning}
              isLiveWindow={apiMeta.isLiveWindow}
              revalidateSeconds={apiMeta.revalidateSeconds}
              isLoading={isLoading}
              onRefresh={() => loadDrawsFromServer(activeDate, prevDate)}
            />

            {/* #10: Tiêu đề KQXS & Bộ chọn miền ưu tiên */}
            <div id="kqxs-hom-nay" className="mb-4 rounded-xl border bg-card p-3.5 text-center shadow-2xs">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground">
                KẾT QUẢ XỔ SỐ KIẾN THIẾT {lotteryData.formattedDate}
              </h1>

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

            {/* BẢNG KẾT QUẢ XỔ SỐ NGÀY HÔM NAY (3 MIỀN) HOẶC SKELETON LOADING */}
            {activeRegionTab !== 'vietlott' && (
              isLoading ? (
                <LotteryBoardSkeleton count={3} />
              ) : (
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
              )
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
                    {isLoading ? (
                      <LotteryBoardSkeleton count={2} />
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* #5: Bảng Thống Kê 3 Cột */}
            <div className="mt-8">
              <Stats3ColTable lotteryData={lotteryData} />
            </div>

            {/* AI Loto Intelligence Hub */}
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

          {/* CỘT PHẢI */}
          <div className="order-3">
            <RightSidebar />
          </div>
        </div>
      </main>

      <TicketCheckerModal
        isOpen={checkerOpen}
        onClose={() => setCheckerOpen(false)}
        availableResults={allProvinces}
      />

      <SiteFooter />
    </div>
  );
}
