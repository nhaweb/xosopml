'use client';

import React, { useState } from 'react';
import { Search, Sparkles, CheckCircle2, AlertCircle, Trophy } from 'lucide-react';
import { ProvinceDrawResult } from '@/types/lottery';
import { checkTicket, TicketMatchResult } from '@/lib/ticket-checker';
import { audioSynth } from '@/lib/audio-synthesizer';

interface QuickTicketCheckerBarProps {
  provinces: ProvinceDrawResult[];
}

export function QuickTicketCheckerBar({ provinces }: QuickTicketCheckerBarProps) {
  const [ticketNum, setTicketNum] = useState('');
  const [provinceId, setProvinceId] = useState(provinces[0]?.provinceId || '');
  const [result, setResult] = useState<TicketMatchResult | null>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNum.trim()) return;

    const targetProv = provinces.find((p) => p.provinceId === provinceId) || provinces[0];
    if (!targetProv) return;

    const res = checkTicket(ticketNum, targetProv);
    setResult(res);

    if (res.isWinner) {
      audioSynth.playWinFanfare();
    }
  };

  return (
    <div className="mb-6 rounded-2xl border-2 border-red-500/20 bg-gradient-to-r from-red-50/50 via-card to-amber-50/50 dark:from-red-950/20 dark:via-card dark:to-amber-950/20 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-red-600 text-white text-xs font-black">
            <Trophy className="size-4" />
          </span>
          <h3 className="font-extrabold text-sm text-foreground">Dò Vé Số Nhanh Tại Chỗ</h3>
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground hidden sm:inline">
          Nhập 6 chữ số để kiểm tra ngay lập tức
        </span>
      </div>

      <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-2.5">
        <div className="w-full sm:w-56">
          <select
            value={provinceId}
            onChange={(e) => setProvinceId(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-red-500"
          >
            {provinces.map((p) => (
              <option key={p.provinceId} value={p.provinceId}>
                {p.provinceName} ({p.provinceCode})
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={ticketNum}
            onChange={(e) => setTicketNum(e.target.value.replace(/\D/g, ''))}
            placeholder="Nhập 5 hoặc 6 chữ số trên vé..."
            className="w-full rounded-xl border bg-background px-3.5 py-2 font-mono text-base font-black tracking-widest text-red-600 placeholder:text-muted-foreground/40 placeholder:font-normal placeholder:text-xs placeholder:tracking-normal focus:ring-2 focus:ring-red-500"
          />
        </div>

        <button
          type="submit"
          disabled={!ticketNum}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-5 py-2 text-xs font-black text-white shadow-xs hover:bg-red-700 disabled:opacity-50 transition-all hover:scale-105"
        >
          <Search className="size-3.5" /> Dò Ngay
        </button>
      </form>

      {/* Result Display */}
      {result && (
        <div
          className={`mt-3 rounded-xl p-3 border transition-all animate-in zoom-in-95 ${
            result.isWinner
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-950 dark:text-amber-200'
              : 'bg-muted/40 border-border text-foreground'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs">
            {result.isWinner ? (
              <Sparkles className="size-5 text-amber-600 shrink-0" />
            ) : (
              <AlertCircle className="size-5 text-muted-foreground shrink-0" />
            )}
            <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold">{result.details}</span>
              {result.isWinner && (
                <span className="rounded-lg bg-red-600 text-white px-2.5 py-0.5 font-mono font-black text-xs shadow-xs">
                  {result.rewardAmount}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

