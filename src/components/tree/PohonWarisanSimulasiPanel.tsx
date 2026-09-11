'use client'

import React, { useState } from 'react'
import {
  X,
  Calculator,
  RotateCcw,
  BookOpen,
  DollarSign,
  Users,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Sparkles,
  HelpCircle,
  FileText,
  Percent,
  Layers,
} from 'lucide-react'
import {
  type HasilKalkulasi,
  type HasilPerAhliWaris,
  type LogEdukasi,
  getHeirHierarchyRank,
} from '@/lib/faraidh/types'
import { KasusKhususMaklumatCard } from '@/components/calculator/KasusKhususMaklumatCard'

export interface SimulasiTirkahInput {
  harta_kotor: number
  biaya_tajhiz: number
  hutang_terikat: number
  hutang_biasa: number
  wasiat: number
}

export interface PresetCase {
  id: string
  title: string
  titleArab: string
  subtitle: string
  jenazahGender: 'L' | 'P'
  heirs: Record<string, number>
  tirkah: number
  description: string
}

export const PRESET_CASES: PresetCase[] = [
  {
    id: 'standar_keluarga',
    title: 'Keluarga Inti (Standar)',
    titleArab: 'المسألة النموذجية',
    subtitle: 'Istri, 1 Anak Laki-laki, 1 Anak Perempuan',
    jenazahGender: 'L',
    heirs: { pasangan: 1, anak_lk: 1, anak_pr: 1 },
    tirkah: 120000000,
    description: 'Istri mendapat 1/8 karena ada keturunan. Anak Laki & Perempuan berbagi sisa sebagai Ashabah Bil-Ghair (2:1).'
  },
  {
    id: 'gharrawain_suami',
    title: 'Gharrawain (Umariyyatan)',
    titleArab: 'الغَرَاوَيْن / العُمَرِيَّة',
    subtitle: 'Suami, Ibu, Ayah Kandung',
    jenazahGender: 'P',
    heirs: { pasangan: 1, ibu: 1, ayah: 1 },
    tirkah: 60000000,
    description: 'Diputuskan oleh Umar bin Khattab ra. Suami 1/2, Ibu mendapat 1/3 SISA (bukan 1/3 total) agar bagian Ayah tetap 2x lipat bagian Ibu.'
  },
  {
    id: 'aul_standar',
    title: 'Kasus \'Aul (Saham Melampaui)',
    titleArab: 'العَوْل',
    subtitle: 'Suami, 2 Saudari Kandung, Ibu',
    jenazahGender: 'P',
    heirs: { pasangan: 1, saudari_kandung: 2, ibu: 1 },
    tirkah: 80000000,
    description: 'Total saham fardh (1/2 + 2/3 + 1/6 = 3 + 4 + 1 = 8) melebihi Asal Masalah (6). Asal Masalah dinaikkan ke 8 (\'Aul) dan nominal berkurang secara proporsional.'
  },
  {
    id: 'radd_standar',
    title: 'Kasus Radd (Sisa Kembali)',
    titleArab: 'الرَّدّ',
    subtitle: 'Ibu dan 1 Anak Perempuan',
    jenazahGender: 'L',
    heirs: { ibu: 1, anak_pr: 1 },
    tirkah: 100000000,
    description: 'Tidak ada Ashabah. Ibu (1/6) + Anak Pr (1/2 = 3/6) total hanya 4/6. Sisa 2/6 dikembalikan proporsional kepada Ashabul Furudh (Asal Masalah menjadi 4).'
  },
  {
    id: 'musytarakah',
    title: 'Kasus Musytarakah (Himarriyah)',
    titleArab: 'المُشْتَرَكَة / الحِمَارِيَّة',
    subtitle: 'Suami, Ibu, 2 Sdr Seibu, 1 Sdr Lk Kandung',
    jenazahGender: 'P',
    heirs: { pasangan: 1, ibu: 1, saudara_lk_seibu: 2, saudara_lk_kandung: 1 },
    tirkah: 120000000,
    description: 'Saudara laki-laki sekandung diserikatkan ke dalam 1/3 bagian saudara seibu atas dasar kesamaan ibu (Ikhwah li Umm).'
  },
  {
    id: 'qarib_mubarak',
    title: 'Cucu Penolong (Al-Qarib al-Mubarak)',
    titleArab: 'القَرِيب المُبَارَك',
    subtitle: '2 Anak Perempuan, 1 Cucu Pr, 1 Cucu Lk',
    jenazahGender: 'L',
    heirs: { anak_pr: 2, cucu_pr: 1, cucu_lk: 1 },
    tirkah: 150000000,
    description: '2 Anak Pr menghabiskan kuota 2/3. Cucu Pr yang seharusnya gugur terselamatkan oleh hadirnya Cucu Laki-laki sebagai Ashabah Bil-Ghair.'
  },
  {
    id: 'kalalah',
    title: 'Kasus Kalalah (Tanpa Usul & Furu\')',
    titleArab: 'الكَلَالَة',
    subtitle: '1 Sdr Lk Seibu, 1 Sdri Seibu, 1 Sdri Kandung',
    jenazahGender: 'L',
    heirs: { saudara_lk_seibu: 1, saudari_seibu: 1, saudari_kandung: 1 },
    tirkah: 90000000,
    description: 'Pewaris tidak memiliki orang tua dan keturunan. 2 Saudara/i Seibu berbagi rata 1/3 (1:1 laki & perempuan), Saudari Kandung mendapat 1/2.'
  }
]

interface PohonWarisanSimulasiPanelProps {
  isOpen: boolean
  onClose: () => void
  jenazahGender: 'L' | 'P'
  selectedHeirs: Record<string, number>
  onUpdateHeirQty: (nodeId: string, qty: number) => void
  onResetHeirs: () => void
  onApplyPreset: (preset: PresetCase) => void
  calculationResult: HasilKalkulasi | null
  tirkahInput: SimulasiTirkahInput
  onUpdateTirkahInput: (newInput: Partial<SimulasiTirkahInput>) => void
}

export const PohonWarisanSimulasiPanel: React.FC<PohonWarisanSimulasiPanelProps> = ({
  isOpen,
  onClose,
  jenazahGender,
  selectedHeirs,
  onUpdateHeirQty,
  onResetHeirs,
  onApplyPreset,
  calculationResult,
  tirkahInput,
  onUpdateTirkahInput,
}) => {
  const [activeTab, setActiveTab] = useState<'tabel' | 'tirkah' | 'preset' | 'dalil'>('tabel')

  if (!isOpen) return null

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const activeHeirCount = Object.values(selectedHeirs).reduce((a, b) => a + b, 0)

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'adilah':
        return { label: 'Mas\'alah \'Adilah (Tepat)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
      case 'aul':
        return { label: 'Kasus \'Aul (Melampaui)', color: 'bg-amber-100 text-amber-800 border-amber-300' }
      case 'radd':
        return { label: 'Kasus Radd (Sisa Kembali)', color: 'bg-blue-100 text-blue-800 border-blue-300' }
      case 'tashih':
        return { label: 'Tashih (Pecahan Saham)', color: 'bg-purple-100 text-purple-800 border-purple-300' }
      case 'kasus_khusus':
        return { label: 'Kasus Khusus Khilafiyah', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' }
      default:
        return { label: 'Siap Dikalkulasi', color: 'bg-slate-100 text-slate-800 border-slate-300' }
    }
  }

  const statusBadge = getStatusBadge(
    calculationResult?.kasus_khusus_aktif
      ? 'kasus_khusus'
      : calculationResult?.asal_masalah_aul
      ? 'aul'
      : calculationResult?.asal_masalah_radd
      ? 'radd'
      : 'adilah'
  )

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs z-40 sm:hidden transition-opacity animate-in fade-in duration-200"
      />

      <aside className="fixed bottom-0 left-0 right-0 h-[82vh] max-h-[90vh] sm:h-auto sm:max-h-none sm:top-14 sm:bottom-0 sm:left-auto sm:right-0 w-full sm:w-[480px] lg:w-[520px] bg-white rounded-t-3xl sm:rounded-none border-t sm:border-t-0 sm:border-l border-slate-200 shadow-2xl z-50 flex flex-col transition-all duration-300 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:slide-in-from-right overflow-hidden">
        
        {/* Mobile Pull Handle Tab */}
        <div className="pt-2.5 pb-1 sm:hidden flex justify-center cursor-pointer bg-slate-50 border-b border-slate-100" onClick={onClose}>
          <div className="w-12 h-1.5 bg-slate-300 rounded-full hover:bg-slate-400 transition-colors" />
        </div>

        {/* ═══ HEADER PANEL ══════════════════════════════════════════ */}
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                Simulasi &amp; Hasil Faraidh
              </h2>
              <p className="text-[11px] text-slate-500 font-arabic" dir="rtl">
                حِسَابُ الفَرَائِضِ وَالقِسْمَة
              </p>
            </div>
          </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onResetHeirs}
            title="Reset Pilihan Ahli Waris"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ═══ SUB-HEADER / QUICK INFO ═══════════════════════════════ */}
      <div className="px-4 py-2.5 bg-blue-50/60 border-b border-blue-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Pewaris:</span>
          <span className={`px-2 py-0.5 rounded-full font-bold border text-[11px] ${
            jenazahGender === 'L' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-rose-100 text-rose-800 border-rose-200'
          }`}>
            {jenazahGender === 'L' ? '♂ Suami / Mayyit' : '♀ Istri / Mayyitah'}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600 font-medium">
            {activeHeirCount} Ahli Waris Hidup
          </span>
        </div>

        <span className={`px-2 py-0.5 rounded-md font-bold text-[10.5px] border ${statusBadge.color}`}>
          {statusBadge.label}
        </span>
      </div>

      {/* ═══ NAVIGATION TABS ═══════════════════════════════════════ */}
      <div className="flex border-b border-slate-200 bg-white px-2 pt-1 gap-1 flex-shrink-0 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('tabel')}
          className={`flex-1 py-2 px-1 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'tabel'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Tabel Waris</span>
        </button>

        <button
          onClick={() => setActiveTab('tirkah')}
          className={`flex-1 py-2 px-1 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'tirkah'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Harta (Tirkah)</span>
        </button>

        <button
          onClick={() => setActiveTab('preset')}
          className={`flex-1 py-2 px-1 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'preset'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Preset Kasus</span>
        </button>

        <button
          onClick={() => setActiveTab('dalil')}
          className={`flex-1 py-2 px-1 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'dalil'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Log Kaidah</span>
        </button>
      </div>

      {/* ═══ TAB CONTENT (SCROLLABLE BODY) ═════════════════════════ */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* ─── TAB 1: TABEL HASIL WARIS ──────────────────────────── */}
        {activeTab === 'tabel' && (
          <div className="space-y-4">
            
            {/* Summary Metrics Cards with Clear Progression */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Card 1: Asal Masalah (Pokok -> Penyesuaian) */}
              <div className={`p-2.5 rounded-xl border transition-all ${
                calculationResult?.asal_masalah_aul
                  ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                  : calculationResult?.asal_masalah_radd
                  ? 'bg-blue-50/80 border-blue-300 text-blue-950'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <span className="text-[10px] uppercase font-bold text-slate-500 block leading-tight">
                  Asal Masalah
                </span>
                {calculationResult?.asal_masalah_aul ? (
                  <div>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <span className="text-xs text-slate-400 line-through font-semibold">
                        {calculationResult.asal_masalah_pokok}
                      </span>
                      <span className="text-sm font-black text-amber-700 font-mono">
                        → {calculationResult.asal_masalah_aul}
                      </span>
                    </div>
                    <span className="text-[9.5px] font-extrabold text-amber-800 bg-amber-200/80 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                      'Aul (+{calculationResult.asal_masalah_aul - calculationResult.asal_masalah_pokok})
                    </span>
                  </div>
                ) : calculationResult?.asal_masalah_radd ? (
                  <div>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <span className="text-xs text-slate-400 line-through font-semibold">
                        {calculationResult.asal_masalah_pokok}
                      </span>
                      <span className="text-sm font-black text-blue-700 font-mono">
                        → {calculationResult.asal_masalah_radd}
                      </span>
                    </div>
                    <span className="text-[9.5px] font-extrabold text-blue-800 bg-blue-200/80 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                      Radd (-{calculationResult.asal_masalah_pokok - calculationResult.asal_masalah_radd})
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-base font-extrabold text-slate-800 block mt-0.5">
                      {calculationResult?.asal_masalah || '-'}
                    </span>
                    <span className="text-[9.5px] text-slate-500 font-medium">
                      {calculationResult ? 'Pokok (\'Adilah)' : 'Belum Ada'}
                    </span>
                  </div>
                )}
              </div>

              {/* Card 2: Tashih / Total Saham */}
              <div className={`p-2.5 rounded-xl border transition-all ${
                (calculationResult?.juz_sahm || 1) > 1
                  ? 'bg-purple-50/80 border-purple-300 text-purple-950'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <span className="text-[10px] uppercase font-bold text-slate-500 block leading-tight">
                  Tashih / Saham
                </span>
                {(calculationResult?.juz_sahm || 1) > 1 ? (
                  <div>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <span className="text-xs text-slate-500 font-mono font-semibold">
                        {calculationResult?.asal_masalah}×{calculationResult?.juz_sahm}
                      </span>
                      <span className="text-sm font-black text-purple-700 font-mono">
                        = {calculationResult?.asal_masalah_tashih}
                      </span>
                    </div>
                    <span className="text-[9.5px] font-extrabold text-purple-800 bg-purple-200/80 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                      Juz' Sahm (×{calculationResult?.juz_sahm})
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-base font-extrabold text-blue-700 block mt-0.5">
                      {calculationResult?.asal_masalah_tashih || calculationResult?.asal_masalah || '-'}
                    </span>
                    <span className="text-[9.5px] text-slate-500 font-medium">
                      {calculationResult ? 'Tanpa Inkisâr' : 'Belum Ada'}
                    </span>
                  </div>
                )}
              </div>

              {/* Card 3: Harta Bersih & Nilai 1 Saham */}
              <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-300 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block leading-tight">
                  Harta Bersih
                </span>
                <span className="text-xs font-bold text-emerald-900 block truncate mt-0.5">
                  {formatRupiah(calculationResult?.total_harta_bersih || 0)}
                </span>
                <span className="text-[9.5px] text-emerald-700 font-medium block truncate mt-0.5">
                  {calculationResult?.nilai_satu_saham
                    ? `@${formatRupiah(calculationResult.nilai_satu_saham)}/saham`
                    : 'Siap Dibagi'}
                </span>
              </div>
            </div>

            {/* Detailed Progression Explanation Card (Alur Takhrij & Tashih) */}
            {calculationResult && activeHeirCount > 0 && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Alur Hitungan Faraidh:</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
                  {/* Step 1: Pokok */}
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 whitespace-nowrap shadow-2xs">
                    <span className="text-slate-400 font-bold">1. Pokok:</span>
                    <span className="font-mono font-bold text-slate-800">{calculationResult.asal_masalah_pokok}</span>
                  </div>

                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />

                  {/* Step 2: Aul / Radd / Adilah */}
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border whitespace-nowrap shadow-2xs ${
                    calculationResult.asal_masalah_aul
                      ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                      : calculationResult.asal_masalah_radd
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                  }`}>
                    <span className="opacity-75">2. Penyesuaian:</span>
                    <span className="font-mono">
                      {calculationResult.asal_masalah_aul
                        ? `'Aul (${calculationResult.asal_masalah_pokok} → ${calculationResult.asal_masalah_aul})`
                        : calculationResult.asal_masalah_radd
                        ? `Radd (${calculationResult.asal_masalah_pokok} → ${calculationResult.asal_masalah_radd})`
                        : `'Adilah (Tepat ${calculationResult.asal_masalah_pokok})`}
                    </span>
                  </div>

                  {/* Step 3: Tashih (if any) */}
                  {calculationResult.juz_sahm > 1 && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-50 border border-purple-300 text-purple-900 font-bold whitespace-nowrap shadow-2xs">
                        <span className="opacity-75">3. Tashih:</span>
                        <span className="font-mono">
                          {calculationResult.asal_masalah} × {calculationResult.juz_sahm} = {calculationResult.asal_masalah_tashih}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Explanation text */}
                <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-2 rounded-lg border border-slate-200">
                  {calculationResult.penjelasan_perpindahan ||
                    (calculationResult.asal_masalah_aul
                      ? `Asal Masalah Pokok ${calculationResult.asal_masalah_pokok} mengalami 'Aul (membengkak) menjadi ${calculationResult.asal_masalah_aul} karena total saham furudh melebihi pokok.`
                      : calculationResult.asal_masalah_radd
                      ? `Asal Masalah Pokok ${calculationResult.asal_masalah_pokok} disesuaikan menjadi ${calculationResult.asal_masalah_radd} melalui kaidah Radd (sisa dikembalikan proporsional).`
                      : `Asal Masalah Pokok ${calculationResult.asal_masalah_pokok} berstatus 'Adilah (total saham pas sama dengan pokok).`)}
                </p>
              </div>
            )}

            {/* Special Case Educational Card */}
            {calculationResult?.kasus_khusus_aktif && (
              <KasusKhususMaklumatCard
                kasusKode={calculationResult.kasus_khusus_aktif}
                kasusMaklumat={calculationResult.kasus_khusus_maklumat}
                defaultExpanded={true}
              />
            )}

            {/* Main Heirs Table */}
            {activeHeirCount === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Belum Ada Ahli Waris Dipilih</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                  Klik card pada kanvas Pohon Warisan untuk menambahkan ahli waris yang masih hidup ke dalam simulasi.
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2 px-3">Ahli Waris</th>
                      <th className="py-2 px-2 text-center">Porsi</th>
                      <th className="py-2 px-2 text-center">Saham</th>
                      <th className="py-2 px-3 text-right">Nominal (Total)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {calculationResult?.hasil.map((heir: HasilPerAhliWaris) => {
                      const isMahjub = heir.status === 'gugur_hijab'
                      const isAshabah = heir.status.startsWith('ashabah')

                      return (
                        <tr
                          key={heir.kode}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isMahjub ? 'bg-rose-50/40 text-rose-900' : ''
                          }`}
                        >
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800">
                                {heir.nama_id}
                              </span>
                              {heir.jumlah_orang > 1 && (
                                <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-bold text-[10px]">
                                  ×{heir.jumlah_orang}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-arabic" dir="rtl">
                              {heir.nama_arab}
                            </p>
                            {isMahjub && (
                              <p className="text-[10px] text-rose-600 font-semibold mt-0.5">
                                ⛔ {heir.alasan_gugur || 'Terhijab Hirman'}
                              </p>
                            )}
                          </td>

                          <td className="py-2 px-2 text-center">
                            {isMahjub ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                                Mahjub
                              </span>
                            ) : isAshabah ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                {heir.status === 'ashabah_bin_nafsih'
                                  ? 'Ashabah (Sisa)'
                                  : heir.status === 'ashabah_bil_ghair'
                                  ? 'Ashabah (2:1)'
                                  : 'Ashabah Ma\'al'}
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[11px] font-extrabold bg-blue-100 text-blue-800">
                                {heir.pecahan ? heir.pecahan.replace('_gabungan', '') : '-'}
                              </span>
                            )}
                          </td>

                          <td className="py-2 px-2 text-center font-mono font-bold text-slate-700">
                            {isMahjub ? '0' : heir.saham_total_kelompok ?? heir.saham_tashih ?? heir.saham_asal ?? '-'}
                          </td>

                          <td className="py-2 px-3 text-right font-bold text-slate-900">
                            {isMahjub ? (
                              <span className="text-slate-400 font-normal">Rp 0</span>
                            ) : (
                              <div>
                                <span className="text-emerald-700">
                                  {formatRupiah(heir.nominal_total_kelompok || 0)}
                                </span>
                                {heir.jumlah_orang > 1 && (
                                  <p className="text-[9.5px] text-slate-400 font-normal">
                                    @{formatRupiah(heir.nominal_per_orang || 0)}/org
                                  </p>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Heirs Quick Management Chips */}
            <div className="border-t border-slate-200 pt-3">
              <span className="text-[11px] font-bold text-slate-600 block mb-2">
                Kelola Jumlah Ahli Waris Terpilih:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(selectedHeirs)
                  .filter(([, qty]) => qty > 0)
                  .sort(([a], [b]) => getHeirHierarchyRank(a) - getHeirHierarchyRank(b))
                  .map(([nodeId, qty]) => {
                    const labelMap: Record<string, string> = {
                      pasangan: jenazahGender === 'L' ? 'Istri' : 'Suami',
                      suami: 'Suami',
                      istri: 'Istri',
                      ayah: 'Ayah',
                      ibu: 'Ibu',
                      kakek: 'Kakek',
                      nenek_ibu: 'Nenek (Ibu)',
                      nenek_ayah: 'Nenek (Ayah)',
                      anak_lk: 'Anak Lk',
                      anak_pr: 'Anak Pr',
                      cucu_lk: 'Cucu Lk',
                      cucu_pr: 'Cucu Pr',
                      saudara_lk_kandung: 'Sdr Lk Kandung',
                      saudari_kandung: 'Sdri Kandung',
                      saudara_lk_seayah: 'Sdr Lk Seayah',
                      saudari_seayah: 'Sdri Seayah',
                      saudara_seibu: 'Saudara/i Seibu',
                      saudara_lk_seibu: 'Saudara Lk Seibu',
                      saudari_seibu: 'Saudari Seibu',
                      keponakan_lk_kandung: 'Keponakan Kandung',
                      keponakan_lk_seayah: 'Keponakan Seayah',
                      paman_kandung: 'Paman Kandung',
                      paman_seayah: 'Paman Seayah',
                      sepupu_lk_paman_kandung: 'Sepupu Kandung',
                      sepupu_lk_paman_seayah: 'Sepupu Seayah',
                    }
                    const label = labelMap[nodeId] || nodeId.replace(/_/g, ' ')
                    return (
                      <div
                        key={nodeId}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 border border-slate-300 text-xs font-semibold"
                      >
                        <span className="capitalize">{label}</span>
                        <div className="flex items-center gap-1 bg-white px-1 py-0.5 rounded border border-slate-200">
                          <button
                            onClick={() => onUpdateHeirQty(nodeId, Math.max(0, qty - 1))}
                            className="w-4 h-4 flex items-center justify-center font-bold text-slate-600 hover:text-rose-600"
                          >
                            -
                          </button>
                          <span className="font-bold text-blue-700 text-xs min-w-[12px] text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => onUpdateHeirQty(nodeId, qty + 1)}
                            className="w-4 h-4 flex items-center justify-center font-bold text-slate-600 hover:text-emerald-600"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: KALKULATOR TIRKAH (HARTA) ─────────────────── */}
        {activeTab === 'tirkah' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
              <h3 className="font-bold text-xs flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span>Urutan Hak Atas Harta Peninggalan (Tirkah)</span>
              </h3>
              <p className="text-[11px] text-blue-800 mt-1">
                Berdasarkan Fiqih Faraidh, harta kotor dikurangi biaya Tajhiz, Hutang, dan Wasiat (maksimal 1/3) sebelum dibagikan ke ahli waris.
              </p>
            </div>

            <div className="space-y-3 bg-white p-3 rounded-xl border border-slate-200">
              {/* Harta Kotor */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  1. Total Harta Peninggalan Kotor (Tirkah)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={tirkahInput.harta_kotor}
                    onChange={(e) => onUpdateTirkahInput({ harta_kotor: Number(e.target.value) || 0 })}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                {/* Quick nominal buttons */}
                <div className="flex gap-1 mt-1.5">
                  {[50000000, 120000000, 500000000, 1000000000].map((nominal) => (
                    <button
                      key={nominal}
                      onClick={() => onUpdateTirkahInput({ harta_kotor: nominal })}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 transition-colors"
                    >
                      {nominal >= 1000000000 ? `${nominal / 1000000000} M` : `${nominal / 1000000} Jt`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Biaya Tajhiz */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  2. Biaya Pengurusan Jenazah (Tajhiz)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={tirkahInput.biaya_tajhiz}
                    onChange={(e) => onUpdateTirkahInput({ biaya_tajhiz: Number(e.target.value) || 0 })}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 font-mono text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Hutang Biasa & Terikat */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    3. Hutang Biasa
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      value={tirkahInput.hutang_biasa}
                      onChange={(e) => onUpdateTirkahInput({ hutang_biasa: Number(e.target.value) || 0 })}
                      className="w-full pl-9 pr-2 py-1.5 rounded-lg border border-slate-300 font-mono text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    4. Hutang Terikat (Rahn)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      value={tirkahInput.hutang_terikat}
                      onChange={(e) => onUpdateTirkahInput({ hutang_terikat: Number(e.target.value) || 0 })}
                      className="w-full pl-9 pr-2 py-1.5 rounded-lg border border-slate-300 font-mono text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Wasiat */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  5. Wasiat Sahih (Maksimal 1/3)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={tirkahInput.wasiat}
                    onChange={(e) => onUpdateTirkahInput({ wasiat: Number(e.target.value) || 0 })}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 font-mono text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Net Calculation Summary */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span>Harta Kotor:</span>
                <span className="font-mono font-bold">{formatRupiah(tirkahInput.harta_kotor)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-rose-700">
                <span>Total Pengeluaran (Tajhiz + Hutang + Wasiat):</span>
                <span className="font-mono font-bold">
                  - {formatRupiah(tirkahInput.biaya_tajhiz + tirkahInput.hutang_biasa + tirkahInput.hutang_terikat + tirkahInput.wasiat)}
                </span>
              </div>
              <div className="border-t border-emerald-300 pt-1.5 flex justify-between items-center text-sm font-extrabold text-emerald-900">
                <span>Harta Bersih yang Dibagi:</span>
                <span className="font-mono text-base">{formatRupiah(calculationResult?.total_harta_bersih || 0)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: PRESET KASUS LATIHAN ───────────────────────── */}
        {activeTab === 'preset' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Pilih salah satu kasus klasik di bawah ini untuk melihat simulasi perhitungan dan visualisasinya di kanvas:
            </p>

            <div className="space-y-2">
              {PRESET_CASES.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => onApplyPreset(preset)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 bg-white cursor-pointer transition-all shadow-2xs group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-blue-700">
                          {preset.title}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                          {preset.jenazahGender === 'L' ? '♂ Mayyit' : '♀ Mayyitah'}
                        </span>
                      </div>
                      <p className="text-[11px] font-arabic text-emerald-800 mt-0.5" dir="rtl">
                        {preset.titleArab}
                      </p>
                      <p className="text-[11px] font-medium text-slate-600 mt-1">
                        {preset.subtitle}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                  </div>

                  <p className="text-[10.5px] text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {preset.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 4: LOG & KAIDAH SYAR'I ────────────────────────── */}
        {activeTab === 'dalil' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Urutan fase kalkulasi berdasarkan Kitab Ilmu Faraidh Kelas 3 KMI Gontor:
            </p>

            {(!calculationResult?.log_edukasi || calculationResult.log_edukasi.length === 0) ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border">
                Pilih ahli waris untuk melihat log tahapan fiqih.
              </div>
            ) : (
              <div className="space-y-2.5">
                {calculationResult.log_edukasi.map((item: LogEdukasi, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-800">
                        Fase {item.fase}: {item.judul}
                      </span>
                      {item.judul_arab && (
                        <span className="font-arabic text-[11px] text-emerald-800" dir="rtl">
                          {item.judul_arab}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {item.penjelasan}
                    </p>
                    {item.detail && item.detail.length > 0 && (
                      <ul className="list-disc list-inside text-[10.5px] text-slate-500 space-y-0.5 pt-1">
                        {item.detail.map((d, dIdx) => (
                          <li key={dIdx}>{d}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ FOOTER ════════════════════════════════════════════════ */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
        <span>Faraidh Engine v1.0 • KMI Gontor</span>
        <button
          onClick={onClose}
          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs"
        >
          Tutup Panel
        </button>
      </div>
    </aside>
  </>
  )
}
