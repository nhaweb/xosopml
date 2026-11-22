export interface OnlineTicket {
  id: string;
  ticketNumber: string; // 6 chữ số, ví dụ "584968"
  provinceId: string;
  provinceName: string;
  region: 'south' | 'central' | 'north';
  drawDate: string; // "2026-11-22"
  drawTime: string; // "16:15"
  price: number; // 10000 VNĐ
  remainingQuantity: number; // Còn bao nhiêu vé
  batchType: 'single' | 'pair' | 'block10'; // Vé đơn, Cặp nguyên, Lốc 10 vé
  tags: string[]; // ["Lộc Phát", "Thần Tài", "Số Đẹp", "Đuôi 68"]
  imageUrl: string;
}

export const mockOnlineTickets: OnlineTicket[] = [
  {
    id: 't-001',
    ticketNumber: '839268',
    provinceId: 'tp-hcm',
    provinceName: 'TP. Hồ Chí Minh',
    region: 'south',
    drawDate: '2026-11-22',
    drawTime: '16:15',
    price: 10000,
    remainingQuantity: 5,
    batchType: 'pair',
    tags: ['Lộc Phát 68', 'TP.HCM', 'Đài Chính'],
    imageUrl: '/images/ticket-sample-1.jpg',
  },
  {
    id: 't-002',
    ticketNumber: '194779',
    provinceId: 'dong-thap',
    provinceName: 'Đồng Tháp',
    region: 'south',
    drawDate: '2026-11-22',
    drawTime: '16:15',
    price: 10000,
    remainingQuantity: 10,
    batchType: 'block10',
    tags: ['Thần Tài Lớn 79', 'Lốc 10 vé', 'Dễ trúng'],
    imageUrl: '/images/ticket-sample-2.jpg',
  },
  {
    id: 't-003',
    ticketNumber: '426839',
    provinceId: 'ca-mau',
    provinceName: 'Cà Mau',
    region: 'south',
    drawDate: '2026-11-22',
    drawTime: '16:15',
    price: 10000,
    remainingQuantity: 4,
    batchType: 'pair',
    tags: ['Thần Tài Nhỏ 39', 'Miền Nam'],
    imageUrl: '/images/ticket-sample-1.jpg',
  },
  {
    id: 't-004',
    ticketNumber: '928888',
    provinceId: 'hue',
    provinceName: 'Thừa Thiên Huế',
    region: 'central',
    drawDate: '2026-11-22',
    drawTime: '17:15',
    price: 10000,
    remainingQuantity: 2,
    batchType: 'single',
    tags: ['Tứ Quý 8888', 'Siêu Đẹp', 'Miền Trung'],
    imageUrl: '/images/ticket-sample-2.jpg',
  },
  {
    id: 't-005',
    ticketNumber: '673979',
    provinceId: 'phu-yen',
    provinceName: 'Phú Yên',
    region: 'central',
    drawDate: '2026-11-22',
    drawTime: '17:15',
    price: 10000,
    remainingQuantity: 6,
    batchType: 'pair',
    tags: ['Cặp Thần Tài 39-79', 'Phú Yên'],
    imageUrl: '/images/ticket-sample-1.jpg',
  },
  {
    id: 't-006',
    ticketNumber: '542686',
    provinceId: 'ha-noi',
    provinceName: 'Hà Nội (Miền Bắc)',
    region: 'north',
    drawDate: '2026-11-22',
    drawTime: '18:15',
    price: 10000,
    remainingQuantity: 10,
    batchType: 'block10',
    tags: ['Phát Lộc 86', 'XSMB', 'Lốc 10'],
    imageUrl: '/images/ticket-sample-2.jpg',
  },
  {
    id: 't-007',
    ticketNumber: '315899',
    provinceId: 'ha-noi',
    provinceName: 'Hà Nội (Miền Bắc)',
    region: 'north',
    drawDate: '2026-11-22',
    drawTime: '18:15',
    price: 10000,
    remainingQuantity: 3,
    batchType: 'single',
    tags: ['Đuôi Kép 99', 'Trường Cửu'],
    imageUrl: '/images/ticket-sample-1.jpg',
  },
  {
    id: 't-008',
    ticketNumber: '702345',
    provinceId: 'tp-hcm',
    provinceName: 'TP. Hồ Chí Minh',
    region: 'south',
    drawDate: '2026-11-22',
    drawTime: '16:15',
    price: 10000,
    remainingQuantity: 8,
    batchType: 'pair',
    tags: ['Sảnh Tiến 2345', 'TP.HCM'],
    imageUrl: '/images/ticket-sample-2.jpg',
  },
];

