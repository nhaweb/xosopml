import { NextRequest, NextResponse } from 'next/server';
import {
  fetchAiSummaryStats,
  fetchFrequencyStats,
  fetchLoGanStats,
  fetchSpecialPrizeYearStats,
  fetchVietlottLatestStats,
} from '@/lib/services/xosoApi';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'lo-gan';
    const provinceId = searchParams.get('province') || 'ha-noi';
    const limit = Number(searchParams.get('limit')) || 5;
    const modeParam = searchParams.get('mode');
    const freqMode: 'all' | 'head-tail' | 'special' =
      modeParam === 'head-tail' || modeParam === 'special' ? modeParam : 'all';
    const year = Number(searchParams.get('year')) || new Date().getFullYear();

    if (type === 'frequency') {
      const envelope = await fetchFrequencyStats(provinceId, limit, freqMode);
      return NextResponse.json(envelope, {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${envelope.revalidateSeconds}, stale-while-revalidate=60`,
        },
      });
    }

    if (type === 'special-year') {
      const envelope = await fetchSpecialPrizeYearStats(year);
      return NextResponse.json(envelope, {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${envelope.revalidateSeconds}, stale-while-revalidate=60`,
        },
      });
    }

    if (type === 'summary') {
      const envelope = await fetchAiSummaryStats();
      return NextResponse.json(envelope, {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${envelope.revalidateSeconds}, stale-while-revalidate=60`,
        },
      });
    }

    if (type === 'vietlott') {
      const envelope = await fetchVietlottLatestStats();
      return NextResponse.json(envelope, {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${envelope.revalidateSeconds}, stale-while-revalidate=60`,
        },
      });
    }

    const envelope = await fetchLoGanStats(provinceId);
    return NextResponse.json(envelope, {
      status: 200,
      headers: {
        'Cache-Control': `public, s-maxage=${envelope.revalidateSeconds}, stale-while-revalidate=60`,
      },
    });
  } catch (error: unknown) {
    console.error('[API /api/xoso/stats] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Không thể tải dữ liệu thống kê tại thời điểm này.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
