'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Coins, Gift, Flame, UserPlus } from 'lucide-react';

export function HeroPromoSection() {
  return (
    <section className="mb-6 grid gap-3.5 md:grid-cols-3">
      {/* CỘT TRÁI: Logo "Nắm bắt cơ hội" */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-600 to-rose-700 p-4 sm:p-5 text-white shadow-sm flex flex-col justify-between">
        <div className="absolute -right-6 -bottom-6 size-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-200">
            <Sparkles className="size-3.5" /> Xổ Số PML
          </div>
          <h3 className="mt-2 text-xl sm:text-2xl font-black tracking-tight leading-tight">
            NẮM BẮT CƠ HỘI
          </h3>
          <p className="mt-1 text-xs text-white/80 leading-relaxed">
            Tra cứu siêu tốc, chuẩn từng giây. Đón đầu tài lộc mỗi ngày cùng hệ thống xổ số kiến thiết thông minh.
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3 text-xs font-bold text-amber-200">
          <span>Kỳ mở thưởng 3 miền</span>
          <span className="flex items-center gap-1">16h15 - 18h30 <ArrowRight className="size-3.5" /></span>
        </div>
      </div>

      {/* CỘT GIỮA: "Vận may mở lối! Đăng ký tài khoản ngay!" (Chữ ẩn hiện + Thần tài & Túi tiền) */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-amber-500/10 via-card to-amber-500/5 p-4 sm:p-5 text-center shadow-md flex flex-col items-center justify-between">
        <div className="flex items-center justify-center gap-3 w-full">
          {/* Logo trái: Thần Tài */}
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-red-500 to-amber-600 text-white shadow-md text-xl" title="Thần Tài May Mắn">
            🧧
          </div>

          {/* Text động ẩn hiện */}
          <div className="flex-1">
            <span className="inline-block rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              Đặc Quyền Hội Viên
            </span>
            <div className="mt-1 text-base sm:text-lg font-black tracking-tight text-red-600 dark:text-red-500 animate-pulse transition-opacity duration-700">
              Vận may mở lối! Đăng ký tài khoản ngay!
            </div>
          </div>

          {/* Logo phải: Túi Tiền */}
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-white shadow-md text-xl" title="Túi Tiền Tài Lộc">
            💰
          </div>
        </div>

        <p className="my-2.5 text-xs text-muted-foreground">
          Nhận ngay gợi ý số vàng AI mỗi ngày và lưu vé số dò tự động.
        </p>

        {/* Nút Đăng ký tài khoản (CTA mở lối cho User Dashboard) */}
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-red-600 to-amber-600 px-4 py-2.5 text-xs font-black text-white shadow-md hover:from-red-700 hover:to-amber-700 transition-all hover:scale-[1.02]"
        >
          <UserPlus className="size-4" /> Đăng Ký / Vào User Dashboard
        </Link>
      </div>

      {/* CỘT PHẢI: Banner hấp dẫn thay thế */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-red-500/10 p-4 sm:p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1 rounded-full bg-red-600 text-white px-2.5 py-0.5 text-[10px] font-black uppercase">
              <Flame className="size-3" /> HOT DEAL
            </div>
            <h4 className="mt-2 text-lg sm:text-xl font-black text-foreground leading-snug">
              Quay Thử Cầu May <br />
              <span className="text-red-600 dark:text-red-400">Rinh Ngay Bộ Số Vàng</span>
            </h4>
          </div>
          <span className="text-3xl">🎰</span>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Thử vận may trước giờ quay chính thức với thuật toán số nhảy thông minh.
        </p>

        <div className="mt-3 flex gap-2">
          <Link
            href="/quay-thu"
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all text-center"
          >
            Quay Thử Ngay
          </Link>
          <Link
            href="/thong-ke/tan-suat"
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border bg-background px-3 py-2 text-xs font-bold hover:bg-muted transition-all text-center"
          >
            Xem Tần Suất
          </Link>
        </div>
      </div>
    </section>
  );
}

