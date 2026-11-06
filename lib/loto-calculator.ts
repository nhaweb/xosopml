import { ProvinceDrawResult, LotoHeadTail } from '@/types/lottery';

/**
 * Trích xuất 2 số cuối của toàn bộ các giải và phân loại vào Đầu (0-9) và Đuôi (0-9)
 */
export function calculateLotoHeadTail(result: ProvinceDrawResult): LotoHeadTail {
  const head: Record<number, number[]> = {};
  const tail: Record<number, number[]> = {};

  for (let i = 0; i <= 9; i++) {
    head[i] = [];
    tail[i] = [];
  }

  result.prizes.forEach((prize) => {
    prize.numbers.forEach((numStr) => {
      const clean = numStr.trim();
      if (clean && clean.length >= 2) {
        const lastTwo = clean.slice(-2);
        const h = parseInt(lastTwo[0], 10);
        const t = parseInt(lastTwo[1], 10);

        if (!isNaN(h) && !isNaN(t)) {
          head[h].push(t);
          tail[t].push(h);
        }
      }
    });
  });

  // Sắp xếp các chữ số tăng dần
  for (let i = 0; i <= 9; i++) {
    head[i].sort((a, b) => a - b);
    tail[i].sort((a, b) => a - b);
  }

  return { head, tail };
}

/**
 * Cắt hiển thị số theo chế độ: Đủ số, 2 số cuối, 3 số cuối
 */
export function formatPrizeNumber(numberStr: string, mode: 'full' | 'last2' | 'last3'): string {
  if (!numberStr) return '';
  if (mode === 'last2') {
    return numberStr.length >= 2 ? numberStr.slice(-2) : numberStr;
  }
  if (mode === 'last3') {
    return numberStr.length >= 3 ? numberStr.slice(-3) : numberStr;
  }
  return numberStr;
}
