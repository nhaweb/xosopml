'use client';

import React, { useState } from 'react';
import { ProvinceDrawResult } from '@/types/lottery';
import { DigitFilterBar } from './digit-filter-bar';
import { PrizeCell } from './prize-cell';
import { LotoHeadTailTable } from './loto-head-tail-table';
import { CircleDot, Clock, Share2 } from 'lucide-react';

interface RegionLotteryBoardProps {
  id: string;
  title: string;
  regionCode: string;
  drawTime: string;
  dateStr: string;
  results: ProvinceDrawResult[];
}

export function RegionLotteryBoard({
  id,
  title,
  regionCode,
  drawTime,
  dateStr,
  results,
}: RegionLotteryBoardProps) {
  const [mode, setMode] = useState<'full' | 'last2' | 'last3'>('full');
  const [highlightDigit, setHighlightDigit] = useState<number | null>(null);

  if (!results || results.length === 0) {
    return null;
  }

  // Lấy danh sách hàng giải thưởng từ tỉnh đầu tiên làm chuẩn
  const prizeRowsTemplate = results[0].prizes;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <section id={id} className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Board Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-card px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
            <CircleDot className="size-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground">
                {title}
              </h2>
              <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-[11px] font-bold text-red-600 dark:text-red-400">
                {regionCode}
              </span>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" /> Mở thưởng {drawTime} · {dateStr}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title, text: `Kết quả ${title} ngày ${dateStr}`, url: window.location.href });
              }
            }}
            className="flex items-center gap-1 rounded-lg border bg-background px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
            title="Chia sẻ kết quả"
          >
            <Share2 className="size-3.5" /> <span className="hidden sm:inline">Chia sẻ</span>
          </button>
        </div>
      </div>

      {/* Bộ điều khiển hiển thị (Đủ số / 2 số / 3 số / Tô số) */}
      <DigitFilterBar
        mode={mode}
        setMode={setMode}
        highlightDigit={highlightDigit}
        setHighlightDigit={setHighlightDigit}
        onPrint={handlePrint}
      />

      {/* Bảng kết quả chính dạng cột đa đài */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-foreground">
              <th className="sticky left-0 z-10 w-28 bg-muted/90 border-r px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Giải
              </th>
              {results.map((prov) => (
                <th key={prov.provinceCode} className="border-r last:border-r-0 px-3 py-3 text-center">
                  <span className="block text-base font-extrabold text-foreground">{prov.provinceName}</span>
                  <span className="block text-[11px] font-normal text-muted-foreground">Mã: {prov.provinceCode}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {prizeRowsTemplate.map((prizeTpl, prizeIdx) => {
              const isSpecial = prizeTpl.prizeName.includes('Đặc Biệt') || prizeTpl.prizeName.includes('G.ĐB');
              return (
                <tr
                  key={prizeTpl.prizeName}
                  className={`transition-colors ${
                    isSpecial ? 'bg-red-500/5 font-bold' : prizeIdx % 2 === 0 ? 'bg-card' : 'bg-muted/15'
                  }`}
                >
                  {/* Cột tên giải bên trái */}
                  <th
                    scope="row"
                    className={`sticky left-0 z-10 w-28 border-r px-2 py-3 text-center text-xs font-bold bg-card ${
                      isSpecial ? 'text-red-600 dark:text-red-400 font-black' : 'text-foreground'
                    }`}
                  >
                    <span>{prizeTpl.prizeName}</span>
                    {prizeTpl.rewardAmount && (
                      <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">
                        {prizeTpl.rewardAmount}
                      </span>
                    )}
                  </th>

                  {/* Cột các số trúng thưởng của từng tỉnh */}
                  {results.map((prov) => {
                    const rowData = prov.prizes[prizeIdx];
                    const numbers = rowData ? rowData.numbers : [];

                    return (
                      <td
                        key={prov.provinceCode}
                        className="border-r last:border-r-0 px-3 py-2.5 text-center align-middle"
                      >
                        <div
                          className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 ${
                            numbers.length > 3 ? 'max-w-md mx-auto' : ''
                          }`}
                        >
                          {numbers.map((num, nIdx) => (
                            <React.Fragment key={nIdx}>
                              <PrizeCell
                                numberStr={num}
                                mode={mode}
                                highlightDigit={highlightDigit}
                                isSpecial={isSpecial}
                              />
                              {nIdx < numbers.length - 1 && numbers.length > 2 && (
                                <span className="text-muted-foreground/40 text-xs hidden sm:inline">·</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bảng Lô Tô Đầu Đuôi đính kèm phía dưới */}
      <LotoHeadTailTable provinces={results} highlightDigit={highlightDigit} />
    </section>
  );
}

