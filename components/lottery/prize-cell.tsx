'use client';

import React from 'react';
import { formatPrizeNumber } from '@/lib/loto-calculator';

interface PrizeCellProps {
  numberStr: string;
  mode: 'full' | 'last2' | 'last3';
  highlightDigit: number | null;
  isSpecial?: boolean;
  isEighth?: boolean;
  isCompact?: boolean;
  isDenseRow?: boolean;
}

export function PrizeCell({
  numberStr,
  mode,
  highlightDigit,
  isSpecial = false,
  isEighth = false,
  isCompact = false,
  isDenseRow = false,
}: PrizeCellProps) {
  const displayVal = formatPrizeNumber(numberStr, mode);

  if (!displayVal) {
    return <span className="text-muted-foreground">-</span>;
  }

  // Tô màu nếu có số chạm được chọn
  const hasHighlight = highlightDigit !== null && displayVal.includes(highlightDigit.toString());

  let sizeClasses: string;
  if (isSpecial) {
    sizeClasses = isCompact
      ? 'text-xl sm:text-2xl font-black tracking-wide text-red-600 dark:text-red-400 leading-tight'
      : 'text-2xl sm:text-[26px] md:text-[28px] font-black tracking-wide text-red-600 dark:text-red-400 leading-tight';
  } else if (isEighth) {
    sizeClasses = isCompact
      ? 'text-xl sm:text-2xl font-black tracking-wide text-red-600 dark:text-red-400 leading-tight'
      : 'text-2xl sm:text-[26px] md:text-[28px] font-black tracking-wide text-red-600 dark:text-red-400 leading-tight';
  } else if (isCompact && isDenseRow) {
    sizeClasses = 'text-[13px] sm:text-[15px] font-extrabold tracking-normal text-foreground leading-snug';
  } else if (isCompact) {
    sizeClasses = 'text-[14px] sm:text-base font-extrabold tracking-normal text-foreground leading-snug';
  } else if (isDenseRow) {
    sizeClasses = 'text-[15px] sm:text-[17px] md:text-[18px] font-extrabold tracking-normal text-foreground leading-snug';
  } else {
    sizeClasses = 'text-base sm:text-[18px] md:text-[20px] font-extrabold tracking-wide text-foreground leading-snug';
  }

  return (
    <span
      className={`inline-block font-mono tabular-nums whitespace-nowrap transition-colors ${sizeClasses} ${
        hasHighlight
          ? 'bg-amber-300 text-neutral-950 dark:bg-amber-400 dark:text-neutral-950 px-1.5 py-0.5 rounded shadow-2xs'
          : ''
      }`}
    >
      {displayVal}
    </span>
  );
}

