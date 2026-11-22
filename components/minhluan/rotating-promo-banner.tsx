'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Coins } from 'lucide-react';

const SLIDES = [
  {
    text: 'MUA VÉ SỐ ONLINE',
    subtext: 'Chọn vé theo ảnh chụp thật · Giao tận nơi < 5km hoặc Giữ hộ an toàn',
    href: '/mua-ve-online',
    cta: 'Chọn Số Ngay',
  },
  {
    text: 'ĐĂNG KÝ THÀNH VIÊN NGAY',
    subtext: 'Lưu số yêu thích · Con số phong thủy hôm nay · Trợ lý AI Xổ Số',
    href: '/dashboard',
    cta: 'Vào Dashboard',
  },
];

export function RotatingPromoBanner() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % SLIDES.length);
        setVisible(true);
      }, 320);
    }, 3400);
    return () => clearInterval(timer);
  }, []);

  const current = SLIDES[index];

  return (
    <Link
      href={current.href}
      className="group relative mb-4 block overflow-hidden rounded-xl border-2 border-amber-400/90 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 dark:from-amber-500/20 dark:via-yellow-500/15 dark:to-amber-600/25 px-3 py-3 sm:px-5 sm:py-3.5 shadow-sm transition-transform hover:scale-[1.005]"
    >
      {/* Soft glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.55),transparent_55%)] dark:bg-none" />

      <div className="relative flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo Trái: Thần Tài */}
        <div className="shrink-0">
          <img
            src="/favicon-logo.png"
            alt="Thần Tài Minh Luân"
            className="size-12 sm:size-16 rounded-full border-2 border-[#a80808] bg-white object-cover shadow-md transition-transform group-hover:rotate-3"
          />
        </div>

        {/* Giữa: 2 dòng chữ thay đổi cho nhau trên banner */}
        <div
          className={`flex-1 text-center transition-all duration-300 ${
            visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-1 scale-95'
          }`}
        >
          <div className="inline-flex items-center gap-1 rounded-full bg-[#9e0b0f] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-200 shadow-2xs">
            <Sparkles className="size-3" /> Xổ Số Minh Luân
          </div>
          <div className="mt-1 text-lg sm:text-2xl md:text-[26px] font-extrabold uppercase tracking-wide text-[#9e0b0f] dark:text-amber-300">
            {current.text}
          </div>
          <div className="mt-0.5 hidden sm:flex items-center justify-center gap-1.5 text-xs font-bold text-[#5c1600] dark:text-amber-100/90">
            <span>{current.subtext}</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[#9e0b0f] px-2.5 py-0.5 text-[10px] font-bold text-white">
              {current.cta} <ArrowRight className="size-3" />
            </span>
          </div>
        </div>

        {/* Logo Phải: Huy hiệu Tài Lộc đồng bộ */}
        <div className="grid size-12 sm:size-16 shrink-0 place-items-center rounded-full border-2 border-[#a80808] bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-[#7c0000] shadow-md transition-transform group-hover:-rotate-3">
          <Coins className="size-6 sm:size-8 stroke-[2.2]" />
        </div>
      </div>

      {/* Indicator dots */}
      <div className="relative mt-1.5 flex justify-center gap-1.5">
        {SLIDES.map((s, idx) => (
          <span
            key={s.text}
            className={`h-1.5 rounded-full transition-all ${
              idx === index ? 'w-6 bg-[#9e0b0f] dark:bg-amber-400' : 'w-1.5 bg-[#9e0b0f]/30 dark:bg-amber-400/35'
            }`}
          />
        ))}
      </div>
    </Link>
  );
}
