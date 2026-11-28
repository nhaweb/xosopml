import crypto from 'crypto';
import { cookies } from 'next/headers';
import { eq, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';

export const SESSION_COOKIE_NAME = 'minhluan_session';

function getSecret(): string {
  return process.env.AUTH_SECRET || 'minhluan-xskt-dev-secret-2026';
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  const keyBuf = Buffer.from(keyHex, 'hex');
  const derivedBuf = crypto.scryptSync(password, salt, 64);
  if (keyBuf.length !== derivedBuf.length) return false;
  return crypto.timingSafeEqual(keyBuf, derivedBuf);
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

export function signSessionToken(payload: Omit<SessionPayload, 'exp'>): string {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
  };
  const data = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [data, sig] = parts;
    const expectedSig = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as SessionPayload;
    if (!parsed.userId || !parsed.exp || parsed.exp < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getSessionUser() {
  const payload = await getSessionPayload();
  if (!payload) return null;

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, payload.userId))
    .limit(1);

  return user || null;
}

const DEFAULT_SUPER_ADMIN_EMAILS = [
  'admin@xosominhluan.vn',
  'superadmin@xosominhluan.vn',
  'support@xosominhluan.vn',
];

export function isSuperAdminUser(user: { role?: string | null; email?: string | null } | null): boolean {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  const envEmails = (process.env.SUPER_ADMIN_EMAILS || process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const allowed = new Set([...DEFAULT_SUPER_ADMIN_EMAILS, ...envEmails]);
  return Boolean(user.email && allowed.has(user.email.trim().toLowerCase()));
}

export async function generateNextMemberCode(): Promise<string> {
  const seqRes = await db.execute(sql`SELECT nextval('member_code_seq') AS val`);
  const rawVal = Number((seqRes.rows?.[0] as { val?: string | number })?.val || 1);
  return `ML-${String(rawVal).padStart(6, '0')}`;
}
