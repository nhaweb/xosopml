import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Xổ số Minh Luân | Kết quả xổ số kiến thiết Nhanh, Chính Xác nhất',
  description:
    'Xem trực tiếp kết quả xổ số kiến thiết 3 miền tại xổ số Minh Luân. Cập nhật KQXS nhanh, chuẩn xác nhất hôm nay. Dò vé số Online ngay!',
  icons: {
    icon: '/favicon-logo.png',
    shortcut: '/favicon-logo.png',
    apple: '/favicon-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
