'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight } from 'lucide-react';
import { PROVINCES } from '@/config/lottery-provinces';

const DAYS_OF_WEEK = [
  { dayIndex: 1, label: 'Thứ Hai', short: 'T2' },
  { dayIndex: 2, label: 'Thứ Ba', short: 'T3' },
  { dayIndex: 3, label: 'Thứ Tư', short: 'T4' },
  { dayIndex: 4, label: 'Thứ Năm', short: 'T5' },
  { dayIndex: 5, label: 'Thứ Sáu', short: 'T6' },
  { dayIndex: 6, label: 'Thứ Bảy', short: 'T7' },
  { dayIndex: 0, label: 'Chủ Nhật', short: 'CN' },
];

export function WeeklyScheduleMatrix() {
  const currentDayOfWeek = new Date().getDay();

  const getProvincesForDayAndRegion = (dayIdx: number, region: 'south' | 'central' | 'north') => {
    return PROVINCES.filter((p) => p.region === region && p.drawDays.includes(dayIdx));
  };

  return (
    <section className="mt-10 overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-b bg-muted/40 px-4 py-3.5 sm:px-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
            <Calendar className="size-5" />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground">
              Lịch Mở Thưởng XSKT Trong Tuần
            </h2>
            <p className="text-xs text-muted-foreground">
              Lịch quay số cố định các đài Miền Nam (16h15), Miền Trung (17h15), Miền Bắc (18h15)
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-xs">
          <thead>
            <tr className="border-b bg-muted/60 text-foreground font-bold">
              <th className="w-24 border-r px-3 py-2.5 text-center text-muted-foreground uppercase">
                Miền \ Thứ
              </th>
              {DAYS_OF_WEEK.map((d) => {
                const isToday = d.dayIndex === currentDayOfWeek;
                return (
                  <th
                    key={d.dayIndex}
                    className={`border-r last:border-r-0 px-2 py-2.5 text-center transition-colors ${
                      isToday ? 'bg-red-500/10 text-red-600 dark:text-red-400 font-black' : ''
                    }`}
                  >
                    <span className="block text-sm font-extrabold">{d.label}</span>
                    {isToday && (
                      <span className="inline-block mt-0.5 rounded-full bg-red-600 text-white px-2 py-0.2 text-[10px] font-bold">
                        Hôm nay
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {/* Hàng 1: Miền Nam */}
            <tr className="hover:bg-muted/15 transition-colors">
              <th scope="row" className="border-r px-2 py-3 text-center bg-muted/20 font-black text-red-600 dark:text-red-400">
                <span className="block text-sm font-extrabold">Miền Nam</span>
                <span className="text-[10px] text-muted-foreground font-normal">16:15</span>
              </th>
              {DAYS_OF_WEEK.map((d) => {
                const list = getProvincesForDayAndRegion(d.dayIndex, 'south');
                const isToday = d.dayIndex === currentDayOfWeek;
                return (
                  <td
                    key={d.dayIndex}
                    className={`border-r last:border-r-0 p-2 text-center align-top ${
                      isToday ? 'bg-red-500/5' : ''
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      {list.map((p) => (
                        <Link
                          key={p.id}
                          href={`/${p.region}/${p.id}`}
                          className="rounded-md px-1.5 py-0.5 text-xs font-semibold hover:bg-red-600 hover:text-white transition-colors"
                        >
                          {p.name}
                        </Link>
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Hàng 2: Miền Trung */}
            <tr className="hover:bg-muted/15 transition-colors">
              <th scope="row" className="border-r px-2 py-3 text-center bg-muted/20 font-black text-amber-600 dark:text-amber-400">
                <span className="block text-sm font-extrabold">Miền Trung</span>
                <span className="text-[10px] text-muted-foreground font-normal">17:15</span>
              </th>
              {DAYS_OF_WEEK.map((d) => {
                const list = getProvincesForDayAndRegion(d.dayIndex, 'central');
                const isToday = d.dayIndex === currentDayOfWeek;
                return (
                  <td
                    key={d.dayIndex}
                    className={`border-r last:border-r-0 p-2 text-center align-top ${
                      isToday ? 'bg-red-500/5' : ''
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      {list.map((p) => (
                        <Link
                          key={p.id}
                          href={`/${p.region}/${p.id}`}
                          className="rounded-md px-1.5 py-0.5 text-xs font-semibold hover:bg-amber-600 hover:text-white transition-colors"
                        >
                          {p.name}
                        </Link>
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Hàng 3: Miền Bắc */}
            <tr className="hover:bg-muted/15 transition-colors">
              <th scope="row" className="border-r px-2 py-3 text-center bg-muted/20 font-black text-blue-600 dark:text-blue-400">
                <span className="block text-sm font-extrabold">Miền Bắc</span>
                <span className="text-[10px] text-muted-foreground font-normal">18:15</span>
              </th>
              {DAYS_OF_WEEK.map((d) => {
                const list = getProvincesForDayAndRegion(d.dayIndex, 'north');
                const isToday = d.dayIndex === currentDayOfWeek;
                return (
                  <td
                    key={d.dayIndex}
                    className={`border-r last:border-r-0 p-2 text-center align-top ${
                      isToday ? 'bg-red-500/5' : ''
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      {list.map((p) => (
                        <Link
                          key={p.id}
                          href={`/${p.region}/${p.id}`}
                          className="rounded-md px-1.5 py-0.5 text-xs font-semibold hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          {p.name}
                        </Link>
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

