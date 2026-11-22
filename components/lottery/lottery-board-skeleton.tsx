'use client';

import React from 'react';

export function LotteryBoardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="space-y-6" role="status" aria-label="Đang tải dữ liệu xổ số...">
      {Array.from({ length: count }, (_, idx) => (
        <div
          key={idx}
          className="overflow-hidden rounded-xl border border-border bg-card shadow-xs animate-pulse"
        >
          {/* Header skeleton */}
          <div className="flex items-center justify-between bg-[#8f0000]/80 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-white/20" />
              <div className="space-y-1.5">
                <div className="h-4 w-52 rounded bg-white/30" />
                <div className="h-2.5 w-36 rounded bg-white/20" />
              </div>
            </div>
            <div className="h-6 w-20 rounded bg-white/20" />
          </div>

          {/* Filter bar skeleton */}
          <div className="flex items-center justify-between border-y bg-muted/40 px-4 py-2.5">
            <div className="h-6 w-48 rounded bg-muted" />
            <div className="hidden sm:flex gap-1.5">
              {Array.from({ length: 10 }, (_, d) => (
                <div key={d} className="size-6 rounded-full bg-muted" />
              ))}
            </div>
          </div>

          {/* Table rows skeleton */}
          <div className="divide-y divide-border p-3 space-y-2.5">
            {Array.from({ length: 9 }, (_, r) => (
              <div key={r} className="grid grid-cols-4 gap-3 pt-2 first:pt-0 items-center">
                <div className="h-5 w-20 rounded bg-muted" />
                <div className="h-6 w-full rounded bg-muted/70" />
                <div className="h-6 w-full rounded bg-muted/70" />
                <div className="h-6 w-full rounded bg-muted/70" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface ApiDataSourceBannerProps {
  source?: 'xosoapi.online' | 'fallback';
  warning?: string;
  isLiveWindow?: boolean;
  revalidateSeconds?: number;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function ApiDataSourceBanner(_props: ApiDataSourceBannerProps) {
  return null;
}

