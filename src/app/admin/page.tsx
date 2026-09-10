'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
  ArrowRight,
  HelpCircle,
  Calendar,
  CheckCheck,
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
    color: 'border-emerald-200 bg-emerald-50/40 text-emerald-900',
    icon: Users,
    codes: ['suami', 'istri'],
  },
  {
    id: 'furu',
    title: 'Anak & Cucu (Al-Furu\')',
    titleArab: 'الفروع',
    color: 'border-sky-200 bg-sky-50/40 text-sky-900',
    icon: Layers,
    codes: ['anak_lk', 'anak_pr', 'cucu_lk', 'cucu_pr'],
  },
  {
    id: 'usul',
    title: 'Orang Tua & Leluhur (Al-Ushul)',
    titleArab: 'الأصول',
    color: 'border-purple-200 bg-purple-50/40 text-purple-900',
    icon: GraduationCap,
    codes: ['ayah', 'ibu', 'kakek', 'nenek_ibu', 'nenek_ayah'],
  },
  {
    id: 'hawasyi',
    title: 'Saudara & Kerabat (Al-Hawasyi)',
    titleArab: 'الحواشي',
    color: 'border-amber-200 bg-amber-50/40 text-amber-900',
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
    labelArab: 'المسألة العادلة',
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
    labelArab: 'مسألة العول (6 إلى 7)',
    harta: 420_000_000,
    desc: 'Suami + 2 Saudari Kandung + Ibu',
    waris: [
      { kode: 'suami', count: 1 },
      { kode: 'saudari_kandung', count: 2 },
      { kode: 'ibu', count: 1 },
    ],
  },
  {
    label: "Kasus 'Aul (12 ➔ 13)",
    labelArab: 'مسألة العول (12 إلى 13)',
    harta: 390_000_000,
    desc: 'Suami + Ibu + 2 Anak Perempuan',
    waris: [
      { kode: 'suami', count: 1 },
      { kode: 'ibu', count: 1 },
      { kode: 'anak_pr', count: 2 },
    ],
  },
  {
    label: "Kasus 'Aul (24 ➔ 27 / Minbariyyah)",
    labelArab: 'المسألة المنبرية',
    harta: 540_000_000,
    desc: 'Istri + 2 Anak Pr + Ayah + Ibu',
    waris: [
      { kode: 'istri', count: 1 },
      { kode: 'anak_pr', count: 2 },
      { kode: 'ayah', count: 1 },
      { kode: 'ibu', count: 1 },
    ],
  },
  {
    label: "Kasus Radd (Ibu + Anak Pr)",
    labelArab: 'مسألة الرد',
    harta: 200_000_000,
    desc: 'Ibu + Anak Perempuan (Asal Masalah 6 ➔ Radd ke 4)',
    waris: [
      { kode: 'ibu', count: 1 },
      { kode: 'anak_pr', count: 1 },
    ],
  },
  {
    label: "Kasus Inkisar (Tashih 2 Golongan)",
    labelArab: 'تصحيح المسائل (انكسار)',
    harta: 360_000_000,
    desc: '2 Istri + 4 Saudari Kandung (Perlu Mahfudzat)',
    waris: [
      { kode: 'istri', count: 2 },
      { kode: 'saudari_kandung', count: 4 },
    ],
  },
  {
    label: "Al-Gharrawain (Al-Umariyyatain)",
    labelArab: 'المسألة الغراوية',
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
    labelArab: 'المسألة المشتركة',
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

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [loading, setLoading] = useState(true)
  const [adminData, setAdminData] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'L' | 'P'>('ALL')
  const [furudhFilter, setFurudhFilter] = useState<string>('ALL')
  const [selectedPenghalang, setSelectedPenghalang] = useState<string>('ALL')
  const [copiedText, setCopiedText] = useState<string | null>(null)

  // ─── Sandbox State (DEFAULT KOSONG) ───────────────────────────────────
  const [testNama, setTestNama] = useState('Uji Kasus Faraidh')
  const [testHarta, setTestHarta] = useState(360000000)
  const [testSelectedWaris, setTestSelectedWaris] = useState<{ kode: string; count: number }[]>([])
  const [testResult, setTestResult] = useState<HasilKalkulasi | null>(null)
  const [testLoading, setTestLoading] = useState(false)
  
  // Mobile cluster active tab: 'all' | 'pasangan' | 'furu' | 'usul' | 'hawasyi'
  const [selectedClusterTab, setSelectedClusterTab] = useState<string>('pasangan')
  const [sandboxSearch, setSandboxSearch] = useState('')

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

  const loadPresetAndOpenSandbox = (preset: typeof ADMIN_SANDBOX_PRESETS[0]) => {
    applyPreset(preset)
    setActiveTab('test_engine')
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
        // Auto scroll to result on mobile
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
          setTimeout(() => {
            const el = document.getElementById('sandbox-result-anchor')
            el?.scrollIntoView({ behavior: 'smooth' })
          }, 100)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setTestLoading(false)
    }
  }

  const ahliWarisMap = useMemo(() => new Map<number, AhliWaris>(
    (adminData?.ahliWaris || []).map((a: AhliWaris) => [a.id, a])
  ), [adminData])

  const ahliWarisKodeMap = useMemo(() => new Map<string, AhliWaris>(
    (adminData?.ahliWaris || []).map((a: AhliWaris) => [a.kode, a])
  ), [adminData])

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
  const totalJiwaPilihan = testSelectedWaris.reduce((sum, w) => sum + w.count, 0)

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 pb-20 lg:pb-8">
      
      {/* ─── ADMIN TOPBAR ─────────────────────────────────────── */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand & Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
              <Sliders className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
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
          <div className="flex items-center gap-2">
            {adminData?.isLiveDB ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                Supabase Live
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                Seed Rules
              </span>
            )}

            <button
              onClick={loadData}
              disabled={loading}
              title="Refresh Data Kaidah"
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kalkulator Publik</span>
              <span className="sm:hidden">Publik</span>
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
            onClick={() => setActiveTab('test_engine')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'test_engine'
                ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600/30'
                : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Sandbox Engine Fiqh
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

        </div>
      </div>

      {/* ─── MAIN CONTENT ─────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 py-5 flex-1 w-full space-y-5">

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 1: OVERVIEW & DASHBOARD METRICS                     */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-5 animate-fadeIn">
            
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="card p-3.5 text-center border-l-4 border-l-emerald-600">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                  Ahli Waris
                </span>
                <span className="text-xl font-extrabold text-slate-900">25</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">15 Lk / 10 Pr</span>
              </div>

              <div className="card p-3.5 text-center border-l-4 border-l-sky-600">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                  Kaidah Furudh
                </span>
                <span className="text-xl font-extrabold text-slate-900">24</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">6 Macam Porsi</span>
              </div>

              <div className="card p-3.5 text-center border-l-4 border-l-rose-600">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                  Hijab Hirman
                </span>
                <span className="text-xl font-extrabold text-slate-900">33</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Gugur Total</span>
              </div>

              <div className="card p-3.5 text-center border-l-4 border-l-amber-600">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                  Hijab Nuqshan
                </span>
                <span className="text-xl font-extrabold text-slate-900">12</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Penurunan Porsi</span>
              </div>

              <div className="card p-3.5 text-center border-l-4 border-l-indigo-600">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                  Ashabah
                </span>
                <span className="text-xl font-extrabold text-slate-900">19</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">3 Macam Kaidah</span>
              </div>

              <div className="card p-3.5 text-center border-l-4 border-l-purple-600">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                  Kasus Khusus
                </span>
                <span className="text-xl font-extrabold text-slate-900">3</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Fatwa Override</span>
              </div>
            </div>

            {/* Architecture Flow Banner */}
            <div className="card p-5 bg-white border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-700" />
                    Arsitektur 10 Langkah Faraidh Engine KMI Gontor
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Urutan eksekusi komputasi syar'i dari pembersihan tirkah hingga pembagian nominal
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('test_engine')}
                  className="btn-primary text-xs py-1.5 px-3 self-start sm:self-auto"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Buka Sandbox Engine
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { step: '1', title: 'Tirkah Bersih', desc: 'Hak mayit dipotong.' },
                  { step: '2', title: 'Mawani\'ul Irts', desc: 'Filter pembunuh/budak.' },
                  { step: '3', title: 'Hijab Hirman', desc: 'Gugur oleh yg dekat.' },
                  { step: '4', title: 'Furudh Pasti', desc: '1/2, 1/4, 1/8, 2/3, 1/3, 1/6.' },
                  { step: '5', title: 'Hijab Nuqshan', desc: 'Penurunan porsi anak.' },
                  { step: '6', title: 'Ashabah', desc: 'Sisa dibagi prioritas.' },
                  { step: '7', title: 'Asal Masalah', desc: 'KPK penyebut furudh.' },
                  { step: '8', title: '\'Aul / Radd', desc: 'Koreksi kelebihan/sisa.' },
                  { step: '9', title: 'Tashih Masail', desc: 'Pencegahan pecahan.' },
                  { step: '10', title: 'Bagi Nominal', desc: 'Distribusi rupiah tirkah.' },
                ].map((item) => (
                  <div key={item.step} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[9px] font-extrabold flex items-center justify-center">
                        {item.step}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links & Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="card p-4 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    Preset Bank Soal KMI
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Uji langsung studi kasus imtihan semester santri KMI ke mesin hitung.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('bank_soal')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start"
                >
                  Lihat 5 Soal <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="card p-4 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-700" />
                    Matriks Hijab Interaktif
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Cek 33 relasi penghalang (Hajib) dan terhalang (Mahjub).
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('hijab')}
                  className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1 self-start"
                >
                  Buka Matriks <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="card p-4 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-indigo-700" />
                    Audit Log Simulasi
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Rekap riwayat hitungan tirkah yang tersimpan di database.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('audit_trail')}
                  className="text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1 self-start"
                >
                  Buka Riwayat <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 2: SANDBOX ENGINE (MOBILE-FIRST & EASY-TO-USE)      */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'test_engine' && (
          <div className="space-y-5 animate-fadeIn">
            
            {/* Top Engine Control Bar */}
            <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <Play className="w-4 h-4 fill-emerald-700 text-emerald-700" />
                  <span>Sandbox Engine Faraidh (مختبر علم الفرائض)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Uji coba kombinasi 25 ahli waris secara instan dengan rincian fikih mendalam
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={clearSandbox}
                  className="py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
                <button
                  onClick={handleRunTest}
                  disabled={testLoading || testSelectedWaris.length === 0}
                  className="btn-primary text-xs py-2 px-4"
                >
                  <Play className={`w-3.5 h-3.5 ${testLoading ? 'animate-spin' : 'fill-white'}`} />
                  {testLoading ? 'Menghitung...' : 'Jalankan Analisis'}
                </button>
              </div>
            </div>

            {/* Quick Presets Scrollbar */}
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Preset Cepat Soal Ujian KMI:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {ADMIN_SANDBOX_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyPreset(preset)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 text-xs font-semibold whitespace-nowrap transition-all"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Work Area: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* ─── LEFT: COMPACT HEIR SELECTOR (5 COLS) ──────────── */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Nominal Tirkah Input */}
                <div className="card p-4 space-y-2.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Tirkah Bersih / التركة (Rp)</span>
                    <span className="text-emerald-800 font-mono font-extrabold text-xs">
                      Rp {testHarta.toLocaleString('id-ID')}
                    </span>
                  </label>
                  <input
                    type="number"
                    value={testHarta}
                    onChange={(e) => setTestHarta(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-extrabold text-slate-900 focus:outline-none focus:border-emerald-600 bg-white"
                  />
                  <div className="flex items-center gap-1.5 overflow-x-auto text-[10px]">
                    {[120_000_000, 240_000_000, 360_000_000, 600_000_000].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setTestHarta(amt)}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                      >
                        {(amt / 1_000_000)} Jt
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Heirs Summary Chips */}
                <div className="card p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Ahli Waris Terpilih ({testSelectedWaris.length} Golongan / {totalJiwaPilihan} Jiwa)
                    </span>
                    {testSelectedWaris.length > 0 && (
                      <button onClick={clearSandbox} className="text-[10px] text-rose-600 font-bold hover:underline">
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
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs"
                          >
                            <span className="font-extrabold text-slate-900">{waris?.nama_id}</span>
                            <span className="px-1.5 bg-emerald-700 text-white rounded font-extrabold text-[10px]">
                              {sw.count}
                            </span>
                            <button
                              onClick={() => setWarisExact(sw.kode, 0)}
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-1 text-center">
                      Belum ada ahli waris yang dipilih.
                    </p>
                  )}
                </div>

                {/* Mobile-Friendly Sub-Cluster Tabs */}
                <div className="card p-3.5 space-y-3">
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-100 scrollbar-none">
                    {CLUSTERS.map(cluster => {
                      const countInCluster = testSelectedWaris.filter(w => cluster.codes.includes(w.kode)).reduce((sum, w) => sum + w.count, 0)
                      return (
                        <button
                          key={cluster.id}
                          onClick={() => setSelectedClusterTab(cluster.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                            selectedClusterTab === cluster.id
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span>{cluster.title}</span>
                          {countInCluster > 0 && (
                            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center font-bold">
                              {countInCluster}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Active Cluster Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CLUSTERS.find(c => c.id === selectedClusterTab)?.codes.map(kode => {
                      const w = ahliWarisKodeMap.get(kode)
                      if (!w) return null
                      const active = testSelectedWaris.find(s => s.kode === w.kode)
                      const count = active ? active.count : 0

                      return (
                        <div
                          key={w.kode}
                          className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                            count > 0
                              ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500/20'
                              : 'border-slate-200 bg-white hover:border-slate-300'
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

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => updateWarisCount(w.kode, -1)}
                              disabled={count === 0}
                              className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center font-extrabold text-xs text-slate-900">
                              {count}
                            </span>
                            <button
                              onClick={() => updateWarisCount(w.kode, 1)}
                              className="w-6 h-6 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shadow-sm"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>

              {/* ─── RIGHT: DEEP DETAILED FIQH RESULTS (7 COLS) ────── */}
              <div id="sandbox-result-anchor" className="lg:col-span-7 space-y-4">
                
                {testResult ? (
                  <div className="space-y-4 animate-fadeIn">
                    
                    {/* 1. Status & 4 Pillars Card */}
                    <div className="card p-4 sm:p-5 space-y-4">
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Status Penyelesaian
                          </span>
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                            {testResult.status_penyelesaian === 'adilah' && <span>Kasus Normal ('Adilah / مسألة عادلة)</span>}
                            {testResult.status_penyelesaian === 'aul' && <span>Kasus 'Aul (مسألة عائلة — Saham Membengkak)</span>}
                            {testResult.status_penyelesaian === 'radd' && <span>Kasus Radd (مسألة ردية — Sisa Dikembalikan)</span>}
                            {testResult.status_penyelesaian === 'tashih' && <span>Kasus Tashih (مسألة مصححة — Koreksi Pecahan)</span>}
                            {testResult.status_penyelesaian === 'kasus_khusus' && <span>Kasus Khusus Syar'i (مسألة خاصة)</span>}
                          </h4>
                        </div>

                        <span className="badge-emerald text-xs font-bold uppercase self-start sm:self-auto">
                          {testResult.status_penyelesaian}
                        </span>
                      </div>

                      {/* 4 Pillars Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-bold block">Asal Masalah Pokok</span>
                          <span className="text-arabic text-xs text-slate-400 font-bold block">أصل المسألة</span>
                          <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                            {testResult.asal_masalah_pokok}
                          </span>
                        </div>

                        <div className={`p-2.5 rounded-xl border ${
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
                          <span className="text-base font-extrabold mt-0.5 block">
                            {testResult.asal_masalah_aul || testResult.asal_masalah_radd || testResult.asal_masalah_pokok}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-bold block">Juz'us Sahm</span>
                          <span className="text-arabic text-xs text-slate-400 font-bold block">جزء السهم</span>
                          <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                            {testResult.juz_sahm}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-bold block">Asal Masalah Akhir</span>
                          <span className="text-arabic text-xs text-slate-400 font-bold block">المصحح النهائي</span>
                          <span className="text-base font-extrabold text-emerald-800 mt-0.5 block">
                            {testResult.asal_masalah_tashih || testResult.asal_masalah_aul || testResult.asal_masalah_radd || testResult.asal_masalah_pokok}
                          </span>
                        </div>
                      </div>

                      {/* Tashih & Mahfudzat Card */}
                      {testResult.juz_sahm > 1 && (
                        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 space-y-2.5">
                          <div className="flex items-center justify-between border-b border-blue-200 pb-1.5">
                            <div className="font-extrabold flex items-center gap-1.5 text-blue-900">
                              <Wrench className="w-4 h-4 text-blue-700" />
                              <span>Rincian Kaidah Tashih al-Masail & Mahfudzat</span>
                            </div>
                            <span className="badge-blue text-[10px] font-bold">
                              Juz'us Sahm = {testResult.juz_sahm}
                            </span>
                          </div>

                          {testResult.mahfudzat_detail && testResult.mahfudzat_detail.length > 0 && (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs text-left bg-white border border-blue-200 rounded-lg overflow-hidden">
                                <thead className="bg-blue-100/70 text-blue-900 font-bold border-b border-blue-200">
                                  <tr>
                                    <th className="px-2.5 py-1.5">Golongan</th>
                                    <th className="px-2 py-1.5 text-center">Saham Asal</th>
                                    <th className="px-2 py-1.5 text-center">Jiwa</th>
                                    <th className="px-2 py-1.5 text-center">Relasi</th>
                                    <th className="px-2 py-1.5 text-center">Mahfudz</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-100 font-medium">
                                  {testResult.mahfudzat_detail.map(md => (
                                    <tr key={md.kode} className="hover:bg-blue-50/40">
                                      <td className="px-2.5 py-1.5 font-bold text-slate-900">
                                        {md.nama_id}
                                      </td>
                                      <td className="px-2 py-1.5 text-center font-mono font-bold">{md.saham_asal}</td>
                                      <td className="px-2 py-1.5 text-center font-mono">{md.kepala}</td>
                                      <td className="px-2 py-1.5 text-center text-[10px] font-bold text-blue-800">
                                        {md.relasi}
                                      </td>
                                      <td className="px-2 py-1.5 text-center font-mono font-extrabold text-blue-900">
                                        {md.mahfudz}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          <div className="text-[11px] font-mono text-blue-900 font-bold">
                            Rumus: {testResult.asal_masalah} × {testResult.juz_sahm} = {testResult.asal_masalah_tashih}
                          </div>
                        </div>
                      )}

                    </div>

                    {/* 2. TABEL 1: PEMBAGIAN SAHAM */}
                    <div className="card overflow-hidden border border-slate-200">
                      <div className="bg-slate-900 text-white p-3 flex items-center justify-between">
                        <h4 className="font-extrabold text-xs uppercase tracking-wide flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5 text-emerald-400" />
                          Tabel 1: Pembagian Saham & Kaidah Fikih
                        </h4>
                        <span className="text-arabic text-xs text-emerald-300 font-bold hidden sm:inline">
                          جدول السهام وقواعد الفقه
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-2 px-3">Ahli Waris</th>
                              <th className="py-2 px-2 text-center">Jiwa</th>
                              <th className="py-2 px-2 text-center">Porsi</th>
                              <th className="py-2 px-3">Syarat Fikih</th>
                              <th className="py-2 px-3 text-center">Rincian Saham</th>
                              <th className="py-2 px-3 text-right">Porsi (%)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {berhakList.map((h, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="py-2 px-3 font-extrabold text-slate-900">
                                  <div>{h.nama_id}</div>
                                  <div className="text-arabic text-xs font-bold text-emerald-800">{h.nama_arab}</div>
                                </td>
                                <td className="py-2 px-2 text-center font-bold text-slate-700">{h.jumlah_orang}</td>
                                <td className="py-2 px-2 text-center">
                                  <span className="badge-emerald text-[10px] py-0">{h.pecahan || 'Ashabah'}</span>
                                </td>
                                <td className="py-2 px-3 text-slate-600 text-[11px] max-w-xs">{h.alasan_syarat || h.keterangan || '-'}</td>
                                <td className="py-2 px-3 text-center">
                                  <div className="font-extrabold text-slate-900 font-mono text-sm">{h.saham_total_kelompok}</div>
                                  {testResult.juz_sahm > 1 && h.saham_asal !== undefined && (
                                    <div className="text-[10px] font-mono text-blue-800 bg-blue-50 px-1 rounded inline-block">
                                      {h.saham_asal} × {testResult.juz_sahm}
                                    </div>
                                  )}
                                  {h.jumlah_orang > 1 && (
                                    <div className="text-[10px] text-slate-500 font-mono">
                                      {h.saham_per_orang}/org
                                    </div>
                                  )}
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-bold text-slate-700">
                                  {testResult.total_harta_bersih > 0 && h.nominal_total_kelompok
                                    ? `${((h.nominal_total_kelompok / testResult.total_harta_bersih) * 100).toFixed(1)}%`
                                    : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 3. TABEL 2: PEMBAGIAN NOMINAL TIRKAH */}
                    <div className="card overflow-hidden border border-slate-200">
                      <div className="bg-emerald-800 text-white p-3 flex items-center justify-between">
                        <h4 className="font-extrabold text-xs uppercase tracking-wide flex items-center gap-1.5">
                          <Coins className="w-3.5 h-3.5 text-emerald-200" />
                          Tabel 2: Pembagian Nominal Harta (Tirkah)
                        </h4>
                        <span className="text-arabic text-xs text-emerald-200 font-bold hidden sm:inline">
                          جدول توزيع التركة
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-2 px-3">Ahli Waris</th>
                              <th className="py-2 px-2 text-center">Jiwa</th>
                              <th className="py-2 px-3 text-right">Total Kelompok</th>
                              <th className="py-2 px-3 text-right">Per Individu</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {berhakList.map((h, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="py-2 px-3 font-extrabold text-slate-900">{h.nama_id}</td>
                                <td className="py-2 px-2 text-center font-bold text-slate-700">{h.jumlah_orang}</td>
                                <td className="py-2 px-3 text-right font-mono font-extrabold text-slate-900">
                                  Rp {(h.nominal_total_kelompok || 0).toLocaleString('id-ID')}
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                                  Rp {(h.nominal_per_orang || 0).toLocaleString('id-ID')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-slate-50 font-extrabold border-t border-slate-200">
                            <tr>
                              <td colSpan={2} className="py-2.5 px-3 text-slate-800 uppercase">Total</td>
                              <td className="py-2.5 px-3 text-right font-mono text-emerald-800">
                                Rp {testResult.total_harta_bersih.toLocaleString('id-ID')}
                              </td>
                              <td className="py-2.5 px-3 text-right text-[10px] text-emerald-700">100% Selesai</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    {/* 4. TABEL TERHIJAB / GUGUR */}
                    {gugurList.length > 0 && (
                      <div className="card p-3.5 border border-rose-200 bg-rose-50/40 space-y-2">
                        <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                          Ahli Waris Terhijab / Gugur ({gugurList.length} Orang)
                        </span>
                        <div className="space-y-1">
                          {gugurList.map((g, idx) => (
                            <div key={idx} className="text-xs text-slate-700 flex items-center justify-between bg-white p-2 rounded border border-rose-100">
                              <span className="line-through font-bold text-slate-800">{g.nama_id} ({g.nama_arab})</span>
                              <span className="text-[11px] text-rose-700 font-semibold">{g.alasan_gugur || 'Terhalang oleh ahli waris lebih dekat'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="card p-10 text-center bg-white border border-slate-200 space-y-2.5">
                    <Scale className="w-8 h-8 text-emerald-700 mx-auto" />
                    <h4 className="font-extrabold text-sm text-slate-800">Mesin Sandbox Faraidh Siap</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Pilih ahli waris di kolom kiri atau klik salah satu preset cepat, lalu klik tombol <strong>"Jalankan Analisis"</strong> untuk melihat rincian porsi dan nominal.
                    </p>
                  </div>
                )}

              </div>

            </div>

            {/* Sticky Mobile Run Bar */}
            {testSelectedWaris.length > 0 && (
              <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 flex items-center justify-between gap-3 shadow-lg">
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">{totalJiwaPilihan} Jiwa Terpilih</span>
                  <span className="text-[10px] text-slate-500 font-mono">Rp {testHarta.toLocaleString('id-ID')}</span>
                </div>
                <button
                  onClick={handleRunTest}
                  disabled={testLoading}
                  className="btn-primary text-xs py-2 px-5 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  {testLoading ? 'Menghitung...' : 'Jalankan Analisis'}
                </button>
              </div>
            )}

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 3: MASTER 25 AHLI WARIS                             */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'ahli_waris' && (
          <div className="space-y-4 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Master 25 Ahli Waris (الوارثون من الرجال والنساء)
                </h3>
                <p className="text-xs text-slate-500">
                  15 Ahli Waris Laki-laki dan 10 Ahli Waris Perempuan
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari ahli waris..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1 rounded-lg border border-slate-200 text-xs w-36 sm:w-48 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                  <button
                    onClick={() => setGenderFilter('ALL')}
                    className={`px-2 py-0.5 rounded text-xs font-bold ${genderFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setGenderFilter('L')}
                    className={`px-2 py-0.5 rounded text-xs font-bold ${genderFilter === 'L' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500'}`}
                  >
                    Lk
                  </button>
                  <button
                    onClick={() => setGenderFilter('P')}
                    className={`px-2 py-0.5 rounded text-xs font-bold ${genderFilter === 'P' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500'}`}
                  >
                    Pr
                  </button>
                </div>
              </div>
            </div>

            <div className="card overflow-hidden border border-slate-200 p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-10">ID</th>
                      <th className="py-2.5 px-3">Kode</th>
                      <th className="py-2.5 px-3 text-right">Nama Arab</th>
                      <th className="py-2.5 px-3">Nama Indonesia</th>
                      <th className="py-2.5 px-3 text-center">Gender</th>
                      <th className="py-2.5 px-3">Kelompok</th>
                      <th className="py-2.5 px-3 text-center">Prioritas Ashabah</th>
                      <th className="py-2.5 px-3 text-center">Status Gugur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAhliWaris.map((w: AhliWaris) => (
                      <tr key={w.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-center font-bold text-slate-500">{w.id}</td>
                        <td className="py-2 px-3 font-mono text-slate-600 font-bold">{w.kode}</td>
                        <td className="py-2 px-3 text-right text-arabic font-bold text-emerald-800 text-sm">{w.nama_arab}</td>
                        <td className="py-2 px-3 font-extrabold text-slate-900">{w.nama_id}</td>
                        <td className="py-2 px-3 text-center">
                          {w.jenis_kelamin === 'L' ? (
                            <span className="badge-sky text-[10px] font-bold">Laki-laki</span>
                          ) : (
                            <span className="badge-rose text-[10px] font-bold">Perempuan</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-700">
                          {w.kelompok === 'ashabah_bin_nafsih' ? 'Ashabah Bin Nafsih' : 'Dzawil Furudh'}
                        </td>
                        <td className="py-2 px-3 text-center font-extrabold">
                          {w.urutan_ashabah || '-'}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {w.tidak_pernah_gugur ? (
                            <span className="badge-emerald text-[10px]">Wajib Dapat</span>
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
        {/* TAB 4: KAIDAH FURUDH MUQADDARAH (24 RULES)              */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'furudh' && (
          <div className="space-y-4 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Kaidah Furudh Muqaddarah (الفروض المقدرة)
                </h3>
                <p className="text-xs text-slate-500">
                  24 Kaidah pembagian pasti: 1/2, 1/4, 1/8, 2/3, 1/3, dan 1/6
                </p>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                {['ALL', '1/2', '1/4', '1/8', '2/3', '1/3', '1/6'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setFurudhFilter(p)}
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      furudhFilter === p ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    {p === 'ALL' ? 'Semua' : p}
                  </button>
                ))}
              </div>
            </div>

            <div className="card overflow-hidden border border-slate-200 p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-10">Rule</th>
                      <th className="py-2.5 px-3">Mustahiq</th>
                      <th className="py-2.5 px-3 text-center">Porsi</th>
                      <th className="py-2.5 px-3">Syarat Jumlah</th>
                      <th className="py-2.5 px-3">Keterangan Syar'i</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFurudh.map((f: FurudhRule) => {
                      const waris = ahliWarisMap.get(f.ahli_waris_id)
                      return (
                        <tr key={f.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-center font-bold text-slate-500">#{f.id}</td>
                          <td className="py-2 px-3 font-extrabold text-slate-900">
                            {waris?.nama_id} <span className="text-arabic text-emerald-800">({waris?.nama_arab})</span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="badge-emerald text-xs">{f.pecahan}</span>
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {f.syarat_jumlah_min && f.syarat_jumlah_max
                              ? `Tepat ${f.syarat_jumlah_min} org`
                              : f.syarat_jumlah_min
                              ? `Min ${f.syarat_jumlah_min} org`
                              : 'Bebas'}
                          </td>
                          <td className="py-2 px-3 text-slate-700">{f.keterangan}</td>
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
        {/* TAB 5: MATRIKS HIJAB (HIRMAN & NUQSHAN)                 */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'hijab' && (
          <div className="space-y-5 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-700" />
                  Kaidah Hijab Hirman (33 Relasi Gugur Total)
                </h3>
                <p className="text-xs text-slate-500">
                  Filter penghalang untuk melihat siapa saja yang digugurkan
                </p>
              </div>

              <select
                value={selectedPenghalang}
                onChange={(e) => setSelectedPenghalang(e.target.value)}
                className="px-3 py-1 rounded-lg border border-slate-200 text-xs bg-white font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">Semua Penghalang (33 Relasi)</option>
                <option value="anak_lk">Anak Laki-laki (13 terhalang)</option>
                <option value="ayah">Ayah (7 terhalang)</option>
                <option value="cucu_lk">Cucu Laki-laki (6 terhalang)</option>
                <option value="saudara_lk_kandung">Saudara Sekandung (6 terhalang)</option>
                <option value="ibu">Ibu (2 nenek terhalang)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredHijabHirman.map((h: HijabHirmanRule) => {
                const penghalang = ahliWarisMap.get(h.penghalang_id)
                const terhalang = ahliWarisMap.get(h.terhalang_id)
                return (
                  <div key={h.id} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-sm">
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold text-rose-600 block uppercase">Penghalang</span>
                      <span className="font-extrabold text-xs text-slate-900 truncate block">{penghalang?.nama_id}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-rose-500 shrink-0" />
                    <div className="flex-1 text-right min-w-0">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Terhalang</span>
                      <span className="font-bold text-xs text-slate-700 line-through decoration-rose-500 truncate block">{terhalang?.nama_id}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="card p-4 space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-amber-600" />
                Hijab Nuqshan (12 Kasus Penurunan Porsi)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Penyebab (Far'u Warits)</th>
                      <th className="py-2 px-3">Terdampak</th>
                      <th className="py-2 px-3 text-center">Porsi Awal ➔ Porsi Baru</th>
                      <th className="py-2 px-3">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(adminData?.hijabNuqshanRules || []).map((n: HijabNuqshanRule) => {
                      const p = ahliWarisMap.get(n.penyebab_id)
                      const t = ahliWarisMap.get(n.terdampak_id)
                      return (
                        <tr key={n.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-bold text-slate-800">{p?.nama_id}</td>
                          <td className="py-2 px-3 font-extrabold text-slate-900">{t?.nama_id}</td>
                          <td className="py-2 px-3 text-center font-bold text-amber-800">
                            {n.pecahan_awal} ➔ {n.pecahan_baru}
                          </td>
                          <td className="py-2 px-3 text-slate-600">{n.keterangan}</td>
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
        {/* TAB 6: KAIDAH ASHABAH & JIHAT                           */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'ashabah' && (
          <div className="space-y-4 animate-fadeIn">
            
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Kaidah Ashabah (العصبات — 19 Rules)
              </h3>
              <p className="text-xs text-slate-500">
                Pembagian sisa tirkah: Bin Nafsih, Bil Ghair (2:1), dan Ma'al Ghair
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="card p-4 border-t-4 border-t-indigo-600 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-900">1. Bin Nafsih (13 Tingkat)</h4>
                  <span className="badge-slate text-[10px]">Urutan Jihat</span>
                </div>
                <div className="space-y-1">
                  {(adminData?.ashabahRules || [])
                    .filter((r: AshabahRule) => r.jenis === 'bin_nafsih')
                    .map((r: AshabahRule) => {
                      const w = ahliWarisMap.get(r.ahli_waris_id)
                      return (
                        <div key={r.id} className="flex items-center justify-between text-xs p-1 rounded bg-slate-50">
                          <span className="font-semibold text-slate-800">{w?.nama_id}</span>
                          <span className="font-extrabold text-[10px] text-indigo-700">#{r.urutan_prioritas}</span>
                        </div>
                      )
                    })}
                </div>
              </div>

              <div className="card p-4 border-t-4 border-t-sky-600 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-900">2. Bil Ghair (Rasio 2:1)</h4>
                  <span className="badge-sky text-[10px]">Ditarik Saudara Lk</span>
                </div>
                <div className="space-y-2">
                  {(adminData?.ashabahRules || [])
                    .filter((r: AshabahRule) => r.jenis === 'bil_ghair')
                    .map((r: AshabahRule) => {
                      const w = ahliWarisMap.get(r.ahli_waris_id)
                      const p = ahliWarisMap.get(r.pasangan_penarik_id!)
                      return (
                        <div key={r.id} className="p-2 rounded bg-slate-50 text-xs">
                          <div className="font-bold text-slate-900">{w?.nama_id}</div>
                          <div className="text-[11px] text-slate-500">ditarik oleh: {p?.nama_id}</div>
                        </div>
                      )
                    })}
                </div>
              </div>

              <div className="card p-4 border-t-4 border-t-emerald-600 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-900">3. Ma'al Ghair</h4>
                  <span className="badge-emerald text-[10px]">Bersama Anak Pr</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Saudari kandung / seayah yang menjadi ashabah bersama anak atau cucu perempuan:
                </p>
                <div className="p-2.5 rounded-lg bg-emerald-50 text-xs text-emerald-900 italic font-mono">
                  "اجعلوا الأخوات مع البنات عصبة"
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 7: KASUS KHUSUS (OVERRIDE FATWA)                    */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'kasus_khusus' && (
          <div className="space-y-4 animate-fadeIn">
            
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Kasus Khusus Faraidh (المسائل الملقبة)
              </h3>
              <p className="text-xs text-slate-500">
                Override kaidah normal berdasarkan fatwa shahabat & ijma' ulama
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(adminData?.kasusKhusus || []).map((k: KasusKhusus) => (
                <div key={k.id} className="card p-4 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">{k.kode}</span>
                    <h4 className="font-extrabold text-sm text-slate-900">{k.nama}</h4>
                    <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg leading-relaxed">
                      {k.aturan_khusus}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="badge-emerald text-[10px]">Ijma' Syafi'i</span>
                    <button
                      onClick={() => handleCopy(k.aturan_khusus)}
                      className="text-slate-400 hover:text-slate-700 text-xs"
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
        {/* TAB 8: BANK SOAL & PRESET UJIAN KMI                     */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'bank_soal' && (
          <div className="space-y-4 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Bank Soal & Preset Ujian KMI Gontor
                </h3>
                <p className="text-xs text-slate-500">
                  Studi kasus resmi kurikulum KMI Kelas 3 untuk latihan & evaluasi
                </p>
              </div>
              <span className="badge-emerald text-xs font-bold">5 Soal Aktif</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ADMIN_SANDBOX_PRESETS.slice(0, 6).map((preset, idx) => (
                <div key={idx} className="card p-4 space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-xs text-slate-900">{preset.label}</h4>
                      <span className="text-arabic text-xs font-bold text-emerald-800">{preset.labelArab}</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                      <p><strong>Komposisi:</strong> {preset.desc}</p>
                      <p><strong>Tirkah:</strong> Rp {preset.harta.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => loadPresetAndOpenSandbox(preset)}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      Uji di Sandbox
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 9: AUDIT TRAIL & LOG SIMULASI                       */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'audit_trail' && (
          <div className="space-y-4 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  Audit Trail & Riwayat Hitungan Publik
                </h3>
                <p className="text-xs text-slate-500">
                  Daftar transaksi kalkulasi yang tersimpan di database Supabase
                </p>
              </div>
              <span className="badge-slate text-xs font-bold">
                {adminData?.recentKasus?.length || 0} Kasus
              </span>
            </div>

            {adminData?.recentKasus && adminData.recentKasus.length > 0 ? (
              <div className="card overflow-hidden border border-slate-200 p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Waktu</th>
                        <th className="py-2.5 px-3">Pewaris</th>
                        <th className="py-2.5 px-3 text-right">Tirkah Bersih</th>
                        <th className="py-2.5 px-3 text-center">Asal Masalah</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {adminData.recentKasus.map((k: any) => (
                        <tr key={k.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-slate-500">
                            {new Date(k.dibuat_pada).toLocaleDateString('id-ID')}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900">
                            {k.nama_pewaris || 'Hamba Allah'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                            Rp {Number(k.total_harta_bersih).toLocaleString('id-ID')}
                          </td>
                          <td className="py-2 px-3 text-center font-bold">
                            {k.asal_masalah_tashih || k.asal_masalah || '-'}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="badge-emerald text-[10px] uppercase">
                              {k.status_penyelesaian || 'Normal'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="card p-8 text-center bg-white border border-slate-200">
                <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h4 className="font-extrabold text-xs text-slate-700">Belum Ada Riwayat Tersimpan</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Hasil hitungan pengguna akan otomatis tersimpan di sini.
                </p>
              </div>
            )}

          </div>
        )}

      </main>

      {/* ─── ADMIN FOOTER ─────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-3 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-1.5">
          <div>
            <strong>Panel Faraidh KMI Gontor</strong> — Fiqh Rules Engine & Curriculum Management
          </div>
          <div>
            Ditinjau berdasarkan Kitab Faraidh Kelas 3 KMI
          </div>
        </div>
      </footer>

    </div>
  )
}
