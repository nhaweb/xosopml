import { PROVINCES } from '@/config/lottery-provinces';
import { getLotteryResults } from '@/lib/mock-lottery-data';
import { LoGanItem, ProvinceDrawResult, Region } from '@/types/lottery';

const MS_PER_DAY = 86_400_000;

function atNoon(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(12, 0, 0, 0);
  return copy;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysBetween(later: Date, earlier: Date): number {
  return Math.round((atNoon(later).getTime() - atNoon(earlier).getTime()) / MS_PER_DAY);
}

function collectLastTwo(result: ProvinceDrawResult): Set<string> {
  const found = new Set<string>();
  for (const prize of result.prizes) {
    for (const raw of prize.numbers) {
      const clean = raw.trim();
      if (clean.length >= 2) found.add(clean.slice(-2));
    }
  }
  return found;
}

function findDraw(date: Date, provinceId: string, region: Region): ProvinceDrawResult | undefined {
  const day = getLotteryResults(date);
  return day[region].find((item) => item.provinceId === provinceId);
}

/**
 * Quét kết quả mock lùi `lookbackDays` ngày, lấy 2 số cuối mọi giải
 * của một đài rồi tính số ngày chưa về của từng cặp 00–99.
 */
export function calculateLoGan(
  provinceId: string,
  asOf: Date = new Date(),
  lookbackDays = 120,
): LoGanItem[] {
  const province = PROVINCES.find((item) => item.id === provinceId);
  if (!province) return [];

  const end = atNoon(asOf);
  const appearances = new Map<string, Date[]>();
  for (let value = 0; value <= 99; value += 1) {
    appearances.set(String(value).padStart(2, '0'), []);
  }

  for (let offset = lookbackDays; offset >= 0; offset -= 1) {
    const date = new Date(end);
    date.setDate(end.getDate() - offset);
    if (!province.drawDays.includes(date.getDay())) continue;

    const draw = findDraw(date, province.id, province.region);
    if (!draw) continue;

    for (const pair of collectLastTwo(draw)) {
      appearances.get(pair)?.push(new Date(date));
    }
  }

  const items: LoGanItem[] = [];
  for (const [number, dates] of appearances) {
    let maxGanHistory = 0;
    for (let index = 1; index < dates.length; index += 1) {
      maxGanHistory = Math.max(maxGanHistory, daysBetween(dates[index], dates[index - 1]));
    }

    if (dates.length === 0) {
      items.push({
        number,
        daysUnopened: lookbackDays,
        lastDate: '',
        maxGanHistory: Math.max(maxGanHistory, lookbackDays),
      });
      continue;
    }

    const lastSeen = dates[dates.length - 1];
    const daysUnopened = daysBetween(end, lastSeen);
    items.push({
      number,
      daysUnopened,
      lastDate: toIsoDate(lastSeen),
      maxGanHistory: Math.max(maxGanHistory, daysUnopened),
    });
  }

  return items.sort((a, b) => b.daysUnopened - a.daysUnopened || a.number.localeCompare(b.number));
}

export function countHotGan(items: LoGanItem[], threshold = 15): number {
  return items.filter((item) => item.daysUnopened > threshold).length;
}
