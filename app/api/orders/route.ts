import { NextRequest, NextResponse } from 'next/server';
import { desc, eq, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const isAdminQuery = request.nextUrl.searchParams.get('admin') === '1';
    const user = await getSessionUser();

    if (isAdminQuery) {
      const orders = await db
        .select()
        .from(schema.ticketOrders)
        .orderBy(desc(schema.ticketOrders.createdAt))
        .limit(50);
      return NextResponse.json({ orders });
    }

    if (!user) {
      return NextResponse.json({ orders: [] });
    }

    const orders = await db
      .select()
      .from(schema.ticketOrders)
      .where(eq(schema.ticketOrders.userId, user.id))
      .orderBy(desc(schema.ticketOrders.createdAt));

    return NextResponse.json({ orders });
  } catch (err) {
    console.error('[GET /api/orders]', err);
    return NextResponse.json({ orders: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    const body = await request.json();

    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return NextResponse.json({ error: 'Giỏ hàng trống.' }, { status: 400 });
    }

    const deliveryMethod =
      body.deliveryMethod === 'EXPRESS_9KM' ? 'EXPRESS_9KM' : 'SAFE_KEEPING';
    const distanceKm = deliveryMethod === 'EXPRESS_9KM' ? Number(body.distanceKm) || 0 : 0;

    if (deliveryMethod === 'EXPRESS_9KM' && distanceKm > 9) {
      return NextResponse.json(
        { error: 'Giao hỏa tốc chỉ hỗ trợ trong bán kính tối đa 9km.' },
        { status: 400 }
      );
    }

    // Miễn phí giao hàng dưới 2km, 2-9km tính phí linh hoạt
    const shippingFee =
      deliveryMethod === 'SAFE_KEEPING'
        ? 0
        : distanceKm < 2
        ? 0
        : Math.round(15000 + Math.max(0, distanceKm - 2) * 3000);

    const paymentMethod =
      body.paymentMethod === 'MOMO'
        ? 'MOMO'
        : body.paymentMethod === 'COD' && deliveryMethod === 'EXPRESS_9KM'
        ? 'COD'
        : 'BANK_TRANSFER';

    const createdOrders = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const qty = Math.max(1, Number(item.quantity) || 1);
      const price = Math.max(10000, Number(item.price) || 10000);
      const itemShipping = i === 0 ? shippingFee : 0;
      const orderCode = `ML-${Date.now().toString().slice(-5)}${i}`;

      const [created] = await db
        .insert(schema.ticketOrders)
        .values({
          orderCode,
          userId: user?.id || null,
          ticketId: item.ticketId || null,
          ticketNumber: String(item.ticketNumber || '000000'),
          province: String(item.province || 'Miền Nam'),
          drawDate: String(item.drawDate || new Date().toISOString().slice(0, 10)),
          quantity: qty,
          totalAmount: qty * price + itemShipping,
          shippingFee: itemShipping,
          deliveryMethod,
          deliveryAddress: body.deliveryAddress ? String(body.deliveryAddress) : null,
          customerName: body.customerName ? String(body.customerName) : user?.fullName || null,
          customerPhone: body.customerPhone ? String(body.customerPhone) : user?.phoneNumber || null,
          distanceKm: deliveryMethod === 'EXPRESS_9KM' ? distanceKm : null,
          paymentMethod,
          paymentStatus: 'PENDING',
          prizeStatus: 'WAITING',
        })
        .returning();

      createdOrders.push(created);

      if (item.ticketId) {
        await db
          .update(schema.lotteryTickets)
          .set({
            availableQty: sql`GREATEST(0, ${schema.lotteryTickets.availableQty} - ${qty})`,
          })
          .where(eq(schema.lotteryTickets.id, item.ticketId));
      }
    }

    return NextResponse.json(
      {
        success: true,
        orderCode: createdOrders[0]?.orderCode,
        orders: createdOrders,
        shippingFee,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/orders]', err);
    return NextResponse.json({ error: 'Không thể tạo đơn hàng.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const id = String(body.id || '');
    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID đơn hàng.' }, { status: 400 });
    }

    const updates: Partial<typeof schema.ticketOrders.$inferInsert> = {};
    if (typeof body.safeKeepingPhotoUrl === 'string') {
      updates.safeKeepingPhotoUrl = body.safeKeepingPhotoUrl.trim() || null;
    }
    if (typeof body.prizeStatus === 'string') {
      updates.prizeStatus = body.prizeStatus;
    }
    if (typeof body.wonPrizeDetail === 'string') {
      updates.wonPrizeDetail = body.wonPrizeDetail.trim() || null;
    }
    if (typeof body.paymentStatus === 'string') {
      updates.paymentStatus = body.paymentStatus;
    }

    const [updated] = await db
      .update(schema.ticketOrders)
      .set(updates)
      .where(eq(schema.ticketOrders.id, id))
      .returning();

    return NextResponse.json({ success: true, order: updated });
  } catch (err) {
    console.error('[PATCH /api/orders]', err);
    return NextResponse.json({ error: 'Không thể cập nhật đơn hàng.' }, { status: 500 });
  }
}
