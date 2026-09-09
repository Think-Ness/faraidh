'use client'

import { useState, useEffect } from 'react'
import { Wallet, AlertCircle, Info, ArrowRight, Sparkles, Receipt, ShieldCheck, Scale, RotateCcw, User } from 'lucide-react'
import type { InputKasus } from '@/lib/faraidh/types'
import { validasiWasiat } from '@/lib/faraidh/math-utils'

interface StepTirkahProps {
  value: Omit<InputKasus, 'ahli_waris_list'>
  onChange: (val: Omit<InputKasus, 'ahli_waris_list'>) => void
  onNext: () => void
}

const formatRp = (n: number) =>
  n > 0 ? new Intl.NumberFormat('id-ID').format(n) : ''

interface CurrencyInputProps {
  id: string
  label: string
  labelArab?: string
  sublabel?: string
  value: number
  onChange: (v: number) => void
  placeholder?: string
}

function CurrencyInput({ id, label, labelArab, sublabel, value, onChange, placeholder }: CurrencyInputProps) {
  const [raw, setRaw] = useState(value > 0 ? formatRp(value) : '')

  useEffect(() => {
    setRaw(value > 0 ? formatRp(value) : '')
  }, [value])

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <label htmlFor={id} className="input-label mb-0 flex items-center gap-1.5">
          <span>{label}</span>
          {sublabel && <span className="text-slate-400 normal-case tracking-normal text-[11px]">({sublabel})</span>}
        </label>
        {labelArab && (
          <span className="text-arabic text-xs text-emerald-800 font-bold">{labelArab}</span>
        )}
      </div>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
          <span className="text-slate-400 text-xs font-bold tracking-wider">Rp</span>
        </div>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          className="input-field pl-11 tabular-nums font-mono text-sm sm:text-base tracking-wide"
          value={raw}
          placeholder={placeholder || '0'}
          onChange={e => {
            const val = e.target.value.replace(/[^\d]/g, '')
            const num = parseFloat(val) || 0
            setRaw(val ? new Intl.NumberFormat('id-ID').format(num) : '')
            onChange(num)
          }}
        />
      </div>
    </div>
  )
}

const QUICK_AMOUNTS = [
  { label: '+10 Jt', value: 10_000_000 },
  { label: '+50 Jt', value: 50_000_000 },
  { label: '+100 Jt', value: 100_000_000 },
  { label: '+500 Jt', value: 500_000_000 },
  { label: '+1 M', value: 1_000_000_000 },
]

export default function StepTirkah({ value, onChange, onNext }: StepTirkahProps) {
  const update = (key: keyof typeof value, v: number | string) =>
    onChange({ ...value, [key]: v })

  const validasiW = validasiWasiat(
    value.harta_kotor,
    value.biaya_tajhiz,
    value.hutang_terikat,
    value.hutang_biasa,
    value.wasiat
  )

  const total_pengurangan =
    value.biaya_tajhiz + value.hutang_terikat + value.hutang_biasa + (validasiW.valid ? value.wasiat : validasiW.maks_wasiat)
  
  const wasiat_efektif = validasiW.valid ? value.wasiat : validasiW.maks_wasiat
  const harta_bersih = Math.max(
    0,
    value.harta_kotor - value.biaya_tajhiz - value.hutang_terikat - value.hutang_biasa - wasiat_efektif
  )

  const canProceed = value.harta_kotor > 0

  const handleQuickAdd = (amount: number) => {
    update('harta_kotor', value.harta_kotor + amount)
  }

  const handleResetHarta = () => {
    update('harta_kotor', 0)
  }

  // Percentage of clean estate vs deductions
  const pctBersih = value.harta_kotor > 0 ? Math.max(0, Math.min(100, (harta_bersih / value.harta_kotor) * 100)) : 100
  const pctPengurang = 100 - pctBersih

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card-highlight flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0 text-emerald-800 shadow-sm">
          <Wallet className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              Tirkah — Harta Peninggalan
            </h2>
            <span className="text-arabic text-sm text-emerald-800 font-bold">التركة والتصفيات الشرعية</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            Hitung total harta kotor pewaris dan selesaikan seluruh hak-hak syar'i sebelum warisan dibagikan kepada ahli waris.
          </p>
        </div>
      </div>

      {/* Nama Pewaris (Opsional) */}
      <div className="card">
        <div className="flex items-center justify-between gap-2 mb-2">
          <label htmlFor="nama-pewaris" className="input-label mb-0 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Nama Pewaris / Keterangan</span>
            <span className="text-slate-400 normal-case tracking-normal text-[11px]">(opsional)</span>
          </label>
          <span className="text-arabic text-xs text-slate-500 font-bold">اسم المورّث</span>
        </div>
        <input
          id="nama-pewaris"
          type="text"
          className="input-field"
          placeholder="Contoh: Almarhum Fulan bin Fulan"
          value={value.nama_pewaris || ''}
          onChange={e => update('nama_pewaris', e.target.value)}
        />
      </div>

      {/* Total Harta Kotor */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-sm sm:text-base text-slate-900">1. Total Harta Kotor</span>
              <p className="text-xs text-slate-500">Seluruh aset peninggalan sebelum dipotong apapun</p>
            </div>
          </div>
          <span className="text-arabic text-xs sm:text-sm text-emerald-800 font-bold">مجموع التركة</span>
        </div>

        <CurrencyInput
          id="harta-kotor"
          label="Jumlah Nominal Harta"
          labelArab="قيمة التركة الإجمالية"
          sublabel="uang tunai, tabungan, properti, emas, dll"
          value={value.harta_kotor}
          onChange={v => update('harta_kotor', v)}
          placeholder="Contoh: 500.000.000"
        />

        {/* Quick Add Chips */}
        <div className="pt-1">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Pilih Cepat / Tambah Nominal:</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {QUICK_AMOUNTS.map(chip => (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleQuickAdd(chip.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 hover:text-emerald-700 text-xs font-mono font-medium transition-all shadow-sm"
              >
                {chip.label}
              </button>
            ))}
            {value.harta_kotor > 0 && (
              <button
                type="button"
                onClick={handleResetHarta}
                className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-1 transition-all ml-auto shadow-sm"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pengurang Syar'i (Hak-hak atas Tirkah) */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-sm sm:text-base text-slate-900">2. Pengurang Syar'i (Hak Tirkah)</span>
              <p className="text-xs text-slate-500">Urutan prioritas: Tajhiz → Hutang Terikat → Hutang Biasa → Wasiat</p>
            </div>
          </div>
          <span className="text-arabic text-xs sm:text-sm text-amber-800 font-bold">الحقوق المتعلقة بالتركة</span>
        </div>

        <div className="grid grid-cols-1 gap-4 pt-1">
          <CurrencyInput
            id="tajhiz"
            label="1. Biaya Tajhiz Jenazah"
            labelArab="مؤن التجهيز"
            sublabel="kain kafan, pemakaman, pemandian yang wajar"
            value={value.biaya_tajhiz}
            onChange={v => update('biaya_tajhiz', v)}
          />

          <CurrencyInput
            id="hutang-terikat"
            label="2. Hutang Terikat Aset"
            labelArab="الديون العينية"
            sublabel="zakat terutang, barang gadai / marhun"
            value={value.hutang_terikat}
            onChange={v => update('hutang_terikat', v)}
          />

          <CurrencyInput
            id="hutang-biasa"
            label="3. Hutang Biasa (Dzimmiah)"
            labelArab="الديون المرسلة"
            sublabel="pinjaman bank, hutang pribadi kepada pihak lain"
            value={value.hutang_biasa}
            onChange={v => update('hutang_biasa', v)}
          />

          <div>
            <CurrencyInput
              id="wasiat"
              label="4. Wasiat Pewaris"
              labelArab="الوصية الشرعية"
              sublabel={`maks 1/3 sisa setelah tajhiz & hutang (maks Rp${validasiW.maks_wasiat.toLocaleString('id-ID')})`}
              value={value.wasiat}
              onChange={v => update('wasiat', v)}
            />
            {!validasiW.valid && (
              <div className="mt-2.5 flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Batasan Syar'i:</strong> Wasiat melebihi batas 1/3 sisa tirkah. Sistem secara otomatis membatasi wasiat yang dieksekusi menjadi <strong>Rp{validasiW.maks_wasiat.toLocaleString('id-ID')}</strong> sesuai kaidah Faraidh.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ringkasan Tirkah Khalishah (Live Calculation) */}
      <div className="card-highlight space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-slate-900 text-sm sm:text-base">Kalkulasi Tirkah Bersih</span>
          </div>
          <span className="text-arabic text-xs text-emerald-800 font-bold">صافي التركة للإرث</span>
        </div>

        {/* Visual progress bar */}
        {value.harta_kotor > 0 && (
          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-medium">
              <span>Harta Bersih: {pctBersih.toFixed(1)}%</span>
              <span>Pengurang: {pctPengurang.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden flex">
              <div
                className="bg-emerald-600 transition-all duration-300 h-full"
                style={{ width: `${pctBersih}%` }}
              />
              <div
                className="bg-rose-500 transition-all duration-300 h-full"
                style={{ width: `${pctPengurang}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-600">Total Harta Kotor</span>
            <span className="tabular-nums font-mono text-slate-900 font-medium">Rp {value.harta_kotor.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between items-center py-1 text-rose-600">
            <span>(−) Total Pengurang Hak Syar'i</span>
            <span className="tabular-nums font-mono font-medium">Rp {total_pengurangan.toLocaleString('id-ID')}</span>
          </div>
          <div className="border-t border-emerald-200 pt-2.5 flex justify-between items-baseline font-bold">
            <div className="flex flex-col">
              <span className="text-emerald-900 text-sm sm:text-base">= Harta Bersih Siap Waris</span>
              <span className="text-arabic text-xs text-emerald-800 font-normal">التركة الخالصة للورثة</span>
            </div>
            <span className="tabular-nums font-mono text-emerald-700 text-base sm:text-xl tracking-tight">
              Rp {harta_bersih.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onNext}
        disabled={!canProceed}
        className="btn-primary w-full py-3.5 sm:py-4 text-sm sm:text-base font-semibold"
        id="step-tirkah-next"
      >
        <span>Lanjut ke Pemilihan Ahli Waris</span>
        <ArrowRight className="w-4 h-4 ml-1" />
      </button>

      {!canProceed && (
        <p className="text-center text-xs text-slate-500">Silakan masukkan jumlah Total Harta Kotor untuk melanjutkan.</p>
      )}
    </div>
  )
}


