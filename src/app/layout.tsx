import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://faraidh.vercel.app'),
  title: 'Kalkulator Faraidh — Ilmu Waris Islam (Kurikulum Gontor)',
  description:
    'Kalkulator & Mesin Edukasi Faraidh berbasis Kitab Ilmu Faraidh Kelas 3 KMI Gontor. Hitung pembagian waris Islam langkah demi langkah: Tirkah, Hijab, Furudh, Ashabah, Asal Masalah, \'Aul, Radd, dan Tashih.',
  keywords: [
    'faraidh', 'waris islam', 'kalkulator waris', 'ilmu faraidh', 'gontor',
    'furudh muqaddarah', 'ashabah', 'hijab hirman', 'tashih masail',
    'pembagian harta waris', 'hukum waris islam', 'kmi gontor'
  ],
  authors: [{ name: 'Sistem Faraidh Gontor' }],
  robots: 'index, follow',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: 'Kalkulator Faraidh — Ilmu Waris Islam (Kurikulum Gontor)',
    description: 'Hitung waris Islam langkah demi langkah secara transparan, akurat, dan sesuai kaidah syar\'i.',
    url: 'https://faraidh.vercel.app',
    siteName: 'Faraidh Web KMI Gontor',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kalkulator Faraidh — Ilmu Waris Islam (Kurikulum Gontor)',
    description: 'Hitung waris Islam langkah demi langkah secara transparan, akurat, dan sesuai kaidah syar\'i.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
