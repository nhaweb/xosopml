'use client';

import React, { useState, useMemo } from 'react';
import { SiteFrame } from '@/components/site/site-frame';
import { getLotteryResults } from '@/lib/mock-lottery-data';
import { shortDate, formatDate } from '@/lib/format';
import { ScrollText, Calendar, Filter } from 'lucide-react';

interface SoRow {
  date: Date;
  dateStr: string;
  dayOfWeek: string;
  specialTails: { province: string; specialTail: string; eightTail: string }[];
}

export default function SoDauDuoiPage() {
  const [selectedRegion, setSelectedRegion] = useState<'south' | 'central' | 'north'>('south');

  // Sinh 14 ngày gần nhất để làm sớ đầu đuôi
  const sớRows: SoRow[] = useMemo(() => {
    const rows: SoRow[] = [];
    const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const res = getLotteryResults(d);
      const provs = selectedRegion === 'south' ? res.south : selectedRegion === 'central' ? res.central : res.north;

      const specialTails = provs.map((p) => {
        const sp = p.prizes.find((pz) => pz.prizeName.includes('Đặc Biệt'));
        const eg = p.prizes.find((pz) => pz.prizeName.includes('G.Tám') || pz.prizeName.includes('G.Bảy'));
        const spNum = sp?.numbers[0] || '00';
        const egNum = eg?.numbers[0] || '00';

        return {
          province: p.provinceName,
          specialTail: spNum.slice(-2),
          eightTail: egNum.slice(-2),
        };
      });

      rows.push({
        date: d,
        dateStr: shortDate(d),
        dayOfWeek: weekdays[d.getDay()],
        specialTails,
      });
    }

    return rows;
  }, [selectedRegion]);

  return (
    <SiteFrame>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            <ScrollText className="size-4" />
            Sớ Đầu Đuôi Minh Ngọc
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-4xl text-foreground">
            Sớ Lô Tô Giải Đặc Biệt & Giải 8
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-muted-foreground">
            Bảng thống kê liên tục 2 số cuối Giải Đặc biệt và Giải Tám qua 14 ngày gần nhất, giúp soi cầu và phát hiện nhịp về.
          </p>
        </div>

        {/* Region Selector */}
        <div className="inline-flex rounded-xl border bg-card p-1 shadow-xs">
          {[
            { id: 'south', label: 'Miền Nam' },
            { id: 'central', label: 'Miền Trung' },
            { id: 'north', label: 'Miền Bắc' },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRegion(r.id as 'south' | 'central' | 'north')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                selectedRegion === r.id
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'hover:bg-muted text-foreground'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sớ Matrix Table */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b bg-muted/60 text-foreground font-bold">
                <th className="w-24 border-r px-3 py-3 text-center">Ngày Quay</th>
                <th className="w-16 border-r px-2 py-3 text-center">Thứ</th>
                <th className="px-3 py-3 text-center">Chi Tiết Đầu Đuôi Các Đài (Giải 8 - Giải Đặc Biệt)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sớRows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? 'bg-card' : 'bg-muted/10'}`}
                >
                  <th scope="row" className="border-r px-3 py-3 font-mono font-bold text-center">
                    {row.dateStr}
                  </th>
                  <td className="border-r px-2 py-3 text-center font-bold text-muted-foreground">
                    <span className={`px-2 py-0.5 rounded text-xs ${row.dayOfWeek === 'CN' ? 'bg-red-500/10 text-red-600' : ''}`}>
                      {row.dayOfWeek}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                      {row.specialTails.map((item, pIdx) => (
                        <div
                          key={pIdx}
                          className="flex items-center gap-2 rounded-xl border bg-background px-3 py-1.5 shadow-2xs"
                        >
                          <span className="text-xs font-extrabold text-foreground">{item.province}:</span>
                          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-bold text-muted-foreground" title="Giải 8/Bảy">
                            {item.eightTail}
                          </span>
                          <span className="font-mono text-base font-black text-red-600 dark:text-red-400" title="Giải Đặc Biệt">
                            {item.specialTail}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SiteFrame>
  );
}
