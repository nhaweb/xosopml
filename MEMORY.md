# MEMORY.md — BỘ NHỚ DỰ ÁN XỔ SỐ MINH NGỌC (xosopml)

> **Mục đích**: Tài liệu lưu trữ ngữ cảnh vĩnh viễn cho **Antigravity**, **Cursor** và lập trình viên. Đọc file này khi bắt đầu phiên làm việc để nắm toàn bộ tiến độ, kiến trúc và quy ước code.

---

## 1. Thông Tin Chung Dự Án
- **Tên dự án**: XSKT Minh Ngọc Clone (`xosopml`)
- **Repository**: `https://github.com/nhaweb/xosopml.git` (Nhánh: `main`)
- **Tech Stack**:
  - **Framework**: Next.js 16.4.3 (App Router)
  - **Compiler**: Webpack mode (`next build --webpack` — tối ưu chạy ổn định trên Windows)
  - **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`) + Lucide Icons + Theme Dark/Light
  - **UI Primitives**: Base UI (`@base-ui/react`), Class Variance Authority (`cva`)
  - **Audio**: Web Audio API Synthesizer (Native, zero-dependency, 100% offline)

---

## 2. Bản Đồ Thư Mục & Các Tuyến Đường (Routes)

```
d:\xosopml\
├── app/
│   ├── page.tsx                       # [Trang Chủ] Bảng KQXS 3 Miền, Lô Tô Đầu-Đuôi, Dò vé số, Chuông live, Vietlott
│   ├── layout.tsx                     # Layout dùng chung, cấu hình SEO title/description
│   ├── globals.css                    # Tailwind v4, biến màu theme, @media print cho in vé dò A4
│   ├── (tools)/
│   │   ├── quay-thu/page.tsx          # [Quay Thử] Tiện ích quay thử cầu may, hiệu ứng quay số & âm thanh
│   │   ├── so-mo/page.tsx             # [Sổ Mơ] Tra cứu giải mã giấc mơ, tìm kiếm tức thì, lọc A-Z
│   │   └── thong-ke/lo-gan/page.tsx   # [Lô Gan] Thống kê 100 cặp số 00-99 theo số ngày chưa về, cảnh báo đỏ > 15 ngày
│   └── (lottery)/
│       ├── ngay/[date]/page.tsx       # [Xem Ngày] Tra cứu theo ngày bất kỳ (vd: /ngay/20261107)
│       └── [region]/[province]/page.tsx # [Chi Tiết Đài] Lịch sử các kỳ và lịch mở thưởng của riêng tỉnh đó
├── components/
│   ├── lottery/
│   │   ├── region-lottery-board.tsx   # Bảng hiển thị đa đài song song + tích hợp bảng lô tô đầu đuôi
│   │   ├── loto-head-tail-table.tsx   # Bảng Lô Tô Đầu - Đuôi (0-9) theo từng đài chuẩn Minh Ngọc
│   │   ├── prize-cell.tsx             # Ô số trúng thưởng, màu đỏ cho G.ĐB, highlight chữ số chạm
│   │   ├── digit-filter-bar.tsx       # Thanh công cụ: Đủ số / 2 số cuối / 3 số cuối / Tô màu chữ số 0-9
│   │   ├── ticket-checker-modal.tsx   # Modal Dò vé số thông minh với âm thanh fanfare
│   │   └── vietlott-keno-widget.tsx   # Khối Vietlott Mega 6/45, Power 6/55 và Keno 20 số
│   └── site/
│       └── site-frame.tsx             # Frame layout đồng bộ Header/Footer cho các trang con
├── config/
│   ├── lottery-provinces.ts           # Danh mục 63 tỉnh/thành, miền (south, central, north) và lịch mở thưởng
│   └── site.ts                        # Metadata cấu hình tên trang, disclaimer, lịch quay thưởng
└── lib/
    ├── mock-lottery-data.ts           # Sinh dữ liệu mẫu chuẩn cơ cấu giải 18 giải (Nam/Trung) & 27 giải (Bắc)
    ├── loto-calculator.ts             # Thuật toán trích xuất 2 số cuối vào mảng Đầu (0-9) và Đuôi (0-9)
    ├── ticket-checker.ts              # Thuật toán đối chiếu vé: G.Đặc biệt, Phụ ĐB, Khuyến Khích, G1-G8
    ├── audio-synthesizer.ts           # Trình tạo âm thanh chuông báo và thắng giải qua Web Audio API
    ├── mock-dream-data.ts             # Dữ liệu sổ mơ giải mộng tiếng Việt (~50 mục phổ biến)
    ├── stats-calculator.ts            # Thuật toán tính toán số ngày chưa về của 100 cặp số
    └── lottery-date.ts                # Tiện ích định dạng ngày tháng tiếng Việt
```

---

## 3. Các Nghiệp Vụ XSKT Cốt Lõi Đã Xây Dựng

1. **Khung Giờ Mở Thưởng & Cơ Cấu Giải**:
   - **XSMN (16h15)**: 3-4 đài/ngày, cơ cấu 18 giải (Giải 8 đến Giải Đặc Biệt 6 chữ số).
   - **XSMT (17h15)**: 2-3 đài/ngày, cơ cấu 18 giải tương tự Miền Nam.
   - **XSMB (18h15)**: 1 đài quay chung, cơ cấu 27 giải (Giải 7 đến Giải Đặc Biệt 5 chữ số).

2. **Bảng Lô Tô Đầu - Đuôi (0 - 9)**:
   - Trích xuất 2 số cuối của toàn bộ các giải thưởng.
   - Tự động gom nhóm theo **Đầu** (chữ số hàng chục) và **Đuôi** (chữ số hàng đơn vị) cho từng đài.
   - Cho phép chuyển đổi linh hoạt: *Theo Đầu* hoặc *Theo Đuôi*.

3. **Bộ Dò Vé Số Nhanh (Smart Ticket Checker)**:
   - Hỗ trợ dò 6 chữ số: Tự động so khớp với kết quả đài được chọn.
   - Nhận diện đúng Giải Đặc Biệt, Giải Phụ Đặc Biệt (50 triệu), Giải Khuyến Khích (6 triệu), và các giải từ 1 đến 8.
   - Tự động kích hoạt chuông mừng chiến thắng khi vé trúng.

4. **Hệ Thống Âm Thanh Web Audio API**:
   - Hoạt động offline 100%, không cần file mp3:
     - `playDrawChime()`: Âm chuông "ting ting" khi bóng số mới về.
     - `playWinFanfare()`: Hợp âm rộn rã khi trúng số.
   - Có nút bật/tắt âm thanh trên Header.

5. **In Vé Dò Chuẩn Đại Lý (Print-Ready)**:
   - Tích hợp `@media print` trong `globals.css`: Tự động ẩn menu, nút bấm, header/footer; định dạng bảng đen trắng chuẩn A4.

---

## 4. Quy Tắc Kỹ Thuật Bắt Buộc (Engineering Rules)

1. **Next.js Build trên Windows**:
   - Phải luôn chạy `next build --webpack` (hoặc `npm run build`), **không** dùng Turbopack mặc định vì lỗi xung đột tiến trình PostCSS trên môi trường sandbox Windows.
2. **Không chỉnh sửa đè chéo**:
   - Antigravity phụ trách phần Core Trang Chủ, Bảng KQXS và Lô tô.
   - Cursor phụ trách các tính năng mở rộng (`(tools)` và `(lottery)` dynamic routes).
   - Tất cả đều kế thừa types từ `types/lottery.ts`.
3. **Giữ nguyên định dạng Monospace**:
   - Mọi dãy số xổ số phải dùng class `font-mono tabular-nums` để các chữ số thẳng hàng tuyệt đối.



---

## 5. Nhật Ký Tiến Độ & Trạng Thái (Work Log)

| Thời gian | Tác nhân | Nội dung công việc đã hoàn thành | Ghi chú / Trạng thái |
| :--- | :---: | :--- | :--- |
| **07/11/2026** | **Antigravity** | Tạo core types (`types/lottery.ts`), lịch quay 63 đài (`config/lottery-provinces.ts`), helper tính lô tô đầu đuôi (`lib/loto-calculator.ts`). | Hoàn thành |
| **07/11/2026** | **Antigravity** | Xây dựng Bảng kết quả 3 miền Minh Ngọc (`region-lottery-board.tsx`), bộ lọc 2/3 số & tô số (`digit-filter-bar.tsx`), bảng Lô tô Đầu - Đuôi (`loto-head-tail-table.tsx`). | Hoàn thành |
| **07/11/2026** | **Cursor** | Xây dựng Sổ mơ lô đề (`/so-mo`), Thống kê Lô gan (`/thong-ke/lo-gan`), Tra cứu theo ngày (`/ngay/[date]`), Chi tiết đài (`/[region]/[province]`). | Hoàn thành |
| **07/11/2026** | **Antigravity** | Tích hợp Bộ Dò Vé Số Nhanh (`ticket-checker-modal.tsx`), Chuông báo Web Audio (`audio-synthesizer.ts`), Khối Vietlott/Keno (`vietlott-keno-widget.tsx`). | Hoàn thành |
| **07/11/2026** | **Antigravity** | Xây dựng Tiện ích Quay Thử Xổ Số (`/quay-thu`) với hiệu ứng số nhảy & âm thanh chuông báo; Thêm CSS `@media print` cho bản in vé dò A4. | Hoàn thành |
| **07/11/2026** | **Antigravity** | Thiết lập file bộ nhớ vĩnh viễn `MEMORY.md` và file tự động định tuyến `.cursorrules` cho Cursor. | Hoàn thành |
| **07/11/2026** | **Antigravity** | Xây dựng Bảng Đếm Ngược Trực Tiếp Live (`live-countdown-banner.tsx`) với đồng hồ đếm ngược đến 16:15, 17:15, 18:15. | Hoàn thành |
| **07/11/2026** | **Antigravity** | Xây dựng Ma Trận Lịch Mở Thưởng 3 Miền Trong Tuần (`weekly-schedule-matrix.tsx`), highlight ngày hôm nay. | Hoàn thành |
| **07/11/2026** | **Antigravity** | Xây dựng Trang Sớ Đầu Đuôi (`/so-dau-duoi`) thống kê 2 số cuối Giải Đặc Biệt và Giải 8 qua 14 ngày. | Hoàn thành |
| **07/11/2026** | **Antigravity** | Xây dựng Trang In Vé Dò Chuyên Nghiệp (`/in-ve-do`) chuẩn giấy A4 cho đại lý bán vé số. | Hoàn thành |
| **07/11/2026** | **Antigravity** | Xây dựng Thanh Cuộn Nhanh 63 Đài Tỉnh (`province-quick-strip.tsx`) phân loại 3 miền & gắn nhãn hôm nay. | Hoàn thành |
| **07/11/2026** | **Antigravity** | Xây dựng Thanh Dò Vé Nhanh Tại Chỗ (`quick-ticket-checker-bar.tsx`) ngay trên trang chủ. | Hoàn thành |
| **07/11/2026** | **Antigravity** | Xây dựng Trang Thống Kê Tần Suất Lô Tô 30 kỳ (`/thong-ke/tan-suat`): Top Hot, Top Cold, Ma trận 100 số. | Hoàn thành |
| **07/11/2026** | **Antigravity** | Xây dựng Trang Bảng Đặc Biệt Năm/Tháng (`/thong-ke/giai-dac-biet`): Ma trận 31 ngày x 12 tháng, highlight số kép. | Hoàn thành |
