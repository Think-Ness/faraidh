'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Coins,
  ShieldAlert,
  Sparkles,
  UserMinus,
  TrendingDown,
  Scale,
  Hash,
  SlidersHorizontal,
  Wrench,
  Banknote,
  BookOpenCheck,
  CheckCircle2
} from 'lucide-react'
import type { LogEdukasi } from '@/lib/faraidh/types'

const FASE_ICONS: Record<number, { icon: typeof Coins; color: string; bg: string; border: string }> = {
  0: { icon: Coins, color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
  1: { icon: ShieldAlert, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  2: { icon: Sparkles, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  3: { icon: UserMinus, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  4: { icon: TrendingDown, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  5: { icon: Scale, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  6: { icon: Hash, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  7: { icon: SlidersHorizontal, color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
  8: { icon: Wrench, color: 'text-pink-700', bg: 'bg-pink-50', border: 'border-pink-200' },
  9: { icon: Banknote, color: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-200' },
}

interface LogCardProps {
  log: LogEdukasi
  defaultOpen?: boolean
}

export function LogCard({ log, defaultOpen = false }: LogCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  const cfg = FASE_ICONS[log.fase] || FASE_ICONS[0]
  const IconComponent = cfg.icon

  return (
    <div className={`log-card border ${cfg.border} shadow-sm`}>
      <button
        className="log-header w-full"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        id={`log-fase-${log.fase}`}
      >
        <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border ${cfg.bg} ${cfg.border} ${cfg.color} shadow-sm`}>
          <IconComponent className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
              Fase {log.fase}
            </span>
            <h3 className="font-semibold text-slate-900 text-sm leading-snug">{log.judul}</h3>
          </div>
          {log.judul_arab && (
            <p className="text-arabic text-sm text-emerald-800 mt-0.5 font-bold">{log.judul_arab}</p>
          )}
        </div>
        <div className={`flex-shrink-0 w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center transition-transform duration-150 ${open ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </div>
      </button>

      {open && (
        <div className="log-body pt-3.5">
          <p className="text-sm text-slate-700 leading-relaxed mb-3">{log.penjelasan}</p>
          {log.detail && log.detail.length > 0 && (
            <div className="space-y-1.5 p-3 rounded-lg bg-white border border-slate-200 shadow-sm">
              {log.detail.map((d, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                  <span className="leading-normal">{d}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface LogEdukasiPanelProps {
  logs: LogEdukasi[]
}

export default function LogEdukasiPanel({ logs }: LogEdukasiPanelProps) {
  const [expandAll, setExpandAll] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm">
            <BookOpenCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="section-title text-sm sm:text-base">
              Rincian Langkah demi Langkah
              <span className="text-arabic text-xs text-emerald-800 font-bold mr-1">الخطوات الفقهية</span>
            </h2>
            <p className="section-subtitle text-xs">Penjabaran 9 fase kaidah Faraidh secara runtut dan transparan</p>
          </div>
        </div>
        <button
          onClick={() => setExpandAll(e => !e)}
          className="btn-ghost text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-sm"
          id="toggle-all-logs"
        >
          {expandAll ? (
            <><ChevronUp className="w-3.5 h-3.5" /> Tutup Semua</>
          ) : (
            <><ChevronDown className="w-3.5 h-3.5" /> Buka Semua</>
          )}
        </button>
      </div>

      <div className="space-y-2.5">
        {logs.map(log => (
          <LogCard key={log.fase} log={log} defaultOpen={expandAll || log.fase === 9} />
        ))}
      </div>
    </div>
  )
}


