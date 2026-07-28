'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { GreekKeyboardToggle, GreekKeyboard } from './GreekKeyboard'

interface SearchBarProps {
  query: string
  onChange: (value: string) => void
  isLoading: boolean
}

export function SearchBar({ query, onChange, isLoading }: SearchBarProps) {
  const [showKeyboard, setShowKeyboard] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showKeyboard && inputRef.current) {
      inputRef.current.blur()
    }
  }, [showKeyboard])

  const handleGreekInsert = useCallback((char: string) => {
    onChange(query + char)
  }, [query, onChange])

  const handleGreekBackspace = useCallback(() => {
    if (query.length > 0) {
      onChange(query.slice(0, -1))
    }
  }, [query, onChange])

  const handleCloseKeyboard = useCallback(() => {
    setShowKeyboard(false)
  }, [])

  const handleClear = useCallback(() => {
    onChange('')
    if (!showKeyboard) {
      inputRef.current?.focus()
    }
  }, [onChange, showKeyboard])

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
          onFocus={() => {
            if (showKeyboard) {
              inputRef.current?.blur()
            }
          }}
          placeholder={showKeyboard
            ? "Tap Greek letters below..."
            : "Type transliteration (e.g., agape, logos, theos, hoti)..."
          }
          inputMode={showKeyboard ? 'none' : undefined}
          readOnly={showKeyboard}
          className="w-full pl-12 pr-28 py-4 text-lg rounded-xl border border-stone-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow placeholder:text-stone-400"
          style={isGreekInput ? { fontFamily: "'Noto Serif', serif" } : undefined}
          autoFocus={!showKeyboard}
          autoComplete="off"
          spellCheck={false}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
          {isLoading && (
            <div className="h-5 w-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          )}
          {query && !isLoading && (
            <button
              onClick={handleClear}
              className="p-1.5 rounded-full hover:bg-stone-100 active:bg-stone-200 transition-colors"
              title="Clear search"
              type="button"
            >
              <svg className="h-5 w-5 text-stone-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </button>
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
