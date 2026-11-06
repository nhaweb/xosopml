'use client';

import { useMemo, useState } from 'react';
import { TriangleAlert, TrendingUp } from 'lucide-react';
import { PROVINCES } from '@/config/lottery-provinces';
import { SiteFrame } from '@/components/site/site-frame';
import { formatIsoDate } from '@/lib/lottery-date';
import { calculateLoGan, countHotGan } from '@/lib/stats-calculator';

const GAN_THRESHOLD = 15;

const regionLabel: Record<string, string> = {
  south: 'Miền Nam',
  central: 'Miền Trung',
  north: 'Miền Bắc',
};

export default function LoGanPage() {
  const [provinceId, setProvinceId] = useState('ha-noi');

  const items = useMemo(() => calculateLoGan(provinceId), [provinceId]);
  const hotCount = countHotGan(items, GAN_THRESHOLD);
  const province = PROVINCES.find((item) => item.id === provinceId);

  return (
    <SiteFrame>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-red-600 uppercase dark:text-red-400">
            <TrendingUp className="size-4" />
            Thống kê lô gan
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-4xl">Lô gan lâu chưa về</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            100 cặp số từ 00 đến 99, xếp theo số ngày chưa xuất hiện ở 2 số cuối. Số gan trên {GAN_THRESHOLD} ngày được tô đỏ.
          </p>
        </div>

        <label className="block text-xs font-bold text-muted-foreground">
          Đài
          <select
            value={provinceId}
            onChange={(event) => setProvinceId(event.target.value)}
            className="mt-1 block w-full min-w-56 rounded-xl border bg-card px-3 py-2 text-sm font-semibold text-foreground"
          >
            {PROVINCES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {regionLabel[item.region]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase">Đài đang xem</p>
          <p className="mt-1 text-lg font-black">{province?.name}</p>
        </article>
        <article className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase">Gan lâu nhất</p>
          <p className="mt-1 text-lg font-black tabular-nums">{items[0]?.number ?? '—'} · {items[0]?.daysUnopened ?? 0} ngày</p>
        </article>
        <article className="rounded-2xl border border-red-200 bg-red-500/10 p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase">
            <TriangleAlert className="size-3.5" />
            Gan trên {GAN_THRESHOLD} ngày
          </p>
          <p className="mt-1 text-lg font-black text-red-600 tabular-nums">{hotCount} số</p>
        </article>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs tracking-wider text-muted-foreground uppercase">
                <th className="px-4 py-3 font-bold">Hạng</th>
                <th className="px-4 py-3 font-bold">Số</th>
                <th className="px-4 py-3 font-bold">Ngày chưa về</th>
                <th className="px-4 py-3 font-bold">Về gần nhất</th>
                <th className="px-4 py-3 font-bold">Gan max</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item, index) => {
                const hot = item.daysUnopened > GAN_THRESHOLD;
                return (
                  <tr key={item.number} className={hot ? 'bg-red-500/10 text-red-700 dark:text-red-300' : 'hover:bg-muted/30'}>
                    <td className="px-4 py-2.5 font-semibold tabular-nums">{index + 1}</td>
                    <td className="px-4 py-2.5 text-base font-black tabular-nums">{item.number}</td>
                    <td className="px-4 py-2.5 font-bold tabular-nums">
                      {item.daysUnopened} ngày
                      {hot ? <span className="ml-2 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">Gan nóng</span> : null}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">{item.lastDate ? formatIsoDate(item.lastDate) : 'Chưa về trong kỳ'}</td>
                    <td className="px-4 py-2.5 tabular-nums">{item.maxGanHistory} ngày</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </SiteFrame>
  );
}
