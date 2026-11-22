'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Crown,
  Wallet,
  ShieldCheck,
  Bell,
  Sparkles,
  Ticket,
  TrendingUp,
  History,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  ExternalLink,
  Bot,
  Zap,
  Clock,
  Phone,
  Mail,
  Smartphone,
  Lock,
  Truck,
} from 'lucide-react';
import { SiteFrame } from '@/components/site/site-frame';

export default function UserDashboardPage() {
  const [activeTier, setActiveTier] = useState<'free' | 'vip'>('vip');
  const [activeTab, setActiveTab] = useState<'tickets' | 'wallet' | 'ai_predictions' | 'settings'>('tickets');
  const [selectedTicketModal, setSelectedTicketModal] = useState<any | null>(null);

  // Dữ liệu mẫu vé số đã mua / lưu trong tài khoản
  const userTickets = [
    {
      id: 'PML-89324',
      number: '839268',
      province: 'TP. Hồ Chí Minh',
      date: '2026-11-22',
      status: 'waiting', // waiting, won, lost
      type: 'safekeeping', // safekeeping, delivered
      amount: 20000,
      quantity: 2,
      imageUrl: '/images/ticket-sample-1.jpg',
      verificationCode: 'SAFE-HCM-839268-VIP',
      isVipProtected: true,
    },
    {
      id: 'PML-77219',
      number: '194779',
      province: 'Đồng Tháp',
      date: '2026-11-21',
      status: 'won',
      wonPrize: 'Giải Tám (Trúng đuôi 79)',
      prizeAmount: 100000,
      type: 'safekeeping',
      amount: 10000,
      quantity: 1,
      imageUrl: '/images/ticket-sample-2.jpg',
      verificationCode: 'SAFE-DT-194779-WON',
      isVipProtected: true,
    },
    {
      id: 'PML-65103',
      number: '542686',
      province: 'Hà Nội (Miền Bắc)',
      date: '2026-11-20',
      status: 'lost',
      type: 'delivered',
      amount: 50000,
      quantity: 5,
      imageUrl: '/images/ticket-sample-1.jpg',
      verificationCode: 'DELIV-HN-542686',
      isVipProtected: false,
    },
  ];

  return (
    <SiteFrame>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Profile Header & Tier Switcher */}
        <div className="mb-8 rounded-3xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Thông tin User */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 text-white shadow-md font-black text-2xl">
                  NL
                </div>
                {activeTier === 'vip' && (
                  <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-amber-400 text-black shadow-xs" title="Hội Viên VIP">
                    <Crown className="size-3.5 fill-black" />
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-foreground">
                    Nguyễn Văn Luân
                  </h1>
                  {activeTier === 'vip' ? (
                    <span className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                      PML VIP PRO
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                      Hội Viên Thường (Free)
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>ID: PML-888999</span>
                  <span>•</span>
                  <span>SĐT: 098****888</span>
                  <span>•</span>
                  <span>Tham gia: 11/2026</span>
                </div>
              </div>
            </div>

            {/* Chuyển đổi trải nghiệm 2 gói để review */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="text-xs font-bold text-muted-foreground">
                Xem thử trải nghiệm giao diện:
              </div>
              <div className="inline-flex rounded-xl border bg-muted/40 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTier('free')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    activeTier === 'free'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Gói Miễn Phí (Free)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTier('vip')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    activeTier === 'vip'
                      ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Crown className="size-3.5" /> Gói VIP Có Phí (Pro)
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Số dư ví */}
            <div className="rounded-2xl border bg-background p-4 shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-bold">Số Dư PML Pay</span>
                <Wallet className="size-4 text-emerald-500" />
              </div>
              <div className="mt-2 text-2xl font-black text-foreground">
                {activeTier === 'vip' ? '2.450.000 đ' : '0 đ'}
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-emerald-600 font-bold">+100.000 đ trúng thưởng</span>
                <button className="text-primary hover:underline font-bold">Rút tiền</button>
              </div>
            </div>

            {/* Card 2: Vé đang giữ hộ */}
            <div className="rounded-2xl border bg-background p-4 shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-bold">Vé Đang Giữ Hộ Tại Két</span>
                <ShieldCheck className="size-4 text-blue-500" />
              </div>
              <div className="mt-2 text-2xl font-black text-foreground">
                2 Vé <span className="text-xs font-normal text-muted-foreground">(Chờ mở 16h15)</span>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                100% có ảnh ký tên & QR an toàn
              </div>
            </div>

            {/* Card 3: Tỉ lệ trúng thưởng */}
            <div className="rounded-2xl border bg-background p-4 shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-bold">Thưởng Đã Nhận</span>
                <TrendingUp className="size-4 text-amber-500" />
              </div>
              <div className="mt-2 text-2xl font-black text-foreground">
                {activeTier === 'vip' ? '850.000 đ' : '0 đ'}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                3 lần trúng giải phụ & giải 8
              </div>
            </div>

            {/* Card 4: Thông báo AI */}
            <div className="rounded-2xl border bg-background p-4 shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-bold">Thông Báo Tự Động</span>
                <Bell className="size-4 text-red-500" />
              </div>
              <div className="mt-2 text-sm font-black text-foreground">
                {activeTier === 'vip' ? 'SMS + Zalo + Email' : 'Thông báo Web'}
              </div>
              <div className="mt-1 text-[11px] text-emerald-600 font-bold">
                Đang kích hoạt tức thì 16h30
              </div>
            </div>
          </div>
        </div>

        {/* Banner Khác Biệt Giữa Free & VIP */}
        {activeTier === 'free' && (
          <div className="mb-8 rounded-2xl border-2 border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-card to-amber-500/5 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-amber-500 text-white shadow-md text-xl">
                  👑
                </span>
                <div>
                  <h3 className="text-base font-black text-foreground">
                    Nâng Cấp Gói VIP PML Pro — Chỉ 49.000đ / tháng
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Mở khóa tính năng Soi Cầu AI độc quyền, thông báo trúng thưởng qua SMS/Zalo tức thì, giữ hộ vé trong két an toàn & freeship 10km.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTier('vip')}
                className="rounded-xl bg-gradient-to-r from-red-600 to-amber-600 px-5 py-2.5 text-xs font-black text-white shadow-md hover:scale-105 transition-all"
              >
                Trải Nghiệm VIP Ngay
              </button>
            </div>
          </div>
        )}

        {/* Thanh Điều Hướng Tab Nội Dung */}
        <div className="mb-6 flex border-b">
          {[
            { id: 'tickets', label: 'Kho Vé Số Của Tôi', icon: Ticket },
            { id: 'wallet', label: 'Ví Tiền & Lịch Sử Thưởng', icon: Wallet },
            { id: 'ai_predictions', label: 'Trợ Lý Soi Cầu AI (VIP)', icon: Bot },
            { id: 'settings', label: 'Cài Đặt Nhận Kết Quả', icon: Bell },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all ${
                  isActive
                    ? 'border-red-600 text-red-600 dark:text-red-400 font-black'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: KHO VÉ SỐ CỦA TÔI */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">
                  Danh Sách Vé Đã Đặt Mua & Lưu Trữ
                </h3>
                <p className="text-xs text-muted-foreground">
                  Hệ thống tự động so khớp vé với kết quả mở thưởng của đài ngay sau khi xổ.
                </p>
              </div>
              <Link
                href="/mua-ve-online"
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700"
              >
                <Ticket className="size-3.5" /> Mua Thêm Vé Mới
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {userTickets.map((t) => (
                <div
                  key={t.id}
                  className="overflow-hidden rounded-2xl border bg-card shadow-xs flex flex-col justify-between"
                >
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-muted-foreground">
                        {t.id}
                      </span>
                      {t.status === 'won' ? (
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-black uppercase">
                          🎉 ĐÃ TRÚNG THƯỞNG
                        </span>
                      ) : t.status === 'waiting' ? (
                        <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 text-[10px] font-black uppercase">
                          ⏳ Chờ mở thưởng
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-[10px] font-semibold">
                          Không trúng
                        </span>
                      )}
                    </div>

                    {/* Dãy Số */}
                    <div className="mt-3 text-center">
                      <div className="font-mono text-3xl font-black tracking-widest text-red-600 dark:text-red-400">
                        {t.number}
                      </div>
                      <div className="mt-1 text-xs font-bold text-foreground">
                        {t.province} · Ngày {t.date}
                      </div>
                    </div>

                    {/* Thông tin giải trúng nếu có */}
                    {t.status === 'won' && (
                      <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-center">
                        <div className="text-[11px] font-black text-emerald-700 dark:text-emerald-300">
                          {t.wonPrize}
                        </div>
                        <div className="text-sm font-black text-emerald-600">
                          + {t.prizeAmount?.toLocaleString('vi-VN')} đ (Đã cộng vào ví)
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Card */}
                  <div className="bg-muted/30 p-3 px-4 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      {t.type === 'safekeeping' ? (
                        <>
                          <ShieldCheck className="size-4 text-emerald-600" />
                          <span className="font-bold">Giữ hộ tại két</span>
                        </>
                      ) : (
                        <>
                          <Truck className="size-4 text-blue-600" />
                          <span>Đã giao tận nơi</span>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedTicketModal(t)}
                      className="font-bold text-red-600 dark:text-red-400 hover:underline"
                    >
                      Xem Ảnh Vé Thật
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: VÍ TIỀN & LỊCH SỬ THƯỞNG */}
        {activeTab === 'wallet' && (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1 rounded-2xl border bg-card p-5 shadow-xs">
              <h3 className="text-sm font-bold text-foreground mb-4">Số Dư Hiện Tại</h3>
              <div className="text-3xl font-black text-red-600 dark:text-red-400">
                2.450.000 đ
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Khả dụng rút về ngân hàng liên kết trong vòng 5 phút.
              </p>

              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-red-700"
                >
                  <ArrowDownLeft className="size-4" /> Rút Tiền Về Ngân Hàng
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold hover:bg-muted"
                >
                  <ArrowUpRight className="size-4" /> Nạp Thêm Tiền Vào Ví
                </button>
              </div>

              <div className="mt-6 border-t pt-4 text-xs">
                <span className="text-muted-foreground block mb-2">Tài khoản thụ hưởng:</span>
                <div className="rounded-xl border bg-muted/20 p-2.5 font-mono">
                  <div className="font-bold text-foreground">VIETCOMBANK</div>
                  <div className="text-muted-foreground">1019283746 - NGUYEN VAN LUAN</div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 rounded-2xl border bg-card p-5 shadow-xs">
              <h3 className="text-sm font-bold text-foreground mb-3">Lịch Sử Giao Dịch & Trúng Thưởng</h3>
              <div className="space-y-3 text-xs">
                {[
                  { title: 'Trúng thưởng Giải Tám (Vé #PML-77219)', date: '21/11/2026 - 16:32', amount: '+100.000 đ', type: 'plus' },
                  { title: 'Mua 2 vé số đài TP.HCM online', date: '22/11/2026 - 10:15', amount: '-20.000 đ', type: 'minus' },
                  { title: 'Trúng thưởng Giải Bảy (Vé #PML-11029)', date: '18/11/2026 - 16:35', amount: '+200.000 đ', type: 'plus' },
                  { title: 'Rút tiền về Vietcombank (Mã GD: #WD8291)', date: '15/11/2026 - 09:20', amount: '-500.000 đ', type: 'minus' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b pb-2.5 last:border-b-0">
                    <div>
                      <div className="font-bold text-foreground">{item.title}</div>
                      <div className="text-muted-foreground text-[11px]">{item.date}</div>
                    </div>
                    <div className={`font-black font-mono text-sm ${item.type === 'plus' ? 'text-emerald-600' : 'text-foreground'}`}>
                      {item.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TRỢ LÝ SOI CẦU AI (VIP EXCLUSIVE) */}
        {activeTab === 'ai_predictions' && (
          <div className="space-y-6">
            <div className="rounded-2xl border-2 border-red-500/20 bg-gradient-to-br from-red-600/10 via-card to-amber-500/10 p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white shadow-md">
                  <Bot className="size-6" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-red-600 text-white px-2 py-0.5 text-[10px] font-black uppercase">
                      PML AI MODEL V3.5
                    </span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      Đặc Quyền Hội Viên VIP
                    </span>
                  </div>
                  <h3 className="text-base font-black text-foreground mt-0.5">
                    Hệ Thống Thuật Toán Machine Learning Dự Đoán Lô Tô & Gan Cực Đại
                  </h3>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border bg-card p-4">
                <div className="text-xs font-bold text-amber-600 uppercase">Cầu Bạch Thủ VIP</div>
                <div className="mt-2 text-3xl font-black font-mono text-red-600">68</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Xác suất nổ chu kỳ hôm nay: <span className="font-bold text-emerald-600">87.4%</span> (Biên độ 4 ngày liên tiếp đài Miền Nam).
                </p>
              </div>

              <div className="rounded-2xl border bg-card p-4">
                <div className="text-xs font-bold text-blue-600 uppercase">Song Thủ Lô Vàng</div>
                <div className="mt-2 text-3xl font-black font-mono text-blue-600">39 - 79</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Cặp thần tài xuất hiện chu kỳ rơi vào ngày Chủ Nhật. Xác suất: <span className="font-bold text-emerald-600">82.1%</span>.
                </p>
              </div>

              <div className="rounded-2xl border bg-card p-4">
                <div className="text-xs font-bold text-purple-600 uppercase">Cảnh Báo Lô Gan Nguy Cấp</div>
                <div className="mt-2 text-3xl font-black font-mono text-purple-600">47 (24 ngày)</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Đã vượt mức gan cực đại lịch sử 22 ngày. Khả năng nổ giải ĐB trong 2 kỳ tới.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CÀI ĐẶT THÔNG BÁO TỨC THÌ */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl rounded-2xl border bg-card p-6 shadow-xs space-y-5">
            <h3 className="text-base font-black text-foreground">
              Kênh Nhận Thông Báo Kết Quả & Trúng Thưởng
            </h3>
            <p className="text-xs text-muted-foreground">
              Ngay khi có kết quả mở thưởng lúc 16h30, 17h30 hoặc 18h30, hệ thống sẽ tự động so vé của bạn và gửi tin nhắn ngay lập tức.
            </p>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between rounded-xl border p-3">
                <div className="flex items-center gap-3">
                  <Smartphone className="size-5 text-red-600" />
                  <div>
                    <div className="font-bold text-foreground">Tin nhắn SMS trực tiếp (VIP)</div>
                    <div className="text-muted-foreground text-[11px]">Gửi đến 098****888</div>
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="size-4 accent-red-600" />
              </div>

              <div className="flex items-center justify-between rounded-xl border p-3">
                <div className="flex items-center gap-3">
                  <Phone className="size-5 text-blue-600" />
                  <div>
                    <div className="font-bold text-foreground">Zalo ZNS Thông Báo Trúng Thưởng</div>
                    <div className="text-muted-foreground text-[11px]">Gửi tin nhắn Zalo kèm hình ảnh vé trúng</div>
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="size-4 accent-red-600" />
              </div>

              <div className="flex items-center justify-between rounded-xl border p-3">
                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-amber-600" />
                  <div>
                    <div className="font-bold text-foreground">Bản tin Email KQXS 3 Miền Hàng Ngày</div>
                    <div className="text-muted-foreground text-[11px]">Gửi bảng tổng hợp lúc 18h45</div>
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="size-4 accent-red-600" />
              </div>
            </div>
          </div>
        )}

        {/* Modal Chi Tiết Vé Số Giữ Hộ Thật */}
        {selectedTicketModal && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-md rounded-3xl border bg-card p-6 shadow-2xl text-center">
              <button
                type="button"
                onClick={() => setSelectedTicketModal(null)}
                className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">
                <ShieldCheck className="size-4" /> Vé Thật Đã Lưu Trữ Két Sắt
              </div>

              <h4 className="mt-2 text-lg font-black text-foreground">
                Chứng Chỉ Sở Hữu Vé Số
              </h4>
              <p className="text-xs text-muted-foreground font-mono">
                Mã định danh: {selectedTicketModal.verificationCode}
              </p>

              {/* Giả lập hình ảnh vé số thật được scan */}
              <div className="my-4 rounded-2xl border-2 border-dashed border-red-500/40 bg-gradient-to-br from-red-600 to-amber-600 p-5 text-white shadow-md">
                <div className="text-xs uppercase tracking-widest text-amber-200 font-bold">
                  {selectedTicketModal.province}
                </div>
                <div className="mt-2 font-mono text-4xl font-black tracking-widest text-white drop-shadow-md">
                  {selectedTicketModal.number}
                </div>
                <div className="mt-2 text-xs text-white/90">
                  Mở thưởng: {selectedTicketModal.date}
                </div>
                <div className="mt-3 border-t border-white/20 pt-2 text-[10px] text-white/70 flex justify-between">
                  <span>Chủ sở hữu: NGUYEN VAN LUAN</span>
                  <span>Đã niêm phong két #04</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Vé này được giữ hộ hợp pháp theo hợp đồng ủy quyền đại lý PML. Tiền trúng thưởng sẽ được chuyển thẳng về tài khoản ngân hàng của bạn.
              </p>

              <button
                type="button"
                onClick={() => setSelectedTicketModal(null)}
                className="mt-4 w-full rounded-xl bg-muted py-2.5 text-xs font-bold text-foreground hover:bg-muted/80"
              >
                Đóng Cửa Sổ
              </button>
            </div>
          </div>
        )}
      </div>
    </SiteFrame>
  );
}

