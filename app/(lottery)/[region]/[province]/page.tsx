import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarClock, MapPin } from 'lucide-react';
import { PROVINCES } from '@/config/lottery-provinces';
import { RegionLotteryBoard } from '@/components/lottery/region-lottery-board';
import { SiteFrame } from '@/components/site/site-frame';
import { getLotteryResults } from '@/lib/mock-lottery-data';
import { formatDate } from '@/lib/format';
import { toRouteDate } from '@/lib/lottery-date';
import { ProvinceDrawResult, Region } from '@/types/lottery';

const WEEKDAY_LABELS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

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

  for (let offset = 0; offset < 120 && draws.length < limit; offset += 1) {
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
  const { region: regionSlug, province: provinceSlug } = await params;
  const region = REGION_ALIASES[regionSlug];
  const province = PROVINCES.find((item) => item.id === provinceSlug);
  if (!region || !province || province.region !== region) notFound();

  const history = recentDraws(province.id, province.region, 8);
  const sameDay = PROVINCES.filter(
    (item) => item.region === province.region && item.id !== province.id && item.drawDays.some((day) => province.drawDays.includes(day)),
  );

  return (
    <SiteFrame>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-red-600 uppercase dark:text-red-400">
          <MapPin className="size-4" />
          {REGION_NAME[province.region]} · {province.code}
        </div>
        <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-4xl">Xổ số {province.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Giờ mở thưởng {province.drawTime}. Lịch sử dưới đây lấy từ dữ liệu mô phỏng theo đúng thứ trong tuần.</p>
      </div>

      <section className="mb-8 rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <h2 className="flex items-center gap-2 text-sm font-black tracking-wide uppercase">
          <CalendarClock className="size-4 text-red-600" />
          Lịch mở thưởng trong tuần
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {WEEKDAY_LABELS.map((label, day) => {
            const opens = province.drawDays.includes(day);
            return (
              <div
                key={label}
                className={`rounded-xl border px-3 py-2 text-center text-sm ${
                  opens ? 'border-red-200 bg-red-500/10 font-bold text-red-700 dark:text-red-300' : 'text-muted-foreground'
                }`}
              >
                <div>{label}</div>
                <div className="text-xs">{opens ? province.drawTime : 'Nghỉ'}</div>
              </div>
            );
          })}
        </div>
        {sameDay.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {sameDay.map((item) => (
              <Link
                key={item.id}
                href={`/${item.region}/${item.id}`}
                className="rounded-lg bg-muted/70 px-2.5 py-1 text-xs font-bold hover:bg-muted"
              >
                {item.name}
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <div className="space-y-8">
        {history.map(({ date, result }) => (
          <div key={toRouteDate(date)} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black">{formatDate(date)}</h2>
              <Link href={`/ngay/${toRouteDate(date)}`} className="text-sm font-bold text-red-600 hover:underline">
                Xem cả ba miền
              </Link>
            </div>
            <RegionLotteryBoard
              id={`${province.id}-${toRouteDate(date)}`}
              title={`XS${province.code}`}
              regionCode={province.code}
              drawTime={province.drawTime}
              dateStr={formatDate(date)}
              results={[result]}
            />
          </div>
        ))}
      </div>
    </SiteFrame>
  );
}
