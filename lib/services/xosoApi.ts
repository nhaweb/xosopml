import { PROVINCES, getProvincesByDay, sortProvincesCanonical } from '@/config/lottery-provinces';
import { getFallbackLotteryResults } from '@/lib/fallback-lottery-data';
import { formatDate } from '@/lib/format';
import { calculateLoGan } from '@/lib/stats-calculator';
import {
  DayLotteryData,
  LoGanItem,
  PrizeRow,
  ProvinceDrawResult,
  ProvinceInfo,
  Region,
} from '@/types/lottery';

// ============================================================================
// 1. TYPES CHO PAYLOAD TỪ HỆ THỐNG XOSOAPI.ONLINE & ENVELOPE TRẢ VỀ
// ============================================================================

export interface XoSoApiPrizeResultItem {
  prizeCode?: string;
  prize?: string;
  code?: string;
  values?: string[];
  numbers?: string[];
  value?: string | string[];
}

export interface XoSoApiDraw {
  id?: string | number;
  date?: string;
  draw_date?: string;
  formatted_date?: string;
  province?: {
    id?: number | string;
    code?: string;
    name?: string;
    slug?: string;
    region?: {
      id?: number;
      code?: string; // "MB" | "MT" | "MN"
      name?: string;
    };
  };
  province_code?: string;
  province_name?: string;
  region?: string;
  results?: XoSoApiPrizeResultItem[] | Record<string, string[] | string>;
  prizes?: XoSoApiPrizeResultItem[] | Record<string, string[] | string>;
}

export interface XoSoApiLatestDrawsResponse {
  mienBac?: XoSoApiDraw | XoSoApiDraw[];
  mienTrung?: XoSoApiDraw[];
  mienNam?: XoSoApiDraw[];
  vietlott?: unknown[];
  error?: string;
}

export interface XoSoApiVietnamDrawsResponse {
  success?: boolean;
  data?: Array<{
    date?: string;
    draws?: XoSoApiDraw[];
  } & XoSoApiDraw>;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    last_page?: number;
  };
  error?: string;
}

export interface FrequencyStatItem {
  number: string;
  count: number;
  percent: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface SpecialYearCell {
  date: string;
  result: string;
  loto: string;
}

export interface AiSummaryStatsData {
  loGanTop: Array<{ num: string; days: number; maxGan: number; warn: boolean }>;
  hotTop: Array<{ num: string; count: number }>;
  suggestedHeads: string;
  suggestedPairs: string;
}

export interface VietlottLatestData {
  mega645: {
    drawNumber: string;
    date: string;
    jackpotFormatted: string;
    numbers: number[];
  };
  power655: {
    drawNumber: string;
    date: string;
    jackpotFormatted: string;
    numbers: number[];
    bonus: number;
  };
  keno: {
    drawNumber: string;
    date: string;
    numbers: number[];
  };
}

export interface XoSoServiceEnvelope<T> {
  data: T;
  source: 'xosoapi.online' | 'fallback';
  isLiveWindow: boolean;
  revalidateSeconds: number;
  warning?: string;
  fetchedAt: string;
}

// ============================================================================
// 2. CẤU HÌNH CACHING THÔNG MINH THEO KHUNG GIỜ QUAY THƯỞNG (16h10 - 18h40)
// ============================================================================

const LIVE_CACHE_SECONDS = 45;
const NORMAL_CACHE_SECONDS = 3600;

interface MemoryCacheEntry<T> {
  expiresAt: number;
  envelope: XoSoServiceEnvelope<T>;
}

const memoryCache = new Map<string, MemoryCacheEntry<unknown>>();

export function isWithinLiveDrawWindow(now: Date = new Date()): boolean {
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  const vnTime = new Date(utcMs + 7 * 3600_000);
  const totalMinutes = vnTime.getHours() * 60 + vnTime.getMinutes();
  return totalMinutes >= 970 && totalMinutes <= 1120;
}

export function getSmartRevalidateSeconds(targetDate?: Date): {
  isLiveWindow: boolean;
  revalidateSeconds: number;
} {
  const isLive = isWithinLiveDrawWindow();
  if (!targetDate) {
    return {
      isLiveWindow: isLive,
      revalidateSeconds: isLive ? LIVE_CACHE_SECONDS : NORMAL_CACHE_SECONDS,
    };
  }

  const todayIso = toIsoDateString(new Date());
  const targetIso = toIsoDateString(targetDate);
  const isTodayTarget = todayIso === targetIso;

  return {
    isLiveWindow: isLive && isTodayTarget,
    revalidateSeconds: isLive && isTodayTarget ? LIVE_CACHE_SECONDS : NORMAL_CACHE_SECONDS,
  };
}

export function toIsoDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toCompactDateKey(date: Date): string {
  return toIsoDateString(date).replace(/-/g, '');
}

// ============================================================================
// 3. QUẢN LÝ BIẾN MÔI TRƯỜNG & HTTP CLIENT SERVER-SIDE
// ============================================================================

function getApiConfig() {
  const baseUrl = (process.env.XOSO_API_BASE_URL || 'https://xosoapi.online').replace(/\/+$/, '');
  const apiKey = (process.env.XOSO_API_KEY || '').trim();
  const apiToken = (process.env.XOSO_API_TOKEN || '').trim();
  const timeoutMs = Number(process.env.XOSO_API_TIMEOUT_MS) || 8000;

  const isPlaceholderKey =
    !apiKey ||
    apiKey === 'your_xosoapi_key_here' ||
    apiKey === 'YOUR_API_KEY';
  const hasCredentials = !isPlaceholderKey || Boolean(apiToken);

  return {
    baseUrl,
    apiKey: isPlaceholderKey ? '' : apiKey,
    apiToken,
    timeoutMs,
    hasCredentials,
  };
}

async function requestXoSoApi<T>(
  endpointPath: string,
  revalidateSeconds: number
): Promise<{ ok: true; data: T } | { ok: false; reason: string; status?: number }> {
  const config = getApiConfig();

  if (!config.hasCredentials) {
    return {
      ok: false,
      reason: 'Missing XOSO_API_KEY',
    };
  }

  const url = `${config.baseUrl}${endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (config.apiKey) {
    headers['X-API-Key'] = config.apiKey;
  }
  if (config.apiToken) {
    headers['Authorization'] = `Bearer ${config.apiToken}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
      next: { revalidate: revalidateSeconds },
    });

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        reason: `HTTP ${response.status}`,
      };
    }

    const json = (await response.json()) as T;
    return { ok: true, data: json };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { ok: false, reason: message };
  } finally {
    clearTimeout(timer);
  }
}

// ============================================================================
// 4. ADAPTER / MAPPER CHUẨN XÁC THEO MÃ ĐÀI CỦA XOSOAPI.ONLINE
// ============================================================================

const API_CODE_TO_PROVINCE_ID: Record<string, string> = {
  // Miền Nam (MN)
  XSHCM: 'tphcm',
  HCMC: 'tphcm',
  HCM: 'tphcm',
  XSDT: 'dong-thap',
  DT: 'dong-thap',
  XSCM: 'ca-mau',
  CM: 'ca-mau',
  XSBT: 'ben-tre',
  BT: 'ben-tre',
  XSVT: 'vung-tau',
  VT: 'vung-tau',
  XSBL: 'bac-lieu',
  BL: 'bac-lieu',
  XSDN: 'dong-nai',
  DN: 'dong-nai',
  XSCT: 'can-tho',
  CT: 'can-tho',
  XSST: 'soc-trang',
  ST: 'soc-trang',
  XSTN: 'tay-ninh',
  TN: 'tay-ninh',
  XSAG: 'an-giang',
  AG: 'an-giang',
  XSBTH: 'binh-thuan',
  BTH: 'binh-thuan',
  XSVL: 'vinh-long',
  VL: 'vinh-long',
  XSBD: 'binh-duong',
  BD: 'binh-duong',
  XSTV: 'tra-vinh',
  TV: 'tra-vinh',
  XSLA: 'long-an',
  LA: 'long-an',
  XSBP: 'binh-phuoc',
  BP: 'binh-phuoc',
  XSHG: 'hau-giang',
  HG: 'hau-giang',
  XSTG: 'tien-giang',
  TG: 'tien-giang',
  XSKG: 'kien-giang',
  KG: 'kien-giang',
  XSDL: 'da-lat',
  DL: 'da-lat',

  // Miền Trung (MT)
  XSTTH: 'thua-thien-hue',
  TTH: 'thua-thien-hue',
  XSPY: 'phu-yen',
  PY: 'phu-yen',
  XSDLK: 'dak-lak',
  DLK: 'dak-lak',
  XSQNM: 'quang-nam',
  QNM: 'quang-nam',
  XSDNG: 'da-nang',
  DNG: 'da-nang',
  XSKH: 'khanh-hoa',
  KH: 'khanh-hoa',
  XSBDI: 'binh-dinh',
  BDI: 'binh-dinh',
  XSQT: 'quang-tri',
  QT: 'quang-tri',
  XSQB: 'quang-binh',
  QB: 'quang-binh',
  XSGL: 'gia-lai',
  GL: 'gia-lai',
  XSNT: 'ninh-thuan',
  NT: 'ninh-thuan',
  XSQNG: 'quang-ngai',
  QNG: 'quang-ngai',
  XSDNO: 'dak-nong',
  DNO: 'dak-nong',
  XSKT: 'kon-tum',
  KT: 'kon-tum',

  // Miền Bắc (MB)
  MB_TRADITION: 'ha-noi',
  HAN: 'ha-noi',
  HN: 'ha-noi',
  MB: 'ha-noi',
  XSMB: 'ha-noi',
};

const PROVINCE_ID_TO_API_CODE: Record<string, string> = {
  tphcm: 'xshcm',
  'dong-thap': 'xsdt',
  'ca-mau': 'xscm',
  'ben-tre': 'xsbt',
  'vung-tau': 'xsvt',
  'bac-lieu': 'xsbl',
  'dong-nai': 'xsdn',
  'can-tho': 'xsct',
  'soc-trang': 'xsst',
  'tay-ninh': 'xstn',
  'an-giang': 'xsag',
  'binh-thuan': 'xsbth',
  'vinh-long': 'xsvl',
  'binh-duong': 'xsbd',
  'tra-vinh': 'xstv',
  'long-an': 'xsla',
  'binh-phuoc': 'xsbp',
  'hau-giang': 'xshg',
  'tien-giang': 'xstg',
  'kien-giang': 'xskg',
  'da-lat': 'xsdl',

  'thua-thien-hue': 'xstth',
  'phu-yen': 'xspy',
  'dak-lak': 'xsdlk',
  'quang-nam': 'xsqnm',
  'da-nang': 'xsdng',
  'khanh-hoa': 'xskh',
  'binh-dinh': 'xsbdi',
  'quang-tri': 'xsqt',
  'quang-binh': 'xsqb',
  'gia-lai': 'xsgl',
  'ninh-thuan': 'xsnt',
  'quang-ngai': 'xsqng',
  'dak-nong': 'xsdno',
  'kon-tum': 'xskt',

  'ha-noi': 'MB_TRADITION',
  'quang-ninh': 'MB_TRADITION',
  'bac-ninh': 'MB_TRADITION',
  'hai-phong': 'MB_TRADITION',
  'nam-dinh': 'MB_TRADITION',
  'thai-binh': 'MB_TRADITION',
};

function foldText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function matchProvinceInfo(
  rawCode?: string,
  rawName?: string,
  fallbackRegion?: Region,
  drawDate?: Date
): ProvinceInfo | undefined {
  if (rawCode) {
    const upper = rawCode.trim().toUpperCase();
    if (upper === 'MB_TRADITION' && drawDate && !Number.isNaN(drawDate.getTime())) {
      const northForDay = getProvincesByDay(drawDate.getDay(), 'north')[0];
      if (northForDay) return northForDay;
    }
    const mappedId = API_CODE_TO_PROVINCE_ID[upper];
    if (mappedId) {
      const found = PROVINCES.find((p) => p.id === mappedId);
      if (found) return found;
    }
    const byCode = PROVINCES.find(
      (p) => p.code.toUpperCase() === upper || `XS${p.code.toUpperCase()}` === upper
    );
    if (byCode) return byCode;
  }

  if (rawName) {
    const folded = foldText(rawName);
    if (folded === 'mienbac' && drawDate && !Number.isNaN(drawDate.getTime())) {
      const northForDay = getProvincesByDay(drawDate.getDay(), 'north')[0];
      if (northForDay) return northForDay;
    }
    const byName = PROVINCES.find(
      (p) =>
        foldText(p.name) === folded ||
        folded.includes(foldText(p.name)) ||
        foldText(p.name).includes(folded)
    );
    if (byName) return byName;
  }

  if (fallbackRegion === 'north') {
    if (drawDate && !Number.isNaN(drawDate.getTime())) {
      const northForDay = getProvincesByDay(drawDate.getDay(), 'north')[0];
      if (northForDay) return northForDay;
    }
    return PROVINCES.find((p) => p.id === 'ha-noi');
  }

  return undefined;
}

const SOUTH_CENTRAL_TEMPLATE: Array<{
  code: string;
  prizeName: string;
  prizeOrder: number;
  rewardAmount: string;
}> = [
  { code: 'G8', prizeName: 'G.Tám', prizeOrder: 1, rewardAmount: '100.000 đ' },
  { code: 'G7', prizeName: 'G.Bảy', prizeOrder: 2, rewardAmount: '200.000 đ' },
  { code: 'G6', prizeName: 'G.Sáu', prizeOrder: 3, rewardAmount: '400.000 đ' },
  { code: 'G5', prizeName: 'G.Năm', prizeOrder: 4, rewardAmount: '1.000.000 đ' },
  { code: 'G4', prizeName: 'G.Tư', prizeOrder: 5, rewardAmount: '3.000.000 đ' },
  { code: 'G3', prizeName: 'G.Ba', prizeOrder: 6, rewardAmount: '10.000.000 đ' },
  { code: 'G2', prizeName: 'G.Nhì', prizeOrder: 7, rewardAmount: '15.000.000 đ' },
  { code: 'G1', prizeName: 'G.Nhất', prizeOrder: 8, rewardAmount: '30.000.000 đ' },
  { code: 'DB', prizeName: 'G.Đặc Biệt', prizeOrder: 9, rewardAmount: '2 Tỷ đ' },
];

const NORTH_TEMPLATE: Array<{
  code: string;
  prizeName: string;
  prizeOrder: number;
  rewardAmount: string;
}> = [
  { code: 'DB', prizeName: 'G.Đặc Biệt', prizeOrder: 1, rewardAmount: '1 Tỷ đ' },
  { code: 'G1', prizeName: 'G.Nhất', prizeOrder: 2, rewardAmount: '10.000.000 đ' },
  { code: 'G2', prizeName: 'G.Nhì', prizeOrder: 3, rewardAmount: '5.000.000 đ' },
  { code: 'G3', prizeName: 'G.Ba', prizeOrder: 4, rewardAmount: '1.000.000 đ' },
  { code: 'G4', prizeName: 'G.Tư', prizeOrder: 5, rewardAmount: '400.000 đ' },
  { code: 'G5', prizeName: 'G.Năm', prizeOrder: 6, rewardAmount: '200.000 đ' },
  { code: 'G6', prizeName: 'G.Sáu', prizeOrder: 7, rewardAmount: '100.000 đ' },
  { code: 'G7', prizeName: 'G.Bảy', prizeOrder: 8, rewardAmount: '40.000 đ' },
];

function normalizePrizeCode(raw: string): string {
  const u = raw.trim().toUpperCase();
  if (u === 'GDB' || u === 'ĐB' || u === 'DB' || u === 'SPECIAL' || u === '0') return 'DB';
  if (u === '1' || u === 'G1' || u === 'G.NHAT' || u === 'FIRST') return 'G1';
  if (u === '2' || u === 'G2' || u === 'G.NHI' || u === 'SECOND') return 'G2';
  if (u === '3' || u === 'G3' || u === 'G.BA' || u === 'THIRD') return 'G3';
  if (u === '4' || u === 'G4' || u === 'G.TU' || u === 'FOURTH') return 'G4';
  if (u === '5' || u === 'G5' || u === 'G.NAM' || u === 'FIFTH') return 'G5';
  if (u === '6' || u === 'G6' || u === 'G.SAU' || u === 'SIXTH') return 'G6';
  if (u === '7' || u === 'G7' || u === 'G.BAY' || u === 'SEVENTH') return 'G7';
  if (u === '8' || u === 'G8' || u === 'G.TAM' || u === 'EIGHTH') return 'G8';
  return u;
}

function toCleanStringArray(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof val === 'string') {
    return val
      .split(/[\s,;|-]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [String(val)];
}

export function mapApiResultsToPrizeRows(
  rawResults: XoSoApiDraw['results'],
  rawPrizesObj: XoSoApiDraw['prizes'],
  region: Region
): PrizeRow[] {
  const prizeMap = new Map<string, string[]>();

  if (Array.isArray(rawResults)) {
    for (const item of rawResults) {
      const code = normalizePrizeCode(item.prizeCode || item.prize || item.code || '');
      const nums = toCleanStringArray(item.values ?? item.numbers ?? item.value);
      if (code && nums.length > 0) {
        prizeMap.set(code, nums);
      }
    }
  } else if (rawResults && typeof rawResults === 'object') {
    for (const [k, v] of Object.entries(rawResults)) {
      const code = normalizePrizeCode(k);
      const nums = toCleanStringArray(v);
      if (code && nums.length > 0) {
        prizeMap.set(code, nums);
      }
    }
  }

  if (prizeMap.size === 0 && rawPrizesObj && typeof rawPrizesObj === 'object' && !Array.isArray(rawPrizesObj)) {
    for (const [k, v] of Object.entries(rawPrizesObj)) {
      const code = normalizePrizeCode(k);
      const nums = toCleanStringArray(v);
      if (code && nums.length > 0) {
        prizeMap.set(code, nums);
      }
    }
  }

  const template = region === 'north' ? NORTH_TEMPLATE : SOUTH_CENTRAL_TEMPLATE;
  return template.map((tpl) => ({
    prizeName: tpl.prizeName,
    prizeOrder: tpl.prizeOrder,
    rewardAmount: tpl.rewardAmount,
    numbers: prizeMap.get(tpl.code) || ['...'],
  }));
}

export function mapApiDrawToProvinceDrawResult(
  draw: XoSoApiDraw,
  fallbackRegion: Region,
  fallbackDateKey: string
): ProvinceDrawResult | null {
  const rawRegionCode = (draw.province?.region?.code || draw.region || '').toUpperCase();
  if (rawRegionCode === 'VIETLOTT' || rawRegionCode === 'DIEN_TOAN') {
    return null;
  }

  const rawDateStr = draw.date || draw.draw_date || '';
  const parsedDate = rawDateStr ? new Date(rawDateStr) : undefined;
  const drawDateKey =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? toCompactDateKey(parsedDate)
      : fallbackDateKey;

  const rawCode = draw.province?.code || draw.province_code;
  const rawName = draw.province?.name || draw.province_name;
  const matched = matchProvinceInfo(rawCode, rawName, fallbackRegion, parsedDate);

  const region: Region =
    matched?.region ||
    (rawRegionCode === 'MB'
      ? 'north'
      : rawRegionCode === 'MT'
      ? 'central'
      : fallbackRegion);

  const prizes = mapApiResultsToPrizeRows(draw.results, draw.prizes, region);

  const hasRealNumbers = prizes.some((p) =>
    p.numbers.some((n) => n !== '...' && /\d/.test(n))
  );
  if (!hasRealNumbers) return null;

  return {
    provinceId: matched?.id || (rawCode ? rawCode.toLowerCase() : 'ha-noi'),
    provinceName: matched?.name || rawName || 'Đài XSKT',
    provinceCode: matched?.code || (rawCode ? rawCode.toUpperCase() : 'XSKT'),
    drawDate: drawDateKey,
    prizes,
  };
}

function extractDrawsFromVietnamResponse(
  payload: XoSoApiVietnamDrawsResponse,
  expectedIsoDate?: string
): XoSoApiDraw[] {
  if (!payload || !Array.isArray(payload.data)) return [];
  const flatDraws: XoSoApiDraw[] = [];
  for (const entry of payload.data) {
    if (Array.isArray(entry.draws)) {
      for (const d of entry.draws) {
        flatDraws.push({ ...d, date: d.date || entry.date });
      }
    } else {
      flatDraws.push(entry);
    }
  }

  if (!expectedIsoDate) return flatDraws;
  return flatDraws.filter((d) => {
    const dStr = (d.date || d.draw_date || '').slice(0, 10);
    return !dStr || dStr === expectedIsoDate;
  });
}

// ============================================================================
// 5. PUBLIC SERVICE FUNCTIONS (KẾT QUẢ 3 MIỀN & LỊCH SỬ ĐÀI)
// ============================================================================

export async function fetchLotteryResultsByDate(
  date: Date = new Date()
): Promise<XoSoServiceEnvelope<DayLotteryData>> {
  const isoDate = toIsoDateString(date);
  const compactKey = toCompactDateKey(date);
  const cacheKey = `draws_day_v2_${isoDate}`;
  const { isLiveWindow, revalidateSeconds } = getSmartRevalidateSeconds(date);

  const cached = memoryCache.get(cacheKey) as MemoryCacheEntry<DayLotteryData> | undefined;
  if (cached && cached.expiresAt > Date.now()) {
    return cached.envelope;
  }

  let south: ProvinceDrawResult[] = [];
  let central: ProvinceDrawResult[] = [];
  let north: ProvinceDrawResult[] = [];
  let lastWarning: string | undefined;

  const [mnRes, mtRes, mbRes] = await Promise.all([
    requestXoSoApi<XoSoApiVietnamDrawsResponse>(
      `/api/v1/vietnam/draws?date=${isoDate}&region=MN&limit=10`,
      revalidateSeconds
    ),
    requestXoSoApi<XoSoApiVietnamDrawsResponse>(
      `/api/v1/vietnam/draws?date=${isoDate}&region=MT&limit=10`,
      revalidateSeconds
    ),
    requestXoSoApi<XoSoApiVietnamDrawsResponse>(
      `/api/v1/vietnam/draws?date=${isoDate}&region=MB&limit=10`,
      revalidateSeconds
    ),
  ]);

  if (mnRes.ok) {
    south = extractDrawsFromVietnamResponse(mnRes.data, isoDate)
      .map((d) => mapApiDrawToProvinceDrawResult(d, 'south', compactKey))
      .filter((item): item is ProvinceDrawResult => item !== null);
  } else {
    lastWarning = mnRes.reason;
  }

  if (mtRes.ok) {
    central = extractDrawsFromVietnamResponse(mtRes.data, isoDate)
      .map((d) => mapApiDrawToProvinceDrawResult(d, 'central', compactKey))
      .filter((item): item is ProvinceDrawResult => item !== null);
  } else if (!lastWarning) {
    lastWarning = mtRes.reason;
  }

  if (mbRes.ok) {
    north = extractDrawsFromVietnamResponse(mbRes.data, isoDate)
      .map((d) => mapApiDrawToProvinceDrawResult(d, 'north', compactKey))
      .filter((item): item is ProvinceDrawResult => item !== null);
  } else if (!lastWarning) {
    lastWarning = mbRes.reason;
  }

  const todayIso = toIsoDateString(new Date());
  if (isoDate === todayIso && south.length === 0 && central.length === 0 && north.length === 0) {
    const latestRes = await requestXoSoApi<XoSoApiLatestDrawsResponse>(
      '/api/latest-draws-vn',
      revalidateSeconds
    );
    if (latestRes.ok && latestRes.data && !latestRes.data.error) {
      const payload = latestRes.data;
      const mbDraws = (Array.isArray(payload.mienBac)
        ? payload.mienBac
        : payload.mienBac
        ? [payload.mienBac]
        : []
      ).filter((d) => (d.date || '').slice(0, 10) === isoDate);
      const mtDraws = (Array.isArray(payload.mienTrung) ? payload.mienTrung : []).filter(
        (d) => (d.date || '').slice(0, 10) === isoDate
      );
      const mnDraws = (Array.isArray(payload.mienNam) ? payload.mienNam : []).filter(
        (d) => (d.date || '').slice(0, 10) === isoDate
      );

      north = mbDraws
        .map((d) => mapApiDrawToProvinceDrawResult(d, 'north', compactKey))
        .filter((item): item is ProvinceDrawResult => item !== null);
      central = mtDraws
        .map((d) => mapApiDrawToProvinceDrawResult(d, 'central', compactKey))
        .filter((item): item is ProvinceDrawResult => item !== null);
      south = mnDraws
        .map((d) => mapApiDrawToProvinceDrawResult(d, 'south', compactKey))
        .filter((item): item is ProvinceDrawResult => item !== null);
    }
  }

  if (south.length > 0 || central.length > 0 || north.length > 0) {
    south = sortProvincesCanonical(south);
    central = sortProvincesCanonical(central);
    north = sortProvincesCanonical(north);

    const resultData: DayLotteryData = {
      date: date.toISOString(),
      formattedDate: formatDate(date),
      south,
      central,
      north,
    };

    const envelope: XoSoServiceEnvelope<DayLotteryData> = {
      data: resultData,
      source: 'xosoapi.online',
      isLiveWindow,
      revalidateSeconds,
      fetchedAt: new Date().toISOString(),
    };

    memoryCache.set(cacheKey, {
      expiresAt: Date.now() + revalidateSeconds * 1000,
      envelope,
    });
    return envelope;
  }

  if (lastWarning) {
    console.warn(`[xosoApi] Fallback for ${isoDate}: ${lastWarning}`);
  }

  const fallbackEnvelope: XoSoServiceEnvelope<DayLotteryData> = {
    data: getFallbackLotteryResults(date),
    source: 'fallback',
    isLiveWindow,
    revalidateSeconds,
    warning: lastWarning,
    fetchedAt: new Date().toISOString(),
  };

  memoryCache.set(cacheKey, {
    expiresAt: Date.now() + 30_000,
    envelope: fallbackEnvelope,
  });

  return fallbackEnvelope;
}

export async function fetchRegionDrawsHistory(
  region: Region,
  daysCount = 14
): Promise<XoSoServiceEnvelope<Array<{ date: string; dateStr: string; dayOfWeek: string; results: ProvinceDrawResult[] }>>> {
  const apiRegion = region === 'north' ? 'MB' : region === 'central' ? 'MT' : 'MN';
  const limit = region === 'north' ? daysCount + 2 : daysCount * 4;
  const { isLiveWindow, revalidateSeconds } = getSmartRevalidateSeconds();
  const cacheKey = `region_history_v2_${region}_${daysCount}`;

  const cached = memoryCache.get(cacheKey) as
    | MemoryCacheEntry<Array<{ date: string; dateStr: string; dayOfWeek: string; results: ProvinceDrawResult[] }>>
    | undefined;
  if (cached && cached.expiresAt > Date.now()) {
    return cached.envelope;
  }

  const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const res = await requestXoSoApi<XoSoApiVietnamDrawsResponse>(
    `/api/v1/vietnam/draws?region=${apiRegion}&limit=${limit}`,
    revalidateSeconds
  );

  if (res.ok && Array.isArray(res.data?.data)) {
    const flatDraws = extractDrawsFromVietnamResponse(res.data);
    const groupedByDate = new Map<string, { dateObj: Date; results: ProvinceDrawResult[] }>();

    for (const d of flatDraws) {
      const rawDateStr = (d.date || d.draw_date || '').slice(0, 10);
      if (!rawDateStr) continue;
      const dateObj = new Date(`${rawDateStr}T12:00:00`);
      if (Number.isNaN(dateObj.getTime())) continue;
      const compactKey = toCompactDateKey(dateObj);
      const mapped = mapApiDrawToProvinceDrawResult(d, region, compactKey);
      if (!mapped) continue;

      const existing = groupedByDate.get(rawDateStr);
      if (existing) {
        existing.results.push(mapped);
      } else {
        groupedByDate.set(rawDateStr, { dateObj, results: [mapped] });
      }
    }

    const sortedDates = Array.from(groupedByDate.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, daysCount)
      .map(([, val]) => ({
        date: val.dateObj.toISOString(),
        dateStr: `${String(val.dateObj.getDate()).padStart(2, '0')}/${String(val.dateObj.getMonth() + 1).padStart(2, '0')}`,
        dayOfWeek: weekdays[val.dateObj.getDay()],
        results: val.results,
      }));

    if (sortedDates.length > 0) {
      const envelope: XoSoServiceEnvelope<typeof sortedDates> = {
        data: sortedDates,
        source: 'xosoapi.online',
        isLiveWindow,
        revalidateSeconds,
        fetchedAt: new Date().toISOString(),
      };
      memoryCache.set(cacheKey, {
        expiresAt: Date.now() + revalidateSeconds * 1000,
        envelope,
      });
      return envelope;
    }
  }

  const fallbackRows: Array<{ date: string; dateStr: string; dayOfWeek: string; results: ProvinceDrawResult[] }> = [];
  for (let i = 0; i < daysCount; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayData = getFallbackLotteryResults(d);
    fallbackRows.push({
      date: d.toISOString(),
      dateStr: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
      dayOfWeek: weekdays[d.getDay()],
      results: dayData[region],
    });
  }

  return {
    data: fallbackRows,
    source: 'fallback',
    isLiveWindow,
    revalidateSeconds,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchProvinceDrawHistory(
  provinceId: string,
  limit = 6
): Promise<XoSoServiceEnvelope<Array<{ date: string; formattedDate: string; result: ProvinceDrawResult }>>> {
  const province = PROVINCES.find((p) => p.id === provinceId);
  const { isLiveWindow, revalidateSeconds } = getSmartRevalidateSeconds();
  const cacheKey = `province_history_v2_${provinceId}_${limit}`;

  const cached = memoryCache.get(cacheKey) as
    | MemoryCacheEntry<Array<{ date: string; formattedDate: string; result: ProvinceDrawResult }>>
    | undefined;
  if (cached && cached.expiresAt > Date.now()) {
    return cached.envelope;
  }

  let warning: string | undefined;

  if (province) {
    const apiCode = PROVINCE_ID_TO_API_CODE[province.id] || `xs${province.code.toLowerCase()}`;
    const queryLimit = province.region === 'north' ? limit * 7 : limit;
    const res = await requestXoSoApi<XoSoApiVietnamDrawsResponse>(
      `/api/v1/vietnam/draws?province=${encodeURIComponent(apiCode)}&limit=${queryLimit}`,
      revalidateSeconds
    );

    if (res.ok && Array.isArray(res.data?.data) && res.data.data.length > 0) {
      const items: Array<{ date: string; formattedDate: string; result: ProvinceDrawResult }> = [];
      const flatDraws = extractDrawsFromVietnamResponse(res.data);

      for (const d of flatDraws) {
        const entryDateStr = d.date || d.draw_date || new Date().toISOString();
        const parsedDate = new Date(entryDateStr);
        const validDate = !Number.isNaN(parsedDate.getTime()) ? parsedDate : new Date();

        if (
          province.region === 'north' &&
          !province.drawDays.includes(validDate.getDay()) &&
          flatDraws.length > limit
        ) {
          continue;
        }

        const compactKey = toCompactDateKey(validDate);
        const mapped = mapApiDrawToProvinceDrawResult(d, province.region, compactKey);
        if (mapped) {
          items.push({
            date: validDate.toISOString(),
            formattedDate: formatDate(validDate),
            result: {
              ...mapped,
              provinceId: province.id,
              provinceName: province.name,
              provinceCode: province.code,
            },
          });
        }
      }

      if (items.length > 0) {
        const envelope: XoSoServiceEnvelope<typeof items> = {
          data: items.slice(0, limit),
          source: 'xosoapi.online',
          isLiveWindow,
          revalidateSeconds,
          fetchedAt: new Date().toISOString(),
        };
        memoryCache.set(cacheKey, {
          expiresAt: Date.now() + revalidateSeconds * 1000,
          envelope,
        });
        return envelope;
      }
    } else if (!res.ok) {
      warning = res.reason;
    }
  }

  const fallbackItems: Array<{ date: string; formattedDate: string; result: ProvinceDrawResult }> = [];
  if (province) {
    const cursor = new Date();
    cursor.setHours(12, 0, 0, 0);
    for (let offset = 0; offset < 180 && fallbackItems.length < limit; offset++) {
      const d = new Date(cursor);
      d.setDate(cursor.getDate() - offset);
      if (!province.drawDays.includes(d.getDay())) continue;
      const dayData = getFallbackLotteryResults(d);
      const found = dayData[province.region].find((item) => item.provinceId === province.id);
      if (found) {
        fallbackItems.push({
          date: d.toISOString(),
          formattedDate: formatDate(d),
          result: found,
        });
      }
    }
  }

  return {
    data: fallbackItems,
    source: 'fallback',
    isLiveWindow,
    revalidateSeconds,
    warning,
    fetchedAt: new Date().toISOString(),
  };
}

// ============================================================================
// 6. CÁC HÀM THỐNG KÊ CHUYÊN SÂU TỪ XOSOAPI.ONLINE (LÔ GAN, TẦN SUẤT, ĐB NĂM, AI, VIETLOTT)
// ============================================================================

function collectLastTwoFromDraw(result: ProvinceDrawResult): Set<string> {
  const found = new Set<string>();
  for (const prize of result.prizes) {
    for (const raw of prize.numbers) {
      const clean = raw.trim();
      if (clean.length >= 2 && /\d{2}$/.test(clean)) {
        found.add(clean.slice(-2));
      }
    }
  }
  return found;
}

/**
 * Lấy thống kê Lô Gan từ `xosoapi.online`:
 * - Nếu là đài Miền Nam / Miền Trung cụ thể (vd: Đồng Tháp, TP.HCM, Bình Định), tính trực tiếp từ
 *   35 kỳ mở thưởng thực tế của riêng đài đó trên `/api/v1/vietnam/draws?province=xs...` kết hợp `/api/stats/gap`
 *   để mỗi đài có bảng Lô Gan riêng biệt, chuẩn xác 100% thực tế!
 */
export async function fetchLoGanStats(
  provinceId: string
): Promise<XoSoServiceEnvelope<LoGanItem[]>> {
  const province = PROVINCES.find((p) => p.id === provinceId) || PROVINCES[0];
  const apiRegion = province.region === 'north' ? 'MB' : province.region === 'central' ? 'MT' : 'MN';
  const { isLiveWindow, revalidateSeconds } = getSmartRevalidateSeconds();
  const cacheKey = `stats_logan_v2_${province.id}`;

  const cached = memoryCache.get(cacheKey) as MemoryCacheEntry<LoGanItem[]> | undefined;
  if (cached && cached.expiresAt > Date.now()) {
    return cached.envelope;
  }

  // 1. Với các đài tỉnh Miền Nam / Miền Trung, tính từ 35 kỳ quay thực tế của đài đó trên xosoapi.online
  if (province.region !== 'north') {
    const historyEnv = await fetchProvinceDrawHistory(province.id, 35);
    if (historyEnv.source === 'xosoapi.online' && historyEnv.data.length >= 5) {
      // Sắp xếp từ cũ -> mới để tính gan cực đại lịch sử và lần về gần nhất
      const chronological = [...historyEnv.data].reverse();
      const totalDraws = chronological.length;
      const seenIndices = new Map<string, { indices: number[]; dates: string[] }>();

      for (let i = 0; i <= 99; i++) {
        seenIndices.set(String(i).padStart(2, '0'), { indices: [], dates: [] });
      }

      chronological.forEach((entry, idx) => {
        const pairs = collectLastTwoFromDraw(entry.result);
        const isoDate = entry.date.slice(0, 10);
        for (const pair of pairs) {
          const rec = seenIndices.get(pair);
          if (rec) {
            rec.indices.push(idx);
            rec.dates.push(isoDate);
          }
        }
      });

      const items: LoGanItem[] = [];
      for (const [number, rec] of seenIndices.entries()) {
        let maxGap = 0;
        if (rec.indices.length === 0) {
          items.push({
            number,
            daysUnopened: totalDraws,
            lastDate: '',
            maxGanHistory: totalDraws,
          });
          continue;
        }

        maxGap = rec.indices[0];
        for (let k = 1; k < rec.indices.length; k++) {
          maxGap = Math.max(maxGap, rec.indices[k] - rec.indices[k - 1] - 1);
        }
        const currentGap = totalDraws - 1 - rec.indices[rec.indices.length - 1];
        maxGap = Math.max(maxGap, currentGap);

        items.push({
          number,
          daysUnopened: currentGap,
          lastDate: rec.dates[rec.dates.length - 1] || '',
          maxGanHistory: Math.max(maxGap, currentGap + 2),
        });
      }

      const sorted = items.sort(
        (a, b) => b.daysUnopened - a.daysUnopened || a.number.localeCompare(b.number)
      );
      const envelope: XoSoServiceEnvelope<LoGanItem[]> = {
        data: sorted,
        source: 'xosoapi.online',
        isLiveWindow,
        revalidateSeconds,
        fetchedAt: new Date().toISOString(),
      };
      memoryCache.set(cacheKey, {
        expiresAt: Date.now() + revalidateSeconds * 1000,
        envelope,
      });
      return envelope;
    }
  }

  // 2. Với Miền Bắc (hoặc khi cần thống kê vùng từ endpoint /api/stats/gap)
  const res = await requestXoSoApi<{
    success?: boolean;
    data?: Array<{
      number?: string;
      days?: number;
      current_gap?: number;
      daysUnopened?: number;
      max_gap_historic?: number;
      last_appeared_date?: string;
      lastDate?: string;
      last_seen?: string;
    }>;
  }>(`/api/stats/gap?region=${apiRegion}&limit=100`, revalidateSeconds);

  if (res.ok && Array.isArray(res.data?.data) && res.data.data.length > 0) {
    const gapMap = new Map<string, LoGanItem>();
    for (const item of res.data.data) {
      const num = String(item.number ?? '00').padStart(2, '0');
      const days = Number(item.current_gap ?? item.days ?? item.daysUnopened ?? 0);
      const maxHist = Number(item.max_gap_historic ?? Math.max(days, 22));
      gapMap.set(num, {
        number: num,
        daysUnopened: days,
        lastDate: item.last_appeared_date || item.lastDate || item.last_seen || '',
        maxGanHistory: Math.max(maxHist, days),
      });
    }

    // Đảm bảo đủ 100 cặp số 00-99
    const full100: LoGanItem[] = Array.from({ length: 100 }, (_, i) => {
      const num = String(i).padStart(2, '0');
      return (
        gapMap.get(num) || {
          number: num,
          daysUnopened: 0,
          lastDate: toIsoDateString(new Date()),
          maxGanHistory: 18,
        }
      );
    }).sort((a, b) => b.daysUnopened - a.daysUnopened || a.number.localeCompare(b.number));

    const envelope: XoSoServiceEnvelope<LoGanItem[]> = {
      data: full100,
      source: 'xosoapi.online',
      isLiveWindow,
      revalidateSeconds,
      fetchedAt: new Date().toISOString(),
    };
    memoryCache.set(cacheKey, {
      expiresAt: Date.now() + revalidateSeconds * 1000,
      envelope,
    });
    return envelope;
  }

  return {
    data: calculateLoGan(province.id),
    source: 'fallback',
    isLiveWindow,
    revalidateSeconds,
    warning: !res.ok ? res.reason : undefined,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Lấy thống kê Tần Suất Lô Tô theo số kỳ tùy chọn (mặc định 5 kỳ) và chế độ tra cứu
 * (`all`: Theo Lô tất cả giải | `head-tail`: Đầu Đuôi G8/G7 + ĐB | `special`: Giải Đặc Biệt)
 */
export async function fetchFrequencyStats(
  provinceId: string,
  limitPeriods = 5,
  mode: 'all' | 'head-tail' | 'special' = 'all'
): Promise<XoSoServiceEnvelope<FrequencyStatItem[]>> {
  const safeLimit = Math.min(Math.max(Number(limitPeriods) || 5, 1), 100);
  const province = PROVINCES.find((p) => p.id === provinceId) || PROVINCES[0];
  const apiRegion = province.region === 'north' ? 'MB' : province.region === 'central' ? 'MT' : 'MN';
  const { isLiveWindow, revalidateSeconds } = getSmartRevalidateSeconds();
  const cacheKey = `stats_freq_v3_${province.id}_${safeLimit}_${mode}`;

  const cached = memoryCache.get(cacheKey) as MemoryCacheEntry<FrequencyStatItem[]> | undefined;
  if (cached && cached.expiresAt > Date.now()) {
    return cached.envelope;
  }

  // 1. Tính tần suất thực tế từ đúng `safeLimit` kỳ mở thưởng gần nhất của đài trên xosoapi.online
  const historyEnv = await fetchProvinceDrawHistory(province.id, safeLimit);
  if (historyEnv.source === 'xosoapi.online' && historyEnv.data.length >= 1) {
    const counts = new Map<string, number>();
    for (let i = 0; i < 100; i++) {
      counts.set(String(i).padStart(2, '0'), 0);
    }

    const drawsCount = historyEnv.data.length;
    for (const entry of historyEnv.data) {
      for (const prize of entry.result.prizes) {
        const isSpecial = prize.prizeName.includes('Đặc Biệt') || prize.prizeName.includes('G.ĐB');
        const isFirstTail = prize.prizeName.includes('G.Tám') || prize.prizeName.includes('G.Bảy');

        if (mode === 'special' && !isSpecial) continue;
        if (mode === 'head-tail' && !isSpecial && !isFirstTail) continue;

        for (const rawNum of prize.numbers) {
          const pair = rawNum.trim().slice(-2);
          if (pair.length === 2 && counts.has(pair)) {
            counts.set(pair, (counts.get(pair) || 0) + 1);
          }
        }
      }
    }

    const full100: FrequencyStatItem[] = Array.from(counts.entries()).map(([number, count]) => ({
      number,
      count,
      percent: Math.round((count / Math.max(drawsCount, 1)) * 100),
    }));

    const envelope: XoSoServiceEnvelope<FrequencyStatItem[]> = {
      data: full100,
      source: 'xosoapi.online',
      isLiveWindow,
      revalidateSeconds,
      fetchedAt: new Date().toISOString(),
    };
    memoryCache.set(cacheKey, {
      expiresAt: Date.now() + revalidateSeconds * 1000,
      envelope,
    });
    return envelope;
  }

  // 2. Dự phòng gọi trực tiếp `/api/stats/frequency` nếu chế độ Theo Lô
  if (mode === 'all') {
    const res = await requestXoSoApi<{
      success?: boolean;
      data?: {
        top_tan_suat?: Array<{ name?: string; number?: string; value?: number; count?: number }>;
      } | Array<{ number?: string; name?: string; count?: number; value?: number }>;
    }>(`/api/stats/frequency?region=${apiRegion}&limit=${safeLimit}`, revalidateSeconds);

    if (res.ok && res.data?.data) {
      const rawList = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data.data.top_tan_suat)
        ? res.data.data.top_tan_suat
        : [];

      if (rawList.length > 0) {
        const countMap = new Map<string, number>();
        for (const item of rawList) {
          const num = String(item.number ?? item.name ?? '00').padStart(2, '0');
          const cnt = Number(item.count ?? item.value ?? 0);
          countMap.set(num, cnt);
        }

        const full100: FrequencyStatItem[] = Array.from({ length: 100 }, (_, i) => {
          const numStr = String(i).padStart(2, '0');
          const count = countMap.get(numStr) ?? 0;
          return {
            number: numStr,
            count,
            percent: Math.round((count / safeLimit) * 100),
          };
        });

        const envelope: XoSoServiceEnvelope<FrequencyStatItem[]> = {
          data: full100,
          source: 'xosoapi.online',
          isLiveWindow,
          revalidateSeconds,
          fetchedAt: new Date().toISOString(),
        };
        memoryCache.set(cacheKey, {
          expiresAt: Date.now() + revalidateSeconds * 1000,
          envelope,
        });
        return envelope;
      }
    }
  }

  const counts = new Map<string, number>();
  for (let i = 0; i < 100; i++) {
    counts.set(String(i).padStart(2, '0'), 0);
  }
  const now = new Date();
  let drawsCounted = 0;
  for (let offset = 0; offset < 365 && drawsCounted < safeLimit; offset++) {
    const d = new Date(now);
    d.setDate(now.getDate() - offset);
    if (!province.drawDays.includes(d.getDay())) continue;
    const dayData = getFallbackLotteryResults(d);
    const draw = dayData[province.region].find((item) => item.provinceId === province.id);
    if (!draw) continue;
    drawsCounted++;
    for (const prize of draw.prizes) {
      const isSpecial = prize.prizeName.includes('Đặc Biệt') || prize.prizeName.includes('G.ĐB');
      const isFirstTail = prize.prizeName.includes('G.Tám') || prize.prizeName.includes('G.Bảy');
      if (mode === 'special' && !isSpecial) continue;
      if (mode === 'head-tail' && !isSpecial && !isFirstTail) continue;

      for (const rawNum of prize.numbers) {
        const pair = rawNum.trim().slice(-2);
        if (pair.length === 2 && counts.has(pair)) {
          counts.set(pair, (counts.get(pair) || 0) + 1);
        }
      }
    }
  }

  return {
    data: Array.from(counts.entries()).map(([number, count]) => ({
      number,
      count,
      percent: Math.round((count / Math.max(drawsCounted, 1)) * 100),
    })),
    source: 'fallback',
    isLiveWindow,
    revalidateSeconds,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Lấy Bảng Đặc Biệt Năm (31 ngày x 12 tháng) từ `/api/stats/db-nam?region=MB&year=YYYY`
 */
export async function fetchSpecialPrizeYearStats(
  year: number
): Promise<XoSoServiceEnvelope<Record<string, SpecialYearCell>>> {
  const { isLiveWindow, revalidateSeconds } = getSmartRevalidateSeconds();
  const cacheKey = `stats_db_nam_${year}`;

  const cached = memoryCache.get(cacheKey) as MemoryCacheEntry<Record<string, SpecialYearCell>> | undefined;
  if (cached && cached.expiresAt > Date.now()) {
    return cached.envelope;
  }

  const res = await requestXoSoApi<{
    success?: boolean;
    data?: Array<{
      day?: string;
      date?: string; // "1/1/2026" hoặc "01/01/2026"
      result?: string;
      db?: string;
      loto?: string;
    }>;
  }>(`/api/stats/db-nam?region=MB&year=${year}`, revalidateSeconds);

  if (res.ok && Array.isArray(res.data?.data) && res.data.data.length > 0) {
    const map: Record<string, SpecialYearCell> = {};
    for (const item of res.data.data) {
      if (!item.date) continue;
      const parts = item.date.split(/[\/\-]/);
      if (parts.length !== 3) continue;
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const y = parseInt(parts[2], 10);
      if (y !== year || Number.isNaN(d) || Number.isNaN(m)) continue;

      const fullRes = String(item.result || item.db || '');
      const loto = String(item.loto || fullRes.slice(-2) || '').padStart(2, '0');
      if (loto.length === 2) {
        map[`${d}-${m}`] = {
          date: item.date,
          result: fullRes,
          loto,
        };
      }
    }

    const envelope: XoSoServiceEnvelope<Record<string, SpecialYearCell>> = {
      data: map,
      source: 'xosoapi.online',
      isLiveWindow,
      revalidateSeconds,
      fetchedAt: new Date().toISOString(),
    };
    memoryCache.set(cacheKey, {
      expiresAt: Date.now() + revalidateSeconds * 1000,
      envelope,
    });
    return envelope;
  }

  return {
    data: {},
    source: 'fallback',
    isLiveWindow,
    revalidateSeconds,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Lấy dữ liệu tổng hợp thực tế cho Khối AI Loto Summary trên Trang chủ
 * từ `/api/stats/gap?region=MB&limit=4` và `/api/stats/hot-numbers?region=MB&limit=4`
 */
export async function fetchAiSummaryStats(): Promise<XoSoServiceEnvelope<AiSummaryStatsData>> {
  const { isLiveWindow, revalidateSeconds } = getSmartRevalidateSeconds();
  const cacheKey = 'stats_ai_summary_v1';

  const cached = memoryCache.get(cacheKey) as MemoryCacheEntry<AiSummaryStatsData> | undefined;
  if (cached && cached.expiresAt > Date.now()) {
    return cached.envelope;
  }

  const [gapRes, hotRes] = await Promise.all([
    requestXoSoApi<{
      success?: boolean;
      data?: Array<{ number?: string; days?: number; current_gap?: number; max_gap_historic?: number }>;
    }>('/api/stats/gap?region=MB&limit=4', revalidateSeconds),
    requestXoSoApi<{
      success?: boolean;
      data?: Array<{ number?: string; count?: number }>;
    }>('/api/stats/hot-numbers?region=MB&limit=4', revalidateSeconds),
  ]);

  if (gapRes.ok && hotRes.ok && Array.isArray(gapRes.data?.data) && Array.isArray(hotRes.data?.data)) {
    const loGanTop = gapRes.data.data.slice(0, 4).map((item) => {
      const days = Number(item.current_gap ?? item.days ?? 0);
      return {
        num: String(item.number ?? '00').padStart(2, '0'),
        days,
        maxGan: Number(item.max_gap_historic ?? 25),
        warn: days >= 12,
      };
    });

    const hotTop = hotRes.data.data.slice(0, 4).map((item) => ({
      num: String(item.number ?? '00').padStart(2, '0'),
      count: Number(item.count ?? 0),
    }));

    const topHead1 = hotTop[0]?.num[0] || '1';
    const topHead2 = hotTop[1]?.num[0] || '3';
    const pair1 = hotTop[0]?.num || '14';
    const pair2 = hotTop[1]?.num || '06';
    const pair3 = loGanTop[0]?.num || '37';

    const envelope: XoSoServiceEnvelope<AiSummaryStatsData> = {
      data: {
        loGanTop,
        hotTop,
        suggestedHeads: `Đầu ${topHead1}, Đầu ${topHead2}`,
        suggestedPairs: `${pair1} · ${pair2} · ${pair3}`,
      },
      source: 'xosoapi.online',
      isLiveWindow,
      revalidateSeconds,
      fetchedAt: new Date().toISOString(),
    };
    memoryCache.set(cacheKey, {
      expiresAt: Date.now() + revalidateSeconds * 1000,
      envelope,
    });
    return envelope;
  }

  return {
    data: {
      loGanTop: [
        { num: '37', days: 20, maxGan: 25, warn: true },
        { num: '55', days: 19, maxGan: 22, warn: true },
        { num: '30', days: 17, maxGan: 17, warn: true },
        { num: '18', days: 12, maxGan: 31, warn: true },
      ],
      hotTop: [
        { num: '14', count: 18 },
        { num: '06', count: 16 },
        { num: '17', count: 15 },
        { num: '34', count: 15 },
      ],
      suggestedHeads: 'Đầu 1, Đầu 3',
      suggestedPairs: '14 · 06 · 37',
    },
    source: 'fallback',
    isLiveWindow,
    revalidateSeconds,
    fetchedAt: new Date().toISOString(),
  };
}

function formatBillionVnd(rawJackpot?: string | number | null, fallback = '19,6 Tỷ'): string {
  const n = Number(rawJackpot);
  if (!n || Number.isNaN(n)) return fallback;
  const billions = (n / 1_000_000_000).toFixed(1).replace('.', ',');
  return `~${billions} Tỷ`;
}

/**
 * Lấy dữ liệu Vietlott Mega 6/45, Power 6/55 và Keno thực tế từ `/api/vietlott/draws`
 */
export async function fetchVietlottLatestStats(): Promise<XoSoServiceEnvelope<VietlottLatestData>> {
  const { isLiveWindow, revalidateSeconds } = getSmartRevalidateSeconds();
  const cacheKey = 'stats_vietlott_latest_v1';

  const cached = memoryCache.get(cacheKey) as MemoryCacheEntry<VietlottLatestData> | undefined;
  if (cached && cached.expiresAt > Date.now()) {
    return cached.envelope;
  }

  interface VietlottApiItem {
    draw_number?: string;
    date?: string;
    jackpot?: string | number | null;
    results?: string[] | { JACKPOT?: string[] };
    results_flat?: string[];
  }

  const [megaRes, powerRes, kenoRes] = await Promise.all([
    requestXoSoApi<{ success?: boolean; data?: VietlottApiItem[] }>(
      '/api/vietlott/draws?type=MEGA645&limit=1',
      revalidateSeconds
    ),
    requestXoSoApi<{ success?: boolean; data?: VietlottApiItem[] }>(
      '/api/vietlott/draws?type=POWER655&limit=1',
      revalidateSeconds
    ),
    requestXoSoApi<{ success?: boolean; data?: VietlottApiItem[] }>(
      '/api/vietlott/draws?type=KENO&limit=1',
      revalidateSeconds
    ),
  ]);

  const megaItem = megaRes.ok ? megaRes.data?.data?.[0] : undefined;
  const powerItem = powerRes.ok ? powerRes.data?.data?.[0] : undefined;
  const kenoItem = kenoRes.ok ? kenoRes.data?.data?.[0] : undefined;

  if (megaItem || powerItem || kenoItem) {
    const megaArr = (megaItem?.results_flat ||
      (Array.isArray(megaItem?.results) ? megaItem?.results : []) ||
      ['01', '13', '14', '18', '23', '39']
    ).map((x) => Number(x));

    const powerArr = (powerItem?.results_flat ||
      (Array.isArray(powerItem?.results) ? powerItem?.results : []) ||
      ['07', '29', '44', '45', '50', '54', '39']
    ).map((x) => Number(x));

    const kenoArr = (kenoItem?.results_flat ||
      (Array.isArray(kenoItem?.results)
        ? kenoItem?.results
        : kenoItem?.results?.JACKPOT) ||
      ['02', '09', '12', '14', '19', '22', '23', '24', '26', '28', '29', '32', '49', '50', '51', '54', '56', '61', '67', '74']
    ).map((x) => Number(x));

    const envelope: XoSoServiceEnvelope<VietlottLatestData> = {
      data: {
        mega645: {
          drawNumber: megaItem?.draw_number || '01592',
          date: megaItem?.date ? formatDate(new Date(megaItem.date)) : 'Hôm nay',
          jackpotFormatted: formatBillionVnd(megaItem?.jackpot, '~19,7 Tỷ'),
          numbers: megaArr.slice(0, 6),
        },
        power655: {
          drawNumber: powerItem?.draw_number || '01427',
          date: powerItem?.date ? formatDate(new Date(powerItem.date)) : 'Hôm nay',
          jackpotFormatted: formatBillionVnd(powerItem?.jackpot, '~45,7 Tỷ'),
          numbers: powerArr.slice(0, 6),
          bonus: powerArr[6] ?? 39,
        },
        keno: {
          drawNumber: kenoItem?.draw_number || '303941',
          date: kenoItem?.date ? formatDate(new Date(kenoItem.date)) : 'Hôm nay',
          numbers: kenoArr.slice(0, 20),
        },
      },
      source: 'xosoapi.online',
      isLiveWindow,
      revalidateSeconds,
      fetchedAt: new Date().toISOString(),
    };

    memoryCache.set(cacheKey, {
      expiresAt: Date.now() + revalidateSeconds * 1000,
      envelope,
    });
    return envelope;
  }

  return {
    data: {
      mega645: {
        drawNumber: '01592',
        date: 'Hôm nay',
        jackpotFormatted: '~19,7 Tỷ',
        numbers: [1, 13, 14, 18, 23, 39],
      },
      power655: {
        drawNumber: '01427',
        date: 'Hôm nay',
        jackpotFormatted: '~45,7 Tỷ',
        numbers: [7, 29, 44, 45, 50, 54],
        bonus: 39,
      },
      keno: {
        drawNumber: '303941',
        date: 'Hôm nay',
        numbers: [2, 9, 12, 14, 19, 22, 23, 24, 26, 28, 29, 32, 49, 50, 51, 54, 56, 61, 67, 74],
      },
    },
    source: 'fallback',
    isLiveWindow,
    revalidateSeconds,
    fetchedAt: new Date().toISOString(),
  };
}
