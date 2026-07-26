'use client'

import { useState, useEffect, useRef } from 'react'
import { SearchResult } from '@/types/lexicon'

export function useSearch(debounceMs = 150) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const timer = setTimeout(async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&limit=20`,
          { signal: controller.signal }
        )
        const data = await res.json()
        setResults(data.results)
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Search error:', err)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, debounceMs])

  return { query, setQuery, results, isLoading }
}
