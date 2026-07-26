'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearch } from '@/hooks/useSearch'
import { useFlashcards } from '@/hooks/useFlashcards'
import { SearchBar } from '@/components/search/SearchBar'
import { SearchResults } from '@/components/search/SearchResults'

export default function DictionaryContent() {
  const { data: session } = useSession()
  const { query, setQuery, results, isLoading } = useSearch()
  const { checkBookmarks, isBookmarked, toggleBookmark } = useFlashcards()

  useEffect(() => {
    if (session && results.length > 0) {
      const strongsIds = results.map(r => r.entry.strongsId)
      checkBookmarks(strongsIds)
    }
  }, [session, results, checkBookmarks])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <SearchBar query={query} onChange={setQuery} isLoading={isLoading} />
      </div>

      <SearchResults
        results={results}
        isLoading={isLoading}
        query={query}
        isBookmarked={isBookmarked}
        onToggleBookmark={toggleBookmark}
      />
    </div>
  )
}
