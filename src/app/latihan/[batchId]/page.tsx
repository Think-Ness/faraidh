'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  BookOpen,
  Scale,
} from 'lucide-react'
import {
  type SoalItem,
  type SoalBatch,
  type ProfilSantri,
  type SesiLatihan,
  type JawabanSyubbakSantri,
  formatKelas,
} from '@/lib/faraidh/types'
import { getBatchDetail, mulaiSesi, submitSesi } from '../../actions-latihan'
import { JadwalSyubbakSoal } from '@/components/latihan/JadwalSyubbakSoal'

const LS_PROFIL_KEY = 'faraidh_profil_santri'

function formatTimer(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ─── Komponen Soal Pilihan Ganda ──────────────────────────────────────────
function SoalPilihanGanda({
  soal,
  jawaban,
  onJawab,
}: {
  soal: SoalItem
  jawaban: string
  onJawab: (label: string) => void
}) {
  return (
    <div className="space-y-3">
      {soal.opsi_jawaban?.map(opsi => (
        <button
          key={opsi.label}
          onClick={() => onJawab(opsi.label)}
          className={`w-full text-left flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-150
            ${jawaban === opsi.label
              ? 'border-emerald-500 bg-emerald-50 shadow-sm'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
        >
          <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-sm flex-shrink-0 transition-colors
            ${jawaban === opsi.label ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {opsi.label}
          </span>
          <span className="text-sm text-slate-700 leading-relaxed pt-0.5">{opsi.teks}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Komponen Soal Esay ───────────────────────────────────────────────────
function SoalEsay({
  soal,
  jawaban,
  onJawab,
}: {
  soal: SoalItem
  jawaban: string
  onJawab: (teks: string) => void
}) {
  return (
    <div className="space-y-3">
      {soal.petunjuk && (
        <div className="px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800">
          <strong>Petunjuk:</strong> {soal.petunjuk}
        </div>
      )}
      <textarea
        value={jawaban}
        onChange={e => onJawab(e.target.value)}
        placeholder="Tulis jawaban Anda di sini... (langkah demi langkah)"
        rows={6}
        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
      />
      <p className="text-[11px] text-slate-400 text-right">{jawaban.length} karakter</p>
    </div>
  )
}

// ─── Komponen Soal Isi Tabel ──────────────────────────────────────────────
function SoalIsiTabel({
  soal,
  jawaban,
  onJawab,
}: {
  soal: SoalItem
  jawaban: any
  onJawab: (data: any) => void
}) {
  const data = soal.data_isi_tabel
  if (!data) return <p className="text-sm text-slate-400 italic">Data tabel tidak tersedia.</p>

  // Render authentic Jadwal Syubbak
  if (data.syubbak) {
    return (
      <div className="space-y-3">
        {soal.petunjuk && (
          <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
            <strong>Petunjuk:</strong> {soal.petunjuk}
          </div>
        )}
        <JadwalSyubbakSoal
          kunci={data.syubbak}
          value={jawaban}
          onChange={onJawab}
        />
      </div>
    )
  }

  const handleChange = (rowIdx: number, kodeKolom: string, val: string) => {
    const key = `${rowIdx}_${kodeKolom}`
    onJawab({ ...(jawaban || {}), [key]: val })
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="min-w-[500px] px-4 sm:px-0">
        <table className="w-full border-collapse text-xs sm:text-sm">
          <thead>
            <tr>
              {data.judul_kolom?.map((h, i) => (
                <th
                  key={i}
                  className="px-3 py-2 text-center font-extrabold text-slate-700 bg-slate-100 border border-slate-300 text-xs"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.baris?.map((baris, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                {baris.kolom.map((kol, colIdx) => {
                  const key = `${rowIdx}_${kol.kode_kolom}`
                  if (kol.is_blank) {
                    return (
                      <td key={colIdx} className="px-2 py-1.5 border border-slate-300 text-center">
                        <input
                          type="text"
                          value={jawaban?.[key] || ''}
                          onChange={e => handleChange(rowIdx, kol.kode_kolom, e.target.value)}
                          className="w-full text-center px-2 py-1.5 rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50 text-emerald-800 font-bold text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                          placeholder="..."
                        />
                      </td>
                    )
                  }
                  return (
                    <td key={colIdx} className="px-3 py-2 border border-slate-300 text-center font-medium text-slate-700">
                      {colIdx === 0 ? (
                        <div>
                          <div className="font-bold">{baris.nama_waris}</div>
                          {baris.nama_arab && (
                            <div className="text-arabic text-sm text-slate-500">{baris.nama_arab}</div>
                          )}
                        </div>
                      ) : kol.jawaban_benar}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[11px] text-slate-400 mt-2">
          * Kolom dengan latar hijau putus-putus harus Anda isi.
        </p>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function KerjakanSoalPage() {
  const params = useParams()
  const router = useRouter()
  const batchId = params.batchId as string

  const [batch, setBatch] = useState<SoalBatch | null>(null)
  const [soalList, setSoalList] = useState<SoalItem[]>([])
  const [profil, setProfil] = useState<ProfilSantri | null>(null)
  const [sesi, setSesi] = useState<SesiLatihan | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<'intro' | 'soal'>('intro')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [jawaban, setJawaban] = useState<Record<string, string | Record<string, string>>>({})
  const [timer, setTimer] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    const saved = localStorage.getItem(LS_PROFIL_KEY)
    if (saved) {
      try { setProfil(JSON.parse(saved)) } catch { /* */ }
    }
  }, [])

  useEffect(() => {
    getBatchDetail(batchId).then(({ batch: b, soalList: sl }) => {
      setBatch(b)
      setSoalList(sl)
      setLoading(false)
    })
  }, [batchId])

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setTimer(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
  }, [])

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const handleMulai = async () => {
    if (!profil) { router.push('/latihan'); return }
    const newSesi = await mulaiSesi({
      batch_id: batchId,
      nama_santri: profil.nama,
      kelas: formatKelas(profil.angkatan, profil.abjad),
    })
    if (newSesi) {
      setSesi(newSesi)
      setStep('soal')
      startTimer()
    }
  }

  const handleJawabSoal = (soalId: string, nilai: string | Record<string, string>) => {
    setJawaban(prev => ({ ...prev, [soalId]: nilai }))
  }

  const handleSubmit = async () => {
    if (!sesi || isSubmitting) return
    if (timerRef.current) clearInterval(timerRef.current)
    setIsSubmitting(true)

    const jawabanList = soalList.map(soal => {
      const j = jawaban[soal.id]
      const opsiBenar = soal.opsi_jawaban?.find(o => o.benar)?.label || ''
      const isSyubbak = soal.tipe === 'isi_tabel' && Boolean(soal.data_isi_tabel?.syubbak)

      return {
        soal_id: soal.id,
        jawaban_santri: typeof j === 'string' ? (j || '') : JSON.stringify(j || {}),
        opsi_benar: opsiBenar,
        jawaban_benar_kunci: soal.jawaban_benar || '',
        tipe: soal.tipe,
        skor_maksimal: soal.skor_maksimal,
        syubbak_kunci: soal.data_isi_tabel?.syubbak,
        jawaban_syubbak_santri: isSyubbak && typeof j === 'object' ? (j as unknown as JawabanSyubbakSantri) : undefined,
        jawaban_tabel_santri: !isSyubbak && soal.tipe === 'isi_tabel' && typeof j === 'object' ? (j as Record<string, string>) : undefined,
        jawaban_tabel_kunci: !isSyubbak && soal.tipe === 'isi_tabel' && soal.data_isi_tabel?.baris
          ? soal.data_isi_tabel.baris.reduce((acc, baris, rowIdx) => {
              baris.kolom.forEach(kol => {
                if (kol.is_blank && kol.jawaban_benar) {
                  acc[`${rowIdx}_${kol.kode_kolom}`] = kol.jawaban_benar
                }
              })
              return acc
            }, {} as Record<string, string>)
          : undefined,
      }
    })

    try {
      const res = await submitSesi(sesi.id, jawabanList, timer)
      if (res && res.sesi) {
        localStorage.setItem('faraidh_sesi_' + sesi.id, JSON.stringify(res.sesi))
        localStorage.setItem('faraidh_jawaban_' + sesi.id, JSON.stringify(res.jawaban))
      }
      router.push(`/latihan/${batchId}/hasil?sesi=${sesi.id}`)
    } catch {
      setSubmitError('Gagal menyimpan jawaban. Coba lagi.')
      setIsSubmitting(false)
      startTimer()
    }
  }

  const currentSoal = soalList[currentIdx]
  const totalSoal = soalList.length
  const terjawab = Object.keys(jawaban).filter(k => {
    const v = jawaban[k]
    return typeof v === 'string' ? v.trim() !== '' : Object.keys(v).length > 0
  }).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-center px-4">
        <div>
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h2 className="font-bold text-slate-600">Batch tidak ditemukan</h2>
          <Link href="/latihan" className="text-sm text-emerald-600 mt-2 inline-block">← Kembali</Link>
        </div>
      </div>
    )
  }

  // ─── INTRO SCREEN ────────────────────────────────────────────────────
  if (step === 'intro') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/latihan" className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-slate-900">Faraidh · Latihan Soal</span>
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
          <div className="card p-6 sm:p-8 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center mx-auto mb-5">
              <BookOpen className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">{batch.judul}</h1>
            {batch.deskripsi && <p className="text-sm text-slate-500 mb-4 leading-relaxed">{batch.deskripsi}</p>}

            <div className="grid grid-cols-2 gap-3 my-6 text-sm">
              <div className="rounded-xl bg-slate-50 border border-slate-200 py-3 px-4">
                <div className="font-extrabold text-2xl text-slate-900">{totalSoal}</div>
                <div className="text-xs text-slate-500 mt-0.5">Soal</div>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 py-3 px-4">
                <div className="font-extrabold text-2xl text-slate-900">
                  {soalList.reduce((s, q) => s + q.skor_maksimal, 0)}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Total Skor</div>
              </div>
            </div>

            {profil ? (
              <>
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 mb-5 text-sm">
                  <p className="text-slate-500 text-xs">Mengerjakan sebagai:</p>
                  <p className="font-extrabold text-emerald-800">{profil.nama} · Kelas {formatKelas(profil.angkatan, profil.abjad)}</p>
                </div>
                <button
                  onClick={handleMulai}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base transition-all shadow-md"
                >
                  Mulai Mengerjakan
                </button>
              </>
            ) : (
              <Link href="/latihan" className="w-full py-3.5 rounded-xl bg-slate-200 text-slate-600 font-bold text-base inline-block">
                Isi Identitas Dulu
              </Link>
            )}

            <Link href={`/latihan/${batchId}/hasil`} className="text-xs text-slate-400 hover:text-slate-600 mt-4 inline-block transition">
              Lihat leaderboard →
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // ─── SUBMITTING ───────────────────────────────────────────────────────
  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="font-bold text-slate-700">Menyimpan jawaban & menghitung skor...</p>
      </div>
    )
  }

  // ─── MODE SOAL ────────────────────────────────────────────────────────
  const progress = totalSoal > 0 ? ((currentIdx + 1) / totalSoal) * 100 : 0
  const jawSoalIni = jawaban[currentSoal?.id] as string | Record<string, string> | undefined

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header soal */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Scale className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">{batch.judul}</div>
              <div className="text-[10px] text-slate-400">{profil?.nama} · {profil?.angkatan}-{profil?.abjad}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm font-mono font-bold text-slate-700">
              <Clock className="w-4 h-4 text-amber-500" />
              {formatTimer(timer)}
            </div>
            <div className="text-xs text-slate-500 hidden sm:block">
              {terjawab}/{totalSoal} terjawab
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-1 bg-emerald-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 flex flex-col gap-4">
        {submitError && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {submitError}
          </div>
        )}

        {currentSoal && (
          <>
            {/* Nomor & badge tipe */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm">
                  {currentIdx + 1}
                </span>
                <span className="text-sm text-slate-500 font-medium">dari {totalSoal}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                  currentSoal.tipe === 'pilihan_ganda' ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : currentSoal.tipe === 'esay' ? 'bg-purple-100 text-purple-800 border-purple-200'
                  : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}>
                  {currentSoal.tipe === 'pilihan_ganda' ? 'Pilihan Ganda'
                   : currentSoal.tipe === 'esay' ? 'Esay'
                   : 'Isi Tabel'}
                </span>
                <span className="text-[11px] text-slate-400">Skor: {currentSoal.skor_maksimal}</span>
              </div>
            </div>

            {/* Pertanyaan */}
            <div className="card p-5 sm:p-6">
              {currentSoal.konteks_kasus && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 mb-4 text-xs text-slate-700">
                  <p className="font-bold text-amber-800 mb-1">Kasus:</p>
                  <p className="leading-relaxed">{currentSoal.konteks_kasus.keterangan}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {currentSoal.konteks_kasus.ahli_waris.map((aw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-amber-100 border border-amber-200 text-amber-800 font-semibold text-[11px]">
                        {aw.kode} × {aw.jumlah_orang}
                      </span>
                    ))}
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold">
                      Rp {currentSoal.konteks_kasus.harta.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )}

              <p className="font-bold text-slate-900 text-sm sm:text-base leading-relaxed mb-4">
                {currentSoal.pertanyaan}
              </p>
              {currentSoal.pertanyaan_arab && (
                <p className="text-arabic text-base text-emerald-800 font-bold mb-4 leading-loose">
                  {currentSoal.pertanyaan_arab}
                </p>
              )}

              {/* Soal Component */}
              {currentSoal.tipe === 'pilihan_ganda' && (
                <SoalPilihanGanda
                  soal={currentSoal}
                  jawaban={(jawSoalIni as string) || ''}
                  onJawab={val => handleJawabSoal(currentSoal.id, val)}
                />
              )}
              {currentSoal.tipe === 'esay' && (
                <SoalEsay
                  soal={currentSoal}
                  jawaban={(jawSoalIni as string) || ''}
                  onJawab={val => handleJawabSoal(currentSoal.id, val)}
                />
              )}
              {currentSoal.tipe === 'isi_tabel' && (
                <SoalIsiTabel
                  soal={currentSoal}
                  jawaban={(jawSoalIni as Record<string, string>) || {}}
                  onJawab={val => handleJawabSoal(currentSoal.id, val)}
                />
              )}
            </div>

            {/* Navigasi */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                disabled={currentIdx === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-sm disabled:opacity-40 hover:bg-slate-50 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Sebelumnya
              </button>

              <div className="flex-1" />

              {currentIdx < totalSoal - 1 ? (
                <button
                  onClick={() => setCurrentIdx(Math.min(totalSoal - 1, currentIdx + 1))}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition"
                >
                  Berikutnya
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-sm disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Mengirim...' : 'Kumpulkan Jawaban'}
                </button>
              )}
            </div>

            {/* Sidebar nomor soal */}
            <div className="card p-4">
              <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Navigasi Cepat</p>
              <div className="flex flex-wrap gap-2">
                {soalList.map((soal, idx) => {
                  const dijawab = jawaban[soal.id] !== undefined && (
                    typeof jawaban[soal.id] === 'string'
                      ? (jawaban[soal.id] as string).trim() !== ''
                      : Object.keys(jawaban[soal.id] as Record<string, string>).length > 0
                  )
                  return (
                    <button
                      key={soal.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                        idx === currentIdx
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : dijawab
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> {terjawab} terjawab</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-200" /> {totalSoal - terjawab} belum</span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
