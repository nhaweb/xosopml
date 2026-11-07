export type Region = 'south' | 'central' | 'north';

export interface ProvinceInfo {
  id: string;             // 'tphcm', 'dong-nai', 'ha-noi'
  name: string;           // 'TP.HCM', 'Đồng Nai', 'Hà Nội'
  code: string;           // 'HCM', 'DNA', 'MB'
  region: Region;
  drawDays: number[];     // 0: CN, 1: T2, ..., 6: T7
  drawTime: string;       // '16:15', '17:15', '18:15'
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
}

export interface PrizeRow {
  prizeName: string;      // 'G.ĐB', 'G.Nhất', ..., 'G.Tám'
  prizeOrder: number;
  rewardAmount?: string;  // '2 Tỷ', '30 Triệu', '100 Nghìn'
  numbers: string[];      // mảng các số trúng (vd: ['123456'] hoặc 7 chuỗi cho G4)
}

export interface ProvinceDrawResult {
  provinceId: string;
  provinceName: string;
  provinceCode: string;
  drawDate: string;       // YYYY-MM-DD
  prizes: PrizeRow[];
}

export interface LotoHeadTail {
  head: Record<number, number[]>; // Đầu 0 -> [2, 5], Đầu 1 -> [0, 9]...
  tail: Record<number, number[]>; // Đuôi 0 -> [1, 4], Đuôi 1 -> [2]...
}

export interface DayLotteryData {
  date: string;
  formattedDate: string;
  lunarDate?: string;
  south: ProvinceDrawResult[];
  central: ProvinceDrawResult[];
  north: ProvinceDrawResult[];
}

export interface DreamEntry {
  id: string;
  keyword: string;
  numbers: string[];
  meaning?: string;
}

export interface LoGanItem {
  number: string;
  daysUnopened: number;
  lastDate: string;
  maxGanHistory: number;
}
