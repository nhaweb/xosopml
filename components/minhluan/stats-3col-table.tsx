'use client';

import React from 'react';
import Link from 'next/link';
import { BarChart3, Flame, Hash } from 'lucide-react';
import { DayLotteryData } from '@/types/lottery';

interface Stats3ColTableProps {
  lotteryData: DayLotteryData;
}

/**
 * Bảng Section 1 #5 (được dời xuống dưới bảng KQXS theo spec):
 * - Bỏ cột "Lịch Xổ Số" (chỉ giữ 3 cột: Thống kê tần suất xổ số | Gan cực đại | Thống kê Loto)
 * - In đậm chữ và tạo điểm nhấn nổi bật cho thanh title header
 */
export function Stats3ColTable({ lotteryData }: Stats3ColTableProps) {
  const rows: {
    label: string;
    isRegionHeader?: boolean;
    provinceId?: string;
    regionSlug?: string;
  }[] = [
    { label: 'Miền Nam', isRegionHeader: true },
    ...lotteryData.south.map((p) => ({
      label: p.provinceName,
      provinceId: p.provinceId,
      regionSlug: 'mien-nam',
    })),
    { label: 'Miền Bắc', isRegionHeader: true },
    ...lotteryData.north.map((p) => ({
      label: p.provinceName,
      provinceId: p.provinceId,
      regionSlug: 'mien-bac',
    })),
    { label: 'Miền Trung', isRegionHeader: true },
    ...lotteryData.central.map((p) => ({
      label: p.provinceName,
      provinceId: p.provinceId,
      regionSlug: 'mien-trung',
    })),
  ];

  return (
    <section className="overflow-hidden rounded-xl border-2 border-red-600/35 bg-card shadow-md">
      {/* Banner tiêu đề nhấn mạnh */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-[#8f0000] via-[#c41212] to-[#8f0000] px-4 py-2.5 text-white">
        <div className="text-xs sm:text-sm font-black uppercase tracking-wide flex items-center gap-2">
          <Flame className="size-4 text-amber-300" />
          TRUNG TÂM THỐNG KÊ XỔ SỐ NHANH — {lotteryData.formattedDate}
        </div>
        <Link
          href="/dashboard"
          className="rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-black text-black hover:bg-amber-300 transition-colors"
        >
          Phân tích biểu đồ AI →
        </Link>
      </div>

      {/* Bảng 3 Cột (ĐÃ BỎ CỘT LỊCH XỔ SỐ) */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-red-600 bg-gradient-to-b from-amber-100 to-amber-200/90 text-[#8f0000] dark:from-red-950 dark:to-red-900/80 dark:text-amber-300">
              <th className="border-r border-red-300/60 px-3 py-3 text-center text-xs sm:text-sm font-black uppercase tracking-tight">
                <span className="inline-flex items-center gap-1.5">
                  <BarChart3 className="size-4 text-red-600 dark:text-amber-300" />
                  Thống kê tần suất xổ số
                </span>
              </th>
              <th className="border-r border-red-300/60 px-3 py-3 text-center text-xs sm:text-sm font-black uppercase tracking-tight">
                <span className="inline-flex items-center gap-1.5">
                  <Flame className="size-4 text-red-600 dark:text-amber-300" />
                  Gan cực đại
                </span>
              </th>
              <th className="px-3 py-3 text-center text-xs sm:text-sm font-black uppercase tracking-tight">
                <span className="inline-flex items-center gap-1.5">
                  <Hash className="size-4 text-red-600 dark:text-amber-300" />
                  Thống kê Loto
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, idx) => (
              <tr
                key={`${row.label}-${idx}`}
                className={
                  row.isRegionHeader
                    ? 'bg-red-50/70 dark:bg-red-950/25 font-extrabold'
                    : 'bg-card hover:bg-muted/40 transition-colors'
                }
              >
                {/* Cột 1: Thống kê tần suất xổ số */}
                <td className="border-r px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href="/thong-ke/tan-suat"
                      className={`${
                        row.isRegionHeader
                          ? 'font-black text-red-700 dark:text-red-400'
                          : 'font-semibold text-foreground'
                      } hover:text-red-600 hover:underline`}
                    >
                      Tần suất {row.label}
                    </Link>
                    <Link
                      href="/thong-ke/tan-suat"
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Chi tiết!..
                    </Link>
                  </div>
                </td>

                {/* Cột 2: Gan cực đại */}
                <td className="border-r px-3 py-2 text-center">
                  <Link
                    href="/thong-ke/lo-gan"
                    className={`${
                      row.isRegionHeader
                        ? 'font-black text-red-700 dark:text-red-400'
                        : 'font-semibold text-foreground'
                    } hover:text-red-600 hover:underline`}
                  >
                    GCĐ {row.label}
                  </Link>
                </td>

                {/* Cột 3: Thống kê Loto */}
                <td className="px-3 py-2 text-center">
                  <Link
                    href={
                      row.provinceId && row.regionSlug
                        ? `/ket-qua-xo-so/${row.regionSlug}/${row.provinceId}.html`
                        : '/so-dau-duoi'
                    }
                    className={`${
                      row.isRegionHeader
                        ? 'font-black text-red-700 dark:text-red-400'
                        : 'font-semibold text-foreground'
                    } hover:text-red-600 hover:underline`}
                  >
                    Xem Loto {row.label}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

