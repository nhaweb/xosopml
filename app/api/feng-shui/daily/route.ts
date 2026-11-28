import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { getSessionUser, isSuperAdminUser } from '@/lib/auth';
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

async function extractLatestXsmbSpecialLast2(todayIso: string): Promise<string> {
  const [y, m, day] = todayIso.split('-').map(Number);
  // Lấy 2 số đuôi Giải Đặc Biệt XSMB kỳ gần nhất (hôm qua)
  const yesterday = new Date(y, m - 1, day - 1, 12, 0, 0);
  const env = await fetchLotteryResultsByDate(yesterday);
  const northDraw = env.data.north?.[0];
  const sp = northDraw?.prizes.find(
    (p) => p.prizeName.includes('Đặc Biệt') || p.prizeName.includes('G.ĐB')
  );
  const digits = (sp?.numbers[0] || '').replace(/\D/g, '');
  return digits.length >= 2 ? digits.slice(-2) : '02';
}

function buildLuckyPairs(autoPair: string, manualPair: string | null): string[] {
  if (manualPair && manualPair.length === 2 && manualPair !== autoPair) {
    return [autoPair, manualPair];
  }
  return [autoPair];
}

export async function GET() {
  try {
    const vn = getVietnamDateParts();
    const todayIso = vn.isoDate;
    const nextUpdateIso = getNextDateIso(todayIso);
    const minutesOfDay = vn.hour * 60 + vn.minute;
    const isDisplayWindow = minutesOfDay >= 1 && minutesOfDay <= 15 * 60;

    // Luôn tự động lấy 2 số đuôi Giải Đặc Biệt XSMB
    const autoLuckyPair = await extractLatestXsmbSpecialLast2(todayIso);

    const [existing] = await db
      .select()
      .from(schema.fengShuiDaily)
      .where(eq(schema.fengShuiDaily.targetDate, todayIso))
      .limit(1);

    // Nếu Admin có thêm số thủ công (isManualOverride = true), hiển thị song song (append)
    const manualLuckyPair = existing?.isManualOverride ? existing.luckyPair : null;
    const luckyPairs = buildLuckyPairs(autoLuckyPair, manualLuckyPair);

    if (!existing) {
      await db
        .insert(schema.fengShuiDaily)
        .values({
          targetDate: todayIso,
          luckyPair: autoLuckyPair,
          isManualOverride: false,
        })
        .onConflictDoNothing();
    }

    return NextResponse.json({
      targetDate: todayIso,
      autoLuckyPair,
      manualLuckyPair,
      luckyPairs,
      luckyPair: luckyPairs.join(', '),
      isManualAppended: Boolean(manualLuckyPair),
      isManualOverride: Boolean(manualLuckyPair),
      isDisplayWindow,
      nextUpdateDate: nextUpdateIso,
      canManualOverrideNow: isDisplayWindow,
    });
  } catch (err) {
    console.error('[GET /api/feng-shui/daily]', err);
    return NextResponse.json({
      targetDate: new Date().toISOString().slice(0, 10),
      autoLuckyPair: '02',
      manualLuckyPair: null,
      luckyPairs: ['02'],
      luckyPair: '02',
      isManualAppended: false,
      isManualOverride: false,
      isDisplayWindow: true,
      nextUpdateDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      canManualOverrideNow: true,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!isSuperAdminUser(sessionUser)) {
      return NextResponse.json(
        { error: 'Chỉ tài khoản Quản Trị Hệ Thống (SUPER_ADMIN) mới có quyền thêm số thủ công.' },
        { status: 403 }
      );
    }

    const vn = getVietnamDateParts();
    const minutesOfDay = vn.hour * 60 + vn.minute;
    // Khung giờ 00:01 đến 15:00 (1 -> 900 phút)
    if (minutesOfDay < 1 || minutesOfDay > 15 * 60) {
      return NextResponse.json(
        {
          error:
            'Chỉ được phép thêm bổ sung số thủ công trong khung giờ từ 00:01 đến 15:00 hàng ngày.',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const manualPair = String(body.luckyPair || '').replace(/\D/g, '').slice(-2);
    if (manualPair.length !== 2) {
      return NextResponse.json({ error: 'Vui lòng nhập đúng 2 chữ số (00-99).' }, { status: 400 });
    }

    const autoLuckyPair = await extractLatestXsmbSpecialLast2(vn.isoDate);

    const [existing] = await db
      .select()
      .from(schema.fengShuiDaily)
      .where(eq(schema.fengShuiDaily.targetDate, vn.isoDate))
      .limit(1);

    if (existing) {
      await db
        .update(schema.fengShuiDaily)
        .set({
          luckyPair: manualPair,
          isManualOverride: true,
          updatedAt: new Date(),
        })
        .where(eq(schema.fengShuiDaily.id, existing.id));
    } else {
      await db.insert(schema.fengShuiDaily).values({
        targetDate: vn.isoDate,
        luckyPair: manualPair,
        isManualOverride: true,
      });
    }

    const luckyPairs = buildLuckyPairs(autoLuckyPair, manualPair);

    return NextResponse.json({
      success: true,
      data: {
        targetDate: vn.isoDate,
        autoLuckyPair,
        manualLuckyPair: manualPair,
        luckyPairs,
        luckyPair: luckyPairs.join(', '),
      },
    });
  } catch (err) {
    console.error('[POST /api/feng-shui/daily]', err);
    return NextResponse.json({ error: 'Không thể thêm bổ sung số phong thủy.' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const sessionUser = await getSessionUser();
    if (!isSuperAdminUser(sessionUser)) {
      return NextResponse.json(
        { error: 'Chỉ tài khoản Quản Trị Hệ Thống (SUPER_ADMIN) mới có quyền xóa số bổ sung.' },
        { status: 403 }
      );
    }

    const vn = getVietnamDateParts();
    const autoLuckyPair = await extractLatestXsmbSpecialLast2(vn.isoDate);

    const [existing] = await db
      .select()
      .from(schema.fengShuiDaily)
      .where(eq(schema.fengShuiDaily.targetDate, vn.isoDate))
      .limit(1);

    if (existing) {
      await db
        .update(schema.fengShuiDaily)
        .set({
          luckyPair: autoLuckyPair,
          isManualOverride: false,
          updatedAt: new Date(),
        })
        .where(eq(schema.fengShuiDaily.id, existing.id));
    }

    return NextResponse.json({
      success: true,
      data: {
        targetDate: vn.isoDate,
        autoLuckyPair,
        manualLuckyPair: null,
        luckyPairs: [autoLuckyPair],
        luckyPair: autoLuckyPair,
      },
    });
  } catch (err) {
    console.error('[DELETE /api/feng-shui/daily]', err);
    return NextResponse.json({ error: 'Không thể xóa số bổ sung.' }, { status: 500 });
  }
}
