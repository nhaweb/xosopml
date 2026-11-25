'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SiteFrame } from '@/components/site/site-frame';
import { AlertCircle, ArrowRight, CheckCircle2, Lock, Mail, Phone, User } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    message: string;
    memberCode?: string;
    verifyUrl?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!acceptedTerms) {
      setError('Vui lòng tick đồng ý với Điều khoản sử dụng và Chính sách xử lý dữ liệu cá nhân.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phoneNumber,
          password,
          acceptedTerms,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Không thể đăng ký tài khoản.');
        return;
      }
      setSuccessData({
        message: json.message,
        memberCode: json.user?.memberCode,
        verifyUrl: json.verifyUrl,
      });
    } catch {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteFrame>
      <div className="mx-auto max-w-md rounded-3xl border bg-card p-6 sm:p-8 shadow-md">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-600/10 px-3 py-1 text-xs font-black uppercase text-red-600 dark:text-red-400">
            XSKT Minh Luân
          </div>
          <h1 className="mt-2 text-2xl font-black text-foreground">Tạo Tài Khoản Mới</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Đăng ký nhanh để mua vé số online, giữ hộ két an toàn và tra cứu phong thủy
          </p>
        </div>

        {successData ? (
          <div className="mt-6 space-y-4 rounded-2xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30 p-5 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-600 text-white shadow-sm">
              <CheckCircle2 className="size-7" />
            </div>
            <div>
              <h2 className="text-base font-black text-emerald-800 dark:text-emerald-300">
                Đăng Ký Thành Công! ({successData.memberCode})
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-emerald-900 dark:text-emerald-200">
                Vui lòng <strong>vào Gmail kiểm tra email</strong> và bấm vào link{' '}
                <strong>Xác thực tài khoản</strong> trước khi kích hoạt đăng nhập.
              </p>
            </div>
            {successData.verifyUrl && (
              <div className="rounded-xl border border-emerald-500/30 bg-background/80 p-3 text-[11px]">
                <div className="text-muted-foreground mb-1.5">
                  Liên kết xác thực nhanh (môi trường kiểm thử):
                </div>
                <a
                  href={successData.verifyUrl}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-700"
                >
                  Xác thực tài khoản ngay <ArrowRight className="size-3.5" />
                </a>
              </div>
            )}
            <Link
              href="/login"
              className="inline-block text-xs font-bold text-red-600 hover:underline"
            >
              Quay lại trang Đăng nhập
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-50 dark:bg-red-950/40 p-3 text-xs font-semibold text-red-700 dark:text-red-300">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-5">
              <a
                href="/api/auth/google"
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border bg-background py-2.5 text-xs font-bold text-foreground shadow-2xs hover:bg-muted transition-colors"
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                  />
                </svg>
                Đăng ký nhanh bằng Gmail (Google)
              </a>
            </div>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-bold uppercase text-muted-foreground">Hoặc tạo tài khoản mới</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-bold text-foreground">Họ và tên:</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-xl border bg-background py-2.5 pl-9 pr-3 font-semibold outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-foreground">Email (Gmail):</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tenban@gmail.com"
                    className="w-full rounded-xl border bg-background py-2.5 pl-9 pr-3 font-semibold outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-foreground">Số điện thoại:</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0901234567"
                    className="w-full rounded-xl border bg-background py-2.5 pl-9 pr-3 font-semibold outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-foreground">Mật khẩu (tối thiểu 6 ký tự):</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full rounded-xl border bg-background py-2.5 pl-9 pr-3 font-semibold outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer rounded-xl border bg-muted/30 p-3 text-[11px] leading-relaxed">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-red-600"
                />
                <span>
                  Tôi đã đọc, hiểu rõ và đồng ý với{' '}
                  <Link href="/dieu-khoan-su-dung" target="_blank" className="font-bold text-red-600 hover:underline">
                    Điều khoản sử dụng
                  </Link>{' '}
                  và{' '}
                  <Link href="/chinh-sach-bao-mat" target="_blank" className="font-bold text-red-600 hover:underline">
                    Chính sách xử lý dữ liệu cá nhân
                  </Link>{' '}
                  của XSKT Minh Luân.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-xs font-black text-white shadow-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Đang tạo tài khoản...' : 'Đăng Ký Tài Khoản'} <ArrowRight className="size-4" />
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-muted-foreground">
              Đã có tài khoản?{' '}
              <Link href="/login" className="font-black text-red-600 hover:underline">
                Đăng nhập ngay
              </Link>
            </div>
          </>
        )}
      </div>
    </SiteFrame>
  );
}
