'use client';

import React, { useState } from 'react';
import { ProvinceDrawResult } from '@/types/lottery';
import { calculateLotoHeadTail } from '@/lib/loto-calculator';

interface LotoHeadTailTableProps {
  provinces: ProvinceDrawResult[];
  highlightDigit: number | null;
}

export function LotoHeadTailTable({ provinces, highlightDigit }: LotoHeadTailTableProps) {
  const [viewType, setViewType] = useState<'head' | 'tail'>('head');

  if (!provinces || provinces.length === 0) return null;

  // Tính toán đầu đuôi cho từng tỉnh
  const lotoData = provinces.map((p) => ({
    provinceName: p.provinceName,
    provinceCode: p.provinceCode,
    loto: calculateLotoHeadTail(p),
  }));

  const digits = Array.from({ length: 10 }, (_, i) => i);

  return (
    <div className="border-t bg-muted/15 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Bảng Lô Tô {viewType === 'head' ? 'Đầu' : 'Đuôi'}
          </span>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            (Thống kê 2 số cuối)
          </span>
        </div>
        <div className="flex rounded-md border bg-card p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setViewType('head')}
            className={`rounded px-2.5 py-0.5 transition-colors ${
              viewType === 'head' ? 'bg-primary text-primary-foreground shadow-xs' : 'hover:bg-muted'
            }`}
          >
            Theo Đầu (0 - 9)
          </button>
          <button
            type="button"
            onClick={() => setViewType('tail')}
            className={`rounded px-2.5 py-0.5 transition-colors ${
              viewType === 'tail' ? 'bg-primary text-primary-foreground shadow-xs' : 'hover:bg-muted'
            }`}
          >
            Theo Đuôi (0 - 9)
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full min-w-[500px] border-collapse text-xs">
          <thead>
            <tr className="bg-muted/60 text-muted-foreground border-b font-bold">
              <th className="w-16 border-r px-2 py-2 text-center text-foreground font-black">
                {viewType === 'head' ? 'Đầu' : 'Đuôi'}
              </th>
              {lotoData.map((d) => (
                <th key={d.provinceCode} className="border-r last:border-r-0 px-3 py-2 text-center">
                  <span className="block font-bold text-foreground">{d.provinceName}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {digits.map((digit) => {
              const isHighlighted = highlightDigit === digit;
              return (
                <tr
                  key={digit}
                  className={`transition-colors ${
                    isHighlighted ? 'bg-amber-100/60 dark:bg-amber-950/30' : 'hover:bg-muted/30'
                  }`}
                >
                  <th
                    scope="row"
                    className={`border-r px-2 py-1.5 text-center font-bold text-sm font-mono ${
                      isHighlighted
                        ? 'bg-amber-300 dark:bg-amber-500 text-black font-black'
                        : 'bg-muted/40 text-primary'
                    }`}
                  >
                    {digit}
                  </th>
                  {lotoData.map((d) => {
                    const values =
                      viewType === 'head' ? d.loto.head[digit] : d.loto.tail[digit];

                    return (
                      <td
                        key={d.provinceCode}
                        className="border-r last:border-r-0 px-3 py-1.5 font-mono text-center tracking-widest text-[13px]"
                      >
                        {values && values.length > 0 ? (
                          <span className="font-semibold text-foreground">
                            {values.map((v, i) => {
                              const fullPair =
                                viewType === 'head' ? `${digit}${v}` : `${v}${digit}`;
                              const hitHighlight =
                                highlightDigit !== null && fullPair.includes(highlightDigit.toString());

                              return (
                                <React.Fragment key={i}>
                                  <span
                                    className={
                                      hitHighlight
                                        ? 'bg-amber-300 dark:bg-amber-400 text-black px-1 rounded font-bold'
                                        : ''
                                    }
                                  >
                                    {v}
                                  </span>
                                  {i < values.length - 1 && ', '}
                                </React.Fragment>
                              );
                            })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40 font-light">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

