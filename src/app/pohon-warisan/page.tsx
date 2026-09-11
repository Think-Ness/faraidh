'use client'

import React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Scale,
  Calculator,
  Trophy,
  BookOpen,
  GraduationCap,
  Sparkles,
  Layers,
} from 'lucide-react'
import { PohonWarisanCanvas } from '@/components/tree/PohonWarisanCanvas'

export default function PohonWarisanPage() {
  return (
    <div className="h-screen w-full flex flex-col bg-white text-slate-900 overflow-hidden">
      {/* ═══ TOP GLOBAL HEADER ══════════════════════════════════════ */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-40 px-4 py-2.5 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Back button & Title */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Scale className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight leading-none">
                  Kanvas Pohon Ahli Waris
                </h1>
                <span className="font-arabic text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  شجرة الورثة
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 hidden sm:inline">
                  Hal. 15 Kitab Faraidh KMI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-none mt-1 hidden sm:block">
                Eksplorasi interaktif silsilah 25 golongan ahli waris, porsi pasti, dan kaidah Hijab Hirman
              </p>
            </div>
          </div>

          {/* Nav Actions */}
          <nav className="flex items-center gap-2">
            <Link
              href="/latihan"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Latihan Soal</span>
            </Link>
            <Link
              href="/kalkulator"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Buka Kalkulator</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* ═══ FULL-PAGE CANVAS CONTAINER (ZERO PADDING / EDGE-TO-EDGE) ═════ */}
      <main className="flex-1 w-full h-full min-h-0 overflow-hidden flex flex-col">
        <PohonWarisanCanvas />
      </main>
    </div>
  )
}
