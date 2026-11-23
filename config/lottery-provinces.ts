import { ProvinceInfo } from '@/types/lottery';

export const PROVINCES: ProvinceInfo[] = [
  // Miền Nam (16:15)
  { id: 'tphcm', name: 'TP.HCM', code: 'HCM', region: 'south', drawDays: [1, 6], drawTime: '16:15' },
  { id: 'dong-thap', name: 'Đồng Tháp', code: 'DT', region: 'south', drawDays: [1], drawTime: '16:15' },
  { id: 'ca-mau', name: 'Cà Mau', code: 'CM', region: 'south', drawDays: [1], drawTime: '16:15' },
  { id: 'ben-tre', name: 'Bến Tre', code: 'BT', region: 'south', drawDays: [2], drawTime: '16:15' },
  { id: 'vung-tau', name: 'Vũng Tàu', code: 'VT', region: 'south', drawDays: [2], drawTime: '16:15' },
  { id: 'bac-lieu', name: 'Bạc Liêu', code: 'BL', region: 'south', drawDays: [2], drawTime: '16:15' },
  { id: 'dong-nai', name: 'Đồng Nai', code: 'DN', region: 'south', drawDays: [3], drawTime: '16:15' },
  { id: 'can-tho', name: 'Cần Thơ', code: 'CT', region: 'south', drawDays: [3], drawTime: '16:15' },
  { id: 'soc-trang', name: 'Sóc Trăng', code: 'ST', region: 'south', drawDays: [3], drawTime: '16:15' },
  { id: 'tay-ninh', name: 'Tây Ninh', code: 'TN', region: 'south', drawDays: [4], drawTime: '16:15' },
  { id: 'an-giang', name: 'An Giang', code: 'AG', region: 'south', drawDays: [4], drawTime: '16:15' },
  { id: 'binh-thuan', name: 'Bình Thuận', code: 'BTH', region: 'south', drawDays: [4], drawTime: '16:15' },
  { id: 'vinh-long', name: 'Vĩnh Long', code: 'VL', region: 'south', drawDays: [5], drawTime: '16:15' },
  { id: 'binh-duong', name: 'Bình Dương', code: 'BD', region: 'south', drawDays: [5], drawTime: '16:15' },
  { id: 'tra-vinh', name: 'Trà Vinh', code: 'TV', region: 'south', drawDays: [5], drawTime: '16:15' },
  { id: 'long-an', name: 'Long An', code: 'LA', region: 'south', drawDays: [6], drawTime: '16:15' },
  { id: 'binh-phuoc', name: 'Bình Phước', code: 'BP', region: 'south', drawDays: [6], drawTime: '16:15' },
  { id: 'hau-giang', name: 'Hậu Giang', code: 'HG', region: 'south', drawDays: [6], drawTime: '16:15' },
  { id: 'tien-giang', name: 'Tiền Giang', code: 'TG', region: 'south', drawDays: [0], drawTime: '16:15' },
  { id: 'kien-giang', name: 'Kiên Giang', code: 'KG', region: 'south', drawDays: [0], drawTime: '16:15' },
  { id: 'da-lat', name: 'Đà Lạt', code: 'DL', region: 'south', drawDays: [0], drawTime: '16:15' },

  // Miền Trung (17:15)
  { id: 'thua-thien-hue', name: 'Thừa Thiên Huế', code: 'TTH', region: 'central', drawDays: [1, 0], drawTime: '17:15' },
  { id: 'phu-yen', name: 'Phú Yên', code: 'PY', region: 'central', drawDays: [1], drawTime: '17:15' },
  { id: 'dak-lak', name: 'Đắk Lắk', code: 'DLK', region: 'central', drawDays: [2], drawTime: '17:15' },
  { id: 'quang-nam', name: 'Quảng Nam', code: 'QNM', region: 'central', drawDays: [2], drawTime: '17:15' },
  { id: 'da-nang', name: 'Đà Nẵng', code: 'DNG', region: 'central', drawDays: [3, 6], drawTime: '17:15' },
  { id: 'khanh-hoa', name: 'Khánh Hòa', code: 'KH', region: 'central', drawDays: [3, 0], drawTime: '17:15' },
  { id: 'binh-dinh', name: 'Bình Định', code: 'BDI', region: 'central', drawDays: [4], drawTime: '17:15' },
  { id: 'quang-tri', name: 'Quảng Trị', code: 'QT', region: 'central', drawDays: [4], drawTime: '17:15' },
  { id: 'quang-binh', name: 'Quảng Bình', code: 'QB', region: 'central', drawDays: [4], drawTime: '17:15' },
  { id: 'gia-lai', name: 'Gia Lai', code: 'GL', region: 'central', drawDays: [5], drawTime: '17:15' },
  { id: 'ninh-thuan', name: 'Ninh Thuận', code: 'NT', region: 'central', drawDays: [5], drawTime: '17:15' },
  { id: 'quang-ngai', name: 'Quảng Ngãi', code: 'QNG', region: 'central', drawDays: [6], drawTime: '17:15' },
  { id: 'dak-nong', name: 'Đắk Nông', code: 'DNO', region: 'central', drawDays: [6], drawTime: '17:15' },
  { id: 'kon-tum', name: 'Kon Tum', code: 'KT', region: 'central', drawDays: [0], drawTime: '17:15' },

  // Miền Bắc (18:15)
  { id: 'ha-noi', name: 'Hà Nội', code: 'HN', region: 'north', drawDays: [1, 4], drawTime: '18:15' },
  { id: 'quang-ninh', name: 'Quảng Ninh', code: 'QN', region: 'north', drawDays: [2], drawTime: '18:15' },
  { id: 'bac-ninh', name: 'Bắc Ninh', code: 'BN', region: 'north', drawDays: [3], drawTime: '18:15' },
  { id: 'hai-phong', name: 'Hải Phòng', code: 'HP', region: 'north', drawDays: [5], drawTime: '18:15' },
  { id: 'nam-dinh', name: 'Nam Định', code: 'ND', region: 'north', drawDays: [6], drawTime: '18:15' },
  { id: 'thai-binh', name: 'Thái Bình', code: 'TB', region: 'north', drawDays: [0], drawTime: '18:15' },
];

export function getProvincesByDay(dayOfWeek: number, region?: string) {
  return PROVINCES.filter(p => {
    const matchDay = p.drawDays.includes(dayOfWeek);
    return region ? matchDay && p.region === region : matchDay;
  });
}

/**
 * Bảng ánh xạ chuẩn tên tỉnh/đài -> Mã ký hiệu đài (Miền Nam, Miền Trung, Miền Bắc)
 */
export const PROVINCE_CODE_MAP: Record<string, string> = {
  // Miền Nam (21 đài)
  'TP.HCM': 'HCM',
  'TP. Hồ Chí Minh': 'HCM',
  'Hồ Chí Minh': 'HCM',
  'Đồng Tháp': 'DT',
  'Cà Mau': 'CM',
  'Bến Tre': 'BT',
  'Vũng Tàu': 'VT',
  'Bà Rịa - Vũng Tàu': 'VT',
  'Bạc Liêu': 'BL',
  'Đồng Nai': 'DN',
  'Cần Thơ': 'CT',
  'Sóc Trăng': 'ST',
  'Tây Ninh': 'TN',
  'An Giang': 'AG',
  'Bình Thuận': 'BTH',
  'Vĩnh Long': 'VL',
  'Bình Dương': 'BD',
  'Trà Vinh': 'TV',
  'Long An': 'LA',
  'Bình Phước': 'BP',
  'Hậu Giang': 'HG',
  'Tiền Giang': 'TG',
  'Kiên Giang': 'KG',
  'Đà Lạt': 'DL',
  'Lâm Đồng': 'DL',

  // Miền Trung (14 đài)
  'Thừa Thiên Huế': 'TTH',
  'Thừa T. Huế': 'TTH',
  'Huế': 'TTH',
  'Phú Yên': 'PY',
  'Đắk Lắk': 'DLK',
  'Đắc Lắc': 'DLK',
  'Quảng Nam': 'QNM',
  'Đà Nẵng': 'DNG',
  'Khánh Hòa': 'KH',
  'Khánh Hoà': 'KH',
  'Bình Định': 'BDI',
  'Quảng Trị': 'QT',
  'Quảng Bình': 'QB',
  'Gia Lai': 'GL',
  'Ninh Thuận': 'NT',
  'Quảng Ngãi': 'QNG',
  'Đắk Nông': 'DNO',
  'Đắc Nông': 'DNO',
  'Kon Tum': 'KT',

  // Miền Bắc (6 đài)
  'Hà Nội': 'HN',
  'Quảng Ninh': 'QN',
  'Bắc Ninh': 'BN',
  'Hải Phòng': 'HP',
  'Nam Định': 'ND',
  'Thái Bình': 'TB',
  'Miền Bắc': 'MB',
};

function normalizeProvinceKey(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

const NORMALIZED_PROVINCE_CODE_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const [name, code] of Object.entries(PROVINCE_CODE_MAP)) {
    map[normalizeProvinceKey(name)] = code;
  }
  for (const p of PROVINCES) {
    map[normalizeProvinceKey(p.name)] = p.code;
    map[normalizeProvinceKey(p.id)] = p.code;
  }
  return map;
})();

/**
 * Tự động suy ra mã đài chuẩn từ tên tỉnh/đài (hỗ trợ ghi đè thủ công qua manualOverride).
 */
export function resolveProvinceCode(
  provinceName: string,
  manualOverride?: string,
  provinceId?: string,
  fallbackCode?: string
): string {
  if (manualOverride && manualOverride.trim()) {
    return manualOverride.trim().toUpperCase();
  }

  const direct = PROVINCE_CODE_MAP[provinceName?.trim()];
  if (direct) return direct;

  if (provinceName) {
    const byName = NORMALIZED_PROVINCE_CODE_MAP[normalizeProvinceKey(provinceName)];
    if (byName) return byName;
  }

  if (provinceId) {
    const byId = NORMALIZED_PROVINCE_CODE_MAP[normalizeProvinceKey(provinceId)];
    if (byId) return byId;
  }

  if (fallbackCode && fallbackCode.trim()) {
    // Bỏ tiền tố "XS" nếu dữ liệu API trả về dạng "XSTG", "XSHCM"...
    const cleaned = fallbackCode.trim().toUpperCase();
    return cleaned.startsWith('XS') && cleaned.length > 3 ? cleaned.slice(2) : cleaned;
  }

  return '';
}

const CANONICAL_PROVINCE_ORDER: Record<string, number> = (() => {
  const order: Record<string, number> = {};
  PROVINCES.forEach((p, idx) => {
    order[p.code.toUpperCase()] = idx;
    order[normalizeProvinceKey(p.id)] = idx;
    order[normalizeProvinceKey(p.name)] = idx;
  });
  return order;
})();

/**
 * Sắp xếp danh sách tỉnh/đài theo thứ tự chuẩn (luôn ưu tiên TP.HCM lên vị trí đầu tiên
 * vào Thứ Hai và Thứ Bảy, đồng thời giữ đúng thứ tự chuẩn các đài còn lại).
 */
export function sortProvincesCanonical<
  T extends {
    provinceId?: string;
    provinceName?: string;
    provinceCode?: string;
    id?: string;
    name?: string;
    code?: string;
  }
>(items: T[]): T[] {
  if (!items || items.length <= 1) return items;

  const getRank = (item: T): number => {
    const name = item.provinceName ?? item.name ?? '';
    const id = item.provinceId ?? item.id ?? '';
    const code = resolveProvinceCode(name, undefined, id, item.provinceCode ?? item.code);

    // Ưu tiên tuyệt đối đài TP.HCM lên cột đầu tiên
    if (code === 'HCM' || id === 'tphcm') return -1;

    if (code && CANONICAL_PROVINCE_ORDER[code] !== undefined) {
      return CANONICAL_PROVINCE_ORDER[code];
    }
    if (id) {
      const normId = normalizeProvinceKey(id);
      if (CANONICAL_PROVINCE_ORDER[normId] !== undefined) {
        return CANONICAL_PROVINCE_ORDER[normId];
      }
    }
    if (name) {
      const normName = normalizeProvinceKey(name);
      if (CANONICAL_PROVINCE_ORDER[normName] !== undefined) {
        return CANONICAL_PROVINCE_ORDER[normName];
      }
    }
    return 999;
  };

  return [...items].sort((a, b) => getRank(a) - getRank(b));
}
