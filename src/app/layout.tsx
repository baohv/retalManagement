import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  title: 'Quản Lý Phòng Trọ',
  description: 'Hệ thống quản lý phòng trọ toàn diện',
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Quản Lý Phòng Trọ",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "QLPT",
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={`${outfit.variable}`}>
      <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
      <link rel="mask-icon" href="/icons/icon-192.png" color="#1e40af" />
      <body className="min-h-screen bg-gray-50 font-sans">{children}</body>
    </html>
  )
}
