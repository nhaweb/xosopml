'use client';

import React, { useState, useMemo } from 'react';
import { SiteFrame } from '@/components/site/site-frame';
import { PROVINCES } from '@/config/lottery-provinces';
import { BarChart3, Flame, Snowflake, ArrowUpDown } from 'lucide-react';

// Hàm tính tần suất mẫu dựa trên mã đài
function generateFrequencyData(seedKey: string) {
  let hash = 0;
  for (let i = 0; i < seedKey.length; i++) {
    hash = (hash << 5) - hash + seedKey.charCodeAt(i);
    hash |= 0;
  }

  const list = Array.from({ length: 100 }, (_, i) => {
    const numStr = String(i).padStart(2, '0');
    // Sinh số lần về từ 1 đến 18 trong 30 kỳ
    const count = Math.abs((hash * (i + 17) * 9301 + 49297) % 18) + 1;
    return {
      number: numStr,
      count,
      percent: Math.round((count / 30) * 100),
    };
  });

  return list;
}

export default function TanSuatPage() {
  const [selectedProvinceId, setSelectedProvinceId] = useState('ha-noi');
  const [sortBy, setSortBy] = useState<'count-desc' | 'count-asc' | 'num-asc'>('count-desc');

  const selectedProvince = PROVINCES.find((p) => p.id === selectedProvinceId) || PROVINCES[0];

  const frequencyList = useMemo(() => {
    const data = generateFrequencyData(selectedProvinceId);
    if (sortBy === 'count-desc') return [...data].sort((a, b) => b.count - a.count);
    if (sortBy === 'count-asc') return [...data].sort((a, b) => a.count - b.count);
    return [...data].sort((a, b) => parseInt(a.number, 10) - parseInt(b.number, 10));
  }, [selectedProvinceId, sortBy]);

  const topHot = useMemo(() => [...frequencyList].sort((a, b) => b.count - a.count).slice(0, 10), [frequencyList]);
  const topCold = useMemo(() => [...frequencyList].sort((a, b) => a.count - b.count).slice(0, 10), [frequencyList]);

  return (
    <SiteFrame>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            <BarChart3 className="size-4" />
            Thống Kê Xác Suất
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-4xl text-foreground">
            Tần Suất Xuất Hiện Lô Tô 30 Kỳ
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-muted-foreground">
            Thống kê chi tiết số lần nổ của 100 cặp số (00 - 99) đài {selectedProvince.name}. Giúp người chơi nhận diện số về nhiều và số khan.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedProvinceId}
            onChange={(e) => setSelectedProvinceId(e.target.value)}
            className="rounded-xl border bg-card px-3 py-2 text-xs font-bold text-foreground shadow-xs focus:ring-2 focus:ring-red-500"
          >
            {PROVINCES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>

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

      {/* Top Hot & Top Cold Highlights */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        {/* Top 10 Về Nhiều */}
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
              <Flame className="size-4" />
            </span>
            <h3 className="font-extrabold text-sm text-foreground">Top 10 Bộ Số Về Nhiều Nhất</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {topHot.map((item) => (
              <div
                key={item.number}
                className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/50 px-2.5 py-1 text-xs dark:border-red-900 dark:bg-red-950/30"
              >
                <span className="font-mono text-sm font-black text-red-600 dark:text-red-400">{item.number}</span>
                <span className="rounded bg-red-600 px-1 text-[10px] font-bold text-white">
                  {item.count} lần
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 10 Về Ít */}
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Snowflake className="size-4" />
            </span>
            <h3 className="font-extrabold text-sm text-foreground">Top 10 Bộ Số Về Ít Nhất</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {topCold.map((item) => (
              <div
                key={item.number}
                className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/50 px-2.5 py-1 text-xs dark:border-blue-900 dark:bg-blue-950/30"
              >
                <span className="font-mono text-sm font-black text-blue-600 dark:text-blue-400">{item.number}</span>
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
          Ma Trận Tần Suất Đầy Đủ 100 Bộ Số (00 - 99)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2">
          {frequencyList.map((item) => {
            const isHot = item.count >= 12;
            const isCold = item.count <= 4;
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
                  className={`block font-mono text-base font-black ${
                    isHot ? 'text-red-600 dark:text-red-400' : isCold ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'
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
      </div>
    </SiteFrame>
  );
}
