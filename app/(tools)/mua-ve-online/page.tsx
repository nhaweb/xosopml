'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  CheckCircle2,
  Sparkles,
  MapPin,
  ShieldCheck,
  Truck,
  ArrowRight,
  Search,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import { SiteFrame } from '@/components/site/site-frame';

interface DbTicket {
  id: string;
  province: string;
  drawDate: string;
  ticketNumber: string;
  imageUrl: string;
  availableQty: number;
  pricePerTicket: number;
  showBadge: boolean;
  badgeText: string | null;
  status: string;
}

export default function MuaVeOnlinePage() {
  const [tickets, setTickets] = useState<DbTicket[]>([]);
  const [todayIso, setTodayIso] = useState<string>('');
  const [tomorrowIso, setTomorrowIso] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const [selectedDayTab, setSelectedDayTab] = useState<'today' | 'tomorrow'>('today');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<{ ticket: DbTicket; quantity: number }[]>([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'SAFE_KEEPING' | 'EXPRESS_9KM'>('SAFE_KEEPING');
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [createdOrderCode, setCreatedOrderCode] = useState<string>('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form thông tin nhận vé
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [distanceKm, setDistanceKm] = useState<number>(1.5);
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'MOMO' | 'COD'>('BANK_TRANSFER');

  const loadTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tickets');
      if (res.ok) {
        const json = await res.json();
        setTickets(json.tickets || []);
        setTodayIso(json.todayIso || '');
        setTomorrowIso(json.tomorrowIso || '');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (selectedDayTab === 'today' && todayIso && ticket.drawDate !== todayIso) return false;
      if (selectedDayTab === 'tomorrow' && tomorrowIso && ticket.drawDate !== tomorrowIso) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.trim().toLowerCase();
        const matchNumber = ticket.ticketNumber.includes(q);
        const matchProvince = ticket.province.toLowerCase().includes(q);
        if (!matchNumber && !matchProvince) return false;
      }
      return true;
    });
  }, [tickets, selectedDayTab, todayIso, tomorrowIso, searchQuery]);

  const formatTicketQtyLabel = (qty: number) =>
    qty >= 160 ? `Cặp nguyên (${qty} vé)` : `${qty} vé`;

  const addToCart = (ticket: DbTicket) => {
    const fixedQty = ticket.availableQty;
    if (fixedQty <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.ticket.id === ticket.id);
      if (existing) {
        return prev.map((item) =>
          item.ticket.id === ticket.id ? { ...item, quantity: fixedQty } : item
        );
      }
      return [...prev, { ticket, quantity: fixedQty }];
    });
  };

  const removeFromCart = (ticketId: string) => {
    setCart((prev) => prev.filter((item) => item.ticket.id !== ticketId));
  };

  const totalTickets = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalTicketPrice = cart.reduce(
    (sum, item) => sum + item.quantity * item.ticket.pricePerTicket,
    0
  );

  // Phí ship: Miễn phí < 2km, ship hỏa tốc trong bán kính 9km
  const shippingFee = useMemo(() => {
    if (deliveryMethod === 'SAFE_KEEPING') return 0;
    if (distanceKm < 2) return 0;
    return Math.round(15000 + Math.max(0, distanceKm - 2) * 3000);
  }, [deliveryMethod, distanceKm]);

  const grandTotal = totalTicketPrice + shippingFee;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    if (cart.length === 0) return;

    if (deliveryMethod === 'EXPRESS_9KM' && distanceKm > 9) {
      setCheckoutError('Giao hỏa tốc chỉ áp dụng trong bán kính tối đa 9km.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((item) => ({
            ticketId: item.ticket.id,
            ticketNumber: item.ticket.ticketNumber,
            province: item.ticket.province,
            drawDate: item.ticket.drawDate,
            quantity: item.quantity,
            price: item.ticket.pricePerTicket,
          })),
          deliveryMethod,
          deliveryAddress: customerAddress,
          customerName,
          customerPhone,
          distanceKm,
          paymentMethod,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setCheckoutError(json.error || 'Không thể đặt đơn hàng.');
        return;
      }
      setCreatedOrderCode(json.orderCode || 'ML-ORDER');
      setOrderSuccess(true);
      loadTickets();
    } catch {
      setCheckoutError('Lỗi kết nối máy chủ.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteFrame>
      <div className={cart.length > 0 ? 'pb-24' : ''}>
        {/* Header Giới Thiệu */}
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-red-600/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-red-600 dark:text-red-400">
              <Sparkles className="size-3.5" /> Mua Vé Số Online Minh Luân
            </div>
            <h1 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Chọn Số Theo Ảnh Vé Thật — Giao Tận Tay Hoặc Giữ Hộ
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              Vé Miền Nam chụp thực tế từ đại lý trước giờ quay. Giao hỏa tốc trước giờ xổ 1 tiếng trong bán kính 9km (miễn phí dưới 2km) hoặc giữ hộ an toàn tại két.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-2xs">
            <div className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="size-6" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-foreground">100% Vé Thật Đã Ký Tên</div>
              <div className="text-muted-foreground">Ảnh lưu két gửi thẳng Dashboard</div>
            </div>
          </div>
        </div>

        {/* 3 Chính sách vận chuyển nổi bật */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white font-bold text-sm">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h4 className="text-sm font-black text-foreground">Giữ Hộ Tại Két An Toàn</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Chụp ảnh vé thật gửi vào Dashboard khách. Trúng giải thông báo trao thưởng ngay.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-500 text-white font-bold text-sm">
              <Truck className="size-5" />
            </span>
            <div>
              <h4 className="text-sm font-black text-foreground">Miễn Phí Giao Dưới 2km</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Giao tận tay hoàn toàn miễn phí trong bán kính dưới 2km trước giờ xổ 1 tiếng.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-500 text-white font-bold text-sm">
              <MapPin className="size-5" />
            </span>
            <div>
              <h4 className="text-sm font-black text-foreground">Ship Hỏa Tốc Bán Kính 9km</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tính phí ship linh hoạt theo km (2km – 9km). Hỗ trợ chuyển khoản, MoMo hoặc COD.
              </p>
            </div>
          </div>
        </div>

        {/* Bộ lọc: Vé Hôm Nay | Vé Ngày Mai & Tìm kiếm */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'today', label: 'Vé Hôm Nay' },
              { id: 'tomorrow', label: 'Vé Ngày Mai' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedDayTab(tab.id as 'today' | 'tomorrow')}
                className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${
                  selectedDayTab === tab.id
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-muted/60 hover:bg-muted text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Gõ số vé hoặc tên đài Miền Nam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border bg-background py-2 pl-9 pr-3 text-xs font-bold outline-none ring-red-500 focus:ring-2"
            />
          </div>
        </div>

        {/* Lưới Vé Số */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-muted-foreground">Đang tải kho vé thật từ hệ thống...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-12 text-center text-xs text-muted-foreground">
            Hiện chưa có vé phù hợp trong mục này. Vui lòng chọn ngày khác hoặc thử từ khóa khác.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredTickets.map((ticket) => {
              const inCart = cart.find((item) => item.ticket.id === ticket.id);
              const isSoldOut = ticket.availableQty <= 0 || ticket.status === 'SOLD_OUT';
              const fixedQty = ticket.availableQty;
              const bundleTotal = fixedQty * ticket.pricePerTicket;

              return (
                <div
                  key={ticket.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-red-500/50"
                >
                  {/* Ảnh Vé Số Thật */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-amber-300/60 bg-gradient-to-br from-[#fffdf7] via-[#fff8e7] to-[#fdeec8] text-neutral-900 flex flex-col justify-between">
                    <div className="flex items-center justify-between bg-gradient-to-r from-[#b80c0c] to-[#8b0000] px-3 py-1.5 text-white">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide">
                        {ticket.province}
                      </span>
                      <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-extrabold text-neutral-950">
                        16:15
                      </span>
                    </div>

                    {ticket.showBadge && ticket.badgeText && (
                      <span className="absolute right-2 top-9 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black uppercase text-red-950 shadow-xs">
                        {ticket.badgeText}
                      </span>
                    )}

                    <div className="my-auto px-3 text-center">
                      <div className="text-[10px] font-extrabold uppercase tracking-wide text-[#9e0b0f]">
                        XỔ SỐ KIẾN THIẾT MINH LUÂN
                      </div>
                      <div className="mt-1 inline-block rounded-lg border border-red-200 bg-white/90 px-3 py-0.5 font-mono text-2xl sm:text-3xl font-extrabold tracking-widest text-[#b80c0c] shadow-2xs">
                        {ticket.ticketNumber}
                      </div>
                      <div className="mt-1 text-[10px] font-semibold text-neutral-600">
                        Mở thưởng ngày {ticket.drawDate.split('-').reverse().join('/')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-dashed border-amber-400/70 bg-amber-100/50 px-3 py-1 text-[9px] font-bold text-neutral-700">
                      <span>Vé Thật Minh Luân</span>
                      <span>Còn {ticket.availableQty} vé</span>
                    </div>
                  </div>

                  {/* Thông Tin Vé (Số lượng cố định theo cấu hình Admin) */}
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <div className="text-xs text-muted-foreground">Giá vé:</div>
                        <div className="text-sm font-black text-foreground">
                          {ticket.pricePerTicket.toLocaleString('vi-VN')} đ/vé
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-2.5 py-1.5 text-xs">
                        <span className="font-bold text-muted-foreground">Số lượng:</span>
                        <span className="font-black text-foreground">
                          {formatTicketQtyLabel(fixedQty)}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between pt-0.5">
                        <div className="text-xs font-bold text-muted-foreground">Tổng tiền:</div>
                        <div className="text-base font-black text-red-600 dark:text-red-400">
                          {bundleTotal.toLocaleString('vi-VN')} đ
                        </div>
                      </div>
                    </div>

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
                        {isSoldOut ? (
                          'Đã hết vé'
                        ) : inCart ? (
                          <>
                            <Check className="size-4" /> Đã chọn ({inCart.quantity} vé)
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="size-4" /> Chọn Mua ({fixedQty} vé)
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Thanh Giỏ Hàng Nổi */}
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
                    Tiền vé:{' '}
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

        {/* Modal Thanh Toán */}
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
                    <Sparkles className="size-4" /> Thanh toán &amp; Nhận vé
                  </div>
                  <h3 className="mt-1 text-xl font-extrabold text-foreground">
                    Xác Nhận Đơn Mua Vé Số Minh Luân
                  </h3>

                  {checkoutError && (
                    <div className="mt-3 rounded-xl border border-red-500/40 bg-red-50 dark:bg-red-950/40 p-2.5 text-xs font-bold text-red-600">
                      {checkoutError}
                    </div>
                  )}

                  <div className="my-4 max-h-36 overflow-y-auto rounded-xl border bg-muted/20 p-3 text-xs space-y-2">
                    {cart.map((item) => (
                      <div key={item.ticket.id} className="flex items-center justify-between">
                        <div>
                          <span className="font-mono font-black text-sm text-red-600">
                            {item.ticket.ticketNumber}
                          </span>{' '}
                          · <span className="font-bold">{item.ticket.province}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>x{item.quantity}</span>
                          <span className="font-bold">
                            {(item.quantity * item.ticket.pricePerTicket).toLocaleString('vi-VN')} đ
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

                  {/* Hình thức nhận vé */}
                  <div className="mb-4">
                    <label className="text-xs font-bold text-foreground block mb-2">
                      Chọn hình thức nhận vé:
                    </label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('SAFE_KEEPING')}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          deliveryMethod === 'SAFE_KEEPING'
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        <ShieldCheck className="size-4 text-emerald-600 mb-1" />
                        <div className="text-xs font-bold text-foreground">Giữ Hộ Tại Két An Toàn</div>
                        <div className="text-[10px]">Chụp ảnh vé thật gửi Dashboard</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('EXPRESS_9KM')}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          deliveryMethod === 'EXPRESS_9KM'
                            ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold'
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        <Truck className="size-4 text-amber-600 mb-1" />
                        <div className="text-xs font-bold text-foreground">Giao Hỏa Tốc (Bán kính 9km)</div>
                        <div className="text-[10px]">Miễn phí &lt; 2km · Trước giờ xổ 1h</div>
                      </button>
                    </div>
                  </div>

                  {deliveryMethod === 'EXPRESS_9KM' && (
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

                      <div className="grid gap-2 sm:grid-cols-3">
                        <div className="sm:col-span-2">
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
                        <div>
                          <label className="font-bold text-foreground block mb-1">Khoảng cách (km):</label>
                          <input
                            type="number"
                            step="0.5"
                            min={0.5}
                            max={9}
                            required
                            value={distanceKm}
                            onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 0)}
                            className="w-full rounded-lg border bg-background px-3 py-1.5 font-mono font-bold outline-none focus:border-red-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 bg-amber-500/10 p-2 rounded-lg text-[11px]">
                        <AlertTriangle className="size-4 shrink-0" />
                        <span>
                          {distanceKm < 2
                            ? 'Khoảng cách dưới 2km: Miễn phí giao hàng!'
                            : `Khoảng cách ${distanceKm}km (trong 9km): Phí ship hỏa tốc ${shippingFee.toLocaleString('vi-VN')} đ.`}
                        </span>
                      </div>
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
                        onClick={() => setPaymentMethod('BANK_TRANSFER')}
                        className={`rounded-xl border p-2.5 text-center font-bold ${
                          paymentMethod === 'BANK_TRANSFER'
                            ? 'border-red-600 bg-red-50 text-red-600 dark:bg-red-950/40'
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        Chuyển Khoản QR
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('MOMO')}
                        className={`rounded-xl border p-2.5 text-center font-bold ${
                          paymentMethod === 'MOMO'
                            ? 'border-pink-600 bg-pink-50 text-pink-600 dark:bg-pink-950/40'
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        Ví MoMo
                      </button>
                      <button
                        type="button"
                        disabled={deliveryMethod !== 'EXPRESS_9KM'}
                        onClick={() => setPaymentMethod('COD')}
                        className={`rounded-xl border p-2.5 text-center font-bold ${
                          paymentMethod === 'COD'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40'
                            : deliveryMethod !== 'EXPRESS_9KM'
                            ? 'opacity-40 cursor-not-allowed text-muted-foreground'
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        COD (Trong 9km)
                      </button>
                    </div>
                  </div>

                  {/* Tổng tiền thanh toán */}
                  <div className="border-t pt-3 mb-4 space-y-1 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tiền vé ({totalTickets} vé):</span>
                      <span className="font-bold">{totalTicketPrice.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Phí giao hàng:</span>
                      <span className="font-bold">{shippingFee.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-1">
                      <span className="font-bold text-foreground">Tổng thanh toán:</span>
                      <span className="text-xl font-black text-red-600 dark:text-red-400">
                        {grandTotal.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 py-3 text-xs font-black text-white shadow-lg hover:from-red-700 hover:to-amber-700 disabled:opacity-50 transition-all"
                  >
                    {submitting ? 'Đang xử lý đơn hàng...' : 'Xác Nhận Đặt Mua Ngay'}
                  </button>
                </form>
              ) : (
                <div className="py-6 text-center">
                  <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 shadow-md">
                    <CheckCircle2 className="size-10" />
                  </div>
                  <h3 className="mt-4 text-2xl font-black text-foreground">
                    Đặt Mua Vé Số Thành Công!
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground max-w-sm mx-auto">
                    Mã đơn hàng: <span className="font-mono font-bold text-foreground">{createdOrderCode}</span>.{' '}
                    {deliveryMethod === 'SAFE_KEEPING'
                      ? 'Vé đã được lưu vào két an toàn và hiển thị trong User Dashboard của bạn.'
                      : 'Nhân viên Minh Luân sẽ giao vé đến tận tay bạn trước 1 tiếng mở thưởng.'}
                  </p>

                  {paymentMethod !== 'COD' && (
                    <div className="my-5 inline-block rounded-2xl border bg-white p-3 shadow-xs">
                      <div className="size-36 bg-neutral-100 rounded-xl grid place-items-center text-neutral-700 font-mono text-xs font-bold border border-neutral-200">
                        [QR {paymentMethod === 'MOMO' ? 'Ví MoMo' : 'VietQR Ngân Hàng'}]
                      </div>
                      <div className="mt-1.5 text-[11px] font-bold text-neutral-800">
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
