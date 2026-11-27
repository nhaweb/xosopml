'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProvinceDrawResult } from '@/types/lottery';
import { PROVINCES, resolveProvinceCode, sortProvincesCanonical } from '@/config/lottery-provinces';
import { DigitFilterBar } from './digit-filter-bar';
import { PrizeCell } from './prize-cell';
import { LotoHeadTailTable } from './loto-head-tail-table';
import { CircleDot, Clock, Share2, X } from 'lucide-react';

interface RegionLotteryBoardProps {
  id: string;
  title: string;
  regionCode: string;
  drawTime: string;
  dateStr: string;
  results: ProvinceDrawResult[];
  /** Tùy chọn ghi đè mã đài thủ công theo provinceId hoặc provinceName */
  provinceCodeOverrides?: Record<string, string>;
  /** Chế độ hiển thị mặc định (vd: 'last2' khi tra cứu Đầu đuôi) */
  initialMode?: 'full' | 'last2' | 'last3';
  /** Nút đóng bảng (dùng cho kết quả Tra Cứu trực tiếp trên Homepage) */
  onClose?: () => void;
}

export function RegionLotteryBoard({
  id,
  title,
  regionCode,
  drawTime,
  dateStr,
  results,
  provinceCodeOverrides,
  initialMode = 'full',
  onClose,
}: RegionLotteryBoardProps) {
  const [mode, setMode] = useState<'full' | 'last2' | 'last3'>(initialMode);
  const [highlightDigit, setHighlightDigit] = useState<number | null>(null);

  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  if (!results || results.length === 0) {
    return null;
  }

  // Sắp xếp thứ tự cột chuẩn (ưu tiên TP.HCM lên đầu vào Thứ Hai & Thứ Bảy)
  const orderedResults = sortProvincesCanonical(results);

  // Lấy danh sách hàng giải thưởng từ tỉnh đầu tiên làm chuẩn
  const prizeRowsTemplate = orderedResults[0].prizes;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const inferredRegion =
    id.includes('xsmn')
      ? 'south'
      : id.includes('xsmt')
      ? 'central'
      : id.includes('xsmb')
      ? 'north'
      : PROVINCES.find((p) => p.id === orderedResults[0]?.provinceId)?.region ?? 'north';

  const regionSlug =
    inferredRegion === 'south'
      ? 'mien-nam'
      : inferredRegion === 'central'
      ? 'mien-trung'
      : 'mien-bac';
  const isNorth = inferredRegion === 'north';

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
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 rounded-md border border-amber-300/60 bg-black/30 px-2.5 py-1 text-[11px] font-bold text-amber-200 hover:bg-black/50"
              title="Đóng kết quả tra cứu"
            >
              <X className="size-3.5" /> Đóng
            </button>
          )}
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

      {/* Bảng kết quả chính dạng cột đa đài chuẩn Minh Ngọc */}
      <div className="overflow-x-auto">
        <table
          className={`w-full border-collapse text-sm ${
            orderedResults.length >= 4
              ? 'min-w-[660px] table-fixed'
              : orderedResults.length === 3
              ? 'min-w-[560px] table-fixed'
              : orderedResults.length === 2
              ? 'min-w-[440px] table-fixed'
              : 'min-w-[360px]'
          }`}
        >
          <thead>
            <tr className="border-b bg-blue-50/70 dark:bg-muted/50 text-foreground">
              <th className="sticky left-0 z-20 w-[78px] sm:w-[90px] bg-[#f2eee7] dark:bg-[#24211f] border-r shadow-[2px_0_4px_-2px_rgba(0,0,0,0.12)] px-1.5 py-2.5 text-center text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                Giải
              </th>
              {orderedResults.map((prov) => {
                const manualCode =
                  provinceCodeOverrides?.[prov.provinceId] ??
                  provinceCodeOverrides?.[prov.provinceName];
                const resolvedCode = resolveProvinceCode(
                  prov.provinceName,
                  manualCode,
                  prov.provinceId,
                  prov.provinceCode
                );

                return (
                  <th
                    key={prov.provinceId || prov.provinceCode}
                    className="border-r last:border-r-0 px-2 py-2.5 text-center"
                  >
                    <Link
                      href={`/ket-qua-xo-so/${regionSlug}/${prov.provinceId}`}
                      className="block text-sm sm:text-base font-black text-blue-800 dark:text-blue-400 hover:text-red-600 hover:underline leading-tight"
                    >
                      {prov.provinceName}
                    </Link>
                    {resolvedCode && (
                      <span className="mt-0.5 block text-[11px] font-bold tracking-wide text-muted-foreground">
                        Mã: {resolvedCode}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {prizeRowsTemplate.map((prizeTpl, prizeIdx) => {
              const isSpecial =
                prizeTpl.prizeName.includes('Đặc Biệt') || prizeTpl.prizeName.includes('G.ĐB');
              const isEighth = prizeTpl.prizeName.includes('G.Tám');
              const isSeventh =
                isNorth &&
                (prizeTpl.prizeName.includes('G.Bảy') || prizeTpl.prizeName.includes('Giải Bảy'));
              const isFourCol = orderedResults.length >= 4;
              const rowBg = isSpecial
                ? 'bg-red-50/85 dark:bg-red-950/25 font-bold'
                : prizeIdx % 2 === 0
                ? 'bg-card'
                : 'bg-muted/20';
              const stickyBg = isSpecial
                ? 'bg-[#fef2f2] dark:bg-[#271515]'
                : prizeIdx % 2 === 0
                ? 'bg-card'
                : 'bg-[#f6f3ee] dark:bg-[#24211f]';

              return (
                <tr key={prizeTpl.prizeName} className={`transition-colors ${rowBg}`}>
                  {/* Cột tên giải bên trái */}
                  <th
                    scope="row"
                    className={`sticky left-0 z-20 w-[78px] sm:w-[90px] border-r shadow-[2px_0_4px_-2px_rgba(0,0,0,0.12)] px-1.5 py-2.5 text-center text-xs font-bold ${stickyBg} ${
                      isSpecial
                        ? 'text-red-700 dark:text-red-400 font-extrabold'
                        : isEighth || isSeventh
                        ? 'text-red-600 dark:text-red-400 font-extrabold'
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
                  {orderedResults.map((prov) => {
                    const rowData = prov.prizes[prizeIdx];
                    const numbers = rowData ? rowData.numbers : [];
                    const count = numbers.length;
                    const isDenseRow = count >= 3;

                    // Chọn bố cục CSS Grid thẳng cột chuẩn Minh Ngọc (loại bỏ dấu · gây lệch hàng)
                    const isSingleSouthCentral = !isNorth && orderedResults.length === 1;
                    let gridClass = 'flex items-center justify-center';
                    if (isSingleSouthCentral && count === 7) {
                      // Chi tiết 1 đài: 7 lô Giải Tư trải đều toàn chiều rộng ô (7 cột trên desktop, cân đều trên mobile)
                      gridClass = 'flex flex-wrap sm:grid sm:grid-cols-7 w-full items-center justify-evenly sm:justify-items-center gap-x-3 gap-y-2';
                    } else if (count === 7) {
                      // Giải Tư (7 lô): 3 hàng x 2 số thẳng cột + hàng cuối 1 số ở giữa
                      gridClass = 'grid grid-cols-2 gap-x-1.5 sm:gap-x-3 gap-y-1.5 items-center justify-items-center';
                    } else if (count === 3) {
                      // Giải Sáu (3 lô): 3 cột đều nhau
                      gridClass = 'grid grid-cols-3 gap-x-1 sm:gap-x-2 gap-y-1 items-center justify-items-center';
                    } else if (count === 2) {
                      // Giải Ba (2 lô): 2 cột đều nhau thẳng hàng với Giải Tư
                      gridClass = 'grid grid-cols-2 gap-x-1.5 sm:gap-x-3 gap-y-1 items-center justify-items-center';
                    } else if (count === 6) {
                      // Miền Bắc G.Ba / G.Năm (6 lô): 2 hàng x 3 cột đều nhau
                      gridClass = 'grid grid-cols-3 gap-x-2 sm:gap-x-4 gap-y-1.5 items-center justify-items-center';
                    } else if (count === 4) {
                      // Miền Bắc G.Tư / G.Bảy (4 lô): 4 cột đều nhau
                      gridClass = 'grid grid-cols-2 sm:grid-cols-4 gap-x-2 sm:gap-x-4 gap-y-1 items-center justify-items-center';
                    }

                    return (
                      <td
                        key={prov.provinceId || prov.provinceCode}
                        className={`border-r last:border-r-0 text-center align-middle ${
                          isFourCol ? 'px-1.5 py-2.5' : 'px-2 sm:px-3 py-2.5'
                        }`}
                      >
                        <div className={gridClass}>
                          {numbers.map((num, nIdx) => {
                            const isLastOddInTwoCol = !isSingleSouthCentral && count === 7 && nIdx === 6;
                            return (
                              <div
                                key={nIdx}
                                className={`cursor-pointer rounded-md px-1.5 py-0.5 transition-colors hover:bg-amber-200/85 hover:ring-1 hover:ring-amber-400/70 dark:hover:bg-amber-500/30 ${
                                  isLastOddInTwoCol
                                    ? 'col-span-2 flex justify-center'
                                    : 'flex justify-center'
                                }`}
                              >
                                <PrizeCell
                                  numberStr={num}
                                  mode={mode}
                                  highlightDigit={highlightDigit}
                                  isSpecial={isSpecial}
                                  isEighth={isEighth}
                                  isSeventh={isSeventh}
                                  isCompact={isFourCol}
                                  isDenseRow={isDenseRow}
                                />
                              </div>
                            );
                          })}
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
      <LotoHeadTailTable provinces={orderedResults} highlightDigit={highlightDigit} />
    </section>
  );
}

