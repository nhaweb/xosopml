/** Nhận `dd-mm-yyyy` hoặc `yyyy-mm-dd`, trả về ngày local hợp lệ. */
export function parseLotteryDate(raw: string): Date | null {
  const value = decodeURIComponent(raw).trim();

  const dmy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
  if (dmy) return buildDate(Number(dmy[3]), Number(dmy[2]), Number(dmy[1]));

  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (ymd) return buildDate(Number(ymd[1]), Number(ymd[2]), Number(ymd[3]));

  return null;
}

function buildDate(year: number, month: number, day: number): Date | null {
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

export function toRouteDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()}`;
}

export function formatIsoDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  return `${match[3]}/${match[2]}/${match[1]}`;
}
