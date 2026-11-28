import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';

function loadEnvFiles() {
  for (const filename of ['.env.local', '.env']) {
    const filePath = path.resolve(process.cwd(), filename);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eqIdx = line.indexOf('=');
      if (eqIdx === -1) continue;
      const key = line.slice(0, eqIdx).trim();
      let val = line.slice(eqIdx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

async function main() {
  loadEnvFiles();

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('Lỗi: Chưa cấu hình DATABASE_URL trong .env.local hoặc biến môi trường.');
    process.exit(1);
  }

  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@xosominhluan.vn').trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin';
  const fullName = process.env.SEED_ADMIN_NAME || 'Admin Hệ Thống Minh Luân';
  const passwordHash = hashPassword(password);

  const sql = neon(connectionString);

  const existing = await sql`
    SELECT id, member_code, email, role
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `;

  if (existing.length > 0) {
    const updated = await sql`
      UPDATE users
      SET
        password_hash = ${passwordHash},
        full_name = ${fullName},
        is_email_verified = true,
        is_phone_verified = true,
        vip_tier = 'VIP',
        role = 'SUPER_ADMIN'
      WHERE email = ${email}
      RETURNING id, member_code, email, full_name, role, vip_tier, is_email_verified
    `;
    console.log('Đã cập nhật tài khoản Super Admin thành công:', updated[0]);
    return;
  }

  let memberCode = 'ML-000001';
  try {
    const seqRes = await sql`SELECT nextval('member_code_seq') AS val`;
    const num = Number(seqRes?.[0]?.val || 1);
    memberCode = `ML-${String(num).padStart(6, '0')}`;
  } catch {
    memberCode = `ML-ADMIN-${Date.now().toString().slice(-4)}`;
  }

  const inserted = await sql`
    INSERT INTO users (
      member_code,
      email,
      password_hash,
      full_name,
      is_phone_verified,
      is_email_verified,
      vip_tier,
      role
    ) VALUES (
      ${memberCode},
      ${email},
      ${passwordHash},
      ${fullName},
      true,
      true,
      'VIP',
      'SUPER_ADMIN'
    )
    RETURNING id, member_code, email, full_name, role, vip_tier, is_email_verified
  `;

  console.log('Đã tạo mới tài khoản Super Admin thành công:', inserted[0]);
}

main().catch((err) => {
  console.error('Seed admin thất bại:', err);
  process.exit(1);
});

