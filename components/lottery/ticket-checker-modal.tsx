'use client';

import React, { useEffect, useState } from 'react';
import { X, Search, CheckCircle2, AlertCircle, Trophy } from 'lucide-react';
import { ProvinceDrawResult } from '@/types/lottery';
import { checkTicket, TicketMatchResult } from '@/lib/ticket-checker';
import { audioSynth } from '@/lib/audio-synthesizer';

interface TicketCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableResults: ProvinceDrawResult[];
  activeDate?: Date;
}

export function TicketCheckerModal({
  isOpen,
  onClose,
  availableResults,
}: TicketCheckerModalProps) {
  const [ticketNumber, setTicketNumber] = useState('');
  const [selectedProvinceId, setSelectedProvinceId] = useState(
    availableResults[0]?.provinceId || ''
  );
  const [checkResult, setCheckResult] = useState<TicketMatchResult | null>(null);

  useEffect(() => {
    if (availableResults.length > 0) {
      const exists = availableResults.some((p) => p.provinceId === selectedProvinceId);
      if (!exists) {
        setSelectedProvinceId(availableResults[0].provinceId);
      }
    }
  }, [availableResults, selectedProvinceId]);

  if (!isOpen) return null;

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const targetResult =
      availableResults.find((p) => p.provinceId === selectedProvinceId) || availableResults[0];
    if (!targetResult) return;

    const res = checkTicket(ticketNumber, targetResult);
    setCheckResult(res);

    if (res.isWinner) {
      audioSynth.playWinFanfare();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border bg-card p-6 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted"
        >
          <X className="size-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-red-600 text-white shadow-md">
            <Trophy className="size-6" />
          </span>
          <div>
            <h2 className="text-xl font-black text-foreground">Dò Vé Số Trực Tuyến</h2>
            <p className="text-xs text-muted-foreground">Đối chiếu nhanh số vé với kết quả hôm nay</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleCheck} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Chọn Tỉnh / Đài
            </label>
            <select
              value={selectedProvinceId}
              onChange={(e) => setSelectedProvinceId(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm font-semibold text-foreground focus:ring-2 focus:ring-red-500"
            >
              {availableResults.map((p) => (
                <option key={p.provinceId} value={p.provinceId}>
                  {p.provinceName} ({p.provinceCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Nhập Dãy Số Trên Vé
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Ví dụ: 829103"
              className="w-full text-center font-mono text-2xl sm:text-3xl font-black tracking-widest rounded-xl border bg-background px-4 py-3 text-red-600 placeholder:text-muted-foreground/30 focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={!ticketNumber}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-md hover:bg-red-700 disabled:opacity-50 transition-all"
          >
            <Search className="size-4" /> Bắt Đầu Dò Vé
          </button>
        </form>

        {/* Result Display - Giống message Dò vé số Online */}
        {checkResult && (
          <div
            className={`mt-5 rounded-2xl p-4 border transition-all animate-in zoom-in-95 ${
              checkResult.isWinner
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200'
            }`}
          >
            {checkResult.isWinner ? (
              <div className="space-y-1 text-center">
                <div className="flex items-center justify-center gap-1.5 font-bold text-sm">
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                  <span>
                    {checkResult.prizeName === 'Giải Phụ Đặc Biệt'
                      ? 'Trúng giải phụ Đặc Biệt.'
                      : checkResult.details}
                  </span>
                </div>
                {checkResult.rewardAmount && (
                  <div className="text-center text-xl font-mono font-black text-red-600 dark:text-red-400">
                    Trị giá {checkResult.rewardAmount.replace(/\s+đ$/, 'đ')}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <AlertCircle className="size-5 text-amber-600 shrink-0" />
                <p className="text-sm font-semibold">{checkResult.details}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

