import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { generateNextMemberCode, SESSION_COOKIE_NAME, signSessionToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${request.nextUrl.origin}/api/auth/google/callback`;

  if (!code || !clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/login?error=google_oauth_failed', request.url));
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(new URL('/login?error=google_token_error', request.url));
    }

    const tokenData = await tokenRes.json();
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoRes.ok) {
      return NextResponse.redirect(new URL('/login?error=google_userinfo_error', request.url));
    }

    const profile = (await userInfoRes.json()) as {
      email?: string;
      name?: string;
      picture?: string;
    };

    const email = (profile.email || '').trim().toLowerCase();
    if (!email) {
      return NextResponse.redirect(new URL('/login?error=google_no_email', request.url));
    }

    let [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (!user) {
      const memberCode = await generateNextMemberCode();
      const [created] = await db
        .insert(schema.users)
        .values({
          memberCode,
          email,
          passwordHash: null,
          fullName: profile.name || email.split('@')[0],
          avatarUrl: profile.picture || null,
          isEmailVerified: true,
          vipTier: 'FREE',
          role: 'USER',
        })
        .returning();
      user = created;
    } else if (!user.isEmailVerified) {
      const [updated] = await db
        .update(schema.users)
        .set({ isEmailVerified: true, avatarUrl: user.avatarUrl || profile.picture || null })
        .where(eq(schema.users.id, user.id))
        .returning();
      user = updated;
    }

    const sessionToken = signSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const res = NextResponse.redirect(new URL('/dashboard', request.url));
    res.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (err) {
    console.error('[GET /api/auth/google/callback]', err);
    return NextResponse.redirect(new URL('/login?error=google_oauth_exception', request.url));
  }
}
