import Link from 'next/link';
import { CalendarDays, Home, ChevronRight } from 'lucide-react';
import { SiteFrame } from '@/components/site/site-frame';
import { RegionLotteryBoard } from '@/components/lottery/region-lottery-board';
import { ApiDataSourceBanner } from '@/components/lottery/lottery-board-skeleton';
import { fetchLotteryResultsByDate } from '@/lib/services/xosoApi';

export const dynamic = 'force-dynamic';

export default async function XoSoMienBacPage() {
  const vnNow = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const todayVn = new Date(
    vnNow.getUTCFullYear(),
    vnNow.getUTCMonth(),
    vnNow.getUTCDate(),
    12,
    0,
    0
  );
  const yesterdayVn = new Date(todayVn);
  yesterdayVn.setDate(todayVn.getDate() - 1);

  const [todayEnv, prevEnv] = await Promise.all([
    fetchLotteryResultsByDate(todayVn),
    fetchLotteryResultsByDate(yesterdayVn),
  ]);

  return (
    <SiteFrame>
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="flex items-center gap-1 hover:text-foreground">
          <Home className="size-3.5" /> Trang chủ
        </Link>
        <ChevronRight className="size-3" />
        <span className="font-bold text-red-600 dark:text-red-400">Xổ Số Miền Bắc (XSMB)</span>
      </nav>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-red-600 dark:text-red-400">
            <CalendarDays className="size-4" />
            Trực tiếp 18:15 hàng ngày
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            KẾT QUẢ XỔ SỐ MIỀN BẮC — {todayEnv.data.formattedDate}
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
          id="xsmb"
          title={`KẾT QUẢ XỔ SỐ MIỀN BẮC - ${todayEnv.data.formattedDate}`}
          regionCode="27 Giải"
          drawTime="18:15"
          dateStr={todayEnv.data.formattedDate}
          results={todayEnv.data.north}
        />

        <RegionLotteryBoard
          id="xsmb-yesterday"
          title={`XSMB Hôm Qua — ${prevEnv.data.formattedDate}`}
          regionCode="27 Giải"
          drawTime="18:15"
          dateStr={prevEnv.data.formattedDate}
          results={prevEnv.data.north}
        />
      </div>
    </SiteFrame>
  );
}
