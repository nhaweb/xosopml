'use client';

import React from 'react';
import { Eye, Hash, Printer } from 'lucide-react';

interface DigitFilterBarProps {
  mode: 'full' | 'last2' | 'last3';
  setMode: (mode: 'full' | 'last2' | 'last3') => void;
  highlightDigit: number | null;
  setHighlightDigit: (digit: number | null) => void;
  onPrint?: () => void;
}

export function DigitFilterBar({
  mode,
  setMode,
  highlightDigit,
  setHighlightDigit,
  onPrint,
}: DigitFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-y bg-muted/40 px-3 py-2 text-xs">
      {/* Chọn hiển thị số chữ số */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="flex items-center gap-1 font-semibold text-muted-foreground">
          <Eye className="size-3.5" /> Chế độ:
        </span>
        <div className="inline-flex rounded-lg border bg-background p-0.5 shadow-xs">
          <button
            type="button"
            onClick={() => setMode('full')}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
              mode === 'full' ? 'bg-primary text-primary-foreground shadow-xs' : 'hover:bg-muted'
            }`}
          >
            Đủ số
          </button>
          <button
            type="button"
            onClick={() => setMode('last2')}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
              mode === 'last2' ? 'bg-primary text-primary-foreground shadow-xs' : 'hover:bg-muted'
            }`}
          >
            2 số cuối
          </button>
          <button
            type="button"
            onClick={() => setMode('last3')}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
              mode === 'last3' ? 'bg-primary text-primary-foreground shadow-xs' : 'hover:bg-muted'
            }`}
          >
            3 số cuối
          </button>
        </div>
      </div>

      {/* Tô màu chạm số 0-9 */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="hidden items-center gap-1 font-semibold text-muted-foreground md:flex">
          <Hash className="size-3.5" /> Tô số:
        </span>
        <div className="flex items-center gap-1">
          {Array.from({ length: 10 }, (_, i) => {
            const active = highlightDigit === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setHighlightDigit(active ? null : i)}
                className={`grid size-6 place-items-center rounded-full text-xs font-bold transition-all ${
                  active
                    ? 'bg-amber-400 text-black shadow-xs ring-2 ring-amber-500'
                    : 'border bg-background hover:bg-muted text-foreground'
                }`}
                title={`Tô màu chữ số ${i}`}
              >
                {i}
              </button>
            );
          })}
          {highlightDigit !== null && (
            <button
              type="button"
              onClick={() => setHighlightDigit(null)}
              className="ml-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground underline"
            >
              Bỏ tô
            </button>
          )}
        </div>

        {onPrint && (
          <button
            type="button"
            onClick={onPrint}
            className="ml-2 hidden sm:flex items-center gap-1 rounded-lg border bg-card px-2.5 py-1 text-xs font-semibold hover:bg-muted shadow-xs"
          >
            <Printer className="size-3.5" /> In vé dò
          </button>
        )}
      </div>
    </div>
  );
}

