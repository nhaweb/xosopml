'use client';

import React from 'react';
import Link from 'next/link';
import { Bot, Flame, Snowflake, TrendingUp, Sparkles, ArrowRight, Zap } from 'lucide-react';

export function AiLotoSummaryWidget() {
  return (
    <section className="mb-8 overflow-hidden rounded-3xl border-2 border-red-500/30 bg-gradient-to-br from-card via-card to-red-500/5 p-5 sm:p-6 shadow-md">
      {/* Widget Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white shadow-md">
            <Bot className="size-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-red-600 text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                PML AI INTELLIGENCE
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Sparkles className="size-3.5" /> Tự động tổng hợp
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-foreground mt-0.5">
              Trung Tâm Thống Kê & Phân Tích Lô Tô Thông Minh
            </h3>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/thong-ke/tan-suat"
            className="rounded-xl border bg-background px-3 py-1.5 text-xs font-bold hover:bg-muted transition-all"
          >
            Tần Suất Đầy Đủ
          </Link>
          <Link
            href="/thong-ke/lo-gan"
            className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 shadow-xs transition-all"
          >
            Gan Cực Đại
          </Link>
        </div>
      </div>

      {/* 3 Analytics Cards */}
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {/* Card 1: Gan Cực Đại */}
        <div className="rounded-2xl border bg-background p-4 shadow-2xs">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                <Snowflake className="size-4" />
              </span>
              <h4 className="font-extrabold text-sm text-foreground">Lô Gan Cực Đại</h4>
            </div>
            <span className="text-[11px] font-bold text-red-600 dark:text-red-400">Chạm ngưỡng</span>
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            Những con số lâu chưa xuất hiện ở cả 3 miền, có xác suất nổ trở lại cao:
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              { num: '47', days: 24, warn: true },
              { num: '82', days: 19, warn: true },
              { num: '15', days: 16, warn: true },
              { num: '93', days: 14, warn: false },
            ].map((item) => (
              <div
                key={item.num}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-mono ${
                  item.warn
                    ? 'border-red-300 bg-red-50 text-red-700 font-black dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
                    : 'border-border bg-muted/40 font-bold text-foreground'
                }`}
              >
                <span className="text-sm">{item.num}</span>
                <span className="text-[10px] font-sans opacity-80">({item.days} ngày)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Tần Suất Xổ Số (Hot Loto) */}
        <div className="rounded-2xl border bg-background p-4 shadow-2xs">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <Flame className="size-4" />
              </span>
              <h4 className="font-extrabold text-sm text-foreground">Tần Suất Cao (Top Hot)</h4>
            </div>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Chu kỳ đẹp</span>
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            Các cặp số về nhiều nhất trong 30 kỳ quay gần đây:
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              { num: '68', count: 16 },
              { num: '79', count: 14 },
              { num: '39', count: 13 },
              { num: '88', count: 12 },
            ].map((item) => (
              <div
                key={item.num}
                className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50/60 px-3 py-1.5 text-xs font-mono font-black text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
              >
                <span className="text-sm">{item.num}</span>
                <span className="rounded bg-amber-500 text-white px-1 text-[10px] font-sans">
                  {item.count} lần
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Nhận Định AI Hôm Nay */}
        <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-600/5 to-amber-500/10 p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-red-600 text-white text-xs">
                <Zap className="size-4" />
              </span>
              <h4 className="font-extrabold text-sm text-foreground">AI Phân Tích Cầu Số</h4>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Mô hình học máy tổng hợp dữ liệu 3 miền phát hiện nhịp rơi:
            </p>

            <div className="mt-2.5 rounded-xl border bg-card/80 p-2.5 text-xs">
              <div className="flex items-center justify-between font-bold text-foreground">
                <span>Đầu chạm tiềm năng:</span>
                <span className="font-mono text-sm font-black text-red-600 dark:text-red-400">Đầu 3, Đầu 7</span>
              </div>
              <div className="mt-1 flex items-center justify-between font-bold text-foreground">
                <span>Cặp số phong thủy:</span>
                <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">39 · 79 · 68</span>
              </div>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-muted-foreground italic">
            *Dữ liệu phân tích thống kê chỉ mang tính chất tham khảo giải trí.
          </p>
        </div>
      </div>
    </section>
  );
}

