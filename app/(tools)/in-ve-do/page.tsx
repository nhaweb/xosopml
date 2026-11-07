'use client';

import React, { useState, useMemo } from 'react';
import { SiteFrame } from '@/components/site/site-frame';
import { getLotteryResults } from '@/lib/mock-lottery-data';
import { formatDate } from '@/lib/format';
import { Printer, CalendarDays, Check, LayoutGrid } from 'lucide-react';

export default function InVeDoPage() {
  const [selectedRegion, setSelectedRegion] = useState<'south' | 'central' | 'north'>('south');
  const [dayOffset, setDayOffset] = useState(0);

  const activeDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - dayOffset);
    return d;
  }, [dayOffset]);

  const lotteryData = useMemo(() => getLotteryResults(activeDate), [activeDate]);

  const currentProvinces = useMemo(() => {
    if (selectedRegion === 'south') return lotteryData.south;
    if (selectedRegion === 'central') return lotteryData.central;
    return lotteryData.north;
  }, [lotteryData, selectedRegion]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <SiteFrame>
      {/* Controls Bar - Hidden on print */}
      <div className="no-print mb-6 rounded-2xl border bg-card p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              <Printer className="size-4" />
              Công Cụ Đại Lý Vé Số
            </div>
            <h1 className="mt-1 text-2xl font-black text-foreground">In Vé Dò Chuẩn Giấy A4</h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Bố cục vé dò rõ nét, tiết kiệm mực in, tự động căn chỉnh khổ giấy cho đại lý và người bán dạo.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-black text-white shadow-md hover:bg-red-700 transition-all hover:scale-105"
          >
            <Printer className="size-5" /> In Vé Dò Ngay (Ctrl + P)
          </button>
        </div>

        {/* Filter Controls */}
        <div className="mt-5 grid gap-4 border-t pt-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
              Chọn Miền In Vé Dò
            </label>
            <div className="flex gap-2">
              {[
                { id: 'south', label: 'Miền Nam (16h15)' },
                { id: 'central', label: 'Miền Trung (17h15)' },
                { id: 'north', label: 'Miền Bắc (18h15)' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRegion(r.id as 'south' | 'central' | 'north')}
                  className={`flex-1 rounded-xl px-3 py-2 text-xs font-bold border transition-all ${
                    selectedRegion === r.id
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-background hover:bg-muted text-foreground'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
              Chọn Ngày Xem
            </label>
            <div className="flex gap-2">
              {[
                { offset: 0, label: 'Hôm nay' },
                { offset: 1, label: 'Hôm qua' },
                { offset: 2, label: '2 ngày trước' },
                { offset: 3, label: '3 ngày trước' },
              ].map((d) => (
                <button
                  key={d.offset}
                  type="button"
                  onClick={() => setDayOffset(d.offset)}
                  className={`flex-1 rounded-xl px-3 py-2 text-xs font-bold border transition-all ${
                    dayOffset === d.offset
                      ? 'bg-foreground text-background border-foreground shadow-xs'
                      : 'bg-background hover:bg-muted text-foreground'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Printable Sheet (Tờ vé dò A4) */}
      <div className="mx-auto max-w-4xl rounded-2xl border-2 border-black bg-white p-4 sm:p-8 text-black shadow-lg print:border-none print:shadow-none print:p-0">
        {/* Print Header */}
        <div className="border-b-2 border-black pb-3 text-center mb-4">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider">
            KẾT QUẢ XỔ SỐ KIẾN THIẾT {selectedRegion === 'south' ? 'MIỀN NAM' : selectedRegion === 'central' ? 'MIỀN TRUNG' : 'MIỀN BẮC'}
          </h2>
          <p className="font-bold text-sm mt-0.5">
            Ngày mở thưởng: {formatDate(activeDate)}
          </p>
          <p className="text-[11px] text-gray-700 italic">
            (Vé dò in tự động từ XSKT Minh Ngọc · www.xosominhngoc.net.vn)
          </p>
        </div>

        {/* Multi-Province Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-2 border-black text-center text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-black font-black">
                <th className="w-24 border-r-2 border-black p-2 text-xs uppercase">Giải \ Đài</th>
                {currentProvinces.map((p) => (
                  <th key={p.provinceCode} className="border-r last:border-r-0 border-black p-2 font-black text-base">
                    <span>{p.provinceName}</span>
                    <span className="block text-[11px] font-normal">Mã: {p.provinceCode}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y border-black">
              {currentProvinces[0]?.prizes.map((prizeTpl, pIdx) => {
                const isSpecial = prizeTpl.prizeName.includes('Đặc Biệt') || prizeTpl.prizeName.includes('G.ĐB');
                return (
                  <tr key={prizeTpl.prizeName} className={isSpecial ? 'font-black bg-gray-50' : ''}>
                    <th scope="row" className="border-r-2 border-black p-2 text-xs font-bold bg-gray-100">
                      <span>{prizeTpl.prizeName}</span>
                      {prizeTpl.rewardAmount && (
                        <span className="block text-[10px] font-normal text-gray-600">
                          {prizeTpl.rewardAmount}
                        </span>
                      )}
                    </th>
                    {currentProvinces.map((prov) => {
                      const rowNumbers = prov.prizes[pIdx]?.numbers || [];
                      return (
                        <td key={prov.provinceCode} className="border-r last:border-r-0 border-black p-2 font-mono tabular-nums">
                          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
                            {rowNumbers.map((num, nIdx) => (
                              <span
                                key={nIdx}
                                className={isSpecial ? 'text-lg font-black tracking-widest' : 'font-bold text-sm tracking-wider'}
                              >
                                {num}
                                {nIdx < rowNumbers.length - 1 && <span className="text-gray-400 mx-1">·</span>}
                              </span>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Print Footer */}
        <div className="mt-4 border-t-2 border-black pt-2 flex items-center justify-between text-[11px] text-gray-700">
          <span>Đại lý vé số kính chúc quý khách vạn sự may mắn!</span>
          <span>Dò lại vé tại: https://xosominhngoc.net.vn</span>
        </div>
      </div>
    </SiteFrame>
  );
}

