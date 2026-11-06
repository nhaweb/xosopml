import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'XSKT Việt — Kết quả xổ số hôm nay',
  description: 'Tra cứu kết quả xổ số miền Nam, miền Trung, miền Bắc và Vietlott.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi" suppressHydrationWarning><body>{children}</body></html>
}
