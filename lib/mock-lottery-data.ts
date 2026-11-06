import { DayLotteryData, ProvinceDrawResult, PrizeRow } from '@/types/lottery';
import { getProvincesByDay } from '@/config/lottery-provinces';
import { formatDate } from '@/lib/format';

// Thuật toán Pseudo-random ổn định dựa trên seed ngày
function pseudoRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateDigits(rng: () => number, length: number): string {
  let res = '';
  for (let i = 0; i < length; i++) {
    res += Math.floor(rng() * 10).toString();
  }
  return res;
}

// Sinh giải Miền Nam / Miền Trung (18 giải)
function generateSouthCentralPrizes(seed: number): PrizeRow[] {
  const rng = pseudoRandom(seed);
  return [
    { prizeName: 'G.Tám', prizeOrder: 1, rewardAmount: '100.000 đ', numbers: [generateDigits(rng, 2)] },
    { prizeName: 'G.Bảy', prizeOrder: 2, rewardAmount: '200.000 đ', numbers: [generateDigits(rng, 3)] },
    { prizeName: 'G.Sáu', prizeOrder: 3, rewardAmount: '400.000 đ', numbers: [generateDigits(rng, 4), generateDigits(rng, 4), generateDigits(rng, 4)] },
    { prizeName: 'G.Năm', prizeOrder: 4, rewardAmount: '1.000.000 đ', numbers: [generateDigits(rng, 4)] },
    { 
      prizeName: 'G.Tư', 
      prizeOrder: 5, 
      rewardAmount: '3.000.000 đ', 
      numbers: [
        generateDigits(rng, 5), generateDigits(rng, 5), generateDigits(rng, 5),
        generateDigits(rng, 5), generateDigits(rng, 5), generateDigits(rng, 5),
        generateDigits(rng, 5)
      ] 
    },
    { prizeName: 'G.Ba', prizeOrder: 6, rewardAmount: '10.000.000 đ', numbers: [generateDigits(rng, 5), generateDigits(rng, 5)] },
    { prizeName: 'G.Nhì', prizeOrder: 7, rewardAmount: '15.000.000 đ', numbers: [generateDigits(rng, 5)] },
    { prizeName: 'G.Nhất', prizeOrder: 8, rewardAmount: '30.000.000 đ', numbers: [generateDigits(rng, 5)] },
    { prizeName: 'G.Đặc Biệt', prizeOrder: 9, rewardAmount: '2 Tỷ đ', numbers: [generateDigits(rng, 6)] },
  ];
}

// Sinh giải Miền Bắc (27 giải)
function generateNorthPrizes(seed: number): PrizeRow[] {
  const rng = pseudoRandom(seed);
  return [
    { prizeName: 'G.Đặc Biệt', prizeOrder: 1, rewardAmount: '1 Tỷ đ', numbers: [generateDigits(rng, 5)] },
    { prizeName: 'G.Nhất', prizeOrder: 2, rewardAmount: '10.000.000 đ', numbers: [generateDigits(rng, 5)] },
    { prizeName: 'G.Nhì', prizeOrder: 3, rewardAmount: '5.000.000 đ', numbers: [generateDigits(rng, 5), generateDigits(rng, 5)] },
    { 
      prizeName: 'G.Ba', 
      prizeOrder: 4, 
      rewardAmount: '1.000.000 đ', 
      numbers: [
        generateDigits(rng, 5), generateDigits(rng, 5), generateDigits(rng, 5),
        generateDigits(rng, 5), generateDigits(rng, 5), generateDigits(rng, 5)
      ] 
    },
    { 
      prizeName: 'G.Tư', 
      prizeOrder: 5, 
      rewardAmount: '400.000 đ', 
      numbers: [generateDigits(rng, 4), generateDigits(rng, 4), generateDigits(rng, 4), generateDigits(rng, 4)] 
    },
    { 
      prizeName: 'G.Năm', 
      prizeOrder: 6, 
      rewardAmount: '200.000 đ', 
      numbers: [
        generateDigits(rng, 4), generateDigits(rng, 4), generateDigits(rng, 4),
        generateDigits(rng, 4), generateDigits(rng, 4), generateDigits(rng, 4)
      ] 
    },
    { 
      prizeName: 'G.Sáu', 
      prizeOrder: 7, 
      rewardAmount: '100.000 đ', 
      numbers: [generateDigits(rng, 3), generateDigits(rng, 3), generateDigits(rng, 3)] 
    },
    { 
      prizeName: 'G.Bảy', 
      prizeOrder: 8, 
      rewardAmount: '40.000 đ', 
      numbers: [generateDigits(rng, 2), generateDigits(rng, 2), generateDigits(rng, 2), generateDigits(rng, 2)] 
    },
  ];
}

export function getLotteryResults(date: Date = new Date()): DayLotteryData {
  const dayOfWeek = date.getDay();
  const dateKey = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const baseSeed = parseInt(dateKey, 10);

  // Lấy các tỉnh mở thưởng hôm nay
  const southProvinces = getProvincesByDay(dayOfWeek, 'south');
  const centralProvinces = getProvincesByDay(dayOfWeek, 'central');
  const northProvinces = getProvincesByDay(dayOfWeek, 'north');

  const south: ProvinceDrawResult[] = southProvinces.map((p, idx) => ({
    provinceId: p.id,
    provinceName: p.name,
    provinceCode: p.code,
    drawDate: dateKey,
    prizes: generateSouthCentralPrizes(baseSeed + idx * 100 + 1)
  }));

  const central: ProvinceDrawResult[] = centralProvinces.map((p, idx) => ({
    provinceId: p.id,
    provinceName: p.name,
    provinceCode: p.code,
    drawDate: dateKey,
    prizes: generateSouthCentralPrizes(baseSeed + 500 + idx * 100 + 1)
  }));

  const north: ProvinceDrawResult[] = northProvinces.map((p, idx) => ({
    provinceId: p.id,
    provinceName: p.name,
    provinceCode: p.code,
    drawDate: dateKey,
    prizes: generateNorthPrizes(baseSeed + 900 + idx * 100 + 1)
  }));

  return {
    date: dateKey,
    formattedDate: formatDate(date),
    south,
    central,
    north,
  };
}
