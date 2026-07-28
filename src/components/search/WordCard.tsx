'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { LexiconEntry } from '@/types/lexicon'

interface WordCardProps {
  entry: LexiconEntry
  matchType: 'exact' | 'prefix' | 'fuzzy'
  isBookmarked: boolean
  onToggleBookmark: () => void
}

export function WordCard({ entry, matchType, isBookmarked, onToggleBookmark }: WordCardProps) {
  const { data: session } = useSession()
  const [expanded, setExpanded] = useState(false)
  const [bookmarking, setBookmarking] = useState(false)

  const handleBookmark = async () => {
    setBookmarking(true)
    try {
      await onToggleBookmark()
    } finally {
      setBookmarking(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Top: transliteration + quick English */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-2xl font-bold text-stone-800">
              {entry.transliteration}
            </h3>
            {matchType === 'fuzzy' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                root form
              </span>
            )}
          </div>

          <p className="mt-1 text-xl text-amber-800 font-semibold">
            {entry.shortDef}
          </p>

          {/* Divider */}
          <div className="mt-3 pt-3 border-t border-stone-100">
            {/* Greek word + Strong's number */}
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-lg text-stone-600" style={{ fontFamily: "'Noto Serif', serif" }}>
                {entry.greek}
              </span>
              <span className="text-sm text-stone-400">
                ({entry.pronunciation})
              </span>
              <a
                href={`https://www.blueletterbible.org/lexicon/${entry.strongsId.toLowerCase()}/kjv/tr/0-1/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
                onClick={e => e.stopPropagation()}
              >
                {entry.strongsId} ↗
              </a>
            </div>

            {/* Full Dodson definition */}
            {entry.fullDef !== entry.shortDef && (
              <p className="mt-1.5 text-sm text-stone-600">
                {entry.fullDef}
              </p>
            )}

            {(entry.strongsDef || entry.derivation) && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-2 text-sm text-amber-700 hover:text-amber-800 font-medium transition-colors"
              >
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}

            {expanded && (
              <div className="mt-3 space-y-2 text-sm text-stone-600">
                {entry.strongsDef && (
                  <p>
                    <span className="font-medium text-stone-700">Strong&apos;s:</span>{' '}
                    {entry.strongsDef}
                  </p>
                )}
                {entry.derivation && (
                  <p>
                    <span className="font-medium text-stone-700">Derivation:</span>{' '}
                    {entry.derivation}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {session && (
          <button
            onClick={handleBookmark}
            disabled={bookmarking}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-stone-100 transition-colors disabled:opacity-50"
            title={isBookmarked ? 'Remove from flash cards' : 'Add to flash cards'}
          >
            <svg
              className={`h-6 w-6 transition-colors ${
                isBookmarked ? 'text-amber-500 fill-amber-500' : 'text-stone-400'
              }`}
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              fill={isBookmarked ? 'currentColor' : 'none'}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
