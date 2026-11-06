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
