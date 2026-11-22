'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SiteFrame } from '@/components/site/site-frame';
import { PROVINCES } from '@/config/lottery-provinces';
import { ApiDataSourceBanner } from '@/components/lottery/lottery-board-skeleton';
import { BarChart3, Flame, Search, Snowflake } from 'lucide-react';
import { FrequencyStatItem } from '@/lib/services/xosoApi';

export default function TanSuatPage() {
  // State trên form nhập (chờ bấm "Xem thống kê")
  const [formProvinceId, setFormProvinceId] = useState('tphcm');
  const [formPeriodsInput, setFormPeriodsInput] = useState('5');
  const [formSearchMode, setFormSearchMode] = useState<'all' | 'head-tail' | 'special'>('all');

  // State đang áp dụng hiển thị kết quả (mặc định 5 kỳ)
  const [appliedProvinceId, setAppliedProvinceId] = useState('tphcm');
  const [appliedPeriods, setAppliedPeriods] = useState<number>(5);
  const [appliedMode, setAppliedMode] = useState<'all' | 'head-tail' | 'special'>('all');

  const [sortBy, setSortBy] = useState<'count-desc' | 'count-asc' | 'num-asc'>('count-desc');
  const [rawFreqList, setRawFreqList] = useState<FrequencyStatItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiMeta, setApiMeta] = useState<{
    source: 'xosoapi.online' | 'fallback';
    warning?: string;
    isLiveWindow?: boolean;
    revalidateSeconds?: number;
  }>({ source: 'xosoapi.online', revalidateSeconds: 3600 });

  // Nhóm danh sách đài theo Vùng Miền (<optgroup label="Miền Nam / Miền Bắc / Miền Trung">)
  const groupedProvinces = useMemo(() => {
    const south = PROVINCES.filter((p) => p.region === 'south').sort((a, b) =>
      a.name.localeCompare(b.name, 'vi')
    );
    const north = PROVINCES.filter((p) => p.region === 'north').sort((a, b) =>
      a.name.localeCompare(b.name, 'vi')
    );
    const central = PROVINCES.filter((p) => p.region === 'central').sort((a, b) =>
      a.name.localeCompare(b.name, 'vi')
    );
    return { south, north, central };
  }, []);

  const selectedProvince =
    PROVINCES.find((p) => p.id === appliedProvinceId) || PROVINCES[0];

  const loadFrequency = useCallback(
    async (provId: string, periods: number, mode: 'all' | 'head-tail' | 'special') => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/xoso/stats?type=frequency&province=${encodeURIComponent(provId)}&limit=${periods}&mode=${mode}`
        );
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json?.data)) {
            setRawFreqList(json.data);
            setApiMeta({
              source: json.source || 'fallback',
              warning: json.warning,
              isLiveWindow: json.isLiveWindow,
              revalidateSeconds: json.revalidateSeconds,
            });
          }
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadFrequency(appliedProvinceId, appliedPeriods, appliedMode);
  }, [appliedProvinceId, appliedPeriods, appliedMode, loadFrequency]);

  const handleSubmitStats = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPeriods = Math.min(Math.max(parseInt(formPeriodsInput, 10) || 5, 1), 100);
    setFormPeriodsInput(String(parsedPeriods));
    setAppliedProvinceId(formProvinceId);
    setAppliedPeriods(parsedPeriods);
    setAppliedMode(formSearchMode);
  };

  const frequencyList = useMemo(() => {
    if (sortBy === 'count-desc') return [...rawFreqList].sort((a, b) => b.count - a.count);
    if (sortBy === 'count-asc') return [...rawFreqList].sort((a, b) => a.count - b.count);
    return [...rawFreqList].sort((a, b) => parseInt(a.number, 10) - parseInt(b.number, 10));
  }, [rawFreqList, sortBy]);

  const topHot = useMemo(
    () => [...rawFreqList].sort((a, b) => b.count - a.count).slice(0, 10),
    [rawFreqList]
  );
  const topCold = useMemo(
    () => [...rawFreqList].sort((a, b) => a.count - b.count).slice(0, 10),
    [rawFreqList]
  );

  const hotThreshold = Math.max(2, Math.ceil(appliedPeriods * 0.25));
  const coldThreshold = Math.floor(appliedPeriods * 0.05);

  return (
    <SiteFrame>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-red-600 dark:text-red-400">
            <BarChart3 className="size-4" />
            Thống Kê Xác Suất
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Tần Suất Xuất Hiện Lô Tô {appliedPeriods} Kỳ
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-muted-foreground">
            Thống kê chi tiết số lần nổ của 100 cặp số (00 - 99) đài{' '}
            <strong className="text-foreground">{selectedProvince.name}</strong> trong{' '}
            <strong className="text-foreground">{appliedPeriods} lần quay</strong> gần nhất (
            {appliedMode === 'all'
              ? 'Theo Lô tất cả giải'
              : appliedMode === 'head-tail'
              ? 'Theo Đầu Đuôi'
              : 'Theo Giải Đặc Biệt'}
            ).
          </p>
        </div>

        {/* Controls Form: Chọn Tỉnh/TP (có label vùng miền), Nhập Số kỳ (default 5), Chế độ tra cứu & Nút Xem thống kê */}
        <div className="flex flex-col items-start lg:items-end gap-2.5">
          <form
            onSubmit={handleSubmitStats}
            className="flex flex-wrap items-center gap-2 rounded-2xl border bg-card p-2.5 shadow-xs"
          >
            {/* Dropdown Tỉnh/TP có <optgroup> Vùng Miền */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="tinh-select" className="text-xs font-bold text-muted-foreground whitespace-nowrap">
                Tỉnh / TP:
              </label>
              <select
                id="tinh-select"
                value={formProvinceId}
                onChange={(e) => setFormProvinceId(e.target.value)}
                className="rounded-xl border bg-background px-2.5 py-1.5 text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-red-500"
              >
                <optgroup label="Miền Nam">
                  {groupedProvinces.south.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Miền Bắc">
                  {groupedProvinces.north.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Miền Trung">
                  {groupedProvinces.central.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Ô nhập Số lần quay (Số kỳ) - Mặc định 5 kỳ */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="periods-input" className="text-xs font-bold text-muted-foreground whitespace-nowrap">
                Số lần quay:
              </label>
              <input
                id="periods-input"
                type="number"
                min={1}
                max={100}
                value={formPeriodsInput}
                onChange={(e) => setFormPeriodsInput(e.target.value.replace(/\D/g, ''))}
                className="w-16 rounded-xl border bg-background px-2.5 py-1.5 text-center font-mono text-xs font-extrabold text-foreground outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Radio chế độ Tra cứu giống Minh Ngọc (Theo Lô | Đầu Đuôi | Đặc Biệt) */}
            <div className="flex items-center gap-2.5 rounded-xl border bg-background px-2.5 py-1.5 text-xs font-semibold">
              {[
                { id: 'all', label: 'Theo Lô' },
                { id: 'head-tail', label: 'Đầu Đuôi' },
                { id: 'special', label: 'Đặc Biệt' },
              ].map((m) => (
                <label key={m.id} className="flex items-center gap-1 cursor-pointer whitespace-nowrap">
                  <input
                    type="radio"
                    name="freqSearchMode"
                    checked={formSearchMode === m.id}
                    onChange={() => setFormSearchMode(m.id as 'all' | 'head-tail' | 'special')}
                    className="accent-red-600"
                  />
                  <span className={formSearchMode === m.id ? 'font-extrabold text-red-600 dark:text-red-400' : ''}>
                    {m.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Nút Xem thống kê */}
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#b80c0c] px-3.5 py-1.5 text-xs font-extrabold text-white shadow-xs transition-all hover:bg-[#990000] disabled:opacity-50"
            >
              <Search className="size-3.5" />
              Xem thống kê
            </button>
          </form>

          {/* Bộ nút sắp xếp kết quả */}
          <div className="inline-flex rounded-xl border bg-card p-0.5 text-xs font-semibold shadow-xs">
            <button
              type="button"
              onClick={() => setSortBy('count-desc')}
              className={`rounded-lg px-2.5 py-1.5 transition-all ${
                sortBy === 'count-desc' ? 'bg-red-600 text-white font-bold' : 'hover:bg-muted text-foreground'
              }`}
            >
              Về nhiều nhất
            </button>
            <button
              type="button"
              onClick={() => setSortBy('count-asc')}
              className={`rounded-lg px-2.5 py-1.5 transition-all ${
                sortBy === 'count-asc' ? 'bg-red-600 text-white font-bold' : 'hover:bg-muted text-foreground'
              }`}
            >
              Về ít nhất
            </button>
            <button
              type="button"
              onClick={() => setSortBy('num-asc')}
              className={`rounded-lg px-2.5 py-1.5 transition-all ${
                sortBy === 'num-asc' ? 'bg-red-600 text-white font-bold' : 'hover:bg-muted text-foreground'
              }`}
            >
              Số 00 - 99
            </button>
          </div>
        </div>
      </div>

      <ApiDataSourceBanner
        source={apiMeta.source}
        warning={apiMeta.warning}
        isLiveWindow={apiMeta.isLiveWindow}
        revalidateSeconds={apiMeta.revalidateSeconds}
        isLoading={isLoading}
        onRefresh={() => loadFrequency(appliedProvinceId, appliedPeriods, appliedMode)}
      />

      {/* Top Hot & Top Cold Highlights */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
              <Flame className="size-4" />
            </span>
            <h3 className="font-extrabold text-sm text-foreground">
              Top 10 Bộ Số Về Nhiều Nhất ({appliedPeriods} kỳ)
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {topHot.map((item) => (
              <div
                key={item.number}
                className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/50 px-2.5 py-1 text-xs dark:border-red-900 dark:bg-red-950/30"
              >
                <span className="font-mono text-sm font-extrabold text-red-600 dark:text-red-400">
                  {item.number}
                </span>
                <span className="rounded bg-red-600 px-1 text-[10px] font-bold text-white">
                  {item.count} lần
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Snowflake className="size-4" />
            </span>
            <h3 className="font-extrabold text-sm text-foreground">
              Top 10 Bộ Số Về Ít Nhất ({appliedPeriods} kỳ)
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {topCold.map((item) => (
              <div
                key={item.number}
                className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/50 px-2.5 py-1 text-xs dark:border-blue-900 dark:bg-blue-950/30"
              >
                <span className="font-mono text-sm font-extrabold text-blue-600 dark:text-blue-400">
                  {item.number}
                </span>
                <span className="rounded bg-blue-600 px-1 text-[10px] font-bold text-white">
                  {item.count} lần
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ma Trận 100 Cặp Số */}
      <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-sm">
        <h3 className="mb-4 font-extrabold text-sm text-foreground">
          Ma Trận Tần Suất Đầy Đủ 100 Bộ Số (00 - 99) — Đài {selectedProvince.name} ({appliedPeriods} kỳ)
        </h3>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2">
            {Array.from({ length: 40 }, (_, idx) => (
              <div key={idx} className="h-14 rounded-xl border bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2">
            {frequencyList.map((item) => {
              const isHot = item.count >= hotThreshold;
              const isCold = item.count <= coldThreshold;
              return (
                <div
                  key={item.number}
                  className={`rounded-xl border p-2 text-center transition-all hover:scale-105 ${
                    isHot
                      ? 'border-red-500 bg-red-50/60 dark:bg-red-950/30'
                      : isCold
                      ? 'border-blue-300 bg-blue-50/40 dark:bg-blue-950/20'
                      : 'bg-muted/30'
                  }`}
                >
                  <span
                    className={`block font-mono text-base font-extrabold ${
                      isHot
                        ? 'text-red-600 dark:text-red-400'
                        : isCold
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-foreground'
                    }`}
                  >
                    {item.number}
                  </span>
                  <span className="block text-[11px] font-bold text-muted-foreground mt-0.5">
                    {item.count} lần ({item.percent}%)
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SiteFrame>
  );
}
