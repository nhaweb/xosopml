import type { Metadata } from 'next';
import { Be_Vietnam_Pro, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['vietnamese', 'latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-mono',
  display: 'swap',
});

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
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${beVietnamPro.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
