'use client'

import React, { useState } from 'react'
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Scale,
  Users,
  History,
  Scroll,
  Lightbulb,
  CheckCircle2,
  Info
} from 'lucide-react'
import {
  type KasusKhususMaklumat,
  ENSIKLOPEDIA_KASUS_KHUSUS,
  ENSIKLOPEDIA_PENYESUAIAN
} from '@/data/kasus-khusus-data'

interface KasusKhususMaklumatCardProps {
  kasusKode?: string
  kasusMaklumat?: KasusKhususMaklumat
  penyesuaianJenis?: 'aul' | 'radd'
  defaultExpanded?: boolean
  className?: string
}

export function KasusKhususMaklumatCard({
  kasusKode,
  kasusMaklumat: customMaklumat,
  penyesuaianJenis,
  defaultExpanded = true,
  className = '',
}: KasusKhususMaklumatCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const maklumat = customMaklumat || (kasusKode ? ENSIKLOPEDIA_KASUS_KHUSUS[kasusKode] : undefined)
  const penyesuaian = penyesuaianJenis ? ENSIKLOPEDIA_PENYESUAIAN[penyesuaianJenis] : undefined

  if (!maklumat && !penyesuaian) return null

  // If it's a Special Case (Gharrawain, Musytarakah, Akdariyyah)
  if (maklumat) {
    return (
      <div
        className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
          maklumat.badge_color === 'amber'
            ? 'bg-gradient-to-b from-amber-50/90 to-amber-100/40 border-amber-300/80 shadow-xs'
            : maklumat.badge_color === 'indigo'
            ? 'bg-gradient-to-b from-indigo-50/90 to-indigo-100/40 border-indigo-300/80 shadow-xs'
            : maklumat.badge_color === 'purple'
            ? 'bg-gradient-to-b from-purple-50/90 to-purple-100/40 border-purple-300/80 shadow-xs'
            : 'bg-gradient-to-b from-blue-50/90 to-blue-100/40 border-blue-300/80 shadow-xs'
        } ${className}`}
      >
        {/* Header Toggle */}
        <button
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          className="w-full p-3.5 sm:p-4 text-left flex items-start justify-between gap-3 hover:bg-black/[0.02] transition-colors"
        >
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs ${
                maklumat.badge_color === 'amber'
                  ? 'bg-amber-500 text-white'
                  : maklumat.badge_color === 'indigo'
                  ? 'bg-indigo-600 text-white'
                  : maklumat.badge_color === 'purple'
                  ? 'bg-purple-600 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-extrabold uppercase tracking-wide bg-white/90 border border-slate-200 text-slate-700 shadow-2xs">
                  ⭐ Kasus Khusus Terdeteksi
                </span>
                <span className="text-xs font-bold text-slate-500">
                  • {maklumat.tokoh_sahabat.split(',')[0]}
                </span>
              </div>

              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 mt-1 leading-snug">
                {maklumat.nama_latin}
              </h4>

              <p className="text-xs sm:text-sm font-arabic text-amber-900/80 mt-0.5" dir="rtl">
                {maklumat.nama_arab}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-slate-500 pt-1 flex-shrink-0">
            <span className="hidden sm:inline">{isExpanded ? 'Tutup Maklumat' : 'Buka Maklumat Studi'}</span>
            <div className="p-1 rounded-lg bg-white/80 border border-slate-200">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </button>

        {/* Collapsible Content: Maklumat Studi Santri */}
        {isExpanded && (
          <div className="px-3.5 sm:px-4 pb-4 sm:pb-5 space-y-3.5 border-t border-slate-200/60 pt-3 text-xs sm:text-sm text-slate-700 animate-in fade-in-50 duration-200">
            
            {/* 1. Nama-Nama Populer & Tokoh Sahabat */}
            <div className="p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Nama Lain &amp; Sanad Fatwa Sahabat</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {maklumat.nama_populer.map((alias, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700"
                  >
                    {alias}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                <strong className="text-slate-700">Rujukan Sahabat:</strong> {maklumat.tokoh_sahabat}
              </p>
            </div>

            {/* 2. Sejarah & Asal-Usul */}
            <div className="p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                <History className="w-3.5 h-3.5 text-amber-600" />
                <span>Latar Belakang Sejarah &amp; Asal-Usul</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
                {maklumat.asal_usul_sejarah}
              </p>
            </div>

            {/* 3. Sebab & 'Illat Syar'i */}
            <div className="p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-indigo-900 text-xs">
                <Scale className="w-3.5 h-3.5 text-indigo-600" />
                <span>Sebab &amp; &apos;Illat Hukum (Hikmah Syar&apos;i)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
                {maklumat.illat_hukum}
              </p>
            </div>

            {/* 4. Kaidah Langkah Penyelesaian */}
            <div className="p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kaidah Langkah Penyelesaian Matematis &amp; Syar&apos;i</span>
              </div>
              <ul className="space-y-1 pt-1 text-xs sm:text-sm">
                {maklumat.kaidah_penyelesaian.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-slate-700">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 5. Dalil / Atsar Sahabat */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                <Scroll className="w-3.5 h-3.5 text-amber-700" />
                <span>Atsar Sahabat / Dalil Fikih</span>
              </div>
              <p
                className="text-sm sm:text-base font-arabic text-amber-950 font-medium leading-loose pt-1 text-right"
                dir="rtl"
              >
                {maklumat.atsar_arab}
              </p>
              <p className="text-xs text-amber-900/90 italic pt-1 leading-relaxed">
                &ldquo;{maklumat.atsar_arti}&rdquo;
              </p>
              <p className="text-[10px] text-amber-700 font-semibold text-right">
                — {maklumat.atsar_sumber}
              </p>
            </div>

            {/* 6. Faidah & Maklumat Edukasi Santri */}
            <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/60 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] sm:text-xs text-blue-900 leading-relaxed">
                <strong>Catatan Studi Santri:</strong> {maklumat.hikmah_edukasi}
              </p>
            </div>

          </div>
        )}
      </div>
    )
  }

  // If it's 'Aul or Radd adjustment
  if (penyesuaian) {
    return (
      <div className={`rounded-2xl border p-3.5 sm:p-4 bg-slate-50 border-slate-200 shadow-2xs space-y-2.5 ${className}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-slate-900">{penyesuaian.nama_latin}</h5>
              <p className="text-[11px] font-arabic text-slate-500" dir="rtl">{penyesuaian.nama_arab}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-700">
            Maklumat Kaidah
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {penyesuaian.latar_belakang}
        </p>

        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-700 space-y-1">
          <p><strong>Pencetus Ijtihad:</strong> {penyesuaian.tokoh_pencetus}</p>
          <p><strong>Kaidah Syar&apos;i:</strong> {penyesuaian.kaidah_syari}</p>
          <p className="text-slate-500 font-arabic pt-1" dir="rtl">{penyesuaian.atsar_dalil}</p>
        </div>
      </div>
    )
  }

  return null
}
