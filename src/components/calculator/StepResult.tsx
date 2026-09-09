'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Scale,
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
  PieChart,
  Info,
  Layers,
  Banknote,
  BookOpen
} from 'lucide-react'
import type { HasilKalkulasi } from '@/lib/faraidh/types'
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
  radd:        { label: 'Radd (Sisa Dikembalikan)', labelArab: 'ردية', color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200', icon: TrendingDown },
  tashih:      { label: 'Tashih (Koreksi Pecahan)', labelArab: 'مصححة', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Wrench },
  kasus_khusus:{ label: 'Kasus Khusus Syar\'i', labelArab: 'مسألة خاصة', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: Sparkles },
}

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

export default function StepResult({ hasil, onReset }: StepResultProps) {
  const [copied, setCopied] = useState(false)
  const [showLog, setShowLog] = useState(true)

  const statusCfg = STATUS_PENYELESAIAN_CONFIG[hasil.status_penyelesaian] || STATUS_PENYELESAIAN_CONFIG.adilah
  const StatusIcon = statusCfg.icon

  // Separate active recipients from excluded heirs
  const berhakList = hasil.hasil.filter(h => !['gugur_halangan', 'gugur_hijab'].includes(h.status))
  const gugurList = hasil.hasil.filter(h => ['gugur_halangan', 'gugur_hijab'].includes(h.status))

  const totalSaham = berhakList.reduce((sum, h) => sum + (h.saham_total_kelompok || 0), 0)
  const totalNominal = berhakList.reduce((sum, h) => sum + (h.nominal_total_kelompok || 0), 0)
  const totalJiwaBerhak = berhakList.reduce((sum, h) => sum + (h.jumlah_orang || 1), 0)

  const copySummary = async () => {
    const lines = [
      `=== HASIL PERHITUNGAN FARAIDH (KURIKULUM GONTOR) ===`,
      `Harta Bersih: Rp ${hasil.total_harta_bersih.toLocaleString('id-ID')}`,
      `Asal Masalah Pokok: ${hasil.asal_masalah_pokok}`,
      hasil.asal_masalah_aul ? `Status: 'AUL (${hasil.asal_masalah_pokok} عالت إلى ${hasil.asal_masalah_aul})` : '',
      hasil.asal_masalah_radd ? `Status: RADD (${hasil.asal_masalah_pokok} ردت إلى ${hasil.asal_masalah_radd})` : '',
      hasil.juz_sahm > 1 ? `Tashih: Juz' as-Sahm = ${hasil.juz_sahm}, Asal Masalah Tashih = ${hasil.asal_masalah_tashih}` : '',
      `Nilai 1 Saham: Rp ${hasil.nilai_satu_saham?.toLocaleString('id-ID')}`,
      ``,
      `--- RINCIAN PEMBAGIAN AHLI WARIS ---`,
      ...berhakList.map(
        h =>
          `${h.nama_id} (${h.nama_arab}) [${h.jumlah_orang} Jiwa]: ${h.pecahan || 'Ashabah'} (${h.pecahan_arab || ''}) | ${h.saham_total_kelompok} Saham | Total: Rp ${h.nominal_total_kelompok?.toLocaleString('id-ID')} | Per Orang: ${h.rumus_nominal_per_orang}`
      ),
      ``,
      gugurList.length > 0 ? `--- AHLI WARIS TERHIJAB / GUGUR ---` : '',
      ...gugurList.map(h => `${h.nama_id} (${h.nama_arab}): ${h.alasan_gugur || 'Terhalang'}`),
      ``,
      `Dihitung otomatis via Sistem Faraidh KMI Pondok Modern Darussalam Gontor`,
    ].filter(Boolean)

    await navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const printPage = () => {
    window.print()
  }

  return (
    <div className="space-y-6 animate-slide-up">
      
      {/* ─── 1. TOP RESULT HERO HEADER ───────────────────────────────── */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge-emerald text-xs font-bold">Kalkulasi Syar'i Selesai</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusCfg.bg} ${statusCfg.color}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                <span>{statusCfg.label} ({statusCfg.labelArab})</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
              Jadwal Pembagian Saham & Tirkah
            </h2>
            <p className="text-arabic text-base text-emerald-800 font-bold mt-0.5">
              جدول قسمة التركة وبيان السهام والأنصباء
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <button
              onClick={copySummary}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
              title="Salin hasil pembagian ke papan klip"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Salin Ringkasan</span>
                </>
              )}
            </button>
            <button
              onClick={printPage}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
              title="Cetak atau simpan sebagai PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>

        {/* ─── 4 SUMMARY STAT CARDS ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* Card 1: Asal Masalah & Perpindahan */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Asal Masalah</span>
              <span className="text-arabic text-xs font-bold text-slate-600">أصل المسألة</span>
            </div>
            
            <div className="flex items-baseline gap-1.5 flex-wrap" dir="ltr">
              {hasil.status_penyelesaian === 'aul' && hasil.asal_masalah_aul ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="line-through text-slate-400 font-mono text-base font-bold">
                    {hasil.asal_masalah_pokok}
                  </span>
                  <span className="text-rose-500 font-bold text-sm">➔</span>
                  <span className="text-rose-700 font-mono text-xl sm:text-2xl font-black">
                    {hasil.asal_masalah_aul}
                  </span>
                  <span className="text-arabic text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded" dir="rtl">
                    عالت إلى {hasil.asal_masalah_aul}
                  </span>
                </div>
              ) : hasil.status_penyelesaian === 'radd' && hasil.asal_masalah_radd ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="line-through text-slate-400 font-mono text-base font-bold">
                    {hasil.asal_masalah_pokok}
                  </span>
                  <span className="text-amber-500 font-bold text-sm">➔</span>
                  <span className="text-amber-800 font-mono text-xl sm:text-2xl font-black">
                    {hasil.asal_masalah_radd}
                  </span>
                  <span className="text-arabic text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded" dir="rtl">
                    ردت إلى {hasil.asal_masalah_radd}
                  </span>
                </div>
              ) : hasil.juz_sahm > 1 ? (
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="font-mono text-slate-500 text-sm font-bold">
                    {hasil.asal_masalah_pokok} × {hasil.juz_sahm} =
                  </span>
                  <span className="text-blue-700 font-mono text-xl sm:text-2xl font-black">
                    {hasil.asal_masalah_tashih}
                  </span>
                </div>
              ) : (
                <span className="text-emerald-700 font-mono text-xl sm:text-2xl font-black">
                  {hasil.asal_masalah_pokok}
                </span>
              )}
            </div>

            <p className="text-[10px] text-slate-500 leading-tight">
              {hasil.status_penyelesaian === 'aul' ? "Mengalami 'Aul (saham membengkak)"
                : hasil.status_penyelesaian === 'radd' ? 'Mengalami Radd (sisa dikembalikan)'
                : hasil.juz_sahm > 1 ? `Tashih (Juz'us Sahm = ${hasil.juz_sahm})`
                : "'Adilah (KPK penyebut pas)"}
            </p>
          </div>

          {/* Card 2: Total Saham Terbagi */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Total Saham</span>
              <span className="text-arabic text-xs font-bold text-slate-600">مجموع السهام</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-slate-900 font-mono text-xl sm:text-2xl font-black">
                {totalSaham}
              </span>
              <span className="text-xs text-slate-500 font-mono">/ {hasil.asal_masalah_tashih}</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              {totalSaham === hasil.asal_masalah_tashih ? '100% Saham terbagi habis sempurna' : `${totalSaham} Saham terdistribusi`}
            </p>
          </div>

          {/* Card 3: Nilai 1 Saham */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Nilai 1 Saham</span>
              <span className="text-arabic text-xs font-bold text-slate-600">قيمة السهم</span>
            </div>
            <div className="text-slate-900 font-mono text-sm sm:text-base font-bold truncate">
              Rp {hasil.nilai_satu_saham?.toLocaleString('id-ID')}
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Harta Bersih ÷ {hasil.asal_masalah_tashih} Asal Masalah
            </p>
          </div>

          {/* Card 4: Total Harta Bersih */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs text-emerald-800">
              <span className="font-semibold">Tirkah Bersih</span>
              <span className="text-arabic text-xs font-bold text-emerald-800">التركة الصافية</span>
            </div>
            <div className="text-emerald-800 font-mono text-sm sm:text-base font-extrabold truncate">
              Rp {hasil.total_harta_bersih.toLocaleString('id-ID')}
            </div>
            <p className="text-[10px] text-emerald-700 leading-tight">
              Siap dibagi ke {totalJiwaBerhak} jiwa ahli waris
            </p>
          </div>
        </div>

        {/* ─── PEDAGOGICAL PERPINDAHAN ASAL MASALAH BANNER ─── */}
        {hasil.penjelasan_perpindahan && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900">Catatan Kaidah Masalah: </span>
              <span>{hasil.penjelasan_perpindahan}</span>
            </div>
          </div>
        )}
      </div>

      {/* ─── 2. TASHIH & MAHFUDZAT BREAKDOWN (KHUSUS JIKA ADA INKISAR) ─── */}
      {hasil.mahfudzat_detail && hasil.mahfudzat_detail.length > 0 && (
        <div className="card bg-blue-50/40 border border-blue-200 space-y-3">
          <div className="flex items-center justify-between border-b border-blue-200/80 pb-2.5">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-700" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Rincian Kaidah Tashih al-Masail (الانكسار والمحفوظات)
              </h3>
            </div>
            <span className="badge-blue text-xs font-bold">
              Juz'us Sahm (جزء السهم) = {hasil.juz_sahm}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Terjadi <strong>Inkisâr</strong> (pembagian saham tidak habis dibagi kepala pewaris). Berikut rincian penentuan <em>Mahfudz</em> per kelompok dan <em>Juz'us Sahm</em> sesuai kurikulum Faraidh:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left bg-white border border-blue-200 rounded-xl overflow-hidden">
              <thead className="bg-blue-100/60 text-blue-900 font-bold border-b border-blue-200">
                <tr>
                  <th className="px-3 py-2">Golongan Ahli Waris</th>
                  <th className="px-3 py-2 text-center">Saham Asal (السهام)</th>
                  <th className="px-3 py-2 text-center">Jumlah Jiwa (الرؤوس)</th>
                  <th className="px-3 py-2 text-center">Relasi Fikih (النسبة)</th>
                  <th className="px-3 py-2 text-center">Nilai Mahfudz (المحفوظ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100 text-slate-700">
                {hasil.mahfudzat_detail.map(md => (
                  <tr key={md.kode} className="hover:bg-blue-50/40">
                    <td className="px-3 py-2.5 font-semibold text-slate-900">
                      {md.nama_id} <span className="text-arabic text-emerald-800 font-bold">({md.nama_arab})</span>
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-800">
                      {md.saham_asal}
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-800">
                      {md.kepala} Jiwa
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-800">
                        {md.relasi === 'muwafaqah' ? 'Muwafaqah (توافق)' : 'Mubayanah (تباين)'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono font-extrabold text-blue-800 text-sm">
                      {md.mahfudz}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-white rounded-xl border border-blue-200/80 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <strong>KPK dari Mahfudzat:</strong> [{hasil.mahfudzat_detail.map(m => m.mahfudz).join(', ')}] → <strong>Juz' as-Sahm = {hasil.juz_sahm}</strong>
            </div>
            <div className="font-mono font-bold text-blue-900">
              Asal Masalah Tashih: {hasil.asal_masalah} × {hasil.juz_sahm} = {hasil.asal_masalah_tashih}
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. PROPORTIONAL SHARE BAR ───────────────────────────────── */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Visualisasi Proporsi Pembagian Waris
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">{totalSaham} / {hasil.asal_masalah_tashih} Saham</span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="h-3.5 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner border border-slate-200">
          {berhakList.map((h, i) => {
            const pct = hasil.asal_masalah_tashih > 0
              ? ((h.saham_total_kelompok || 0) / hasil.asal_masalah_tashih) * 100
              : 0
            const color = SHARE_COLORS[i % SHARE_COLORS.length]
            return (
              <div
                key={h.kode}
                style={{ width: `${pct}%` }}
                className={`${color} h-full transition-all duration-500 relative group`}
                title={`${h.nama_id}: ${pct.toFixed(1)}% (${h.saham_total_kelompok} saham)`}
              />
            )
          })}
        </div>

        {/* Legend Chips */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-xs">
          {berhakList.map((h, i) => {
            const pct = hasil.asal_masalah_tashih > 0
              ? ((h.saham_total_kelompok || 0) / hasil.asal_masalah_tashih) * 100
              : 0
            const color = SHARE_COLORS[i % SHARE_COLORS.length]
            return (
              <div key={h.kode} className="flex items-center gap-1.5 text-slate-700">
                <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="font-semibold">{h.nama_id}:</span>
                <span className="font-mono text-slate-600">{pct.toFixed(1)}% ({h.saham_total_kelompok} Saham)</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── 4. TABEL 1: PEMBAGIAN SAHAM & KAIDAH FIKIH ──────────────── */}
      <div className="card space-y-3.5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                1. Tabel Pembagian Saham & Kaidah Fikih
              </h3>
              <p className="text-xs text-slate-500">
                Porsi pasti (Furudh), status Ashabah, syarat fikih, dan perolehan saham waris.
              </p>
            </div>
          </div>
          <span className="text-arabic text-sm text-emerald-800 font-bold hidden sm:inline">
            جدول السهام والتأصيل
          </span>
        </div>

        <div className="overflow-x-auto -mx-5 sm:-mx-6">
          <table className="w-full text-xs sm:text-sm text-left border-collapse">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-700">
              <tr>
                <th className="px-4 sm:px-5 py-2.5 font-bold">Ahli Waris (الوارث)</th>
                <th className="px-3 py-2.5 font-bold text-center">Jiwa (الرؤوس)</th>
                <th className="px-3 py-2.5 font-bold text-center">Porsi (الفرض / العصبة)</th>
                <th className="px-4 py-2.5 font-bold">Syarat & Alasan Fikih (الحالة والشروط)</th>
                <th className="px-3 py-2.5 font-bold text-center">Saham (السهام)</th>
                <th className="px-4 sm:px-5 py-2.5 font-bold text-right">Porsi (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {berhakList.map(h => {
                const cfg = STATUS_CONFIG[h.status] || STATUS_CONFIG.furudh
                const pct = hasil.asal_masalah_tashih > 0
                  ? ((h.saham_total_kelompok || 0) / hasil.asal_masalah_tashih) * 100
                  : 0

                return (
                  <tr key={h.kode} className="hover:bg-slate-50/80 transition-colors">
                    {/* Ahli Waris */}
                    <td className="px-4 sm:px-5 py-3">
                      <div className="font-bold text-slate-900">{h.nama_id}</div>
                      <div className="text-arabic text-sm text-emerald-900 font-bold">{h.nama_arab}</div>
                      <span className={`${cfg.badge} text-[10px] py-0 mt-0.5 inline-block`}>
                        {cfg.label}
                      </span>
                    </td>

                    {/* Jiwa */}
                    <td className="px-3 py-3 text-center font-mono font-bold text-slate-800">
                      {h.jumlah_orang}
                    </td>

                    {/* Porsi */}
                    <td className="px-3 py-3 text-center">
                      <div className="font-mono font-black text-amber-800 text-xs sm:text-sm">
                        {h.pecahan === 'sisa' ? 'Sisa (عصبة)'
                          : h.pecahan === 'sisa_2:1' ? 'Sisa 2:1'
                          : h.pecahan === '1/6+sisa' ? '1/6 + Sisa'
                          : h.pecahan || '—'}
                      </div>
                      <div className="text-arabic text-xs text-slate-500 font-bold mt-0.5">
                        {h.pecahan_arab}
                      </div>
                    </td>

                    {/* Syarat & Alasan */}
                    <td className="px-4 py-3 text-xs text-slate-600 leading-relaxed max-w-xs">
                      {h.alasan_syarat || h.keterangan || 'Sesuai ketentuan kaidah waris syar\'i.'}
                    </td>

                    {/* Saham */}
                    <td className="px-3 py-3 text-center tabular-nums">
                      <div className="font-bold font-mono text-emerald-700 text-sm sm:text-base">
                        {h.saham_total_kelompok}
                      </div>
                      {h.saham_asal && h.saham_asal !== h.saham_total_kelompok && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          (Asal: {h.saham_asal} × {hasil.juz_sahm})
                        </div>
                      )}
                      {h.jumlah_orang > 1 && (
                        <div className="text-[10px] font-mono text-slate-500">
                          {h.saham_per_orang} /jiwa
                        </div>
                      )}
                    </td>

                    {/* Porsi (%) */}
                    <td className="px-4 sm:px-5 py-3 text-right font-mono font-bold text-slate-700">
                      {pct.toFixed(1)}%
                    </td>
                  </tr>
                )
              })}
            </tbody>

            {/* Table Footer */}
            <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-bold text-slate-900 text-xs sm:text-sm">
              <tr>
                <td className="px-4 sm:px-5 py-2.5">
                  <span>TOTAL SAHAM (المجموع)</span>
                </td>
                <td className="px-3 py-2.5 text-center font-mono">
                  {totalJiwaBerhak} Jiwa
                </td>
                <td className="px-3 py-2.5 text-center text-arabic text-emerald-800 font-bold">
                  كامل التركة
                </td>
                <td className="px-4 py-2.5 text-slate-500 text-xs">
                  {hasil.status_penyelesaian === 'adilah' ? 'Terbagi Sempurna (100%)'
                    : hasil.status_penyelesaian === 'aul' ? "Proporsional ('Aul)"
                    : hasil.status_penyelesaian === 'radd' ? 'Sisa dikembalikan (Radd)'
                    : 'Tashih disesuaikan'}
                </td>
                <td className="px-3 py-2.5 text-center font-mono text-emerald-700 text-sm sm:text-base">
                  {totalSaham} Saham
                </td>
                <td className="px-4 sm:px-5 py-2.5 text-right font-mono text-emerald-800">
                  100%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ─── 5. TABEL 2: PEMBAGIAN NOMINAL HARTA BERSIH (RUPIAH) ─────── */}
      <div className="card space-y-3.5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-emerald-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                2. Tabel Distribusi Nominal Harta Bersih (Rupiah)
              </h3>
              <p className="text-xs text-slate-500">
                Nilai rupiah total per golongan dan nominal bersih per individu (per jiwa).
              </p>
            </div>
          </div>
          <span className="text-arabic text-sm text-emerald-800 font-bold hidden sm:inline">
            جدول توزيع التركة النقدية
          </span>
        </div>

        <div className="overflow-x-auto -mx-5 sm:-mx-6">
          <table className="w-full text-xs sm:text-sm text-left border-collapse">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-700">
              <tr>
                <th className="px-4 sm:px-5 py-2.5 font-bold">Ahli Waris (الوارث)</th>
                <th className="px-3 py-2.5 font-bold text-center">Saham (السهام)</th>
                <th className="px-4 py-2.5 font-bold">Rumus Hitung Saham</th>
                <th className="px-4 py-2.5 font-bold text-right">Total Bagian Golongan (نصيب الفئة)</th>
                <th className="px-4 sm:px-5 py-2.5 font-bold text-right">Bagian Bersih Per Orang (نصيب الفرد)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {berhakList.map(h => (
                <tr key={h.kode} className="hover:bg-slate-50/80 transition-colors">
                  {/* Ahli Waris */}
                  <td className="px-4 sm:px-5 py-3">
                    <div className="font-bold text-slate-900">{h.nama_id}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-arabic text-xs text-emerald-800 font-bold">{h.nama_arab}</span>
                      <span className="badge-slate text-[10px] py-0">{h.jumlah_orang} Jiwa</span>
                    </div>
                  </td>

                  {/* Saham */}
                  <td className="px-3 py-3 text-center font-mono font-bold text-emerald-700 text-sm sm:text-base tabular-nums">
                    {h.saham_total_kelompok}
                  </td>

                  {/* Rumus Hitung */}
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    ({h.saham_total_kelompok} ÷ {hasil.asal_masalah_tashih}) × Rp {hasil.total_harta_bersih.toLocaleString('id-ID')}
                  </td>

                  {/* Total Golongan */}
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 text-xs sm:text-sm tabular-nums">
                    Rp {h.nominal_total_kelompok?.toLocaleString('id-ID')}
                  </td>

                  {/* Bagian Per Jiwa */}
                  <td className="px-4 sm:px-5 py-3 text-right tabular-nums">
                    <div className="font-mono font-black text-emerald-800 text-xs sm:text-sm">
                      Rp {h.nominal_per_orang?.toLocaleString('id-ID')}
                    </div>
                    {h.jumlah_orang > 1 && (
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {h.rumus_nominal_per_orang}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Table Footer */}
            <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-bold text-slate-900 text-xs sm:text-sm">
              <tr>
                <td className="px-4 sm:px-5 py-2.5">
                  <span>TOTAL HARTA TERBAGI (المجموع)</span>
                </td>
                <td className="px-3 py-2.5 text-center font-mono text-emerald-700">
                  {totalSaham} Saham
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-500 font-sans">
                  Nilai 1 Saham = Rp {hasil.nilai_satu_saham?.toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-emerald-800 text-sm sm:text-base">
                  Rp {totalNominal.toLocaleString('id-ID')}
                </td>
                <td className="px-4 sm:px-5 py-2.5 text-right font-mono text-emerald-800">
                  100% Pas Terbagi
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ─── 6. AHLI WARIS TERHIJAB / GUGUR SECTION ───────────────────── */}
      {gugurList.length > 0 && (
        <div className="card bg-rose-50/40 border border-rose-200 space-y-3">
          <div className="flex items-center justify-between border-b border-rose-200/80 pb-2.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-700" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Ahli Waris Terhijab / Gugur dari Hak Waris (المحجوبون والممنوعون)
              </h3>
            </div>
            <span className="badge-red text-xs font-bold">
              {gugurList.length} Hubungan Tidak Menerima Waris
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Berdasarkan kaidah <em>Hijab Hirman</em> (الأقرب يحجب الأبعد) dan <em>Mawani' al-Irts</em>, kerabat di bawah ini tidak mendapat warisan:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {gugurList.map(h => (
              <div key={h.kode} className="p-3 bg-white border border-rose-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{h.nama_id}</span>
                  <span className="text-arabic text-sm text-rose-900 font-bold">{h.nama_arab}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="badge-red text-[10px] py-0">
                    {h.status === 'gugur_hijab' ? 'Mahjub Hirman (محجوب)' : 'Mani\' Syar\'i (ممنوع)'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">{h.jumlah_orang} Jiwa</span>
                </div>
                <p className="text-xs text-rose-700 leading-tight pt-0.5">
                  {h.alasan_gugur || h.keterangan || 'Gugur dari hak waris.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 7. DETAIL 9 FASE DERIVASI LOG (ACCORDION) ───────────────── */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Detail 9 Fase Kaidah Syar'i (Derivasi Log)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowLog(!showLog)}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
          >
            {showLog ? 'Sembunyikan Log' : 'Tampilkan 9 Fase'}
          </button>
        </div>

        {showLog && (
          <LogEdukasiPanel logs={hasil.log_edukasi} />
        )}
      </div>

      {/* ─── 8. RESET & NEW CALCULATION BUTTON ───────────────────────── */}
      <div className="pt-2">
        <button
          onClick={onReset}
          className="btn-primary w-full py-4 text-sm sm:text-base font-bold shadow-sm"
          id="btn-recalculate"
        >
          <RotateCcw className="w-4 h-4 mr-1.5" />
          <span>Hitung Kasus Baru (Ulangi dari Awal)</span>
        </button>
      </div>
    </div>
  )
}
