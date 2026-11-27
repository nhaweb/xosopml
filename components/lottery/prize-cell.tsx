'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { formatPrizeNumber } from '@/lib/loto-calculator';

interface PrizeCellProps {
  numberStr: string;
  mode: 'full' | 'last2' | 'last3';
  highlightDigit: number | null;
  isSpecial?: boolean;
  isEighth?: boolean;
  isSeventh?: boolean;
  isCompact?: boolean;
  isDenseRow?: boolean;
}

export function PrizeCell({
  numberStr,
  mode,
  highlightDigit,
  isSpecial = false,
  isEighth = false,
  isSeventh = false,
  isCompact = false,
  isDenseRow = false,
}: PrizeCellProps) {
  const isPending = !numberStr || !/\d/.test(numberStr);

  if (isPending) {
    const spinnerSize =
      isSpecial || isEighth || isSeventh
        ? 'size-6 sm:size-7'
        : isCompact
        ? 'size-4'
        : 'size-4 sm:size-5';
    return (
      <span
        className="inline-flex items-center justify-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-red-600 dark:text-amber-400 animate-pulse"
        title="Đang quay thưởng..."
        aria-label="Đang quay thưởng"
      >
        <Loader2 className={`${spinnerSize} animate-spin stroke-[2.5]`} />
      </span>
    );
  }

  const displayVal = formatPrizeNumber(numberStr, mode);

  if (!displayVal) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full bg-amber-500/10 px-2 py-0.5 text-red-600 dark:text-amber-400 animate-pulse"
        title="Đang quay thưởng..."
      >
        <Loader2 className="size-4 animate-spin stroke-[2.5]" />
      </span>
    );
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
      ? 'text-[22px] sm:text-[27px] font-black tracking-wide text-red-600 dark:text-red-400 leading-tight'
      : 'text-[27px] sm:text-[29px] md:text-[31px] font-black tracking-wide text-red-600 dark:text-red-400 leading-tight';
  } else if (isSeventh) {
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

