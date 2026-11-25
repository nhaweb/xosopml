import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { generateNextMemberCode, SESSION_COOKIE_NAME, signSessionToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${request.nextUrl.origin}/api/auth/google/callback`;

  if (!clientId) {
    // Fallback interactive demo Google OAuth when GOOGLE_CLIENT_ID is not yet configured in .env.local
    const demoEmail = request.nextUrl.searchParams.get('demo_email');
    if (demoEmail) {
      const cleanEmail = demoEmail.trim().toLowerCase();
      let [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, cleanEmail))
        .limit(1);

      if (!user) {
        const memberCode = await generateNextMemberCode();
        const [created] = await db
          .insert(schema.users)
          .values({
            memberCode,
            email: cleanEmail,
            passwordHash: null,
            fullName: cleanEmail.split('@')[0],
            isEmailVerified: true,
            vipTier: 'FREE',
            role: 'USER',
          })
          .returning();
        user = created;
      }

      const token = signSessionToken({ userId: user.id, email: user.email, role: user.role });
      const res = NextResponse.redirect(new URL('/dashboard', request.url));
      res.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
      return res;
    }

    return NextResponse.redirect(
      new URL('/login?error=google_not_configured', request.url)
    );
  }

  const googleUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleUrl.searchParams.set('client_id', clientId);
  googleUrl.searchParams.set('redirect_uri', redirectUri);
  googleUrl.searchParams.set('response_type', 'code');
  googleUrl.searchParams.set('scope', 'openid email profile');
  googleUrl.searchParams.set('prompt', 'select_account');

  return NextResponse.redirect(googleUrl.toString());
}
