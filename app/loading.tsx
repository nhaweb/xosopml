import { LotteryBoardSkeleton } from '@/components/lottery/lottery-board-skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1260px] px-4 py-8 lg:px-6">
      <LotteryBoardSkeleton count={2} />
    </div>
  );
}

