'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Radio, Clock, Check } from 'lucide-react';
import { SiteFrame } from '@/components/site/site-frame';
import { RegionLotteryBoard } from '@/components/lottery/region-lottery-board';
import { PreDrawScheduleCard } from '@/components/lottery/pre-draw-schedule-card';
import { LotteryBoardSkeleton } from '@/components/lottery/lottery-board-skeleton';
import { getFallbackLotteryResults } from '@/lib/fallback-lottery-data';
import { formatDate } from '@/lib/format';
import {
  getDisplayStatusBadge,
  getRegionDrawStatus,
  isAnyRegionLiveOrUpcoming,
  REGION_DRAW_WINDOWS,
} from '@/lib/draw-schedule-status';
import { DayLotteryData, Region } from '@/types/lottery';

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseRegionParam(raw: string | null): Region {
  if (raw === 'mien-trung' || raw === 'central' || raw === 'xsmt') return 'central';
  if (raw === 'mien-bac' || raw === 'north' || raw === 'xsmb') return 'north';
  if (raw === 'mien-nam' || raw === 'south' || raw === 'xsmn') return 'south';
  // Tự động ưu tiên miền đang ở trạng thái Đang sổ nếu không truyền ?mien=
  const now = new Date();
  if (getRegionDrawStatus('south', now, now) === 'live') return 'south';
  if (getRegionDrawStatus('central', now, now) === 'live') return 'central';
  if (getRegionDrawStatus('north', now, now) === 'live') return 'north';
  return 'south';
}

function TrucTiepContent() {
  const searchParams = useSearchParams();
  const mienParam = searchParams.get('mien');
  const [selectedRegion, setSelectedRegion] = useState<Region>(() => parseRegionParam(mienParam));
  const [todayDate] = useState<Date>(() => new Date());
  const [clockNow, setClockNow] = useState<Date>(() => new Date());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFallbackToLatest, setIsFallbackToLatest] = useState<boolean>(false);
  const [lotteryData, setLotteryData] = useState<DayLotteryData>(() =>
    getFallbackLotteryResults(new Date())
  );

  // Đồng bộ khi URL query ?mien=mien-nam|mien-trung|mien-bac thay đổi (VD bấm từ Header hoặc Sidebar)
  useEffect(() => {
    if (mienParam) {
      setSelectedRegion(parseRegionParam(mienParam));
    }
  }, [mienParam]);

  useEffect(() => {
    const timer = setInterval(() => setClockNow(new Date()), 10_000);
    return () => clearInterval(timer);
  }, []);

  const loadTodayDraws = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      try {
        const fetchOpts: RequestInit = isAnyRegionLiveOrUpcoming(new Date())
          ? { cache: 'no-store' }
          : {};
        const res = await fetch(`/api/xoso/draws?date=${toIsoDate(todayDate)}`, fetchOpts);
        if (res.ok) {
          const json = await res.json();
          if (json?.data) {
            setLotteryData(json.data);
            setIsFallbackToLatest(Boolean(json.isFallbackToLatestAvailable));
            return;
          }
        }
        if (!silent) {
          setLotteryData(getFallbackLotteryResults(todayDate));
        }
      } catch {
        if (!silent) {
          setLotteryData(getFallbackLotteryResults(todayDate));
        }
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [todayDate]
  );

  useEffect(() => {
    loadTodayDraws(false);
  }, [loadTodayDraws]);

  // Chỉ tự động polling ngầm trong khung giờ quay thưởng trực tiếp (15s khi tab đang hiển thị);
  // ngoài giờ xổ tắt hoàn toàn polling để tránh tốn lượt gọi API không cần thiết
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && isAnyRegionLiveOrUpcoming(new Date())) {
        loadTodayDraws(true);
      }
    }, 15_000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isAnyRegionLiveOrUpcoming(new Date())) {
        loadTodayDraws(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loadTodayDraws]);

  const handleSelectRegion = (reg: Region) => {
    setSelectedRegion(reg);
    if (typeof window !== 'undefined') {
      const slug = reg === 'south' ? 'mien-nam' : reg === 'central' ? 'mien-trung' : 'mien-bac';
      const url = new URL(window.location.href);
      url.searchParams.set('mien', slug);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const regionConfig = useMemo(() => {
    if (selectedRegion === 'south') {
      return {
        id: 'xsmn-truc-tiep',
        title: `TRỰC TIẾP XỔ SỐ MIỀN NAM - ${lotteryData.formattedDate}`,
        regionCode: '18 Giải',
        drawTime: '16:15',
        results: lotteryData.south,
      };
    }
    if (selectedRegion === 'central') {
      return {
        id: 'xsmt-truc-tiep',
        title: `TRỰC TIẾP XỔ SỐ MIỀN TRUNG - ${lotteryData.formattedDate}`,
        regionCode: '18 Giải',
        drawTime: '17:15',
        results: lotteryData.central,
      };
    }
    return {
      id: 'xsmb-truc-tiep',
      title: `TRỰC TIẾP XỔ SỐ MIỀN BẮC - ${lotteryData.formattedDate}`,
      regionCode: '27 Giải',
      drawTime: '18:15',
      results: lotteryData.north,
    };
  }, [selectedRegion, lotteryData]);

  const phase = getRegionDrawStatus(selectedRegion, todayDate, clockNow);
  const badge = getDisplayStatusBadge(phase);
  const todayFormatted = formatDate(todayDate);

  return (
    <SiteFrame>
      <div className="mx-auto max-w-4xl space-y-5">
        {/* Thanh chọn miền trực tiếp chuẩn Minh Ngọc — chỉ hiển thị đúng 1 miền ngày hôm nay */}
        <div className="rounded-2xl border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                <Radio className="size-4 animate-pulse" />
                Tường Thuật Trực Tiếp Xổ Số
              </div>
              <h1 className="mt-1 text-xl sm:text-2xl font-black text-foreground">
                Xổ Số Trực Tiếp {REGION_DRAW_WINDOWS[selectedRegion].label} · {todayFormatted}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {badge.tone === 'live' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white animate-pulse">
                  <span>■</span> Đang sổ
                </span>
              ) : badge.tone === 'done' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/15 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-400">
                  <Check className="size-3.5 stroke-[3]" /> Mới
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Clock className="size-3.5" /> Chờ ({REGION_DRAW_WINDOWS[selectedRegion].drawTimeLabel})
                </span>
              )}
            </div>
          </div>

          {/* 3 Nút chọn Miền Nam / Miền Trung / Miền Bắc */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(
              [
                { id: 'south', label: 'Miền Nam', time: '16h15' },
                { id: 'central', label: 'Miền Trung', time: '17h15' },
                { id: 'north', label: 'Miền Bắc', time: '18h15' },
              ] as const
            ).map((reg) => {
              const active = selectedRegion === reg.id;
              const regPhase = getRegionDrawStatus(reg.id, todayDate, clockNow);
              const regBadge = getDisplayStatusBadge(regPhase);
              return (
                <button
                  key={reg.id}
                  type="button"
                  onClick={() => handleSelectRegion(reg.id)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-xl border px-3 py-2.5 text-xs sm:text-sm font-black transition-all ${
                    active
                      ? 'border-red-600 bg-red-600 text-white shadow-sm'
                      : 'border-border bg-muted/40 text-foreground hover:bg-muted'
                  }`}
                >
                  <span>{reg.label}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      active
                        ? 'bg-white/20 text-white'
                        : regBadge.tone === 'live'
                        ? 'bg-red-600 text-white animate-pulse'
                        : regBadge.tone === 'done'
                        ? 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-400'
                        : 'bg-background text-muted-foreground'
                    }`}
                  >
                    {regBadge.label} · {reg.time}
                  </span>
                </button>
              );
            })}
          </div>

          {isFallbackToLatest && phase === 'waiting' && (
            <div className="mt-3 rounded-lg border border-blue-200/70 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/30 px-3 py-1.5 text-center text-xs font-semibold text-blue-700 dark:text-blue-300">
              Chưa tới giờ mở thưởng hôm nay ({todayFormatted}) — đang hiển thị kết quả kỳ gần nhất ({lotteryData.formattedDate}) của {REGION_DRAW_WINDOWS[selectedRegion].label}.
            </div>
          )}
        </div>

        {/* Chỉ hiển thị duy nhất bảng kết quả ngày hôm đó của miền đang chọn */}
        {isLoading ? (
          <LotteryBoardSkeleton count={1} />
        ) : phase === 'upcoming' ? (
          <PreDrawScheduleCard
            id={regionConfig.id}
            region={selectedRegion}
            date={todayDate}
            formattedDate={todayFormatted}
          />
        ) : (
          <RegionLotteryBoard
            id={regionConfig.id}
            title={regionConfig.title}
            regionCode={regionConfig.regionCode}
            drawTime={regionConfig.drawTime}
            dateStr={phase === 'live' ? todayFormatted : lotteryData.formattedDate}
            results={regionConfig.results}
            isLive={phase === 'live'}
          />
        )}
      </div>
    </SiteFrame>
  );
}

export default function TrucTiepPage() {
  return (
    <Suspense
      fallback={
        <SiteFrame>
          <div className="mx-auto max-w-4xl">
            <LotteryBoardSkeleton count={1} />
          </div>
        </SiteFrame>
      }
    >
      <TrucTiepContent />
    </Suspense>
  );
}
