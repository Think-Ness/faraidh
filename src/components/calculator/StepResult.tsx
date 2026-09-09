'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Scale,
  Hash,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Wrench,
  Sparkles,
  Printer,
  Copy,
  Check,
  Coins,
  ShieldAlert,
  Percent,
  PieChart,
  ArrowLeft
} from 'lucide-react'
import type { HasilKalkulasi, HasilPerAhliWaris } from '@/lib/faraidh/types'
import LogEdukasiPanel from './LogEdukasiPanel'

const STATUS_CONFIG: Record<string, { label: string; labelArab: string; badge: string; icon: typeof Scale }> = {
  furudh:              { label: 'Ashabul Furudh', labelArab: 'فرض', badge: 'badge-emerald', icon: Scale },
  ashabah_bin_nafsih:  { label: 'Ashabah Bin-Nafsih', labelArab: 'عصبة بنفسه', badge: 'badge-blue', icon: Sparkles },
  ashabah_bil_ghair:   { label: 'Ashabah Bil-Ghair', labelArab: 'عصبة بغيره', badge: 'badge-blue', icon: Sparkles },
  ashabah_maal_ghair:  { label: "Ashabah Ma'al-Ghair", labelArab: 'عصبة مع غيره', badge: 'badge-blue', icon: Sparkles },
  radd:                { label: 'Penerima Radd', labelArab: 'رد', badge: 'badge-gold', icon: RotateCcw },
  gugur_halangan:      { label: 'Gugur (Mawani\')', labelArab: 'ممنوع من الإرث', badge: 'badge-red', icon: XCircle },
  gugur_hijab:         { label: 'Mahjub (Terhalang)', labelArab: 'محجوب حجب حرمان', badge: 'badge-red', icon: MinusCircle },
  kasus_khusus:        { label: 'Kasus Khusus', labelArab: 'مسألة خاصة', badge: 'badge-purple', icon: Wrench },
}

const STATUS_PENYELESAIAN_CONFIG = {
  adilah:      { label: "'Adilah (Saham Pas)", labelArab: 'عادلة', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  aul:         { label: "'Aul (Saham Membengkak)", labelArab: 'عائلة', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', icon: TrendingUp },
  radd:        { label: 'Radd (Saham Berlebih Dikembalikan)', labelArab: 'ردية', color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200', icon: TrendingDown },
  tashih:      { label: 'Tashih (Koreksi Pecahan)', labelArab: 'مصححة', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Wrench },
  kasus_khusus:{ label: 'Kasus Khusus Syar\'i', labelArab: 'مسألة خاصة', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: Sparkles },
}

const formatRp = (n?: number) =>
  n !== undefined ? `Rp ${Math.round(n).toLocaleString('id-ID')}` : '—'

const SHARE_COLORS = [
  'bg-emerald-600',
  'bg-amber-500',
  'bg-blue-600',
  'bg-teal-600',
  'bg-purple-600',
  'bg-rose-500',
  'bg-indigo-600',
  'bg-cyan-600',
]

interface StepResultProps {
  hasil: HasilKalkulasi
  onReset: () => void
}

function HasilRow({ h }: { h: HasilPerAhliWaris }) {
  const cfg = STATUS_CONFIG[h.status] || STATUS_CONFIG.furudh
  const IconComp = cfg.icon
  const gugur = h.status === 'gugur_halangan' || h.status === 'gugur_hijab'

  return (
    <tr className={`transition-colors ${gugur ? 'opacity-50 bg-slate-50/70' : 'hover:bg-slate-50/80'}`}>
      <td className="py-3 sm:py-4">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <div className="font-semibold text-slate-900 text-xs sm:text-sm">{h.nama_id}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="badge-slate text-[10px] py-0">{h.jumlah_orang || 1} Jiwa</span>
            </div>
          </div>
          <div className="text-arabic text-sm sm:text-base text-emerald-900 font-bold flex-shrink-0">
            {h.nama_arab}
          </div>
        </div>
      </td>
      <td>
        <div className="flex flex-col items-start gap-1">
          <span className={`${cfg.badge} text-[11px] py-0.5`}>
            <IconComp className="w-3 h-3" />
            <span>{cfg.label}</span>
          </span>
          <span className="text-arabic text-[11px] text-slate-500 mr-1">{cfg.labelArab}</span>
        </div>
        {gugur && h.alasan_gugur && (
          <p className="text-[11px] text-rose-600 mt-1 leading-tight">{h.alasan_gugur}</p>
        )}
      </td>
      <td className="text-center tabular-nums">
        {gugur ? (
          <span className="text-slate-400">—</span>
        ) : (
          <div className="font-mono text-amber-800 font-bold text-xs sm:text-sm">
            {h.pecahan === 'sisa' ? 'Sisa (عصبة)'
              : h.pecahan === 'sisa_2:1' ? 'Sisa 2:1'
              : h.pecahan === '1/6+sisa' ? '1/6 + Sisa'
              : h.pecahan || '—'}
          </div>
        )}
      </td>
      <td className="text-right tabular-nums">
        {gugur ? (
          <span className="text-slate-400">—</span>
        ) : (
          <div>
            <div className="font-bold font-mono text-emerald-700 text-sm sm:text-base">
              {h.saham_total_kelompok?.toFixed(0) || '—'}
            </div>
            {h.jumlah_orang > 1 && (
              <div className="text-[10px] font-mono text-slate-400">
                ({h.saham_per_orang?.toFixed(1) || '—'} /jiwa)
              </div>
            )}
          </div>
        )}
      </td>
      <td className="text-right tabular-nums">
        {gugur ? (
          <span className="text-slate-400">—</span>
        ) : (
          <div>
            <div className="font-bold font-mono text-slate-900 text-xs sm:text-sm">
              {formatRp(h.nominal_total_kelompok)}
            </div>
            {h.jumlah_orang > 1 && (
              <div className="text-[10px] font-mono text-slate-400">
                {formatRp(h.nominal_per_orang)} /jiwa
              </div>
            )}
          </div>
        )}
      </td>
    </tr>
  )
}

export default function StepResult({ hasil, onReset }: StepResultProps) {
  const [copied, setCopied] = useState(false)
  const statusPeny = STATUS_PENYELESAIAN_CONFIG[hasil.status_penyelesaian] || STATUS_PENYELESAIAN_CONFIG.adilah
  const StatusIcon = statusPeny.icon
  const aktif = hasil.hasil.filter(h => !['gugur_halangan', 'gugur_hijab'].includes(h.status))
  const gugur = hasil.hasil.filter(h => ['gugur_halangan', 'gugur_hijab'].includes(h.status))

  const totalSaham = aktif.reduce((s, h) => s + (h.saham_total_kelompok || 0), 0)
  const totalNominal = aktif.reduce((s, h) => s + (h.nominal_total_kelompok || 0), 0)

  const handleCopySummary = () => {
    const lines = [
      `HASIL PEMBAGIAN WARIS FARAIDH (KURIKULUM KMI GONTOR)`,
      `----------------------------------------------------`,
      `Total Tirkah Bersih: ${formatRp(hasil.total_harta_bersih)}`,
      `Asal Masalah: ${hasil.asal_masalah_tashih} (Status: ${statusPeny.label} - ${statusPeny.labelArab})`,
      hasil.kasus_khusus_aktif ? `Kasus Khusus: ${hasil.kasus_khusus_aktif}` : null,
      ``,
      `RINCIAN AHLI WARIS:`,
      ...aktif.map(h => `- ${h.nama_id} (${h.nama_arab}) [${h.jumlah_orang} orang]: Saham ${h.saham_total_kelompok?.toFixed(0)}/${hasil.asal_masalah_tashih} -> Total ${formatRp(h.nominal_total_kelompok)} (${formatRp(h.nominal_per_orang)}/org)`),
      gugur.length > 0 ? `\nGUGUR/MAHJUB:` : null,
      ...gugur.map(h => `- ${h.nama_id} (${h.nama_arab}): ${h.alasan_gugur || 'Terhalang'}`),
      `----------------------------------------------------`,
      `Dihitung via Kalkulator Faraidh Gontor`,
    ].filter(Boolean).join('\n')

    navigator.clipboard.writeText(lines)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="space-y-6">

      {/* ─── Hero Summary Banner ─── */}
      <div className="card text-center relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Hasil Pembagian Waris Selesai
            </h2>
            <span className="text-arabic text-sm text-emerald-800 font-bold">تمت قسمة التركة بنجاح</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mb-6">
          Kalkulasi tirkah syar'i telah dihitung akurat berdasarkan kaidah kitab Faraidh KMI Gontor Kelas 3.
        </p>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-left">
          {/* 1. Tirkah Bersih */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Harta Bersih</span>
              <span className="text-arabic text-[11px] text-slate-400">التركة</span>
            </div>
            <p className="font-bold font-mono text-emerald-700 tabular-nums text-xs sm:text-sm leading-snug">
              {formatRp(hasil.total_harta_bersih)}
            </p>
          </div>

          {/* 2. Asal Masalah */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Asal Masalah</span>
              <span className="text-arabic text-[11px] text-slate-400">أصل المسألة</span>
            </div>
            <p className="font-bold font-mono text-amber-800 text-base sm:text-lg tabular-nums">
              {hasil.asal_masalah_tashih}
              {hasil.juz_sahm > 1 && (
                <span className="text-xs font-normal text-slate-400 ml-1">
                  (×{hasil.juz_sahm})
                </span>
              )}
            </p>
          </div>

          {/* 3. Status Masalah */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Status Syar'i</span>
              <span className="text-arabic text-[11px] text-slate-400">{statusPeny.labelArab}</span>
            </div>
            <p className={`font-semibold text-xs flex items-center gap-1 ${statusPeny.color} truncate`}>
              <StatusIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{statusPeny.label.split(' ')[0]}</span>
            </p>
          </div>

          {/* 4. Ahli Waris Berhak */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Ahli Waris</span>
              <span className="text-arabic text-[11px] text-slate-400">الورثة</span>
            </div>
            <p className="font-bold text-slate-900 text-base sm:text-lg">
              {aktif.length}{' '}
              <span className="text-xs font-normal text-slate-400">Berhak</span>
            </p>
          </div>
        </div>

        {/* Kasus Khusus Banner if active */}
        {hasil.kasus_khusus_aktif && (
          <div className="mt-3 p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs sm:text-sm text-purple-800 flex items-center gap-2 justify-center">
            <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <span>
              Penerapan Kaidah Kasus Khusus:{' '}
              <strong className="capitalize font-bold text-purple-900">{hasil.kasus_khusus_aktif}</strong>
            </span>
          </div>
        )}
      </div>

      {/* ─── Visual Proportional Distribution Bar ─── */}
      {aktif.length > 0 && (
        <div className="card space-y-3 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-700" />
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                Visualisasi Proporsi Saham (السهام الموزعة)
              </span>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {totalSaham.toFixed(0)} / {hasil.asal_masalah_tashih} Saham
            </span>
          </div>

          {/* Bar Segment */}
          <div className="w-full h-4 rounded-lg bg-slate-100 overflow-hidden flex p-0.5 gap-0.5 border border-slate-200">
            {aktif.map((h, i) => {
              const pct = ((h.saham_total_kelompok || 0) / (hasil.asal_masalah_tashih || 1)) * 100
              const color = SHARE_COLORS[i % SHARE_COLORS.length]
              return (
                <div
                  key={h.kode}
                  className={`${color} h-full rounded-sm transition-all duration-300 relative group`}
                  style={{ width: `${Math.max(2, pct)}%` }}
                  title={`${h.nama_id}: ${pct.toFixed(1)}%`}
                />
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            {aktif.map((h, i) => {
              const pct = ((h.saham_total_kelompok || 0) / (hasil.asal_masalah_tashih || 1)) * 100
              const color = SHARE_COLORS[i % SHARE_COLORS.length]
              return (
                <div key={h.kode} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="font-medium">{h.nama_id}</span>
                  <span className="font-mono text-slate-400">({pct.toFixed(1)}%)</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── Detailed Distribution Table ─── */}
      <div className="card p-0 overflow-hidden shadow-sm">
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-2 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-amber-700" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Tabel Pembagian Lengkap
            </h3>
          </div>
          <span className="text-arabic text-xs sm:text-sm text-emerald-800 font-bold">
            جدول توزيع الأنصباء
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th className="w-1/3">
                  Ahli Waris <span className="text-arabic text-slate-400 lowercase">الوارث</span>
                </th>
                <th>
                  Status <span className="text-arabic text-slate-400 lowercase">الحال</span>
                </th>
                <th className="text-center">
                  Pecahan <span className="text-arabic text-slate-400 lowercase">الفرض</span>
                </th>
                <th className="text-right">
                  Saham <span className="text-arabic text-slate-400 lowercase">السهام</span>
                </th>
                <th className="text-right">
                  Nominal <span className="text-arabic text-slate-400 lowercase">النصيب</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {aktif.map(h => <HasilRow key={h.kode} h={h} />)}
              {gugur.length > 0 && (
                <>
                  <tr>
                    <td colSpan={5} className="bg-slate-50 text-[11px] text-rose-700 font-semibold uppercase tracking-wider py-2.5 px-4 border-y border-slate-200">
                      <div className="flex items-center justify-between">
                        <span>Gugur / Terhalang (المحجوبون والممنوعون)</span>
                        <span className="text-slate-400 font-normal">{gugur.length} Ahli Waris</span>
                      </div>
                    </td>
                  </tr>
                  {gugur.map(h => <HasilRow key={h.kode} h={h} />)}
                </>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td colSpan={3} className="font-bold text-slate-900 text-xs sm:text-sm py-3.5 px-4">
                  <div className="flex items-center justify-between">
                    <span>Total Keseluruhan</span>
                    <span className="text-arabic text-xs text-slate-600 font-bold mr-2">المجموع الكلي</span>
                  </div>
                </td>
                <td className="text-right font-bold font-mono tabular-nums text-amber-800 text-sm sm:text-base py-3.5 px-4">
                  {totalSaham.toFixed(0)}
                  <span className="text-slate-400 font-normal text-xs">/{hasil.asal_masalah_tashih}</span>
                </td>
                <td className="text-right font-bold font-mono tabular-nums text-emerald-700 text-xs sm:text-base py-3.5 px-4">
                  {formatRp(totalNominal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ─── Log Edukasi (9 Fase Syar'i) ─── */}
      <LogEdukasiPanel logs={hasil.log_edukasi} />

      {/* ─── Action Controls ─── */}
      <div className="card p-4 flex flex-col sm:flex-row items-center gap-2.5 shadow-sm">
        <button
          onClick={onReset}
          className="btn-primary w-full sm:flex-1 py-3"
          id="reset-kalkulator"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Hitung Kasus Baru</span>
        </button>

        <button
          onClick={handleCopySummary}
          className="btn-secondary w-full sm:flex-1 py-3 text-xs sm:text-sm"
          id="salin-ringkasan"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700">Tersalin ke Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Salin Ringkasan Teks</span>
            </>
          )}
        </button>

        <button
          onClick={() => window.print()}
          className="btn-ghost w-full sm:w-auto border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm"
          id="cetak-hasil"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / PDF</span>
        </button>
      </div>
    </div>
  )
}


