'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Calculator,
  FlaskConical,
  Loader2,
  AlertCircle,
  Sparkles,
  Scale,
  GraduationCap,
  Layers,
  ChevronRight,
  ShieldCheck,
  Sliders,
} from 'lucide-react'
import StepIndicator from '@/components/ui/StepIndicator'
import StepTirkah from '@/components/calculator/StepTirkah'
import StepAhliWaris from '@/components/calculator/StepAhliWaris'
import StepResult from '@/components/calculator/StepResult'
import type { InputKasus, HasilKalkulasi } from '@/lib/faraidh/types'
import { hitungFaraidh } from './actions'

// ─── Preset Soal dari Kitab Faraidh KMI Gontor ─────────────────────────
const PRESET_SOAL = [
  {
    id: 'adilah_1',
    label: 'Soal 1: Kasus Normal (\'Adilah)',
    arab: 'المسألة العادلة (تساوي السهام مع الأصل)',
    desc: 'Suami + 2 Anak Perempuan + Ayah + Ibu',
    descArab: 'زوج + بنتان + أب + أم',
    input: {
      nama_pewaris: 'Latihan 1: Kasus \'Adilah (Normal)',
      harta_kotor: 240_000_000, biaya_tajhiz: 0, hutang_terikat: 0, hutang_biasa: 0, wasiat: 0,
      ahli_waris_list: [
        { kode: 'suami', jumlah_orang: 1, halangan: 'tidak_ada' as const },
        { kode: 'anak_pr', jumlah_orang: 2, halangan: 'tidak_ada' as const },
        { kode: 'ayah', jumlah_orang: 1, halangan: 'tidak_ada' as const },
        { kode: 'ibu', jumlah_orang: 1, halangan: 'tidak_ada' as const },
      ],
    },
  },
  {
    id: 'aul_1',
    label: "Soal 2: Masalah 'Aul (Asal Masalah 6 → 7)",
    arab: 'مسألة العول (ارتفاع الأصل لنقص الأنصباء)',
    desc: 'Suami + 2 Saudari Kandung + Ibu',
    descArab: 'زوج + أختان شقيقتان + أم',
    input: {
      nama_pewaris: "Latihan 2: Kasus 'Aul (6 ke 7)",
      harta_kotor: 420_000_000, biaya_tajhiz: 0, hutang_terikat: 0, hutang_biasa: 0, wasiat: 0,
      ahli_waris_list: [
        { kode: 'suami', jumlah_orang: 1, halangan: 'tidak_ada' as const },
        { kode: 'saudari_kandung', jumlah_orang: 2, halangan: 'tidak_ada' as const },
        { kode: 'ibu', jumlah_orang: 1, halangan: 'tidak_ada' as const },
      ],
    },
  },
  {
    id: 'gharrawain',
    label: 'Soal 3: Al-Gharrawain (Al-Umariyyatain)',
    arab: 'المسألة الغراوية الأولى (ثلث الباقي للأم)',
    desc: 'Suami + Ibu + Ayah (Ibu dapat 1/3 dari Sisa)',
    descArab: 'زوج + أم + أب (ثلث الباقي)',
    input: {
      nama_pewaris: 'Latihan 3: Kasus Gharrawain',
      harta_kotor: 600_000_000, biaya_tajhiz: 0, hutang_terikat: 0, hutang_biasa: 0, wasiat: 0,
      ahli_waris_list: [
        { kode: 'suami', jumlah_orang: 1, halangan: 'tidak_ada' as const },
        { kode: 'ibu', jumlah_orang: 1, halangan: 'tidak_ada' as const },
        { kode: 'ayah', jumlah_orang: 1, halangan: 'tidak_ada' as const },
      ],
    },
  },
  {
    id: 'musytarakah',
    label: 'Soal 4: Al-Musytarakah (Al-Himariyah)',
    arab: 'المسألة المشتركة / الحمارية',
    desc: 'Suami + Ibu + 2 Saudara Seibu + Saudara Kandung',
    descArab: 'زوج + أم + إخوة لأم + أخ شقيق',
    input: {
      nama_pewaris: 'Latihan 4: Kasus Musytarakah',
      harta_kotor: 360_000_000, biaya_tajhiz: 0, hutang_terikat: 0, hutang_biasa: 0, wasiat: 0,
      ahli_waris_list: [
        { kode: 'suami', jumlah_orang: 1, halangan: 'tidak_ada' as const },
        { kode: 'ibu', jumlah_orang: 1, halangan: 'tidak_ada' as const },
        { kode: 'saudara_lk_seibu', jumlah_orang: 2, halangan: 'tidak_ada' as const },
        { kode: 'saudara_lk_kandung', jumlah_orang: 1, halangan: 'tidak_ada' as const },
      ],
    },
  },
  {
    id: 'akdariyyah',
    label: 'Soal 5: Al-Akdariyyah',
    arab: 'المسألة الأكدرية (الجد مع الأخت)',
    desc: 'Suami + Ibu + Kakek + Saudari Kandung',
    descArab: 'زوج + أم + جد + أخت شقيقة',
    input: {
      nama_pewaris: 'Latihan 5: Kasus Akdariyyah',
      harta_kotor: 540_000_000, biaya_tajhiz: 0, hutang_terikat: 0, hutang_biasa: 0, wasiat: 0,
      ahli_waris_list: [
        { kode: 'suami', jumlah_orang: 1, halangan: 'tidak_ada' as const },
        { kode: 'ibu', jumlah_orang: 1, halangan: 'tidak_ada' as const },
        { kode: 'kakek', jumlah_orang: 1, halangan: 'tidak_ada' as const },
        { kode: 'saudari_kandung', jumlah_orang: 1, halangan: 'tidak_ada' as const },
      ],
    },
  },
  {
    id: 'mawani',
    label: "Soal 6: Mawani' al-Irts (Halangan Waris)",
    arab: 'موانع الإرث (اختلاف الدين والقتل والرق)',
    desc: 'Anak laki-laki beda agama / murtad, hak jatuh ke cucu',
    descArab: 'ابن (كافر) + ابنا ابن + زوجة + أم',
    input: {
      nama_pewaris: "Latihan 6: Kasus Mawani' al-Irts",
      harta_kotor: 300_000_000, biaya_tajhiz: 5_000_000, hutang_terikat: 0, hutang_biasa: 20_000_000, wasiat: 0,
      ahli_waris_list: [
        { kode: 'anak_lk', jumlah_orang: 1, halangan: 'beda_agama' as const },
        { kode: 'cucu_lk', jumlah_orang: 2, halangan: 'tidak_ada' as const },
        { kode: 'istri', jumlah_orang: 1, halangan: 'tidak_ada' as const },
        { kode: 'ibu', jumlah_orang: 1, halangan: 'tidak_ada' as const },
      ],
    },
  },
]

const STEPS = [
  { id: 1, label: '1. Tirkah & Pembersihan', sublabel: 'Harta', arab: 'التركة والتصفيات' },
  { id: 2, label: '2. Ahli Waris', sublabel: 'Keluarga', arab: 'الورثة وأحوالهم' },
  { id: 3, label: '3. Hasil & Saham', sublabel: 'Pembagian', arab: 'قسمة التركة' },
]

const defaultInput: Omit<InputKasus, 'ahli_waris_list'> = {
  nama_pewaris: '',
  harta_kotor: 0,
  biaya_tajhiz: 0,
  hutang_terikat: 0,
  hutang_biasa: 0,
  wasiat: 0,
}

type Tab = 'kalkulator' | 'ensiklopedia' | 'simulasi'

export default function HomePage() {
  const [tab, setTab] = useState<Tab>('kalkulator')
  const [step, setStep] = useState(1)
  const [tirkah, setTirkah] = useState(defaultInput)
  const [ahliWarisList, setAhliWarisList] = useState<InputKasus['ahli_waris_list']>([])
  const [loading, setLoading] = useState(false)
  const [hasil, setHasil] = useState<HasilKalkulasi | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setStep(1)
    setTirkah(defaultInput)
    setAhliWarisList([])
    setHasil(null)
    setError(null)
  }

  const loadPreset = (preset: typeof PRESET_SOAL[0]) => {
    const { ahli_waris_list, ...rest } = preset.input
    setTirkah(rest)
    setAhliWarisList(ahli_waris_list)
    setTab('kalkulator')
    setStep(1)
    setHasil(null)
    setError(null)
  }

  const handleHitung = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await hitungFaraidh({ ...tirkah, ahli_waris_list: ahliWarisList })
      if (result.success && result.data) {
        setHasil(result.data)
        setStep(3)
      } else {
        setError(result.error || 'Terjadi kesalahan tidak diketahui.')
      }
    } catch (e) {
      setError('Gagal terhubung ke database. Periksa koneksi Supabase Anda.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* ─── APP HEADER ─────────────────────────────────────── */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Scale className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                  FARAIDH
                </span>
                <span className="badge-emerald text-[10px] py-0.5 font-bold">KMI GONTOR</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none">
                Kalkulator Ilmu Waris Islam
              </p>
            </div>
          </div>

          {/* Header Right (Arabic & Admin Link) */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-arabic text-base text-emerald-800 font-bold leading-tight">
                علم الفرائض والمواريث
              </span>
              <span className="text-[11px] text-slate-500">
                بناءً على المنهج الدراسي لمعهد دار السلام كونتور
              </span>
            </div>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all shadow-sm"
              title="Masuk ke Panel Pengelola & Kaidah Fikih"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Panel Asatidz</span>
              <span className="sm:hidden">Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO BANNER ─────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-200 pt-7 pb-6">
        <div className="max-w-3xl mx-auto px-4 text-center">
          {/* Arabic Basmalah */}
          <p className="text-arabic text-xl sm:text-2xl text-emerald-800 font-bold mb-2 tracking-wide">
            بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ
          </p>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
            Kalkulator & Edukasi <span className="text-emerald-700">Ilmu Faraidh</span> Syar'i
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed mb-5">
            Penghitungan pembagian waris Islam langkah demi langkah secara transparan berdasarkan Kitab Faraidh Kelas 3 KMI Pondok Modern Darussalam Gontor.
          </p>

          {/* 3 Metric Pills */}
          <div className="inline-flex items-center justify-center gap-3 sm:gap-6 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 shadow-sm">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span><strong className="text-slate-800">25</strong> Ahli Waris</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span><strong className="text-slate-800">9</strong> Fase Kaidah</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span><strong className="text-slate-800">3</strong> Kasus Khusus</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAIN APP CONTAINER ────────────────────────────────────── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:py-8">

        {/* Tab Navigation Controls */}
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 mb-6 shadow-sm">
          {([
            { id: 'kalkulator', icon: Calculator, label: 'Kalkulator', arab: 'الحاسبة' },
            { id: 'simulasi', icon: FlaskConical, label: 'Preset Soal Gontor', arab: 'المسائل والتمارين' },
            { id: 'ensiklopedia', icon: BookOpen, label: 'Ensiklopedia Kaidah', arab: 'موسوعة الفرائض' },
          ] as const).map(t => {
            const IconComp = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                id={`tab-${t.id}`}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150
                  ${active
                    ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
              >
                <IconComp className="w-4 h-4 flex-shrink-0" />
                <div className="flex items-baseline gap-1.5">
                  <span>{t.label}</span>
                  <span className="hidden sm:inline text-arabic text-xs font-normal opacity-80">
                    ({t.arab})
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* ─── TAB 1: KALKULATOR ─── */}
        {tab === 'kalkulator' && (
          <div className="space-y-6">
            {/* Step Indicator (Steps 1, 2) */}
            {!loading && step < 3 && (
              <div className="mb-6">
                <StepIndicator steps={STEPS} current={step} />
              </div>
            )}

            {/* Loading Animation */}
            {loading && (
              <div className="card text-center py-16 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <Scale className="w-7 h-7" />
                  </div>
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin absolute -bottom-1 -right-1" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Mesin Rules Engine Sedang Berjalan...</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Mengeksekusi 9 fase kaidah Faraidh: Tirkah, Mawani', Kasus Khusus, Hijab, Furudh, Ashabah, Asal Masalah, Aul/Radd & Tashih.
                  </p>
                  <p className="text-arabic text-sm text-emerald-700 mt-2 font-bold">
                    جاري تطبيق القواعد الفقهية وحساب الأنصباء...
                  </p>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {!loading && error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-sm">Terjadi Kesalahan Kalkulasi</p>
                  <p className="text-xs text-red-700 mt-1 leading-relaxed">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-xs text-red-600 hover:text-red-800 underline font-semibold mt-2 block"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            )}

            {/* Step Components */}
            {!loading && step === 1 && (
              <StepTirkah
                value={tirkah}
                onChange={setTirkah}
                onNext={() => setStep(2)}
              />
            )}

            {!loading && step === 2 && (
              <StepAhliWaris
                value={ahliWarisList}
                onChange={setAhliWarisList}
                onNext={handleHitung}
                onBack={() => setStep(1)}
              />
            )}

            {!loading && step === 3 && hasil && (
              <StepResult hasil={hasil} onReset={reset} />
            )}
          </div>
        )}

        {/* ─── TAB 2: PRESET SOAL KITAB GONTOR ─── */}
        {tab === 'simulasi' && (
          <div className="space-y-4">
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 mx-auto mb-2">
                <FlaskConical className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Preset Soal & Kasus Ujian Kitab Faraidh
              </h2>
              <span className="text-arabic text-base text-amber-800 font-bold block mt-0.5">
                نماذج من مسائل وتمارين كتاب الفرائض للصف الثالث بمعهد كونتور
              </span>
              <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                Pilih salah satu studi kasus di bawah ini untuk memuat data otomatis ke kalkulator, lalu Anda dapat langsung meninjau langkah penyelesaiannya.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {PRESET_SOAL.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => loadPreset(preset)}
                  id={`preset-${preset.id}`}
                  className="card text-left hover:border-emerald-300 hover:shadow-md transition-all duration-150 group p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm sm:text-base">
                          {preset.label}
                        </span>
                      </div>
                      <p className="text-arabic text-base text-emerald-800 font-bold">
                        {preset.arab}
                      </p>
                      <p className="text-xs text-slate-600 font-medium">
                        Komposisi: {preset.desc}
                      </p>
                      <p className="text-[11px] font-mono text-slate-500">
                        Total Harta Tirkah: Rp {preset.input.harta_kotor.toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <span>Muat Soal</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 3: ENSIKLOPEDIA KAIDAH ─── */}
        {tab === 'ensiklopedia' && (
          <div className="space-y-6">
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto mb-2">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Ensiklopedia Kaidah Ilmu Faraidh
              </h2>
              <span className="text-arabic text-base text-emerald-800 font-bold block mt-0.5">
                موسوعة قواعد علم الفرائض والمواريث
              </span>
              <p className="text-xs text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
                Rangkuman lengkap 6 jenis Furudh Muqaddarah, klasifikasi Ashabah, dan 3 Masalah Khusus yang diajarkan pada kurikulum Gontor.
              </p>
            </div>

            {/* 1. Furudh Muqaddarah */}
            <div className="card space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    1. Furudh Muqaddarah (6 Pecahan Pasti)
                  </h3>
                </div>
                <span className="text-arabic text-sm sm:text-base text-emerald-800 font-bold">
                  الفروض المقدرة في كتاب الله
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th className="w-28">Pecahan (الفرض)</th>
                      <th>Penerima & Syarat Berlakunya</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {[
                      ['1/2', 'النصف', 'Suami (tanpa anak/cucu); Anak Perempuan tunggal (tanpa saudara laki-laki); Cucu Perempuan tunggal; Saudari Sekandung tunggal; Saudari Seayah tunggal.'],
                      ['1/4', 'الربع', 'Suami (ada anak/cucu); Istri/istri-istri (tanpa anak/cucu).'],
                      ['1/8', 'الثمن', 'Istri/istri-istri (jika pewaris memiliki anak atau cucu).'],
                      ['2/3', 'الثلثان', '2+ Anak Perempuan (tanpa saudara laki-laki); 2+ Cucu Perempuan; 2+ Saudari Sekandung; 2+ Saudari Seayah.'],
                      ['1/3', 'الثلث', 'Ibu (tanpa anak/cucu & < 2 saudara/i); 2+ Saudara/i Seibu (dibagi rata tanpa membedakan gender).'],
                      ['1/6', 'السدس', 'Ibu (ada anak/cucu atau 2+ saudara/i); Ayah (ada anak/cucu laki-laki); Kakek Shahih; Nenek Shahihah; Cucu Pr pelengkap 2/3; Saudari Seayah pelengkap 2/3; 1 orang Saudara/i Seibu.'],
                    ].map(([pecahan, arab, ket]) => (
                      <tr key={pecahan}>
                        <td>
                          <span className="font-mono font-bold text-emerald-700 text-base">{pecahan}</span>
                          <span className="text-arabic text-sm text-slate-500 block">{arab}</span>
                        </td>
                        <td className="text-slate-700 leading-relaxed">{ket}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Ashabah */}
            <div className="card space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    2. Ashabah (Penerima Sisa Harta)
                  </h3>
                </div>
                <span className="text-arabic text-sm sm:text-base text-blue-800 font-bold">
                  أقسام العصبة في الإرث
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="badge-blue text-xs font-bold">Ashabah Bin-Nafsih (عصبة بنفسه)</span>
                    <span className="text-arabic text-sm text-blue-800 font-bold">12 Urutan Derajat Laki-laki</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Anak Lk → Cucu Lk → Ayah → Kakek → Saudara Sekandung → Saudara Seayah → Keponakan Sekandung → Keponakan Seayah → Paman Sekandung → Paman Seayah → Sepupu Sekandung → Sepupu Seayah → Mu'tiq.
                  </p>
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="badge-blue text-xs font-bold">Ashabah Bil-Ghair (عصبة بغيره)</span>
                    <span className="text-arabic text-sm text-blue-800 font-bold">Ditarik Saudara Laki-laki (Rasio 2:1)</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Anak Pr + Anak Lk; Cucu Pr + Cucu Lk; Saudari Sekandung + Saudara Sekandung; Saudari Seayah + Saudara Seayah. (للذكر مثل حظ الأنثيين).
                  </p>
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="badge-blue text-xs font-bold">Ashabah Ma'al-Ghair (عصبة مع غيره)</span>
                    <span className="text-arabic text-sm text-blue-800 font-bold">Bersama Anak/Cucu Perempuan</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Saudari Sekandung atau Saudari Seayah ketika hadir bersama Anak Perempuan atau Cucu Perempuan, mengambil seluruh sisa harta yang ada. (اجعلوا الأخوات مع البنات عصبة).
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Kasus Khusus */}
            <div className="card space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    3. Masalah Khusus (المسائل الخاصة)
                  </h3>
                </div>
                <span className="text-arabic text-sm sm:text-base text-purple-800 font-bold">
                  الغرواوين والمشتركة والأكدرية
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  {
                    nama: 'Al-Gharrawain (Al-Umariyyatain)',
                    arab: 'المسألة الغراوية',
                    pemicu: 'Suami/Istri + Ibu + Ayah (tanpa anak/cucu, < 2 saudara/i)',
                    aturan: 'Ibu mendapat 1/3 dari SISA (bukan 1/3 total harta). Pasangan mengambil bagiannya lebih dahulu, lalu Ibu mengambil 1/3 dari sisanya, dan Ayah mengambil sisa akhir (ashabah).'
                  },
                  {
                    nama: 'Al-Musytarakah (Al-Himariyah)',
                    arab: 'المسألة المشتركة / الحمارية',
                    pemicu: 'Suami + Ibu + 2+ Saudara/i Seibu + Saudara Laki-laki Sekandung',
                    aturan: 'Saudara Laki-laki Sekandung ikut bersekutu berbagi rata dalam porsi 1/3 bersama Saudara/i Seibu agar tidak gugur tanpa bagian harta sama sekali.'
                  },
                  {
                    nama: 'Al-Akdariyyah',
                    arab: 'المسألة الأكدرية',
                    pemicu: 'Suami + Ibu + Kakek + Saudari Kandung (tanpa ayah/anak)',
                    aturan: 'Suami 1/2 (3/6), Ibu 1/3 (2/6), Kakek 1/6 (1/6), Saudari 1/2 (3/6). Total = 9/6 (\'Aul ke 9). Porsi Kakek + Saudari (4 saham) digabung lalu dibagi dengan rasio 2:1 (Tashih × 3 = 27).'
                  },
                ].map(kk => (
                  <div key={kk.nama} className="rounded-xl border border-purple-200 bg-purple-50/50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-purple-900 text-sm">{kk.nama}</span>
                      <span className="text-arabic text-base text-purple-800 font-bold">{kk.arab}</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-1 leading-relaxed">
                      <strong className="text-slate-800">Pemicu Kasus:</strong> {kk.pemicu}
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <strong className="text-purple-800">Penyelesaian Khusus:</strong> {kk.aturan}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─── APP FOOTER ─────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 space-y-2">
        <p className="font-medium text-slate-700">
          Sistem Faraidh — Berdasarkan Kitab{' '}
          <span className="text-arabic text-base text-emerald-800 font-bold">علم الفرائض</span>{' '}
          Kelas 3 KMI Pondok Modern Darussalam Gontor
        </p>
        <p className="text-[11px] text-slate-500">
          Arsitektur Rules Engine: Seluruh kaidah syar'i dikelola secara dinamis via Supabase Database
        </p>
      </footer>
    </div>
  )
}
