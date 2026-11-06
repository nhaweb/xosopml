# XSKT Việt

Cổng tra cứu kết quả xổ số tiếng Việt, hiện dùng lớp dữ liệu mẫu trong `lib/mock-results.ts`.

## Thay dữ liệu mẫu bằng API thật

Giữ nguyên shape `ProvinceResult` và thay `getResultsByDate` bằng hàm gọi API server-side. Không đưa khóa API vào client. Dữ liệu kết quả thực tế cần đến từ nguồn được ủy quyền/chính thức; giao diện và thống kê không phải nguồn xác nhận trúng thưởng.

## Rebrand

Chỉnh tên, mô tả và URL trong `config/site.ts`, metadata trong `app/layout.tsx`, sau đó cập nhật các CSS variables trong `app/globals.css`.

## Route map

- `/`, `/xsmn`, `/xsmt`, `/xsmb`: trang chủ và kết quả theo miền
- `/thong-ke`, `/giai-ma-bo-so-23/mien-nam`: hub và phân tích mô tả
- `/do-ve-so`: kiểm tra tối đa 10 vé trong phiên
- `/in-ve-do/[mien]`: phiếu dò tối ưu in A4/A5
- `/huong-dan`, `/lien-he`, `/chinh-sach-bao-mat`: nội dung hỗ trợ
- `/blog/[slug]`: bài viết hướng dẫn

## Legal

Thống kê chỉ phản ánh dữ liệu quá khứ, mang tính tham khảo. Kết quả xổ số là ngẫu nhiên. Khi vận hành thật, chỉ sử dụng dữ liệu từ nguồn được cấp phép hoặc nguồn chính thức.
