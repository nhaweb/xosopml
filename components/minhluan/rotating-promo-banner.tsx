'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

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
      className="group relative mb-4 block overflow-hidden rounded-xl border-2 border-amber-400 bg-gradient-to-r from-[#ffbf00] via-[#ffe066] to-[#ffae00] px-3 py-3 sm:px-5 sm:py-3.5 shadow-md transition-transform hover:scale-[1.005]"
    >
      {/* Sparkle light overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.65),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.45),transparent_40%)]" />

      <div className="relative flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo Trái: Thần Tài (dùng chính favicon Thần Tài của Minh Luân) */}
        <div className="shrink-0">
          <img
            src="/favicon-logo.png"
            alt="Thần Tài Minh Luân"
            className="size-12 sm:size-16 rounded-full border-2 border-red-600 bg-white object-cover shadow-md transition-transform group-hover:rotate-3"
          />
        </div>

        {/* Giữa: 2 dòng chữ thay đổi cho nhau trên banner (#9 ở vị trí #5) */}
        <div
          className={`flex-1 text-center transition-all duration-300 ${
            visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-1 scale-95'
          }`}
        >
          <div className="inline-flex items-center gap-1 rounded-full bg-red-700 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-200 shadow-2xs">
            <Sparkles className="size-3" /> Xổ Số Minh Luân
          </div>
          <div className="mt-1 text-lg sm:text-2xl md:text-[26px] font-black uppercase tracking-tight text-[#b80000] drop-shadow-[0_1.5px_0_rgba(255,255,255,0.95)]">
            {current.text}
          </div>
          <div className="mt-0.5 hidden sm:flex items-center justify-center gap-1.5 text-xs font-extrabold text-[#5c1600]">
            <span>{current.subtext}</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-red-700 px-2 py-0.5 text-[10px] font-black text-white">
              {current.cta} <ArrowRight className="size-3" />
            </span>
          </div>
        </div>

        {/* Logo Phải: Túi Tiền Tài Lộc */}
        <div className="grid size-12 sm:size-16 shrink-0 place-items-center rounded-full border-2 border-red-600 bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 text-2xl sm:text-4xl shadow-md transition-transform group-hover:-rotate-3">
          💰
        </div>
      </div>

      {/* Indicator dots */}
      <div className="relative mt-1.5 flex justify-center gap-1.5">
        {SLIDES.map((s, idx) => (
          <span
            key={s.text}
            className={`h-1.5 rounded-full transition-all ${
              idx === index ? 'w-6 bg-red-700' : 'w-1.5 bg-red-700/35'
            }`}
          />
        ))}
      </div>
    </Link>
  );
}

