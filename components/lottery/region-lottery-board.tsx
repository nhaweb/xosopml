'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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

  const regionSlug = id.includes('xsmn')
    ? 'mien-nam'
    : id.includes('xsmt')
    ? 'mien-trung'
    : 'mien-bac';

  return (
    <section id={id} className="overflow-hidden rounded-xl border border-red-800/30 bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Board Header chuẩn đỏ rượu vang Minh Ngọc / Minh Luân */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-[#8f0000] via-[#b80c0c] to-[#8f0000] px-4 py-2.5 text-white">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-white/15 text-amber-300">
            <CircleDot className="size-4" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-white">
                {title}
              </h2>
              <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-black text-red-950">
                {regionCode}
              </span>
            </div>
            <p className="flex items-center gap-1 text-[11px] text-amber-100/90">
              <Clock className="size-3" /> Mở thưởng {drawTime} · {dateStr}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/in-ve-do"
            className="hidden sm:inline-block rounded-md bg-white/15 px-2.5 py-1 text-[11px] font-bold text-amber-200 hover:bg-white/25"
          >
            In Vé Dò
          </Link>
          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title, text: `Kết quả ${title} ngày ${dateStr}`, url: window.location.href });
              }
            }}
            className="flex items-center gap-1 rounded-md border border-white/25 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-white/20"
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
        <table className="w-full min-w-[540px] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-blue-50/60 dark:bg-muted/50 text-foreground">
              <th className="sticky left-0 z-10 w-24 bg-muted/90 border-r px-2 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Giải
              </th>
              {results.map((prov) => (
                <th key={prov.provinceCode} className="border-r last:border-r-0 px-2.5 py-2.5 text-center">
                  <Link
                    href={`/ket-qua-xo-so/${regionSlug}/${prov.provinceId}.html`}
                    className="block text-sm sm:text-base font-black text-blue-800 dark:text-blue-400 hover:text-red-600 hover:underline"
                  >
                    {prov.provinceName}
                  </Link>
                  <span className="block text-[10px] font-semibold text-muted-foreground">
                    Mã: {prov.provinceCode}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {prizeRowsTemplate.map((prizeTpl, prizeIdx) => {
              const isSpecial =
                prizeTpl.prizeName.includes('Đặc Biệt') || prizeTpl.prizeName.includes('G.ĐB');
              const isEighth = prizeTpl.prizeName.includes('G.Tám');
              const rowBg = isSpecial
                ? 'bg-red-50/80 dark:bg-red-950/25 font-bold'
                : prizeIdx % 2 === 0
                ? 'bg-card'
                : 'bg-muted/20';
              const stickyBg = isSpecial
                ? 'bg-red-50 dark:bg-[#271515]'
                : prizeIdx % 2 === 0
                ? 'bg-card'
                : 'bg-muted/35 dark:bg-card';

              return (
                <tr key={prizeTpl.prizeName} className={`transition-colors ${rowBg}`}>
                  {/* Cột tên giải bên trái */}
                  <th
                    scope="row"
                    className={`sticky left-0 z-10 w-24 border-r px-2 py-2.5 text-center text-xs font-bold ${stickyBg} ${
                      isSpecial
                        ? 'text-red-700 dark:text-red-400 font-extrabold'
                        : isEighth
                        ? 'text-red-600 dark:text-red-400 font-bold'
                        : 'text-foreground'
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
                                isEighth={isEighth}
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

