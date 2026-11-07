'use client';

import React, { useState, useEffect } from 'react';
import { Radio, Clock, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { audioSynth } from '@/lib/audio-synthesizer';

export function LiveCountdownBanner() {
  const [now, setNow] = useState(new Date());
  const [soundOn, setSoundOn] = useState(audioSynth.enabled);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const currentTotalSeconds = hours * 3600 + minutes * 60 + seconds;

  // Lịch quay:
  // XSMN: 16:15 (58500s) -> 16:35 (59700s)
  // XSMT: 17:15 (62100s) -> 17:35 (63300s)
  // XSMB: 18:15 (65700s) -> 18:35 (66900s)
  let statusText = '';
  let isLive = false;
  let targetTotalSeconds = 0;
  let nextRegion = '';

  if (currentTotalSeconds < 58500) {
    statusText = 'Chờ mở thưởng XSMN';
    targetTotalSeconds = 58500;
    nextRegion = 'Miền Nam (16h15)';
  } else if (currentTotalSeconds >= 58500 && currentTotalSeconds <= 59700) {
    statusText = 'Đang quay trực tiếp XSMN';
    isLive = true;
    nextRegion = 'Xổ Số Miền Nam';
  } else if (currentTotalSeconds < 62100) {
    statusText = 'Chờ mở thưởng XSMT';
    targetTotalSeconds = 62100;
    nextRegion = 'Miền Trung (17h15)';
  } else if (currentTotalSeconds >= 62100 && currentTotalSeconds <= 63300) {
    statusText = 'Đang quay trực tiếp XSMT';
    isLive = true;
    nextRegion = 'Xổ Số Miền Trung';
  } else if (currentTotalSeconds < 65700) {
    statusText = 'Chờ mở thưởng XSMB';
    targetTotalSeconds = 65700;
    nextRegion = 'Miền Bắc (18h15)';
  } else if (currentTotalSeconds >= 65700 && currentTotalSeconds <= 66900) {
    statusText = 'Đang quay trực tiếp XSMB';
    isLive = true;
    nextRegion = 'Xổ Số Miền Bắc';
  } else {
    statusText = 'Đã hoàn tất kỳ quay hôm nay';
    nextRegion = 'Kỳ quay ngày mai';
  }

  const diffSeconds = targetTotalSeconds > currentTotalSeconds ? targetTotalSeconds - currentTotalSeconds : 0;
  const countHours = Math.floor(diffSeconds / 3600);
  const countMins = Math.floor((diffSeconds % 3600) / 60);
  const countSecs = diffSeconds % 60;

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    audioSynth.enabled = next;
    if (next) audioSynth.playDrawChime();
  };

  return (
    <div
      className={`relative mb-6 overflow-hidden rounded-2xl border transition-all ${
        isLive
          ? 'border-red-500 bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg animate-pulse'
          : 'border-border bg-card p-3.5 sm:p-4 text-foreground shadow-xs'
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-2">
        {/* Status Label */}
        <div className="flex items-center gap-3">
          <span
            className={`grid size-9 place-items-center rounded-xl font-bold shadow-xs ${
              isLive ? 'bg-white text-red-600' : 'bg-red-500/10 text-red-600 dark:text-red-400'
            }`}
          >
            {isLive ? <Radio className="size-5 animate-spin-slow" /> : <Clock className="size-5" />}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black uppercase tracking-wider ${isLive ? 'text-amber-200' : 'text-red-600 dark:text-red-400'}`}>
                {isLive ? '🔴 TRỰC TIẾP' : 'HỆ THỐNG TRỰC TIẾP MINH NGỌC'}
              </span>
              <span className="text-[11px] opacity-75">· {now.toLocaleTimeString('vi-VN')}</span>
            </div>
            <p className="font-extrabold text-sm sm:text-base">
              {statusText}: <span className={isLive ? 'underline decoration-amber-300 font-black' : 'text-primary'}>{nextRegion}</span>
            </p>
          </div>
        </div>

        {/* Countdown Timer or Live Animation */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          {!isLive && diffSeconds > 0 ? (
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold bg-muted/60 px-3 py-1.5 rounded-xl border">
              <span className="text-muted-foreground">Đếm ngược:</span>
              <span className="text-red-600 dark:text-red-400 font-black tabular-nums text-sm">
                {String(countHours).padStart(2, '0')}:{String(countMins).padStart(2, '0')}:{String(countSecs).padStart(2, '0')}
              </span>
            </div>
          ) : isLive ? (
            <div className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-1.5 text-xs font-black text-amber-200">
              <Sparkles className="size-4 animate-spin" /> Đang cập nhật từng bóng số
            </div>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">Chúc quý khách may mắn!</span>
          )}

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-xs ${
              isLive
                ? 'bg-white text-red-600 hover:bg-amber-100'
                : soundOn
                ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/40 dark:border-red-900'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            title={soundOn ? 'Tắt âm thanh chuông xổ' : 'Bật âm thanh chuông xổ'}
          >
            {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
            <span className="hidden md:inline">{soundOn ? 'Chuông: BẬT' : 'Chuông: TẮT'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

