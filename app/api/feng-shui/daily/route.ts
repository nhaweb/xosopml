import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { fetchLotteryResultsByDate } from '@/lib/services/xosoApi';

function getVietnamDateParts(d = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '00';
  return {
    isoDate: `${get('year')}-${get('month')}-${get('day')}`,
    hour: parseInt(get('hour'), 10) % 24,
    minute: parseInt(get('minute'), 10),
  };
}

function getNextDateIso(isoDate: string): string {
  const [y, m, day] = isoDate.split('-').map(Number);
  const next = new Date(y, m - 1, day + 1, 12, 0, 0);
  const ny = next.getFullYear();
  const nm = String(next.getMonth() + 1).padStart(2, '0');
  const nd = String(next.getDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}

async function extractYesterdayXsmbSpecialLast2(todayIso: string): Promise<string> {
  const [y, m, day] = todayIso.split('-').map(Number);
  const yesterday = new Date(y, m - 1, day - 1, 12, 0, 0);
  const env = await fetchLotteryResultsByDate(yesterday);
  const northDraw = env.data.north?.[0];
  const sp = northDraw?.prizes.find(
    (p) => p.prizeName.includes('Đặc Biệt') || p.prizeName.includes('G.ĐB')
  );
  const digits = (sp?.numbers[0] || '').replace(/\D/g, '');
  return digits.length >= 2 ? digits.slice(-2) : '16';
}

export async function GET() {
  try {
    const vn = getVietnamDateParts();
    const todayIso = vn.isoDate;
    const nextUpdateIso = getNextDateIso(todayIso);

    const [existing] = await db
      .select()
      .from(schema.fengShuiDaily)
      .where(eq(schema.fengShuiDaily.targetDate, todayIso))
      .limit(1);

    if (existing) {
      return NextResponse.json({
        targetDate: existing.targetDate,
        luckyPair: existing.luckyPair,
        isManualOverride: existing.isManualOverride,
        nextUpdateDate: nextUpdateIso,
        canManualOverrideNow: vn.hour >= 0 && vn.hour < 15,
      });
    }

    const luckyPair = await extractYesterdayXsmbSpecialLast2(todayIso);
    const [inserted] = await db
      .insert(schema.fengShuiDaily)
      .values({
        targetDate: todayIso,
        luckyPair,
        isManualOverride: false,
      })
      .onConflictDoNothing()
      .returning();

    return NextResponse.json({
      targetDate: inserted?.targetDate || todayIso,
      luckyPair: inserted?.luckyPair || luckyPair,
      isManualOverride: false,
      nextUpdateDate: nextUpdateIso,
      canManualOverrideNow: vn.hour >= 0 && vn.hour < 15,
    });
  } catch (err) {
    console.error('[GET /api/feng-shui/daily]', err);
    return NextResponse.json({
      targetDate: new Date().toISOString().slice(0, 10),
      luckyPair: '16',
      isManualOverride: false,
      nextUpdateDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      canManualOverrideNow: true,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const vn = getVietnamDateParts();
    const minutesOfDay = vn.hour * 60 + vn.minute;
    // Khung giờ 00:01 đến 15:00 (1 -> 900 phút)
    if (minutesOfDay < 1 || minutesOfDay > 15 * 60) {
      return NextResponse.json(
        {
          error:
            'Chỉ được phép cài đặt/ghi đè thủ công trong khung giờ từ 00:01 đến 15:00 (3h chiều) hàng ngày.',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const luckyPair = String(body.luckyPair || '').replace(/\D/g, '').slice(-2);
    if (luckyPair.length !== 2) {
      return NextResponse.json({ error: 'Vui lòng nhập đúng 2 chữ số (00-99).' }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(schema.fengShuiDaily)
      .where(eq(schema.fengShuiDaily.targetDate, vn.isoDate))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(schema.fengShuiDaily)
        .set({
          luckyPair,
          isManualOverride: true,
          updatedAt: new Date(),
        })
        .where(eq(schema.fengShuiDaily.id, existing.id))
        .returning();
      return NextResponse.json({ success: true, data: updated });
    }

    const [created] = await db
      .insert(schema.fengShuiDaily)
      .values({
        targetDate: vn.isoDate,
        luckyPair,
        isManualOverride: true,
      })
      .returning();

    return NextResponse.json({ success: true, data: created });
  } catch (err) {
    console.error('[POST /api/feng-shui/daily]', err);
    return NextResponse.json({ error: 'Không thể cập nhật số phong thủy.' }, { status: 500 });
  }
}
