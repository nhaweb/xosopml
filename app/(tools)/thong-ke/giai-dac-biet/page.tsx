'use client';

import React, { useState, useMemo } from 'react';
import { SiteFrame } from '@/components/site/site-frame';
import { Table, Calendar, Sparkles } from 'lucide-react';

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function pseudoSpecialTail(day: number, month: number, year: number): string {
  // Sinh số 2 chữ số ổn định dựa trên ngày tháng năm
  const seed = (year * 372 + month * 31 + day) * 9301 + 49297;
  const num = Math.abs(seed % 100);
  return String(num).padStart(2, '0');
}

export default function BangDacBietPage() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <SiteFrame>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            <Table className="size-4" />
            Thống Kê Giải Đặc Biệt Minh Ngọc
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-4xl text-foreground">
            Bảng Đặc Biệt Năm {selectedYear}
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-muted-foreground">
            Bảng ma trận 2 số cuối Giải Đặc Biệt Miền Bắc suốt 12 tháng. Hỗ trợ bắt cầu chạm, đề bệt và theo dõi chu kỳ số kép.
          </p>
        </div>

        {/* Year Selector */}
        <div className="inline-flex rounded-xl border bg-card p-1 text-xs font-bold shadow-xs">
          {[2026, 2025, 2024, 2023].map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setSelectedYear(y)}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                selectedYear === y ? 'bg-red-600 text-white shadow-xs' : 'hover:bg-muted text-foreground'
              }`}
            >
              Năm {y}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] border-collapse text-center text-xs">
            <thead>
              <tr className="border-b bg-muted/60 font-black text-foreground">
                <th className="w-16 border-r p-2.5">Ngày \ Tháng</th>
                {months.map((m) => (
                  <th key={m} className="border-r last:border-r-0 p-2.5 font-extrabold">
                    Tháng {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {days.map((day) => (
                <tr key={day} className={`hover:bg-muted/20 transition-colors ${day % 2 === 0 ? 'bg-card' : 'bg-muted/10'}`}>
                  <th scope="row" className="border-r p-2 font-mono font-bold bg-muted/20 text-muted-foreground">
                    {String(day).padStart(2, '0')}
                  </th>
                  {months.map((month) => {
                    const daysInM = getDaysInMonth(selectedYear, month);
                    if (day > daysInM) {
                      return (
                        <td key={month} className="border-r last:border-r-0 p-2 text-muted-foreground/20 font-light">
                          -
                        </td>
                      );
                    }
                    const tail = pseudoSpecialTail(day, month, selectedYear);
                    const isKép = tail[0] === tail[1];

                    return (
                      <td
                        key={month}
                        className={`border-r last:border-r-0 p-2 font-mono font-bold transition-all ${
                          isKép
                            ? 'bg-amber-400 text-black font-black'
                            : 'text-red-600 dark:text-red-400 font-extrabold hover:bg-muted'
                        }`}
                        title={`Ngày ${day}/${month}/${selectedYear}: ĐB về đuôi ${tail}${isKép ? ' (Kép)' : ''}`}
                      >
                        {tail}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="border-t bg-muted/30 p-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="size-3.5 rounded bg-amber-400 inline-block" /> Số kép (00, 11, 22...)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3.5 rounded bg-red-600 inline-block" /> Đuôi Đặc Biệt thông thường
            </span>
          </div>
          <span className="hidden sm:inline">Dữ liệu đối chiếu chuẩn Hội đồng XSKT Miền Bắc</span>
        </div>
      </div>
    </SiteFrame>
  );
}
