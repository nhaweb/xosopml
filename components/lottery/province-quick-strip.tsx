'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PROVINCES } from '@/config/lottery-provinces';
import { MapPin, ChevronRight } from 'lucide-react';

export function ProvinceQuickStrip() {
  const [activeRegion, setActiveRegion] = useState<'south' | 'central' | 'north'>('south');
  const todayDayOfWeek = new Date().getDay();

  const filteredProvinces = PROVINCES.filter((p) => p.region === activeRegion);

  return (
    <div className="mb-6 rounded-2xl border bg-card p-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 px-1">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-foreground">
          <MapPin className="size-4 text-red-600" />
          <span>Tra cứu nhanh theo đài:</span>
        </div>

        {/* Region Pills */}
        <div className="inline-flex rounded-lg border bg-muted/40 p-0.5 text-xs font-bold">
          {[
            { id: 'south', label: 'Miền Nam (21 đài)' },
            { id: 'central', label: 'Miền Trung (14 đài)' },
            { id: 'north', label: 'Miền Bắc (6 đài)' },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setActiveRegion(r.id as 'south' | 'central' | 'north')}
              className={`rounded-md px-2.5 py-1 transition-all ${
                activeRegion === r.id
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Scroll Strip */}
      <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {filteredProvinces.map((p) => {
          const isDrawToday = p.drawDays.includes(todayDayOfWeek);
          return (
            <Link
              key={p.id}
              href={`/${p.region}/${p.id}`}
              className={`shrink-0 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all hover:scale-105 ${
                isDrawToday
                  ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
                  : 'border-border bg-background hover:bg-muted text-foreground'
              }`}
            >
              <span>{p.name}</span>
              {isDrawToday && (
                <span className="size-2 rounded-full bg-red-600 animate-pulse" title="Hôm nay có mở thưởng" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
