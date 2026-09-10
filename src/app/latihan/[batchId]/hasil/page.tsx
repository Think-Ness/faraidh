'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Trophy,
  Clock,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Star,
  Medal,
  Scale,
  RefreshCw,
} from 'lucide-react'
import type { SoalBatch, SoalItem, SesiLatihan } from '@/lib/faraidh/types'
import { getBatchDetail, getLeaderboard, getSesiDetail } from '../../../actions-latihan'
import { JadwalSyubbakSoal } from '@/components/latihan/JadwalSyubbakSoal'

function formatDurasi(detik: number): string {
  const m = Math.floor(detik / 60)
  const s = detik % 60
  if (m === 0) return `${s} dtk`
  return `${m}:${String(s).padStart(2, '0')}`
}

function SkorBadge({ persen }: { persen: number }) {
  const [color, label] = persen >= 90 ? ['bg-emerald-100 text-emerald-800 border-emerald-300', 'Sempurna!']
    : persen >= 75 ? ['bg-blue-100 text-blue-800 border-blue-300', 'Sangat Baik']
    : persen >= 60 ? ['bg-amber-100 text-amber-800 border-amber-300', 'Baik']
    : persen >= 40 ? ['bg-orange-100 text-orange-800 border-orange-300', 'Cukup']
    : ['bg-red-100 text-red-800 border-red-300', 'Perlu Belajar Lagi']
  return (
    <span className={`inline-block px-3 py-1 rounded-xl border font-bold text-sm ${color}`}>
      {label}
    </span>
  )
}

function MedalIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Medal className="w-5 h-5 text-yellow-500" />
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />
  return <span className="text-sm font-bold text-slate-400 w-5 text-center">{rank}</span>
}

export default function HasilPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const batchId = params.batchId as string
  const sesiId = searchParams.get('sesi')

  const [batch, setBatch] = useState<SoalBatch | null>(null)
  const [soalList, setSoalList] = useState<SoalItem[]>([])
  const [sesi, setSesi] = useState<SesiLatihan | null>(null)
  const [jawabanList, setJawabanList] = useState<Record<string, any>>({})
  const [leaderboard, setLeaderboard] = useState<SesiLatihan[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'hasil' | 'leaderboard'>(sesiId ? 'hasil' : 'leaderboard')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [{ batch: b, soalList: sl }, lb] = await Promise.all([
        getBatchDetail(batchId),
        getLeaderboard(batchId),
      ])
      setBatch(b)
      setSoalList(sl)
      setLeaderboard(lb)

      if (sesiId) {
        const { sesi: s, jawaban: j } = await getSesiDetail(sesiId)
        if (s) {
          setSesi(s)
          const jMap: Record<string, any> = {}
          j.forEach(item => { jMap[item.soal_id] = item })
          setJawabanList(jMap)
        } else {
          // Fallback from localStorage
          const localSesi = localStorage.getItem('faraidh_sesi_' + sesiId)
          const localJawaban = localStorage.getItem('faraidh_jawaban_' + sesiId)
          if (localSesi) {
            try { setSesi(JSON.parse(localSesi)) } catch {}
          }
          if (localJawaban) {
            try {
              const parsed: any[] = JSON.parse(localJawaban)
              const jMap: Record<string, any> = {}
              parsed.forEach(item => { jMap[item.soal_id] = item })
              setJawabanList(jMap)
            } catch {}
          }
        }
      }
    } finally {
      setLoading(false)
    }
  }, [batchId, sesiId])

  useEffect(() => { loadData() }, [loadData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/latihan" className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-slate-900 text-sm sm:text-base">Faraidh · Hasil Latihan</span>
            </div>
          </div>
          <Link
            href={`/latihan/${batchId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Coba Lagi
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Judul Batch */}
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{batch?.judul}</h1>
          {batch?.kelas_target && (
            <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-lg">{batch.kelas_target}</span>
          )}
        </div>

        {/* Skor Sesi Ini (jika ada) */}
        {sesi && sesi.is_selesai && (
          <div className="card p-6 text-center border-2 border-emerald-200 bg-emerald-50/30">
            <div className="w-20 h-20 rounded-2xl bg-white border-2 border-emerald-300 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <div>
                <div className="font-extrabold text-3xl text-emerald-700">{Number(sesi.skor_persen || 0).toFixed(0)}</div>
                <div className="text-xs text-slate-500 font-semibold">%</div>
              </div>
            </div>

            <h2 className="font-extrabold text-2xl text-slate-900 mb-1">{sesi.nama_santri}</h2>
            <p className="text-sm text-slate-500 mb-3">Kelas {sesi.kelas}</p>
            <SkorBadge persen={Number(sesi.skor_persen || 0)} />

            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="rounded-xl bg-white border border-slate-200 py-3">
                <div className="font-extrabold text-lg text-slate-900">{sesi.skor_total}</div>
                <div className="text-[11px] text-slate-500">Skor</div>
              </div>
              <div className="rounded-xl bg-white border border-slate-200 py-3">
                <div className="font-extrabold text-lg text-slate-900">{soalList.length}</div>
                <div className="text-[11px] text-slate-500">Soal</div>
              </div>
              <div className="rounded-xl bg-white border border-slate-200 py-3">
                <div className="font-extrabold text-lg text-slate-900 flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-amber-500" />
                  {formatDurasi(sesi.durasi_detik || 0)}
                </div>
                <div className="text-[11px] text-slate-500">Durasi</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          {[
            { id: 'hasil' as const, icon: Star, label: 'Rincian Jawaban' },
            { id: 'leaderboard' as const, icon: Trophy, label: `Leaderboard (${leaderboard.length})` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === t.id
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Rincian Jawaban */}
        {activeTab === 'hasil' && (
          <div className="space-y-4">
            {soalList.length === 0 && (
              <div className="card text-center py-10 text-slate-400 text-sm">Tidak ada soal untuk ditampilkan.</div>
            )}
            {soalList.map((soal, idx) => {
              const jItem = jawabanList[soal.id]
              let parsedSyubbakAnswer = undefined
              if (soal.tipe === 'isi_tabel' && jItem?.jawaban_santri) {
                try {
                  parsedSyubbakAnswer = JSON.parse(jItem.jawaban_santri)
                } catch {}
              }

              return (
                <div key={soal.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">{idx + 1}</span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                        soal.tipe === 'pilihan_ganda' ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : soal.tipe === 'esay' ? 'bg-purple-100 text-purple-800 border-purple-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {soal.tipe === 'pilihan_ganda' ? 'PG' : soal.tipe === 'esay' ? 'Esay' : 'Tabel'}
                      </span>
                    </div>

                    {jItem ? (
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          jItem.is_benar
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : jItem.skor_dapat > 0
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          Skor: {jItem.skor_dapat} / {soal.skor_maksimal}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Skor maks: {soal.skor_maksimal}</span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-slate-800 leading-relaxed mb-3">{soal.pertanyaan}</p>

                  {/* Jawaban PG */}
                  {soal.tipe === 'pilihan_ganda' && soal.opsi_jawaban && (
                    <div className="space-y-2">
                      {soal.opsi_jawaban.map(opsi => {
                        const isStudentChoice = jItem && jItem.jawaban_santri?.toUpperCase() === opsi.label.toUpperCase()
                        return (
                          <div key={opsi.label} className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs ${
                            opsi.benar
                              ? 'bg-emerald-50 border border-emerald-300 font-semibold'
                              : isStudentChoice
                              ? 'bg-red-50 border border-red-200'
                              : 'border border-slate-100 bg-slate-50'
                          }`}>
                            <span className={`w-5 h-5 rounded flex items-center justify-center font-bold flex-shrink-0 text-[10px] ${
                              opsi.benar ? 'bg-emerald-600 text-white' : isStudentChoice ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {opsi.label}
                            </span>
                            <span className="text-slate-700">{opsi.teks}</span>
                            {opsi.benar && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto flex-shrink-0" />}
                            {isStudentChoice && !opsi.benar && (
                              <span className="text-[10px] text-red-600 font-bold ml-auto flex-shrink-0">Jawaban Santri</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {soal.tipe === 'esay' && (
                    <div className="space-y-2">
                      {jItem && (
                        <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                          <p className="font-bold text-slate-600 mb-0.5">Jawaban Santri:</p>
                          <p className="text-slate-800">{jItem.jawaban_santri || 'Tidak dijawab'}</p>
                        </div>
                      )}
                      {soal.jawaban_benar && (
                        <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                          <p className="font-bold text-emerald-800 mb-1">Kunci Jawaban Referensi:</p>
                          <p className="text-slate-700 leading-relaxed">{soal.jawaban_benar}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {soal.tipe === 'isi_tabel' && soal.data_isi_tabel?.syubbak && (
                    <div className="mt-2">
                      <JadwalSyubbakSoal
                        kunci={soal.data_isi_tabel.syubbak}
                        value={parsedSyubbakAnswer}
                        readonly
                        showCorrection
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Tab: Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-3">
            {leaderboard.length === 0 ? (
              <div className="card text-center py-10 text-slate-400 text-sm">
                Belum ada yang mengerjakan soal ini.
              </div>
            ) : (
              <>
                {/* Top 3 podium */}
                {leaderboard.length >= 3 && (
                  <div className="grid grid-cols-3 gap-3 mb-2">
                    {[leaderboard[1], leaderboard[0], leaderboard[2]].map((s, pIdx) => {
                      const realRank = pIdx === 0 ? 2 : pIdx === 1 ? 1 : 3
                      const heights = ['h-20', 'h-28', 'h-16']
                      const colors = ['bg-slate-100', 'bg-yellow-100 border-yellow-200', 'bg-amber-50 border-amber-200']
                      if (!s) return <div key={pIdx} />
                      return (
                        <div key={s.id} className={`rounded-xl border p-3 text-center flex flex-col items-center justify-end ${colors[pIdx]} ${heights[pIdx]}`}>
                          <MedalIcon rank={realRank} />
                          <p className="font-bold text-slate-900 text-xs mt-1 line-clamp-1">{s.nama_santri.split(' ')[0]}</p>
                          <p className="text-[10px] text-slate-500">{s.kelas}</p>
                          <p className="font-extrabold text-sm text-emerald-700">{Number(s.skor_persen || 0).toFixed(0)}%</p>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Tabel penuh */}
                <div className="card overflow-hidden p-0">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-slate-900 text-sm">Papan Skor Teratas</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {leaderboard.map((s, idx) => {
                      const isMySesi = s.id === sesiId
                      return (
                        <div
                          key={s.id}
                          className={`flex items-center gap-3 px-4 py-3 ${isMySesi ? 'bg-emerald-50' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                        >
                          <div className="w-7 flex justify-center flex-shrink-0">
                            <MedalIcon rank={idx + 1} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-sm truncate ${isMySesi ? 'text-emerald-800' : 'text-slate-900'}`}>
                              {s.nama_santri} {isMySesi && '(Anda)'}
                            </p>
                            <p className="text-[11px] text-slate-400">{s.kelas}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-extrabold text-base text-emerald-700">{Number(s.skor_persen || 0).toFixed(0)}%</div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 justify-end">
                              <Clock className="w-3 h-3" />
                              {formatDurasi(s.durasi_detik || 0)}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {sesiId && !leaderboard.find(s => s.id === sesiId) && sesi && (
                  <div className="card p-4 border-emerald-200 bg-emerald-50/30 flex items-center gap-3">
                    <Star className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-emerald-800 text-sm">{sesi.nama_santri} (Anda)</p>
                      <p className="text-xs text-slate-500">{sesi.kelas} · {Number(sesi.skor_persen || 0).toFixed(0)}%</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-400">
        <div className="flex items-center justify-center gap-4">
          <Link href="/latihan" className="flex items-center gap-1 hover:text-slate-600 transition">
            <ChevronLeft className="w-3 h-3" />Kembali ke Daftar Soal
          </Link>
          <span>·</span>
          <Link href={`/latihan/${batchId}`} className="flex items-center gap-1 hover:text-slate-600 transition">
            <RefreshCw className="w-3 h-3" />Coba Lagi
          </Link>
          <span>·</span>
          <Link href="/kalkulator" className="flex items-center gap-1 hover:text-slate-600 transition">
            <Scale className="w-3 h-3" />Kalkulator
          </Link>
        </div>
      </footer>
    </div>
  )
}
