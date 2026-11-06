'use client';

import React from 'react';
import { Sparkles, Trophy, Zap } from 'lucide-react';

interface VietlottKenoWidgetProps {
  megaNumbers?: number[];
  powerNumbers?: number[];
  powerBonus?: number;
  kenoNumbers?: number[];
}

export function VietlottKenoWidget({
  megaNumbers = [5, 12, 19, 27, 33, 42],
  powerNumbers = [8, 14, 23, 31, 40, 52],
  powerBonus = 18,
  kenoNumbers = [3, 7, 12, 15, 21, 28, 30, 36, 41, 45, 49, 53, 58, 62, 66, 70, 73, 75, 78, 80],
}: VietlottKenoWidgetProps) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Sparkles className="size-4" />
            Điện Toán & Vietlott
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground">Xổ Số Điện Toán Tự Chọn</h2>
        </div>
        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
          Cập nhật liên tục
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Mega 6/45 */}
        <div className="relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-red-600 text-white font-black text-xs">
                M
              </span>
              <div>
                <h3 className="font-extrabold text-sm">Mega 6/45</h3>
                <p className="text-[11px] text-muted-foreground">Kỳ quay hôm nay</p>
              </div>
            </div>
            <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-bold text-red-600">
              Jackpot ~18,2 Tỷ
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {megaNumbers.map((num, i) => (
              <span
                key={i}
                className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white text-sm font-black shadow-sm"
              >
                {String(num).padStart(2, '0')}
              </span>
            ))}
          </div>
        </div>

        {/* Power 6/55 */}
        <div className="relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-amber-500 text-white font-black text-xs">
                P
              </span>
              <div>
                <h3 className="font-extrabold text-sm">Power 6/55</h3>
                <p className="text-[11px] text-muted-foreground">Kỳ quay hôm nay</p>
              </div>
            </div>
            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              Jackpot 1 ~45 Tỷ
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            {powerNumbers.map((num, i) => (
              <span
                key={i}
                className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white text-sm font-black shadow-sm"
              >
                {String(num).padStart(2, '0')}
              </span>
            ))}
            <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white text-sm font-black shadow-sm ring-2 ring-blue-400" title="Số đặc biệt">
              {String(powerBonus).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Keno */}
        <div className="relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-emerald-600 text-white font-black text-xs">
                <Zap className="size-4" />
              </span>
              <div>
                <h3 className="font-extrabold text-sm">Keno Trực Tuyến</h3>
                <p className="text-[11px] text-muted-foreground">10 phút / kỳ</p>
              </div>
            </div>
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600">
              Kỳ #83921
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {kenoNumbers.slice(0, 10).map((num, i) => (
              <span
                key={i}
                className="grid h-7 place-items-center rounded-lg border bg-muted/60 text-xs font-mono font-bold text-foreground"
              >
                {String(num).padStart(2, '0')}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
            <span>Chẵn 10 · Lẻ 10</span>
            <span>Lớn 11 · Nhỏ 9</span>
          </div>
        </div>
      </div>
    </section>
  );
}

