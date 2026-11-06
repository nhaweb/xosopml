import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://xsktviet.vn'),
  title: { default: 'XSKT Việt — Kết quả xổ số hôm nay', template: '%s | XSKT Việt' },
  description: 'Tra cứu kết quả xổ số miền Nam, miền Trung, miền Bắc và Vietlott.',
  alternates: { canonical: '/' },
  openGraph: { type: 'website', locale: 'vi_VN', siteName: 'XSKT Việt', title: 'XSKT Việt — Kết quả xổ số hôm nay', description: 'Tra cứu kết quả xổ số rõ ràng, nhanh chóng.' },
  manifest: '/manifest.webmanifest',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi" suppressHydrationWarning><body>{children}</body></html>
}
