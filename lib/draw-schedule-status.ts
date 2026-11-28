import { Region } from '@/types/lottery';

export type DrawPhaseStatus = 'waiting' | 'upcoming' | 'live' | 'done';

export interface VietnamClockInfo {
  isoDate: string; // YYYY-MM-DD
  hour: number;
  minute: number;
  second: number;
  totalMinutes: number;
  dayOfWeek: number; // 0 = CN, 1 = T2 ... 6 = T7
}

/**
 * Lấy thời gian hiện tại theo múi giờ Việt Nam (Asia/Ho_Chi_Minh, UTC+7)
 * nhất quán giữa Client và Server để tránh lệch hydration hoặc sai múi giờ.
 */
export function getVietnamClock(date: Date = new Date()): VietnamClockInfo {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      weekday: 'short',
    });
    const parts = formatter.formatToParts(date);
    const get = (type: string) => parts.find((p) => p.type === type)?.value || '00';
    const year = get('year');
    const month = get('month');
    const day = get('day');
    const hour = parseInt(get('hour'), 10) % 24;
    const minute = parseInt(get('minute'), 10);
    const second = parseInt(get('second'), 10);
    const weekdayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    const dayOfWeek = weekdayMap[get('weekday')] ?? date.getDay();

    return {
      isoDate: `${year}-${month}-${day}`,
      hour,
      minute,
      second,
      totalMinutes: hour * 60 + minute,
      dayOfWeek,
    };
  } catch {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hour = date.getHours();
    const minute = date.getMinutes();
    return {
      isoDate: `${y}-${m}-${d}`,
      hour,
      minute,
      second: date.getSeconds(),
      totalMinutes: hour * 60 + minute,
      dayOfWeek: date.getDay(),
    };
  }
}

export function dateToIsoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const REGION_DRAW_WINDOWS: Record<
  Region | 'vietlott',
  {
    label: string;
    drawTimeLabel: string;
    upcomingStartMin: number; // Cận giờ mở thưởng (trước 5-10 phút)
    liveStartMin: number; // Bắt đầu quay
    liveEndMin: number; // Quay xong toàn bộ giải
  }
> = {
  south: {
    label: 'Miền Nam',
    drawTimeLabel: '16:15',
    upcomingStartMin: 16 * 60 + 5, // 16:05 (trước 10 phút)
    liveStartMin: 16 * 60 + 15, // 16:15
    liveEndMin: 16 * 60 + 40, // 16:40
  },
  central: {
    label: 'Miền Trung',
    drawTimeLabel: '17:15',
    upcomingStartMin: 17 * 60 + 5, // 17:05
    liveStartMin: 17 * 60 + 15, // 17:15
    liveEndMin: 17 * 60 + 40, // 17:40
  },
  north: {
    label: 'Miền Bắc',
    drawTimeLabel: '18:15',
    upcomingStartMin: 18 * 60 + 5, // 18:05
    liveStartMin: 18 * 60 + 15, // 18:15
    liveEndMin: 18 * 60 + 35, // 18:35
  },
  vietlott: {
    label: 'Vietlott',
    drawTimeLabel: '18:00',
    upcomingStartMin: 17 * 60 + 50, // 17:50
    liveStartMin: 18 * 60, // 18:00
    liveEndMin: 18 * 60 + 30, // 18:30
  },
};

/**
 * Xác định trạng thái quay số của 1 miền đối với ngày đang xem:
 * - 'waiting': Chờ (trước khung cận giờ mở thưởng)
 * - 'upcoming': Cận giờ mở thưởng (trước giờ quay 5-10 phút) -> hiện lịch mở thưởng + spinner xoay
 * - 'live': Đang sổ (trong giờ quay thưởng)
 * - 'done': Mới (đã quay xong toàn bộ giải hoặc xem ngày quá khứ)
 */
export function getRegionDrawStatus(
  region: Region | 'vietlott',
  targetDate: Date,
  now: Date = new Date()
): DrawPhaseStatus {
  const vnNow = getVietnamClock(now);
  const targetIso = dateToIsoLocal(targetDate);

  if (targetIso < vnNow.isoDate) {
    return 'done';
  }
  if (targetIso > vnNow.isoDate) {
    return 'waiting';
  }

  const win = REGION_DRAW_WINDOWS[region];
  if (vnNow.totalMinutes < win.upcomingStartMin) {
    return 'waiting';
  }
  if (vnNow.totalMinutes < win.liveStartMin) {
    return 'upcoming';
  }
  if (vnNow.totalMinutes <= win.liveEndMin) {
    return 'live';
  }
  return 'done';
}

/**
 * Chuẩn hóa nhãn 3 trạng thái hiển thị cho người dùng:
 * - Trước giờ quay: "Chờ"
 * - Đang quay số: "Đang sổ"
 * - Quay xong toàn bộ giải: "Mới"
 */
export function getDisplayStatusBadge(status: DrawPhaseStatus): {
  label: 'Chờ' | 'Đang sổ' | 'Mới';
  tone: 'waiting' | 'live' | 'done';
} {
  if (status === 'live') {
    return { label: 'Đang sổ', tone: 'live' };
  }
  if (status === 'done') {
    return { label: 'Mới', tone: 'done' };
  }
  return { label: 'Chờ', tone: 'waiting' };
}

/**
 * Kiểm tra xem có miền nào đang trong khung cận giờ hoặc đang quay trực tiếp không
 * để bật cơ chế polling giảm độ trễ.
 */
export function isAnyRegionLiveOrUpcoming(now: Date = new Date()): boolean {
  const vn = getVietnamClock(now);
  // 16:05 (965m) -> 18:45 (1125m)
  return vn.totalMinutes >= 965 && vn.totalMinutes <= 1125;
}

/**
 * Xác định ngày mở thưởng XSMN sớm nhất hợp lệ để đăng vé lên kho bán online (theo giờ VN):
 * - Trước 16:15: Ngày hôm nay
 * - Từ 16:15 trở đi (đã tới/qua giờ mở thưởng XSMN): Tự động nhảy sang Ngày mai
 */
export function getEarliestValidSouthDrawDate(now: Date = new Date()): {
  minDrawDate: string; // YYYY-MM-DD
  isPastTodayCutoff: boolean;
} {
  const vn = getVietnamClock(now);
  const cutoffMinutes = REGION_DRAW_WINDOWS.south.liveStartMin; // 16:15 = 975 phút
  const isPastTodayCutoff = vn.totalMinutes >= cutoffMinutes;

  if (!isPastTodayCutoff) {
    return {
      minDrawDate: vn.isoDate,
      isPastTodayCutoff: false,
    };
  }

  const [y, m, d] = vn.isoDate.split('-').map(Number);
  const tomorrow = new Date(Date.UTC(y, m - 1, d + 1, 12, 0, 0));
  const minDrawDate = `${tomorrow.getUTCFullYear()}-${String(tomorrow.getUTCMonth() + 1).padStart(
    2,
    '0'
  )}-${String(tomorrow.getUTCDate()).padStart(2, '0')}`;

  return {
    minDrawDate,
    isPastTodayCutoff: true,
  };
}

