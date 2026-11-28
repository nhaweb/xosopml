import { neon } from '@neondatabase/serverless';
import { getProvincesByDay } from '@/config/lottery-provinces';
import { ProvinceDrawResult, Region } from '@/types/lottery';

export interface CachedRegionDrawEntry {
  results: ProvinceDrawResult[];
  isComplete: boolean;
  source: string;
  updatedAt: string;
}

let tableInitPromise: Promise<boolean> | null = null;

function getSqlClient() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

async function ensureCacheTable(): Promise<boolean> {
  const sql = getSqlClient();
  if (!sql) return false;
  if (!tableInitPromise) {
    tableInitPromise = (async () => {
      try {
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
        return true;
      } catch (err) {
        console.warn('[lotteryCacheDb] ensureCacheTable failed:', err);
        tableInitPromise = null;
        return false;
      }
    })();
  }
  return tableInitPromise;
}

/**
 * Kiểm tra dữ liệu 1 miền của ngày `date` đã xổ đầy đủ tất cả các giải hay chưa
 * (không còn ô '...' đang chờ quay và đủ số đài theo lịch).
 */
export function isRegionDrawFinalized(
  draws: ProvinceDrawResult[],
  region: Region,
  date: Date
): boolean {
  if (!draws || draws.length === 0) return false;
  const scheduled = getProvincesByDay(date.getDay(), region);
  if (scheduled.length > 0 && draws.length < scheduled.length) {
    return false;
  }
  for (const prov of draws) {
    if (!prov.prizes || prov.prizes.length === 0) return false;
    for (const prize of prov.prizes) {
      if (!prize.numbers || prize.numbers.length === 0) return false;
      if (prize.numbers.some((n) => !n || n.includes('...') || n.includes('-'))) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Đọc kết quả 3 miền đã lưu trong PostgreSQL cho ngày `isoDate` (YYYY-MM-DD).
 * Trả về object rỗng nếu chưa có dữ liệu hoặc chưa cấu hình DATABASE_URL.
 */
export async function getCachedDayDrawsFromDb(
  isoDate: string
): Promise<Partial<Record<Region, CachedRegionDrawEntry>>> {
  const ready = await ensureCacheTable();
  if (!ready) return {};
  const sql = getSqlClient();
  if (!sql) return {};

  try {
    const rows = (await sql`
      SELECT region, results_json, is_complete, source, updated_at
      FROM lottery_draws_cache
      WHERE draw_date = ${isoDate}
    `) as Array<{
      region: string;
      results_json: string;
      is_complete: boolean;
      source: string;
      updated_at: string | Date;
    }>;

    const map: Partial<Record<Region, CachedRegionDrawEntry>> = {};
    for (const row of rows) {
      if (row.region !== 'south' && row.region !== 'central' && row.region !== 'north') {
        continue;
      }
      try {
        const parsed = JSON.parse(row.results_json) as ProvinceDrawResult[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          map[row.region] = {
            results: parsed,
            isComplete: Boolean(row.is_complete),
            source: row.source || 'xosoapi.online',
            updatedAt: String(row.updated_at),
          };
        }
      } catch {
        // Bỏ qua bản ghi JSON hỏng
      }
    }
    return map;
  } catch (err) {
    console.warn(`[lotteryCacheDb] Read failed for ${isoDate}:`, err);
    return {};
  }
}

/**
 * Lưu / cập nhật kết quả 1 miền của ngày `isoDate` vào PostgreSQL để tái sử dụng lâu dài,
 * giảm tối đa lượt gọi ra API ngoài (xosoapi.online).
 */
export async function saveRegionDrawsToDb(
  isoDate: string,
  region: Region,
  results: ProvinceDrawResult[],
  isComplete: boolean,
  source = 'xosoapi.online'
): Promise<void> {
  if (!results || results.length === 0) return;
  const ready = await ensureCacheTable();
  if (!ready) return;
  const sql = getSqlClient();
  if (!sql) return;

  try {
    const payload = JSON.stringify(results);
    await sql`
      INSERT INTO lottery_draws_cache (draw_date, region, results_json, is_complete, source, updated_at)
      VALUES (${isoDate}, ${region}, ${payload}, ${isComplete}, ${source}, now())
      ON CONFLICT (draw_date, region)
      DO UPDATE SET
        results_json = EXCLUDED.results_json,
        is_complete = EXCLUDED.is_complete,
        source = EXCLUDED.source,
        updated_at = now()
      WHERE lottery_draws_cache.is_complete = false OR EXCLUDED.is_complete = true
    `;
  } catch (err) {
    console.warn(`[lotteryCacheDb] Write failed for ${isoDate}/${region}:`, err);
  }
}

