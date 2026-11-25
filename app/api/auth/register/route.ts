import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { generateNextMemberCode, hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const fullName = String(body.fullName || '').trim();
    const phoneNumber = String(body.phoneNumber || '').trim() || null;
    const acceptedTerms = Boolean(body.acceptedTerms);

    if (!acceptedTerms) {
      return NextResponse.json(
        { error: 'Bạn phải đồng ý với Điều khoản sử dụng và Chính sách xử lý dữ liệu cá nhân.' },
        { status: 400 }
      );
    }

    if (!email || !email.includes('@') || !fullName || password.length < 6) {
      return NextResponse.json(
        { error: 'Vui lòng nhập đầy đủ họ tên, email hợp lệ và mật khẩu tối thiểu 6 ký tự.' },
        { status: 400 }
      );
    }

    const existing = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Email này đã được đăng ký tài khoản.' },
        { status: 409 }
      );
    }

    const memberCode = await generateNextMemberCode();
    const emailVerifyToken = crypto.randomBytes(24).toString('hex');
    const passwordHash = hashPassword(password);

    const [created] = await db
      .insert(schema.users)
      .values({
        memberCode,
        email,
        passwordHash,
        fullName,
        phoneNumber,
        isEmailVerified: false,
        emailVerifyToken,
        vipTier: 'FREE',
        role: 'USER',
      })
      .returning({
        id: schema.users.id,
        memberCode: schema.users.memberCode,
        email: schema.users.email,
        fullName: schema.users.fullName,
      });

    const origin = request.nextUrl.origin;
    const verifyUrl = `${origin}/api/auth/verify-email?token=${emailVerifyToken}`;

    return NextResponse.json(
      {
        success: true,
        message:
          'Đăng ký thành công! Vui lòng vào Gmail kiểm tra email và bấm link Xác thực tài khoản trước khi kích hoạt đăng nhập.',
        user: created,
        verifyUrl,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/auth/register]', err);
    return NextResponse.json({ error: 'Không thể tạo tài khoản lúc này.' }, { status: 500 });
  }
}
