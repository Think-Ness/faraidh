'use client'

import React from 'react'
import Link from 'next/link'
import {
  X,
  BookOpen,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Calculator,
  Sparkles,
  Info,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import type { WaritsNode } from '@/data/shajarah-waratsah-data'

interface DetailModalProps {
  node: WaritsNode | null
  onClose: () => void
  jenazahGender: 'L' | 'P'
}

const HEIR_ARABIC_LOOKUP: Record<string, { idName: string; arabName: string }> = {
  ayah: { idName: 'Ayah Kandung', arabName: 'الأَب' },
  ibu: { idName: 'Ibu Kandung', arabName: 'الأُمّ' },
  kakek: { idName: 'Kakek Shahih (Ayah dari Ayah)', arabName: 'الجَدّ الصَّحِيح' },
  nenek_ibu: { idName: 'Nenek dari Ibu', arabName: 'الجَدَّة (أُمّ الأُمّ)' },
  nenek_ayah: { idName: 'Nenek dari Ayah', arabName: 'الجَدَّة (أُمّ الأَب)' },
  anak_lk: { idName: 'Anak Laki-laki Kandung', arabName: 'الاِبْن' },
  anak_pr: { idName: 'Anak Perempuan Kandung', arabName: 'البِنْت' },
  cucu_lk: { idName: 'Cucu Laki-laki (dari Anak Lk)', arabName: 'ابْن الاِبْن' },
  cucu_pr: { idName: 'Cucu Perempuan (dari Anak Lk)', arabName: 'بِنْت الاِبْن' },
  saudara_lk_kandung: { idName: 'Saudara Laki Sekandung', arabName: 'الأَخ الشَّقِيق' },
  saudari_kandung: { idName: 'Saudari Perempuan Sekandung', arabName: 'الأُخْت الشَّقِيقَة' },
  saudara_lk_seayah: { idName: 'Saudara Laki Seayah', arabName: 'الأَخ لِأَب' },
  saudari_seayah: { idName: 'Saudari Perempuan Seayah', arabName: 'الأُخْت لِأَب' },
  saudara_lk_seibu: { idName: 'Saudara Laki Seibu', arabName: 'الأَخ لِأُمّ' },
  saudari_seibu: { idName: 'Saudari Perempuan Seibu', arabName: 'الأُخْت لِأُمّ' },
  saudara_seibu: { idName: 'Saudara / Saudari Seibu', arabName: 'الإِخْوَة لِأُمّ' },
  keponakan_lk_kandung: { idName: 'Anak Laki Saudara Kandung', arabName: 'ابْن الأَخ الشَّقِيق' },
  keponakan_lk_seayah: { idName: 'Anak Laki Saudara Seayah', arabName: 'ابْن الأَخ لِأَب' },
  paman_kandung: { idName: 'Paman Sekandung (Saudara Ayah)', arabName: 'العَمّ الشَّقِيق' },
  paman_seayah: { idName: 'Paman Seayah (Saudara Ayah)', arabName: 'العَمّ لِأَب' },
  sepupu_lk_paman_kandung: { idName: 'Anak Laki Paman Sekandung', arabName: 'ابْن العَمّ الشَّقِيق' },
  sepupu_lk_paman_seayah: { idName: 'Anak Laki Paman Seayah', arabName: 'ابْن العَمّ لِأَب' },
  pasangan: { idName: 'Pasangan Sahih (Istri/Suami)', arabName: 'الزَّوْجَة / الزَّوْج' },
  mayyit: { idName: 'Pewaris (Al-Mayyit)', arabName: 'المَيِّت' },
}

function getHeirLabel(key: string): { idName: string; arabName: string } {
  const cleanKey = key.trim().toLowerCase()
  if (HEIR_ARABIC_LOOKUP[cleanKey]) {
    return HEIR_ARABIC_LOOKUP[cleanKey]
  }
  if (cleanKey.includes("ashabah ma'al ghair") || cleanKey.includes('ashabah maal ghair')) {
    return {
      idName: "Saudari Kandung (Sebagai Ashabah Ma'al Ghair)",
      arabName: 'الأُخْت الشَّقِيقَة (عَصَبَة مَعَ الغَيْر)',
    }
  }
  if (cleanKey.includes('2+ anak perempuan') || cleanKey.includes('2+ anak')) {
    return {
      idName: '2 Orang atau Lebih Anak Perempuan',
      arabName: 'بِنْتَانِ فَأَكْثَرَ',
    }
  }
  if (cleanKey.includes('2+ saudari kandung') || cleanKey.includes('2+ saudari')) {
    return {
      idName: '2 Orang atau Lebih Saudari Kandung',
      arabName: 'أُخْتَانِ شَقِيقَتَانِ فَأَكْثَرَ',
    }
  }
  return {
    idName: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    arabName: '',
  }
}

export function PohonWarisanDetailModal({ node, onClose, jenazahGender }: DetailModalProps) {
  if (!node) return null

  // Customise label for pasangan & mayyit based on jenazahGender
  const isPasangan = node.id === 'pasangan'
  const isFocal = node.id === 'mayyit'

  const displayArab = isPasangan
    ? jenazahGender === 'L' ? 'الزَّوْجَة' : 'الزَّوْج'
    : node.nama_arab

  const displayLatin = isPasangan
    ? jenazahGender === 'L' ? 'Az-Zaujah' : 'Az-Zauj'
    : node.nama_latin

  const displayId = isPasangan
    ? jenazahGender === 'L' ? 'Istri (Pasangan Jenazah Laki-laki)' : 'Suami (Pasangan Jenazah Perempuan)'
    : isFocal
    ? jenazahGender === 'L' ? 'Mayyit (Pewaris Laki-laki)' : 'Mayyitah (Pewaris Perempuan)'
    : node.nama_id

  const displayEmoji = isPasangan
    ? jenazahGender === 'L' ? '👰' : '🤵'
    : isFocal
    ? jenazahGender === 'L' ? '👨‍🎓' : '👩‍🎓'
    : node.emoji

  const nodeGender = isPasangan
    ? jenazahGender === 'L' ? 'P' : 'L'
    : isFocal
    ? jenazahGender
    : node.jenis_kelamin

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50/70 via-white to-slate-50 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4">
            {/* Visual Character Avatar + Gender Badge */}
            <div className="flex flex-col items-center justify-center flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-white border-2 border-emerald-200/80 shadow-sm flex items-center justify-center text-4xl mb-1.5">
                <span className="select-none leading-none">{displayEmoji}</span>
              </div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                nodeGender === 'L'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                <span>{nodeGender === 'L' ? '♂ Laki-laki' : '♀ Perempuan'}</span>
              </span>
            </div>

            <div className="flex-1 pr-6">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {node.kategori_label}
                </span>
                {node.tidak_pernah_gugur ? (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-600" />
                    6 Tak Pernah Gugur
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    Bisa Terhijab (Gugur)
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold font-arabic text-emerald-950 leading-relaxed" dir="rtl">
                {displayArab}
              </h2>
              <div className="flex items-center gap-2 text-slate-600 text-sm mt-0.5">
                <span className="font-bold text-slate-900">{displayId}</span>
                <span className="text-xs text-slate-400 font-medium">({displayLatin})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          
          {/* Maklumat / Ringkasan Edukasi Kitab */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-3">
            <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900 mb-1">Maklumat Kitab Faraidh KMI</h4>
              <p className="text-xs leading-relaxed text-emerald-950 font-medium">
                {node.maklumat_edukasi}
              </p>
            </div>
          </div>

          {/* Bagian 1: Porsi & Syarat Pembagian Waris */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-4 h-4 text-emerald-700" />
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                1. Ketentuan Porsi Syar&apos;i (الفروض والشروط)
              </h3>
            </div>

            <div className="space-y-2.5">
              {node.syarat_porsi.map((s, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition-colors">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="font-bold text-xs text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      Porsi: {s.porsi}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Syarat #{idx + 1}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 leading-snug mt-1.5">{s.syarat}</p>
                  {s.penjelasan && (
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{s.penjelasan}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bagian 2: Ashabah Info jika ada */}
          {node.ashabah_info && (
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wide mb-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Status Ashabah (العصبة): {node.ashabah_info.label}
              </div>
              <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                {node.ashabah_info.penjelasan}
              </p>
            </div>
          )}

          {/* Bagian 3: Relasi Hijab Hirman (Penghalang & Terhalang dengan Bahasa Arab) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dihijab oleh */}
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80">
              <div className="flex items-center justify-between text-rose-900 font-bold text-xs uppercase tracking-wide mb-2.5">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Dihijab (Gugur) Oleh</span>
                </div>
                <span className="font-arabic font-bold text-rose-800 text-xs" dir="rtl">المَحْجُوب بِـ</span>
              </div>
              {node.dihijab_oleh.length === 0 ? (
                <div className="p-3 rounded-xl bg-white/90 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Tidak pernah dihijab oleh siapapun (6 Golongan Utama).</span>
                </div>
              ) : (
                <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {node.dihijab_oleh.map((d, i) => {
                    const item = getHeirLabel(d)
                    return (
                      <li key={i} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/90 border border-rose-100 shadow-2xs text-xs">
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          {item.idName}
                        </span>
                        {item.arabName && (
                          <span className="font-arabic font-bold text-rose-800 text-xs" dir="rtl">
                            {item.arabName}
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Menghijab siapa */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80">
              <div className="flex items-center justify-between text-blue-900 font-bold text-xs uppercase tracking-wide mb-2.5">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Dapat Menghijab</span>
                </div>
                <span className="font-arabic font-bold text-blue-800 text-xs" dir="rtl">الحَاجِب لِـ</span>
              </div>
              {node.menghijab_siapa.length === 0 ? (
                <div className="p-3 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-500 italic">
                  Tidak menggugurkan ahli waris lain secara total.
                </div>
              ) : (
                <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {node.menghijab_siapa.map((m, i) => {
                    const item = getHeirLabel(m)
                    return (
                      <li key={i} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/90 border border-blue-100 shadow-2xs text-xs">
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {item.idName}
                        </span>
                        {item.arabName && (
                          <span className="font-arabic font-bold text-blue-800 text-xs" dir="rtl">
                            {item.arabName}
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Bagian 4: Dalil Al-Quran / Hadits */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
            <div className="flex items-center justify-between text-emerald-400 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Dalil Syar&apos;i</span>
              </div>
              <span className="text-[11px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                {node.dalil_sumber}
              </span>
            </div>
            <p className="text-right font-arabic text-lg sm:text-xl text-emerald-200 leading-loose pt-1" dir="rtl">
              {node.dalil_arab}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed italic border-t border-slate-800 pt-2">
              &ldquo;{node.dalil_arti}&rdquo;
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-xs font-bold transition-all"
          >
            Tutup
          </button>

          <Link
            href="/kalkulator"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Simulasikan di Kalkulator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
