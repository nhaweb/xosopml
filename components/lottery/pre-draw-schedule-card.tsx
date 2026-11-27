'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Loader2, Radio } from 'lucide-react';
import { getProvincesByDay, sortProvincesCanonical } from '@/config/lottery-provinces';
import { Region } from '@/types/lottery';
import { REGION_DRAW_WINDOWS } from '@/lib/draw-schedule-status';

interface PreDrawScheduleCardProps {
  id: string;
  region: Region;
  date: Date;
  formattedDate: string;
}

export function PreDrawScheduleCard({
  id,
  region,
  date,
  formattedDate,
}: PreDrawScheduleCardProps) {
  const win = REGION_DRAW_WINDOWS[region];
  const provinces = sortProvincesCanonical(getProvincesByDay(date.getDay(), region));
  const regionSlug =
    region === 'south' ? 'mien-nam' : region === 'central' ? 'mien-trung' : 'mien-bac';

  return (
    <section
      id={id}
      className="overflow-hidden rounded-xl border-2 border-amber-500/60 bg-card shadow-sm"
    >
      {/* Header đỏ chuẩn */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-[#8f0000] via-[#b80c0c] to-[#8f0000] px-4 py-2.5 text-white">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-white/15 text-amber-300">
            <Radio className="size-4 animate-pulse" />
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-white">
              TRỰC TIẾP XỔ SỐ {win.label.toUpperCase()} - {formattedDate}
            </h2>
            <p className="flex items-center gap-1 text-[11px] text-amber-100/90">
              <Clock className="size-3" /> Giờ mở thưởng: {win.drawTimeLabel} · Sắp bắt đầu quay số
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-black text-red-950 shadow-xs">
          <Loader2 className="size-3.5 animate-spin" />
          Sắp mở thưởng
        </span>
      </div>

      {/* Nội dung cận giờ mở thưởng với hiệu ứng xoay */}
      <div className="p-5 text-center">
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full border-2 border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400">
          <Loader2 className="size-8 animate-spin" />
        </div>
        <h3 className="text-base font-black text-foreground">
          Sắp tới giờ quay thưởng Xổ Số {win.label} ({win.drawTimeLabel})
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Hệ thống đang kết nối trực tiếp trường quay — kết quả sẽ tự động cập nhật ngay khi có giải đầu tiên.
        </p>

        {/* Lịch mở thưởng các đài ngày hôm nay */}
        <div className="mt-4 rounded-xl border bg-muted/30 p-3.5">
          <div className="mb-2.5 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
            Lịch mở thưởng {win.label} ngày {formattedDate} ({provinces.length} đài)
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {provinces.map((p) => (
              <Link
                key={p.id}
                href={`/ket-qua-xo-so/${regionSlug}/${p.id}`}
                className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-left transition-colors hover:border-red-500/50 hover:bg-red-50/40 dark:hover:bg-red-950/20"
              >
                <div>
                  <div className="text-xs font-black text-foreground">{p.name}</div>
                  <div className="text-[10px] font-semibold text-muted-foreground">
                    Mã đài: {p.code} · {p.drawTime}
                  </div>
                </div>
                <Loader2 className="size-4 shrink-0 animate-spin text-amber-500" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

