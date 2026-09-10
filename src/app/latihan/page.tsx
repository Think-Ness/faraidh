'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Trophy,
  Clock,
  Users,
  BookOpen,
  ChevronRight,
  Scale,
  Loader2,
  ArrowLeft,
  Star,
  Lock,
  CheckCircle2,
} from 'lucide-react'
import { type SoalBatch, type ProfilSantri, formatKelas } from '@/lib/faraidh/types'
import { getBatchList } from '../actions-latihan'

const ANGKATAN_OPTIONS = ['1', '1 Int', '2', '3', '3 Int', '4', '5', '6']
const LS_PROFIL_KEY = 'faraidh_profil_santri'

function formatDurasi(detik: number): string {
  const m = Math.floor(detik / 60)
  const s = detik % 60
  if (m === 0) return `${s} dtk`
  return `${m} mnt ${s} dtk`
}

function BadgeSkor({ skor }: { skor: number }) {
  const color =
    skor >= 90 ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : skor >= 70 ? 'bg-blue-100 text-blue-800 border-blue-200'
    : skor >= 50 ? 'bg-amber-100 text-amber-800 border-amber-200'
    : 'bg-slate-100 text-slate-600 border-slate-200'
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${color}`}>
      Top {skor.toFixed(0)}%
    </span>
  )
}

type BatchWithStats = SoalBatch & {
  jumlah_soal: number
  jumlah_peserta: number
  top_skor: number
}

// Modal Identitas Santri
function ModalIdentitas({
  onSimpan,
  initial,
}: {
  onSimpan: (profil: ProfilSantri) => void
  initial?: ProfilSantri | null
}) {
  const [angkatan, setAngkatan] = useState(initial?.angkatan || '')
  const [abjad, setAbjad] = useState(initial?.abjad || '')
  const [nama, setNama] = useState(initial?.nama || '')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nama.trim()) { setError('Nama wajib diisi.'); return }
    if (!angkatan) { setError('Pilih angkatan terlebih dahulu.'); return }
    if (!abjad.trim()) { setError('Abjad kelas wajib diisi.'); return }
    const profil: ProfilSantri = {
      nama: nama.trim(),
      angkatan,
      abjad: abjad.trim().toUpperCase(),
    }
    onSimpan(profil)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-7 h-7 text-emerald-700" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Identitas Santri</h2>
          <p className="text-sm text-slate-500 mt-1">Data ini tersimpan di perangkat Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
            <input
              type="text"
              value={nama}
              onChange={e => setNama(e.target.value)}
              placeholder="Contoh: Ahmad Fulan"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Angkatan</label>
              <select
                value={angkatan}
                onChange={e => setAngkatan(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
              >
                <option value="">Pilih...</option>
                {ANGKATAN_OPTIONS.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Abjad Kelas</label>
              <input
                type="text"
                value={abjad}
                onChange={e => setAbjad(e.target.value.toUpperCase())}
                placeholder="A, B, C..."
                maxLength={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm uppercase font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
              />
            </div>
          </div>

          {angkatan && abjad && (
            <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <p className="text-xs text-slate-600">Format Kelas:</p>
              <p className="font-extrabold text-emerald-800 text-sm">{formatKelas(angkatan, abjad)}</p>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 font-medium text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all"
          >
            Simpan &amp; Lanjutkan
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LatihanPage() {
  const [batches, setBatches] = useState<BatchWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [profil, setProfil] = useState<ProfilSantri | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [targetBatch, setTargetBatch] = useState<string | null>(null)

  const loadBatches = useCallback(async () => {
    setLoading(true)
    try {
      const list = await getBatchList()
      setBatches(list.filter(b => b.is_active) as BatchWithStats[])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Load profil dari localStorage
    const saved = localStorage.getItem(LS_PROFIL_KEY)
    if (saved) {
      try { setProfil(JSON.parse(saved)) } catch { /* ignore */ }
    }
    loadBatches()
  }, [loadBatches])

  const handleMulai = (batchId: string) => {
    setTargetBatch(batchId)
    if (!profil) {
      setShowModal(true)
    } else {
      window.location.href = `/latihan/${batchId}`
    }
  }

  const handleSimpanProfil = (p: ProfilSantri) => {
    setProfil(p)
    localStorage.setItem(LS_PROFIL_KEY, JSON.stringify(p))
    setShowModal(false)
    if (targetBatch) {
      window.location.href = `/latihan/${targetBatch}`
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Modal identitas */}
      {showModal && (
        <ModalIdentitas onSimpan={handleSimpanProfil} initial={profil} />
      )}

      {/* Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-sm sm:text-base">Latihan Soal</span>
                <p className="text-[10px] text-slate-500 leading-none">Faraidh KMI Gontor</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {profil ? (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-bold transition hover:bg-emerald-100"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{formatKelas(profil.angkatan, profil.abjad)}: </span>{profil.nama.split(' ')[0]}
              </button>
            ) : (
              <button
                onClick={() => { setTargetBatch(null); setShowModal(true) }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
              >
                <Lock className="w-3.5 h-3.5" />
                Isi Identitas
              </button>
            )}
            <Link
              href="/kalkulator"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
            >
              <Scale className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kalkulator</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white border-b border-slate-200 py-8 sm:py-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-7 h-7 text-amber-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            Latihan Soal Ilmu Faraidh
          </h1>
          <p className="text-arabic text-lg text-amber-800 font-bold mb-3">
            تمارين واختبارات علم الفرائض والمواريث
          </p>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Pilih satu paket soal (batch) di bawah ini. Isi identitasmu dulu, lalu mulai mengerjakan soal dengan timer.
          </p>

          {profil && (
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-emerald-800">{profil.nama}</span>
              <span className="text-slate-500">· Kelas {formatKelas(profil.angkatan, profil.abjad)}</span>
            </div>
          )}
        </div>
      </section>

      {/* Batch List */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8">
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Memuat daftar soal...</p>
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-20 card">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-600 mb-1">Belum Ada Soal</h3>
            <p className="text-sm text-slate-400">Asatidz belum menambahkan paket soal. Cek kembali nanti.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
              {batches.length} Paket Soal Tersedia
            </p>
            {batches.map((batch, idx) => (
              <div
                key={batch.id}
                className="card hover:border-amber-300 hover:shadow-md transition-all duration-150 group p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Nomor */}
                    <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center font-extrabold text-amber-700 text-lg flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h2 className="font-extrabold text-slate-900 text-base group-hover:text-amber-700 transition-colors">
                          {batch.judul}
                        </h2>
                        {batch.kelas_target && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 border border-blue-200">
                            {batch.kelas_target}
                          </span>
                        )}
                      </div>
                      {batch.deskripsi && (
                        <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">{batch.deskripsi}</p>
                      )}

                      {/* Stats */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          <strong className="text-slate-700">{batch.jumlah_soal}</strong> soal
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <strong className="text-slate-700">{batch.jumlah_peserta}</strong> peserta
                        </span>
                        {batch.jumlah_peserta > 0 && (
                          <span className="flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-amber-500" />
                            <BadgeSkor skor={batch.top_skor} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleMulai(batch.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow-sm"
                    >
                      Mulai
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      href={`/latihan/${batch.id}/hasil`}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition"
                    >
                      <Clock className="w-3 h-3" />
                      Lihat Leaderboard
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>Faraidh KMI Gontor · Sistem Latihan Soal Interaktif</p>
      </footer>
    </div>
  )
}
