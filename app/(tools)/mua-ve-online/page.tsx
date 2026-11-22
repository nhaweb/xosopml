'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  CheckCircle2,
  Filter,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  QrCode,
  ArrowRight,
  Flame,
  Search,
  Check,
  X,
  CreditCard,
  Phone,
  Home,
  AlertTriangle,
} from 'lucide-react';
import { SiteFrame } from '@/components/site/site-frame';
import { mockOnlineTickets, OnlineTicket } from '@/lib/mock-online-tickets';

export default function MuaVeOnlinePage() {
  const [selectedRegion, setSelectedRegion] = useState<'all' | 'south' | 'central' | 'north'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<{ ticket: OnlineTicket; quantity: number }[]>([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'safekeeping' | 'under5km' | 'express'>('safekeeping');
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);

  // Form thông tin nhận vé
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [distanceKm, setDistanceKm] = useState<number>(3); // Mặc định 3km
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'momo' | 'cod'>('bank_transfer');

  // Lọc vé
  const filteredTickets = useMemo(() => {
    return mockOnlineTickets.filter((ticket) => {
      if (selectedRegion !== 'all' && ticket.region !== selectedRegion) return false;
      if (selectedTag !== 'all' && !ticket.tags.some((t) => t.toLowerCase().includes(selectedTag.toLowerCase()))) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.trim();
        const matchNumber = ticket.ticketNumber.includes(q);
        const matchProvince = ticket.provinceName.toLowerCase().includes(q.toLowerCase());
        if (!matchNumber && !matchProvince) return false;
      }
      return true;
    });
  }, [selectedRegion, selectedTag, searchQuery]);

  // Thêm vé vào giỏ
  const addToCart = (ticket: OnlineTicket) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.ticket.id === ticket.id);
      if (existing) {
        if (existing.quantity >= ticket.remainingQuantity) return prev;
        return prev.map((item) =>
          item.ticket.id === ticket.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ticket, quantity: 1 }];
    });
  };

  // Xóa hoặc giảm số lượng
  const removeFromCart = (ticketId: string) => {
    setCart((prev) => prev.filter((item) => item.ticket.id !== ticketId));
  };

  // Tổng tiền vé
  const totalTickets = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalTicketPrice = cart.reduce((sum, item) => sum + item.quantity * item.ticket.price, 0);

  // Tính phí ship
  const shippingFee = useMemo(() => {
    if (deliveryMethod === 'safekeeping') return 0;
    if (deliveryMethod === 'under5km') return 0; // Miễn phí giao < 5km
    return 25000; // Phí ship hỏa tốc > 5km
  }, [deliveryMethod]);

  const grandTotal = totalTicketPrice + shippingFee;

  // Xử lý hoàn tất đặt hàng
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setOrderSuccess(true);
  };

  return (
    <SiteFrame>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Header Giới Thiệu */}
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-red-600/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400">
              <Sparkles className="size-3.5" /> Mua Vé Số Online PML
            </div>
            <h1 className="mt-2 text-2xl sm:text-4xl font-black tracking-tight text-foreground">
              Chọn Số Theo Ảnh Vé Thật — Giao Tận Tay Hoặc Giữ Hộ
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              Tất cả vé đều được chụp thực tế từ đại lý trước giờ quay. Chọn số đuôi may mắn, giao tận nơi trước 1 giờ xổ số trong bán kính 5km hoặc giữ hộ an toàn tại két.
            </p>
          </div>

          {/* Badge Cam Kết */}
          <div className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-2xs">
            <div className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="size-6" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-foreground">100% Vé Thật Đã Ký Tên</div>
              <div className="text-muted-foreground">Có ảnh cùi vé & mã định danh</div>
            </div>
          </div>
        </div>

        {/* 3 Chính sách vận chuyển nổi bật */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-500 text-white font-bold text-sm">
              <Truck className="size-5" />
            </span>
            <div>
              <h4 className="text-sm font-black text-foreground">Giao Nhanh Dưới 5km</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Giao tận nơi trước giờ mở thưởng 1 tiếng. Hỗ trợ COD hoặc chuyển khoản.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-500 text-white font-bold text-sm">
              <MapPin className="size-5" />
            </span>
            <div>
              <h4 className="text-sm font-black text-foreground">Ship Hỏa Tốc Trên 5km</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Giao qua Grab/Ahamove. Khách thanh toán online chuyển khoản trước khi ship.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white font-bold text-sm">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h4 className="text-sm font-black text-foreground">Giữ Hộ Tại Két An Toàn</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Chụp ảnh gửi Dashboard. Trúng giải tiền tự động chuyển về STK ngân hàng.
              </p>
            </div>
          </div>
        </div>

        {/* Thanh Bộ Lọc & Tìm Kiếm Trực Quan */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs md:flex-row md:items-center md:justify-between">
          {/* Lọc Miền */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'Tất Cả Đài' },
              { id: 'south', label: 'Miền Nam (16h15)' },
              { id: 'central', label: 'Miền Trung (17h15)' },
              { id: 'north', label: 'Miền Bắc (18h15)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedRegion(tab.id as any)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  selectedRegion === tab.id
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-muted/60 hover:bg-muted text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Lọc Số Đẹp */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'Tất cả số' },
              { id: 'Thần Tài', label: '🧧 Thần Tài (39-79)' },
              { id: 'Lộc Phát', label: '💰 Lộc Phát (68-86)' },
              { id: 'Tứ Quý', label: '👑 Tứ Quý' },
            ].map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => setSelectedTag(tag.id)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${
                  selectedTag === tag.id
                    ? 'border-red-600 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 font-bold'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Ô Tìm Số Nhanh */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Gõ số cần tìm (vd: 68, 79...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border bg-background py-2 pl-9 pr-3 text-xs font-bold outline-none ring-red-500 focus:ring-2"
            />
          </div>
        </div>

        {/* Lưới Danh Sách Vé Số Theo Hình Ảnh Thật (Visual Ticket Showcase) */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filteredTickets.map((ticket) => {
            const inCart = cart.find((item) => item.ticket.id === ticket.id);
            const isSoldOut = ticket.remainingQuantity === 0;

            return (
              <div
                key={ticket.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-red-500/50"
              >
                {/* Phần Ảnh Vé Số Thực Tế */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 p-3 text-white flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-black/40 px-2 py-0.5 text-[10px] font-black uppercase backdrop-blur-xs tracking-wider">
                      {ticket.provinceName}
                    </span>
                    <span className="rounded-md bg-amber-400 text-black px-1.5 py-0.5 text-[10px] font-black">
                      {ticket.drawTime}
                    </span>
                  </div>

                  {/* Dãy Số Dập Nổi Bật Dạng font-mono */}
                  <div className="my-auto text-center">
                    <div className="text-[10px] uppercase font-bold tracking-widest text-amber-200">
                      VÉ SỐ TRUYỀN THỐNG
                    </div>
                    <div className="mt-0.5 text-3xl font-black font-mono tracking-widest text-white drop-shadow-md">
                      {ticket.ticketNumber}
                    </div>
                    <div className="text-[10px] text-white/80">
                      Mở thưởng ngày {ticket.drawDate}
                    </div>
                  </div>

                  {/* Giả lập đường vân bảo mật vé thật */}
                  <div className="flex items-center justify-between border-t border-white/20 pt-1 text-[9px] text-white/70">
                    <span>Mã Seri: #{ticket.id.toUpperCase()}</span>
                    <span>PML Official Safe</span>
                  </div>
                </div>

                {/* Phần Thông Tin Chi Tiết & Thao Tác Mua */}
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {ticket.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div className="text-xs text-muted-foreground">Giá vé niêm yết:</div>
                      <div className="text-base font-black text-red-600 dark:text-red-400">
                        {ticket.price.toLocaleString('vi-VN')} đ
                      </div>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Loại: {ticket.batchType === 'block10' ? 'Lốc 10 vé' : ticket.batchType === 'pair' ? 'Cặp 2 vé' : 'Vé đơn'}</span>
                      <span className="font-bold text-emerald-600">Còn {ticket.remainingQuantity} vé</span>
                    </div>
                  </div>

                  {/* Nút Chọn Mua */}
                  <div className="mt-4">
                    <button
                      type="button"
                      disabled={isSoldOut}
                      onClick={() => addToCart(ticket)}
                      className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black transition-all ${
                        isSoldOut
                          ? 'bg-muted text-muted-foreground cursor-not-allowed'
                          : inCart
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          : 'bg-red-600 hover:bg-red-700 text-white shadow-xs hover:scale-[1.02]'
                      }`}
                    >
                      {inCart ? (
                        <>
                          <Check className="size-4" /> Đã chọn ({inCart.quantity} vé)
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="size-4" /> Chọn Mua Vé Này
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Thanh Giỏ Hàng Nổi (Floating Cart) khi có vé đã chọn */}
        {cart.length > 0 && (
          <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-4xl rounded-2xl border-2 border-red-500 bg-card/95 p-4 shadow-2xl backdrop-blur-md">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-xl bg-red-600 text-white shadow-md">
                  <ShoppingBag className="size-6" />
                </div>
                <div>
                  <div className="text-sm font-black text-foreground">
                    Giỏ hàng: {totalTickets} vé số đã chọn
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Tổng tiền:{' '}
                    <span className="font-black text-red-600 dark:text-red-400 text-sm">
                      {totalTicketPrice.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="rounded-xl border px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"
                >
                  Xóa giỏ
                </button>
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(true)}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-black text-white shadow-md hover:bg-red-700 hover:scale-105 transition-all"
                >
                  Tiến Hành Mua Vé <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Thanh Toán & Nhận Vé */}
        {showCheckoutModal && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-xl rounded-3xl border bg-card p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted"
              >
                <X className="size-5" />
              </button>

              {!orderSuccess ? (
                <form onSubmit={handleCheckoutSubmit}>
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-red-600 dark:text-red-400">
                    <Sparkles className="size-4" /> Thanh toán & Nhận vé
                  </div>
                  <h3 className="mt-1 text-xl font-black text-foreground">
                    Xác Nhận Đơn Mua Vé Số PML
                  </h3>

                  {/* Tóm tắt vé đã chọn */}
                  <div className="my-4 max-h-36 overflow-y-auto rounded-xl border bg-muted/20 p-3 text-xs space-y-2">
                    {cart.map((item) => (
                      <div key={item.ticket.id} className="flex items-center justify-between">
                        <div>
                          <span className="font-mono font-black text-sm text-red-600">
                            {item.ticket.ticketNumber}
                          </span>{' '}
                          · <span className="font-bold">{item.ticket.provinceName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>x{item.quantity}</span>
                          <span className="font-bold">
                            {(item.quantity * item.ticket.price).toLocaleString('vi-VN')} đ
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.ticket.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Lựa chọn phương thức nhận vé */}
                  <div className="mb-4">
                    <label className="text-xs font-bold text-foreground block mb-2">
                      Chọn hình thức nhận vé:
                    </label>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {/* Lựa chọn 1: Giữ hộ */}
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('safekeeping')}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          deliveryMethod === 'safekeeping'
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        <ShieldCheck className="size-4 text-emerald-600 mb-1" />
                        <div className="text-xs font-bold text-foreground">Giữ Hộ An Toàn</div>
                        <div className="text-[10px]">Chụp ảnh gửi Dashboard</div>
                      </button>

                      {/* Lựa chọn 2: Giao tận nơi <= 5km */}
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('under5km')}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          deliveryMethod === 'under5km'
                            ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold'
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        <Truck className="size-4 text-amber-600 mb-1" />
                        <div className="text-xs font-bold text-foreground">Giao Nhanh ≤ 5km</div>
                        <div className="text-[10px]">Trước 1h xổ số</div>
                      </button>

                      {/* Lựa chọn 3: Ship hỏa tốc > 5km */}
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('express')}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          deliveryMethod === 'express'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-bold'
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        <MapPin className="size-4 text-blue-600 mb-1" />
                        <div className="text-xs font-bold text-foreground">Ship Trên 5km</div>
                        <div className="text-[10px]">Hỏa tốc Grab/Ahamove</div>
                      </button>
                    </div>
                  </div>

                  {/* Nhập thông tin nhận hàng nếu chọn giao */}
                  {deliveryMethod !== 'safekeeping' && (
                    <div className="space-y-3 mb-4 rounded-xl border bg-muted/10 p-3 text-xs">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <label className="font-bold text-foreground block mb-1">Họ và tên:</label>
                          <input
                            type="text"
                            required
                            placeholder="Nguyễn Văn A"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full rounded-lg border bg-background px-3 py-1.5 outline-none focus:ring-1 focus:ring-red-500"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-foreground block mb-1">Số điện thoại:</label>
                          <input
                            type="tel"
                            required
                            placeholder="0901234567"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full rounded-lg border bg-background px-3 py-1.5 outline-none focus:ring-1 focus:ring-red-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-foreground block mb-1">Địa chỉ giao vé:</label>
                        <input
                          type="text"
                          required
                          placeholder="Số nhà, đường, phường, quận..."
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          className="w-full rounded-lg border bg-background px-3 py-1.5 outline-none focus:ring-1 focus:ring-red-500"
                        />
                      </div>

                      {deliveryMethod === 'express' && (
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg text-[11px]">
                          <AlertTriangle className="size-4 shrink-0" />
                          <span>Khoảng cách &gt; 5km: Phí ship hỏa tốc 25.000đ. Bắt buộc thanh toán online trước.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Phương thức thanh toán */}
                  <div className="mb-4">
                    <label className="text-xs font-bold text-foreground block mb-1.5">
                      Hình thức thanh toán:
                    </label>
                    <div className="grid gap-2 sm:grid-cols-3 text-xs">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bank_transfer')}
                        className={`rounded-xl border p-2.5 text-center font-bold ${
                          paymentMethod === 'bank_transfer'
                            ? 'border-red-600 bg-red-50 text-red-600 dark:bg-red-950/40'
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        Chuyển Khoản QR
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('momo')}
                        className={`rounded-xl border p-2.5 text-center font-bold ${
                          paymentMethod === 'momo'
                            ? 'border-pink-600 bg-pink-50 text-pink-600 dark:bg-pink-950/40'
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        Ví MoMo
                      </button>
                      <button
                        type="button"
                        disabled={deliveryMethod === 'express'}
                        onClick={() => setPaymentMethod('cod')}
                        className={`rounded-xl border p-2.5 text-center font-bold ${
                          paymentMethod === 'cod'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40'
                            : deliveryMethod === 'express'
                            ? 'opacity-40 cursor-not-allowed text-muted-foreground'
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        COD (Nhận vé trả tiền)
                      </button>
                    </div>
                  </div>

                  {/* Tổng tiền thanh toán */}
                  <div className="border-t pt-3 mb-4 flex items-center justify-between text-sm">
                    <span className="font-bold text-muted-foreground">Tổng thanh toán:</span>
                    <span className="text-xl font-black text-red-600 dark:text-red-400">
                      {grandTotal.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 py-3 text-xs font-black text-white shadow-lg hover:from-red-700 hover:to-amber-700 transition-all hover:scale-[1.01]"
                  >
                    Xác Nhận Đặt Mua Ngay
                  </button>
                </form>
              ) : (
                /* Màn hình thông báo thành công */
                <div className="py-6 text-center">
                  <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 shadow-md">
                    <CheckCircle2 className="size-10" />
                  </div>
                  <h3 className="mt-4 text-2xl font-black text-foreground">
                    Đặt Mua Vé Số Thành Công!
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground max-w-sm mx-auto">
                    Mã đơn hàng: <span className="font-mono font-bold text-foreground">PML-89324</span>. 
                    {deliveryMethod === 'safekeeping'
                      ? ' Vé đã được lưu vào két an toàn và hiển thị trong User Dashboard của bạn.'
                      : ' Nhân viên PML sẽ giao vé đến tận tay bạn trước 1 tiếng mở thưởng.'}
                  </p>

                  {/* QR Demo */}
                  {paymentMethod !== 'cod' && (
                    <div className="my-5 inline-block rounded-2xl border bg-white p-3 shadow-xs">
                      <div className="size-36 bg-gray-100 rounded-xl grid place-items-center text-gray-500 font-mono text-xs">
                        [QR Chuyển Khoản / MoMo]
                      </div>
                      <div className="mt-1 text-[11px] font-bold text-gray-700">
                        Quét mã thanh toán: {grandTotal.toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2 justify-center">
                    <Link
                      href="/dashboard"
                      className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-xs"
                    >
                      Xem Vé Trong User Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCheckoutModal(false);
                        setOrderSuccess(false);
                        setCart([]);
                      }}
                      className="rounded-xl border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
                    >
                      Tiếp tục chọn số
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SiteFrame>
  );
}

