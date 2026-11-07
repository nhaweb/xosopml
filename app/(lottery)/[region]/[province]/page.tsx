import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CalendarClock,
  MapPin,
  ChevronRight,
  Home,
  Building2,
  Phone,
  Trophy,
  History,
  ShieldCheck,
} from 'lucide-react';
import { PROVINCES } from '@/config/lottery-provinces';
import { RegionLotteryBoard } from '@/components/lottery/region-lottery-board';
import { QuickTicketCheckerBar } from '@/components/lottery/quick-ticket-checker-bar';
import { SiteFrame } from '@/components/site/site-frame';
import { getLotteryResults } from '@/lib/mock-lottery-data';
import { formatDate, shortDate } from '@/lib/format';
import { toRouteDate } from '@/lib/lottery-date';
import { ProvinceDrawResult, Region } from '@/types/lottery';

const WEEKDAY_LABELS = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

const REGION_ALIASES: Record<string, Region> = {
  south: 'south',
  central: 'central',
  north: 'north',
  'mien-nam': 'south',
  'mien-trung': 'central',
  'mien-bac': 'north',
  xsmn: 'south',
  xsmt: 'central',
  xsmb: 'north',
};

const REGION_NAME: Record<Region, string> = {
  south: 'Miền Nam',
  central: 'Miền Trung',
  north: 'Miền Bắc',
};

type PageProps = {
  params: Promise<{ region: string; province: string }>;
};

function recentDraws(provinceId: string, region: Region, limit: number) {
  const province = PROVINCES.find((item) => item.id === provinceId);
  if (!province) return [];

  const draws: { date: Date; result: ProvinceDrawResult }[] = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);

  for (let offset = 0; offset < 180 && draws.length < limit; offset += 1) {
    const date = new Date(cursor);
    date.setDate(cursor.getDate() - offset);
    if (!province.drawDays.includes(date.getDay())) continue;

    const day = getLotteryResults(date);
    const result = day[region].find((item) => item.provinceId === provinceId);
    if (result) draws.push({ date, result });
  }

  return draws;
}

export default async function ProvincePage({ params }: PageProps) {
  const { region: rawRegion, province: rawProvince } = await params;
  const cleanRegionSlug = rawRegion.replace(/\.html$/, '');
  const cleanProvinceSlug = rawProvince.replace(/\.html$/, '');

  const region = REGION_ALIASES[cleanRegionSlug];
  const province = PROVINCES.find((item) => item.id === cleanProvinceSlug);

  if (!region || !province || province.region !== region) {
    notFound();
  }

  // Lấy lịch sử 6 kỳ gần nhất của đài này
  const history = recentDraws(province.id, province.region, 6);
  const latestDraw = history[0];

  const drawDayNames = province.drawDays.map((d) => WEEKDAY_LABELS[d]).join(', ');

  const sameDayProvinces = PROVINCES.filter(
    (item) =>
      item.region === province.region &&
      item.id !== province.id &&
      item.drawDays.some((day) => province.drawDays.includes(day))
  );

  return (
    <SiteFrame>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="flex items-center gap-1 hover:text-foreground">
          <Home className="size-3.5" /> Trang chủ
        </Link>
        <ChevronRight className="size-3" />
        <span className="hover:text-foreground">{REGION_NAME[province.region]}</span>
        <ChevronRight className="size-3" />
        <span className="font-bold text-red-600 dark:text-red-400">Xổ số {province.name}</span>
      </nav>

      {/* Hero Header */}
      <div className="mb-6 rounded-2xl border bg-card p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400">
              <MapPin className="size-4" />
              XS{province.code} · SX{province.code} · XSKT {province.name}
            </div>
            <h1 className="mt-1 text-2xl sm:text-4xl font-black tracking-tight text-foreground">
              Kết Quả Xổ Số {province.name} - Minh Ngọc™
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
              Trực tiếp KQXS {province.name} vào lúc <strong className="text-foreground">{province.drawTime}</strong> ({drawDayNames} hàng tuần). Cập nhật bảng kết quả và thống kê lô tô đầu đuôi 0 đến 9.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-xl border bg-muted/40 px-3 py-1.5 text-xs font-bold text-foreground">
              Mã đài: <strong className="text-red-600 dark:text-red-400">{province.code}</strong>
            </span>
            <span className="rounded-xl border bg-muted/40 px-3 py-1.5 text-xs font-bold text-foreground">
              Giờ quay: {province.drawTime}
            </span>
          </div>
        </div>

        {/* Quick Date Selector for this Province */}
        {history.length > 0 && (
          <div className="mt-5 border-t pt-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <History className="size-3.5 text-red-600" />
              Chọn ngày xem các kỳ trước:
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map(({ date }, idx) => (
                <a
                  key={toRouteDate(date)}
                  href={`#draw-${toRouteDate(date)}`}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    idx === 0
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'border bg-background hover:bg-muted text-foreground'
                  }`}
                >
                  {idx === 0 ? 'Kỳ mới nhất' : formatDate(date)}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Ticket Checker Bar for this Province */}
      {latestDraw && (
        <QuickTicketCheckerBar provinces={[latestDraw.result]} />
      )}

      {/* Main Results History */}
      <div className="space-y-10">
        {history.map(({ date, result }, idx) => (
          <div key={toRouteDate(date)} id={`draw-${toRouteDate(date)}`} className="space-y-3 scroll-mt-20">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
              <div className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-full bg-red-600 text-white text-xs font-black">
                  {idx + 1}
                </span>
                <h2 className="text-lg font-black text-foreground">
                  Kết Quả XS {province.name} ngày {formatDate(date)}
                </h2>
              </div>
              <Link
                href={`/ngay/${toRouteDate(date)}`}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
              >
                Xem toàn bộ các đài ngày này →
              </Link>
            </div>

            <RegionLotteryBoard
              id={`${province.id}-${toRouteDate(date)}`}
              title={`Xổ Số ${province.name} (XS${province.code})`}
              regionCode={province.code}
              drawTime={province.drawTime}
              dateStr={formatDate(date)}
              results={[result]}
            />
          </div>
        ))}
      </div>

      {/* Thông tin mở thưởng & Công ty XSKT */}
      <section className="mt-12 rounded-2xl border bg-card p-5 sm:p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-base font-black text-foreground uppercase">
          <Building2 className="size-5 text-red-600" />
          Thông Tin Đổi Thưởng & Lịch Quay Xổ Số {province.name}
        </h3>

        <div className="grid gap-6 sm:grid-cols-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <div className="space-y-2 rounded-xl bg-muted/20 p-4 border">
            <p className="font-bold text-foreground">Cơ cấu giải thưởng XSKT {province.name}:</p>
            <ul className="list-disc pl-4 space-y-1 text-xs">
              <li><strong>Giải Đặc Biệt (2 Tỷ đồng)</strong>: Dãy 6 chữ số (vé 10.000đ).</li>
              <li><strong>Giải Phụ Đặc Biệt (50 Triệu)</strong>: Trúng 5 số cuối theo thứ tự giải ĐB.</li>
              <li><strong>Giải Khuyến Khích (6 Triệu)</strong>: Sai 1 chữ số bất kỳ so với giải ĐB.</li>
              <li><strong>Giải Nhất (30 Triệu)</strong> đến <strong>Giải Tám (100 Nghìn)</strong>.</li>
            </ul>
          </div>

          <div className="space-y-2 rounded-xl bg-muted/20 p-4 border">
            <p className="font-bold text-foreground">Thời gian & Quy định lĩnh thưởng:</p>
            <p className="text-xs">
              Vé trúng thưởng có giá trị lĩnh thưởng trong vòng <strong>30 ngày</strong> kể từ ngày mở thưởng. Quá hạn, vé số không còn giá trị lĩnh thưởng.
            </p>
            <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs font-bold text-foreground">
              <ShieldCheck className="size-4 text-emerald-600" />
              Vé trúng thưởng phải còn nguyên vẹn, không rách nát, chắp vá hay tẩy xóa.
            </div>
          </div>
        </div>

        {/* Các đài cùng quay hôm đó */}
        {sameDayProvinces.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-bold text-muted-foreground mb-2">
              Các đài cùng mở thưởng {drawDayNames}:
            </p>
            <div className="flex flex-wrap gap-2">
              {sameDayProvinces.map((item) => (
                <Link
                  key={item.id}
                  href={`/${item.region}/${item.id}`}
                  className="rounded-xl border bg-background px-3 py-1 text-xs font-semibold hover:bg-red-600 hover:text-white transition-colors"
                >
                  Xổ số {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </SiteFrame>
  );
}
