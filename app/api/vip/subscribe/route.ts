import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

const VIP_PLANS: Record<
  number,
  { planMonths: number; paidMonths: number; discountPercent: number; amountPaid: number }
> = {
  1: { planMonths: 1, paidMonths: 1, discountPercent: 0, amountPaid: 299000 },
  3: { planMonths: 3, paidMonths: 3, discountPercent: 10, amountPaid: 807300 },
  6: { planMonths: 6, paidMonths: 5, discountPercent: 0, amountPaid: 1495000 },
  12: { planMonths: 12, paidMonths: 9, discountPercent: 0, amountPaid: 2691000 },
};

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập để nâng cấp VIP.' }, { status: 401 });
    }

    const body = await request.json();
    const months = Number(body.planMonths) || 1;
    const plan = VIP_PLANS[months];
    if (!plan) {
      return NextResponse.json({ error: 'Gói VIP không hợp lệ.' }, { status: 400 });
    }

    const [sub] = await db
      .insert(schema.vipSubscriptions)
      .values({
        userId: user.id,
        planMonths: plan.planMonths,
        paidMonths: plan.paidMonths,
        discountPercent: plan.discountPercent,
        amountPaid: plan.amountPaid,
        status: 'ACTIVE',
      })
      .returning();

    const baseDate =
      user.vipExpiresAt && user.vipExpiresAt.getTime() > Date.now()
        ? new Date(user.vipExpiresAt)
        : new Date();
    baseDate.setMonth(baseDate.getMonth() + plan.planMonths);

    const [updatedUser] = await db
      .update(schema.users)
      .set({
        vipTier: 'VIP',
        vipExpiresAt: baseDate,
      })
      .where(eq(schema.users.id, user.id))
      .returning();

    return NextResponse.json({
      success: true,
      subscription: sub,
      vipTier: updatedUser.vipTier,
      vipExpiresAt: updatedUser.vipExpiresAt,
    });
  } catch (err) {
    console.error('[POST /api/vip/subscribe]', err);
    return NextResponse.json({ error: 'Không thể kích hoạt gói VIP.' }, { status: 500 });
  }
}
