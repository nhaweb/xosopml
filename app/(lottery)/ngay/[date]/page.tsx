import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays } from 'lucide-react';
import { RegionLotteryBoard } from '@/components/lottery/region-lottery-board';
import { SiteFrame } from '@/components/site/site-frame';
import { getLotteryResults } from '@/lib/mock-lottery-data';
import { parseLotteryDate, toRouteDate } from '@/lib/lottery-date';

type PageProps = {
  params: Promise<{ date: string }>;
};

export default async function LotteryByDatePage({ params }: PageProps) {
  const { date: rawDate } = await params;
  const date = parseLotteryDate(rawDate);
  if (!date) notFound();

  const data = getLotteryResults(date);
  const routeDate = toRouteDate(date);
  const previous = new Date(date);
  previous.setDate(date.getDate() - 1);
  const next = new Date(date);
  next.setDate(date.getDate() + 1);

  const boards = [
    { id: 'xsmn', title: 'Xổ số Miền Nam', regionCode: 'XSMN', drawTime: '16:15', results: data.south },
    { id: 'xsmt', title: 'Xổ số Miền Trung', regionCode: 'XSMT', drawTime: '17:15', results: data.central },
    { id: 'xsmb', title: 'Xổ số Miền Bắc', regionCode: 'XSMB', drawTime: '18:15', results: data.north },
  ];

  return (
    <SiteFrame>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-red-600 uppercase dark:text-red-400">
            <CalendarDays className="size-4" />
            Tra cứu theo ngày
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-4xl">Kết quả {data.formattedDate}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Đường dẫn {routeDate}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/ngay/${toRouteDate(previous)}`} className="rounded-lg border bg-card px-3 py-2 text-sm font-bold hover:bg-muted">
            Ngày trước
          </Link>
          <Link href={`/ngay/${toRouteDate(next)}`} className="rounded-lg border bg-card px-3 py-2 text-sm font-bold hover:bg-muted">
            Ngày sau
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        {boards.map((board) =>
          board.results.length > 0 ? (
            <RegionLotteryBoard
              key={board.id}
              id={board.id}
              title={board.title}
              regionCode={board.regionCode}
              drawTime={board.drawTime}
              dateStr={data.formattedDate}
              results={board.results}
            />
          ) : (
            <p key={board.id} className="rounded-2xl border bg-card px-4 py-6 text-sm text-muted-foreground">
              {board.title} không có đài mở thưởng trong ngày này.
            </p>
          ),
        )}
      </div>
    </SiteFrame>
  );
}
