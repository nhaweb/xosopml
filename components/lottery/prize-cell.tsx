'use client';

import React from 'react';
import { formatPrizeNumber } from '@/lib/loto-calculator';

interface PrizeCellProps {
  numberStr: string;
  mode: 'full' | 'last2' | 'last3';
  highlightDigit: number | null;
  isSpecial?: boolean;
  isEighth?: boolean;
}

export function PrizeCell({
  numberStr,
  mode,
  highlightDigit,
  isSpecial = false,
  isEighth = false,
}: PrizeCellProps) {
  const displayVal = formatPrizeNumber(numberStr, mode);

  if (!displayVal) {
    return <span className="text-muted-foreground">-</span>;
  }

  // Tô màu nếu có số chạm được chọn
  const hasHighlight = highlightDigit !== null && displayVal.includes(highlightDigit.toString());

  return (
    <span
      className={`font-mono tracking-wider tabular-nums transition-colors ${
        isSpecial
          ? 'text-xl sm:text-2xl font-extrabold text-red-600 dark:text-red-400'
          : isEighth
          ? 'text-base sm:text-lg font-extrabold text-red-600 dark:text-red-400'
          : 'text-sm sm:text-base font-bold text-foreground'
      } ${
        hasHighlight
          ? 'bg-amber-300 text-neutral-950 dark:bg-amber-400 dark:text-neutral-950 px-1.5 py-0.5 rounded shadow-2xs inline-block'
          : ''
      }`}
    >
      {displayVal}
    </span>
  );
}

