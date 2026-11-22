'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { VietlottLatestData } from '@/lib/services/xosoApi';

export function VietlottKenoWidget() {
  const [data, setData] = useState<VietlottLatestData>({
    mega645: {
      drawNumber: '01592',
      date: 'Hôm nay',
      jackpotFormatted: '~19,7 Tỷ',
      numbers: [1, 13, 14, 18, 23, 39],
    },
    power655: {
      drawNumber: '01427',
      date: 'Hôm nay',
      jackpotFormatted: '~45,7 Tỷ',
      numbers: [7, 29, 44, 45, 50, 54],
      bonus: 39,
    },
    keno: {
      drawNumber: '303941',
      date: 'Hôm nay',
      numbers: [2, 9, 12, 14, 19, 22, 23, 24, 26, 28, 29, 32, 49, 50, 51, 54, 56, 61, 67, 74],
    },
  });

  useEffect(() => {
    fetch('/api/xoso/stats?type=vietlott')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data) {
          setData(json.data);
        }
      })
      .catch(() => {
        // ignore
      });
  }, []);

  const evenCount = data.keno.numbers.filter((n) => n % 2 === 0).length;
  const oddCount = data.keno.numbers.length - evenCount;
  const bigCount = data.keno.numbers.filter((n) => n > 40).length;
  const smallCount = data.keno.numbers.length - bigCount;

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
            <Sparkles className="size-4" />
            Điện Toán &amp; Vietlott
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground">Xổ Số Điện Toán Tự Chọn</h2>
        </div>
        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
          Cập nhật trực tiếp
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
                <p className="text-[11px] text-muted-foreground">
                  Kỳ #{data.mega645.drawNumber} · {data.mega645.date}
                </p>
              </div>
            </div>
            <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-bold text-red-600 dark:text-red-400">
              Jackpot {data.mega645.jackpotFormatted}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {data.mega645.numbers.map((num, i) => (
              <span
                key={i}
                className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-red-500 to-red-700 font-mono text-white text-sm font-extrabold shadow-sm"
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
                <p className="text-[11px] text-muted-foreground">
                  Kỳ #{data.power655.drawNumber} · {data.power655.date}
                </p>
              </div>
            </div>
            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              Jackpot 1 {data.power655.jackpotFormatted}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            {data.power655.numbers.map((num, i) => (
              <span
                key={i}
                className="grid size-8.5 place-items-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 font-mono text-white text-xs font-extrabold shadow-sm"
              >
                {String(num).padStart(2, '0')}
              </span>
            ))}
            <span
              className="grid size-8.5 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-blue-800 font-mono text-white text-xs font-extrabold shadow-sm ring-2 ring-blue-400"
              title="Số đặc biệt Jackpot 2"
            >
              {String(data.power655.bonus).padStart(2, '0')}
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
                <p className="text-[11px] text-muted-foreground">10 phút / kỳ · {data.keno.date}</p>
              </div>
            </div>
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Kỳ #{data.keno.drawNumber}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {data.keno.numbers.slice(0, 10).map((num, i) => (
              <span
                key={i}
                className="grid h-7 place-items-center rounded-lg border bg-muted/60 text-xs font-mono font-bold text-foreground"
              >
                {String(num).padStart(2, '0')}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
            <span>
              Chẵn {evenCount} · Lẻ {oddCount}
            </span>
            <span>
              Lớn {bigCount} · Nhỏ {smallCount}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
