import { NextRequest, NextResponse } from 'next/server';
import { asc, desc, eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { getSessionUser, isSuperAdminUser } from '@/lib/auth';
import { getEarliestValidSouthDrawDate } from '@/lib/draw-schedule-status';

export async function GET(request: NextRequest) {
  try {
    const dayFilter = request.nextUrl.searchParams.get('day'); // 'today' | 'tomorrow' | null
    const tickets = await db
      .select()
      .from(schema.lotteryTickets)
      .orderBy(asc(schema.lotteryTickets.drawDate), desc(schema.lotteryTickets.createdAt));

    const todayIso = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
    const [y, m, d] = todayIso.split('-').map(Number);
    const tomorrowObj = new Date(y, m - 1, d + 1, 12, 0, 0);
    const tomorrowIso = `${tomorrowObj.getFullYear()}-${String(tomorrowObj.getMonth() + 1).padStart(2, '0')}-${String(tomorrowObj.getDate()).padStart(2, '0')}`;

    const filtered = tickets.filter((t) => {
      if (dayFilter === 'today') return t.drawDate === todayIso;
      if (dayFilter === 'tomorrow') return t.drawDate === tomorrowIso;
      return true;
    });

    return NextResponse.json({
      tickets: filtered,
      todayIso,
      tomorrowIso,
    });
  } catch (err) {
    console.error('[GET /api/tickets]', err);
    return NextResponse.json({ tickets: [] }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!isSuperAdminUser(sessionUser)) {
      return NextResponse.json(
        { error: 'Chỉ tài khoản Quản Trị Hệ Thống (SUPER_ADMIN) mới có quyền đăng vé.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const province = String(body.province || '').trim();
    const drawDate = String(body.drawDate || '').trim();
    const ticketNumber = String(body.ticketNumber || '').replace(/\D/g, '').slice(0, 6);
    const imageUrl = String(body.imageUrl || '/images/ticket-sample-1.jpg').trim();
    // Chỉ hỗ trợ đúng 2 định mức bán online: 16 vé hoặc Cặp nguyên (160 vé)
    const rawQty = Number(body.availableQty);
    const availableQty = rawQty === 160 ? 160 : 16;
    const pricePerTicket = Math.max(10000, Number(body.pricePerTicket) || 10000);
    const showBadge = Boolean(body.showBadge);
    const badgeText = showBadge ? String(body.badgeText || 'Nổi bật').trim() : null;

    if (!province || !drawDate || ticketNumber.length !== 6) {
      return NextResponse.json(
        { error: 'Vui lòng nhập đầy đủ Tên đài, Ngày xổ và 6 chữ số vé.' },
        { status: 400 }
      );
    }

    const { minDrawDate } = getEarliestValidSouthDrawDate();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(drawDate) || drawDate < minDrawDate) {
      return NextResponse.json(
        {
          error: `Ngày mở thưởng không hợp lệ hoặc đã qua giờ xổ (16:15 giờ VN). Vui lòng chọn từ ngày ${minDrawDate.split('-').reverse().join('/')} trở đi.`,
        },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(schema.lotteryTickets)
      .values({
        province,
        drawDate,
        ticketNumber,
        imageUrl,
        availableQty,
        pricePerTicket,
        showBadge,
        badgeText,
        status: 'AVAILABLE',
      })
      .returning();

    return NextResponse.json({ success: true, ticket: created }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/tickets]', err);
    return NextResponse.json({ error: 'Không thể đăng vé mới.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!isSuperAdminUser(sessionUser)) {
      return NextResponse.json(
        { error: 'Chỉ tài khoản Quản Trị Hệ Thống (SUPER_ADMIN) mới có quyền cập nhật vé.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const id = String(body.id || '');
    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID vé.' }, { status: 400 });
    }

    const updates: Partial<typeof schema.lotteryTickets.$inferInsert> = {};
    if (typeof body.showBadge === 'boolean') updates.showBadge = body.showBadge;
    if (typeof body.badgeText === 'string') updates.badgeText = body.badgeText;
    if (typeof body.status === 'string') updates.status = body.status;

    const [updated] = await db
      .update(schema.lotteryTickets)
      .set(updates)
      .where(eq(schema.lotteryTickets.id, id))
      .returning();

    return NextResponse.json({ success: true, ticket: updated });
  } catch (err) {
    console.error('[PATCH /api/tickets]', err);
    return NextResponse.json({ error: 'Không thể cập nhật vé.' }, { status: 500 });
  }
}
