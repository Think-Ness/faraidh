'use client'

import { useState, useMemo } from 'react'
import {
  Users,
  Search,
  Plus,
  Minus,
  Check,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  Calculator,
  User,
  Heart,
  Layers,
  Info,
  X,
  UserCheck,
  Crown
} from 'lucide-react'
import type { InputAhliWaris, HalanganWaris } from '@/lib/faraidh/types'

export type GenderPewaris = 'L' | 'P' | 'semua'

// 25 Ahli Waris lengkap dengan klasifikasi syar'i, cluster keluarga & bahasa Arab
export interface AhliWarisItem {
  kode: string
  nama: string
  arab: string
  gender: 'L' | 'P'
  kelompok: 'ashabah' | 'furudh'
  cluster: 'inti' | 'vertikal' | 'saudara' | 'kerabat'
  maks: number | null
  tidak_pernah_gugur: boolean
  keteranganSingkat: string
}

const ALL_AHLI_WARIS: AhliWarisItem[] = [
  // ─── CLUSTER 1: KELUARGA INTI (PRIORITAS UTAMA) ────────────────
  { kode: 'suami', nama: 'Suami', arab: 'الزوج', gender: 'L', kelompok: 'furudh', cluster: 'inti', maks: 1, tidak_pernah_gugur: true, keteranganSingkat: 'Pewaris adalah istri yang meninggal (1/2 atau 1/4)' },
  { kode: 'istri', nama: 'Istri', arab: 'الزوجة', gender: 'P', kelompok: 'furudh', cluster: 'inti', maks: 4, tidak_pernah_gugur: true, keteranganSingkat: 'Pewaris adalah suami yang meninggal (1/4 atau 1/8)' },
  { kode: 'anak_lk', nama: 'Anak Laki-laki', arab: 'الابن', gender: 'L', kelompok: 'ashabah', cluster: 'inti', maks: null, tidak_pernah_gugur: true, keteranganSingkat: 'Ashabah bin-Nafsih terkuat, menghijab cucu & saudara' },
  { kode: 'anak_pr', nama: 'Anak Perempuan', arab: 'البنت', gender: 'P', kelompok: 'furudh', cluster: 'inti', maks: null, tidak_pernah_gugur: true, keteranganSingkat: 'Furudh (1/2 atau 2/3) atau Ashabah bil-Ghair' },
  { kode: 'ayah', nama: 'Ayah', arab: 'الأب', gender: 'L', kelompok: 'furudh', cluster: 'inti', maks: 1, tidak_pernah_gugur: true, keteranganSingkat: 'Furudh (1/6), Ashabah, atau 1/6 + Sisa' },
  { kode: 'ibu', nama: 'Ibu', arab: 'الأم', gender: 'P', kelompok: 'furudh', cluster: 'inti', maks: 1, tidak_pernah_gugur: true, keteranganSingkat: 'Furudh (1/3 atau 1/6) atau 1/3 dari Sisa (Gharrawain)' },

  // ─── CLUSTER 2: KETURUNAN & KAKEK NENEK ─────────────────────────
  { kode: 'cucu_lk', nama: 'Cucu Laki-laki (dari anak laki-laki)', arab: 'ابن الابن', gender: 'L', kelompok: 'ashabah', cluster: 'vertikal', maks: null, tidak_pernah_gugur: false, keteranganSingkat: 'Menggantikan anak laki-laki jika tidak ada anak kandung laki-laki' },
  { kode: 'cucu_pr', nama: 'Cucu Perempuan (dari anak laki-laki)', arab: 'بنت الابن', gender: 'P', kelompok: 'furudh', cluster: 'vertikal', maks: null, tidak_pernah_gugur: false, keteranganSingkat: '1/2, 2/3, 1/6 pelengkap 2/3, atau Ashabah bil-Ghair' },
  { kode: 'kakek', nama: 'Kakek Shahih (jalur ayah)', arab: 'الجد الصحيح', gender: 'L', kelompok: 'furudh', cluster: 'vertikal', maks: 1, tidak_pernah_gugur: false, keteranganSingkat: 'Menggantikan kedudukan ayah saat ayah tiada' },
  { kode: 'nenek_ibu', nama: 'Nenek dari Jalur Ibu', arab: 'الجدة من الأم', gender: 'P', kelompok: 'furudh', cluster: 'vertikal', maks: 1, tidak_pernah_gugur: false, keteranganSingkat: 'Mendapat 1/6 (terhijab hanya jika ada ibu)' },
  { kode: 'nenek_ayah', nama: 'Nenek dari Jalur Ayah', arab: 'الجدة من الأب', gender: 'P', kelompok: 'furudh', cluster: 'vertikal', maks: 1, tidak_pernah_gugur: false, keteranganSingkat: 'Mendapat 1/6 (terhijab oleh ibu & ayah)' },

  // ─── CLUSTER 3: SAUDARA & SAUDARI (HAWASYI DEKAT) ──────────────
  { kode: 'saudara_lk_kandung', nama: 'Saudara Laki-laki Sekandung', arab: 'الأخ الشقيق', gender: 'L', kelompok: 'ashabah', cluster: 'saudara', maks: null, tidak_pernah_gugur: false, keteranganSingkat: 'Ashabah bin-Nafsih setelah garis keturunan & ayah' },
  { kode: 'saudari_kandung', nama: 'Saudari Sekandung', arab: 'الأخت الشقيقة', gender: 'P', kelompok: 'furudh', cluster: 'saudara', maks: null, tidak_pernah_gugur: false, keteranganSingkat: '1/2, 2/3, Ashabah bil-Ghair, atau ma\'al Ghair' },
  { kode: 'saudara_lk_seayah', nama: 'Saudara Laki-laki Seayah', arab: 'الأخ لأب', gender: 'L', kelompok: 'ashabah', cluster: 'saudara', maks: null, tidak_pernah_gugur: false, keteranganSingkat: 'Menggantikan saudara sekandung saat tidak ada saudara sekandung' },
  { kode: 'saudari_seayah', nama: 'Saudari Seayah', arab: 'الأخت لأب', gender: 'P', kelompok: 'furudh', cluster: 'saudara', maks: null, tidak_pernah_gugur: false, keteranganSingkat: '1/2, 2/3, 1/6 pelengkap 2/3, atau Ashabah' },
  { kode: 'saudara_lk_seibu', nama: 'Saudara Laki-laki Seibu', arab: 'الأخ لأم', gender: 'L', kelompok: 'furudh', cluster: 'saudara', maks: null, tidak_pernah_gugur: false, keteranganSingkat: '1/6 (tunggal) atau 1/3 (jamak dibagi rata)' },
  { kode: 'saudari_seibu', nama: 'Saudari Seibu', arab: 'الأخت لأم', gender: 'P', kelompok: 'furudh', cluster: 'saudara', maks: null, tidak_pernah_gugur: false, keteranganSingkat: 'Porsi sama persis dengan saudara laki-laki seibu' },

  // ─── CLUSTER 4: KERABAT LANJUTAN (HAWASYI JAUH & ASHABAH) ──────
  { kode: 'keponakan_lk_kandung', nama: 'Anak Laki-laki Saudara Sekandung', arab: 'ابن الأخ الشقيق', gender: 'L', kelompok: 'ashabah', cluster: 'kerabat', maks: null, tidak_pernah_gugur: false, keteranganSingkat: 'Ashabah bin-Nafsih jika saudara kandung tiada' },
  { kode: 'keponakan_lk_seayah', nama: 'Anak Laki-laki Saudara Seayah', arab: 'ابن الأخ لأب', gender: 'L', kelompok: 'ashabah', cluster: 'kerabat', maks: null, tidak_pernah_gugur: false, keteranganSingkat: 'Ashabah bin-Nafsih derajat setelah keponakan kandung' },
  { kode: 'paman_kandung', nama: 'Paman Sekandung (dari ayah)', arab: 'العم الشقيق', gender: 'L', kelompok: 'ashabah', cluster: 'kerabat', maks: null, tidak_pernah_gugur: false, keteranganSingkat: 'Ashabah bin-Nafsih jalur paman terkuat' },
  { kode: 'paman_seayah', nama: 'Paman Seayah (dari ayah)', arab: 'العم لأب', gender: 'L', kelompok: 'ashabah', cluster: 'kerabat', maks: null, tidak_pernah_gugur: false, keteranganSingkat: 'Ashabah bin-Nafsih jalur paman seayah' },
  { kode: 'sepupu_lk_paman_kandung', nama: 'Anak Laki-laki Paman Sekandung', arab: 'ابن العم الشقيق', gender: 'L', kelompok: 'ashabah', cluster: 'kerabat', maks: null, tidak_pernah_gugur: false, keteranganSingkat: 'Sepupu laki-laki jalur paman sekandung' },
  { kode: 'sepupu_lk_paman_seayah', nama: 'Anak Laki-laki Paman Seayah', arab: 'ابن العم لأب', gender: 'L', kelompok: 'ashabah', cluster: 'kerabat', maks: null, tidak_pernah_gugur: false, keteranganSingkat: 'Sepupu laki-laki jalur paman seayah' },
  { kode: 'mutiq', nama: 'Yang Memerdekakan (Laki-laki)', arab: 'المعتِق', gender: 'L', kelompok: 'ashabah', cluster: 'kerabat', maks: 1, tidak_pernah_gugur: false, keteranganSingkat: 'Wala\' pembebasan budak' },
  { kode: 'mutiqah', nama: 'Yang Memerdekakan (Perempuan)', arab: 'المعتِقة', gender: 'P', kelompok: 'ashabah', cluster: 'kerabat', maks: 1, tidak_pernah_gugur: false, keteranganSingkat: 'Wala\' pembebasan budak' },
]

const HALANGAN_OPTIONS: { value: HalanganWaris; label: string; arab: string }[] = [
  { value: 'tidak_ada', label: 'Tidak Ada Halangan (Normal)', arab: 'لا مانع' },
  { value: 'budak', label: 'Status Budak (Riqq)', arab: 'الرق' },
  { value: 'pembunuh', label: 'Membunuh Pewaris (Qatl)', arab: 'القتل' },
  { value: 'beda_agama', label: 'Beda Agama / Murtad (Ikhtilafuddin)', arab: 'اختلاف الدين' },
]

const CLUSTERS = [
  { id: 'inti', label: '1. Keluarga Inti', sub: 'Pasangan, Anak & Orang Tua', arab: 'العائلة الأساسية' },
  { id: 'vertikal', label: '2. Cucu & Kakek-Nenek', sub: 'Keturunan Bawah & Garis Atas', arab: 'الفروع والأصول' },
  { id: 'saudara', label: '3. Saudara-Saudari', sub: 'Kandung, Seayah & Seibu', arab: 'الحواشي القريبة' },
  { id: 'kerabat', label: '4. Kerabat Lainnya', sub: 'Keponakan, Paman & Sepupu', arab: 'الحواشي والعصبات' },
] as const

interface StepAhliWarisProps {
  value: InputAhliWaris[]
  onChange: (val: InputAhliWaris[]) => void
  onNext: () => void
  onBack: () => void
}

export default function StepAhliWaris({ value, onChange, onNext, onBack }: StepAhliWarisProps) {
  const [genderPewaris, setGenderPewaris] = useState<GenderPewaris>('semua')
  const [activeCluster, setActiveCluster] = useState<string>('inti')
  const [viewMode, setViewMode] = useState<'cluster' | 'grid'>('cluster')
  const [search, setSearch] = useState('')

  const getAw = (kode: string): InputAhliWaris | undefined =>
    value.find(a => a.kode === kode)

  const isSelected = (kode: string) => !!getAw(kode)

  const toggle = (kode: string) => {
    if (isSelected(kode)) {
      onChange(value.filter(a => a.kode !== kode))
    } else {
      // If adding Suami, auto-adjust gender pewaris to Perempuan if needed
      if (kode === 'suami') {
        onChange([...value.filter(a => a.kode !== 'istri'), { kode, jumlah_orang: 1, halangan: 'tidak_ada' }])
      } else if (kode === 'istri') {
        onChange([...value.filter(a => a.kode !== 'suami'), { kode, jumlah_orang: 1, halangan: 'tidak_ada' }])
      } else {
        onChange([...value, { kode, jumlah_orang: 1, halangan: 'tidak_ada' }])
      }
    }
  }

  const removeSingle = (kode: string) => {
    onChange(value.filter(a => a.kode !== kode))
  }

  const resetAll = () => {
    onChange([])
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

  // Handle Gender Pewaris toggle
  const handleGenderPewarisChange = (g: GenderPewaris) => {
    setGenderPewaris(g)
    if (g === 'L') {
      // Pewaris laki-laki -> punya istri, tidak punya suami
      onChange(value.filter(a => a.kode !== 'suami'))
    } else if (g === 'P') {
      // Pewaris perempuan -> punya suami, tidak punya istri
      onChange(value.filter(a => a.kode !== 'istri'))
    }
  }

  // Filtered List based on Gender Pewaris, Search, and Cluster/Grid
  const displayedAhliWaris = useMemo(() => {
    return ALL_AHLI_WARIS.filter(aw => {
      // Gender Pewaris filter for Spouse
      if (genderPewaris === 'L' && aw.kode === 'suami') return false
      if (genderPewaris === 'P' && aw.kode === 'istri') return false

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchNama = aw.nama.toLowerCase().includes(q)
        const matchArab = aw.arab.includes(search)
        const matchKode = aw.kode.toLowerCase().includes(q)
        if (!matchNama && !matchArab && !matchKode) return false
      } else if (viewMode === 'cluster') {
        // Cluster filter when not searching
        if (aw.cluster !== activeCluster) return false
      }

      return true
    })
  }, [genderPewaris, search, viewMode, activeCluster])

  // Smart Hijab Guidance Warnings
  const hijabGuidance = useMemo(() => {
    const warnings: { title: string; desc: string }[] = []
    const hasAnakLk = isSelected('anak_lk')
    const hasAyah = isSelected('ayah')
    const hasIbu = isSelected('ibu')

    if (hasAnakLk) {
      warnings.push({
        title: 'Anak Laki-laki Hadir',
        desc: 'Secara syar\'i, Anak Laki-laki menghijab (menutup hak waris) Cucu Lk/Pr dan seluruh Saudara/i.',
      })
    }
    if (hasAyah) {
      warnings.push({
        title: 'Ayah Hadir',
        desc: 'Ayah menghijab Kakek, Nenek dari jalur ayah, dan seluruh Saudara/i.',
      })
    }
    if (hasIbu) {
      warnings.push({
        title: 'Ibu Hadir',
        desc: 'Ibu menghijab seluruh Nenek (baik dari jalur ibu maupun ayah).',
      })
    }
    return warnings
  }, [value])

  const totalJiwa = value.reduce((sum, a) => sum + (a.jumlah_orang || 1), 0)
  const canProceed = value.length > 0

  return (
    <div className="space-y-6">
      
      {/* ─── 1. PEWARIS SELECTOR & VIEW CONTROLLER ───────────────────── */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div>
            <h2 className="section-title">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>Tentukan Ahli Waris yang Masih Hidup</span>
            </h2>
            <p className="section-subtitle">
              Pilih kerabat yang masih hidup saat pewaris meninggal dunia.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start sm:self-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setViewMode('cluster'); setSearch('') }}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'cluster' && !search ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Mode Bertahap
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'grid' || search ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Semua (25)
            </button>
          </div>
        </div>

        {/* Pewaris Gender Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Pewaris (Yang Meninggal Dunia):</span>
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { id: 'semua', label: 'Bebas / Fleksibel' },
              { id: 'L', label: 'Laki-laki (Meninggal)' },
              { id: 'P', label: 'Perempuan (Meninggal)' },
            ].map(g => (
              <button
                key={g.id}
                type="button"
                onClick={() => handleGenderPewarisChange(g.id as GenderPewaris)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  genderPewaris === g.id
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 2. SELECTED HEIRS SUMMARY DRAWER ────────────────────────── */}
      {value.length > 0 && (
        <div className="card bg-emerald-50/40 border border-emerald-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800">
                {value.length} Hubungan Ahli Waris Terpilih ({totalJiwa} Orang)
              </span>
            </div>
            <button
              type="button"
              onClick={resetAll}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Bersihkan Semua</span>
            </button>
          </div>

          {/* Chips list */}
          <div className="flex flex-wrap gap-1.5">
            {value.map(sel => {
              const aw = ALL_AHLI_WARIS.find(a => a.kode === sel.kode)
              if (!aw) return null
              return (
                <div
                  key={sel.kode}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-xs text-slate-800 shadow-sm"
                >
                  <span className="font-semibold">{aw.nama}</span>
                  <span className="text-arabic text-emerald-800 font-bold">({aw.arab})</span>
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-mono font-bold text-[11px]">
                    ×{sel.jumlah_orang}
                  </span>
                  {sel.halangan !== 'tidak_ada' && (
                    <span className="px-1 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">
                      Mani'
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeSingle(sel.kode)}
                    className="w-4 h-4 rounded hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-600 ml-0.5"
                    title="Hapus ahli waris ini"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Fiqh Guidance Notes */}
          {hijabGuidance.length > 0 && (
            <div className="mt-2 pt-2.5 border-t border-emerald-200/80 space-y-1">
              {hijabGuidance.map((hg, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[11px] text-emerald-900 leading-snug">
                  <Info className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <span><strong>{hg.title}:</strong> {hg.desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── 3. CLUSTER TABS (MODE BERTAHAP) ─────────────────────────── */}
      {viewMode === 'cluster' && !search && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CLUSTERS.map(c => {
            const active = activeCluster === c.id
            const countInCluster = value.filter(v => {
              const item = ALL_AHLI_WARIS.find(a => a.kode === v.kode)
              return item?.cluster === c.id
            }).length

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCluster(c.id)}
                className={`p-3 rounded-xl text-left border transition-all relative ${
                  active
                    ? 'bg-white border-emerald-600 shadow-sm ring-2 ring-emerald-50'
                    : 'bg-slate-100/80 border-slate-200 hover:bg-white text-slate-600'
                }`}
              >
                {countInCluster > 0 && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shadow-sm">
                    {countInCluster}
                  </span>
                )}
                <p className={`text-xs font-bold leading-tight ${active ? 'text-slate-900' : 'text-slate-700'}`}>
                  {c.label}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">
                  {c.sub}
                </p>
                <p className="text-arabic text-xs text-emerald-800 font-bold mt-1">
                  {c.arab}
                </p>
              </button>
            )
          })}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari ahli waris (contoh: Anak, Ibu, الزوجة, Paman)..."
          className="input-field pl-9 pr-8 text-xs sm:text-sm"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-xs"
          >
            ×
          </button>
        )}
      </div>

      {/* ─── 4. AHLI WARIS CARDS LIST ────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-2.5">
        {displayedAhliWaris.map(aw => {
          const sel = getAw(aw.kode)
          const checked = !!sel

          return (
            <div
              key={aw.kode}
              className={`rounded-xl border transition-all duration-150 overflow-hidden ${
                checked
                  ? 'bg-emerald-50/50 border-emerald-300 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="p-3.5 sm:p-4">
                <div className="flex items-center gap-3">
                  {/* Checkbox Trigger */}
                  <button
                    type="button"
                    onClick={() => toggle(aw.kode)}
                    id={`aw-toggle-${aw.kode}`}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all ${
                      checked
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'border-slate-300 bg-white hover:border-emerald-500'
                    }`}
                  >
                    {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  {/* Main Info */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => toggle(aw.kode)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-bold leading-tight ${checked ? 'text-slate-900' : 'text-slate-800'}`}>
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

                    <p className="text-xs text-slate-500 mt-0.5 leading-tight">
                      {aw.keteranganSingkat}
                    </p>
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
                  <div className="mt-3 pt-2.5 border-t border-emerald-200/60 flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 flex-shrink-0">
                      <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                      <span>Status Halangan Syar'i (Mani'):</span>
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

        {displayedAhliWaris.length === 0 && (
          <div className="card text-center py-8 text-slate-500">
            <p className="text-xs font-semibold">Tidak ditemukan ahli waris dengan kata kunci "{search}".</p>
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-xs text-emerald-600 underline font-semibold mt-2 block mx-auto"
            >
              Tampilkan Semua
            </button>
          </div>
        )}
      </div>

      {/* ─── 5. NAVIGATION BUTTONS ───────────────────────────────────── */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary flex-1 py-3.5"
          id="step-aw-back"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Kembali ke Tirkah</span>
        </button>
        <button
          type="button"
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
