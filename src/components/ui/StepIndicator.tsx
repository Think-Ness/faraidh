'use client'

import { Check, Coins, Users, Scale } from 'lucide-react'

interface Step {
  id: number
  label: string
  sublabel?: string
  arab?: string
}

interface StepIndicatorProps {
  steps: Step[]
  current: number
}

const STEP_ICONS = [Coins, Users, Scale]

export default function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="w-full max-w-xl mx-auto px-2">
      <div className="flex items-center justify-between relative">
        {/* Background Track Line */}
        <div className="absolute left-6 right-6 top-4 -translate-y-1/2 h-[2px] bg-slate-200 -z-0" />
        
        {/* Active Progress Line */}
        <div
          className="absolute left-6 top-4 -translate-y-1/2 h-[2px] bg-emerald-600 transition-all duration-300 -z-0"
          style={{
            width: current === 1 ? '0%' : current === 2 ? '50%' : 'calc(100% - 3rem)',
          }}
        />

        {steps.map((step, idx) => {
          const IconComp = STEP_ICONS[idx] || Coins
          const isDone = current > step.id
          const isActive = current === step.id

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              {/* Step Node */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200
                  ${isActive
                    ? 'bg-emerald-600 text-white shadow ring-4 ring-emerald-100 scale-105'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm'
                    : 'bg-white text-slate-400 border border-slate-200 shadow-sm'
                  }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <IconComp className="w-4 h-4" />
                )}
              </div>

              {/* Step Label */}
              <div className="text-center mt-2">
                <p
                  className={`text-[11px] sm:text-xs font-semibold leading-tight transition-colors
                    ${isActive ? 'text-emerald-700' : isDone ? 'text-slate-800' : 'text-slate-400'}`}
                >
                  {step.label}
                </p>
                {step.arab && (
                  <p className="text-arabic text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                    {step.arab}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

