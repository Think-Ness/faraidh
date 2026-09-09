'use client'

import { useState, useMemo } from 'react'
import {
  Users,
  Search,
  Plus,
  Minus,
  AlertCircle,
  Check,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  Calculator
} from 'lucide-react'
import type { InputAhliWaris, HalanganWaris } from '@/lib/faraidh/types'

// 25 Ahli Waris lengkap dengan klasifikasi syar'i & bahasa Arab
const ALL_AHLI_WARIS = [
  // Laki-laki (15)
  { kode: 'anak_lk',                nama: 'Anak Laki-laki',                       arab: 'الابن',              gender: 'L', kelompok: 'ashabah',   maks: null, tidak_pernah_gugur: true },
  { kode: 'cucu_lk',                nama: 'Cucu Laki-laki (dari anak laki-laki)', arab: 'ابن الابن',           gender: 'L', kelompok: 'ashabah',   maks: null, tidak_pernah_gugur: false },
  { kode: 'ayah',                   nama: 'Ayah',                                  arab: 'الأب',               gender: 'L', kelompok: 'furudh',    maks: 1,    tidak_pernah_gugur: true },
  { kode: 'kakek',                  nama: 'Kakek Shahih (jalur ayah)',             arab: 'الجد الصحيح',        gender: 'L', kelompok: 'furudh',    maks: 1,    tidak_pernah_gugur: false },
  { kode: 'saudara_lk_kandung',     nama: 'Saudara Laki-laki Sekandung',           arab: 'الأخ الشقيق',        gender: 'L', kelompok: 'ashabah',   maks: null, tidak_pernah_gugur: false },
  { kode: 'saudara_lk_seayah',      nama: 'Saudara Laki-laki Seayah',             arab: 'الأخ لأب',           gender: 'L', kelompok: 'ashabah',   maks: null, tidak_pernah_gugur: false },
  { kode: 'saudara_lk_seibu',       nama: 'Saudara Laki-laki Seibu',              arab: 'الأخ لأم',           gender: 'L', kelompok: 'furudh',    maks: null, tidak_pernah_gugur: false },
  { kode: 'keponakan_lk_kandung',   nama: 'Anak Laki-laki Saudara Sekandung',     arab: 'ابن الأخ الشقيق',    gender: 'L', kelompok: 'ashabah',   maks: null, tidak_pernah_gugur: false },
  { kode: 'keponakan_lk_seayah',    nama: 'Anak Laki-laki Saudara Seayah',        arab: 'ابن الأخ لأب',       gender: 'L', kelompok: 'ashabah',   maks: null, tidak_pernah_gugur: false },
  { kode: 'paman_kandung',          nama: 'Paman Sekandung (dari ayah)',           arab: 'العم الشقيق',        gender: 'L', kelompok: 'ashabah',   maks: null, tidak_pernah_gugur: false },
  { kode: 'paman_seayah',           nama: 'Paman Seayah (dari ayah)',              arab: 'العم لأب',           gender: 'L', kelompok: 'ashabah',   maks: null, tidak_pernah_gugur: false },
  { kode: 'sepupu_lk_paman_kandung','nama': 'Anak Laki-laki Paman Sekandung',    arab: 'ابن العم الشقيق',    gender: 'L', kelompok: 'ashabah',   maks: null, tidak_pernah_gugur: false },
  { kode: 'sepupu_lk_paman_seayah', 'nama': 'Anak Laki-laki Paman Seayah',      arab: 'ابن العم لأب',       gender: 'L', kelompok: 'ashabah',   maks: null, tidak_pernah_gugur: false },
  { kode: 'suami',                  nama: 'Suami',                                 arab: 'الزوج',              gender: 'L', kelompok: 'furudh',    maks: 1,    tidak_pernah_gugur: true },
  { kode: 'mutiq',                  nama: 'Yang Memerdekakan (Laki-laki)',        arab: 'المعتِق',            gender: 'L', kelompok: 'ashabah',   maks: 1,    tidak_pernah_gugur: false },

  // Perempuan (10)
  { kode: 'anak_pr',                nama: 'Anak Perempuan',                        arab: 'البنت',              gender: 'P', kelompok: 'furudh',    maks: null, tidak_pernah_gugur: true },
  { kode: 'cucu_pr',                nama: 'Cucu Perempuan (dari anak laki-laki)', arab: 'بنت الابن',          gender: 'P', kelompok: 'furudh',    maks: null, tidak_pernah_gugur: false },
  { kode: 'ibu',                    nama: 'Ibu',                                   arab: 'الأم',               gender: 'P', kelompok: 'furudh',    maks: 1,    tidak_pernah_gugur: true },
  { kode: 'nenek_ibu',              nama: 'Nenek dari Jalur Ibu',                 arab: 'الجدة من الأم',      gender: 'P', kelompok: 'furudh',    maks: 1,    tidak_pernah_gugur: false },
  { kode: 'nenek_ayah',             nama: 'Nenek dari Jalur Ayah',                arab: 'الجدة من الأب',      gender: 'P', kelompok: 'furudh',    maks: 1,    tidak_pernah_gugur: false },
  { kode: 'saudari_kandung',        nama: 'Saudari Sekandung',                     arab: 'الأخت الشقيقة',      gender: 'P', kelompok: 'furudh',    maks: null, tidak_pernah_gugur: false },
  { kode: 'saudari_seayah',         nama: 'Saudari Seayah',                        arab: 'الأخت لأب',          gender: 'P', kelompok: 'furudh',    maks: null, tidak_pernah_gugur: false },
  { kode: 'saudari_seibu',          nama: 'Saudari Seibu',                         arab: 'الأخت لأم',          gender: 'P', kelompok: 'furudh',    maks: null, tidak_pernah_gugur: false },
  { kode: 'istri',                  nama: 'Istri',                                 arab: 'الزوجة',             gender: 'P', kelompok: 'furudh',    maks: 4,    tidak_pernah_gugur: true },
  { kode: 'mutiqah',                nama: 'Yang Memerdekakan (Perempuan)',        arab: 'المعتِقة',           gender: 'P', kelompok: 'ashabah',   maks: 1,    tidak_pernah_gugur: false },
]

const HALANGAN_OPTIONS: { value: HalanganWaris; label: string; arab: string }[] = [
  { value: 'tidak_ada', label: 'Tidak Ada Halangan (Normal)', arab: 'لا مانع' },
  { value: 'budak', label: 'Status Budak (Riqq)', arab: 'الرق' },
  { value: 'pembunuh', label: 'Membunuh Pewaris (Qatl)', arab: 'القتل' },
  { value: 'beda_agama', label: 'Beda Agama / Murtad (Ikhtilafuddin)', arab: 'اختلاف الدين' },
]

type FilterCategory = 'semua' | 'laki-laki' | 'perempuan' | 'ashabah' | 'furudh'

interface StepAhliWarisProps {
  value: InputAhliWaris[]
  onChange: (val: InputAhliWaris[]) => void
  onNext: () => void
  onBack: () => void
}

export default function StepAhliWaris({ value, onChange, onNext, onBack }: StepAhliWarisProps) {
  const [filterCat, setFilterCat] = useState<FilterCategory>('semua')
  const [search, setSearch] = useState('')

  const getAw = (kode: string): InputAhliWaris | undefined =>
    value.find(a => a.kode === kode)

  const isSelected = (kode: string) => !!getAw(kode)

  const toggle = (kode: string) => {
    if (isSelected(kode)) {
      onChange(value.filter(a => a.kode !== kode))
    } else {
      onChange([...value, { kode, jumlah_orang: 1, halangan: 'tidak_ada' }])
    }
  }

  const updateJumlah = (kode: string, delta: number) => {
    onChange(
      value.map(a =>
        a.kode === kode ? { ...a, jumlah_orang: Math.max(1, a.jumlah_orang + delta) } : a
      )
    )
  }

  const updateHalangan = (kode: string, halangan: HalanganWaris) => {
    onChange(value.map(a => (a.kode === kode ? { ...a, halangan } : a)))
  }

  const filteredList = useMemo(() => {
    return ALL_AHLI_WARIS.filter(aw => {
      // Category filter
      if (filterCat === 'laki-laki' && aw.gender !== 'L') return false
      if (filterCat === 'perempuan' && aw.gender !== 'P') return false
      if (filterCat === 'ashabah' && aw.kelompok !== 'ashabah') return false
      if (filterCat === 'furudh' && aw.kelompok !== 'furudh') return false

      // Search filter (Indonesian name, Arabic name, or code)
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchNama = aw.nama.toLowerCase().includes(q)
        const matchArab = aw.arab.includes(search)
        const matchKode = aw.kode.toLowerCase().includes(q)
        if (!matchNama && !matchArab && !matchKode) return false
      }

      return true
    })
  }, [filterCat, search])

  const totalOrang = value.reduce((sum, a) => sum + (a.jumlah_orang || 1), 0)
  const canProceed = value.length > 0

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card-highlight flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0 text-blue-700 shadow-sm">
          <Users className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              Daftar Ahli Waris
            </h2>
            <span className="text-arabic text-sm text-emerald-800 font-bold">أصحاب الفروض والعصبات</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            Centang anggota keluarga yang masih hidup saat pewaris wafat. Tentukan jumlah orang serta status halangan waris jika ada.
          </p>
        </div>
      </div>

      {/* Syar'i Notice Banner */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-emerald-200 text-xs shadow-sm">
        <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-slate-700">
          <p>
            <strong className="text-emerald-800">5 Ahli Waris Utama yang Tak Pernah Gugur (لا يحجب أبداً):</strong>
          </p>
          <p className="text-slate-500 leading-relaxed">
            Suami, Istri, Ayah, Ibu, dan Anak Kandung (Laki-laki / Perempuan) tidak akan pernah terhalang total oleh siapapun.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card space-y-3 p-4 sm:p-5">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="input-field pl-10 text-xs sm:text-sm"
            placeholder="Cari ahli waris (misal: Anak, Ayah, الابن, الزوجة)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {([
            { id: 'semua', label: 'Semua (25)', arab: 'الكل' },
            { id: 'laki-laki', label: 'Laki-laki (15)', arab: 'الذكور' },
            { id: 'perempuan', label: 'Perempuan (10)', arab: 'الإناث' },
            { id: 'furudh', label: 'Ashabul Furudh', arab: 'الفروض' },
            { id: 'ashabah', label: 'Ashabah', arab: 'العصبة' },
          ] as const).map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilterCat(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5
                ${filterCat === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 border border-slate-200'}`}
            >
              <span>{cat.label}</span>
              <span className="text-arabic text-[11px] opacity-80">{cat.arab}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Status Bar / Selection Count */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Ditemukan {filteredList.length} Ahli Waris
          </span>
          {value.length > 0 && (
            <span className="badge-emerald text-xs font-mono">
              {value.length} Kategori ({totalOrang} Jiwa) Terpilih
            </span>
          )}
        </div>
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Pilihan
          </button>
        )}
      </div>

      {/* Ahli Waris Cards Grid */}
      <div className="grid grid-cols-1 gap-2.5">
        {filteredList.map(aw => {
          const sel = getAw(aw.kode)
          const checked = !!sel

          return (
            <div
              key={aw.kode}
              className={`rounded-xl border transition-all duration-150 overflow-hidden shadow-sm
                ${checked
                  ? 'bg-emerald-50/70 border-emerald-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'}`}
            >
              {/* Card Header & Checkbox */}
              <div className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  {/* Custom Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggle(aw.kode)}
                    id={`aw-toggle-${aw.kode}`}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all
                      ${checked
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'border-slate-300 bg-white hover:border-emerald-500'}`}
                  >
                    {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  {/* Main Heir Info */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => toggle(aw.kode)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-semibold leading-tight ${checked ? 'text-slate-900' : 'text-slate-800'}`}>
                          {aw.nama}
                        </span>
                        {aw.tidak_pernah_gugur && (
                          <span className="badge-emerald text-[10px] py-0.5">
                            Tak Pernah Gugur
                          </span>
                        )}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                          aw.gender === 'L'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-pink-50 text-pink-700 border-pink-200'
                        }`}>
                          {aw.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                      </div>

                      {/* Arabic Calligraphy Name */}
                      <span className="text-arabic text-base sm:text-lg text-emerald-900 font-bold flex-shrink-0">
                        {aw.arab}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Counter */}
                  {checked && (
                    <div className="flex items-center gap-1.5 flex-shrink-0 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation()
                          updateJumlah(aw.kode, -1)
                        }}
                        disabled={sel.jumlah_orang <= 1}
                        className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 transition-colors"
                        id={`aw-minus-${aw.kode}`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-mono text-xs sm:text-sm font-bold text-emerald-700 tabular-nums">
                        {sel.jumlah_orang}
                      </span>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation()
                          if (aw.maks && sel.jumlah_orang >= aw.maks) return
                          updateJumlah(aw.kode, 1)
                        }}
                        disabled={!!(aw.maks && sel.jumlah_orang >= aw.maks)}
                        className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 transition-colors"
                        id={`aw-plus-${aw.kode}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Halangan Waris Selector (Shows if checked) */}
                {checked && (
                  <div className="mt-3 pt-3 border-t border-emerald-200/60 flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 flex-shrink-0">
                      <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                      <span>Status Halangan Syar'i:</span>
                    </div>
                    <select
                      id={`halangan-${aw.kode}`}
                      value={sel.halangan}
                      onChange={e => updateHalangan(aw.kode, e.target.value as HalanganWaris)}
                      className={`flex-1 text-xs rounded-lg px-3 py-1.5 border transition-colors focus:outline-none focus:ring-1 font-medium
                        ${sel.halangan !== 'tidak_ada'
                          ? 'bg-rose-50 border-rose-300 text-rose-800 focus:ring-rose-200'
                          : 'bg-white border-slate-200 text-slate-700 focus:ring-emerald-200'}`}
                    >
                      {HALANGAN_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label} — {opt.arab}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="btn-secondary flex-1 py-3.5"
          id="step-aw-back"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Kembali ke Tirkah</span>
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="btn-primary flex-1 py-3.5 font-semibold text-sm sm:text-base shadow-sm"
          id="step-aw-next"
        >
          <Calculator className="w-4 h-4 mr-1" />
          <span>Hitung Pembagian Waris</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {!canProceed && (
        <p className="text-center text-xs text-slate-500">
          Pilih minimal 1 ahli waris yang berhak untuk memulai kalkulasi.
        </p>
      )}
    </div>
  )
}

