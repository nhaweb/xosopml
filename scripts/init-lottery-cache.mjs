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

async function main() {
  loadEnvFiles();
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('Missing DATABASE_URL');
    process.exit(1);
  }
  const sql = neon(url);
  await sql`
    CREATE TABLE IF NOT EXISTS lottery_draws_cache (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      draw_date date NOT NULL,
      region text NOT NULL,
      results_json text NOT NULL,
      is_complete boolean NOT NULL DEFAULT false,
      source text NOT NULL DEFAULT 'xosoapi.online',
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS lottery_draws_cache_date_region_uidx
    ON lottery_draws_cache (draw_date, region)
  `;
  console.log('Created/verified table lottery_draws_cache successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

