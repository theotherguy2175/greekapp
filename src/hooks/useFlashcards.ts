'use client'

import { useState, useEffect, useCallback } from 'react'

interface Flashcard {
  id: string
  front: string
  back: string
  strongsId: string | null
  greekWord: string | null
  known: boolean
  reviewCount: number
  lastReviewed: string | null
  createdAt: string
}

export function useFlashcards() {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, string | null>>({})

  const refreshCards = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/flashcards')
      if (res.ok) {
        const data = await res.json()
        setCards(data.cards)
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshCards()
  }, [refreshCards])

  const checkBookmarks = useCallback(async (strongsIds: string[]) => {
    if (strongsIds.length === 0) return
    try {
      const res = await fetch(
        `/api/flashcards?strongsIds=${strongsIds.join(',')}`
      )
      if (res.ok) {
        const data = await res.json()
        setBookmarkedIds(prev => ({ ...prev, ...data.bookmarked }))
      }
    } catch {
      // ignore
    }
  }, [])

  const createCard = useCallback(async (data: {
    front: string
    back: string
    strongsId?: string
    greekWord?: string
  }) => {
    const res = await fetch('/api/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error)
    }
    const result = await res.json()
    setCards(prev => [result.card, ...prev])
    if (data.strongsId) {
      setBookmarkedIds(prev => ({ ...prev, [data.strongsId!]: result.card.id }))
    }
    return result.card
  }, [])

  const updateCard = useCallback(async (id: string, data: Partial<Flashcard>) => {
    const res = await fetch(`/api/flashcards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update')
    const result = await res.json()
    setCards(prev => prev.map(c => c.id === id ? result.card : c))
    return result.card
  }, [])

  const deleteCard = useCallback(async (id: string) => {
    const card = cards.find(c => c.id === id)
    const res = await fetch(`/api/flashcards/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete')
    setCards(prev => prev.filter(c => c.id !== id))
    if (card?.strongsId) {
      setBookmarkedIds(prev => ({ ...prev, [card.strongsId!]: null }))
    }
  }, [cards])

  const toggleBookmark = useCallback(async (entry: {
    strongsId: string
    greek: string
    shortDef: string
  }) => {
    const existingCardId = bookmarkedIds[entry.strongsId]
    if (existingCardId) {
      await deleteCard(existingCardId)
    } else {
      await createCard({
        front: entry.greek,
        back: entry.shortDef,
        strongsId: entry.strongsId,
        greekWord: entry.greek,
      })
    }
  }, [bookmarkedIds, deleteCard, createCard])

  const isBookmarked = useCallback((strongsId: string) => {
    return !!bookmarkedIds[strongsId]
  }, [bookmarkedIds])

  return {
    cards,
    isLoading,
    bookmarkedIds,
    refreshCards,
    checkBookmarks,
    createCard,
    updateCard,
    deleteCard,
    toggleBookmark,
    isBookmarked,
  }
}
