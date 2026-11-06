'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SiteFrame } from '@/components/site/site-frame';
import { PROVINCES } from '@/config/lottery-provinces';
import { ProvinceDrawResult, PrizeRow } from '@/types/lottery';
import { calculateLotoHeadTail } from '@/lib/loto-calculator';
import { LotoHeadTailTable } from '@/components/lottery/loto-head-tail-table';
import { audioSynth } from '@/lib/audio-synthesizer';
import { Dices, Play, RotateCcw, Sparkles, Zap } from 'lucide-react';

function randomDigits(length: number): string {
  let res = '';
  for (let i = 0; i < length; i++) {
    res += Math.floor(Math.random() * 10).toString();
  }
  return res;
}

export default function QuayThuPage() {
  const [selectedProvinceId, setSelectedProvinceId] = useState('ha-noi');
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinProgress, setSpinProgress] = useState(0); // 0 to 100
  const [testResult, setTestResult] = useState<ProvinceDrawResult | null>(null);

  const selectedProvince = PROVINCES.find((p) => p.id === selectedProvinceId) || PROVINCES[0];
  const isNorth = selectedProvince.region === 'north';

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sinh bộ khung giải thưởng mặc định
  const generateBlankPrizes = (): PrizeRow[] => {
    if (isNorth) {
      return [
        { prizeName: 'G.Đặc Biệt', prizeOrder: 1, rewardAmount: '1 Tỷ đ', numbers: ['-----'] },
        { prizeName: 'G.Nhất', prizeOrder: 2, rewardAmount: '10.000.000 đ', numbers: ['-----'] },
        { prizeName: 'G.Nhì', prizeOrder: 3, rewardAmount: '5.000.000 đ', numbers: ['-----', '-----'] },
        { prizeName: 'G.Ba', prizeOrder: 4, rewardAmount: '1.000.000 đ', numbers: ['-----', '-----', '-----', '-----', '-----', '-----'] },
        { prizeName: 'G.Tư', prizeOrder: 5, rewardAmount: '400.000 đ', numbers: ['----', '----', '----', '----'] },
        { prizeName: 'G.Năm', prizeOrder: 6, rewardAmount: '200.000 đ', numbers: ['----', '----', '----', '----', '----', '----'] },
        { prizeName: 'G.Sáu', prizeOrder: 7, rewardAmount: '100.000 đ', numbers: ['---', '---', '---'] },
        { prizeName: 'G.Bảy', prizeOrder: 8, rewardAmount: '40.000 đ', numbers: ['--', '--', '--', '--'] },
      ];
    }
    return [
      { prizeName: 'G.Tám', prizeOrder: 1, rewardAmount: '100.000 đ', numbers: ['--'] },
      { prizeName: 'G.Bảy', prizeOrder: 2, rewardAmount: '200.000 đ', numbers: ['---'] },
      { prizeName: 'G.Sáu', prizeOrder: 3, rewardAmount: '400.000 đ', numbers: ['----', '----', '----'] },
      { prizeName: 'G.Năm', prizeOrder: 4, rewardAmount: '1.000.000 đ', numbers: ['----'] },
      { 
        prizeName: 'G.Tư', 
        prizeOrder: 5, 
        rewardAmount: '3.000.000 đ', 
        numbers: ['-----', '-----', '-----', '-----', '-----', '-----', '-----'] 
      },
      { prizeName: 'G.Ba', prizeOrder: 6, rewardAmount: '10.000.000 đ', numbers: ['-----', '-----'] },
      { prizeName: 'G.Nhì', prizeOrder: 7, rewardAmount: '15.000.000 đ', numbers: ['-----'] },
      { prizeName: 'G.Nhất', prizeOrder: 8, rewardAmount: '30.000.000 đ', numbers: ['-----'] },
      { prizeName: 'G.Đặc Biệt', prizeOrder: 9, rewardAmount: '2 Tỷ đ', numbers: ['------'] },
    ];
  };

  const startSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSpinProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setSpinProgress(progress);
      audioSynth.playDrawChime();

      // Sinh số ngẫu nhiên liên tục tạo hiệu ứng quay
      const animatedPrizes: PrizeRow[] = isNorth
        ? [
            { prizeName: 'G.Đặc Biệt', prizeOrder: 1, rewardAmount: '1 Tỷ đ', numbers: [randomDigits(5)] },
            { prizeName: 'G.Nhất', prizeOrder: 2, rewardAmount: '10.000.000 đ', numbers: [randomDigits(5)] },
            { prizeName: 'G.Nhì', prizeOrder: 3, rewardAmount: '5.000.000 đ', numbers: [randomDigits(5), randomDigits(5)] },
            { prizeName: 'G.Ba', prizeOrder: 4, rewardAmount: '1.000.000 đ', numbers: Array.from({ length: 6 }, () => randomDigits(5)) },
            { prizeName: 'G.Tư', prizeOrder: 5, rewardAmount: '400.000 đ', numbers: Array.from({ length: 4 }, () => randomDigits(4)) },
            { prizeName: 'G.Năm', prizeOrder: 6, rewardAmount: '200.000 đ', numbers: Array.from({ length: 6 }, () => randomDigits(4)) },
            { prizeName: 'G.Sáu', prizeOrder: 7, rewardAmount: '100.000 đ', numbers: Array.from({ length: 3 }, () => randomDigits(3)) },
            { prizeName: 'G.Bảy', prizeOrder: 8, rewardAmount: '40.000 đ', numbers: Array.from({ length: 4 }, () => randomDigits(2)) },
          ]
        : [
            { prizeName: 'G.Tám', prizeOrder: 1, rewardAmount: '100.000 đ', numbers: [randomDigits(2)] },
            { prizeName: 'G.Bảy', prizeOrder: 2, rewardAmount: '200.000 đ', numbers: [randomDigits(3)] },
            { prizeName: 'G.Sáu', prizeOrder: 3, rewardAmount: '400.000 đ', numbers: Array.from({ length: 3 }, () => randomDigits(4)) },
            { prizeName: 'G.Năm', prizeOrder: 4, rewardAmount: '1.000.000 đ', numbers: [randomDigits(4)] },
            { prizeName: 'G.Tư', prizeOrder: 5, rewardAmount: '3.000.000 đ', numbers: Array.from({ length: 7 }, () => randomDigits(5)) },
            { prizeName: 'G.Ba', prizeOrder: 6, rewardAmount: '10.000.000 đ', numbers: Array.from({ length: 2 }, () => randomDigits(5)) },
            { prizeName: 'G.Nhì', prizeOrder: 7, rewardAmount: '15.000.000 đ', numbers: [randomDigits(5)] },
            { prizeName: 'G.Nhất', prizeOrder: 8, rewardAmount: '30.000.000 đ', numbers: [randomDigits(5)] },
            { prizeName: 'G.Đặc Biệt', prizeOrder: 9, rewardAmount: '2 Tỷ đ', numbers: [randomDigits(6)] },
          ];

      setTestResult({
        provinceId: selectedProvince.id,
        provinceName: selectedProvince.name,
        provinceCode: selectedProvince.code,
        drawDate: 'Hôm nay',
        prizes: animatedPrizes,
      });

      if (progress >= 100) {
        clearInterval(interval);
        setIsSpinning(false);
        audioSynth.playWinFanfare();
      }
    }, 150);

    timerRef.current = interval;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const displayResult = testResult || {
    provinceId: selectedProvince.id,
    provinceName: selectedProvince.name,
    provinceCode: selectedProvince.code,
    drawDate: 'Chưa quay',
    prizes: generateBlankPrizes(),
  };

  return (
    <SiteFrame>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            <Dices className="size-4 animate-spin-slow" />
            Tiện Ích Cầu May
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-4xl text-foreground">
            Quay Thử Xổ Số {selectedProvince.name}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Quay thử ngẫu nhiên theo thuật toán xác suất xổ số kiến thiết. Kết quả mang tính tham khảo giải trí trước giờ quay chính thức.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedProvinceId}
            onChange={(e) => {
              setSelectedProvinceId(e.target.value);
              setTestResult(null);
            }}
            className="rounded-xl border bg-card px-3.5 py-2.5 text-sm font-bold text-foreground shadow-xs focus:ring-2 focus:ring-red-500"
          >
            {PROVINCES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={startSpin}
            disabled={isSpinning}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-black text-white shadow-md hover:bg-red-700 disabled:opacity-50 transition-all hover:scale-105"
          >
            {isSpinning ? (
              <>
                <Zap className="size-4 animate-bounce" /> Đang Quay...
              </>
            ) : (
              <>
                <Play className="size-4" /> Bắt Đầu Quay Thử
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {isSpinning && (
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-red-600 transition-all duration-150"
            style={{ width: `${spinProgress}%` }}
          />
        </div>
      )}

      {/* Bảng Kết Quả Quay Thử */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="border-b bg-muted/40 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Sparkles className="size-4 text-amber-500" />
            Bảng Số Quay Thử Đài {selectedProvince.name}
          </div>
          {testResult && (
            <button
              type="button"
              onClick={() => setTestResult(null)}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3.5" /> Xóa quay lại
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-28 border-r px-3 py-2.5 text-center text-xs font-bold uppercase text-muted-foreground">
                  Giải
                </th>
                <th className="px-3 py-2.5 text-center text-base font-extrabold text-foreground">
                  Số Trúng
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayResult.prizes.map((prize, idx) => {
                const isSpecial = prize.prizeName.includes('Đặc Biệt');
                return (
                  <tr
                    key={prize.prizeName}
                    className={isSpecial ? 'bg-red-500/5 font-bold' : idx % 2 === 0 ? 'bg-card' : 'bg-muted/15'}
                  >
                    <th
                      scope="row"
                      className={`border-r px-3 py-2 text-center text-xs font-bold ${
                        isSpecial ? 'text-red-600 font-black' : 'text-foreground'
                      }`}
                    >
                      {prize.prizeName}
                    </th>
                    <td className="px-3 py-2 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                        {prize.numbers.map((num, nIdx) => (
                          <span
                            key={nIdx}
                            className={`font-mono tabular-nums tracking-widest ${
                              isSpecial
                                ? 'text-xl font-black text-red-600'
                                : 'text-base font-bold text-foreground'
                            }`}
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bảng Lô Tô Đầu Đuôi của lần quay thử */}
        {testResult && (
          <LotoHeadTailTable provinces={[testResult]} highlightDigit={null} />
        )}
      </div>
    </SiteFrame>
  );
}
