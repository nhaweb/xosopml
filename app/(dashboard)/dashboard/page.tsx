'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Crown,
  Wallet,
  ShieldCheck,
  Sparkles,
  Ticket,
  Bot,
  Heart,
  Plus,
  Trash2,
  Send,
  Compass,
  MoonStar,
  BarChart3,
  ShoppingBag,
  Lock,
  Check,
  Truck,
  ArrowRight,
  MessageSquare,
  Snowflake,
  Flame,
  Trophy,
  Clock,
  Camera,
  Phone,
  LogIn,
  LogOut,
  Settings,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import { SiteFrame } from '@/components/site/site-frame';
import { PROVINCES } from '@/config/lottery-provinces';
import { calculateLoGan } from '@/lib/stats-calculator';
import { getLotteryResults } from '@/lib/mock-lottery-data';

function formatRichMessage(text: string): React.ReactNode {
  return text.split('\n').map((line, lineIdx) => {
    const tokens = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return (
      <span key={lineIdx} className="block">
        {tokens.map((token, tIdx) => {
          if (token.startsWith('**') && token.endsWith('**')) {
            return (
              <strong key={tIdx} className="font-extrabold text-foreground">
                {token.slice(2, -2)}
              </strong>
            );
          }
          if (token.startsWith('*') && token.endsWith('*')) {
            return (
              <em key={tIdx} className="italic opacity-90">
                {token.slice(1, -1)}
              </em>
            );
          }
          return <React.Fragment key={tIdx}>{token}</React.Fragment>;
        })}
      </span>
    );
  });
}

interface UserProfile {
  id: string;
  memberCode: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  phoneNumber: string | null;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  vipTier: 'FREE' | 'VIP';
  vipExpiresAt: string | null;
  role: string;
}

interface DbOrder {
  id: string;
  orderCode: string;
  ticketNumber: string;
  province: string;
  drawDate: string;
  quantity: number;
  totalAmount: number;
  shippingFee: number;
  deliveryMethod: string;
  paymentMethod: string;
  paymentStatus: string;
  safeKeepingPhotoUrl: string | null;
  prizeStatus: 'WAITING' | 'WON' | 'LOST';
  wonPrizeDetail: string | null;
  createdAt: string;
}

interface FavoriteNumber {
  id: string;
  number: string;
  provinceName: string;
  note: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const MAX_DAILY_AI_MESSAGES = 10;

const PRESET_AI_QUESTIONS = [
  'Nay chọn con số mấy đài Đồng Tháp?',
  'Thống kê cho mình 2 cặp số lâu ra nhất đài Đồng Tháp trong 10 ngày qua',
  'Phân tích cầu loto đầu đuôi và cặp số đẹp dễ về nhất đài TP.HCM hôm nay?',
];

const FENG_SHUI_ELEMENTS = [
  { id: 'kim', name: 'Mệnh Kim' },
  { id: 'moc', name: 'Mệnh Mộc' },
  { id: 'thuy', name: 'Mệnh Thủy' },
  { id: 'hoa', name: 'Mệnh Hỏa' },
  { id: 'tho', name: 'Mệnh Thổ' },
];

const ELEMENT_PAIR_PRESETS: Record<string, [string, string]> = {
  kim: ['49', '68'],
  moc: ['38', '83'],
  thuy: ['32', '87'],
  hoa: ['12', '42'],
  tho: ['25', '58'],
};

function computeLunarLabel(date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('vi-VN-u-ca-chinese', {
      day: 'numeric',
      month: 'numeric',
    }).formatToParts(date);
    const day = parts.find((p) => p.type === 'day')?.value || '1';
    const month = parts.find((p) => p.type === 'month')?.value || '10';
    return `Ngày ${day} tháng ${month} Âm lịch`;
  } catch {
    return 'Mùng 1 tháng 10 Âm lịch';
  }
}

const CAN_LIST = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
const CHI_LIST = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'];

const CAN_ORDER = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI_ORDER = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

function foldVietnamese(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

// Đầy đủ 60 Lục Thập Hoa Giáp (Giáp Tý -> Quý Hợi) kèm năm sinh phổ biến
const ALL_CAN_CHI_OPTIONS: Array<{ label: string; sampleYear: number; folded: string }> = Array.from(
  { length: 60 },
  (_, i) => {
    const label = `${CAN_ORDER[i % 10]} ${CHI_ORDER[i % 12]}`;
    // 1984 là Giáp Tý (i = 0); chọn năm sinh nằm gọn trong khoảng 1954 - 2013
    const rawYear = 1984 + i;
    const sampleYear = rawYear > 2013 ? rawYear - 60 : rawYear;
    return {
      label,
      sampleYear,
      folded: foldVietnamese(label),
    };
  }
);

function getCanChiFromYear(yearStr: string): string {
  const yr = parseInt(yearStr, 10);
  if (Number.isNaN(yr) || yr < 1900 || yr > 2100) return '';
  return `${CAN_LIST[yr % 10]} ${CHI_LIST[yr % 12]}`;
}

function computeElementPairs(
  elementId: string,
  birthYearStr: string,
  canChiStr?: string
): [string, string] {
  const base = ELEMENT_PAIR_PRESETS[elementId] || ['32', '87'];
  const yr = parseInt(birthYearStr, 10);
  if (Number.isNaN(yr) || yr < 1920) return base;
  const canChiHash = (canChiStr || '')
    .trim()
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const offset = (yr + canChiHash) % 10;
  if (offset === 0) return base;
  const p1 = String((parseInt(base[0], 10) + offset) % 100).padStart(2, '0');
  const p2 = String((parseInt(base[1], 10) + offset * 3) % 100).padStart(2, '0');
  return p1 === p2 ? base : [p1, p2];
}

function computeProvinceFrequency(provinceId: string, periods = 30) {
  const province = PROVINCES.find((p) => p.id === provinceId);
  if (!province) return [];
  const counts = new Map<string, number>();
  for (let i = 0; i < 100; i++) counts.set(String(i).padStart(2, '0'), 0);
  const now = new Date();
  let drawn = 0;
  for (let offset = 0; offset < 240 && drawn < periods; offset++) {
    const d = new Date(now);
    d.setDate(now.getDate() - offset);
    if (!province.drawDays.includes(d.getDay())) continue;
    const dayData = getLotteryResults(d);
    const draw = dayData[province.region].find((item) => item.provinceId === provinceId);
    if (!draw) continue;
    drawn++;
    for (const prize of draw.prizes) {
      for (const num of prize.numbers) {
        const pair = num.trim().slice(-2);
        if (pair.length === 2 && counts.has(pair)) {
          counts.set(pair, (counts.get(pair) || 0) + 1);
        }
      }
    }
  }
  return Array.from(counts.entries())
    .map(([number, count]) => ({ number, count }))
    .sort((a, b) => b.count - a.count || a.number.localeCompare(b.number));
}

export default function UserDashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTier, setActiveTier] = useState<'free' | 'vip'>('free');
  const [activeTab, setActiveTab] = useState<
    'history' | 'favorites' | 'fengshui' | 'charts' | 'ai_chat' | 'upgrade' | 'admin'
  >('history');

  // Modals: Avatar/Profile Edit & Phone Verification
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  const [phoneVerifyOpen, setPhoneVerifyOpen] = useState(false);
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  // Orders from Neon DB
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'WON' | 'WAITING'>('all');
  const [selectedOrderModal, setSelectedOrderModal] = useState<DbOrder | null>(null);

  // Favorites
  const [favorites, setFavorites] = useState<FavoriteNumber[]>([
    { id: 'fav-1', number: '68', provinceName: 'Đồng Tháp', note: 'Số Lộc Phát yêu thích', createdAt: '22/11/2026' },
    { id: 'fav-2', number: '79', provinceName: 'TP.HCM', note: 'Thần Tài lớn', createdAt: '21/11/2026' },
  ]);
  const [newFavNumber, setNewFavNumber] = useState('');
  const [newFavProvince, setNewFavProvince] = useState('Đồng Tháp');
  const [newFavNote, setNewFavNote] = useState('');

  // Feng Shui Daily & Lookup
  const [dailyLuckyPair, setDailyLuckyPair] = useState('02');
  const [dailyLuckyPairs, setDailyLuckyPairs] = useState<string[]>(['02']);
  const [autoLuckyPair, setAutoLuckyPair] = useState('02');
  const [manualLuckyPair, setManualLuckyPair] = useState<string | null>(null);
  const [nextUpdateDate, setNextUpdateDate] = useState('');
  const [selectedElementId, setSelectedElementId] = useState('thuy');
  const [birthYear, setBirthYear] = useState('1983');
  const [canChiInput, setCanChiInput] = useState('Quý Hợi');
  const [canChiDropdownOpen, setCanChiDropdownOpen] = useState(false);

  const filteredCanChiOptions = useMemo(() => {
    const q = foldVietnamese(canChiInput);
    if (!q) return ALL_CAN_CHI_OPTIONS;
    return ALL_CAN_CHI_OPTIONS.filter(
      (opt) => opt.folded.includes(q) || String(opt.sampleYear).includes(q)
    );
  }, [canChiInput]);
  const [lookupResult, setLookupResult] = useState<{
    pairs: [string, string];
    lunarDate: string;
    elementName: string;
    canChi: string;
    birthYear: string;
  } | null>(null);

  // Charts state (3 regions + filtered provinces + 3 charts/tables)
  const [chartRegion, setChartRegion] = useState<'north' | 'central' | 'south'>('north');
  const regionProvinces = useMemo(
    () => PROVINCES.filter((p) => p.region === chartRegion),
    [chartRegion]
  );
  const [chartProvinceId, setChartProvinceId] = useState('ha-noi');
  const [freqCycle, setFreqCycle] = useState<5 | 10 | 30>(30);
  const [chartLoGan, setChartLoGan] = useState<
    Array<{ number: string; daysUnopened: number; maxGanHistory: number }>
  >(() => calculateLoGan('ha-noi'));
  const [chartFreqAll, setChartFreqAll] = useState<Array<{ number: string; count: number }>>(() =>
    computeProvinceFrequency('ha-noi', 30)
  );

  // VIP upgrade feedback
  const [vipStatusMsg, setVipStatusMsg] = useState<string | null>(null);
  const [vipLoading, setVipLoading] = useState(false);

  // Admin panel state
  const [adminLuckyInput, setAdminLuckyInput] = useState('');
  const [adminMsg, setAdminMsg] = useState<string | null>(null);
  const [adminOrders, setAdminOrders] = useState<DbOrder[]>([]);
  const [newTicketProv, setNewTicketProv] = useState('Đồng Nai');
  const [newTicketDate, setNewTicketDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newTicketNum, setNewTicketNum] = useState('');
  const [newTicketQty, setNewTicketQty] = useState(16);
  const [newTicketShowBadge, setNewTicketShowBadge] = useState(false);
  const [newTicketBadgeText, setNewTicketBadgeText] = useState('Số Đẹp');
  const [orderPhotoDrafts, setOrderPhotoDrafts] = useState<Record<string, string>>({});

  // AI Chat
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Chào bạn! Mình là **Trợ Lý Ảo Xổ Số Minh Luân AI**. Bạn có **10 tin nhắn/ngày** để hỏi cầu số, lô gan cực đại và tần suất từng đài.',
      timestamp: 'Hôm nay',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [usedMessagesToday, setUsedMessagesToday] = useState(0);

  const loadUserAndOrders = useCallback(async () => {
    try {
      const [meRes, ordersRes, fsRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/orders'),
        fetch('/api/feng-shui/daily'),
      ]);
      if (meRes.ok) {
        const meJson = await meRes.json();
        if (meJson.user) {
          setUser(meJson.user);
          setActiveTier(meJson.user.vipTier === 'VIP' ? 'vip' : 'free');
          setEditFullName(meJson.user.fullName || '');
          setEditPhone(meJson.user.phoneNumber || '');
          setEditAvatarUrl(meJson.user.avatarUrl || '');
          setOtpPhone(meJson.user.phoneNumber || '');
        }
      }
      if (ordersRes.ok) {
        const ordJson = await ordersRes.json();
        setOrders(ordJson.orders || []);
      }
      if (fsRes.ok) {
        const fsJson = await fsRes.json();
        if (Array.isArray(fsJson.luckyPairs) && fsJson.luckyPairs.length > 0) {
          setDailyLuckyPairs(fsJson.luckyPairs);
          setDailyLuckyPair(fsJson.luckyPairs.join(', '));
        } else if (fsJson.luckyPair) {
          setDailyLuckyPairs([fsJson.luckyPair]);
          setDailyLuckyPair(fsJson.luckyPair);
        }
        if (fsJson.autoLuckyPair) setAutoLuckyPair(fsJson.autoLuckyPair);
        setManualLuckyPair(fsJson.manualLuckyPair || null);
        if (fsJson.nextUpdateDate) {
          setNextUpdateDate(fsJson.nextUpdateDate.split('-').reverse().join('/'));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadUserAndOrders();
  }, [loadUserAndOrders]);

  useEffect(() => {
    if (activeTab === 'admin') {
      fetch('/api/orders?admin=1')
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          if (j?.orders) setAdminOrders(j.orders);
        })
        .catch(() => { });
    }
  }, [activeTab]);

  // Sync province dropdown when region changes
  useEffect(() => {
    const first = regionProvinces[0];
    if (first && !regionProvinces.some((p) => p.id === chartProvinceId)) {
      setChartProvinceId(first.id);
    }
  }, [chartRegion, regionProvinces, chartProvinceId]);

  // Load chart stats
  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`/api/xoso/stats?type=lo-gan&province=${encodeURIComponent(chartProvinceId)}`).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch(
        `/api/xoso/stats?type=frequency&province=${encodeURIComponent(chartProvinceId)}&limit=${freqCycle}`
      ).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([ganJson, freqJson]) => {
        if (!active) return;
        if (Array.isArray(ganJson?.data) && ganJson.data.length > 0) {
          setChartLoGan(ganJson.data);
        } else {
          setChartLoGan(calculateLoGan(chartProvinceId));
        }
        if (Array.isArray(freqJson?.data) && freqJson.data.length > 0) {
          setChartFreqAll(freqJson.data);
        } else {
          setChartFreqAll(computeProvinceFrequency(chartProvinceId, freqCycle));
        }
      })
      .catch(() => { });
    return () => {
      active = false;
    };
  }, [chartProvinceId, freqCycle]);

  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('minhluan_fav_numbers');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
      const todayKey = new Date().toISOString().slice(0, 10);
      const savedQuota = localStorage.getItem(`minhluan_ai_quota_${todayKey}`);
      if (savedQuota) setUsedMessagesToday(parseInt(savedQuota, 10) || 0);
    } catch {
      // ignore
    }
  }, []);

  const persistFavorites = (next: FavoriteNumber[]) => {
    setFavorites(next);
    try {
      localStorage.setItem('minhluan_fav_numbers', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const handleAddFavorite = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newFavNumber.replace(/\D/g, '');
    if (clean.length < 2) return;
    const item: FavoriteNumber = {
      id: `fav-${Date.now()}`,
      number: clean,
      provinceName: newFavProvince,
      note: newFavNote.trim() || 'Số yêu thích',
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };
    persistFavorites([item, ...favorites]);
    setNewFavNumber('');
    setNewFavNote('');
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    const res = await fetch('/api/auth/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: editFullName,
        phoneNumber: editPhone,
        avatarUrl: editAvatarUrl,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setProfileMsg(json.error || 'Không thể cập nhật thông tin.');
      return;
    }
    setUser(json.user);
    setProfileMsg('Đã lưu thông tin tài khoản vào Neon DB!');
    setTimeout(() => setProfileModalOpen(false), 700);
  };

  const handleSendOtp = async () => {
    setOtpMessage(null);
    const res = await fetch('/api/auth/me', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send_otp', phoneNumber: otpPhone }),
    });
    const json = await res.json();
    if (!res.ok) {
      setOtpMessage(json.error || 'Lỗi gửi OTP.');
      return;
    }
    setOtpSent(true);
    setOtpMessage(json.message);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpMessage(null);
    const res = await fetch('/api/auth/me', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify_otp', phoneNumber: otpPhone, otp: otpCode }),
    });
    const json = await res.json();
    if (!res.ok) {
      setOtpMessage(json.error || 'Mã OTP không hợp lệ.');
      return;
    }
    setUser(json.user);
    setOtpMessage('Đã xác thực số điện thoại thành công!');
    setTimeout(() => setPhoneVerifyOpen(false), 800);
  };

  const handleFengShuiLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const el = FENG_SHUI_ELEMENTS.find((item) => item.id === selectedElementId) || FENG_SHUI_ELEMENTS[0];
    const resolvedCanChi = canChiInput.trim() || getCanChiFromYear(birthYear);
    const pairs = computeElementPairs(el.id, birthYear, resolvedCanChi);
    setLookupResult({
      pairs,
      lunarDate: computeLunarLabel(new Date()),
      elementName: el.name,
      canChi: resolvedCanChi,
      birthYear,
    });
  };

  const handleSubscribeVip = async (planMonths: 1 | 3 | 6 | 12) => {
    setVipStatusMsg(null);
    if (!user) {
      setVipStatusMsg('Vui lòng đăng nhập tài khoản trước khi nâng cấp VIP.');
      return;
    }
    setVipLoading(true);
    try {
      const res = await fetch('/api/vip/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planMonths }),
      });
      const json = await res.json();
      if (!res.ok) {
        setVipStatusMsg(json.error || 'Không thể kích hoạt VIP.');
        return;
      }
      setActiveTier('vip');
      setUser((prev) => (prev ? { ...prev, vipTier: 'VIP', vipExpiresAt: json.vipExpiresAt } : prev));
      setVipStatusMsg(`Kích hoạt thành công gói VIP ${planMonths} tháng!`);
    } finally {
      setVipLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setActiveTier('free');
    setOrders([]);
  };

  const handleSendAiMessage = async (textToSend?: string) => {
    const content = (textToSend ?? chatInput).trim();
    if (!content) return;
    if (activeTier !== 'vip') {
      setActiveTab('upgrade');
      return;
    }
    if (usedMessagesToday >= MAX_DAILY_AI_MESSAGES) return;

    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const nextCount = usedMessagesToday + 1;
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', content, timestamp: nowTime },
    ]);
    setUsedMessagesToday(nextCount);
    setChatInput('');
    try {
      localStorage.setItem(`minhluan_ai_quota_${new Date().toISOString().slice(0, 10)}`, String(nextCount));
    } catch { }

    const topHot = [...chartFreqAll].sort((a, b) => b.count - a.count).slice(0, 3);
    const topGan = chartLoGan.slice(0, 2);
    const replyText = `**Phân tích tham khảo:**\n• Top cặp về nhiều: **${topHot.map((i) => `${i.number} (${i.count} lần)`).join(', ')}**.\n• Cặp lâu ra nhất: **${topGan.map((i) => `${i.number} (${i.daysUnopened} kỳ)`).join(', ')}**.`;
    setMessages((prev) => [
      ...prev,
      { id: `a-${Date.now() + 1}`, role: 'assistant', content: replyText, timestamp: nowTime },
    ]);
  };

  // Derived chart metrics
  const topHot10 = useMemo(
    () => [...chartFreqAll].sort((a, b) => b.count - a.count).slice(0, 10),
    [chartFreqAll]
  );
  const consecutivePairs = useMemo(() => {
    return [...chartFreqAll]
      .filter((i) => i.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [chartFreqAll]);
  const topGan10 = useMemo(() => chartLoGan.slice(0, 10), [chartLoGan]);
  const nearMaxGan85 = useMemo(() => {
    return chartLoGan.filter((i) => i.maxGanHistory > 0 && i.daysUnopened / i.maxGanHistory >= 0.85);
  }, [chartLoGan]);
  const maxGanVal = Math.max(...topGan10.map((i) => i.daysUnopened), 1);
  const maxFreqVal = Math.max(...topHot10.map((i) => i.count), 1);

  const filteredOrders = orders.filter((o) => {
    if (historyFilter === 'all') return true;
    return o.prizeStatus === historyFilter;
  });

  const remainingAiMsgs = Math.max(0, MAX_DAILY_AI_MESSAGES - usedMessagesToday);
  const tomorrowDisplay =
    nextUpdateDate ||
    (() => {
      const t = new Date();
      t.setDate(t.getDate() + 1);
      return t.toLocaleDateString('vi-VN');
    })();

  return (
    <SiteFrame>
      <div>
        {/* Header User Info */}
        <div className="mb-6 rounded-2xl border bg-card p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => (user ? setProfileModalOpen(true) : null)}
                className="group relative shrink-0 rounded-2xl focus:outline-none"
                title={user ? 'Bấm để đổi ảnh đại diện & cập nhật thông tin' : 'Đăng nhập để chỉnh sửa hồ sơ'}
              >
                <img
                  src={user?.avatarUrl || '/favicon-logo.png'}
                  alt="Avatar"
                  className="size-16 rounded-2xl border-2 border-amber-400 bg-white object-cover shadow-md transition-transform group-hover:scale-105"
                />
                {user && (
                  <span className="absolute -bottom-1 -left-1 grid size-6 place-items-center rounded-full bg-slate-900 text-white shadow-xs">
                    <Camera className="size-3.5" />
                  </span>
                )}
                {activeTier === 'vip' && (
                  <span
                    className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-amber-400 text-black shadow-xs"
                    title="VIP"
                  >
                    <Crown className="size-3.5 fill-black" />
                  </span>
                )}
              </button>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">
                    {user ? user.fullName : 'Tài khoản Khách'}
                  </h1>
                  {activeTier === 'vip' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#b80c0c] to-amber-500 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-xs">
                      <Crown className="size-3" /> VIP
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
                  <span className="font-mono font-bold text-foreground">
                    ID: {user ? user.memberCode : 'Chưa đăng nhập'}
                  </span>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => user && setPhoneVerifyOpen(true)}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${user?.isPhoneVerified
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25'
                      }`}
                  >
                    <Phone className="size-3" />
                    Xác thực SĐT: {user?.isPhoneVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                  </button>
                  <span>•</span>
                  <span>Số yêu thích: {favorites.length}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!user ? (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 rounded-xl border bg-background px-3.5 py-2 text-xs font-bold hover:bg-muted"
                  >
                    <LogIn className="size-4" /> Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-1.5 rounded-xl bg-[#0f2454] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#1a3673]"
                  >
                    Đăng ký tài khoản
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"
                >
                  <LogOut className="size-3.5" /> Đăng xuất
                </button>
              )}

              <Link
                href="/mua-ve-online"
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-red-700"
              >
                <ShoppingBag className="size-4" /> Mua Vé Số Online
              </Link>

              {/* Toggle xem thử Free / VIP */}
              <div className="inline-flex rounded-xl border bg-muted/40 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTier('free')}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${activeTier === 'free' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                    }`}
                >
                  Free
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTier('vip')}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold ${activeTier === 'vip'
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-xs'
                    : 'text-muted-foreground'
                    }`}
                >
                  <Crown className="size-3" /> VIP
                </button>
              </div>
            </div>
          </div>

          {/* 4 Quick Stat Cards */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border bg-background p-3.5">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>Đơn Vé Đã Mua</span>
                <Ticket className="size-4 text-red-500" />
              </div>
              <div className="mt-1.5 text-xl font-black text-foreground">
                {orders.length} Đơn{' '}
                <span className="text-xs font-bold text-emerald-600">
                  ({orders.filter((o) => o.prizeStatus === 'WON').length} trúng)
                </span>
              </div>
            </div>

            <div className="rounded-2xl border bg-background p-3.5">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>Số Yêu Thích Đã Lưu</span>
                <Heart className="size-4 text-rose-500" />
              </div>
              <div className="mt-1.5 text-xl font-black text-foreground">{favorites.length} Con Số</div>
            </div>

            <div className="rounded-2xl border bg-background p-3.5">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>MAY MẮN MỖI NGÀY</span>
                <Compass className="size-4 text-amber-500" />
              </div>
              <div className="mt-1.5 font-mono text-xl font-extrabold text-red-600 dark:text-amber-400">
                {activeTier === 'vip' ? dailyLuckyPair : <span className="text-sm font-sans text-muted-foreground">Dành cho VIP</span>}
              </div>
            </div>

            <div className="rounded-2xl border bg-background p-3.5">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>Trợ Lý Ảo Xổ Số AI</span>
                <Bot className="size-4 text-blue-500" />
              </div>
              <div className="mt-1.5 text-xl font-extrabold text-foreground">
                {activeTier === 'vip' ? `${remainingAiMsgs} / 10 tin` : <span className="text-sm text-muted-foreground">Nâng cấp VIP</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 flex flex-wrap gap-1.5 border-b pb-3">
          {[
            { id: 'history', label: 'Lịch Sử Mua Vé', icon: Wallet, vipOnly: false },
            { id: 'favorites', label: 'Số Mình Thích', icon: Heart, vipOnly: false },
            { id: 'fengshui', label: 'Phong Thủy & Âm Lịch', icon: Compass, vipOnly: true },
            { id: 'charts', label: 'Biểu Đồ Chuyên Sâu', icon: BarChart3, vipOnly: true },
            { id: 'ai_chat', label: 'Chat Trợ Lý Ảo (10/ngày)', icon: MessageSquare, vipOnly: true },
            { id: 'upgrade', label: 'Nâng Cấp Thành Viên', icon: Crown, vipOnly: false },
            { id: 'admin', label: 'Quản Trị (Admin)', icon: Settings, vipOnly: false },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${isActive ? 'bg-red-600 text-white shadow-sm' : 'border bg-card text-foreground hover:bg-muted'
                  }`}
              >
                <tab.icon className="size-4" />
                {tab.label}
                {tab.vipOnly && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${isActive ? 'bg-amber-300 text-red-950' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                      }`}
                  >
                    VIP
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: LỊCH SỬ MUA VÉ */}
        {activeTab === 'history' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-foreground">Lịch Sử Mua Vé &amp; Giữ Hộ Két An Toàn</h2>
                <p className="text-xs text-muted-foreground">
                  Theo dõi vé số online đã đặt mua, ảnh chụp vé thật lưu két và thông báo trúng thưởng.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {[
                  { id: 'all', label: 'Tất cả vé' },
                  { id: 'WON', label: 'Trúng thưởng' },
                  { id: 'WAITING', label: 'Chờ xổ' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setHistoryFilter(f.id as typeof historyFilter)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold ${historyFilter === f.id ? 'bg-[#b80c0c] text-white' : 'border bg-card text-muted-foreground'
                      }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-10 text-center text-xs text-muted-foreground">
                Chưa có đơn vé nào. Hãy vào mục{' '}
                <Link href="/mua-ve-online" className="font-bold text-red-600 hover:underline">
                  Mua Vé Số Online
                </Link>{' '}
                để chọn vé thật!
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {filteredOrders.map((o) => (
                  <div key={o.id} className="flex flex-col justify-between overflow-hidden rounded-2xl border bg-card shadow-xs">
                    <div className="border-b p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-muted-foreground">{o.orderCode}</span>
                        {o.prizeStatus === 'WON' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700">
                            <Trophy className="size-3" /> TRÚNG THƯỞNG
                          </span>
                        ) : o.prizeStatus === 'WAITING' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-700">
                            <Clock className="size-3" /> Chờ mở thưởng
                          </span>
                        ) : (
                          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            Chưa trúng
                          </span>
                        )}
                      </div>

                      <div className="mt-3 text-center">
                        <div className="font-mono text-3xl font-black tracking-widest text-red-600">
                          {o.ticketNumber}
                        </div>
                        <div className="mt-1 text-xs font-bold text-foreground">
                          Đài {o.province} · {o.drawDate} · {o.quantity} vé ({o.totalAmount.toLocaleString('vi-VN')} đ)
                        </div>
                      </div>

                      {o.prizeStatus === 'WON' && (
                        <div className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-center">
                          <div className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                            {o.wonPrizeDetail || 'Vé đã trúng thưởng!'}
                          </div>
                          <div className="mt-1 text-[11px] font-bold text-red-600">
                            Liên hệ trao giải ngay: 0789 780 167
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between bg-muted/30 px-4 py-2.5 text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                        {o.deliveryMethod === 'SAFE_KEEPING' ? (
                          <>
                            <ShieldCheck className="size-4 text-emerald-600" /> Giữ hộ két an toàn
                          </>
                        ) : (
                          <>
                            <Truck className="size-4 text-blue-600" /> Giao hỏa tốc ≤ 9km
                          </>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedOrderModal(o)}
                        className="font-bold text-red-600 hover:underline"
                      >
                        {o.safeKeepingPhotoUrl ? 'Xem ảnh vé lưu két' : 'Chi tiết đơn'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SỐ MÌNH THÍCH */}
        {activeTab === 'favorites' && (
          <div className="grid gap-6 lg:grid-cols-12">
            <form onSubmit={handleAddFavorite} className="lg:col-span-4 rounded-2xl border bg-card p-5 shadow-xs space-y-3 h-fit">
              <div className="flex items-center gap-2 text-sm font-black text-foreground">
                <Heart className="size-4 text-rose-500 fill-rose-500" /> Lưu Số Yêu Thích Mới
              </div>
              <input
                type="text"
                maxLength={6}
                required
                placeholder="VD: 68, 79 hoặc 839268"
                value={newFavNumber}
                onChange={(e) => setNewFavNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full rounded-xl border bg-background px-3 py-2 font-mono text-base font-black tracking-widest outline-none focus:ring-2 focus:ring-red-500"
              />
              <select
                value={newFavProvince}
                onChange={(e) => setNewFavProvince(e.target.value)}
                className="w-full rounded-xl border bg-background px-3 py-2 text-xs font-semibold outline-none"
              >
                {PROVINCES.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Ghi chú (tùy chọn)"
                value={newFavNote}
                onChange={(e) => setNewFavNote(e.target.value)}
                className="w-full rounded-xl border bg-background px-3 py-2 text-xs outline-none"
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-red-600 py-2.5 text-xs font-black text-white hover:bg-red-700"
              >
                <Plus className="size-4" /> Lưu Vào Bộ Sưu Tập
              </button>
            </form>

            <div className="lg:col-span-8 grid gap-3 sm:grid-cols-2 h-fit">
              {favorites.map((fav) => (
                <div key={fav.id} className="flex items-center justify-between rounded-2xl border bg-card p-4 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="grid min-w-[64px] place-items-center rounded-xl bg-red-600/10 px-3 py-2 font-mono text-xl font-black text-red-600">
                      {fav.number}
                    </div>
                    <div>
                      <div className="text-xs font-black text-foreground">Đài {fav.provinceName}</div>
                      <div className="text-[11px] text-muted-foreground">{fav.note}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => persistFavorites(favorites.filter((f) => f.id !== fav.id))}
                    className="rounded-lg p-2 text-muted-foreground hover:text-red-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PHONG THỦY & ÂM LỊCH */}
        {activeTab === 'fengshui' && (
          activeTier !== 'vip' ? (
            <VipLockCard
              title="Phong Thủy & Âm Lịch"
              description="Tính năng dành cho thành viên VIP. Xem con số may mắn hôm nay và tra cứu theo Mệnh & Năm sinh."
              onUpgrade={() => setActiveTab('upgrade')}
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Khung bên trái: Con số may mắn hôm nay (Tự động 2 số đuôi GĐB XSMB + Admin thêm bổ sung) */}
              <div className="rounded-3xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/10 via-card to-red-500/5 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-black text-amber-700 dark:text-amber-300">
                    <Compass className="size-3.5" /> MAY MẮN MỖI NGÀY
                  </div>
                  <h2 className="mt-2 text-xl font-black text-foreground">
                    Con Số Phong Thuỷ Hôm Nay Của Bạn?
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Chọn cung mệnh Ngũ Hành và năm sinh để hệ thống luận giải con số đại cát trong ngày hôm nay.
                  </p>

                  {/* Hiển thị 2 số đuôi GĐB XSMB (và song song cặp số bổ sung nếu Admin có nhập thêm) */}
                  <div className="mt-5 rounded-2xl border bg-background p-6 text-center shadow-2xs">
                    <div className="text-xs font-bold uppercase text-muted-foreground mb-3">
                      Cặp Số May Mắn (00:01 – 15:00)
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      {dailyLuckyPairs.map((pair, idx) => (
                        <div key={`${pair}-${idx}`} className="flex flex-col items-center gap-1.5">
                          <div className="grid size-20 place-items-center rounded-2xl bg-gradient-to-br from-red-600 to-amber-500 font-mono text-4xl font-black text-white shadow-md">
                            {pair}
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground">
                            {idx === 0 ? 'Đuôi G.ĐB XSMB' : 'Bổ sung hôm nay'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/40 p-3 text-xs">
                    <span className="text-muted-foreground">
                      Cập nhật tiếp theo: <strong className="text-foreground">{tomorrowDisplay}</strong>
                    </span>
                    <Link
                      href="/mua-ve-online"
                      className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-black text-white hover:bg-red-700"
                    >
                      Chọn vé ngay <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>

                <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-50/50 dark:bg-amber-950/20 p-3 text-[11px] italic leading-relaxed text-muted-foreground">
                  Lưu ý: Con số mang ý nghĩa tham khảo phong thủy giúp bạn thêm vững tin và gặp nhiều may mắn!
                </p>
              </div>

              {/* Khung bên phải: Tra cứu theo Mệnh, Can Chi & Năm sinh */}
              <div className="rounded-3xl border-2 border-red-500/30 bg-gradient-to-br from-red-600/10 via-card to-amber-500/10 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-red-600/15 px-3 py-1 text-[11px] font-black text-red-600 dark:text-red-400">
                    <MoonStar className="size-3.5" /> TRA CỨU THEO TUỔI / CAN CHI
                  </div>
                  <h2 className="mt-2 text-xl font-black text-foreground">
                    Tra Cứu Theo Mệnh &amp; Năm Sinh
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Chọn Ngũ Hành, nhập Can Chi và Năm sinh để nhận 2 cặp số may mắn theo ngày Âm lịch hôm nay.
                  </p>

                  <form onSubmit={handleFengShuiLookup} className="mt-4 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {FENG_SHUI_ELEMENTS.map((el) => (
                        <button
                          key={el.id}
                          type="button"
                          onClick={() => setSelectedElementId(el.id)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all ${selectedElementId === el.id
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'border bg-background text-foreground hover:bg-muted'
                            }`}
                        >
                          {el.name}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <div className="relative flex items-center gap-1.5">
                        <span className="font-bold text-muted-foreground">Can Chi:</span>
                        <div className="relative">
                          <input
                            type="text"
                            value={canChiInput}
                            autoComplete="off"
                            onFocus={() => setCanChiDropdownOpen(true)}
                            onBlur={() => setTimeout(() => setCanChiDropdownOpen(false), 120)}
                            onChange={(e) => {
                              setCanChiInput(e.target.value);
                              setCanChiDropdownOpen(true);
                            }}
                            placeholder="VD: Quý Hợi"
                            className="w-32 sm:w-36 rounded-lg border bg-background px-2.5 py-1.5 font-bold outline-none focus:border-red-500"
                          />
                          {canChiDropdownOpen && (
                            <div className="absolute left-0 top-full z-30 mt-1 max-h-52 w-48 overflow-y-auto rounded-xl border bg-popover p-1 shadow-lg">
                              {filteredCanChiOptions.length === 0 ? (
                                <div className="px-2.5 py-2 text-[11px] text-muted-foreground">
                                  Không tìm thấy Can Chi phù hợp
                                </div>
                              ) : (
                                filteredCanChiOptions.map((opt) => {
                                  const isSelected = foldVietnamese(canChiInput) === opt.folded;
                                  return (
                                    <button
                                      key={opt.label}
                                      type="button"
                                      onMouseDown={(ev) => {
                                        ev.preventDefault();
                                        setCanChiInput(opt.label);
                                        if (getCanChiFromYear(birthYear) !== opt.label) {
                                          setBirthYear(String(opt.sampleYear));
                                        }
                                        setCanChiDropdownOpen(false);
                                      }}
                                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                                        isSelected
                                          ? 'bg-red-600 font-black text-white'
                                          : 'font-semibold text-popover-foreground hover:bg-muted'
                                      }`}
                                    >
                                      <span>{opt.label}</span>
                                      <span
                                        className={`font-mono text-[10px] ${
                                          isSelected ? 'text-amber-200' : 'text-muted-foreground'
                                        }`}
                                      >
                                        {opt.sampleYear}
                                      </span>
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-muted-foreground">Năm sinh:</span>
                        <input
                          type="text"
                          maxLength={4}
                          required
                          value={birthYear}
                          onChange={(e) => {
                            const cleaned = e.target.value.replace(/\D/g, '');
                            setBirthYear(cleaned);
                            if (cleaned.length === 4) {
                              const autoCanChi = getCanChiFromYear(cleaned);
                              if (autoCanChi) setCanChiInput(autoCanChi);
                            }
                          }}
                          placeholder="VD: 1983"
                          className="w-20 rounded-lg border bg-background px-2.5 py-1.5 font-mono font-black outline-none focus:border-red-500"
                        />
                      </div>
                      <button
                        type="submit"
                        className="rounded-xl bg-red-600 px-4 py-1.5 text-xs font-black text-white hover:bg-red-700"
                      >
                        Tra cứu
                      </button>
                    </div>
                  </form>

                  {lookupResult && (
                    <div className="mt-4 rounded-2xl border bg-background p-4 text-center shadow-2xs">
                      <div className="text-xs font-bold text-red-600 dark:text-red-400">
                        {lookupResult.elementName}
                        {lookupResult.canChi ? ` · ${lookupResult.canChi} (${lookupResult.birthYear})` : ''} · {lookupResult.lunarDate}
                      </div>
                      <div className="mt-3 flex items-center justify-center gap-4">
                        {lookupResult.pairs.map((pair) => (
                          <span
                            key={pair}
                            className="grid size-16 place-items-center rounded-2xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/30 font-mono text-2xl font-black text-red-600 dark:text-amber-300 shadow-xs"
                          >
                            {pair}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4">
                        <Link
                          href="/mua-ve-online"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 px-5 py-2 text-xs font-black text-white shadow-sm hover:opacity-95 transition-opacity"
                        >
                          Chọn vé ngay <ArrowRight className="size-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <p className="mt-4 rounded-xl border border-red-500/20 bg-red-50/40 dark:bg-red-950/20 p-3 text-[11px] italic leading-relaxed text-muted-foreground">
                  Lưu ý nhỏ: Những con số này mang ý nghĩa tham khảo theo phong thủy và tâm lý tích cực giúp bạn thêm vững tin, gặp nhiều may mắn!
                </p>
              </div>
            </div>
          )
        )}

        {/* TAB 4: BIỂU ĐỒ CHUYÊN SÂU */}
        {activeTab === 'charts' && (
          activeTier !== 'vip' ? (
            <VipLockCard
              title="Biểu Đồ Chuyên Sâu Theo Miền & Đài"
              description="Thống kê tần suất chu kỳ 5/10/30 lần, cặp số ra liên tiếp, bảng tần suất 00-99 và lô gan tiệm cận ≥ 85% cực đại."
              onUpgrade={() => setActiveTab('upgrade')}
            />
          ) : (
            <div className="space-y-6">
              {/* Bộ lọc chọn Miền + Chọn đài thuộc đúng Miền */}
              <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'north', label: '1 - Miền Bắc (XSMB)' },
                    { id: 'central', label: '2 - Miền Trung (XSMT)' },
                    { id: 'south', label: '3 - Miền Nam (XSMN)' },
                  ].map((reg) => (
                    <button
                      key={reg.id}
                      type="button"
                      onClick={() => setChartRegion(reg.id as typeof chartRegion)}
                      className={`rounded-xl px-3.5 py-2 text-xs font-black transition-all ${chartRegion === reg.id
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-muted/60 hover:bg-muted text-foreground'
                        }`}
                    >
                      {reg.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground">Chọn theo đài phân tích:</span>
                  <select
                    value={chartProvinceId}
                    onChange={(e) => setChartProvinceId(e.target.value)}
                    className="rounded-xl border-2 border-red-500/40 bg-background px-3 py-2 text-xs font-black outline-none"
                  >
                    {regionProvinces.map((p) => (
                      <option key={p.id} value={p.id}>
                        Xổ số {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* a. Cặp số xuất hiện nhiều nhất (5, 10, 30), ra liên tiếp, lâu ra nhất */}
              <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-black text-foreground">
                    a. Phân Tích Chu Kỳ &amp; Nhịp Về ({PROVINCES.find((p) => p.id === chartProvinceId)?.name})
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-muted-foreground font-bold">Chu kỳ:</span>
                    {([5, 10, 30] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFreqCycle(c)}
                        className={`rounded-lg px-2.5 py-1 font-bold ${freqCycle === c ? 'bg-red-600 text-white' : 'border bg-background hover:bg-muted'
                          }`}
                      >
                        {c} lần
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border bg-muted/20 p-3.5">
                    <div className="text-xs font-black text-emerald-700 dark:text-emerald-300 mb-2">
                      Xuất hiện nhiều nhất ({freqCycle} kỳ)
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {topHot10.slice(0, 6).map((item) => (
                        <span key={item.number} className="rounded-lg bg-emerald-600/15 px-2.5 py-1 font-mono text-xs font-black text-emerald-700 dark:text-emerald-300">
                          {item.number} ({item.count})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border bg-muted/20 p-3.5">
                    <div className="text-xs font-black text-amber-700 dark:text-amber-300 mb-2">
                      Cặp số ra liên tiếp / lặp lại
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {consecutivePairs.map((item) => (
                        <span key={item.number} className="rounded-lg bg-amber-500/15 px-2.5 py-1 font-mono text-xs font-black text-amber-700 dark:text-amber-300">
                          {item.number} ({item.count} lần)
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border bg-muted/20 p-3.5">
                    <div className="text-xs font-black text-red-700 dark:text-red-300 mb-2">
                      Không xuất hiện lâu nhất
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {topGan10.slice(0, 6).map((item) => (
                        <span key={item.number} className="rounded-lg bg-red-600/15 px-2.5 py-1 font-mono text-xs font-black text-red-700 dark:text-red-300">
                          {item.number} ({item.daysUnopened}d)
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* b & c: Tần suất 00-99 & Lô gan cực đại >= 85% */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border bg-card p-5 shadow-xs">
                  <h3 className="flex items-center gap-1.5 text-sm font-extrabold text-foreground mb-3">
                    <Flame className="size-4 text-red-600" />
                    b. Thống Kê Tần Suất Theo Lô (00–99)
                  </h3>
                  <div className="space-y-2 mb-4">
                    {topHot10.map((item) => {
                      const pct = Math.max(12, Math.round((item.count / maxFreqVal) * 100));
                      return (
                        <div key={item.number} className="flex items-center gap-2 text-xs">
                          <span className="w-7 font-mono font-black text-emerald-600">{item.number}</span>
                          <div className="flex-1 h-4 rounded bg-muted/60 overflow-hidden">
                            <div style={{ width: `${pct}%` }} className="h-full bg-emerald-500 rounded" />
                          </div>
                          <span className="w-12 text-right font-mono font-bold">{item.count} lần</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-10 gap-1 border-t pt-3 text-center text-[10px] font-mono">
                    {Array.from({ length: 100 }, (_, i) => {
                      const num = String(i).padStart(2, '0');
                      const found = chartFreqAll.find((x) => x.number === num);
                      const c = found?.count || 0;
                      return (
                        <div
                          key={num}
                          className={`rounded p-1 ${c >= 3 ? 'bg-emerald-500/20 font-black text-emerald-700' : 'bg-muted/30 text-muted-foreground'
                            }`}
                          title={`Số ${num}: ${c} lần`}
                        >
                          <div>{num}</div>
                          <div className="text-[9px]">{c}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border bg-card p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="flex items-center gap-1.5 text-sm font-extrabold text-foreground">
                      <Snowflake className="size-4 text-sky-600" />
                      c. Thống Kê Lô Gan Cực Đại (Tiệm cận ≥ 85%)
                    </h3>
                    <span className="rounded-full bg-red-600/15 px-2.5 py-0.5 text-[10px] font-black text-red-600">
                      {nearMaxGan85.length} số ≥ 85%
                    </span>
                  </div>

                  {nearMaxGan85.length > 0 && (
                    <div className="mb-4 rounded-xl border border-red-500/40 bg-red-50 dark:bg-red-950/30 p-3">
                      <div className="text-[11px] font-black text-red-700 dark:text-red-300 mb-1.5">
                        Cảnh báo tiệm cận ≥ 85% ngưỡng gan cực đại:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {nearMaxGan85.map((item) => {
                          const ratio = Math.round((item.daysUnopened / item.maxGanHistory) * 100);
                          return (
                            <span
                              key={item.number}
                              className="rounded-lg bg-red-600 px-2.5 py-1 font-mono text-xs font-black text-white shadow-2xs"
                            >
                              {item.number} ({item.daysUnopened}/{item.maxGanHistory} · {ratio}%)
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {topGan10.map((item) => {
                      const pct = Math.max(10, Math.round((item.daysUnopened / maxGanVal) * 100));
                      const isHigh85 = item.maxGanHistory > 0 && item.daysUnopened / item.maxGanHistory >= 0.85;
                      return (
                        <div key={item.number} className="flex items-center gap-2 text-xs">
                          <span className={`w-7 font-mono font-black ${isHigh85 ? 'text-red-600' : 'text-foreground'}`}>
                            {item.number}
                          </span>
                          <div className="flex-1 h-4 rounded bg-muted/60 overflow-hidden">
                            <div
                              style={{ width: `${pct}%` }}
                              className={`h-full rounded ${isHigh85 ? 'bg-red-600' : 'bg-amber-500'}`}
                            />
                          </div>
                          <span className="w-14 text-right font-mono font-bold">{item.daysUnopened} ngày</span>
                          <span className="w-14 text-right text-[10px] text-muted-foreground">
                            Max {item.maxGanHistory}d
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* TAB 5: AI CHAT */}
        {activeTab === 'ai_chat' && (
          activeTier !== 'vip' ? (
            <VipLockCard
              title="Chat Với Trợ Lý Ảo Xổ Số Minh Luân AI"
              description="Hỏi đáp trực tiếp với Trợ lý AI (10 tin nhắn/ngày)."
              onUpgrade={() => setActiveTab('upgrade')}
            />
          ) : (
            <div className="overflow-hidden rounded-3xl border-2 border-red-500/30 bg-card shadow-md">
              <div className="flex items-center justify-between border-b bg-gradient-to-r from-[#8f0000] to-[#c41212] px-5 py-3.5 text-white">
                <div className="flex items-center gap-2 font-black text-sm">
                  <Bot className="size-5 text-amber-300" /> Trợ Lý Ảo Xổ Số Minh Luân AI
                </div>
                <span className="rounded-full bg-black/30 px-3 py-1 text-xs font-black text-amber-300">
                  Còn {remainingAiMsgs}/{MAX_DAILY_AI_MESSAGES} tin
                </span>
              </div>
              <div className="flex flex-wrap gap-2 border-b bg-muted/30 p-3">
                {PRESET_AI_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSendAiMessage(q)}
                    className="rounded-xl border bg-background px-3 py-1.5 text-xs font-bold hover:border-red-600"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <div className="h-72 overflow-y-auto space-y-3 p-4">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs ${m.role === 'user' ? 'bg-[#b80c0c] text-white' : 'border bg-muted/40'
                        }`}
                    >
                      {m.role === 'assistant' ? formatRichMessage(m.content) : m.content}
                    </div>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAiMessage();
                }}
                className="flex gap-2 border-t p-3"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Nhập câu hỏi..."
                  className="flex-1 rounded-xl border bg-background px-3 py-2 text-xs outline-none"
                />
                <button type="submit" className="rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white">
                  <Send className="size-4" />
                </button>
              </form>
            </div>
          )
        )}

        {/* TAB 6: NÂNG CẤP THÀNH VIÊN (4 GÓI VIP - GIÁ GỐC 299,000 đ / THÁNG) */}
        {activeTab === 'upgrade' && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-black text-foreground">
                Nâng Cấp Thành Viên VIP — Giá Gốc 299,000 đ / tháng
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Mở khóa toàn bộ Phong Thủy &amp; Âm Lịch, Biểu Đồ Chuyên Sâu và Trợ Lý Ảo AI.
              </p>
            </div>

            {vipStatusMsg && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300">
                {vipStatusMsg}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  months: 1 as const,
                  title: 'Gói 1 tháng',
                  subtitle: '299,000 đ / tháng',
                  badge: null,
                  totalDisplay: '299,000 đ',
                  note: 'Thanh toán linh hoạt từng tháng',
                },
                {
                  months: 3 as const,
                  title: 'Gói 3 tháng',
                  subtitle: '299,000 đ / tháng — Giảm 10%',
                  badge: 'Giảm 10%',
                  totalDisplay: '807,300 đ',
                  note: 'Giá gốc 897,000 đ (Tiết kiệm 89,700 đ)',
                },
                {
                  months: 6 as const,
                  title: 'Gói 6 tháng',
                  subtitle: 'Tặng 1 tháng (Tính tiền 5 tháng)',
                  badge: 'Tặng 1 tháng',
                  totalDisplay: '1,495,000 đ',
                  note: 'Chỉ ~249,166 đ/tháng',
                },
                {
                  months: 12 as const,
                  title: 'Gói 12 tháng',
                  subtitle: 'Tặng 3 tháng (Tính tiền 9 tháng)',
                  badge: 'Tặng 3 tháng',
                  totalDisplay: '2,691,000 đ',
                  note: 'Tiết kiệm nhất · Chỉ ~224,250 đ/tháng',
                },
              ].map((plan) => (
                <div
                  key={plan.months}
                  className={`relative flex flex-col justify-between rounded-3xl border-2 p-5 shadow-sm ${plan.months === 12
                    ? 'border-amber-400 bg-gradient-to-b from-amber-500/10 via-card to-red-500/5'
                    : 'border-border bg-card'
                    }`}
                >
                  {plan.badge && (
                    <span className="absolute right-4 top-4 rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white">
                      {plan.badge}
                    </span>
                  )}
                  <div>
                    <div className="text-sm font-black text-foreground">{plan.title}</div>
                    <div className="mt-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                      {plan.subtitle}
                    </div>
                    <div className="mt-4 text-2xl font-black text-red-600 dark:text-red-400">
                      {plan.totalDisplay}
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">{plan.note}</div>
                  </div>
                  <button
                    type="button"
                    disabled={vipLoading}
                    onClick={() => handleSubscribeVip(plan.months)}
                    className="mt-5 w-full rounded-xl bg-gradient-to-r from-red-600 to-amber-600 py-2.5 text-xs font-black text-white shadow-sm hover:from-red-700 hover:to-amber-700 disabled:opacity-50"
                  >
                    Chọn {plan.title}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: QUẢN TRỊ ADMIN */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            {adminMsg && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                {adminMsg}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              {/* 1. Thêm bổ sung Con số may mắn hôm nay (00:01 - 15:00) — không ghi đè đuôi GĐB */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setAdminMsg(null);
                  const res = await fetch('/api/feng-shui/daily', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ luckyPair: adminLuckyInput }),
                  });
                  const json = await res.json();
                  if (!res.ok) {
                    setAdminMsg(json.error || 'Không thể thêm bổ sung số.');
                    return;
                  }
                  if (Array.isArray(json.data?.luckyPairs)) {
                    setDailyLuckyPairs(json.data.luckyPairs);
                    setDailyLuckyPair(json.data.luckyPairs.join(', '));
                  }
                  setManualLuckyPair(json.data?.manualLuckyPair || null);
                  setAdminLuckyInput('');
                  setAdminMsg(
                    `Đã thêm bổ sung cặp số ${json.data.manualLuckyPair}! Hiện đang hiển thị song song: ${json.data.luckyPair}`
                  );
                }}
                className="rounded-2xl border bg-card p-5 shadow-xs space-y-3"
              >
                <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                  <Compass className="size-4 text-amber-500" />
                  Thêm Bổ Sung Số Phong Thủy (00:01 – 15:00)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Cặp số đuôi G.ĐB XSMB tự động (<strong className="text-foreground font-mono">{autoLuckyPair}</strong>) luôn được giữ nguyên. Nhập thêm 1 cặp số để hiển thị song song (VD: <span className="font-mono font-bold">{autoLuckyPair}, 11</span>).
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    maxLength={2}
                    required
                    placeholder="VD: 11"
                    value={adminLuckyInput}
                    onChange={(e) => setAdminLuckyInput(e.target.value.replace(/\D/g, ''))}
                    className="w-28 rounded-xl border bg-background px-3 py-2 font-mono text-base font-black text-center"
                  />
                  <button type="submit" className="rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white hover:bg-red-700">
                    Thêm Bổ Sung
                  </button>
                  {manualLuckyPair && (
                    <button
                      type="button"
                      onClick={async () => {
                        setAdminMsg(null);
                        const res = await fetch('/api/feng-shui/daily', { method: 'DELETE' });
                        const json = await res.json();
                        if (res.ok && json.data) {
                          setDailyLuckyPairs(json.data.luckyPairs);
                          setDailyLuckyPair(json.data.luckyPair);
                          setManualLuckyPair(null);
                          setAdminMsg(`Đã xóa số bổ sung. Hiện chỉ hiển thị đuôi G.ĐB tự động: ${json.data.luckyPair}`);
                        }
                      }}
                      className="rounded-xl border border-red-500/40 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      Xóa số thêm ({manualLuckyPair})
                    </button>
                  )}
                </div>
              </form>

              {/* 2. Upload vé thật mới vào kho (có công tắc bật/tắt nhãn) */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setAdminMsg(null);
                  const res = await fetch('/api/tickets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      province: newTicketProv,
                      drawDate: newTicketDate,
                      ticketNumber: newTicketNum,
                      availableQty: newTicketQty,
                      showBadge: newTicketShowBadge,
                      badgeText: newTicketBadgeText,
                    }),
                  });
                  const json = await res.json();
                  if (!res.ok) {
                    setAdminMsg(json.error || 'Lỗi đăng vé.');
                    return;
                  }
                  setAdminMsg(`Đã đăng vé ${json.ticket.ticketNumber} (${json.ticket.province}) lên kho!`);
                  setNewTicketNum('');
                }}
                className="rounded-2xl border bg-card p-5 shadow-xs space-y-3"
              >
                <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                  <Upload className="size-4 text-red-600" />
                  Đăng Vé Số Miền Nam Thật Lên Kho
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    required
                    value={newTicketProv}
                    onChange={(e) => setNewTicketProv(e.target.value)}
                    placeholder="Tên đài (VD: Đồng Nai)"
                    className="rounded-lg border bg-background px-3 py-1.5 font-semibold"
                  />
                  <input
                    type="date"
                    required
                    value={newTicketDate}
                    onChange={(e) => setNewTicketDate(e.target.value)}
                    className="rounded-lg border bg-background px-3 py-1.5 font-mono"
                  />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={newTicketNum}
                    onChange={(e) => setNewTicketNum(e.target.value.replace(/\D/g, ''))}
                    placeholder="6 số vé (VD: 839268)"
                    className="rounded-lg border bg-background px-3 py-1.5 font-mono font-bold"
                  />
                  <input
                    type="number"
                    min={1}
                    value={newTicketQty}
                    onChange={(e) => setNewTicketQty(parseInt(e.target.value, 10) || 16)}
                    placeholder="Số lượng (16, 160...)"
                    className="rounded-lg border bg-background px-3 py-1.5 font-mono"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={newTicketShowBadge}
                      onChange={(e) => setNewTicketShowBadge(e.target.checked)}
                      className="accent-red-600"
                    />
                    Gắn nhãn nổi bật trên thẻ vé
                  </label>
                  {newTicketShowBadge && (
                    <input
                      type="text"
                      value={newTicketBadgeText}
                      onChange={(e) => setNewTicketBadgeText(e.target.value)}
                      placeholder="Nội dung nhãn"
                      className="rounded-lg border bg-background px-2.5 py-1 text-xs"
                    />
                  )}
                </div>
                <button type="submit" className="rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white">
                  Đăng Vé Lên Kho
                </button>
              </form>
            </div>

            {/* 3. Quản lý đơn giữ hộ & Trúng thưởng */}
            <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-foreground">
                Quản Lý Đơn Giữ Hộ Két An Toàn &amp; Trả Thưởng ({adminOrders.length})
              </h3>
              <div className="space-y-2.5">
                {adminOrders.map((ord) => (
                  <div key={ord.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 text-xs">
                    <div>
                      <span className="font-mono font-black text-red-600">{ord.orderCode}</span> ·{' '}
                      <span className="font-mono font-bold">{ord.ticketNumber}</span> ({ord.province} · {ord.quantity} vé)
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        placeholder="URL ảnh vé thật lưu két..."
                        value={orderPhotoDrafts[ord.id] ?? ord.safeKeepingPhotoUrl ?? ''}
                        onChange={(e) =>
                          setOrderPhotoDrafts((prev) => ({ ...prev, [ord.id]: e.target.value }))
                        }
                        className="w-48 rounded-lg border bg-background px-2.5 py-1 text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          await fetch('/api/orders', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              id: ord.id,
                              safeKeepingPhotoUrl: orderPhotoDrafts[ord.id] ?? ord.safeKeepingPhotoUrl ?? '/images/ticket-sample-1.jpg',
                            }),
                          });
                          setAdminMsg(`Đã cập nhật ảnh lưu két cho đơn ${ord.orderCode}!`);
                        }}
                        className="rounded-lg bg-slate-800 px-2.5 py-1 font-bold text-white"
                      >
                        Lưu ảnh két
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await fetch('/api/orders', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              id: ord.id,
                              prizeStatus: 'WON',
                              wonPrizeDetail: 'Chúc mừng trúng thưởng! Liên hệ Minh Luân để nhận giải.',
                            }),
                          });
                          setAdminOrders((prev) =>
                            prev.map((x) => (x.id === ord.id ? { ...x, prizeStatus: 'WON' } : x))
                          );
                          setAdminMsg(`Đã đánh dấu TRÚNG THƯỞNG cho đơn ${ord.orderCode}!`);
                        }}
                        className="rounded-lg bg-emerald-600 px-2.5 py-1 font-bold text-white"
                      >
                        Đánh dấu Trúng
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal chỉnh sửa Hồ sơ & Avatar */}
        {profileModalOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-xs">
            <form onSubmit={handleSaveProfile} className="relative w-full max-w-md rounded-3xl border bg-card p-6 shadow-2xl space-y-4">
              <h3 className="text-lg font-black text-foreground">Cập Nhật Thông Tin Tài Khoản</h3>
              {profileMsg && <div className="text-xs font-bold text-emerald-600">{profileMsg}</div>}
              <div className="flex items-center gap-3">
                <img
                  src={editAvatarUrl || '/favicon-logo.png'}
                  alt="Preview"
                  className="size-14 rounded-2xl border object-cover"
                />
                <label className="cursor-pointer rounded-xl border bg-muted/50 px-3 py-2 text-xs font-bold hover:bg-muted">
                  Tải ảnh đại diện mới
                  <input type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />
                </label>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Tên hiển thị:</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Số điện thoại:</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-xs font-semibold"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="rounded-xl border px-4 py-2 text-xs font-bold"
                >
                  Hủy
                </button>
                <button type="submit" className="rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white">
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal Xác thực SĐT */}
        {phoneVerifyOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-xs">
            <form onSubmit={handleVerifyOtp} className="w-full max-w-sm rounded-3xl border bg-card p-6 shadow-2xl space-y-4">
              <h3 className="text-lg font-black text-foreground">Xác Thực Số Điện Thoại</h3>
              {otpMessage && <div className="text-xs font-bold text-emerald-600">{otpMessage}</div>}
              <div>
                <label className="block text-xs font-bold mb-1">Số điện thoại:</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    required
                    value={otpPhone}
                    onChange={(e) => setOtpPhone(e.target.value)}
                    placeholder="0901234567"
                    className="flex-1 rounded-xl border bg-background px-3 py-2 text-xs font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-white"
                  >
                    Gửi OTP
                  </button>
                </div>
              </div>
              {otpSent && (
                <div>
                  <label className="block text-xs font-bold mb-1">Nhập mã OTP (6 số):</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full rounded-xl border bg-background px-3 py-2 font-mono text-base font-black tracking-widest text-center"
                  />
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setPhoneVerifyOpen(false)} className="rounded-xl border px-4 py-2 text-xs font-bold">
                  Đóng
                </button>
                {otpSent && (
                  <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white">
                    Xác Nhận OTP
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Modal Ảnh Vé Thật Lưu Két */}
        {selectedOrderModal && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-md rounded-3xl border bg-card p-6 shadow-2xl text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">
                <ShieldCheck className="size-4" /> Ảnh Vé Lưu Két Minh Luân
              </div>
              {selectedOrderModal.safeKeepingPhotoUrl ? (
                <img
                  src={selectedOrderModal.safeKeepingPhotoUrl}
                  alt="Ảnh vé lưu két"
                  className="my-4 w-full rounded-2xl border object-cover max-h-60"
                />
              ) : (
                <div className="my-4 rounded-2xl border-2 border-dashed border-red-500/40 bg-gradient-to-br from-red-600 to-amber-600 p-5 text-white shadow-md">
                  <div className="text-xs uppercase tracking-widest text-amber-200 font-bold">
                    Đài {selectedOrderModal.province}
                  </div>
                  <div className="mt-2 font-mono text-4xl font-black tracking-widest">
                    {selectedOrderModal.ticketNumber}
                  </div>
                  <div className="mt-2 text-xs text-white/90">
                    Ngày mở thưởng: {selectedOrderModal.drawDate} · {selectedOrderModal.quantity} vé
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => setSelectedOrderModal(null)}
                className="w-full rounded-xl bg-muted py-2.5 text-xs font-bold hover:bg-muted/80"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </SiteFrame>
  );
}

function VipLockCard({
  title,
  description,
  onUpgrade,
}: {
  title: string;
  description: string;
  onUpgrade: () => void;
}) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-amber-400/60 bg-amber-500/5 p-8 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-500/20 text-amber-600">
        <Lock className="size-7" />
      </div>
      <h3 className="mt-4 text-lg font-black text-foreground">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-lg text-xs text-muted-foreground">{description}</p>
      <button
        type="button"
        onClick={onUpgrade}
        className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 px-5 py-2.5 text-xs font-black text-white shadow-md hover:scale-105 transition-transform"
      >
        <Crown className="size-4" /> Xem Gói Thành Viên VIP
      </button>
    </div>
  );
}
