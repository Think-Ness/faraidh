'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
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
  EyeOff,
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
  FileCheck,
  Trophy,
  Bot,
  ListOrdered,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  Save,
  ChevronDown,
  ChevronUp,
  Loader2,
  Star,
  FileQuestion,
  ClipboardList,
} from 'lucide-react'
import { getAdminData, testAdminCalculation } from './actions'
import {
  getAllBatches,
  getBatchSoalItems,
  createBatch,
  updateBatch,
  deleteBatch,
  createSoal,
  updateSoal,
  deleteSoal,
} from '../actions-latihan'
import type {
  AhliWaris,
  FurudhRule,
  HijabHirmanRule,
  HijabNuqshanRule,
  AshabahRule,
  KasusKhusus,
  InputKasus,
  HasilKalkulasi,
  SoalBatch,
  SoalItem,
  TipeSoal,
  OpsiJawaban,
  SyubbakKunci,
} from '@/lib/faraidh/types'
import { FaraidhEngine } from '@/lib/faraidh/engine'
import { SEED_RULES } from '@/data/seed-rules'
import { JadwalSyubbakSoal } from '@/components/latihan/JadwalSyubbakSoal'
import { KasusKhususMaklumatCard } from '@/components/calculator/KasusKhususMaklumatCard'

const ADMIN_PIN = '1234' // Bisa diganti sesuai env
const LS_PIN_KEY = 'faraidh_admin_unlocked'

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
  | 'batch_soal'
  | 'ai_generator'

// ─── Format Number with Max 2 Decimal Places ───────────────────────────
function formatCleanNumber(num: number | string, maxDecimals: number = 2): string {
  if (typeof num === 'string') {
    const parsed = parseFloat(num)
    if (isNaN(parsed)) return num
    num = parsed
  }
  if (Number.isInteger(num)) return num.toString()
  return Number(num.toFixed(maxDecimals)).toString()
}

// ─── Convert Digits to Arabic-Indic Numbers (١ ٢ ٣) ────────────────────
function toArabicDigits(num: number | string): string {
  const cleanStr = formatCleanNumber(num, 2)
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  return cleanStr.replace(/[0-9]/g, (w) => arabicDigits[+w]).replace(/\./g, '٫')
}

// ─── Format Authentic Classical Arabic Names (بنت, بنتان, بنات, etc.) ───
function formatTextbookArabicName(kode: string, count: number, defaultArab: string): string {
  if (count === 1) return defaultArab
  if (kode === 'anak_pr') {
    if (count === 2) return 'بنتان'
    return `${toArabicDigits(count)} بنات`
  }
  if (kode === 'anak_lk') {
    if (count === 2) return 'ابنان'
    return `${toArabicDigits(count)} أبناء`
  }
  if (kode === 'cucu_pr') {
    if (count === 2) return 'بنتا ابن'
    return `${toArabicDigits(count)} بنات ابن`
  }
  if (kode === 'cucu_lk') {
    if (count === 2) return 'ابنا ابن'
    return `${toArabicDigits(count)} أبناء ابن`
  }
  if (kode === 'istri') {
    if (count === 2) return 'زوجتان'
    return `${toArabicDigits(count)} زوجات`
  }
  if (kode === 'saudari_kandung') {
    if (count === 2) return 'أختان شقيقتان'
    return `${toArabicDigits(count)} أخوات شقائق`
  }
  if (kode === 'saudara_lk_kandung') {
    if (count === 2) return 'أخوان شقيقان'
    return `${toArabicDigits(count)} إخوة أشقاء`
  }
  if (kode === 'saudari_seayah') {
    if (count === 2) return 'أختان لأب'
    return `${toArabicDigits(count)} أخوات لأب`
  }
  if (kode === 'saudara_lk_seayah') {
    if (count === 2) return 'أخوان لأب'
    return `${toArabicDigits(count)} إخوة لأب`
  }
  if (kode === 'saudara_lk_seibu' || kode === 'saudari_seibu') {
    if (count === 2) return 'أخوان لأم'
    return `${toArabicDigits(count)} إخوة لأم`
  }
  return `${toArabicDigits(count)} ${defaultArab}`
}

// ─── Format Porsi into Arabic Fraction (٢/٣, ١/٦, etc.) ────────────────
function formatArabicFraction(pecahan?: string): string {
  if (!pecahan) return 'ع'
  if (pecahan === '1/3_sisa' || pecahan === '1/3 dari sisa' || pecahan.includes('1/3_sisa') || pecahan.includes('ثلث الباقي') || pecahan.includes('1/3 Sisa') || pecahan.includes('1/3 dari sisa') || pecahan.includes('1/3 dari Sisa')) {
    return '١/٣ الباقي'
  }
  if (pecahan === '1/6+sisa' || pecahan === '1/6+ع') {
    return '١/٦ + ع'
  }
  if (pecahan === '1/3_gabungan') {
    return '١/٣'
  }
  if (pecahan === '1/2') return '١/٢'
  if (pecahan === '1/4') return '١/٤'
  if (pecahan === '1/8') return '١/٨'
  if (pecahan === '2/3') return '٢/٣'
  if (pecahan === '1/3') return '١/٣'
  if (pecahan === '1/6') return '١/٦'
  if (pecahan === 'sisa' || pecahan === 'ashabah' || pecahan === 'sisa_2:1' || pecahan.toLowerCase().includes('sisa') || pecahan.toLowerCase().includes('ashabah') || pecahan === 'ع') {
    return 'ع'
  }
  return toArabicDigits(pecahan)
}

// ─── 4 Family Clusters with Compact Mobile Labels ───────────────────────
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
    title: 'Anak / Cucu',
    titleArab: 'الفروع',
    color: 'border-sky-200 bg-sky-50/40 text-sky-900',
    icon: Layers,
    codes: ['anak_lk', 'anak_pr', 'cucu_lk', 'cucu_pr'],
  },
  {
    id: 'usul',
    title: 'Orang Tua',
    titleArab: 'الأصول',
    color: 'border-purple-200 bg-purple-50/40 text-purple-900',
    icon: GraduationCap,
    codes: ['ayah', 'ibu', 'kakek', 'nenek_ibu', 'nenek_ayah'],
  },
  {
    id: 'hawasyi',
    title: 'Saudara & Paman',
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

// ─── Concise Mobile Heir Display Names ──────────────────────────────────
const CONCISE_NAMES: Record<string, string> = {
  suami: 'Suami',
  istri: 'Istri',
  anak_lk: 'Anak Laki-laki',
  anak_pr: 'Anak Perempuan',
  cucu_lk: 'Cucu Lk (Anak Lk)',
  cucu_pr: 'Cucu Pr (Anak Lk)',
  ayah: 'Ayah',
  ibu: 'Ibu',
  kakek: 'Kakek (Jalur Ayah)',
  nenek_ibu: 'Nenek (Jalur Ibu)',
  nenek_ayah: 'Nenek (Jalur Ayah)',
  saudara_lk_kandung: 'Saudara Sekandung',
  saudari_kandung: 'Saudari Sekandung',
  saudara_lk_seayah: 'Saudara Seayah',
  saudari_seayah: 'Saudari Seayah',
  saudara_lk_seibu: 'Saudara Seibu',
  saudari_seibu: 'Saudari Seibu',
  keponakan_lk_kandung: 'Keponakan Sekandung',
  keponakan_lk_seayah: 'Keponakan Seayah',
  paman_kandung: 'Paman Sekandung',
  paman_seayah: 'Paman Seayah',
  sepupu_lk_paman_kandung: 'Sepupu Sekandung',
  sepupu_lk_paman_seayah: 'Sepupu Seayah',
  mutiq: 'Pembebas Budak (Lk)',
  mutiqah: 'Pembebas Budak (Pr)',
}

// ─── 25 Heirs Full Info (ID, ARAB, CONCISE) ─────────────────────────────
const HEIR_INFO: Record<string, { id: string; arab: string; concise: string }> = {
  suami: { id: 'Suami', arab: 'الزوج', concise: 'Suami' },
  istri: { id: 'Istri', arab: 'الزوجة', concise: 'Istri' },
  anak_lk: { id: 'Anak Laki-laki', arab: 'الابن', concise: 'Anak Lk' },
  anak_pr: { id: 'Anak Perempuan', arab: 'البنت', concise: 'Anak Pr' },
  cucu_lk: { id: 'Cucu Laki-laki (dari anak laki)', arab: 'ابن الابن', concise: 'Cucu Lk' },
  cucu_pr: { id: 'Cucu Perempuan (dari anak laki)', arab: 'بنت الابن', concise: 'Cucu Pr' },
  ayah: { id: 'Ayah', arab: 'الأب', concise: 'Ayah' },
  ibu: { id: 'Ibu', arab: 'الأم', concise: 'Ibu' },
  kakek: { id: 'Kakek (Jalur Ayah)', arab: 'الجد', concise: 'Kakek' },
  nenek_ibu: { id: 'Nenek (Jalur Ibu)', arab: 'أم الأم', concise: 'Nenek Ibu' },
  nenek_ayah: { id: 'Nenek (Jalur Ayah)', arab: 'أم الأب', concise: 'Nenek Ayah' },
  saudara_lk_kandung: { id: 'Saudara Sekandung', arab: 'الأخ الشقيق', concise: 'Sdr Kandung' },
  saudari_kandung: { id: 'Saudari Sekandung', arab: 'الأخت الشقيقة', concise: 'Sdri Kandung' },
  saudara_lk_seayah: { id: 'Saudara Seayah', arab: 'الأخ لأب', concise: 'Sdr Seayah' },
  saudari_seayah: { id: 'Saudari Seayah', arab: 'الأخت لأب', concise: 'Sdri Seayah' },
  saudara_lk_seibu: { id: 'Saudara Seibu', arab: 'الأخ لأم', concise: 'Sdr Seibu' },
  saudari_seibu: { id: 'Saudari Seibu', arab: 'الأخت لأم', concise: 'Sdri Seibu' },
  keponakan_lk_kandung: { id: 'Keponakan Kandung', arab: 'ابن الأخ الشقيق', concise: 'Keponakan Kandung' },
  keponakan_lk_seayah: { id: 'Keponakan Seayah', arab: 'ابن الأخ لأب', concise: 'Keponakan Seayah' },
  paman_kandung: { id: 'Paman Kandung', arab: 'العم الشقيق', concise: 'Paman Kandung' },
  paman_seayah: { id: 'Paman Seayah', arab: 'العم لأب', concise: 'Paman Seayah' },
  sepupu_lk_paman_kandung: { id: 'Sepupu Kandung', arab: 'ابن العم الشقيق', concise: 'Sepupu Kandung' },
  sepupu_lk_paman_seayah: { id: 'Sepupu Seayah', arab: 'ابن العم لأب', concise: 'Sepupu Seayah' },
  mutiq: { id: 'Pembebas Budak (Lk)', arab: 'المعتق', concise: 'Mu\'tiq' },
  mutiqah: { id: 'Pembebas Budak (Pr)', arab: 'المعتقة', concise: 'Mu\'tiqah' },
}

const generateRedaksiSoal = (
  warisList: { kode: string; count: number }[],
  tirkahHarta: number,
  lang: 'id' | 'ar' | 'en'
) => {
  if (warisList.length === 0) return { pertanyaan: '', petunjuk: '' }

  if (lang === 'ar') {
    const listArab = warisList.map(w => {
      const info = HEIR_INFO[w.kode] || { id: w.kode, arab: w.kode, concise: w.kode }
      if (w.count === 1) return info.arab
      if (w.count === 2) {
        if (w.kode === 'anak_pr') return 'بنتان'
        if (w.kode === 'anak_lk') return 'ابنان'
        if (w.kode === 'saudari_kandung') return 'أختان شقيقتان'
        if (w.kode === 'istri') return 'زوجتان'
        return `${info.arab} (٢)`
      }
      return `${w.count} ${info.arab}`
    }).join('، ')

    const hartaText = tirkahHarta > 0
      ? ` وَالتَّرِكَةُ الصَّافِيَةُ تَبْلُغُ ${tirkahHarta.toLocaleString('ar-SA')} رُوبِيَة.`
      : ''

    return {
      pertanyaan: `تُوُفِّيَ شَخْصٌ وَتَرَكَ مِنَ الْوَرَثَةِ: ${listArab}.${hartaText} اسْتَخْرِجْ فُرُوضَهُمْ وَأَصْلَ الْمَسْأَلَةِ وَسِهَامَ كُلِّ وَارِثٍ ${tirkahHarta > 0 ? 'وَحِصَّتَهُ مِنَ التَّرِكَةِ ' : ''}فِي جَدْوَلِ الشُّبَّاكِ!`,
      petunjuk: 'حَدِّدْ فُرُوضَ الْوَرَثَةِ، ثُمَّ اسْتَخْرِجْ أَصْلَ الْمَسْأَلَةِ، وَاحْسِبْ سِهَامَ كُلِّ وَارِثٍ.',
    }
  }

  if (lang === 'en') {
    const enNames: Record<string, string> = {
      suami: 'Husband', istri: 'Wife', anak_lk: 'Son', anak_pr: 'Daughter',
      cucu_lk: "Son's Son", cucu_pr: "Son's Daughter", ayah: 'Father', ibu: 'Mother',
      kakek: 'Paternal Grandfather', nenek_ibu: 'Maternal Grandmother', nenek_ayah: 'Paternal Grandmother',
      saudara_lk_kandung: 'Full Brother', saudari_kandung: 'Full Sister',
      saudara_lk_seayah: 'Consanguine Brother', saudari_seayah: 'Consanguine Sister',
      saudara_lk_seibu: 'Uterine Brother', saudari_seibu: 'Uterine Sister',
      keponakan_lk_kandung: "Full Brother's Son", keponakan_lk_seayah: "Consanguine Brother's Son",
      paman_kandung: 'Full Paternal Uncle', paman_seayah: 'Consanguine Paternal Uncle',
      sepupu_lk_paman_kandung: "Full Uncle's Son", sepupu_lk_paman_seayah: "Consanguine Uncle's Son",
      mutiq: 'Emancipator (M)', mutiqah: 'Emancipator (F)',
    }
    const listEn = warisList.map(w => {
      const en = enNames[w.kode] || w.kode
      return w.count > 1 ? `${w.count} ${en}s` : `1 ${en}`
    }).join(', ')

    const hartaText = tirkahHarta > 0
      ? ` Total net estate (Tirkah) is IDR ${tirkahHarta.toLocaleString('id-ID')}.`
      : ''

    return {
      pertanyaan: `A person passed away leaving the following surviving heirs: ${listEn}.${hartaText} Determine their Quranic shares (Furudh), base number (Asl al-Mas'alah), and allocated shares ${tirkahHarta > 0 ? 'and monetary portions ' : ''}in the Jadwal Syubbak table!`,
      petunjuk: 'Determine the Quranic portions, find the base number, and calculate the shares for each heir.',
    }
  }

  // Default: Bahasa Indonesia
  const listId = warisList.map(w => {
    const info = HEIR_INFO[w.kode] || { id: w.kode, arab: w.kode, concise: w.kode }
    return w.count > 1 ? `${w.count} ${info.id}` : info.id
  }).join(', ')

  const hartaText = tirkahHarta > 0
    ? ` Harta peninggalan (tirkah bersih) sebesar Rp ${tirkahHarta.toLocaleString('id-ID')}.`
    : ''

  return {
    pertanyaan: `Seseorang meninggal dunia dan meninggalkan ahli waris: ${listId}.${hartaText} Tentukan porsi syar'i (furudh), asal masalah, dan saham ${tirkahHarta > 0 ? 'serta pembagian nominal harta ' : ''}masing-masing dalam Jadwal Syubbak!`,
    petunjuk: 'Tentukan porsi furudh masing-masing, tentukan asal masalah pokok (dan \'Aul/Tashih jika ada), lalu hitung saham tiap ahli waris.',
  }
}

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
  // ─── PIN Lock State ────────────────────────────────────────────────────
  const [pinUnlocked, setPinUnlocked] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [showPin, setShowPin] = useState(false)

  useEffect(() => {
    const unlocked = sessionStorage.getItem(LS_PIN_KEY)
    if (unlocked === 'true') setPinUnlocked(true)
  }, [])

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pinInput === ADMIN_PIN) {
      setPinUnlocked(true)
      sessionStorage.setItem(LS_PIN_KEY, 'true')
    } else {
      setPinError('PIN salah. Coba lagi.')
      setPinInput('')
    }
  }

  // ─── Batch Soal State ──────────────────────────────────────────────────
  const [batches, setBatches] = useState<SoalBatch[]>([])
  const [batchesLoading, setBatchesLoading] = useState(false)
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [batchSoalList, setBatchSoalList] = useState<SoalItem[]>([])
  const [showBatchForm, setShowBatchForm] = useState(false)
  const [editingBatch, setEditingBatch] = useState<SoalBatch | null>(null)
  const [batchForm, setBatchForm] = useState({ judul: '', deskripsi: '', kelas_target: '', is_active: true })
  const [showSoalForm, setShowSoalForm] = useState(false)
  const [editingSoalId, setEditingSoalId] = useState<string | null>(null)
  const [soalFormTipe, setSoalFormTipe] = useState<TipeSoal>('pilihan_ganda')
  const [soalForm, setSoalForm] = useState({
    pertanyaan: '',
    pertanyaan_arab: '',
    jawaban_benar: '',
    skor_maksimal: 10,
    petunjuk: '',
  })
  const [opsiList, setOpsiList] = useState<OpsiJawaban[]>([
    { label: 'A', teks: '', benar: false },
    { label: 'B', teks: '', benar: false },
    { label: 'C', teks: '', benar: false },
    { label: 'D', teks: '', benar: false },
  ])
  const [savingSoal, setSavingSoal] = useState(false)
  const [soalSelectedWaris, setSoalSelectedWaris] = useState<{ kode: string; count: number }[]>([])
  const [soalTirkahHarta, setSoalTirkahHarta] = useState<number>(0)
  const [soalRedaksiLang, setSoalRedaksiLang] = useState<'id' | 'ar' | 'en'>('id')
  const [soalClusterTab, setSoalClusterTab] = useState<string>('pasangan')

  const getSyubbakFromSelectedWaris = (
    warisList: { kode: string; count: number }[],
    tirkahHarta: number = 0
  ): SyubbakKunci | null => {
    if (warisList.length === 0) return null
    try {
      const engine = new FaraidhEngine(SEED_RULES)
      const res = engine.hitung({
        nama_pewaris: 'Soal Ujian',
        harta_kotor: tirkahHarta > 0 ? tirkahHarta : 120000000,
        biaya_tajhiz: 0,
        hutang_terikat: 0,
        hutang_biasa: 0,
        wasiat: 0,
        ahli_waris_list: warisList.map(w => ({
          kode: w.kode,
          jumlah_orang: w.count,
          halangan: 'tidak_ada',
        })),
      })

      return {
        total_harta: tirkahHarta > 0 ? tirkahHarta : undefined,
        asal_masalah_pokok: res.asal_masalah_pokok,
        asal_masalah_akhir: res.asal_masalah_tashih !== res.asal_masalah_pokok ? res.asal_masalah_tashih : res.asal_masalah_aul,
        status_penyelesaian: res.status_penyelesaian,
        simbol_status: res.status_penyelesaian === 'aul' ? 'ع' : res.status_penyelesaian === 'radd' ? 'رد' : undefined,
        baris: res.hasil.map(h => {
          const isHijab = h.status === 'gugur_hijab' || h.status === 'gugur_halangan'
          return {
            kode: h.kode,
            nama_id: h.nama_id,
            nama_arab: h.nama_arab,
            jumlah_orang: h.jumlah_orang,
            porsi_benar: isHijab ? 'mahjub' : (h.pecahan || 'ع'),
            porsi_arab: isHijab ? 'م' : (h.pecahan_arab || 'ع'),
            saham_benar: isHijab ? 0 : (h.saham_tashih ?? h.saham_asal ?? 0),
            nominal_benar: (tirkahHarta > 0 && !isHijab) ? (h.nominal_total_kelompok ?? 0) : undefined,
            is_hijab: isHijab,
          }
        }),
      }
    } catch {
      return null
    }
  }

  // ─── AI Generator State ────────────────────────────────────────────────
  const [aiTopik, setAiTopik] = useState('furudh')
  const [aiTipe, setAiTipe] = useState<TipeSoal>('pilihan_ganda')
  const [aiKesulitan, setAiKesulitan] = useState('sedang')
  const [aiJumlah, setAiJumlah] = useState(3)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<SoalItem[]>([])
  const [aiError, setAiError] = useState('')
  const [aiTargetBatch, setAiTargetBatch] = useState<string>('')
  const [aiSaving, setAiSaving] = useState(false)
  const [aiSavedCount, setAiSavedCount] = useState(0)

  const loadBatches = useCallback(async () => {
    setBatchesLoading(true)
    const data = await getAllBatches()
    setBatches(data)
    setBatchesLoading(false)
  }, [])

  const loadBatchSoal = useCallback(async (batchId: string) => {
    const soal = await getBatchSoalItems(batchId)
    setBatchSoalList(soal)
  }, [])

  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [loading, setLoading] = useState(true)
  const [adminData, setAdminData] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'L' | 'P'>('ALL')
  const [furudhFilter, setFurudhFilter] = useState<string>('ALL')
  const [selectedPenghalang, setSelectedPenghalang] = useState<string>('ALL')
  const [hijabGenderGroup, setHijabGenderGroup] = useState<'ALL' | 'WANITA' | 'PRIA'>('ALL')
  const [copiedText, setCopiedText] = useState<string | null>(null)

  // ─── Sandbox State (DEFAULT KOSONG) ───────────────────────────────────
  const [testNama, setTestNama] = useState('Uji Kasus Faraidh')
  const [testHarta, setTestHarta] = useState(360000000)
  const [testSelectedWaris, setTestSelectedWaris] = useState<{ kode: string; count: number }[]>([])
  const [testResult, setTestResult] = useState<HasilKalkulasi | null>(null)
  const [testLoading, setTestLoading] = useState(false)
  const [useArabicNumerals, setUseArabicNumerals] = useState(true)
  
  // Mobile cluster active tab
  const [selectedClusterTab, setSelectedClusterTab] = useState<string>('pasangan')

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

  useEffect(() => {
    if (activeTab === 'batch_soal' || activeTab === 'ai_generator') {
      loadBatches()
    }
  }, [activeTab, loadBatches])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(null), 2000)
  }

  // Update waris count with smart mutual exclusion (Suami / Istri)
  const updateWarisCount = (kode: string, delta: number) => {
    setTestSelectedWaris(prev => {
      const existing = prev.find(p => p.kode === kode)
      const currentCount = existing ? existing.count : 0
      const nextCount = Math.max(0, currentCount + delta)

      let updated = prev.filter(p => p.kode !== kode)
      if (nextCount > 0) {
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

  const filteredHijabHirman = useMemo(() => {
    return (adminData?.hijabHirmanRules || []).filter((h: HijabHirmanRule) => {
      const penghalang = ahliWarisMap.get(h.penghalang_id)
      const terhalang = ahliWarisMap.get(h.terhalang_id)
      const matchesGender =
        hijabGenderGroup === 'ALL' ||
        (hijabGenderGroup === 'WANITA' && penghalang?.jenis_kelamin === 'P') ||
        (hijabGenderGroup === 'PRIA' && penghalang?.jenis_kelamin === 'L')
      const matchesPenghalang =
        selectedPenghalang === 'ALL' || penghalang?.kode === selectedPenghalang
      const matchesSearch =
        !searchQuery ||
        (penghalang?.nama_id.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (terhalang?.nama_id.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      return matchesGender && matchesPenghalang && matchesSearch
    })
  }, [adminData?.hijabHirmanRules, ahliWarisMap, hijabGenderGroup, selectedPenghalang, searchQuery])

  // Grouped Hijab Hirman by Gender and Person (Penghalang)
  const groupedHijabHirman = useMemo(() => {
    const mapWanita = new Map<number, { penghalang: AhliWaris; rules: HijabHirmanRule[] }>()
    const mapPria = new Map<number, { penghalang: AhliWaris; rules: HijabHirmanRule[] }>()

    filteredHijabHirman.forEach((h: HijabHirmanRule) => {
      const p = ahliWarisMap.get(h.penghalang_id)
      if (!p) return
      const targetMap = p.jenis_kelamin === 'P' ? mapWanita : mapPria
      const existing = targetMap.get(p.id) || { penghalang: p, rules: [] }
      existing.rules.push(h)
      targetMap.set(p.id, existing)
    })

    return {
      wanita: Array.from(mapWanita.values()),
      pria: Array.from(mapPria.values()),
    }
  }, [filteredHijabHirman, ahliWarisMap])

  // Group result items for Sandbox Output
  const berhakList = testResult?.hasil.filter(h => !['gugur_halangan', 'gugur_hijab'].includes(h.status)) || []
  const gugurList = testResult?.hasil.filter(h => ['gugur_halangan', 'gugur_hijab'].includes(h.status)) || []
  const allListInResult = testResult?.hasil || []
  const totalJiwaPilihan = testSelectedWaris.reduce((sum, w) => sum + w.count, 0)

  // Mahfudzat map for classical preview
  const mahfudzMap = useMemo(() => {
    const map = new Map<string, number>()
    if (testResult?.mahfudzat_detail) {
      testResult.mahfudzat_detail.forEach(md => map.set(md.kode, md.mahfudz))
    }
    return map
  }, [testResult])

  // ─── PIN Lock Screen ───────────────────────────────────────────────────
  if (!pinUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mb-1">Panel Asatidz</h1>
          <p className="text-sm text-slate-500 mb-6">Masukkan PIN untuk mengakses panel admin</p>
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pinInput}
                onChange={e => { setPinInput(e.target.value); setPinError('') }}
                placeholder="PIN Admin"
                maxLength={8}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-center text-2xl font-extrabold tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {pinError && <p className="text-xs text-red-600 font-medium">{pinError}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition"
            >
              Masuk
            </button>
          </form>
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 mt-4 inline-block transition">
            ← Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    )
  }

  // ─── Batch Soal Handlers ───────────────────────────────────────────────
  const handleSaveBatch = async () => {
    if (!batchForm.judul.trim()) return
    if (editingBatch) {
      await updateBatch(editingBatch.id, batchForm)
    } else {
      await createBatch(batchForm)
    }
    await loadBatches()
    setShowBatchForm(false)
    setEditingBatch(null)
    setBatchForm({ judul: '', deskripsi: '', kelas_target: '', is_active: true })
  }

  const handleDeleteBatch = async (id: string) => {
    if (!window.confirm('Hapus batch soal ini? Semua soal di dalamnya juga akan terhapus.')) return
    await deleteBatch(id)
    await loadBatches()
    if (selectedBatchId === id) setSelectedBatchId(null)
  }

  const handleToggleBatchActive = async (batch: SoalBatch) => {
    await updateBatch(batch.id, { is_active: !batch.is_active })
    await loadBatches()
  }

  const handleSelectBatch = async (batchId: string) => {
    setSelectedBatchId(batchId)
    await loadBatchSoal(batchId)
    setShowSoalForm(false)
  }

  const handleEditSoalClick = (soal: SoalItem) => {
    setEditingSoalId(soal.id)
    setSoalFormTipe(soal.tipe)
    setSoalForm({
      pertanyaan: soal.pertanyaan,
      pertanyaan_arab: soal.pertanyaan_arab || '',
      jawaban_benar: soal.jawaban_benar || '',
      skor_maksimal: soal.skor_maksimal,
      petunjuk: soal.petunjuk || '',
    })

    if (soal.tipe === 'pilihan_ganda') {
      if (soal.opsi_jawaban && soal.opsi_jawaban.length > 0) {
        setOpsiList(soal.opsi_jawaban)
      } else {
        setOpsiList([
          { label: 'A', teks: '', benar: false },
          { label: 'B', teks: '', benar: false },
          { label: 'C', teks: '', benar: false },
          { label: 'D', teks: '', benar: false },
        ])
      }
    } else if (soal.tipe === 'isi_tabel') {
      if (soal.data_isi_tabel?.syubbak?.baris) {
        const waris = soal.data_isi_tabel.syubbak.baris.map(b => ({
          kode: b.kode,
          count: b.jumlah_orang || 1,
        }))
        setSoalSelectedWaris(waris)
        setSoalTirkahHarta(soal.data_isi_tabel.syubbak.total_harta || 0)
      } else {
        setSoalSelectedWaris([])
        setSoalTirkahHarta(0)
      }
    }

    setShowSoalForm(true)
  }

  const handleSaveSoal = async () => {
    if (!selectedBatchId || !soalForm.pertanyaan.trim()) return
    setSavingSoal(true)
    const urutan = editingSoalId
      ? (batchSoalList.find(s => s.id === editingSoalId)?.urutan || 1)
      : batchSoalList.length + 1

    let data_isi_tabel = undefined
    if (soalFormTipe === 'isi_tabel') {
      const syubbak = getSyubbakFromSelectedWaris(soalSelectedWaris, soalTirkahHarta)
      if (syubbak) {
        data_isi_tabel = { syubbak }
      }
    }

    const payload: Omit<SoalItem, 'id' | 'created_at'> = {
      batch_id: selectedBatchId,
      urutan,
      tipe: soalFormTipe,
      pertanyaan: soalForm.pertanyaan,
      pertanyaan_arab: soalForm.pertanyaan_arab || undefined,
      jawaban_benar: soalForm.jawaban_benar || undefined,
      skor_maksimal: soalForm.skor_maksimal,
      petunjuk: soalForm.petunjuk || undefined,
      opsi_jawaban: soalFormTipe === 'pilihan_ganda' ? opsiList : undefined,
      data_isi_tabel,
    }

    if (editingSoalId) {
      await updateSoal(editingSoalId, payload)
    } else {
      await createSoal(payload)
    }

    await loadBatchSoal(selectedBatchId)
    await loadBatches()
    setShowSoalForm(false)
    setEditingSoalId(null)
    setSoalForm({ pertanyaan: '', pertanyaan_arab: '', jawaban_benar: '', skor_maksimal: 10, petunjuk: '' })
    setSoalSelectedWaris([])
    setSoalTirkahHarta(0)
    setOpsiList([
      { label: 'A', teks: '', benar: false },
      { label: 'B', teks: '', benar: false },
      { label: 'C', teks: '', benar: false },
      { label: 'D', teks: '', benar: false },
    ])
    setSavingSoal(false)
  }

  const handleDeleteSoal = async (soalId: string) => {
    if (!selectedBatchId) return
    if (!window.confirm('Hapus soal ini?')) return
    await deleteSoal(soalId)
    await loadBatchSoal(selectedBatchId)
    await loadBatches()
  }

  const handleGenerateAI = async () => {
    setAiLoading(true)
    setAiError('')
    setAiResult([])
    try {
      const res = await fetch('/api/generate-soal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topik: aiTopik, tipe: aiTipe, kesulitan: aiKesulitan, jumlah: aiJumlah }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generate gagal')
      setAiResult(data.soalList || [])
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Terjadi kesalahan')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSaveAiTooBatch = async () => {
    if (!aiTargetBatch || aiResult.length === 0) return
    setAiSaving(true)
    const existing = await getBatchSoalItems(aiTargetBatch)
    let urutan = existing.length + 1
    let saved = 0
    for (const soal of aiResult) {
      await createSoal({
        ...soal,
        batch_id: aiTargetBatch,
        urutan: urutan++,
      })
      saved++
    }
    await loadBatches()
    if (selectedBatchId === aiTargetBatch) {
      await loadBatchSoal(aiTargetBatch)
    }
    setAiSavedCount(saved)
    setAiSaving(false)
    setAiResult([])
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 pb-20 lg:pb-8">
      
      {/* ─── ADMIN TOPBAR ─────────────────────────────────────── */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand & Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
              <Sliders className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
                  PANEL ASATIDZ & DEWAN FARAIDH
                </span>
                <span className="badge-slate text-[10px] font-bold py-0.5">ADMIN POV</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
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
              className="p-1.5 sm:p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
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
      <div className="bg-white border-b border-slate-200 sticky top-[53px] sm:top-[57px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto py-1.5 sm:py-2 scrollbar-none">
          
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

          <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />

          <button
            onClick={() => setActiveTab('batch_soal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'batch_soal'
                ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-500/30'
                : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Batch Soal
          </button>

          <button
            onClick={() => setActiveTab('ai_generator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'ai_generator'
                ? 'bg-purple-700 text-white shadow-sm ring-2 ring-purple-600/30'
                : 'text-purple-800 bg-purple-50 hover:bg-purple-100'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            AI Generator
          </button>

        </div>
      </div>


      {/* ─── MAIN CONTENT ─────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-5 flex-1 w-full space-y-5">

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 1: OVERVIEW & DASHBOARD METRICS                     */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-5 animate-fadeIn">
            
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
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
            <div className="card p-4 sm:p-5 space-y-4">
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

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
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
        {/* TAB 2: SANDBOX ENGINE (MOBILE-COMPACT & INTEGRATED)     */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'test_engine' && (
          <div className="space-y-4 sm:space-y-5 animate-fadeIn">
            
            {/* Top Engine Control Bar */}
            <div className="card p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <Play className="w-4 h-4 fill-emerald-700 text-emerald-700" />
                  <span>Sandbox Engine Faraidh (مختبر علم الفرائض)</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
              
              {/* ─── LEFT: COMPACT HEIR SELECTOR (5 COLS) ──────────── */}
              <div className="lg:col-span-5 space-y-3.5">
                
                {/* Nominal Tirkah Input */}
                <div className="card p-3.5 space-y-2">
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
                <div className="card p-3 space-y-2">
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
                            <span className="font-extrabold text-slate-900">{CONCISE_NAMES[sw.kode] || waris?.nama_id}</span>
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
                <div className="card p-3 sm:p-3.5 space-y-2.5">
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
                      const displayName = CONCISE_NAMES[w.kode] || w.nama_id

                      return (
                        <div
                          key={w.kode}
                          className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                            count > 0
                              ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500/20'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex-1 min-w-0 pr-1">
                            <div className="text-xs font-bold text-slate-900 leading-tight">
                              {displayName}
                            </div>
                            <div className="text-arabic text-xs font-bold text-emerald-800 mt-0.5">
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
                    <div className="card p-4 sm:p-5 space-y-3.5">
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Status Penyelesaian Faraidh
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
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-bold block">Asal Masalah Pokok</span>
                          <span className="text-arabic text-xs text-slate-400 font-bold block">أصل المسألة</span>
                          <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                            {testResult.asal_masalah_pokok}
                          </span>
                        </div>

                        <div className={`p-2 rounded-xl border ${
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

                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-bold block">Juz'us Sahm</span>
                          <span className="text-arabic text-xs text-slate-400 font-bold block">جزء السهم</span>
                          <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                            {testResult.juz_sahm}
                          </span>
                        </div>

                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
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

                      {/* Special Case Educational Context */}
                      {testResult.kasus_khusus_aktif && (
                        <KasusKhususMaklumatCard
                          kasusKode={testResult.kasus_khusus_aktif}
                          kasusMaklumat={testResult.kasus_khusus_maklumat}
                          defaultExpanded={true}
                        />
                      )}

                    </div>

                    {/* ─── CLASSICAL TEXTBOOK TABLE PREVIEW (جدول الشباك) ─── */}
                    <div className="card p-4 sm:p-5 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white space-y-3.5 shadow-md">
                      <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-emerald-300" />
                          <h4 className="font-extrabold text-xs sm:text-sm tracking-wide">
                            Preview Format Buku / Kitab Faraidh KMI (جدول الشباك)
                          </h4>
                        </div>
                        <button
                          onClick={() => setUseArabicNumerals(!useArabicNumerals)}
                          className="px-2 py-0.5 rounded bg-emerald-800/60 hover:bg-emerald-700 text-emerald-200 text-[10px] font-semibold border border-emerald-700 transition-colors"
                        >
                          {useArabicNumerals ? 'Angka: ١ ٢ ٣ (Arab)' : 'Angka: 1 2 3 (Latin)'}
                        </button>
                      </div>

                      {/* Classical Grid Container (RTL) */}
                      <div className="overflow-x-auto pb-1" dir="rtl">
                        <div className="inline-block min-w-full bg-white text-slate-900 rounded-lg border-2 border-emerald-900 overflow-hidden font-arabic shadow-sm">
                          
                          {/* Table Header Row (With Tashih / 'Aul Banner) */}
                          <div className="grid grid-cols-12 bg-emerald-50 border-b-2 border-emerald-900 text-center font-bold text-sm">
                            
                            {/* Mahfudzat Header Column (If applicable) */}
                            {testResult.juz_sahm > 1 && testResult.mahfudzat_detail && testResult.mahfudzat_detail.length > 0 && (
                              <div className="col-span-2 border-l-2 border-emerald-900 p-2 text-xs text-emerald-900">
                                المحفوظات
                              </div>
                            )}

                            {/* Heirs & Share Headers */}
                            <div className={`${testResult.juz_sahm > 1 ? 'col-span-5' : 'col-span-6'} border-l-2 border-emerald-900 p-2 text-emerald-900`}>
                              {testResult.juz_sahm > 1 ? (
                                <div className="text-xs sm:text-sm">
                                  جزء السهم: {useArabicNumerals ? toArabicDigits(testResult.juz_sahm) : testResult.juz_sahm} ×
                                </div>
                              ) : (
                                <div className="text-xs sm:text-sm">الورثة والسهام</div>
                              )}
                            </div>

                            {/* Asal Masalah Header Box */}
                            <div className={`${testResult.juz_sahm > 1 ? 'col-span-2' : 'col-span-3'} border-l-2 border-emerald-900 p-2 text-emerald-900 font-extrabold text-sm sm:text-base`}>
                              {useArabicNumerals ? toArabicDigits(testResult.asal_masalah_pokok) : testResult.asal_masalah_pokok}
                            </div>

                            {/* Final Column: 'Aul / Tashih Header Box */}
                            <div className={`${testResult.juz_sahm > 1 ? 'col-span-3' : 'col-span-3'} p-2 text-emerald-900 font-extrabold text-sm sm:text-base bg-emerald-100/50`}>
                              {testResult.asal_masalah_aul ? (
                                <div className="flex items-center justify-center gap-1">
                                  <span>{useArabicNumerals ? toArabicDigits(testResult.asal_masalah_aul) : testResult.asal_masalah_aul}</span>
                                  <span className="text-[11px] text-emerald-700">عا</span>
                                </div>
                              ) : testResult.asal_masalah_tashih ? (
                                <span>{useArabicNumerals ? toArabicDigits(testResult.asal_masalah_tashih) : testResult.asal_masalah_tashih}</span>
                              ) : (
                                <span>{useArabicNumerals ? toArabicDigits(testResult.asal_masalah) : testResult.asal_masalah}</span>
                              )}
                            </div>

                          </div>

                          {/* Rows: Each Heir in Classical Format */}
                          <div className="divide-y-2 divide-emerald-900 text-center font-bold text-sm">
                            {allListInResult.map((h) => {
                              const isMahjub = ['gugur_halangan', 'gugur_hijab'].includes(h.status)
                              const arabName = formatTextbookArabicName(h.kode, h.jumlah_orang, h.nama_arab)
                              const porsiArab = isMahjub ? 'م (محجوب)' : formatArabicFraction(h.pecahan)
                              const mahfudzVal = mahfudzMap.get(h.kode)
                              const sahamAsalRaw = isMahjub ? 0 : (h.saham_asal !== undefined ? h.saham_asal : (h.saham_total_kelompok || 0))
                              const sahamAsalFormatted = formatCleanNumber(sahamAsalRaw, 2)
                              const sahamTashihFormatted = formatCleanNumber(isMahjub ? 0 : (h.saham_total_kelompok || 0), 2)
                              const sahamAsalDisplay = isMahjub 
                                ? '—' 
                                : (useArabicNumerals ? toArabicDigits(sahamAsalFormatted) : sahamAsalFormatted)
                              const sahamTashihDisplay = isMahjub 
                                ? '—' 
                                : (useArabicNumerals ? toArabicDigits(sahamTashihFormatted) : sahamTashihFormatted)
                              const mahfudzDisplay = (!isMahjub && mahfudzVal) ? (useArabicNumerals ? toArabicDigits(mahfudzVal) : mahfudzVal) : '—'

                              return (
                                <div key={h.kode} className={`grid grid-cols-12 items-center transition-colors ${isMahjub ? 'bg-rose-50/50 text-slate-500' : 'hover:bg-slate-50 text-slate-900'}`}>
                                  
                                  {/* Optional Mahfudz Value */}
                                  {testResult.juz_sahm > 1 && testResult.mahfudzat_detail && testResult.mahfudzat_detail.length > 0 && (
                                    <div className="col-span-2 border-l-2 border-emerald-900 p-2 font-mono text-emerald-800">
                                      {mahfudzDisplay}
                                    </div>
                                  )}

                                  {/* Right Column: Name + Porsi */}
                                  <div className={`${testResult.juz_sahm > 1 ? 'col-span-5' : 'col-span-6'} border-l-2 border-emerald-900 p-2 flex items-center justify-between px-3`}>
                                    <span className={`text-right font-extrabold text-sm sm:text-base ${isMahjub ? 'line-through decoration-rose-400 text-slate-600' : 'text-slate-900'}`}>
                                      {arabName}
                                    </span>
                                    <span className={`font-mono text-xs sm:text-sm font-bold ${isMahjub ? 'text-rose-700 bg-rose-100/70 px-1.5 py-0.5 rounded text-[11px]' : 'text-emerald-800'}`}>
                                      {porsiArab}
                                    </span>
                                  </div>

                                  {/* Middle Column: Saham Asal */}
                                  <div className={`${testResult.juz_sahm > 1 ? 'col-span-2' : 'col-span-3'} border-l-2 border-emerald-900 p-2 font-mono text-slate-800 text-sm sm:text-base`}>
                                    {sahamAsalDisplay}
                                  </div>

                                  {/* Final Column: Saham Akhir / Tashih */}
                                  <div className={`${testResult.juz_sahm > 1 ? 'col-span-3' : 'col-span-3'} p-2 font-mono text-emerald-900 font-extrabold text-sm sm:text-base ${isMahjub ? 'bg-rose-50/30 text-slate-400' : 'bg-emerald-50/40'}`}>
                                    {testResult.juz_sahm > 1 ? sahamTashihDisplay : sahamAsalDisplay}
                                  </div>

                                </div>
                              )
                            })}
                          </div>

                        </div>
                      </div>
                    </div>

                    {/* 2. TABEL 1: PEMBAGIAN SAHAM, KAIDAH FIKIH & HIJAB */}
                    <div className="card overflow-hidden border border-slate-200 p-0">
                      <div className="bg-slate-900 text-white p-3 flex items-center justify-between">
                        <h4 className="font-extrabold text-xs uppercase tracking-wide flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5 text-emerald-400" />
                          Tabel 1: Pembagian Saham, Kaidah Fikih & Hijab
                        </h4>
                        <span className="text-arabic text-xs text-emerald-300 font-bold hidden sm:inline">
                          جدول السهام وقواعد الفقه والمحجوبين
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-2 px-3">Ahli Waris</th>
                              <th className="py-2 px-2 text-center">Jiwa</th>
                              <th className="py-2 px-2 text-center">Porsi Syar'i</th>
                              <th className="py-2 px-3">Syarat & Kaidah Fikih</th>
                              <th className="py-2 px-2 text-center bg-slate-200/60">Saham Asal</th>
                              <th className="py-2 px-2 text-center bg-blue-50 text-blue-900">Tashih</th>
                              <th className="py-2 px-2 text-center bg-emerald-50 text-emerald-900">Saham Akhir</th>
                              <th className="py-2 px-3 text-right">Porsi (%)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {allListInResult.map((h, idx) => {
                              const isMahjub = ['gugur_halangan', 'gugur_hijab'].includes(h.status)
                              const sahamAsalClean = h.saham_asal !== undefined ? formatCleanNumber(h.saham_asal, 2) : (h.saham_total_kelompok ? formatCleanNumber(h.saham_total_kelompok, 2) : '0')
                              const sahamAkhirClean = formatCleanNumber(h.saham_total_kelompok || 0, 2)
                              const porsiPct = testResult.asal_masalah_tashih > 0 && h.saham_total_kelompok
                                ? ((h.saham_total_kelompok / testResult.asal_masalah_tashih) * 100).toFixed(2)
                                : '0.00'

                              return (
                                <tr key={idx} className={`transition-colors ${isMahjub ? 'bg-rose-50/60' : 'hover:bg-slate-50'}`}>
                                  {/* Ahli Waris */}
                                  <td className="py-2 px-3">
                                    <div className={`font-extrabold ${isMahjub ? 'line-through text-slate-700 decoration-rose-500' : 'text-slate-900'}`}>
                                      {h.nama_id}
                                    </div>
                                    <div className={`text-arabic text-xs font-bold ${isMahjub ? 'text-rose-700' : 'text-emerald-800'}`}>
                                      {h.nama_arab}
                                    </div>
                                  </td>

                                  {/* Jiwa */}
                                  <td className="py-2 px-2 text-center font-bold text-slate-700">
                                    {h.jumlah_orang}
                                  </td>

                                  {/* Porsi Syar'i */}
                                  <td className="py-2 px-2 text-center whitespace-nowrap">
                                    {isMahjub ? (
                                      <span className="badge-red text-[10px] py-0">Mahjub (0)</span>
                                    ) : (
                                      <span className="badge-emerald text-[10px] py-0">{h.pecahan_arab || h.pecahan || 'عصبة (ع)'}</span>
                                    )}
                                  </td>

                                  {/* Syarat / Alasan */}
                                  <td className="py-2 px-3 text-xs max-w-xs">
                                    {isMahjub ? (
                                      <span className="font-bold text-rose-700">
                                        {h.alasan_gugur || 'Terhalang (Hijab Hirman) oleh ahli waris yang lebih dekat'}
                                      </span>
                                    ) : (
                                      <span className="text-slate-600 text-[11px]">
                                        {h.alasan_syarat || h.keterangan || 'Memenuhi syarat syar\'i.'}
                                      </span>
                                    )}
                                  </td>

                                  {/* Saham Asal (Pokok) */}
                                  <td className="py-2 px-2 text-center font-mono font-bold text-slate-700 bg-slate-50/50">
                                    {isMahjub ? '0' : sahamAsalClean}
                                  </td>

                                  {/* Tashih (Pengali) */}
                                  <td className="py-2 px-2 text-center font-mono text-[11px] text-blue-900 bg-blue-50/40">
                                    {isMahjub ? '—' : (testResult.juz_sahm > 1 ? `× ${testResult.juz_sahm}` : '—')}
                                  </td>

                                  {/* Saham Akhir */}
                                  <td className="py-2 px-2 text-center font-mono font-extrabold text-emerald-950 bg-emerald-50/50 text-sm">
                                    {isMahjub ? '0' : (
                                      <>
                                        <div>{sahamAkhirClean}</div>
                                        {h.jumlah_orang > 1 && (
                                          <div className="text-[10px] font-normal text-emerald-800">
                                            ({formatCleanNumber(h.saham_per_orang || 0, 2)}/org)
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </td>

                                  {/* Porsi (%) */}
                                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-700">
                                    {isMahjub ? '0.00%' : `${porsiPct}%`}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 3. TABEL 2: PEMBAGIAN NOMINAL TIRKAH (HANYA PENERIMA / MUSTAHIQ) */}
                    <div className="card overflow-hidden border border-slate-200 p-0">
                      <div className="bg-emerald-800 text-white p-3 flex items-center justify-between">
                        <h4 className="font-extrabold text-xs uppercase tracking-wide flex items-center gap-1.5">
                          <Coins className="w-3.5 h-3.5 text-emerald-200" />
                          Tabel 2: Pembagian Nominal Harta (Tirkah)
                        </h4>
                        <span className="text-arabic text-xs text-emerald-200 font-bold hidden sm:inline">
                          جدول توزيع التركة النقدية
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-2 px-3">Ahli Waris (Mustahiq)</th>
                              <th className="py-2 px-2 text-center">Jiwa</th>
                              <th className="py-2 px-3 text-right">Total Kelompok (Rp)</th>
                              <th className="py-2 px-3 text-right">Per Individu (Rp)</th>
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

                  </div>
                ) : (
                  <div className="card p-10 text-center bg-white border border-slate-200 space-y-2.5">
                    <Scale className="w-8 h-8 text-emerald-700 mx-auto" />
                    <h4 className="font-extrabold text-sm text-slate-800">Mesin Sandbox Faraidh Siap</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Pilih ahli waris di kolom kiri atau klik salah satu preset cepat, lalu klik tombol <strong>"Jalankan Analisis"</strong> untuk melihat rincian porsi, kaidah hijab, dan preview tabel buku faraidh.
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
        {/* TAB 5: MATRIKS HIJAB (HIRMAN & NUQSHAN)                */}
        {/* ═══════════════════════════════════════════════════════ */}
        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 5: MATRIKS HIJAB (HIRMAN & NUQSHAN)                */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'hijab' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header Hijab Hirman */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">
                        Matriks & Kaidah Hijab Hirman
                      </h3>
                      <span className="text-arabic text-xs font-bold text-rose-800">
                        حجب الحرمان (إسقاط الوارث بالكلية من الميراث)
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Pengelompokan sistematis pihak penghalang (<strong>الحاجب</strong>) terhadap pihak yang gugur total (<strong>المحجوب</strong>) berdasarkan kurikulum fiqh Faraidh.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedPenghalang}
                    onChange={(e) => setSelectedPenghalang(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 hover:bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value="ALL">Semua Pihak Penghalang (كل الحواجب)</option>
                    <optgroup label="Penghalang Wanita (حواجب النساء)">
                      <option value="ibu">Ibu (الأم — 2 Nenek terhalang)</option>
                      <option value="anak_pr">Anak Perempuan (البنت — 3 terhalang)</option>
                      <option value="saudari_kandung">Saudari Sekandung (الأخت الشقيقة — 4 terhalang)</option>
                      <option value="cucu_pr">Cucu Perempuan (بنت الابن — 2 terhalang)</option>
                    </optgroup>
                    <optgroup label="Penghalang Laki-laki (حواجب الرجال)">
                      <option value="anak_lk">Anak Laki-laki (الابن — 13 terhalang)</option>
                      <option value="ayah">Ayah (الأب — 8 terhalang)</option>
                      <option value="cucu_lk">Cucu Laki-laki (ابن الابن — 6 terhalang)</option>
                      <option value="saudara_lk_kandung">Saudara Sekandung (الأخ الشقيق — 6 terhalang)</option>
                      <option value="saudara_lk_seayah">Saudara Seayah (الأخ لأب — 4 terhalang)</option>
                      <option value="kakek">Kakek (الجد — 2 terhalang)</option>
                      <option value="keponakan_lk_kandung">Keponakan Kandung (ابن الأخ)</option>
                      <option value="paman_kandung">Paman Kandung (العم الشقيق)</option>
                      <option value="paman_seayah">Paman Seayah (العم لأب)</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Group Category Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Kategori:
                </span>
                <button
                  type="button"
                  onClick={() => { setHijabGenderGroup('ALL'); setSelectedPenghalang('ALL') }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    hijabGenderGroup === 'ALL'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Semua ({adminData?.hijabHirmanRules?.length || 52} Kaidah)
                </button>

                <button
                  type="button"
                  onClick={() => { setHijabGenderGroup('WANITA'); setSelectedPenghalang('ALL') }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    hijabGenderGroup === 'WANITA'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
                  }`}
                >
                  <span>🌸 Penghalang Perempuan (حواجب النساء)</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${hijabGenderGroup === 'WANITA' ? 'bg-rose-700 text-white' : 'bg-rose-200 text-rose-800'}`}>
                    11 Kaidah
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { setHijabGenderGroup('PRIA'); setSelectedPenghalang('ALL') }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    hijabGenderGroup === 'PRIA'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60'
                  }`}
                >
                  <span>🛡️ Penghalang Laki-laki (حواجب الرجال)</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${hijabGenderGroup === 'PRIA' ? 'bg-indigo-700 text-white' : 'bg-indigo-200 text-indigo-800'}`}>
                    41 Kaidah
                  </span>
                </button>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* GRUP 1: PENGHALANG PEREMPUAN (حواجب النساء)            */}
            {/* ═══════════════════════════════════════════════════════ */}
            {(hijabGenderGroup === 'ALL' || hijabGenderGroup === 'WANITA') && groupedHijabHirman.wanita.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-gradient-to-r from-rose-50 via-pink-50 to-white p-3.5 rounded-xl border border-rose-200">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌸</span>
                    <div>
                      <h4 className="font-extrabold text-sm text-rose-950">
                        Penghalang Perempuan (حواجب النساء)
                      </h4>
                      <p className="text-[11px] text-rose-700">
                        Ahli waris wanita yang memiliki kekuatan menggugurkan ahli waris lain (Ibu, Anak Perempuan, Saudari Kandung, Cucu Perempuan)
                      </p>
                    </div>
                  </div>
                  <span className="text-arabic text-sm font-bold text-rose-800 hidden sm:inline">
                    حواجب الإناث
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedHijabHirman.wanita.map(({ penghalang, rules }) => (
                    <div key={penghalang.id} className="bg-white rounded-xl border border-rose-200/80 shadow-sm overflow-hidden flex flex-col">
                      {/* Tokoh Header */}
                      <div className="bg-rose-50/70 p-3 border-b border-rose-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                            ♀
                          </div>
                          <div>
                            <div className="font-extrabold text-xs text-rose-950">
                              {penghalang.nama_id}
                            </div>
                            <div className="text-arabic text-[11px] font-bold text-rose-800">
                              {penghalang.nama_arab}
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold border border-rose-200">
                          Menghalangi {rules.length} Ahli Waris
                        </span>
                      </div>

                      {/* List Terhalang */}
                      <div className="p-3 divide-y divide-rose-50 space-y-2.5 flex-1">
                        {rules.map((r: HijabHirmanRule) => {
                          const terhalang = ahliWarisMap.get(r.terhalang_id)
                          return (
                            <div key={r.id} className="pt-2 first:pt-0 flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <ChevronRight className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                  <span className="font-bold text-xs text-slate-800 line-through decoration-rose-500">
                                    {terhalang?.nama_id}
                                  </span>
                                </div>
                                <span className="text-arabic text-xs font-bold text-rose-700 line-through decoration-rose-500">
                                  {terhalang?.nama_arab}
                                </span>
                              </div>
                              {r.keterangan && (
                                <p className="text-[11px] text-slate-500 pl-5 leading-tight">
                                  {r.keterangan}
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════ */}
            {/* GRUP 2: PENGHALANG LAKI-LAKI (حواجب الرجال)            */}
            {/* ═══════════════════════════════════════════════════════ */}
            {(hijabGenderGroup === 'ALL' || hijabGenderGroup === 'PRIA') && groupedHijabHirman.pria.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 via-slate-50 to-white p-3.5 rounded-xl border border-indigo-200">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🛡️</span>
                    <div>
                      <h4 className="font-extrabold text-sm text-indigo-950">
                        Penghalang Laki-laki (حواجب الرجال)
                      </h4>
                      <p className="text-[11px] text-indigo-700">
                        Ahli waris laki-laki yang menggugurkan kerabat lain (Anak Laki-laki, Ayah, Cucu Laki-laki, Saudara Kandung, dll)
                      </p>
                    </div>
                  </div>
                  <span className="text-arabic text-sm font-bold text-indigo-800 hidden sm:inline">
                    حواجب الذكور
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedHijabHirman.pria.map(({ penghalang, rules }) => (
                    <div key={penghalang.id} className="bg-white rounded-xl border border-indigo-200/80 shadow-sm overflow-hidden flex flex-col">
                      {/* Tokoh Header */}
                      <div className="bg-indigo-50/70 p-3 border-b border-indigo-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                            ♂
                          </div>
                          <div>
                            <div className="font-extrabold text-xs text-indigo-950">
                              {penghalang.nama_id}
                            </div>
                            <div className="text-arabic text-[11px] font-bold text-indigo-800">
                              {penghalang.nama_arab}
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-extrabold border border-indigo-200">
                          {rules.length} Terhalang
                        </span>
                      </div>

                      {/* List Terhalang */}
                      <div className="p-3 divide-y divide-slate-100 space-y-2 flex-1">
                        {rules.map((r: HijabHirmanRule) => {
                          const terhalang = ahliWarisMap.get(r.terhalang_id)
                          return (
                            <div key={r.id} className="pt-2 first:pt-0 flex flex-col gap-0.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <ChevronRight className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                  <span className="font-bold text-xs text-slate-800 line-through decoration-rose-500">
                                    {terhalang?.nama_id}
                                  </span>
                                </div>
                                <span className="text-arabic text-xs font-bold text-rose-700 line-through decoration-rose-500">
                                  {terhalang?.nama_arab}
                                </span>
                              </div>
                              {r.keterangan && (
                                <p className="text-[10.5px] text-slate-500 pl-5 leading-tight">
                                  {r.keterangan}
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State if filter yields nothing */}
            {filteredHijabHirman.length === 0 && (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 space-y-2">
                <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-600">Tidak ada kaidah hijab yang cocok dengan filter saat ini</p>
                <button
                  type="button"
                  onClick={() => { setSelectedPenghalang('ALL'); setHijabGenderGroup('ALL') }}
                  className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg"
                >
                  Reset Filter
                </button>
              </div>
            )}

            {/* ═══ KOTAK RUJUKAN KITAB: 5 GOLONGAN WANITA TERKENA HIJAB HIRMAN (HLM 18) ═══ */}
            <div className="card p-5 border-2 border-emerald-300 bg-emerald-50/40 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-800" />
                  <h4 className="font-extrabold text-sm text-emerald-950">
                    Kaidah Rujukan Kitab: 5 Golongan Wanita Terkena Hijab Hirman
                  </h4>
                </div>
                <span className="text-arabic text-sm font-bold text-emerald-900">
                  المحجوبات حجب حرمان (كتاب الفرائض ص ١٨)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">1. Nenek secara Mutlak (الجدّة مطلقا)</span>
                    <span className="text-arabic font-bold text-emerald-800">أمّ الأم / أمّ الأب</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    <strong>تُحْجَبُ بالأمّ</strong>: Terhalang oleh Ibu kandung. Nenek dari jalur ayah (أم الأب) juga terhalang oleh Ayah.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">2. Cucu Perempuan (بنت ابن)</span>
                    <span className="text-arabic font-bold text-emerald-800">بنت ابن</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    <strong>تُحْجَبُ بالابن وتُحْجَبُ ببنتين فأكثر إلاّ إذا كان هناك معصّب</strong>: Terhalang oleh Anak Laki-laki dan oleh 2+ Anak Perempuan kecuali ada Cucu Laki-laki yang meng-ashabahkan.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">3. Saudari Sekandung (الأخت الشقيقة)</span>
                    <span className="text-arabic font-bold text-emerald-800">الأخت الشقيقة</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    <strong>تُحْجَبُ بالأب، وتُحْجَبُ بالفرع الوارث المذكّر</strong>: Terhalang oleh Ayah dan oleh Keturunan Laki-laki (Anak Lk / Cucu Lk).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">4. Saudari Seayah (الأخت لأب)</span>
                    <span className="text-arabic font-bold text-emerald-800">الأخت لأب</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    <strong>تُحْجَبُ بالشقيق، وبالشقيقة إذا صارت عصبة مع الغير، وبالأب وبالفرع الوارث المذكّر، وبالشقيقتين إلاّ إذا وجد معصّب</strong>: Terhalang oleh Saudara Kandung, oleh Saudari Kandung (Ashabah ma'al-Ghair), oleh Ayah, Far'u Mudzakkar, dan 2 Saudari Kandung.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-1 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">5. Saudari Seibu (الأخت لأمّ)</span>
                    <span className="text-arabic font-bold text-emerald-800">الأخت لأمّ والأخ لأمّ</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    <strong>تُحْجَبُ بالأصل المذكّر والفرع الوارث المذكّر والمؤنّث</strong>: Terhalang oleh Asal Laki-laki (Ayah, Kakek) dan seluruh Keturunan (Anak Lk/Pr, Cucu Lk/Pr).
                  </p>
                </div>
              </div>
            </div>

            {/* Section Hijab Nuqshan */}
            <div className="card p-4 space-y-3 bg-white border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-600" />
                  Kaidah Hijab Nuqshan (12 Kasus Penurunan Porsi)
                </h4>
                <span className="text-arabic text-xs font-bold text-amber-800">
                  حجب النقصان (انتقال الوarث من فرض أعلى إلى فرض أدنى)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Penyebab (السبب / الفرع الوارث)</th>
                      <th className="py-2.5 px-3">Terdampak (المحجوب نقصاناً)</th>
                      <th className="py-2.5 px-3 text-center">Perubahan Porsi (التحول)</th>
                      <th className="py-2.5 px-3">Keterangan Syar'i (البيان)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(adminData?.hijabNuqshanRules || []).map((n: HijabNuqshanRule) => {
                      const p = ahliWarisMap.get(n.penyebab_id)
                      const t = ahliWarisMap.get(n.terdampak_id)
                      const pecahanAwalArab = formatArabicFraction(n.pecahan_awal)
                      const pecahanBaruArab = formatArabicFraction(n.pecahan_baru)

                      return (
                        <tr key={n.id} className="hover:bg-slate-50">
                          {/* Penyebab */}
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-800">{p?.nama_id}</div>
                            <div className="text-arabic text-[11px] font-bold text-emerald-800">{p?.nama_arab}</div>
                          </td>

                          {/* Terdampak */}
                          <td className="py-2.5 px-3">
                            <div className="font-extrabold text-slate-900">{t?.nama_id}</div>
                            <div className="text-arabic text-[11px] font-bold text-amber-800">{t?.nama_arab}</div>
                          </td>

                          {/* Perubahan Porsi */}
                          <td className="py-2.5 px-3 text-center">
                            <div className="font-mono font-bold text-amber-800">
                              {n.pecahan_awal} ➔ {n.pecahan_baru}
                            </div>
                            <div className="text-arabic text-xs font-bold text-slate-500 mt-0.5">
                              {pecahanAwalArab} ➔ {pecahanBaruArab}
                            </div>
                          </td>

                          {/* Keterangan */}
                          <td className="py-2.5 px-3 text-slate-600 text-[11px] leading-relaxed max-w-sm">
                            {n.keterangan}
                          </td>
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
            
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Ensiklopedia Kasus Khusus Faraidh (المسائل الملقبة الخاصة)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Maklumat lengkap sejarah, latar belakang peristiwa, asbab &amp; &apos;illat syar&apos;i, atsar sahabat, serta kaidah studi santri.
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs">
                3 Kasus Masyhur + &apos;Aul &amp; Radd
              </span>
            </div>

            {/* 3 Main Special Cases */}
            <div className="space-y-4">
              <KasusKhususMaklumatCard kasusKode="gharrawain" defaultExpanded={true} />
              <KasusKhususMaklumatCard kasusKode="musytarakah" defaultExpanded={false} />
              <KasusKhususMaklumatCard kasusKode="akdariyyah" defaultExpanded={false} />
            </div>

            {/* General Adjustments: 'Aul and Radd */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 mt-6 shadow-2xs space-y-3">
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-600" />
                <span>Kaidah Penyesuaian Asal Masalah: Al-&apos;Aul &amp; Ar-Radd (العول والرد)</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <KasusKhususMaklumatCard penyesuaianJenis="aul" />
                <KasusKhususMaklumatCard penyesuaianJenis="radd" />
              </div>
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

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB: BATCH SOAL MANAJEMEN                               */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'batch_soal' && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-600" />
                  Manajemen Batch Soal
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Kelola paket soal latihan untuk santri</p>
              </div>
              <button
                onClick={() => { setShowBatchForm(true); setEditingBatch(null); setBatchForm({ judul: '', deskripsi: '', kelas_target: '', is_active: true }) }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Buat Batch Baru
              </button>
            </div>

            {/* Form Batch */}
            {showBatchForm && (
              <div className="card p-5 border-amber-200 bg-amber-50/30">
                <h3 className="font-bold text-slate-900 mb-4">{editingBatch ? 'Edit Batch' : 'Buat Batch Soal Baru'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Judul Batch *</label>
                    <input
                      type="text"
                      value={batchForm.judul}
                      onChange={e => setBatchForm(f => ({ ...f, judul: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="Contoh: UTS Faraidh Kelas 3 2026"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Target Kelas</label>
                    <input
                      type="text"
                      value={batchForm.kelas_target}
                      onChange={e => setBatchForm(f => ({ ...f, kelas_target: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="Contoh: Kelas 3 KMI"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Deskripsi</label>
                    <textarea
                      value={batchForm.deskripsi}
                      onChange={e => setBatchForm(f => ({ ...f, deskripsi: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="Keterangan batch soal..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="batch-active"
                      checked={batchForm.is_active}
                      onChange={e => setBatchForm(f => ({ ...f, is_active: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="batch-active" className="text-xs font-bold text-slate-600">Aktif (terlihat oleh santri)</label>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={handleSaveBatch} className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition">
                    {editingBatch ? 'Simpan Perubahan' : 'Buat Batch'}
                  </button>
                  <button onClick={() => setShowBatchForm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition">
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Daftar Batch */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Sidebar: List Batch */}
              <div className="space-y-3">
                {batchesLoading ? (
                  <div className="card p-6 text-center"><Loader2 className="w-6 h-6 text-amber-600 animate-spin mx-auto" /></div>
                ) : batches.length === 0 ? (
                  <div className="card p-6 text-center text-sm text-slate-400">
                    <ClipboardList className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Belum ada batch soal. Buat yang pertama!
                  </div>
                ) : (
                  batches.map(batch => (
                    <div
                      key={batch.id}
                      className={`card p-4 cursor-pointer transition-all ${selectedBatchId === batch.id ? 'border-amber-400 bg-amber-50/30' : 'hover:border-slate-300'}`}
                      onClick={() => handleSelectBatch(batch.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate">{batch.judul}</p>
                          {batch.kelas_target && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">{batch.kelas_target}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={e => { e.stopPropagation(); handleToggleBatchActive(batch) }}
                            className={`p-1 rounded ${batch.is_active ? 'text-emerald-600' : 'text-slate-300'} hover:bg-slate-100 transition`}
                            title={batch.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            {batch.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setEditingBatch(batch); setBatchForm({ judul: batch.judul, deskripsi: batch.deskripsi || '', kelas_target: batch.kelas_target || '', is_active: batch.is_active }); setShowBatchForm(true) }}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Edit"
                          >
                            <Settings2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteBatch(batch.id) }}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {!batch.is_active && (
                        <span className="text-[10px] text-slate-400 font-medium">(Tidak Aktif)</span>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Main: Daftar Soal */}
              <div className="lg:col-span-2 space-y-3">
                {!selectedBatchId ? (
                  <div className="card p-10 text-center text-slate-400">
                    <ListOrdered className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                    <p className="text-sm">Pilih batch soal di sebelah kiri untuk melihat dan mengelola soal-soalnya.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="font-bold text-slate-900">
                        Soal dalam Batch ({batchSoalList.length})
                      </h3>
                      <button
                        onClick={() => {
                          setEditingSoalId(null)
                          setSoalFormTipe('pilihan_ganda')
                          setSoalForm({ pertanyaan: '', pertanyaan_arab: '', jawaban_benar: '', skor_maksimal: 10, petunjuk: '' })
                          setSoalSelectedWaris([])
                          setOpsiList([
                            { label: 'A', teks: '', benar: false },
                            { label: 'B', teks: '', benar: false },
                            { label: 'C', teks: '', benar: false },
                            { label: 'D', teks: '', benar: false },
                          ])
                          setShowSoalForm(true)
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah Soal
                      </button>
                    </div>

                    {/* Form Tambah / Edit Soal */}
                    {showSoalForm && (
                      <div className="card p-5 border-emerald-200 bg-emerald-50/20 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {editingSoalId ? 'Edit Soal' : 'Tambah Soal Baru'}
                          </h4>
                          {editingSoalId && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                              Mode Edit
                            </span>
                          )}
                        </div>
                        
                        {/* Tipe Soal */}
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-2">Tipe Soal</label>
                          <div className="flex gap-2 flex-wrap">
                            {(['pilihan_ganda', 'esay', 'isi_tabel'] as TipeSoal[]).map(t => (
                              <button
                                key={t}
                                onClick={() => setSoalFormTipe(t)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${soalFormTipe === t ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                              >
                                {t === 'pilihan_ganda' ? 'Pilihan Ganda' : t === 'esay' ? 'Esay' : 'Jadwal Syubbak (Tabel)'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Pertanyaan / Redaksi Soal *</label>
                          <textarea
                            value={soalForm.pertanyaan}
                            onChange={e => setSoalForm(f => ({ ...f, pertanyaan: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            placeholder="Tulis pertanyaan atau redaksi kasus mayit..."
                          />
                        </div>

                        {soalFormTipe === 'pilihan_ganda' && (
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2">Opsi Jawaban (centang yang benar)</label>
                            <div className="space-y-2">
                              {opsiList.map((opsi, i) => (
                                <div key={opsi.label} className="flex items-center gap-2">
                                  <button
                                    onClick={() => setOpsiList(list => list.map((o, j) => ({ ...o, benar: j === i })))}
                                    className={`w-7 h-7 rounded-lg font-extrabold text-xs flex-shrink-0 transition ${opsi.benar ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                  >
                                    {opsi.label}
                                  </button>
                                  <input
                                    type="text"
                                    value={opsi.teks}
                                    onChange={e => setOpsiList(list => list.map((o, j) => j === i ? { ...o, teks: e.target.value } : o))}
                                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                    placeholder={`Teks opsi ${opsi.label}...`}
                                  />
                                </div>
                              ))}
                              <p className="text-[11px] text-slate-400">Klik huruf untuk menandai jawaban benar.</p>
                            </div>
                          </div>
                        )}

                        {/* Khusus Soal Isi Tabel / Jadwal Syubbak: Pemilih 25 Ahli Waris */}
                        {soalFormTipe === 'isi_tabel' && (
                          <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-emerald-400 space-y-4 shadow-sm">
                            
                            {/* Header & Multi-Language Redaksi Generator */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-3">
                              <div>
                                <h5 className="font-extrabold text-sm sm:text-base text-emerald-950 flex items-center gap-2">
                                  <Scale className="w-4 h-4 text-emerald-700" />
                                  Pilih Ahli Waris (Kunci Jadwal Syubbak)
                                </h5>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Pilih ahli waris per kelompok (الفرائض) dan tentukan nominal tirkah (jika ada).
                                </p>
                              </div>

                              {soalSelectedWaris.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap bg-emerald-50 p-1.5 rounded-xl border border-emerald-200">
                                  <span className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider px-1">
                                    Redaksi:
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const redaksi = generateRedaksiSoal(soalSelectedWaris, soalTirkahHarta, 'id')
                                      setSoalForm(f => ({ ...f, pertanyaan: redaksi.pertanyaan, petunjuk: redaksi.petunjuk }))
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center gap-1"
                                    title="Buat Redaksi Bahasa Indonesia"
                                  >
                                    <span>🇮🇩 ID</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const redaksi = generateRedaksiSoal(soalSelectedWaris, soalTirkahHarta, 'ar')
                                      setSoalForm(f => ({ ...f, pertanyaan: redaksi.pertanyaan, petunjuk: redaksi.petunjuk }))
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center gap-1"
                                    title="Buat Redaksi Bahasa Arab"
                                  >
                                    <span>🇸🇦 AR</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const redaksi = generateRedaksiSoal(soalSelectedWaris, soalTirkahHarta, 'en')
                                      setSoalForm(f => ({ ...f, pertanyaan: redaksi.pertanyaan, petunjuk: redaksi.petunjuk }))
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center gap-1"
                                    title="Buat Redaksi Bahasa Inggris"
                                  >
                                    <span>🇬🇧 EN</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Input Harta Tirkah (Opsional) */}
                            <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                                  <Coins className="w-4 h-4 text-amber-600" />
                                  <span>Total Harta Tirkah Bersih / التركة (Opsional - Rp)</span>
                                </label>
                                {soalTirkahHarta > 0 && (
                                  <span className="text-xs font-mono font-extrabold text-amber-900">
                                    Rp {soalTirkahHarta.toLocaleString('id-ID')}
                                  </span>
                                )}
                              </div>
                              <input
                                type="number"
                                value={soalTirkahHarta || ''}
                                onChange={e => setSoalTirkahHarta(Math.max(0, parseInt(e.target.value) || 0))}
                                placeholder="Kosongkan jika soal hanya hisab porsi & saham..."
                                className="w-full px-3 py-2 rounded-xl border border-amber-200 text-xs sm:text-sm font-bold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                              />
                              <div className="flex items-center gap-1.5 overflow-x-auto text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => setSoalTirkahHarta(0)}
                                  className={`px-2 py-0.5 rounded font-bold transition ${soalTirkahHarta === 0 ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}
                                >
                                  Tanpa Nominal
                                </button>
                                {[120_000_000, 240_000_000, 360_000_000, 600_000_000].map(amt => (
                                  <button
                                    key={amt}
                                    type="button"
                                    onClick={() => setSoalTirkahHarta(amt)}
                                    className={`px-2 py-0.5 rounded font-bold transition ${soalTirkahHarta === amt ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}
                                  >
                                    {(amt / 1_000_000)} Jt
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Clustered 25 Ahli Waris Selector with Arabic First */}
                            <div className="space-y-3">
                              {/* Cluster Tabs */}
                              <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
                                {CLUSTERS.map(cluster => {
                                  const countInCluster = soalSelectedWaris.filter(w => cluster.codes.includes(w.kode)).reduce((sum, w) => sum + w.count, 0)
                                  return (
                                    <button
                                      key={cluster.id}
                                      type="button"
                                      onClick={() => setSoalClusterTab(cluster.id)}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                        soalClusterTab === cluster.id
                                          ? 'bg-slate-900 text-white shadow-sm'
                                          : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                                      }`}
                                    >
                                      <span>{cluster.title}</span>
                                      <span className="text-arabic text-[11px] opacity-80">({cluster.titleArab})</span>
                                      {countInCluster > 0 && (
                                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold">
                                          {countInCluster}
                                        </span>
                                      )}
                                    </button>
                                  )
                                })}
                              </div>

                              {/* Active Cluster Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                {CLUSTERS.find(c => c.id === soalClusterTab)?.codes.map(kode => {
                                  const info = HEIR_INFO[kode] || { id: kode, arab: kode, concise: kode }
                                  const selected = soalSelectedWaris.find(w => w.kode === kode)
                                  const count = selected?.count || 0

                                  return (
                                    <div
                                      key={kode}
                                      className={`p-3 rounded-xl border-2 flex items-center justify-between gap-2 transition ${
                                        count > 0
                                          ? 'bg-emerald-50/90 border-emerald-500 shadow-sm'
                                          : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                                      }`}
                                    >
                                      <div className="min-w-0 flex-1">
                                        <div className="text-arabic text-sm sm:text-base font-extrabold text-emerald-950 truncate">
                                          {info.arab}
                                        </div>
                                        <div className="text-xs text-slate-600 font-bold truncate">
                                          {info.id}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1.5 flex-shrink-0">
                                        {count > 0 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSoalSelectedWaris(prev => {
                                                const existing = prev.find(w => w.kode === kode)
                                                if (!existing || existing.count <= 1) return prev.filter(w => w.kode !== kode)
                                                return prev.map(w => w.kode === kode ? { ...w, count: w.count - 1 } : w)
                                              })
                                            }}
                                            className="w-7 h-7 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 flex items-center justify-center font-bold text-sm transition"
                                          >
                                            -
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSoalSelectedWaris(prev => {
                                              let next = [...prev]
                                              if (kode === 'suami') next = next.filter(w => w.kode !== 'istri')
                                              if (kode === 'istri') next = next.filter(w => w.kode !== 'suami')
                                              const existing = next.find(w => w.kode === kode)
                                              if (!existing) next.push({ kode, count: 1 })
                                              else next = next.map(w => w.kode === kode ? { ...w, count: w.count + 1 } : w)
                                              return next
                                            })
                                          }}
                                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs transition ${
                                            count > 0
                                              ? 'bg-emerald-700 text-white'
                                              : 'bg-slate-200 text-slate-700 hover:bg-emerald-600 hover:text-white'
                                          }`}
                                        >
                                          {count > 0 ? count : '+'}
                                        </button>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>

                              {/* Selected Heirs Summary Chips */}
                              {soalSelectedWaris.length > 0 && (
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between flex-wrap gap-2">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-slate-700 mr-1">
                                      Terpilih ({soalSelectedWaris.length} Golongan):
                                    </span>
                                    {soalSelectedWaris.map(sw => {
                                      const info = HEIR_INFO[sw.kode] || { id: sw.kode, arab: sw.kode, concise: sw.kode }
                                      return (
                                        <span
                                          key={sw.kode}
                                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-950"
                                        >
                                          <span className="text-arabic text-xs font-extrabold text-emerald-900">{info.arab}</span>
                                          <span>{info.concise}</span>
                                          <span className="w-4 h-4 rounded-full bg-emerald-700 text-white text-[10px] flex items-center justify-center font-bold">
                                            {sw.count}
                                          </span>
                                        </span>
                                      )
                                    })}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setSoalSelectedWaris([])}
                                    className="text-[11px] text-rose-600 font-bold hover:underline"
                                  >
                                    Reset Pilihan
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Live Preview Kunci Jadwal Syubbak */}
                            {soalSelectedWaris.length > 0 && (
                              <div className="border-t border-emerald-200 pt-4">
                                <p className="text-xs font-bold text-emerald-950 mb-2 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>Live Preview Kunci Jadwal Syubbak yang Dihasilkan:</span>
                                </p>
                                {(() => {
                                  const syubbak = getSyubbakFromSelectedWaris(soalSelectedWaris, soalTirkahHarta)
                                  if (!syubbak) return <p className="text-xs text-slate-400">Pilih minimal 1 ahli waris.</p>
                                  return (
                                    <JadwalSyubbakSoal
                                      kunci={syubbak}
                                      readonly
                                      showCorrection
                                    />
                                  )
                                })()}
                              </div>
                            )}
                          </div>
                        )}

                        {soalFormTipe === 'esay' && (
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Kunci Jawaban (referensi guru)</label>
                            <textarea
                              value={soalForm.jawaban_benar}
                              onChange={e => setSoalForm(f => ({ ...f, jawaban_benar: e.target.value }))}
                              rows={3}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
                              placeholder="Tulis kunci jawaban lengkap..."
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Skor Maksimal</label>
                            <input
                              type="number"
                              value={soalForm.skor_maksimal}
                              onChange={e => setSoalForm(f => ({ ...f, skor_maksimal: parseInt(e.target.value) || 10 }))}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Petunjuk (opsional)</label>
                            <input
                              type="text"
                              value={soalForm.petunjuk}
                              onChange={e => setSoalForm(f => ({ ...f, petunjuk: e.target.value }))}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                              placeholder="Petunjuk pengerjaan..."
                            />
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={handleSaveSoal}
                            disabled={savingSoal}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition disabled:opacity-50"
                          >
                            {savingSoal ? 'Menyimpan...' : editingSoalId ? 'Simpan Perubahan' : 'Simpan Soal'}
                          </button>
                          <button
                            onClick={() => {
                              setShowSoalForm(false)
                              setEditingSoalId(null)
                            }}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Daftar Soal */}
                    {batchSoalList.length === 0 ? (
                      <div className="card p-8 text-center text-slate-400 text-sm">
                        <FileQuestion className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                        Belum ada soal. Tambahkan soal pertama atau gunakan AI Generator.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {batchSoalList.map((soal, idx) => (
                          <div key={soal.id} className="card p-4 flex items-start gap-3">
                            <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-extrabold text-slate-600 text-xs flex-shrink-0">{idx + 1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${soal.tipe === 'pilihan_ganda' ? 'bg-blue-100 text-blue-800 border-blue-200' : soal.tipe === 'esay' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                                  {soal.tipe === 'pilihan_ganda' ? 'PG' : soal.tipe === 'esay' ? 'Esay' : 'Tabel'}
                                </span>
                                <span className="text-[10px] text-slate-400">Skor: {soal.skor_maksimal}</span>
                              </div>
                              <p className="text-sm text-slate-800 line-clamp-2">{soal.pertanyaan}</p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => handleEditSoalClick(soal)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                                title="Edit Soal"
                              >
                                <Settings2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSoal(soal.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                title="Hapus Soal"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB: AI GENERATOR SOAL                                 */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'ai_generator' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center">
                <Bot className="w-6 h-6 text-purple-700" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Generator Soal AI</h2>
                <p className="text-xs text-slate-500">Powered by Gemini — Buat soal faraidh otomatis berdasarkan kaidah syar&apos;i</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Konfigurasi */}
              <div className="card p-5 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Konfigurasi Generate</h3>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Topik Soal</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { val: 'furudh', label: 'Furudh Muqaddarah' },
                      { val: 'hijab', label: 'Hijab Hirman/Nuqshan' },
                      { val: 'ashabah', label: 'Ashabah (3 Jenis)' },
                      { val: 'asal_masalah', label: "Asal Masalah/'Aul/Radd" },
                      { val: 'kasus_khusus', label: 'Masalah Khusus (3)' },
                      { val: 'umum', label: 'Umum (Campuran)' },
                    ].map(t => (
                      <button
                        key={t.val}
                        onClick={() => setAiTopik(t.val)}
                        className={`px-3 py-2 rounded-xl border text-xs font-semibold text-left transition ${aiTopik === t.val ? 'bg-purple-600 text-white border-purple-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Tipe Soal</label>
                  <div className="flex gap-2">
                    {(['pilihan_ganda', 'esay', 'isi_tabel'] as TipeSoal[]).map(t => (
                      <button
                        key={t}
                        onClick={() => setAiTipe(t)}
                        className={`flex-1 py-2 rounded-xl border text-xs font-bold transition ${aiTipe === t ? 'bg-purple-600 text-white border-purple-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {t === 'pilihan_ganda' ? 'PG' : t === 'esay' ? 'Esay' : 'Isi Tabel'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Tingkat Kesulitan</label>
                  <div className="flex gap-2">
                    {['mudah', 'sedang', 'sulit'].map(k => (
                      <button
                        key={k}
                        onClick={() => setAiKesulitan(k)}
                        className={`flex-1 py-2 rounded-xl border text-xs font-bold capitalize transition ${aiKesulitan === k ? 'bg-purple-600 text-white border-purple-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Jumlah Soal (maks 10)</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setAiJumlah(j => Math.max(1, j - 1))} className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-extrabold text-xl text-slate-900 w-10 text-center">{aiJumlah}</span>
                    <button onClick={() => setAiJumlah(j => Math.min(10, j + 1))} className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleGenerateAI}
                  disabled={aiLoading}
                  className="w-full py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {aiLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Gemini sedang berfikir...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" />Generate Soal dengan AI</>
                  )}
                </button>

                {aiError && (
                  <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    <strong>Error:</strong> {aiError}
                  </div>
                )}
              </div>

              {/* Preview Hasil AI */}
              <div className="card p-5">
                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 mb-3">
                  Preview Hasil ({aiResult.length} soal)
                </h3>

                {aiResult.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <Sparkles className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                    <p className="text-sm">Hasil soal AI akan muncul di sini setelah di-generate.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {aiResult.map((soal, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-200 p-3.5 bg-slate-50 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center text-[10px] font-extrabold">{idx + 1}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${soal.tipe === 'pilihan_ganda' ? 'bg-blue-100 text-blue-800 border-blue-200' : soal.tipe === 'esay' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
                              {soal.tipe === 'pilihan_ganda' ? 'Pilihan Ganda' : soal.tipe === 'esay' ? 'Esay' : 'Jadwal Syubbak (Tabel)'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold">Skor: {soal.skor_maksimal}</span>
                        </div>

                        <p className="text-xs font-bold text-slate-900 leading-relaxed">{soal.pertanyaan}</p>

                        {/* Preview PG */}
                        {soal.tipe === 'pilihan_ganda' && soal.opsi_jawaban && (
                          <div className="mt-2 space-y-1 bg-white p-2.5 rounded-lg border border-slate-200">
                            {soal.opsi_jawaban.map(o => (
                              <div key={o.label} className={`flex items-center justify-between text-[11px] p-1 rounded ${o.benar ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-600'}`}>
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-4 h-4 rounded flex items-center justify-center font-bold text-[10px] ${o.benar ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>{o.label}</span>
                                  <span>{o.teks}</span>
                                </div>
                                {o.benar && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Preview Esay */}
                        {soal.tipe === 'esay' && soal.jawaban_benar && (
                          <div className="mt-2 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                            <span className="font-extrabold text-[10px] text-emerald-900 uppercase tracking-wider block">Kunci Jawaban Model:</span>
                            <p className="text-[11px] text-slate-700 leading-relaxed">{soal.jawaban_benar}</p>
                          </div>
                        )}

                        {/* Preview Tabel Syubbak */}
                        {soal.tipe === 'isi_tabel' && soal.data_isi_tabel?.syubbak && (
                          <div className="mt-2 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-[10px] text-emerald-900 uppercase tracking-wider">Kunci Jadwal Syubbak:</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900">
                                Asal: {soal.data_isi_tabel.syubbak.asal_masalah_pokok} {soal.data_isi_tabel.syubbak.asal_masalah_akhir ? `➔ ${soal.data_isi_tabel.syubbak.asal_masalah_akhir}` : ''}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-[10.5px]">
                              {soal.data_isi_tabel.syubbak.baris.map(b => (
                                <div key={b.kode} className="flex items-center justify-between p-1 bg-white rounded border border-emerald-100">
                                  <span className="font-bold text-slate-800">{b.nama_id}</span>
                                  <span className="font-mono font-extrabold text-emerald-800">{b.porsi_benar} ({b.saham_benar})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {soal.petunjuk && (
                          <p className="text-[10px] text-slate-500 italic mt-1">
                            <strong>Petunjuk:</strong> {soal.petunjuk}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {aiResult.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Simpan ke Batch</label>
                      <select
                        value={aiTargetBatch}
                        onChange={e => setAiTargetBatch(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                      >
                        <option value="">Pilih batch...</option>
                        {batches.map(b => (
                          <option key={b.id} value={b.id}>{b.judul}</option>
                        ))}
                      </select>
                    </div>
                    {aiSavedCount > 0 && (
                      <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                        ✓ {aiSavedCount} soal berhasil disimpan ke batch!
                      </div>
                    )}
                    <button
                      onClick={handleSaveAiTooBatch}
                      disabled={!aiTargetBatch || aiSaving}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      {aiSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Menyimpan...</> : <><Save className="w-4 h-4" />Simpan ke Batch</>}
                    </button>
                  </div>
                )}
              </div>
            </div>
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
