import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Kalkulator Faraidh — Ilmu Waris Islam (Kurikulum Gontor)',
  description:
    'Mesin Edukasi Faraidh berbasis Kitab Ilmu Faraidh Kelas 3 KMI Gontor. Hitung pembagian waris Islam langkah demi langkah: Tirkah, Hijab, Furudh, Ashabah, Asal Masalah, \'Aul, Radd, dan Tashih.',
  keywords: [
    'faraidh', 'waris islam', 'kalkulator waris', 'ilmu faraidh', 'gontor',
    'furudh muqaddarah', 'ashabah', 'hijab hirman', 'tashih masail',
    'pembagian harta waris', 'hukum waris islam',
  ],
  authors: [{ name: 'Sistem Faraidh Gontor' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Kalkulator Faraidh — Ilmu Waris Islam',
    description: 'Hitung waris Islam dengan langkah-langkah syar\'i yang transparan dan edukatif.',
    type: 'website',
    locale: 'id_ID',
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
