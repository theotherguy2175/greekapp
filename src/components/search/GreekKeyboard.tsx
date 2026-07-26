'use client'

import { useEffect, useRef } from 'react'

interface GreekKeyboardProps {
  onInsert: (char: string) => void
  onBackspace: () => void
  isOpen: boolean
  onClose: () => void
}

const ROWS = [
  [
    { greek: 'ς', label: 'ς' },
    { greek: 'ε', label: 'ε' },
    { greek: 'ρ', label: 'ρ' },
    { greek: 'τ', label: 'τ' },
    { greek: 'υ', label: 'υ' },
    { greek: 'θ', label: 'θ' },
    { greek: 'ι', label: 'ι' },
    { greek: 'ο', label: 'ο' },
    { greek: 'π', label: 'π' },
  ],
  [
    { greek: 'α', label: 'α' },
    { greek: 'σ', label: 'σ' },
    { greek: 'δ', label: 'δ' },
    { greek: 'φ', label: 'φ' },
    { greek: 'γ', label: 'γ' },
    { greek: 'η', label: 'η' },
    { greek: 'ξ', label: 'ξ' },
    { greek: 'κ', label: 'κ' },
    { greek: 'λ', label: 'λ' },
  ],
  [
    { greek: 'ζ', label: 'ζ' },
    { greek: 'χ', label: 'χ' },
    { greek: 'ψ', label: 'ψ' },
    { greek: 'ω', label: 'ω' },
    { greek: 'β', label: 'β' },
    { greek: 'ν', label: 'ν' },
    { greek: 'μ', label: 'μ' },
  ],
]

const LABELS: Record<string, string> = {
  'ο': 'omicron (short o)',
  'ω': 'omega (long o)',
  'ε': 'epsilon (short e)',
  'η': 'eta (long e)',
  'σ': 'sigma (mid-word)',
  'ς': 'final sigma',
}

export function GreekKeyboardToggle({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isOpen
          ? 'bg-amber-700 text-white'
          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
      }`}
      title="Toggle Greek keyboard"
      type="button"
    >
      <span style={{ fontFamily: "'Noto Serif', serif" }}>αβγ</span>
    </button>
  )
}

export function GreekKeyboard({ onInsert, onBackspace, isOpen, onClose }: GreekKeyboardProps) {
  const keyboardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(e: MouseEvent | TouchEvent) {
      const target = e.target as HTMLElement
      if (
        keyboardRef.current &&
        !keyboardRef.current.contains(target) &&
        !target.closest('[data-greek-toggle]')
      ) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      const activeEl = document.activeElement as HTMLElement
      if (activeEl?.tagName === 'INPUT') {
        activeEl.setAttribute('inputmode', 'none')
      }
    } else {
      const input = document.querySelector('input[inputmode="none"]') as HTMLElement
      if (input) {
        input.removeAttribute('inputmode')
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={keyboardRef}
      className="fixed bottom-0 left-0 right-0 z-50 bg-stone-100 border-t border-stone-300 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-lg mx-auto px-2 pt-2 pb-2">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-xs text-stone-500 font-medium">Greek Keyboard</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-400">
              ο = omicron · ω = omega
            </span>
            <button
              onClick={onClose}
              className="text-xs text-stone-500 hover:text-stone-700 font-medium px-2 py-1 rounded hover:bg-stone-200 transition-colors"
              type="button"
            >
              Done
            </button>
          </div>
        </div>

        <div className="space-y-1">
          {ROWS.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-[3px]">
              {row.map(key => (
                <button
                  key={key.greek + ri}
                  onClick={() => onInsert(key.greek)}
                  className="flex-1 max-w-[42px] h-11 rounded-lg bg-white border border-stone-200 shadow-sm hover:bg-amber-50 active:bg-amber-100 active:scale-95 transition-all text-lg"
                  style={{ fontFamily: "'Noto Serif', serif" }}
                  title={LABELS[key.greek] || key.greek}
                  type="button"
                >
                  {key.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-[3px] mt-1">
          <button
            onClick={() => onInsert(' ')}
            className="h-11 flex-[3] rounded-lg bg-white border border-stone-200 shadow-sm hover:bg-stone-50 active:bg-stone-100 active:scale-[0.98] transition-all text-xs text-stone-500"
            type="button"
          >
            space
          </button>
          <button
            onClick={onBackspace}
            className="h-11 flex-[1.5] rounded-lg bg-white border border-stone-200 shadow-sm hover:bg-red-50 active:bg-red-100 active:scale-95 transition-all text-sm text-stone-500"
            type="button"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  )
}
