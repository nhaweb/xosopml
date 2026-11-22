import { NextRequest, NextResponse } from 'next/server';
import {
  fetchLotteryResultsByDate,
  fetchProvinceDrawHistory,
  fetchRegionDrawsHistory,
} from '@/lib/services/xosoApi';
import { Region } from '@/types/lottery';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceId = searchParams.get('province');
    const regionHistoryParam = searchParams.get('regionHistory') as Region | null;
    const dateParam = searchParams.get('date');
    const limitParam = Number(searchParams.get('limit')) || 6;

    // 1. Lịch sử nhiều ngày theo miền (dùng cho Sớ Đầu Đuôi 14 ngày)
    if (
      regionHistoryParam &&
      (regionHistoryParam === 'south' || regionHistoryParam === 'central' || regionHistoryParam === 'north')
    ) {
      const days = Number(searchParams.get('days')) || 14;
      const regionEnvelope = await fetchRegionDrawsHistory(regionHistoryParam, days);
      return NextResponse.json(regionEnvelope, {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${regionEnvelope.revalidateSeconds}, stale-while-revalidate=60`,
        },
      });
    }

    // 2. Nếu truyền `province`, trả về lịch sử các kỳ mở thưởng của đài đó
    if (provinceId) {
      const historyEnvelope = await fetchProvinceDrawHistory(provinceId, limitParam);
      return NextResponse.json(historyEnvelope, {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${historyEnvelope.revalidateSeconds}, stale-while-revalidate=60`,
        },
      });
    }

    // 3. Lấy kết quả 3 miền theo ngày (hiện tại hoặc quá khứ)
    let targetDate = new Date();
    if (dateParam) {
      const normalized =
        /^\d{8}$/.test(dateParam)
          ? `${dateParam.slice(0, 4)}-${dateParam.slice(4, 6)}-${dateParam.slice(6, 8)}`
          : dateParam;
      const parsed = new Date(`${normalized}T12:00:00`);
      if (!Number.isNaN(parsed.getTime())) {
        targetDate = parsed;
      }
    }

    const envelope = await fetchLotteryResultsByDate(targetDate);
    return NextResponse.json(envelope, {
      status: 200,
      headers: {
        'Cache-Control': `public, s-maxage=${envelope.revalidateSeconds}, stale-while-revalidate=60`,
      },
    });
  } catch (error: unknown) {
    console.error('[API /api/xoso/draws] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Không thể tải dữ liệu xổ số tại thời điểm này.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
