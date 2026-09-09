'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Scale,
  ShieldAlert,
  BookOpen,
  History,
  Sparkles,
  Search,
  Filter,
  ArrowLeft,
  Database,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Layers,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  Sliders,
  Play,
  ExternalLink,
  Lock,
  Eye,
  Settings2,
  Check,
  Copy,
  Plus,
  Minus,
  Trash2,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Wrench,
  Coins,
  PieChart,
} from 'lucide-react'
import { getAdminData, testAdminCalculation } from './actions'
import type {
  AhliWaris,
  FurudhRule,
  HijabHirmanRule,
  HijabNuqshanRule,
  AshabahRule,
  KasusKhusus,
  InputKasus,
  HasilKalkulasi,
} from '@/lib/faraidh/types'

type AdminTab =
  | 'overview'
  | 'ahli_waris'
  | 'furudh'
  | 'hijab'
  | 'ashabah'
  | 'kasus_khusus'
  | 'bank_soal'
  | 'audit_trail'
  | 'test_engine'

// ─── 4 Family Clusters for Easy Selection ─────────────────────────────
const CLUSTERS = [
  {
    id: 'pasangan',
    title: 'Pasangan',
    titleArab: 'الزوجان',
    color: 'border-emerald-200 bg-emerald-50/50 text-emerald-900',
    icon: Users,
    codes: ['suami', 'istri'],
  },
  {
    id: 'furu',
    title: 'Anak & Cucu (Al-Furu\')',
    titleArab: 'الفروع (الأولاد وأولاد البنين)',
    color: 'border-blue-200 bg-blue-50/50 text-blue-900',
    icon: Layers,
    codes: ['anak_lk', 'anak_pr', 'cucu_lk', 'cucu_pr'],
  },
  {
    id: 'usul',
    title: 'Orang Tua & Leluhur (Al-Ushul)',
    titleArab: 'الأصول (الآباء والأمهات والأجداد)',
    color: 'border-purple-200 bg-purple-50/50 text-purple-900',
    icon: GraduationCap,
    codes: ['ayah', 'ibu', 'kakek', 'nenek_ibu', 'nenek_ayah'],
  },
  {
    id: 'hawasyi',
    title: 'Saudara & Kerabat (Al-Hawasyi)',
    titleArab: 'الحواشي (الإخوة والأعمام وبنوهم)',
    color: 'border-amber-200 bg-amber-50/50 text-amber-900',
    icon: Sparkles,
    codes: [
      'saudara_lk_kandung',
      'saudari_kandung',
      'saudara_lk_seayah',
      'saudari_seayah',
      'saudara_lk_seibu',
      'saudari_seibu',
      'keponakan_lk_kandung',
      'keponakan_lk_seayah',
      'paman_kandung',
      'paman_seayah',
      'sepupu_lk_paman_kandung',
      'sepupu_lk_paman_seayah',
      'mutiq',
      'mutiqah',
    ],
  },
]

// ─── Preset Sandbox Scenarios ──────────────────────────────────────────
const ADMIN_SANDBOX_PRESETS = [
  {
    label: "Kasus Normal ('Adilah)",
    labelArab: 'المسألة العادلة (تساوي السهام مع الأصل)',
    harta: 240_000_000,
    desc: 'Suami + 2 Anak Pr + Ayah + Ibu (Asal Masalah 24)',
    waris: [
      { kode: 'suami', count: 1 },
      { kode: 'anak_pr', count: 2 },
      { kode: 'ayah', count: 1 },
      { kode: 'ibu', count: 1 },
    ],
  },
  {
    label: "Kasus 'Aul (6 ➔ 7)",
    labelArab: 'مسألة العول (عالت من 6 إلى 7)',
    harta: 420_000_000,
    desc: 'Suami + 2 Saudari Kandung + Ibu (6 ke 7)',
    waris: [
      { kode: 'suami', count: 1 },
      { kode: 'saudari_kandung', count: 2 },
      { kode: 'ibu', count: 1 },
    ],
  },
  {
    label: "Kasus 'Aul (12 ➔ 13)",
    labelArab: 'مسألة العول (عالت من 12 إلى 13)',
    harta: 390_000_000,
    desc: 'Suami + Ibu + 2 Anak Perempuan (12 ke 13)',
    waris: [
      { kode: 'suami', count: 1 },
      { kode: 'ibu', count: 1 },
      { kode: 'anak_pr', count: 2 },
    ],
  },
  {
    label: "Kasus 'Aul (24 ➔ 27 / Minbariyyah)",
    labelArab: 'المسألة المنبرية (عالت من 24 إلى 27)',
    harta: 540_000_000,
    desc: 'Istri + 2 Anak Pr + Ayah + Ibu (24 ke 27)',
    waris: [
      { kode: 'istri', count: 1 },
      { kode: 'anak_pr', count: 2 },
      { kode: 'ayah', count: 1 },
      { kode: 'ibu', count: 1 },
    ],
  },
  {
    label: "Kasus Radd (Ibu + Anak Pr)",
    labelArab: 'مسألة الرد (ردت من 6 إلى 4)',
    harta: 200_000_000,
    desc: 'Ibu + Anak Perempuan (Asal Masalah 6 ➔ Radd ke 4)',
    waris: [
      { kode: 'ibu', count: 1 },
      { kode: 'anak_pr', count: 1 },
    ],
  },
  {
    label: "Kasus Inkisar (Tashih 2 Golongan)",
    labelArab: 'تصحيح المسائل (انكسار على فريقين)',
    harta: 360_000_000,
    desc: '2 Istri + 4 Saudari Kandung (Perlu Mahfudzat)',
    waris: [
      { kode: 'istri', count: 2 },
      { kode: 'saudari_kandung', count: 4 },
    ],
  },
  {
    label: "Al-Gharrawain (Al-Umariyyatain)",
    labelArab: 'المسألة الغراوية (ثلث الباقي للأم)',
    harta: 600_000_000,
    desc: 'Suami + Ibu + Ayah (Ibu dapat 1/3 dari Sisa)',
    waris: [
      { kode: 'suami', count: 1 },
      { kode: 'ibu', count: 1 },
      { kode: 'ayah', count: 1 },
    ],
  },
  {
    label: "Al-Musytarakah (Al-Himariyah)",
    labelArab: 'المسألة المشتركة / الحمارية',
    harta: 360_000_000,
    desc: 'Suami + Ibu + 2 Saudara Seibu + Saudara Kandung',
    waris: [
      { kode: 'suami', count: 1 },
      { kode: 'ibu', count: 1 },
      { kode: 'saudara_lk_seibu', count: 2 },
      { kode: 'saudara_lk_kandung', count: 1 },
    ],
  },
  {
    label: "Al-Akdariyyah",
    labelArab: 'المسألة الأكدرية',
    harta: 540_000_000,
    desc: 'Suami + Ibu + Kakek + Saudari Kandung',
    waris: [
      { kode: 'suami', count: 1 },
      { kode: 'ibu', count: 1 },
      { kode: 'kakek', count: 1 },
      { kode: 'saudari_kandung', count: 1 },
    ],
  },
]

const STATUS_CONFIG: Record<string, { label: string; labelArab: string; badge: string }> = {
  furudh:             { label: 'Ashabul Furudh', labelArab: 'فرض', badge: 'badge-emerald' },
  ashabah_bin_nafsih: { label: 'Ashabah Bin-Nafsih', labelArab: 'عصبة بنفسه', badge: 'badge-blue' },
  ashabah_bil_ghair:  { label: 'Ashabah Bil-Ghair', labelArab: 'عصبة بغيره', badge: 'badge-blue' },
  ashabah_maal_ghair: { label: "Ashabah Ma'al-Ghair", labelArab: 'عصبة مع غيره', badge: 'badge-blue' },
  radd:               { label: 'Penerima Radd', labelArab: 'رد', badge: 'badge-gold' },
  gugur_halangan:     { label: 'Gugur (Mawani\')', labelArab: 'ممنوع من الإرث', badge: 'badge-red' },
  gugur_hijab:        { label: 'Mahjub (Terhalang)', labelArab: 'محجوب حجب حرمان', badge: 'badge-red' },
  kasus_khusus:       { label: 'Kasus Khusus', labelArab: 'مسألة خاصة', badge: 'badge-purple' },
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [loading, setLoading] = useState(true)
  const [adminData, setAdminData] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'L' | 'P'>('ALL')
  const [furudhFilter, setFurudhFilter] = useState<string>('ALL')
  const [selectedPenghalang, setSelectedPenghalang] = useState<string>('ALL')
  const [copiedText, setCopiedText] = useState<string | null>(null)

  // ─── Sandbox State ───────────────────────────────────────────────────
  const [testNama, setTestNama] = useState('Uji Coba Faraidh Admin')
  const [testHarta, setTestHarta] = useState(360000000)
  const [testSelectedWaris, setTestSelectedWaris] = useState<{ kode: string; count: number }[]>([
    { kode: 'suami', count: 1 },
    { kode: 'ibu', count: 1 },
    { kode: 'saudari_kandung', count: 2 },
  ])
  const [testResult, setTestResult] = useState<HasilKalkulasi | null>(null)
  const [testLoading, setTestLoading] = useState(false)
  const [activeClusterTab, setActiveClusterTab] = useState<string>('all')

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getAdminData()
      setAdminData(data)
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(null), 2000)
  }

  // Update waris count with smart rules (e.g. Suami & Istri mutual exclusion)
  const updateWarisCount = (kode: string, delta: number) => {
    setTestSelectedWaris(prev => {
      const existing = prev.find(p => p.kode === kode)
      const currentCount = existing ? existing.count : 0
      const nextCount = Math.max(0, currentCount + delta)

      let updated = prev.filter(p => p.kode !== kode)
      if (nextCount > 0) {
        // Enforce single spouse gender
        if (kode === 'suami') {
          updated = updated.filter(p => p.kode !== 'istri')
        } else if (kode === 'istri') {
          updated = updated.filter(p => p.kode !== 'suami')
        }
        updated.push({ kode, count: nextCount })
      }
      return updated
    })
  }

  const setWarisExact = (kode: string, count: number) => {
    setTestSelectedWaris(prev => {
      let updated = prev.filter(p => p.kode !== kode)
      if (count > 0) {
        if (kode === 'suami') {
          updated = updated.filter(p => p.kode !== 'istri')
        } else if (kode === 'istri') {
          updated = updated.filter(p => p.kode !== 'suami')
        }
        updated.push({ kode, count })
      }
      return updated
    })
  }

  const applyPreset = (preset: typeof ADMIN_SANDBOX_PRESETS[0]) => {
    setTestNama(preset.label)
    setTestHarta(preset.harta)
    setTestSelectedWaris(preset.waris)
    setTestResult(null)
  }

  const clearSandbox = () => {
    setTestSelectedWaris([])
    setTestResult(null)
  }

  const handleRunTest = async () => {
    if (testSelectedWaris.length === 0) return
    setTestLoading(true)
    try {
      const input: InputKasus = {
        nama_pewaris: testNama,
        harta_kotor: testHarta,
        biaya_tajhiz: 0,
        hutang_terikat: 0,
        hutang_biasa: 0,
        wasiat: 0,
        ahli_waris_list: testSelectedWaris.map(w => ({
          kode: w.kode,
          jumlah_orang: w.count,
          halangan: 'tidak_ada',
        })),
      }
      const res = await testAdminCalculation(input)
      if (res.success && res.data) {
        setTestResult(res.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setTestLoading(false)
    }
  }

  const ahliWarisMap = new Map<number, AhliWaris>(
    (adminData?.ahliWaris || []).map((a: AhliWaris) => [a.id, a])
  )
  const ahliWarisKodeMap = new Map<string, AhliWaris>(
    (adminData?.ahliWaris || []).map((a: AhliWaris) => [a.kode, a])
  )

  const filteredAhliWaris = (adminData?.ahliWaris || []).filter((a: AhliWaris) => {
    const matchesSearch =
      a.nama_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.nama_arab.includes(searchQuery) ||
      a.kode.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGender = genderFilter === 'ALL' || a.jenis_kelamin === genderFilter
    return matchesSearch && matchesGender
  })

  const filteredFurudh = (adminData?.furudhRules || []).filter((f: FurudhRule) => {
    const matchesPorsi = furudhFilter === 'ALL' || f.pecahan === furudhFilter
    const waris = ahliWarisMap.get(f.ahli_waris_id)
    const matchesSearch =
      !searchQuery ||
      (waris?.nama_id.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (waris?.nama_arab.includes(searchQuery) ?? false) ||
      (f.keterangan?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    return matchesPorsi && matchesSearch
  })

  const filteredHijabHirman = (adminData?.hijabHirmanRules || []).filter((h: HijabHirmanRule) => {
    const penghalang = ahliWarisMap.get(h.penghalang_id)
    const terhalang = ahliWarisMap.get(h.terhalang_id)
    const matchesPenghalang =
      selectedPenghalang === 'ALL' || penghalang?.kode === selectedPenghalang
    const matchesSearch =
      !searchQuery ||
      (penghalang?.nama_id.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (terhalang?.nama_id.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    return matchesPenghalang && matchesSearch
  })

  // Group result items for Sandbox Output
  const berhakList = testResult?.hasil.filter(h => !['gugur_halangan', 'gugur_hijab'].includes(h.status)) || []
  const gugurList = testResult?.hasil.filter(h => ['gugur_halangan', 'gugur_hijab'].includes(h.status)) || []

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* ─── ADMIN TOPBAR ─────────────────────────────────────── */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand & Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
              <Sliders className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  PANEL ASATIDZ & DEWAN FARAIDH
                </span>
                <span className="badge-slate text-[10px] font-bold py-0.5">ADMIN POV</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Pusat Tata Kelola Kaidah Fikih, Kaidah Hijab & Bank Soal KMI Gontor
              </p>
            </div>
          </div>

          {/* Connection Status & Actions */}
          <div className="flex items-center gap-2.5">
            {adminData?.isLiveDB ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                Supabase Live Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                Local Engine (Seed Rules Active)
              </span>
            )}

            <button
              onClick={loadData}
              disabled={loading}
              title="Refresh Data Kaidah"
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kalkulator Publik
            </Link>
          </div>
        </div>
      </header>

      {/* ─── SUB-HEADER NAVIGATION TABS ───────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-[57px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Ringkasan & Metrik
          </button>

          <button
            onClick={() => setActiveTab('ahli_waris')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'ahli_waris'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            25 Ahli Waris
            <span className="ml-1 px-1.5 py-0.2 bg-slate-200 text-slate-800 text-[10px] rounded-full font-bold">25</span>
          </button>

          <button
            onClick={() => setActiveTab('furudh')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'furudh'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Kaidah Furudh (24)
          </button>

          <button
            onClick={() => setActiveTab('hijab')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'hijab'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Matriks Hijab
          </button>

          <button
            onClick={() => setActiveTab('ashabah')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'ashabah'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ashabah (19)
          </button>

          <button
            onClick={() => setActiveTab('kasus_khusus')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'kasus_khusus'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Kasus Khusus (3)
          </button>

          <button
            onClick={() => setActiveTab('bank_soal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'bank_soal'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Bank Soal Ujian KMI
          </button>

          <button
            onClick={() => setActiveTab('audit_trail')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'audit_trail'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Log Simulasi
          </button>

          <button
            onClick={() => setActiveTab('test_engine')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'test_engine'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Sandbox Engine Fiqh
          </button>

        </div>
      </div>

      {/* ─── MAIN CONTENT ─────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-6">

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 1: OVERVIEW & DASHBOARD METRICS                     */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="card p-4 text-center border-l-4 border-l-emerald-600">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Ahli Waris
                </span>
                <span className="text-2xl font-extrabold text-slate-900">25</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">15 Lk / 10 Pr</span>
              </div>

              <div className="card p-4 text-center border-l-4 border-l-sky-600">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Kaidah Furudh
                </span>
                <span className="text-2xl font-extrabold text-slate-900">24</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">6 Macam Porsi</span>
              </div>

              <div className="card p-4 text-center border-l-4 border-l-rose-600">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Hijab Hirman
                </span>
                <span className="text-2xl font-extrabold text-slate-900">33</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Relasi Gugur Total</span>
              </div>

              <div className="card p-4 text-center border-l-4 border-l-amber-600">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Hijab Nuqshan
                </span>
                <span className="text-2xl font-extrabold text-slate-900">12</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Penurunan Porsi</span>
              </div>

              <div className="card p-4 text-center border-l-4 border-l-indigo-600">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Ashabah
                </span>
                <span className="text-2xl font-extrabold text-slate-900">19</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">3 Jenis Ashabah</span>
              </div>

              <div className="card p-4 text-center border-l-4 border-l-purple-600">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Kasus Khusus
                </span>
                <span className="text-2xl font-extrabold text-slate-900">3</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Override Fatwa</span>
              </div>
            </div>

            {/* Architecture Overview Card */}
            <div className="card p-6 bg-white border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                    Arsitektur Faraidh Engine (Dynamic Rules Architecture)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Alur 10 tahapan kalkulasi sistem waris Islam berdasarkan Kitab Faraidh KMI Gontor
                  </p>
                </div>
                <span className="badge-emerald text-xs font-bold px-2.5 py-1">
                  Kitab Faraidh KMI 2017
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  { step: '1', title: 'Tirkah Bersih', desc: 'Harta kotor dikurangi 4 hak mayit (tajhiz, hutang, wasiat).' },
                  { step: '2', title: 'Halangan Waris', desc: 'Filter pembunuh, budak, dan beda agama (Mani\'ul Irtsi).' },
                  { step: '3', title: 'Hijab Hirman', desc: 'Pewaris yang lebih dekat menggugurkan yang lebih jauh.' },
                  { step: '4', title: 'Furudh Muqaddarah', desc: 'Tentukan porsi pasti (1/2, 1/4, 1/8, 2/3, 1/3, 1/6).' },
                  { step: '5', title: 'Hijab Nuqshan', desc: 'Penurunan porsi karena adanya far\'u warits / saudara jamak.' },
                  { step: '6', title: 'Ashabah Priorities', desc: 'Sisa dibagi ke Bin Nafsih, Bil Ghair (2:1), Ma\'al Ghair.' },
                  { step: '7', title: 'Asal Masalah', desc: 'KPK penyebut (2, 3, 4, 6, 8, 12, 24) sesuai kaidah tamatsul.' },
                  { step: '8', title: '\'Aul & Radd', desc: 'Koreksi jika saham melebihi (\'Aul) atau kurang (Radd).' },
                  { step: '9', title: 'Tashih Masail', desc: 'Pencegahan pecahan orang (Inkisar) dengan juz\'us sahm.' },
                  { step: '10', title: 'Bagi Nominal', desc: 'Distribusi rupiah tirkah bersih per golongan & individu.' },
                ].map((item) => (
                  <div key={item.step} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-extrabold flex items-center justify-center">
                        {item.step}
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-800">{item.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions & DB Schema Box */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* Database Schema Status */}
              <div className="card p-5 lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-600" />
                    Status Tabel Supabase PostgreSQL
                  </h4>
                  <span className="text-[11px] text-slate-500">File: <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded">supabase/schema.sql</code></span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Nama Tabel</th>
                        <th className="py-2 px-3">Fungsi Fikih</th>
                        <th className="py-2 px-3 text-center">Jumlah Baris</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-800">ahli_waris</td>
                        <td className="py-2 px-3 text-slate-600">Master 25 Ahli Waris (15 Lk, 10 Pr)</td>
                        <td className="py-2 px-3 text-center font-bold">25</td>
                        <td className="py-2 px-3 text-center"><span className="badge-emerald text-[10px]">Aktif</span></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-800">furudh_rule</td>
                        <td className="py-2 px-3 text-slate-600">Syarat porsi pasti (1/2, 1/4, 1/8, 2/3, 1/3, 1/6)</td>
                        <td className="py-2 px-3 text-center font-bold">24</td>
                        <td className="py-2 px-3 text-center"><span className="badge-emerald text-[10px]">Aktif</span></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-800">hijab_hirman_rule</td>
                        <td className="py-2 px-3 text-slate-600">Relasi pengguguran hak waris total</td>
                        <td className="py-2 px-3 text-center font-bold">33</td>
                        <td className="py-2 px-3 text-center"><span className="badge-emerald text-[10px]">Aktif</span></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-800">hijab_nuqshan_rule</td>
                        <td className="py-2 px-3 text-slate-600">Penurunan porsi ahli waris tertentu</td>
                        <td className="py-2 px-3 text-center font-bold">12</td>
                        <td className="py-2 px-3 text-center"><span className="badge-emerald text-[10px]">Aktif</span></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-800">ashabah_rule</td>
                        <td className="py-2 px-3 text-slate-600">Kaidah Bin Nafsih, Bil Ghair, Ma'al Ghair</td>
                        <td className="py-2 px-3 text-center font-bold">19</td>
                        <td className="py-2 px-3 text-center"><span className="badge-emerald text-[10px]">Aktif</span></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-800">kasus_khusus</td>
                        <td className="py-2 px-3 text-slate-600">Override Gharrawain, Musytarakah, Akdariyyah</td>
                        <td className="py-2 px-3 text-center font-bold">3</td>
                        <td className="py-2 px-3 text-center"><span className="badge-emerald text-[10px]">Aktif</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Guide for Asatidz */}
              <div className="card p-5 bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 space-y-3">
                <h4 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Kewenangan Super Admin / Asatidz
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Melalui panel ini, asatidz dapat mengecek kaidah porsi syar'i, menguji kasus-kasus imtihan santri, dan mengkoreksi rincian dalil tanpa perlu merombak kode program kalkulator.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('test_engine')}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Buka Sandbox Engine Fiqh
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 2: MASTER 25 AHLI WARIS                             */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'ahli_waris' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* Header & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Master 25 Ahli Waris (الوارثون من الرجال والنساء)
                </h3>
                <p className="text-xs text-slate-500">
                  15 Ahli Waris Laki-laki dan 10 Ahli Waris Perempuan terdaftar dalam sistem
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari ahli waris..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs w-48 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                  <button
                    onClick={() => setGenderFilter('ALL')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      genderFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    Semua (25)
                  </button>
                  <button
                    onClick={() => setGenderFilter('L')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      genderFilter === 'L' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    Laki-laki (15)
                  </button>
                  <button
                    onClick={() => setGenderFilter('P')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      genderFilter === 'P' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    Perempuan (10)
                  </button>
                </div>
              </div>
            </div>

            {/* Ahli Waris Table */}
            <div className="card overflow-hidden border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3 text-center w-12">ID</th>
                      <th className="py-3 px-3">Kode Unik</th>
                      <th className="py-3 px-3 text-right">Nama Arab</th>
                      <th className="py-3 px-3">Nama Indonesia</th>
                      <th className="py-3 px-3 text-center">Gender</th>
                      <th className="py-3 px-3">Kelompok Hak</th>
                      <th className="py-3 px-3 text-center">Prioritas Ashabah</th>
                      <th className="py-3 px-3 text-center">Tidak Pernah Gugur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAhliWaris.map((w: AhliWaris) => (
                      <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 text-center font-bold text-slate-500">{w.id}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 font-bold">{w.kode}</td>
                        <td className="py-2.5 px-3 text-right text-arabic font-bold text-emerald-800 text-sm">{w.nama_arab}</td>
                        <td className="py-2.5 px-3 font-extrabold text-slate-900">{w.nama_id}</td>
                        <td className="py-2.5 px-3 text-center">
                          {w.jenis_kelamin === 'L' ? (
                            <span className="badge-sky text-[10px] font-bold">Laki-laki (15)</span>
                          ) : (
                            <span className="badge-rose text-[10px] font-bold">Perempuan (10)</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[11px] font-semibold text-slate-700">
                            {w.kelompok === 'ashabah_bin_nafsih' ? 'Ashabah Bin Nafsih' : 'Dzawil Furudh'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {w.urutan_ashabah ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-extrabold">
                              {w.urutan_ashabah}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {w.tidak_pernah_gugur ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <Check className="w-3 h-3 text-emerald-600" /> Wajib Dapat
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Bisa Terhijab</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 3: KAIDAH FURUDH MUQADDARAH (24 RULES)              */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'furudh' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* Header & Filter Porsi */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Kaidah Furudh Muqaddarah (الفروض المقدرة في كتاب الله)
                </h3>
                <p className="text-xs text-slate-500">
                  24 Kaidah pembagian pasti: 1/2, 1/4, 1/8, 2/3, 1/3, dan 1/6 (Surat An-Nisa: 11, 12, 176)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 overflow-x-auto">
                  {['ALL', '1/2', '1/4', '1/8', '2/3', '1/3', '1/6'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setFurudhFilter(p)}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                        furudhFilter === p
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {p === 'ALL' ? 'Semua Porsi' : p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table Kaidah Furudh */}
            <div className="card overflow-hidden border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3 text-center w-12">Rule</th>
                      <th className="py-3 px-3">Ahli Waris (Mustahiq)</th>
                      <th className="py-3 px-3 text-center">Porsi Syar'i</th>
                      <th className="py-3 px-3">Syarat Jumlah</th>
                      <th className="py-3 px-3">Syarat Kondisi Fikih</th>
                      <th className="py-3 px-3">Keterangan Kitab Faraidh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFurudh.map((f: FurudhRule) => {
                      const waris = ahliWarisMap.get(f.ahli_waris_id)
                      return (
                        <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 text-center font-bold text-slate-500">#{f.id}</td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900">{waris?.nama_id}</span>
                              <span className="text-arabic text-xs font-bold text-emerald-800">{waris?.nama_arab}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-xs">
                              {f.pecahan}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-semibold">
                            {f.syarat_jumlah_min && f.syarat_jumlah_max
                              ? `Tepat ${f.syarat_jumlah_min} orang`
                              : f.syarat_jumlah_min
                              ? `Minimal ${f.syarat_jumlah_min} orang`
                              : 'Bebas'}
                          </td>
                          <td className="py-2.5 px-3">
                            <code className="text-[11px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                              {JSON.stringify(f.syarat_kondisi)}
                            </code>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 font-medium">{f.keterangan}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 4: MATRIKS HIJAB (HIRMAN & NUQSHAN)                 */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'hijab' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Hijab Hirman Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                    Kaidah Hijab Hirman (حجب الحرمان — Gugur Total)
                  </h3>
                  <p className="text-xs text-slate-500">
                    33 Relasi Pengguguran: Ahli waris yang lebih dekat menghalangi ahli waris yang lebih jauh
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedPenghalang}
                    onChange={(e) => setSelectedPenghalang(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="ALL">Semua Penghalang (Hajib)</option>
                    <option value="anak_lk">Anak Laki-laki (13 terhalang)</option>
                    <option value="ayah">Ayah (7 terhalang)</option>
                    <option value="cucu_lk">Cucu Laki-laki (6 terhalang)</option>
                    <option value="saudara_lk_kandung">Saudara Sekandung (6 terhalang)</option>
                    <option value="ibu">Ibu (2 nenek terhalang)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredHijabHirman.map((h: HijabHirmanRule) => {
                  const penghalang = ahliWarisMap.get(h.penghalang_id)
                  const terhalang = ahliWarisMap.get(h.terhalang_id)
                  return (
                    <div key={h.id} className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-sm">
                      <div className="flex-1">
                        <span className="text-[10px] font-bold text-rose-600 block uppercase">Penghalang (الحاجب)</span>
                        <span className="font-extrabold text-xs text-slate-900">{penghalang?.nama_id}</span>
                        <span className="text-arabic text-xs text-slate-500 block">{penghalang?.nama_arab}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-rose-500 shrink-0" />
                      <div className="flex-1 text-right">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Terhalang (المحجوب)</span>
                        <span className="font-bold text-xs text-slate-700 line-through decoration-rose-500">{terhalang?.nama_id}</span>
                        <span className="text-arabic text-xs text-slate-400 block">{terhalang?.nama_arab}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Hijab Nuqshan Section */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-600" />
                  Kaidah Hijab Nuqshan (حجب النقصان — Penurunan Porsi)
                </h3>
                <p className="text-xs text-slate-500">
                  12 Kasus pengurangan porsi syar'i akibat keberadaan far'u warits atau saudara jamak
                </p>
              </div>

              <div className="card overflow-hidden border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Penyebab (Far'u Warits)</th>
                      <th className="py-2.5 px-3">Terdampak</th>
                      <th className="py-2.5 px-3 text-center">Porsi Awal</th>
                      <th className="py-2.5 px-3 text-center">Porsi Baru</th>
                      <th className="py-2.5 px-3">Keterangan Fikih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(adminData?.hijabNuqshanRules || []).map((n: HijabNuqshanRule) => {
                      const penyebab = ahliWarisMap.get(n.penyebab_id)
                      const terdampak = ahliWarisMap.get(n.terdampak_id)
                      return (
                        <tr key={n.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-slate-800">{penyebab?.nama_id}</td>
                          <td className="py-2.5 px-3 font-extrabold text-slate-900">{terdampak?.nama_id}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-500">{n.pecahan_awal}</td>
                          <td className="py-2.5 px-3 text-center font-extrabold text-amber-700">{n.pecahan_baru}</td>
                          <td className="py-2.5 px-3 text-slate-600">{n.keterangan}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 5: KAIDAH ASHABAH & JIHAT                           */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'ashabah' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <h3 className="font-extrabold text-base text-slate-900">
                Kaidah Ashabah (العصبات — Mengambil Sisa Harta)
              </h3>
              <p className="text-xs text-slate-500">
                19 Kaidah Ashabah yang terbagi menjadi Bin Nafsih, Bil Ghair (2:1), dan Ma'al Ghair
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Bin Nafsih */}
              <div className="card p-5 border-t-4 border-t-indigo-600 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900">1. Ashabah Bin Nafsih</h4>
                  <span className="badge-slate text-[10px]">13 Ahli Waris Lk</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Laki-laki yang mengambil seluruh sisa tirkah secara mandiri berdasarkan urutan prioritas jihat:
                </p>
                <div className="space-y-1.5 pt-1">
                  {(adminData?.ashabahRules || [])
                    .filter((r: AshabahRule) => r.jenis === 'bin_nafsih')
                    .map((r: AshabahRule) => {
                      const waris = ahliWarisMap.get(r.ahli_waris_id)
                      return (
                        <div key={r.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-50 border border-slate-100">
                          <span className="font-bold text-slate-800">{waris?.nama_id}</span>
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                            {r.urutan_prioritas}
                          </span>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Bil Ghair */}
              <div className="card p-5 border-t-4 border-t-sky-600 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900">2. Ashabah Bil Ghair</h4>
                  <span className="badge-sky text-[10px]">Rasio 2 : 1</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Perempuan yang ditarik menjadi ashabah bersama saudara laki-lakinya dengan pembagian 2:1 (للذكر مثل حظ الأنثيين):
                </p>
                <div className="space-y-2 pt-1">
                  {(adminData?.ashabahRules || [])
                    .filter((r: AshabahRule) => r.jenis === 'bil_ghair')
                    .map((r: AshabahRule) => {
                      const wanita = ahliWarisMap.get(r.ahli_waris_id)
                      const pria = ahliWarisMap.get(r.pasangan_penarik_id!)
                      return (
                        <div key={r.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-extrabold text-slate-900">{wanita?.nama_id}</span>
                            <span className="badge-sky text-[10px]">ditarik oleh</span>
                          </div>
                          <div className="text-xs text-slate-700 font-semibold">{pria?.nama_id}</div>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Ma'al Ghair */}
              <div className="card p-5 border-t-4 border-t-emerald-600 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900">3. Ashabah Ma'al Ghair</h4>
                  <span className="badge-emerald text-[10px]">Dengan Far'u Pr</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Saudari kandung / seayah yang menjadi ashabah bersama anak perempuan atau cucu perempuan:
                </p>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                  <div className="font-bold">Kaidah Hadits:</div>
                  <p className="italic text-[11px]">
                    "اجعلوا الأخوات مع البنات عصبة"
                  </p>
                  <p className="text-[11px]">
                    "Jadikanlah saudara-saudari perempuan bersama anak perempuan sebagai ashabah."
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 6: KASUS KHUSUS (OVERRIDE FATWA)                    */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'kasus_khusus' && (
          <div className="space-y-4 animate-fadeIn">
            
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <h3 className="font-extrabold text-base text-slate-900">
                Kasus-kasus Khusus Faraidh (المسائل الملقبة)
              </h3>
              <p className="text-xs text-slate-500">
                Override kaidah normal berdasarkan fatwa shahabat & ijma' ulama madzhab
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(adminData?.kasusKhusus || []).map((k: KasusKhusus) => (
                <div key={k.id} className="card p-5 border border-slate-200 space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">{k.kode}</span>
                    <h4 className="font-extrabold text-sm text-slate-900 mt-0.5">{k.nama}</h4>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {k.aturan_khusus}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="badge-emerald text-[10px]">Ijma' Syafi'i / Jumhur</span>
                    <button
                      onClick={() => handleCopy(k.aturan_khusus)}
                      className="text-slate-400 hover:text-slate-700 text-xs flex items-center gap-1"
                    >
                      {copiedText === k.aturan_khusus ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 7: BANK SOAL & PRESET LATIHAN KMI                   */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'bank_soal' && (
          <div className="space-y-4 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Bank Soal & Preset Ujian KMI Gontor
                </h3>
                <p className="text-xs text-slate-500">
                  Daftar soal studi kasus resmi untuk latihan santri & evaluasi imtihan semester
                </p>
              </div>
              <span className="badge-emerald text-xs font-bold px-3 py-1">5 Soal Aktif</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: '1',
                  nama: "Soal 1: Kasus 'Adilah (Normal)",
                  arab: 'المسألة العادلة',
                  komposisi: 'Suami + 2 Anak Perempuan + Ayah + Ibu',
                  harta: 'Rp 240.000.000',
                  asalMasalah: '24 (Sempurna tanpa \'Aul/Radd)',
                  desc: 'Kasus dasar tanpa inkisar. Saham pas 24/24.',
                },
                {
                  id: '2',
                  nama: "Soal 2: Masalah 'Aul 6 ke 7",
                  arab: 'مسألة العول من 6 إلى 7',
                  komposisi: 'Suami + 2 Saudari Kandung + Ibu',
                  harta: 'Rp 420.000.000',
                  asalMasalah: "6 dinaikkan ('Aul) menjadi 7",
                  desc: 'Saham total = 3 + 4 + 1 = 8/6 → Aul ke 7/8.',
                },
                {
                  id: '3',
                  nama: 'Soal 3: Al-Gharrawain (Al-Umariyyatain)',
                  arab: 'المسألة الغراوية',
                  komposisi: 'Suami + Ibu + Ayah',
                  harta: 'Rp 600.000.000',
                  asalMasalah: '6 (Ibu ambil 1/3 dari Sisa)',
                  desc: 'Suami 1/2 (3), Sisa = 3. Ibu ambil 1/3 dari sisa (1), Ayah ashabah (2).',
                },
                {
                  id: '4',
                  nama: 'Soal 4: Al-Musytarakah (Al-Himariyah)',
                  arab: 'المسألة المشتركة',
                  komposisi: 'Suami + Ibu + 2 Saudara Seibu + Saudara Sekandung',
                  harta: 'Rp 360.000.000',
                  asalMasalah: '6 (Saudara kandung ikut porsi 1/3 seibu)',
                  desc: 'Keputusan Umar bin Khattab ra membagi rata 1/3.',
                },
              ].map((s) => (
                <div key={s.id} className="card p-5 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">{s.nama}</span>
                    <span className="text-arabic text-xs font-bold text-emerald-800">{s.arab}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="text-slate-700"><strong>Ahli Waris:</strong> {s.komposisi}</p>
                    <p className="text-slate-700"><strong>Tirkah Bersih:</strong> {s.harta}</p>
                    <p className="text-slate-700"><strong>Asal Masalah:</strong> {s.asalMasalah}</p>
                    <p className="text-slate-500 italic mt-1">{s.desc}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                    <Link
                      href="/"
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      Buka di Kalkulator <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 8: AUDIT TRAIL & LOG SIMULASI                       */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'audit_trail' && (
          <div className="space-y-4 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  Audit Trail & Riwayat Hitungan Publik
                </h3>
                <p className="text-xs text-slate-500">
                  Daftar transaksi kalkulasi yang disimpan di database Supabase
                </p>
              </div>
              <span className="badge-slate text-xs font-bold">
                {adminData?.recentKasus?.length || 0} Data Tersimpan
              </span>
            </div>

            {adminData?.recentKasus && adminData.recentKasus.length > 0 ? (
              <div className="card overflow-hidden border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3">Waktu</th>
                        <th className="py-3 px-3">Nama Pewaris</th>
                        <th className="py-3 px-3 text-right">Tirkah Bersih</th>
                        <th className="py-3 px-3 text-center">Asal Masalah</th>
                        <th className="py-3 px-3 text-center">Status Fikih</th>
                        <th className="py-3 px-3 text-center">Juz'us Sahm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {adminData.recentKasus.map((k: any) => (
                        <tr key={k.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-slate-500">
                            {new Date(k.dibuat_pada).toLocaleString('id-ID')}
                          </td>
                          <td className="py-2.5 px-3 font-extrabold text-slate-900">
                            {k.nama_pewaris || 'Hamba Allah'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                            Rp {Number(k.total_harta_bersih).toLocaleString('id-ID')}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">
                            {k.asal_masalah_tashih || k.asal_masalah || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="badge-emerald text-[10px] uppercase font-bold">
                              {k.status_penyelesaian || 'Normal'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-semibold">
                            {k.juz_sahm || 1}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center bg-white border border-slate-200">
                <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="font-extrabold text-sm text-slate-700">Belum Ada Riwayat Tersimpan di Database</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Saat pengguna menghitung harta waris di halaman depan, hasil kalkulasi dan rincian saham akan otomatis tercatat di tabel Supabase ini.
                </p>
              </div>
            )}

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 9: SANDBOX LIVE TEST ENGINE (UPGRADED UI & FIQH)    */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'test_engine' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Top Engine Action Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
                    <Play className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                      <span>Sandbox Engine Faraidh (مختبر علم الفرائض)</span>
                      <span className="badge-emerald text-[10px] font-bold">MODE ASATIDZ</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Uji coba cepat kombinasi 25 ahli waris, analisis kaidah furudh, 'aul, radd, dan tashih masail
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={clearSandbox}
                  className="py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Form
                </button>
                <button
                  onClick={handleRunTest}
                  disabled={testLoading || testSelectedWaris.length === 0}
                  className="py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-extrabold transition-all shadow-sm flex items-center gap-2"
                >
                  <Play className={`w-4 h-4 ${testLoading ? 'animate-spin' : 'fill-white'}`} />
                  {testLoading ? 'Menghitung...' : 'Jalankan Analisis Fikih'}
                </button>
              </div>
            </div>

            {/* Quick Preset Studi Kasus Bar */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                ⚡ Preset Cepat Studi Kasus Faraidh KMI:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {ADMIN_SANDBOX_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 text-xs font-bold whitespace-nowrap transition-all flex flex-col text-left"
                  >
                    <span className="text-[11px]">{preset.label}</span>
                    <span className="text-[10px] text-arabic text-emerald-800 font-bold">{preset.labelArab}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sandbox Main Work Area: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* ─── LEFT COLUMN: CONFIGURATION (5 Cols) ───────────── */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Nominal Tirkah Card */}
                <div className="card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-emerald-600" />
                      <span>Nominal Tirkah Bersih / التركة (Rp)</span>
                    </label>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      value={testHarta}
                      onChange={(e) => setTestHarta(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-extrabold text-slate-900 focus:outline-none focus:border-emerald-600 bg-white"
                      placeholder="Contoh: 360000000"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto text-[10px]">
                    {[120_000_000, 240_000_000, 360_000_000, 600_000_000, 1_200_000_000].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setTestHarta(amt)}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold whitespace-nowrap"
                      >
                        {(amt / 1_000_000)} Jt
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Ahli Waris Ribbon */}
                <div className="card p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">
                        Ahli Waris Terpilih ({testSelectedWaris.length} Golongan)
                      </h4>
                    </div>
                    {testSelectedWaris.length > 0 && (
                      <button
                        onClick={clearSandbox}
                        className="text-[11px] text-rose-600 font-bold hover:underline"
                      >
                        Hapus Semua
                      </button>
                    )}
                  </div>

                  {testSelectedWaris.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {testSelectedWaris.map(sw => {
                        const waris = ahliWarisKodeMap.get(sw.kode)
                        return (
                          <div
                            key={sw.kode}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs"
                          >
                            <span className="font-extrabold text-slate-900">{waris?.nama_id}</span>
                            <span className="text-arabic text-xs font-bold text-emerald-800">{waris?.nama_arab}</span>
                            <span className="px-1.5 py-0.2 bg-emerald-700 text-white rounded font-extrabold text-[10px]">
                              {sw.count}
                            </span>
                            <button
                              onClick={() => setWarisExact(sw.kode, 0)}
                              className="text-slate-400 hover:text-rose-600 ml-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2 text-center">
                      Belum ada ahli waris yang dipilih. Pilih dari kelompok di bawah:
                    </p>
                  )}
                </div>

                {/* Family Clusters Selector */}
                <div className="card p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">
                      Pilih Ahli Waris Berdasarkan Golongan
                    </h4>
                  </div>

                  {/* 4 Cluster Accordions / Boxes */}
                  <div className="space-y-3">
                    {CLUSTERS.map(cluster => {
                      const ClusterIcon = cluster.icon
                      const clusterWaris = cluster.codes
                        .map(kode => ahliWarisKodeMap.get(kode))
                        .filter(Boolean) as AhliWaris[]

                      return (
                        <div key={cluster.id} className={`rounded-xl border p-3.5 ${cluster.color}`}>
                          {/* Cluster Title */}
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-2">
                              <ClusterIcon className="w-4 h-4" />
                              <span className="font-extrabold text-xs">{cluster.title}</span>
                            </div>
                            <span className="text-arabic text-sm font-bold">{cluster.titleArab}</span>
                          </div>

                          {/* Grid of Heirs */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {clusterWaris.map(w => {
                              const active = testSelectedWaris.find(s => s.kode === w.kode)
                              const count = active ? active.count : 0

                              return (
                                <div
                                  key={w.kode}
                                  className={`p-2 rounded-lg bg-white border transition-all flex items-center justify-between gap-1.5 ${
                                    count > 0
                                      ? 'border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                                      : 'border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-extrabold text-slate-900 truncate">
                                      {w.nama_id}
                                    </div>
                                    <div className="text-arabic text-xs font-bold text-emerald-800">
                                      {w.nama_arab}
                                    </div>
                                  </div>

                                  {/* Stepper Buttons */}
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => updateWarisCount(w.kode, -1)}
                                      disabled={count === 0}
                                      className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 flex items-center justify-center transition-colors"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-5 text-center font-extrabold text-xs text-slate-900">
                                      {count}
                                    </span>
                                    <button
                                      onClick={() => updateWarisCount(w.kode, 1)}
                                      className="w-6 h-6 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors shadow-sm"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>

              {/* ─── RIGHT COLUMN: DEEP DETAILED FIQH RESULTS (7 Cols) ─ */}
              <div className="lg:col-span-7 space-y-4">
                
                {testResult ? (
                  <div className="space-y-5 animate-fadeIn">
                    
                    {/* 1. Status Banner & Diagnosis Box */}
                    <div className="card p-5 bg-white border border-slate-200 space-y-4">
                      
                      {/* Top Diagnostic Title */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Status Penyelesaian Faraidh (حالة المسألة)
                          </span>
                          <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                            {testResult.status_penyelesaian === 'adilah' && <span>Kasus Normal ('Adilah / مسألة عادلة)</span>}
                            {testResult.status_penyelesaian === 'aul' && <span>Kasus 'Aul (مسألة عائلة — Saham Membengkak)</span>}
                            {testResult.status_penyelesaian === 'radd' && <span>Kasus Radd (مسألة ردية — Pengembalian Sisa)</span>}
                            {testResult.status_penyelesaian === 'tashih' && <span>Kasus Tashih (مسألة مصححة — Koreksi Pecahan)</span>}
                            {testResult.status_penyelesaian === 'kasus_khusus' && <span>Kasus Khusus (مسألة خاصة — Fatwa Shahabat)</span>}
                          </h4>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                          testResult.status_penyelesaian === 'aul' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          testResult.status_penyelesaian === 'radd' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          testResult.status_penyelesaian === 'tashih' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {testResult.status_penyelesaian}
                        </span>
                      </div>

                      {/* 4 Pillars Grid (Asal Masalah, 'Aul/Radd, Tashih, Juz'us Sahm) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-bold block">Asal Masalah Pokok</span>
                          <span className="text-arabic text-xs text-slate-400 font-bold block">أصل المسألة</span>
                          <span className="text-lg font-extrabold text-slate-900 mt-1 block">
                            {testResult.asal_masalah_pokok}
                          </span>
                        </div>

                        <div className={`p-3 rounded-xl border ${
                          testResult.asal_masalah_aul ? 'bg-rose-50 border-rose-200 text-rose-900' :
                          testResult.asal_masalah_radd ? 'bg-amber-50 border-amber-200 text-amber-900' :
                          'bg-slate-50 border-slate-200 text-slate-900'
                        }`}>
                          <span className="text-[10px] font-bold block">
                            {testResult.asal_masalah_aul ? "Naik ('Aul) Ke" :
                             testResult.asal_masalah_radd ? "Turun (Radd) Ke" :
                             "Status Saham"}
                          </span>
                          <span className="text-arabic text-xs font-bold block">
                            {testResult.asal_masalah_aul ? "عالت إلى" :
                             testResult.asal_masalah_radd ? "ردت إلى" :
                             "عادلة"}
                          </span>
                          <span className="text-lg font-extrabold mt-1 block">
                            {testResult.asal_masalah_aul || testResult.asal_masalah_radd || testResult.asal_masalah_pokok}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-bold block">Juz'us Sahm</span>
                          <span className="text-arabic text-xs text-slate-400 font-bold block">جزء السهم</span>
                          <span className="text-lg font-extrabold text-slate-900 mt-1 block">
                            {testResult.juz_sahm}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-bold block">Asal Masalah Akhir</span>
                          <span className="text-arabic text-xs text-slate-400 font-bold block">المصحح النهائي</span>
                          <span className="text-lg font-extrabold text-emerald-800 mt-1 block">
                            {testResult.asal_masalah_tashih || testResult.asal_masalah_aul || testResult.asal_masalah_radd || testResult.asal_masalah_pokok}
                          </span>
                        </div>
                      </div>

                      {/* Explicit Explanations for 'Aul / Radd / Tashih */}
                      {testResult.asal_masalah_aul && (
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                          <div className="font-extrabold flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-rose-600" />
                            <span>Penjelasan Kaidah 'Aul (بيان مسألة العول):</span>
                          </div>
                          <p className="leading-relaxed">
                            Total saham furudh ahli waris (<strong className="font-bold">{testResult.asal_masalah_aul}</strong>) melebihi Asal Masalah pokok (<strong className="font-bold">{testResult.asal_masalah_pokok}</strong>). 
                            Maka asal masalah dinaikkan secara syar'i dari <strong className="font-bold">{testResult.asal_masalah_pokok} ➔ {testResult.asal_masalah_aul}</strong> (<span className="text-arabic font-bold">عالت إلى {testResult.asal_masalah_aul}</span>) agar pembagian berkurang secara adil dan proporsional.
                          </p>
                        </div>
                      )}

                      {testResult.asal_masalah_radd && (
                        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                          <div className="font-extrabold flex items-center gap-1.5">
                            <TrendingDown className="w-4 h-4 text-amber-700" />
                            <span>Penjelasan Kaidah Radd (بيان مسألة الرد):</span>
                          </div>
                          <p className="leading-relaxed">
                            Jumlah saham furudh (<strong className="font-bold">{testResult.asal_masalah_radd}</strong>) lebih kecil dari Asal Masalah pokok (<strong className="font-bold">{testResult.asal_masalah_pokok}</strong>) dan tidak ada ahli waris Ashabah. 
                            Maka sisa harta dikembalikan (<span className="text-arabic font-bold">ردّت إلى {testResult.asal_masalah_radd}</span>) kepada dzawil furudh yang berhak.
                          </p>
                        </div>
                      )}

                      {testResult.juz_sahm > 1 && (
                        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                          <div className="font-extrabold flex items-center gap-1.5">
                            <Wrench className="w-4 h-4 text-blue-700" />
                            <span>Penjelasan Tashih Masail & Mahfudzat (تصحيح المسائل والمحفوظات):</span>
                          </div>
                          <p className="leading-relaxed">
                            Terjadi pecahan saham pada individu ahli waris (Inkisar). Maka dicari faktor pengali <strong>Juz'us Sahm = {testResult.juz_sahm}</strong>.
                            Rumus Tashih: <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-bold">{testResult.asal_masalah} × {testResult.juz_sahm} = {testResult.asal_masalah_tashih}</code>.
                          </p>
                        </div>
                      )}

                    </div>

                    {/* 2. TABEL 1: PEMBAGIAN SAHAM & KAIDAH FIKIH */}
                    <div className="card overflow-hidden border border-slate-200">
                      <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Scale className="w-4 h-4 text-emerald-400" />
                          <h4 className="font-extrabold text-xs uppercase tracking-wide">
                            Tabel 1: Pembagian Saham & Kaidah Fikih
                          </h4>
                        </div>
                        <span className="text-arabic text-xs text-emerald-300 font-bold">
                          جدول السهام وقواعد الفقه
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3">Ahli Waris (الوارث)</th>
                              <th className="py-2.5 px-3 text-center">Jumlah (العدد)</th>
                              <th className="py-2.5 px-3 text-center">Porsi Syar'i (الفرض)</th>
                              <th className="py-2.5 px-3">Syarat & Kaidah Fikih (العلة والشروط)</th>
                              <th className="py-2.5 px-3 text-center">Saham (السهام)</th>
                              <th className="py-2.5 px-3 text-center">Persentase (%)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {berhakList.map((h, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="py-2.5 px-3">
                                  <div className="font-extrabold text-slate-900">{h.nama_id}</div>
                                  <div className="text-arabic text-xs font-bold text-emerald-800">{h.nama_arab}</div>
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                                  {h.jumlah_orang} org
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-xs">
                                    {h.pecahan || 'Ashabah'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                                  {h.alasan_syarat || h.keterangan || '-'}
                                </td>
                                <td className="py-2.5 px-3 text-center font-extrabold text-slate-900 text-sm">
                                  {h.saham_total_kelompok}
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold text-slate-600">
                                  {testResult.total_harta_bersih > 0 && h.nominal_total_kelompok
                                    ? `${((h.nominal_total_kelompok / testResult.total_harta_bersih) * 100).toFixed(2)}%`
                                    : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 3. TABEL 2: PEMBAGIAN NOMINAL TIRKAH (RUPIAH) */}
                    <div className="card overflow-hidden border border-slate-200">
                      <div className="bg-emerald-800 text-white p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-emerald-200" />
                          <h4 className="font-extrabold text-xs uppercase tracking-wide">
                            Tabel 2: Pembagian Nominal Harta / Tirkah
                          </h4>
                        </div>
                        <span className="text-arabic text-xs text-emerald-200 font-bold">
                          جدول توزيع التركة النقدية
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3">Ahli Waris (الوارث)</th>
                              <th className="py-2.5 px-3 text-center">Jumlah (العدد)</th>
                              <th className="py-2.5 px-3">Rumus Nominal (طريقة الحساب)</th>
                              <th className="py-2.5 px-3 text-right">Total Kelompok (مجموع النصيب)</th>
                              <th className="py-2.5 px-3 text-right">Per Individu (نصيب الفرد)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {berhakList.map((h, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="py-2.5 px-3 font-extrabold text-slate-900">
                                  {h.nama_id}
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                                  {h.jumlah_orang} orang
                                </td>
                                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                                  ({h.saham_total_kelompok} ÷ {testResult.asal_masalah_tashih || testResult.asal_masalah_aul || testResult.asal_masalah_radd || testResult.asal_masalah_pokok}) × Tirkah
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-extrabold text-slate-900">
                                  Rp {(h.nominal_total_kelompok || 0).toLocaleString('id-ID')}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                                  Rp {(h.nominal_per_orang || 0).toLocaleString('id-ID')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-slate-50 font-extrabold border-t border-slate-200">
                            <tr>
                              <td colSpan={3} className="py-3 px-3 text-slate-800 uppercase">
                                Total Tirkah Terdistribusi (إجمالي التركة الموزعة)
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-emerald-800 text-sm">
                                Rp {testResult.total_harta_bersih.toLocaleString('id-ID')}
                              </td>
                              <td className="py-3 px-3 text-right text-[10px] text-emerald-700 font-bold">
                                100% Selesai
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    {/* 4. TABEL AHLI WARIS TERHIJAB / GUGUR (JIKA ADA) */}
                    {gugurList.length > 0 && (
                      <div className="card overflow-hidden border border-rose-200">
                        <div className="bg-rose-700 text-white p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-rose-200" />
                            <h4 className="font-extrabold text-xs uppercase tracking-wide">
                              Ahli Waris Terhijab / Gugur ({gugurList.length} Orang)
                            </h4>
                          </div>
                          <span className="text-arabic text-xs text-rose-200 font-bold">
                            المحجوبون والممنوعون من الإرث
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-rose-50 text-rose-900 font-bold border-b border-rose-200">
                              <tr>
                                <th className="py-2 px-3">Ahli Waris Terhalang</th>
                                <th className="py-2 px-3 text-center">Jumlah</th>
                                <th className="py-2 px-3">Sebab Gugur / Hijab Hirman</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-rose-100">
                              {gugurList.map((g, idx) => (
                                <tr key={idx} className="hover:bg-rose-50/50">
                                  <td className="py-2 px-3 font-bold text-slate-800 line-through decoration-rose-500">
                                    {g.nama_id} ({g.nama_arab})
                                  </td>
                                  <td className="py-2 px-3 text-center text-slate-600">
                                    {g.jumlah_orang} org
                                  </td>
                                  <td className="py-2 px-3 text-rose-700 font-semibold">
                                    {g.alasan_gugur || g.keterangan || 'Terhalang oleh ahli waris yang lebih dekat'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="card p-12 text-center bg-white border border-slate-200 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                      <Scale className="w-6 h-6" />
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-800">
                      Mesin Faraidh Siap Dijalankan
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Pilih ahli waris di kolom kiri atau gunakan preset cepat di atas, lalu klik tombol <strong>"Jalankan Analisis Fikih"</strong> untuk memunculkan rincian tabel saham, asal masalah, 'aul, radd, dan tashih.
                    </p>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </main>

      {/* ─── ADMIN FOOTER ─────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            <strong>Panel Faraidh KMI Gontor</strong> — Fiqh Rules Engine & Curriculum Management
          </div>
          <div>
            Ditinjau berdasarkan Kitab Faraidh Kelas 3 KMI & Kitab Bidayatul Mujtahid
          </div>
        </div>
      </footer>

    </div>
  )
}
