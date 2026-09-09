import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Panel Pengelola & Dewan Faraidh (Admin POV) — KMI Gontor',
  description:
    'Dashboard Pengelola Kaidah Fikih, Master 25 Ahli Waris, Aturan Furudh & Hijab, Kasus Khusus, Bank Soal Latihan Santri, dan Audit Trail Sistem Faraidh.',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {children}
    </div>
  )
}
