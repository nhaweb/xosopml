'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
} from 'lucide-react';
import { SiteFrame } from '@/components/site/site-frame';

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
import { PROVINCES } from '@/config/lottery-provinces';
import { calculateLoGan } from '@/lib/stats-calculator';
import { getLotteryResults } from '@/lib/mock-lottery-data';

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
  {
    id: 'kim',
    name: 'Mệnh Kim',
    years: '1984, 1985, 1992, 1993, 2000, 2001',
    luckyColors: 'Vàng kim, Trắng bạc',
    luckyHour: '15:00 – 17:00 (Giờ Thân)',
    mainDigits: ['68', '79', '49'],
    direction: 'Tây Bắc',
  },
  {
    id: 'moc',
    name: 'Mệnh Mộc',
    years: '1980, 1981, 1988, 1989, 2002, 2003',
    luckyColors: 'Xanh lục, Xanh dương',
    luckyHour: '13:00 – 15:00 (Giờ Mùi)',
    mainDigits: ['38', '83', '14'],
    direction: 'Chính Đông',
  },
  {
    id: 'thuy',
    name: 'Mệnh Thủy',
    years: '1982, 1983, 1996, 1997, 2004, 2005',
    luckyColors: 'Xanh biển, Đen huyền',
    luckyHour: '11:00 – 13:00 (Giờ Ngọ)',
    mainDigits: ['16', '61', '09'],
    direction: 'Chính Bắc',
  },
  {
    id: 'hoa',
    name: 'Mệnh Hỏa',
    years: '1986, 1987, 1994, 1995, 2008, 2009',
    luckyColors: 'Đỏ son, Cam đất, Tím',
    luckyHour: '09:00 – 11:00 (Giờ Tỵ)',
    mainDigits: ['29', '92', '77'],
    direction: 'Chính Nam',
  },
  {
    id: 'tho',
    name: 'Mệnh Thổ',
    years: '1990, 1991, 1998, 1999, 2006, 2007',
    luckyColors: 'Vàng đất, Nâu trầm',
    luckyHour: '15:00 – 17:00 (Giờ Thân)',
    mainDigits: ['58', '85', '25'],
    direction: 'Đông Bắc',
  },
];

const PURCHASE_HISTORY = [
  {
    id: 'ML-89324',
    number: '839268',
    province: 'TP.HCM',
    date: '22/11/2026',
    status: 'waiting' as const,
    type: 'safekeeping' as const,
    amount: 20000,
    quantity: 2,
    verificationCode: 'SAFE-HCM-839268-VIP',
  },
  {
    id: 'ML-77219',
    number: '194779',
    province: 'Đồng Tháp',
    date: '21/11/2026',
    status: 'won' as const,
    wonPrize: 'Giải Tám (Trúng đuôi 79)',
    prizeAmount: 100000,
    type: 'safekeeping' as const,
    amount: 10000,
    quantity: 1,
    verificationCode: 'SAFE-DT-194779-WON',
  },
  {
    id: 'ML-65103',
    number: '542686',
    province: 'Hà Nội',
    date: '20/11/2026',
    status: 'lost' as const,
    type: 'delivered' as const,
    amount: 50000,
    quantity: 5,
    verificationCode: 'DELIV-HN-542686',
  },
];

function computeProvinceFrequency(provinceId: string) {
  const province = PROVINCES.find((p) => p.id === provinceId);
  if (!province) return [];
  const counts = new Map<string, number>();
  const now = new Date();
  for (let offset = 0; offset < 120; offset++) {
    const d = new Date(now);
    d.setDate(now.getDate() - offset);
    if (!province.drawDays.includes(d.getDay())) continue;
    const dayData = getLotteryResults(d);
    const draw = dayData[province.region].find((item) => item.provinceId === provinceId);
    if (!draw) continue;
    for (const prize of draw.prizes) {
      for (const num of prize.numbers) {
        const pair = num.trim().slice(-2);
        if (pair.length === 2) {
          counts.set(pair, (counts.get(pair) || 0) + 1);
        }
      }
    }
  }
  return Array.from(counts.entries())
    .map(([number, count]) => ({ number, count }))
    .sort((a, b) => b.count - a.count || a.number.localeCompare(b.number))
    .slice(0, 10);
}

export default function UserDashboardPage() {
  const [activeTier, setActiveTier] = useState<'free' | 'vip'>('vip');
  const [activeTab, setActiveTab] = useState<
    'history' | 'favorites' | 'fengshui' | 'charts' | 'ai_chat' | 'upgrade'
  >('history');

  // State bộ lọc lịch sử mua vé
  const [historyFilter, setHistoryFilter] = useState<'all' | 'won' | 'waiting'>('all');
  const [selectedTicketModal, setSelectedTicketModal] = useState<(typeof PURCHASE_HISTORY)[0] | null>(null);

  // State "Lưu lại số mình thích" (Free + VIP)
  const [favorites, setFavorites] = useState<FavoriteNumber[]>([
    { id: 'fav-1', number: '68', provinceName: 'Đồng Tháp', note: 'Số Lộc Phát yêu thích', createdAt: '22/11/2026' },
    { id: 'fav-2', number: '79', provinceName: 'TP.HCM', note: 'Thần Tài lớn', createdAt: '21/11/2026' },
    { id: 'fav-3', number: '839268', provinceName: 'TP.HCM', note: 'Bộ 6 số nuôi tuần này', createdAt: '20/11/2026' },
  ]);
  const [newFavNumber, setNewFavNumber] = useState('');
  const [newFavProvince, setNewFavProvince] = useState('Đồng Tháp');
  const [newFavNote, setNewFavNote] = useState('');

  // State Phong Thủy (VIP)
  const [selectedElementId, setSelectedElementId] = useState('kim');
  const [birthYear, setBirthYear] = useState('1992');

  // State Phân tích Chart theo đài (VIP)
  const [chartProvinceId, setChartProvinceId] = useState('dong-thap');

  // State AI Chat Trợ Lý Ảo Xổ Số (VIP - 10 tin nhắn / ngày)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Chào bạn! Mình là **Trợ Lý Ảo Xổ Số Minh Luân AI**. Bạn có **10 tin nhắn/ngày** để hỏi cầu số, lô gan cực đại và tần suất từng đài. Hãy chọn 1 trong 3 câu hỏi nhanh bên dưới hoặc gõ câu hỏi của bạn!',
      timestamp: 'Hôm nay',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [usedMessagesToday, setUsedMessagesToday] = useState(0);

  // Load saved favorites & daily chat quota from localStorage
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('minhluan_fav_numbers');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const todayKey = new Date().toISOString().slice(0, 10);
      const savedQuota = localStorage.getItem(`minhluan_ai_quota_${todayKey}`);
      if (savedQuota) setUsedMessagesToday(parseInt(savedQuota, 10) || 0);
    } catch {
      // ignore storage errors
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

  const handleDeleteFavorite = (id: string) => {
    persistFavorites(favorites.filter((f) => f.id !== id));
  };

  // Tính dữ liệu biểu đồ thật từ stats-calculator cho đài đang chọn
  const chartLoGan = useMemo(() => calculateLoGan(chartProvinceId).slice(0, 10), [chartProvinceId]);
  const chartHotFreq = useMemo(() => computeProvinceFrequency(chartProvinceId), [chartProvinceId]);
  const maxGanVal = Math.max(...chartLoGan.map((i) => i.daysUnopened), 1);
  const maxFreqVal = Math.max(...chartHotFreq.map((i) => i.count), 1);

  const selectedElement =
    FENG_SHUI_ELEMENTS.find((e) => e.id === selectedElementId) || FENG_SHUI_ELEMENTS[0];

  // Hàm sinh câu trả lời Trợ lý ảo Xổ số dựa trên dữ liệu thực tế của đài
  const generateAiReply = (question: string): string => {
    const q = question.toLowerCase();
    // Tìm đài được nhắc trong câu hỏi
    const matchedProvince =
      PROVINCES.find((p) => q.includes(p.name.toLowerCase())) ||
      (q.includes('đồng tháp')
        ? PROVINCES.find((p) => p.id === 'dong-thap')
        : q.includes('hcm') || q.includes('sài gòn')
        ? PROVINCES.find((p) => p.id === 'tphcm')
        : PROVINCES.find((p) => p.id === 'dong-thap'));

    const prov = matchedProvince || PROVINCES[1]; // mặc định Đồng Tháp
    const ganList = calculateLoGan(prov.id);
    const freqList = computeProvinceFrequency(prov.id);
    const topGan2 = ganList.slice(0, 2);
    const topHot3 = freqList.slice(0, 3);

    if (q.includes('lâu ra') || q.includes('gan') || q.includes('10 ngày')) {
      return `**Thống kê 2 cặp số lâu ra nhất đài ${prov.name}**:\n• Cặp **${topGan2[0]?.number}** — đã **${topGan2[0]?.daysUnopened} ngày** chưa về (gan cực đại lịch sử: ${topGan2[0]?.maxGanHistory} ngày).\n• Cặp **${topGan2[1]?.number}** — đã **${topGan2[1]?.daysUnopened} ngày** chưa về (gan cực đại lịch sử: ${topGan2[1]?.maxGanHistory} ngày).\n\n*Gợi ý*: Hai cặp này đang sát ngưỡng gan, bạn có thể theo dõi thêm ở tab **Biểu đồ chuyên sâu** hoặc chọn mua thử vé đuôi **${topGan2[0]?.number}** tại mục Mua Vé Online.`;
    }

    if (q.includes('đầu đuôi') || q.includes('cầu loto') || q.includes('hcm')) {
      return `**Phân tích cầu Loto & Tần suất đài ${prov.name} hôm nay**:\n• Top cặp về nhiều nhất gần đây: **${topHot3.map((h) => `${h.number} (${h.count} lần)`).join(', ')}**.\n• Đầu số đang chạy đều: **Đầu ${topHot3[0]?.number[0]}** và **Đầu ${topHot3[1]?.number[0]}**.\n• Cặp song thủ tham khảo hôm nay: **${topHot3[0]?.number} - ${topGan2[0]?.number}**.\n\n*Lưu ý*: Dữ liệu phân tích mang tính thống kê tham khảo, chúc bạn gặp nhiều may mắn!`;
    }

    return `**Gợi ý con số tham khảo đài ${prov.name} hôm nay**:\n• **Bạch thủ sáng giá (Tần suất cao)**: **${topHot3[0]?.number}** (về ${topHot3[0]?.count} lần trong các kỳ gần đây).\n• **Cặp số hồi gan đáng chú ý**: **${topGan2[0]?.number}** (${topGan2[0]?.daysUnopened} ngày chưa ra) & **${topGan2[1]?.number}** (${topGan2[1]?.daysUnopened} ngày).\n• **Đuôi đẹp kết hợp phong thủy**: **${selectedElement.mainDigits[0]} - ${selectedElement.mainDigits[1]}**.\n\nBạn có thể nhấn **Mua Vé Số Online** để tìm tờ vé thật có đuôi **${topHot3[0]?.number}** ngay bây giờ!`;
  };

  const handleSendAiMessage = (textToSend?: string) => {
    const content = (textToSend ?? chatInput).trim();
    if (!content) return;
    if (activeTier !== 'vip') {
      setActiveTab('upgrade');
      return;
    }
    if (usedMessagesToday >= MAX_DAILY_AI_MESSAGES) return;

    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
      timestamp: nowTime,
    };
    const botMsg: ChatMessage = {
      id: `a-${Date.now() + 1}`,
      role: 'assistant',
      content: generateAiReply(content),
      timestamp: nowTime,
    };

    const nextCount = usedMessagesToday + 1;
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setUsedMessagesToday(nextCount);
    setChatInput('');

    try {
      const todayKey = new Date().toISOString().slice(0, 10);
      localStorage.setItem(`minhluan_ai_quota_${todayKey}`, String(nextCount));
    } catch {
      // ignore
    }
  };

  const filteredHistory = PURCHASE_HISTORY.filter((t) => {
    if (historyFilter === 'all') return true;
    return t.status === historyFilter;
  });

  const remainingAiMsgs = Math.max(0, MAX_DAILY_AI_MESSAGES - usedMessagesToday);

  return (
    <SiteFrame>
      <div>
        {/* Header User Profile & Tier Switcher */}
        <div className="mb-6 rounded-2xl border bg-card p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src="/favicon-logo.png"
                  alt="Avatar Thành viên"
                  className="size-16 rounded-2xl border-2 border-amber-400 bg-white object-cover shadow-md"
                />
                {activeTier === 'vip' && (
                  <span
                    className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-amber-400 text-black shadow-xs"
                    title="Thành viên trả phí tháng"
                  >
                    <Crown className="size-3.5 fill-black" />
                  </span>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">
                    Thành viên Minh Luân
                  </h1>
                  {activeTier === 'vip' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#b80c0c] to-amber-500 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-xs">
                      <Crown className="size-3" /> THÀNH VIÊN TRẢ PHÍ THÁNG (VIP)
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-3 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                      THÀNH VIÊN KHÔNG PHÍ (FREE)
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>ID: ML-888999</span>
                  <span>•</span>
                  <span>Số yêu thích: {favorites.length}</span>
                  <span>•</span>
                  <span>
                    Trợ lý AI hôm nay:{' '}
                    <strong className="text-red-600 dark:text-red-400">
                      {activeTier === 'vip' ? `${remainingAiMsgs}/${MAX_DAILY_AI_MESSAGES} tin nhắn` : 'Gói VIP'}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Thanh gạt đổi chế độ xem Free / Trả Phí Tháng */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/mua-ve-online"
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-red-700 transition-all"
              >
                <ShoppingBag className="size-4" /> Mua Vé Số Online
              </Link>
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
                  Thành viên (Không phí)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTier('vip')}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    activeTier === 'vip'
                      ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Crown className="size-3.5" /> Trả Phí Tháng (VIP)
                </button>
              </div>
            </div>
          </div>

          {/* 4 Quick Stat Cards */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border bg-background p-3.5">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>Vé Đã Mua / Trúng Thưởng</span>
                <Ticket className="size-4 text-red-500" />
              </div>
              <div className="mt-1.5 text-xl font-black text-foreground">
                8 Vé <span className="text-xs font-bold text-emerald-600">(1 vé trúng)</span>
              </div>
            </div>

            <div className="rounded-2xl border bg-background p-3.5">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>Số Yêu Thích Đã Lưu</span>
                <Heart className="size-4 text-rose-500" />
              </div>
              <div className="mt-1.5 text-xl font-black text-foreground">
                {favorites.length} Con Số
              </div>
            </div>

            <div className="rounded-2xl border bg-background p-3.5">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>Số Phong Thủy Hôm Nay</span>
                <Compass className="size-4 text-amber-500" />
              </div>
              <div className="mt-1.5 font-mono text-xl font-extrabold text-red-600 dark:text-amber-400">
                {activeTier === 'vip' ? (
                  selectedElement.mainDigits.join(' · ')
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-sans font-bold text-muted-foreground">
                    <Lock className="size-4" /> Dành cho VIP
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border bg-background p-3.5">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>Trợ Lý Ảo Xổ Số AI</span>
                <Bot className="size-4 text-blue-500" />
              </div>
              <div className="mt-1.5 text-xl font-extrabold text-foreground">
                {activeTier === 'vip' ? (
                  `${remainingAiMsgs} / 10 tin hôm nay`
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground">
                    <Lock className="size-4" /> Nâng cấp VIP
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs khớp 100% Bản Draft User Dashboard */}
        <div className="mb-6 flex flex-wrap gap-1.5 border-b pb-3">
          {[
            { id: 'history', label: 'Lịch Sử Mua Vé', icon: Wallet, vipOnly: false },
            { id: 'favorites', label: 'Số Mình Thích', icon: Heart, vipOnly: false },
            { id: 'fengshui', label: 'Phong Thủy & Âm Lịch', icon: Compass, vipOnly: true },
            { id: 'charts', label: 'Biểu Đồ Chuyên Sâu', icon: BarChart3, vipOnly: true },
            { id: 'ai_chat', label: 'Chat Trợ Lý Ảo (10/ngày)', icon: MessageSquare, vipOnly: true },
            { id: 'upgrade', label: 'Nâng Cấp Tài Khoản', icon: Crown, vipOnly: false },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'border bg-card text-foreground hover:bg-muted'
                }`}
              >
                <tab.icon className="size-4" />
                {tab.label}
                {tab.vipOnly && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${
                      isActive ? 'bg-amber-300 text-red-950' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    VIP
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: LỊCH SỬ MUA VÉ (TRÚNG THƯỞNG, VÉ MUA) + MUA VÉ ONLINE */}
        {activeTab === 'history' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-foreground">
                  Lịch Sử Mua Vé &amp; Trúng Thưởng
                </h2>
                <p className="text-xs text-muted-foreground">
                  Theo dõi toàn bộ vé số online đã đặt mua, trạng thái giữ hộ/giao tận nơi và vé trúng thưởng.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {[
                  { id: 'all', label: 'Tất cả vé' },
                  { id: 'won', label: 'Trúng thưởng' },
                  { id: 'waiting', label: 'Chờ xổ' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setHistoryFilter(f.id as any)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                      historyFilter === f.id
                        ? 'bg-[#b80c0c] text-white shadow-xs'
                        : 'border bg-card text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {filteredHistory.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl border bg-card shadow-xs"
                >
                  <div className="border-b p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-muted-foreground">{t.id}</span>
                      {t.status === 'won' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                          <Trophy className="size-3" /> TRÚNG THƯỞNG
                        </span>
                      ) : t.status === 'waiting' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-700 dark:text-amber-300">
                          <Clock className="size-3" /> Chờ mở thưởng
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          Chưa trúng
                        </span>
                      )}
                    </div>

                    <div className="mt-3 text-center">
                      <div className="font-mono text-3xl font-black tracking-widest text-red-600 dark:text-red-400">
                        {t.number}
                      </div>
                      <div className="mt-1 text-xs font-bold text-foreground">
                        Đài {t.province} · {t.date} · {t.quantity} vé ({t.amount.toLocaleString('vi-VN')} đ)
                      </div>
                    </div>

                    {t.status === 'won' && (
                      <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-center">
                        <div className="text-[11px] font-black text-emerald-700 dark:text-emerald-300">
                          {t.wonPrize}
                        </div>
                        <div className="text-sm font-black text-emerald-600">
                          + {t.prizeAmount?.toLocaleString('vi-VN')} đ
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between bg-muted/30 px-4 py-2.5 text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                      {t.type === 'safekeeping' ? (
                        <>
                          <ShieldCheck className="size-4 text-emerald-600" /> Giữ hộ tại két
                        </>
                      ) : (
                        <>
                          <Truck className="size-4 text-blue-600" /> Đã giao tận nơi
                        </>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedTicketModal(t)}
                      className="font-bold text-red-600 dark:text-red-400 hover:underline"
                    >
                      Xem ảnh vé
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: LƯU LẠI SỐ MÌNH THÍCH (MIỄN PHÍ + VIP) */}
        {activeTab === 'favorites' && (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Form thêm số yêu thích */}
            <form
              onSubmit={handleAddFavorite}
              className="lg:col-span-4 rounded-2xl border bg-card p-5 shadow-xs space-y-3 h-fit"
            >
              <div className="flex items-center gap-2 text-sm font-black text-foreground">
                <Heart className="size-4 text-rose-500 fill-rose-500" />
                Lưu Số Yêu Thích Mới
              </div>
              <p className="text-xs text-muted-foreground">
                Lưu lại cặp 2 số hoặc bộ 6 số tâm đắc để theo dõi và dò nhanh mỗi ngày.
              </p>

              <div>
                <label className="block text-xs font-bold mb-1">Con số yêu thích (2–6 chữ số):</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="VD: 68, 79 hoặc 839268"
                  value={newFavNumber}
                  onChange={(e) => setNewFavNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-xl border bg-background px-3 py-2 font-mono text-base font-black tracking-widest outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Đài theo dõi:</label>
                <select
                  value={newFavProvince}
                  onChange={(e) => setNewFavProvince(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-red-500"
                >
                  {PROVINCES.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Ghi chú (tùy chọn):</label>
                <input
                  type="text"
                  placeholder="VD: Số ngày sinh, số mơ thấy..."
                  value={newFavNote}
                  onChange={(e) => setNewFavNote(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-red-600 py-2.5 text-xs font-black text-white shadow-sm hover:bg-red-700"
              >
                <Plus className="size-4" /> Lưu Vào Bộ Sưu Tập
              </button>
            </form>

            {/* Danh sách số yêu thích đã lưu */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-foreground">
                  Bộ Sưu Tập Số Yêu Thích ({favorites.length})
                </h2>
                <Link
                  href="/mua-ve-online"
                  className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                >
                  Tìm mua vé thật theo số này <ArrowRight className="size-3.5" />
                </Link>
              </div>

              {favorites.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-10 text-center text-xs text-muted-foreground">
                  Chưa có con số nào được lưu. Hãy thêm con số may mắn của bạn ở khung bên trái!
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {favorites.map((fav) => (
                    <div
                      key={fav.id}
                      className="flex items-center justify-between rounded-2xl border bg-card p-4 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid min-w-[64px] place-items-center rounded-xl bg-red-600/10 px-3 py-2 font-mono text-xl font-black text-red-600 dark:text-red-400">
                          {fav.number}
                        </div>
                        <div>
                          <div className="text-xs font-black text-foreground">Đài {fav.provinceName}</div>
                          <div className="text-[11px] text-muted-foreground">{fav.note}</div>
                          <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                            Đã lưu: {fav.createdAt}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteFavorite(fav.id)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                        title="Xóa số này"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CON SỐ PHONG THỦY HÔM NAY & CẶP SỐ MAY MẮN ĐẦU THÁNG ÂM LỊCH (VIP) */}
        {activeTab === 'fengshui' && (
          activeTier !== 'vip' ? (
            <VipLockCard
              title="Con Số Phong Thủy Hôm Nay & Cặp Số May Mắn Đầu Tháng Âm Lịch"
              description="Tính năng dành riêng cho Thành viên trả phí tháng. Nhận gợi ý con số ngũ hành hợp mệnh mỗi ngày và cặp số khai lộc đầu tháng âm lịch."
              onUpgrade={() => setActiveTab('upgrade')}
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Khối 1: Con số phong thủy hôm nay? -> May mắn mỗi ngày */}
              <div className="rounded-3xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/10 via-card to-red-500/5 p-6 shadow-sm">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-black text-amber-700 dark:text-amber-300">
                  <Compass className="size-3.5" /> MAY MẮN MỖI NGÀY
                </div>
                <h2 className="mt-2 text-xl font-black text-foreground">
                  Con Số Phong Thủy Hôm Nay Của Bạn?
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Chọn cung mệnh Ngũ Hành và năm sinh để hệ thống luận giải con số đại cát trong ngày hôm nay.
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {FENG_SHUI_ELEMENTS.map((el) => (
                    <button
                      key={el.id}
                      type="button"
                      onClick={() => setSelectedElementId(el.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all ${
                        selectedElementId === el.id
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'border bg-background text-foreground hover:bg-muted'
                      }`}
                    >
                      {el.name}
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs">
                  <span className="font-bold text-muted-foreground">Năm sinh:</span>
                  <input
                    type="text"
                    maxLength={4}
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, ''))}
                    className="w-24 rounded-lg border bg-background px-2.5 py-1 font-mono font-black"
                  />
                  <span className="text-[11px] text-muted-foreground">
                    (Tiêu biểu: {selectedElement.years})
                  </span>
                </div>

                {/* Kết quả Con số phong thủy */}
                <div className="mt-5 rounded-2xl border bg-background p-4 shadow-2xs">
                  <div className="text-xs font-bold uppercase text-muted-foreground">
                    Bộ Số Đại Cát Hôm Nay ({selectedElement.name}):
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    {selectedElement.mainDigits.map((num, idx) => (
                      <div
                        key={num}
                        className={`grid size-14 place-items-center rounded-2xl font-mono text-2xl font-black shadow-sm ${
                          idx === 0
                            ? 'bg-gradient-to-br from-red-600 to-amber-500 text-white'
                            : 'border-2 border-amber-400 bg-amber-50 text-red-700 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3 text-xs border-t pt-3">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Giờ hoàng đạo mua vé</span>
                      <strong className="text-foreground">{selectedElement.luckyHour}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Màu sắc hợp vận</span>
                      <strong className="text-foreground">{selectedElement.luckyColors}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Hướng xuất hành</span>
                      <strong className="text-foreground">{selectedElement.direction}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Khối 2: Cặp số may mắn đầu tháng âm lịch mỗi tháng */}
              <div className="rounded-3xl border-2 border-red-500/30 bg-gradient-to-br from-red-600/10 via-card to-amber-500/10 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-red-600/15 px-3 py-1 text-[11px] font-black text-red-600 dark:text-red-400">
                    <MoonStar className="size-3.5" /> KHAI LỘC ĐẦU THÁNG ÂM LỊCH
                  </div>
                  <h2 className="mt-2 text-xl font-black text-foreground">
                    Cặp Số May Mắn Đầu Tháng Âm Lịch
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Cập nhật tự động vào ngày Mùng 1 Âm Lịch hàng tháng dựa theo Can Chi, Nhị Thập Bát Tú và chu kỳ xổ số 3 miền.
                  </p>

                  <div className="mt-5 rounded-2xl border bg-background p-4">
                    <div className="flex items-center justify-between border-b pb-2.5 text-xs">
                      <span className="font-black text-red-600 dark:text-red-400">
                        Tháng 10 Âm Lịch (Năm Bính Ngọ 2026)
                      </span>
                      <span className="rounded-md bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                        Tháng Đại Cát
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {[
                        { pair: '39 - 79', label: 'Song Tài Khai Vận', region: 'Ưu tiên Miền Nam' },
                        { pair: '68 - 86', label: 'Lộc Phát Viên Mãn', region: 'Ưu tiên Miền Trung' },
                        { pair: '28 - 82', label: 'Mãi Phát Đắc Lộc', region: 'Ưu tiên Miền Bắc' },
                      ].map((item) => (
                        <div
                          key={item.pair}
                          className="rounded-xl border border-amber-400/50 bg-amber-50/50 dark:bg-amber-950/20 p-3 text-center"
                        >
                          <div className="font-mono text-xl font-black text-red-600 dark:text-amber-300">
                            {item.pair}
                          </div>
                          <div className="mt-1 text-[11px] font-bold text-foreground">{item.label}</div>
                          <div className="text-[10px] text-muted-foreground">{item.region}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/40 p-3 text-xs">
                  <span className="text-muted-foreground">
                    Kỳ cập nhật tiếp theo: <strong>Mùng 1 Tháng 11 Âm Lịch</strong>
                  </span>
                  <Link
                    href="/mua-ve-online"
                    className="font-black text-red-600 hover:underline flex items-center gap-1"
                  >
                    Chọn vé ngay <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )
        )}

        {/* TAB 4: PHÂN TÍCH CHUYÊN SÂU BẰNG CHART (SỐ LÂU RA & SỐ HAY RA TỪNG ĐÀI) */}
        {activeTab === 'charts' && (
          activeTier !== 'vip' ? (
            <VipLockCard
              title="Phân Tích Chuyên Sâu Bằng Biểu Đồ (Chart) Theo Từng Đài"
              description="Xem biểu đồ cột trực quan Top 10 số lâu ra nhất (Lô Gan) và Top 10 số hay ra nhất (Tần suất) cho từng tỉnh/đài."
              onUpgrade={() => setActiveTab('upgrade')}
            />
          ) : (
            <div className="space-y-6">
              {/* Chọn đài để vẽ biểu đồ */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-xs">
                <div>
                  <h2 className="text-base font-black text-foreground flex items-center gap-2">
                    <BarChart3 className="size-5 text-red-600" />
                    Biểu Đồ Thống Kê Chuyên Sâu Theo Đài
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Dữ liệu được tính toán trực tiếp theo từng kỳ quay của đài bạn chọn.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground">Chọn đài phân tích:</span>
                  <select
                    value={chartProvinceId}
                    onChange={(e) => setChartProvinceId(e.target.value)}
                    className="rounded-xl border-2 border-red-500/40 bg-background px-3 py-2 text-xs font-black outline-none focus:border-red-600"
                  >
                    {PROVINCES.map((p) => (
                      <option key={p.id} value={p.id}>
                        Xổ số {p.name} ({p.region === 'south' ? 'MN' : p.region === 'central' ? 'MT' : 'MB'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Chart 1: Biểu đồ Top 10 Số Lâu Ra (Lô Gan) */}
                <div className="rounded-2xl border bg-card p-5 shadow-xs">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="flex items-center gap-1.5 text-sm font-extrabold text-foreground">
                        <Snowflake className="size-4 text-sky-600 dark:text-sky-400" />
                        Biểu Đồ Số Lâu Ra Nhất (Lô Gan)
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Số ngày chưa xuất hiện (Top 10 cặp số gan lâu nhất)
                      </p>
                    </div>
                    <span className="rounded-full bg-red-100 dark:bg-red-950/60 px-2.5 py-0.5 text-[10px] font-extrabold text-red-600 dark:text-red-400">
                      Đơn vị: Ngày
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {chartLoGan.map((item, idx) => {
                      const pct = Math.max(10, Math.round((item.daysUnopened / maxGanVal) * 100));
                      return (
                        <div key={item.number} className="flex items-center gap-2.5 text-xs">
                          <span className="w-7 font-mono text-sm font-extrabold text-red-600 dark:text-red-400">
                            {item.number}
                          </span>
                          <div className="flex-1 h-5 rounded-lg bg-muted/60 overflow-hidden p-0.5">
                            <div
                              style={{ width: `${pct}%` }}
                              className={`h-full rounded-md transition-all duration-500 ${
                                idx < 3
                                  ? 'bg-gradient-to-r from-[#b80c0c] to-rose-500'
                                  : 'bg-gradient-to-r from-amber-500 to-orange-500'
                              }`}
                            />
                          </div>
                          <span className="w-16 text-right font-mono font-bold text-foreground">
                            {item.daysUnopened} ngày
                          </span>
                          <span className="w-14 text-right text-[10px] text-muted-foreground">
                            Max {item.maxGanHistory}d
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chart 2: Biểu đồ Top 10 Số Hay Ra (Tần Suất) */}
                <div className="rounded-2xl border bg-card p-5 shadow-xs">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="flex items-center gap-1.5 text-sm font-extrabold text-foreground">
                        <Flame className="size-4 text-red-600 dark:text-red-400" />
                        Biểu Đồ Số Hay Ra Nhất (Tần Suất Cao)
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Số lần xuất hiện trong 120 ngày gần nhất (Top 10)
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                      Đơn vị: Lần về
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {chartHotFreq.map((item, idx) => {
                      const pct = Math.max(12, Math.round((item.count / maxFreqVal) * 100));
                      return (
                        <div key={item.number} className="flex items-center gap-2.5 text-xs">
                          <span className="w-7 font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                            {item.number}
                          </span>
                          <div className="flex-1 h-5 rounded-lg bg-muted/60 overflow-hidden p-0.5">
                            <div
                              style={{ width: `${pct}%` }}
                              className={`h-full rounded-md transition-all duration-500 ${
                                idx < 3
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                                  : 'bg-gradient-to-r from-blue-500 to-sky-500'
                              }`}
                            />
                          </div>
                          <span className="w-14 text-right font-mono font-bold text-foreground">
                            {item.count} lần
                          </span>
                          <span className="w-11 text-right text-[10px] font-bold text-muted-foreground">
                            Top {idx + 1}
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

        {/* TAB 5: CHAT VỚI TRỢ LÝ ẢO XỔ SỐ (3 CÂU HỎI SẴN + 10 TIN NHẮN / NGÀY) */}
        {activeTab === 'ai_chat' && (
          activeTier !== 'vip' ? (
            <VipLockCard
              title="Chat Với Trợ Lý Ảo Xổ Số Minh Luân AI (10 tin nhắn/ngày)"
              description="Hỏi đáp trực tiếp với Trợ lý AI phân tích số đẹp, thống kê cặp số lâu ra và cầu loto từng đài theo thời gian thực."
              onUpgrade={() => setActiveTab('upgrade')}
            />
          ) : (
            <div className="overflow-hidden rounded-3xl border-2 border-red-500/30 bg-card shadow-md">
              {/* Header Chat */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-gradient-to-r from-[#8f0000] to-[#c41212] px-5 py-3.5 text-white">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-amber-400 text-red-950 shadow-sm">
                    <Bot className="size-6" />
                  </span>
                  <div>
                    <h2 className="text-sm sm:text-base font-black">
                      Trợ Lý Ảo Xổ Số Minh Luân AI
                    </h2>
                    <p className="text-[11px] text-amber-200">
                      Phân tích dữ liệu 3 miền trực tiếp · Tự động tổng hợp Lô Gan &amp; Tần Suất
                    </p>
                  </div>
                </div>
                <div className="rounded-full bg-black/30 px-3.5 py-1 text-xs font-black text-amber-300">
                  Còn {remainingAiMsgs} / {MAX_DAILY_AI_MESSAGES} tin nhắn hôm nay
                </div>
              </div>

              {/* 3 Câu Hỏi Sẵn Theo Spec Docx */}
              <div className="border-b bg-muted/30 px-4 py-3">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                  <Sparkles className="size-3.5 text-amber-500" />
                  3 Câu hỏi gợi ý sẵn (Bấm để hỏi ngay):
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRESET_AI_QUESTIONS.map((q, idx) => (
                    <button
                      key={q}
                      type="button"
                      disabled={remainingAiMsgs === 0}
                      onClick={() => handleSendAiMessage(q)}
                      className="rounded-xl border border-red-500/30 bg-background px-3 py-2 text-left text-xs font-bold text-foreground transition-all hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-40"
                    >
                      <span className="mr-1.5 inline-grid size-5 place-items-center rounded-full bg-red-600 text-[10px] font-black text-white">
                        {idx + 1}
                      </span>
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Khung Nội Dung Hội Thoại */}
              <div className="h-[340px] overflow-y-auto space-y-3 p-4 sm:p-5">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-2xs space-y-1 ${
                        msg.role === 'user'
                          ? 'bg-[#b80c0c] text-white font-semibold'
                          : 'border bg-muted/40 text-foreground'
                      }`}
                    >
                      <div>
                        {msg.role === 'assistant' ? formatRichMessage(msg.content) : msg.content}
                      </div>
                      <div
                        className={`mt-1.5 text-[10px] ${
                          msg.role === 'user' ? 'text-white/75 text-right' : 'text-muted-foreground'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ô Nhập Tin Nhắn */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAiMessage();
                }}
                className="flex items-center gap-2 border-t bg-muted/20 p-3"
              >
                <input
                  type="text"
                  disabled={remainingAiMsgs === 0}
                  placeholder={
                    remainingAiMsgs === 0
                      ? 'Bạn đã dùng hết 10 tin nhắn hôm nay. Hệ thống sẽ làm mới lúc 00:00!'
                      : 'Nhập câu hỏi về đài xổ số, cặp số lâu ra, cầu đẹp...'
                  }
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={remainingAiMsgs === 0 || !chatInput.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white shadow-sm hover:bg-red-700 disabled:opacity-40"
                >
                  <Send className="size-4" /> Gửi
                </button>
              </form>
            </div>
          )
        )}

        {/* TAB 6: NÂNG CẤP TÀI KHOẢN (SO SÁNH FREE VS TRẢ PHÍ THÁNG) */}
        {activeTab === 'upgrade' && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Gói Miễn Phí */}
            <div className="rounded-3xl border bg-card p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                  GÓI THÀNH VIÊN KHÔNG PHÍ
                </span>
                <div className="mt-3 text-3xl font-black text-foreground">
                  0 đ <span className="text-sm font-normal text-muted-foreground">/ mãi mãi</span>
                </div>
                <ul className="mt-5 space-y-3 text-xs">
                  {[
                    'Mua vé số online trực quan theo ảnh chụp vé thật',
                    'Theo dõi Lịch sử mua vé (vé mua & vé trúng thưởng)',
                    'Lưu lại danh sách con số mình thích',
                    'Tra cứu kết quả xổ số 3 miền nhanh, chuẩn xác',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 font-semibold text-foreground">
                      <Check className="size-4 text-emerald-600 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setActiveTier('free')}
                className="mt-6 w-full rounded-xl border py-2.5 text-xs font-black hover:bg-muted"
              >
                {activeTier === 'free' ? 'Đang Sử Dụng Gói Miễn Phí' : 'Chuyển Về Chế Độ Free'}
              </button>
            </div>

            {/* Gói Trả Phí Tháng */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-500/10 via-card to-red-500/5 p-6 shadow-md flex flex-col justify-between">
              <div className="absolute right-4 top-4 rounded-full bg-red-600 px-3 py-1 text-[10px] font-black uppercase text-white">
                Phổ Biến Nhất
              </div>
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black text-amber-700 dark:text-amber-300">
                  <Crown className="size-3.5" /> THÀNH VIÊN TRẢ PHÍ THÁNG
                </span>
                <div className="mt-3 text-3xl font-black text-red-600 dark:text-amber-400">
                  49.000 đ <span className="text-sm font-normal text-muted-foreground">/ tháng</span>
                </div>
                <ul className="mt-5 space-y-3 text-xs">
                  {[
                    'Tất cả tính năng thành viên không phí',
                    'Con số phong thủy hôm nay ➔ May mắn mỗi ngày',
                    'Cặp số may mắn đầu tháng âm lịch mỗi tháng',
                    'Phân tích chuyên sâu bằng Chart (số lâu ra, số hay ra từng đài)',
                    'Chat với Trợ lý ảo xổ số AI (10 tin nhắn/ngày + 3 câu hỏi nhanh)',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 font-bold text-foreground">
                      <Sparkles className="size-4 text-amber-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTier('vip');
                  setActiveTab('ai_chat');
                }}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-red-600 to-amber-600 py-3 text-xs font-black text-white shadow-md hover:from-red-700 hover:to-amber-700"
              >
                {activeTier === 'vip' ? '✓ Đang Kích Hoạt Gói VIP Tháng' : 'Nâng Cấp Gói VIP Ngay'}
              </button>
            </div>
          </div>
        )}

        {/* Modal Ảnh Vé Thật */}
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
                <ShieldCheck className="size-4" /> Ảnh Vé Xác Thực Minh Luân
              </div>
              <div className="my-4 rounded-2xl border-2 border-dashed border-red-500/40 bg-gradient-to-br from-red-600 to-amber-600 p-5 text-white shadow-md">
                <div className="text-xs uppercase tracking-widest text-amber-200 font-bold">
                  Đài {selectedTicketModal.province}
                </div>
                <div className="mt-2 font-mono text-4xl font-black tracking-widest">
                  {selectedTicketModal.number}
                </div>
                <div className="mt-2 text-xs text-white/90">
                  Ngày mở thưởng: {selectedTicketModal.date}
                </div>
                <div className="mt-3 border-t border-white/20 pt-2 text-[10px] text-white/80">
                  Mã xác thực: {selectedTicketModal.verificationCode}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicketModal(null)}
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
        <Crown className="size-4" /> Xem Gói Thành Viên Trả Phí Tháng
      </button>
    </div>
  );
}
