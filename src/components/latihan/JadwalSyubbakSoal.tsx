'use client'

import React, { useState, useEffect } from 'react'
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Scale,
  Sparkles,
  ChevronDown,
  Coins,
} from 'lucide-react'
import type { SyubbakKunci, JawabanSyubbakSantri } from '@/lib/faraidh/types'

interface JadwalSyubbakSoalProps {
  kunci: SyubbakKunci
  value?: JawabanSyubbakSantri | Record<string, string>
  onChange?: (val: JawabanSyubbakSantri) => void
  readonly?: boolean
  showCorrection?: boolean
}

const PORSI_OPTIONS = [
  { val: '1/2', arab: 'النصف (١/٢)', badge: '1/2' },
  { val: '1/4', arab: 'الربع (١/٤)', badge: '1/4' },
  { val: '1/8', arab: 'الثمن (١/٨)', badge: '1/8' },
  { val: '2/3', arab: 'الثلثان (٢/٣)', badge: '2/3' },
  { val: '1/3', arab: 'الثلث (١/٣)', badge: '1/3' },
  { val: '1/6', arab: 'السدس (١/٦)', badge: '1/6' },
  { val: 'ع', arab: 'عصبة (ع)', badge: 'ع' },
  { val: '1/3_sisa', arab: 'ثلث الباقي (١/٣ بق)', badge: '1/3 Sisa' },
  { val: '1/6+ع', arab: 'السدس + عصبة (١/٦+ع)', badge: '1/6+ع' },
  { val: 'mahjub', arab: 'محجوب (م)', badge: 'م' },
]

export function JadwalSyubbakSoal({
  kunci,
  value,
  onChange,
  readonly = false,
  showCorrection = false,
}: JadwalSyubbakSoalProps) {
  const hasHarta = Boolean(kunci.total_harta && kunci.total_harta > 0)

  // Parse value if provided as raw record or object
  const getInitialState = (): JawabanSyubbakSantri => {
    if (!value) {
      return {
        asal_masalah_pokok: '',
        asal_masalah_akhir: '',
        baris: kunci.baris.map(b => ({ kode: b.kode, porsi: '', saham: '', nominal: '' })),
      }
    }
    if ('baris' in value && Array.isArray(value.baris)) {
      return value as JawabanSyubbakSantri
    }
    // Fallback if it was saved as flat record
    const flat = value as Record<string, string>
    return {
      asal_masalah_pokok: flat['asal_masalah_pokok'] || '',
      asal_masalah_akhir: flat['asal_masalah_akhir'] || '',
      baris: kunci.baris.map((b, idx) => ({
        kode: b.kode,
        porsi: flat[`${idx}_porsi`] || flat[`${b.kode}_porsi`] || '',
        saham: flat[`${idx}_saham`] || flat[`${b.kode}_saham`] || '',
        nominal: flat[`${idx}_nominal`] || flat[`${b.kode}_nominal`] || '',
      })),
    }
  }

  const [state, setState] = useState<JawabanSyubbakSantri>(getInitialState)

  useEffect(() => {
    setState(getInitialState())
  }, [value, kunci])

  const updateAsalPokok = (val: string) => {
    if (readonly) return
    const newState = { ...state, asal_masalah_pokok: val }
    setState(newState)
    onChange?.(newState)
  }

  const updateAsalAkhir = (val: string) => {
    if (readonly) return
    const newState = { ...state, asal_masalah_akhir: val }
    setState(newState)
    onChange?.(newState)
  }

  const updateRowPorsi = (kode: string, porsi: string) => {
    if (readonly) return
    const newBaris = state.baris.map(b => (b.kode === kode ? { ...b, porsi } : b))
    if (!newBaris.some(b => b.kode === kode)) {
      newBaris.push({ kode, porsi, saham: '', nominal: '' })
    }
    const newState = { ...state, baris: newBaris }
    setState(newState)
    onChange?.(newState)
  }

  const updateRowSaham = (kode: string, saham: string) => {
    if (readonly) return
    const newBaris = state.baris.map(b => (b.kode === kode ? { ...b, saham } : b))
    if (!newBaris.some(b => b.kode === kode)) {
      newBaris.push({ kode, porsi: '', saham, nominal: '' })
    }
    const newState = { ...state, baris: newBaris }
    setState(newState)
    onChange?.(newState)
  }

  const updateRowNominal = (kode: string, rawVal: string) => {
    if (readonly) return
    const numOnly = rawVal.replace(/[^0-9]/g, '')
    const formatted = numOnly ? Number(numOnly).toLocaleString('id-ID') : ''
    const newBaris = state.baris.map(b => (b.kode === kode ? { ...b, nominal: formatted } : b))
    if (!newBaris.some(b => b.kode === kode)) {
      newBaris.push({ kode, porsi: '', saham: '', nominal: formatted })
    }
    const newState = { ...state, baris: newBaris }
    setState(newState)
    onChange?.(newState)
  }

  const isAulOrTashih = kunci.asal_masalah_akhir && kunci.asal_masalah_akhir !== kunci.asal_masalah_pokok

  // Check correctness helper
  const isPokokBenar = String(state.asal_masalah_pokok).trim() === String(kunci.asal_masalah_pokok)
  const isAkhirBenar = isAulOrTashih
    ? String(state.asal_masalah_akhir).trim() === String(kunci.asal_masalah_akhir)
    : true

  return (
    <div className="w-full max-w-2xl mx-auto my-4 select-none">
      <div className="bg-gradient-to-b from-emerald-50/70 to-slate-50 border-2 border-emerald-700/70 rounded-2xl p-4 sm:p-6 shadow-md space-y-4">
        
        {/* Top Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-emerald-950">
                  Jadwal Syubbak (جدول الشباك)
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Format Resmi KMI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {hasHarta
                  ? `Selesaikan hisab porsi, asal masalah, saham, dan pembagian tirkah (Rp ${kunci.total_harta?.toLocaleString('id-ID')})`
                  : 'Selesaikan hisab porsi syar\'i, asal masalah, dan pembagian saham.'}
              </p>
            </div>
          </div>

          {hasHarta && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 self-start sm:self-auto">
              <Coins className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-amber-700 block leading-tight">Total Tirkah</span>
                <span className="text-xs font-extrabold font-mono text-slate-900">
                  Rp {kunci.total_harta?.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ═══ THE CLASSICAL TABLE GRID ═══ */}
        <div className="border-2 border-emerald-900 rounded-xl overflow-hidden bg-white shadow-sm">
          
          {/* ─── HEADER ROW: ASAL MASALAH ─── */}
          <div className="grid grid-cols-12 border-b-2 border-emerald-900 bg-emerald-100/80 font-bold items-center">
            
            {/* Left box: Asal Masalah Inputs */}
            <div className={`${hasHarta ? 'col-span-8' : 'col-span-8'} p-3 border-r-2 border-emerald-900 bg-emerald-50/90 flex items-center justify-center gap-2 sm:gap-3 flex-wrap`}>
              <span className="text-arabic text-sm sm:text-base font-extrabold text-emerald-950">
                أصل المسألة :
              </span>
              
              {/* Input Asal Pokok */}
              <div className="relative">
                <input
                  type="number"
                  disabled={readonly}
                  value={state.asal_masalah_pokok || ''}
                  onChange={e => updateAsalPokok(e.target.value)}
                  placeholder="Pokok..."
                  className={`w-20 sm:w-24 text-center py-1.5 px-2 rounded-lg font-extrabold text-sm sm:text-base border-2 shadow-inner transition
                    ${showCorrection
                      ? isPokokBenar
                        ? 'border-emerald-500 bg-emerald-100 text-emerald-900 ring-2 ring-emerald-300'
                        : 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-300'
                      : 'border-emerald-600 bg-white text-emerald-950 focus:ring-2 focus:ring-emerald-500/30'
                    }`}
                />
                {showCorrection && !isPokokBenar && (
                  <span className="absolute -bottom-4 left-0 right-0 text-[10px] text-rose-600 font-extrabold text-center">
                    Kunci: {kunci.asal_masalah_pokok}
                  </span>
                )}
              </div>

              {/* If Aul or Tashih: show Arrow & Final Asal Masalah box */}
              {isAulOrTashih && (
                <>
                  <span className="text-emerald-900 font-extrabold text-base sm:text-lg">
                    {kunci.status_penyelesaian === 'aul' ? 'ع ↶' : '➔'}
                  </span>
                  <div className="relative">
                    <input
                      type="number"
                      disabled={readonly}
                      value={state.asal_masalah_akhir || ''}
                      onChange={e => updateAsalAkhir(e.target.value)}
                      placeholder={kunci.status_penyelesaian === 'aul' ? '\'Aul...' : 'Tashih...'}
                      className={`w-20 sm:w-24 text-center py-1.5 px-2 rounded-lg font-extrabold text-sm sm:text-base border-2 shadow-inner transition
                        ${showCorrection
                          ? isAkhirBenar
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-900 ring-2 ring-emerald-300'
                            : 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-300'
                          : 'border-amber-500 bg-amber-50 text-amber-950 focus:ring-2 focus:ring-amber-500/30'
                        }`}
                    />
                    {showCorrection && !isAkhirBenar && (
                      <span className="absolute -bottom-4 left-0 right-0 text-[10px] text-rose-600 font-extrabold text-center">
                        Kunci: {kunci.asal_masalah_akhir}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Right label / Empty top corner */}
            <div className={`${hasHarta ? 'col-span-4' : 'col-span-4'} p-3 text-center text-xs sm:text-sm text-emerald-950 font-extrabold tracking-wide`}>
              <span className="text-arabic text-sm sm:text-base block">الوارثون والوارثات</span>
              <span className="text-[10px] text-slate-500 font-semibold block sm:inline">(Ahli Waris)</span>
            </div>
          </div>

          {/* ─── COLUMN TITLES SUB-HEADER ─── */}
          <div className="grid grid-cols-12 border-b-2 border-emerald-900 bg-slate-100/90 text-[11px] font-extrabold text-slate-700 text-center uppercase tracking-wider">
            {hasHarta ? (
              <>
                <div className="col-span-4 p-2 border-r-2 border-emerald-900 flex flex-col justify-center">
                  <span className="text-arabic text-xs text-emerald-900 font-bold">التركة (روبية)</span>
                  <span>Nominal Hak (Rp)</span>
                </div>
                <div className="col-span-2 p-2 border-r-2 border-emerald-900 flex flex-col justify-center">
                  <span className="text-arabic text-xs text-emerald-900 font-bold">السهام</span>
                  <span>Saham</span>
                </div>
                <div className="col-span-3 p-2 border-r-2 border-emerald-900 flex flex-col justify-center">
                  <span className="text-arabic text-xs text-emerald-900 font-bold">الفروض</span>
                  <span>Porsi</span>
                </div>
                <div className="col-span-3 p-2 flex flex-col justify-center">
                  <span className="text-arabic text-xs text-emerald-900 font-bold">الوارث</span>
                  <span>Ahli Waris</span>
                </div>
              </>
            ) : (
              <>
                <div className="col-span-4 p-2 border-r-2 border-emerald-900 flex flex-col justify-center">
                  <span className="text-arabic text-xs text-emerald-900 font-bold">السهام</span>
                  <span>Saham</span>
                </div>
                <div className="col-span-4 p-2 border-r-2 border-emerald-900 flex flex-col justify-center">
                  <span className="text-arabic text-xs text-emerald-900 font-bold">الفروض المقدرة</span>
                  <span>Porsi Syar&apos;i</span>
                </div>
                <div className="col-span-4 p-2 flex flex-col justify-center">
                  <span className="text-arabic text-xs text-emerald-900 font-bold">الوارث</span>
                  <span>Ahli Waris</span>
                </div>
              </>
            )}
          </div>

          {/* ─── ROWS: AHLI WARIS ─── */}
          <div className="divide-y-2 divide-emerald-900">
            {kunci.baris.map((b) => {
              const rowVal = state.baris.find(r => r.kode === b.kode) || { porsi: '', saham: '', nominal: '' }
              
              const isPorsiMatch =
                rowVal.porsi.trim().toLowerCase() === b.porsi_benar.trim().toLowerCase() ||
                (b.porsi_benar === 'ع' && (rowVal.porsi === 'sisa' || rowVal.porsi === 'ashabah' || rowVal.porsi === 'ع')) ||
                (b.porsi_benar === '1/3_sisa' && (rowVal.porsi === '1/3_sisa' || rowVal.porsi.includes('sisa'))) ||
                ((b.porsi_benar === 'mahjub' || b.porsi_benar === 'م' || b.is_hijab) && (rowVal.porsi === 'mahjub' || rowVal.porsi === 'م' || rowVal.porsi === 'terhalang'))

              const isSahamMatch = String(rowVal.saham).trim() === String(b.saham_benar)

              // Nominal Match check
              let isNominalMatch = true
              if (hasHarta && b.nominal_benar !== undefined) {
                const numSantri = Number(String(rowVal.nominal || '').replace(/[^0-9]/g, ''))
                isNominalMatch = Math.abs(numSantri - (b.nominal_benar || 0)) <= 1000
              }

              return (
                <div key={b.kode} className="grid grid-cols-12 items-center text-center hover:bg-slate-50/50 transition">
                  
                  {/* Kolom 0 (Opsional): Nominal Hak (التركة) */}
                  {hasHarta && (
                    <div className="col-span-4 p-2.5 border-r-2 border-emerald-900 flex flex-col items-center justify-center">
                      <div className="relative w-full max-w-[140px]">
                        <div className="relative flex items-center">
                          <span className="absolute left-2 text-[10px] font-bold text-slate-400 pointer-events-none">Rp</span>
                          <input
                            type="text"
                            disabled={readonly}
                            value={rowVal.nominal || ''}
                            onChange={e => updateRowNominal(b.kode, e.target.value)}
                            placeholder="0"
                            className={`w-full text-right pl-7 pr-2 py-1.5 rounded-lg font-mono font-extrabold text-xs sm:text-sm border-2 transition
                              ${showCorrection
                                ? isNominalMatch
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                                  : 'border-rose-500 bg-rose-50 text-rose-950'
                                : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-600'
                              }`}
                          />
                        </div>
                        {showCorrection && !isNominalMatch && (
                          <span className="text-[10px] text-rose-600 font-extrabold block mt-0.5 truncate">
                            ✓ Rp {Number(b.nominal_benar || 0).toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Kolom 1: Saham (السهام) */}
                  <div className={`${hasHarta ? 'col-span-2' : 'col-span-4'} p-2.5 border-r-2 border-emerald-900 flex flex-col items-center justify-center`}>
                    <div className="relative w-full max-w-[90px]">
                      <input
                        type="number"
                        disabled={readonly}
                        value={rowVal.saham || ''}
                        onChange={e => updateRowSaham(b.kode, e.target.value)}
                        placeholder="Saham"
                        className={`w-full text-center py-1.5 px-2 rounded-lg font-extrabold text-sm sm:text-base border-2 transition
                          ${showCorrection
                            ? isSahamMatch
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                              : 'border-rose-500 bg-rose-50 text-rose-950'
                            : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-600'
                          }`}
                      />
                      {showCorrection && !isSahamMatch && (
                        <span className="text-[10px] text-rose-600 font-extrabold block mt-0.5">
                          ✓ {b.saham_benar}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Kolom 2: Porsi Syar'i (الفروض) */}
                  <div className={`${hasHarta ? 'col-span-3' : 'col-span-4'} p-2.5 border-r-2 border-emerald-900 flex flex-col items-center justify-center`}>
                    <div className="relative w-full max-w-[140px]">
                      <select
                        disabled={readonly}
                        value={rowVal.porsi || ''}
                        onChange={e => updateRowPorsi(b.kode, e.target.value)}
                        className={`w-full text-center py-1.5 pl-2 pr-6 rounded-lg font-bold text-xs sm:text-sm border-2 appearance-none cursor-pointer transition
                          ${showCorrection
                            ? isPorsiMatch
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                              : 'border-rose-500 bg-rose-50 text-rose-950'
                            : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-400'
                          }`}
                      >
                        <option value="">Pilih Porsi...</option>
                        {PORSI_OPTIONS.map(opt => (
                          <option key={opt.val} value={opt.val}>
                            {opt.arab}
                          </option>
                        ))}
                      </select>
                      {!readonly && (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      )}
                      {showCorrection && !isPorsiMatch && (
                        <span className="text-[10px] text-rose-600 font-extrabold block mt-0.5">
                          ✓ {b.porsi_arab || b.porsi_benar}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Kolom 3: Nama Ahli Waris (الوارث) */}
                  <div className={`${hasHarta ? 'col-span-3' : 'col-span-4'} p-2.5 flex flex-col items-center justify-center bg-slate-50/80`}>
                    <span className="text-arabic text-sm sm:text-base font-bold text-emerald-950 leading-tight">
                      {b.nama_arab || b.nama_id}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold mt-0.5">
                      {b.nama_id} {b.jumlah_orang > 1 ? `(${b.jumlah_orang})` : ''}
                    </span>
                  </div>

                </div>
              )
            })}
          </div>

        </div>

        {/* Petunjuk Bantuan Bawah */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 flex-wrap gap-2">
          <span>* Tentukan asal masalah pokok, porsi tiap ahli waris, lalu hitung sahamnya.</span>
          {showCorrection && (
            <span className="font-bold text-emerald-800">
              {isPokokBenar && isAkhirBenar ? '✓ Asal Masalah Sesuai' : 'Koreksi kembali KPK penyebut'}
            </span>
          )}
        </div>

      </div>
    </div>
  )
}
