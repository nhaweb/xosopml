import { NextRequest, NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { getSessionPayload, getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
};

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200, headers: NO_STORE_HEADERS });
    }
    return NextResponse.json(
      {
        user: {
          id: user.id,
          memberCode: user.memberCode,
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          phoneNumber: user.phoneNumber,
          isPhoneVerified: user.isPhoneVerified,
          isEmailVerified: user.isEmailVerified,
          vipTier: user.vipTier,
          vipExpiresAt: user.vipExpiresAt,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error('[GET /api/auth/me]', err);
    return NextResponse.json({ user: null }, { status: 200, headers: NO_STORE_HEADERS });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Xác thực trực tiếp từ signed session cookie (0ms, không tốn 1 vòng SELECT thừa lên Neon DB)
    const session = await getSessionPayload();
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập để cập nhật thông tin.' }, { status: 401 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.fullName === 'string' && body.fullName.trim().length > 0) {
      updates.fullName = body.fullName.trim();
    }
    if (typeof body.avatarUrl === 'string') {
      const trimmedAvatar = body.avatarUrl.trim();
      if (trimmedAvatar.length > 350_000) {
        return NextResponse.json(
          { error: 'Ảnh đại diện quá lớn. Vui lòng chọn ảnh dung lượng nhỏ hơn.' },
          { status: 413 }
        );
      }
      updates.avatarUrl = trimmedAvatar || null;
    }
    if (typeof body.phoneNumber === 'string') {
      const cleanPhone = body.phoneNumber.trim() || null;
      updates.phoneNumber = cleanPhone;
      // Chỉ reset is_phone_verified khi số điện thoại thực sự thay đổi (xử lý ngay trong 1 câu UPDATE)
      updates.isPhoneVerified = sql`CASE WHEN ${schema.users.phoneNumber} IS DISTINCT FROM ${cleanPhone} THEN false ELSE ${schema.users.isPhoneVerified} END`;
    }

    if (Object.keys(updates).length === 0) {
      const current = await getSessionUser();
      if (!current) {
        return NextResponse.json({ error: 'Không tìm thấy tài khoản.' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        user: {
          id: current.id,
          memberCode: current.memberCode,
          email: current.email,
          fullName: current.fullName,
          avatarUrl: current.avatarUrl,
          phoneNumber: current.phoneNumber,
          isPhoneVerified: current.isPhoneVerified,
          isEmailVerified: current.isEmailVerified,
          vipTier: current.vipTier,
          vipExpiresAt: current.vipExpiresAt,
          role: current.role,
        },
      });
    }

    const [updated] = await db
      .update(schema.users)
      .set(updates as Partial<typeof schema.users.$inferInsert>)
      .where(eq(schema.users.id, session.userId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        memberCode: updated.memberCode,
        email: updated.email,
        fullName: updated.fullName,
        avatarUrl: updated.avatarUrl,
        phoneNumber: updated.phoneNumber,
        isPhoneVerified: updated.isPhoneVerified,
        isEmailVerified: updated.isEmailVerified,
        vipTier: updated.vipTier,
        vipExpiresAt: updated.vipExpiresAt,
        role: updated.role,
      },
    });
  } catch (err) {
    console.error('[PATCH /api/auth/me]', err);
    return NextResponse.json({ error: 'Không thể cập nhật hồ sơ.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập để xác thực số điện thoại.' }, { status: 401 });
    }

    const body = await request.json();
    const action = String(body.action || '');
    const phoneNumber = String(body.phoneNumber || user.phoneNumber || '').trim();

    if (action === 'send_otp') {
      if (!/^0\d{8,10}$/.test(phoneNumber)) {
        return NextResponse.json({ error: 'Số điện thoại không hợp lệ (VD: 0901234567).' }, { status: 400 });
      }
      await db
        .update(schema.users)
        .set({ phoneNumber })
        .where(eq(schema.users.id, user.id));

      return NextResponse.json({
        success: true,
        message: `Mã OTP xác thực đã được gửi tới ${phoneNumber} (Mã demo: 123456).`,
      });
    }

    if (action === 'verify_otp') {
      const otp = String(body.otp || '').trim();
      if (otp.length !== 6) {
        return NextResponse.json({ error: 'Mã OTP phải gồm 6 chữ số.' }, { status: 400 });
      }
      const [updated] = await db
        .update(schema.users)
        .set({
          phoneNumber: phoneNumber || user.phoneNumber,
          isPhoneVerified: true,
        })
        .where(eq(schema.users.id, user.id))
        .returning();

      return NextResponse.json({
        success: true,
        message: 'Xác thực số điện thoại thành công!',
        user: {
          id: updated.id,
          memberCode: updated.memberCode,
          email: updated.email,
          fullName: updated.fullName,
          avatarUrl: updated.avatarUrl,
          phoneNumber: updated.phoneNumber,
          isPhoneVerified: updated.isPhoneVerified,
          isEmailVerified: updated.isEmailVerified,
          vipTier: updated.vipTier,
          vipExpiresAt: updated.vipExpiresAt,
          role: updated.role,
        },
      });
    }

    return NextResponse.json({ error: 'Hành động không hợp lệ.' }, { status: 400 });
  } catch (err) {
    console.error('[POST /api/auth/me]', err);
    return NextResponse.json({ error: 'Không thể xác thực số điện thoại.' }, { status: 500 });
  }
}
