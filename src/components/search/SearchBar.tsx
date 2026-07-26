'use client'

import { useState, useRef, useCallback } from 'react'
import { GreekKeyboardToggle, GreekKeyboard } from './GreekKeyboard'

interface SearchBarProps {
  query: string
  onChange: (value: string) => void
  isLoading: boolean
}

export function SearchBar({ query, onChange, isLoading }: SearchBarProps) {
  const [showKeyboard, setShowKeyboard] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleGreekInsert = useCallback((char: string) => {
    onChange(query + char)
    inputRef.current?.focus()
  }, [query, onChange])

  const handleGreekBackspace = useCallback(() => {
    if (query.length > 0) {
      onChange(query.slice(0, -1))
    }
    inputRef.current?.focus()
  }, [query, onChange])

  const handleCloseKeyboard = useCallback(() => {
    setShowKeyboard(false)
    if (inputRef.current) {
      inputRef.current.removeAttribute('inputmode')
    }
  }, [])

  const isGreekInput = /[Ͱ-Ͽἀ-῿]/.test(query)

  return (
    <>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-stone-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => onChange(e.target.value)}
          placeholder={showKeyboard
            ? "Tap Greek letters below..."
            : "Type transliteration (e.g., agape, logos, theos, hoti)..."
          }
          className="w-full pl-12 pr-24 py-4 text-lg rounded-xl border border-stone-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow placeholder:text-stone-400"
          style={isGreekInput ? { fontFamily: "'Noto Serif', serif" } : undefined}
          autoFocus
          autoComplete="off"
          spellCheck={false}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
          {isLoading && (
            <div className="h-5 w-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          )}
          <div data-greek-toggle>
            <GreekKeyboardToggle
              isOpen={showKeyboard}
              onToggle={() => setShowKeyboard(!showKeyboard)}
            />
          </div>
        </div>
      </div>

      <GreekKeyboard
        onInsert={handleGreekInsert}
        onBackspace={handleGreekBackspace}
        isOpen={showKeyboard}
        onClose={handleCloseKeyboard}
      />

      {/* Spacer so content isn't hidden behind the fixed keyboard */}
      {showKeyboard && <div className="h-56" />}
    </>
  )
}
