'use client'

import { SearchResult } from '@/types/lexicon'
import { WordCard } from './WordCard'

interface SearchResultsProps {
  results: SearchResult[]
  isLoading: boolean
  query: string
  isBookmarked: (strongsId: string) => boolean
  onToggleBookmark: (entry: { strongsId: string; greek: string; shortDef: string }) => void
}

export function SearchResults({
  results,
  isLoading,
  query,
  isBookmarked,
  onToggleBookmark,
}: SearchResultsProps) {
  if (!query.trim()) {
    return (
      <div className="text-center py-16 text-stone-400">
        <p className="text-5xl mb-4" style={{ fontFamily: "'Noto Serif', serif" }}>λόγος</p>
        <p className="text-lg">Start typing to search the Greek lexicon</p>
        <p className="text-sm mt-1">
          Try: <span className="text-amber-700">agape</span>,{' '}
          <span className="text-amber-700">logos</span>,{' '}
          <span className="text-amber-700">theos</span>,{' '}
          <span className="text-amber-700">pistis</span>
        </p>
      </div>
    )
  }

  if (isLoading && results.length === 0) {
    return (
      <div className="text-center py-12 text-stone-400">
        <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p>Searching...</p>
      </div>
    )
  }

  if (results.length === 0 && query.trim()) {
    return (
      <div className="text-center py-12 text-stone-400">
        <p className="text-lg">No matches found for &ldquo;{query}&rdquo;</p>
        <p className="text-sm mt-1">Try a different spelling or check your transliteration</p>
      </div>
    )
  }

  const hasFuzzy = results.some(r => r.matchType === 'fuzzy')
  const allExactOrPrefix = results.every(r => r.matchType === 'exact' || r.matchType === 'prefix')

  return (
    <div className="space-y-3">
      {hasFuzzy && !allExactOrPrefix && (
        <p className="text-sm text-stone-500 px-1">
          No exact match — showing possible root forms:
        </p>
      )}
      {results.map(result => (
        <WordCard
          key={result.entry.strongsId}
          entry={result.entry}
          matchType={result.matchType}
          isBookmarked={isBookmarked(result.entry.strongsId)}
          onToggleBookmark={() =>
            onToggleBookmark({
              strongsId: result.entry.strongsId,
              greek: result.entry.greek,
              shortDef: result.entry.shortDef,
            })
          }
        />
      ))}
    </div>
  )
}
