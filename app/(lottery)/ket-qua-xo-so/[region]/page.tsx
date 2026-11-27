import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, Home, ChevronRight } from 'lucide-react';
import { SiteFrame } from '@/components/site/site-frame';
import { RegionLotteryBoard } from '@/components/lottery/region-lottery-board';
import { VietlottKenoWidget } from '@/components/lottery/vietlott-keno-widget';
import { ApiDataSourceBanner } from '@/components/lottery/lottery-board-skeleton';
import { fetchLotteryResultsByDate } from '@/lib/services/xosoApi';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ region: string }>;
};

const REGION_META: Record<
  string,
  {
    key: 'south' | 'central' | 'north' | 'vietlott';
    name: string;
    shortCode: string;
    regionCode: string;
    drawTime: string;
    boardId: string;
  }
> = {
  'mien-nam': {
    key: 'south',
    name: 'Miền Nam',
    shortCode: 'XSMN',
    regionCode: '18 Giải',
    drawTime: '16:15',
    boardId: 'xsmn',
  },
  'mien-trung': {
    key: 'central',
    name: 'Miền Trung',
    shortCode: 'XSMT',
    regionCode: '18 Giải',
    drawTime: '17:15',
    boardId: 'xsmt',
  },
  'mien-bac': {
    key: 'north',
    name: 'Miền Bắc',
    shortCode: 'XSMB',
    regionCode: '27 Giải',
    drawTime: '18:15',
    boardId: 'xsmb',
  },
  vietlott: {
    key: 'vietlott',
    name: 'Vietlott & Keno',
    shortCode: 'Vietlott',
    regionCode: 'Điện Toán',
    drawTime: '18:00',
    boardId: 'vietlott',
  },
};

export default async function KetQuaXoSoByRegionPage({ params }: PageProps) {
  const { region: rawRegion } = await params;
  const slug = rawRegion.replace(/\.html$/i, '').toLowerCase();
  const meta = REGION_META[slug];

  if (!meta) {
    notFound();
  }

  const vnNow = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const todayVn = new Date(
    vnNow.getUTCFullYear(),
    vnNow.getUTCMonth(),
    vnNow.getUTCDate(),
    12,
    0,
    0
  );

  if (meta.key === 'vietlott') {
    return (
      <SiteFrame>
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="flex items-center gap-1 hover:text-foreground">
            <Home className="size-3.5" /> Trang chủ
          </Link>
          <ChevronRight className="size-3" />
          <span className="font-bold text-red-600 dark:text-red-400">Kết Quả Xổ Số Vietlott</span>
        </nav>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-red-600 dark:text-red-400">
              <CalendarDays className="size-4" />
              Mega 6/45 · Power 6/55 · Keno trực tiếp
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              KẾT QUẢ XỔ SỐ ĐIỆN TOÁN VIETLOTT
            </h1>
          </div>
          <Link
            href="/"
            className="rounded-xl border bg-card px-3.5 py-2 text-xs font-bold hover:bg-muted w-fit"
          >
            ← Quay lại Trang Chủ
          </Link>
        </div>

        <VietlottKenoWidget />
      </SiteFrame>
    );
  }

  const yesterdayVn = new Date(todayVn);
  yesterdayVn.setDate(todayVn.getDate() - 1);

  const [todayEnv, prevEnv] = await Promise.all([
    fetchLotteryResultsByDate(todayVn),
    fetchLotteryResultsByDate(yesterdayVn),
  ]);

  const todayResults = todayEnv.data[meta.key];
  const prevResults = prevEnv.data[meta.key];
  const sameDateFallback = todayEnv.data.formattedDate === prevEnv.data.formattedDate;

  return (
    <SiteFrame>
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="flex items-center gap-1 hover:text-foreground">
          <Home className="size-3.5" /> Trang chủ
        </Link>
        <ChevronRight className="size-3" />
        <span className="font-bold text-red-600 dark:text-red-400">
          Xổ Số {meta.name} ({meta.shortCode})
        </span>
      </nav>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-red-600 dark:text-red-400">
            <CalendarDays className="size-4" />
            Trực tiếp {meta.drawTime} hàng ngày
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            KẾT QUẢ XỔ SỐ {meta.name.toUpperCase()} — {todayEnv.data.formattedDate}
          </h1>
        </div>
        <Link
          href="/"
          className="rounded-xl border bg-card px-3.5 py-2 text-xs font-bold hover:bg-muted w-fit"
        >
          ← Quay lại Trang Chủ
        </Link>
      </div>

      <ApiDataSourceBanner
        source={todayEnv.source}
        warning={todayEnv.warning}
        isLiveWindow={todayEnv.isLiveWindow}
        revalidateSeconds={todayEnv.revalidateSeconds}
      />

      <div className="space-y-8">
        <RegionLotteryBoard
          id={meta.boardId}
          title={`KẾT QUẢ XỔ SỐ ${meta.name.toUpperCase()} - ${todayEnv.data.formattedDate}`}
          regionCode={meta.regionCode}
          drawTime={meta.drawTime}
          dateStr={todayEnv.data.formattedDate}
          results={todayResults}
        />

        {!sameDateFallback && prevResults.length > 0 && (
          <RegionLotteryBoard
            id={`${meta.boardId}-yesterday`}
            title={`${meta.shortCode} Hôm Qua — ${prevEnv.data.formattedDate}`}
            regionCode={meta.regionCode}
            drawTime={meta.drawTime}
            dateStr={prevEnv.data.formattedDate}
            results={prevResults}
          />
        )}
      </div>
    </SiteFrame>
  );
}
