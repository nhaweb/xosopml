import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-slate-800 bg-[#0b162c] text-slate-200">
      <div className="mx-auto max-w-[1260px] px-4 py-10 lg:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Cột 1: THƯƠNG HIỆU */}
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <img
                src="/favicon-logo.png"
                alt="Xổ số Minh Luân"
                className="size-11 rounded-full border border-amber-400/60 bg-white object-cover shadow-md"
              />
              <div>
                <div className="text-lg font-black tracking-tight text-white">
                  XỔ SỐ <span className="text-amber-400">MINH LUÂN</span>
                </div>
                <div className="text-[11px] font-medium text-amber-300/90">
                  {siteConfig.slogan}
                </div>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-300">
              Cập nhật kết quả xổ số kiến thiết 3 miền nhanh chóng, chính xác hàng ngày. Dò vé số Online liền tay.
            </p>
            <div className="mt-4 rounded-xl border border-amber-400/40 bg-slate-900/70 p-3 text-[11px] leading-relaxed text-slate-300">
              <span className="font-bold text-amber-400">Lưu ý:</span> {siteConfig.disclaimer}
            </div>
          </div>

          {/* Cột 2: TRA CỨU NHANH */}
          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-white">
              TRA CỨU NHANH
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link href="/#xsmb" className="transition-colors hover:text-amber-400">
                  Xổ số Miền Bắc (XSMB)
                </Link>
              </li>
              <li>
                <Link href="/#xsmt" className="transition-colors hover:text-amber-400">
                  Xổ số Miền Trung (XSMT)
                </Link>
              </li>
              <li>
                <Link href="/#xsmn" className="transition-colors hover:text-amber-400">
                  Xổ số Miền Nam (XSMN)
                </Link>
              </li>
              <li>
                <Link href="/mua-ve-online" className="font-bold text-amber-400 transition-colors hover:text-amber-300">
                  Mua vé số Online (Ảnh vé thật)
                </Link>
              </li>
              <li>
                <Link href="/thong-ke/lo-gan" className="transition-colors hover:text-amber-400">
                  Thống kê Lô Gan cực đại
                </Link>
              </li>
              <li>
                <Link href="/thong-ke/tan-suat" className="transition-colors hover:text-amber-400">
                  Thống kê Tần suất Loto
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: THÔNG TIN & CHÍNH SÁCH */}
          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-white">
              THÔNG TIN &amp; CHÍNH SÁCH
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-amber-400">
                  Giới thiệu &amp; Đăng ký thành viên
                </Link>
              </li>
              <li>
                <Link href="/in-ve-do" className="transition-colors hover:text-amber-400">
                  Hướng dẫn in vé dò chuẩn A4
                </Link>
              </li>
              <li>
                <Link href="/so-mo" className="transition-colors hover:text-amber-400">
                  Sổ mơ lô đề &amp; Con số phong thủy
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-amber-400">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-amber-400">
                  Chính sách bảo mật &amp; Giữ hộ vé
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: KẾT NỐI */}
          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-white">
              KẾT NỐI
            </h3>
            <div className="mb-4 flex items-center gap-3">
              {/* Facebook */}
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Xổ Số Minh Luân"
                className="grid size-10 place-items-center rounded-xl bg-white/10 text-white transition-all hover:scale-105 hover:bg-[#1877F2]"
              >
                <svg className="size-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>

              {/* Zalo */}
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Zalo Xổ Số Minh Luân"
                className="grid size-10 place-items-center rounded-xl bg-white/10 text-xs font-black text-white transition-all hover:scale-105 hover:bg-[#0068FF]"
              >
                Zalo
              </a>

              {/* YouTube Official Channel */}
              <a
                href={siteConfig.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube Xổ Số Minh Luân"
                className="grid size-10 place-items-center rounded-xl bg-white/10 text-white transition-all hover:scale-105 hover:bg-[#FF0000]"
              >
                <svg className="size-6 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <p>
                <span className="text-slate-400">Hotline:</span>{' '}
                <strong className="font-mono text-amber-400">{siteConfig.hotline}</strong>
              </p>
              <p>
                <span className="text-slate-400">Email:</span>{' '}
                <a href={`mailto:${siteConfig.email}`} className="hover:text-amber-400 hover:underline">
                  {siteConfig.email}
                </a>
              </p>
              <p>
                <span className="text-slate-400">YouTube:</span>{' '}
                <a
                  href={siteConfig.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:underline"
                >
                  @xosominhluan
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800/80 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <p>© 2026 {siteConfig.name} — Chuyên trang Kết quả Xổ số Kiến thiết 3 Miền.</p>
          <p>{siteConfig.schedule}</p>
        </div>
      </div>
    </footer>
  );
}

