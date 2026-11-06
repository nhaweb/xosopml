'use client';

import React from 'react';
import { formatPrizeNumber } from '@/lib/loto-calculator';

interface PrizeCellProps {
  numberStr: string;
  mode: 'full' | 'last2' | 'last3';
  highlightDigit: number | null;
  isSpecial?: boolean;
}

export function PrizeCell({ numberStr, mode, highlightDigit, isSpecial = false }: PrizeCellProps) {
  const displayVal = formatPrizeNumber(numberStr, mode);

  if (!displayVal) {
    return <span className="text-muted-foreground">-</span>;
  }

  // Tô màu nếu có số chạm được chọn
  const hasHighlight = highlightDigit !== null && displayVal.includes(highlightDigit.toString());

  return (
    <span
      className={`font-mono tracking-wider tabular-nums transition-all ${isSpecial
        ? 'text-lg sm:text-xl font-black text-red-600 dark:text-red-400'
        : 'text-sm sm:text-base font-bold text-foreground'
        } ${hasHighlight
          ? 'bg-amber-300 text-black dark:bg-amber-400 dark:text-black px-1.5 py-0.5 rounded shadow-sm scale-105 inline-block'
          : ''
        }`}
    >
      {displayVal}
    </span>
  );
}

