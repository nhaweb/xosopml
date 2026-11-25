import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(new URL('/login?error=missing_token', request.url));
  }

  const [user] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.emailVerifyToken, token))
    .limit(1);

  if (!user) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
  }

  await db
    .update(schema.users)
    .set({
      isEmailVerified: true,
      emailVerifyToken: null,
    })
    .where(eq(schema.users.id, user.id));

  return NextResponse.redirect(new URL('/login?verified=1', request.url));
}
