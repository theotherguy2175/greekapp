'use client'

import { useState } from 'react'
import { clsx } from 'clsx'

interface Flashcard {
  id: string
  front: string
  back: string
  strongsId: string | null
  greekWord: string | null
  known: boolean
  reviewCount: number
}

type Filter = 'all' | 'bookmarked' | 'custom' | 'known' | 'unknown'

interface FlashcardListProps {
  cards: Flashcard[]
  onDelete: (id: string) => void
  onEdit: (card: Flashcard) => void
}

const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'bookmarked', label: 'Bookmarked' },
  { key: 'custom', label: 'Custom' },
  { key: 'known', label: 'Known' },
  { key: 'unknown', label: 'Unknown' },
]

export function FlashcardList({ cards, onDelete, onEdit }: FlashcardListProps) {
  const [filter, setFilter] = useState<Filter>('all')
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = cards.filter(card => {
    switch (filter) {
      case 'bookmarked': return !!card.strongsId
      case 'custom': return !card.strongsId
      case 'known': return card.known
      case 'unknown': return !card.known
      default: return true
    }
  })

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      await onDelete(id)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              filter === f.key
                ? 'bg-amber-700 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <p className="text-lg">No flash cards yet</p>
          <p className="text-sm mt-1">
            {filter === 'all'
              ? 'Create a custom card or bookmark words from the dictionary'
              : `No ${filter} cards found`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(card => (
            <div
              key={card.id}
              className="bg-white rounded-xl border border-stone-200 shadow-sm p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-800 text-lg" style={{ fontFamily: card.greekWord ? "'Noto Serif', serif" : undefined }}>
                    {card.front}
                  </p>
                  <p className="text-stone-500 mt-1 text-sm line-clamp-2">
                    {card.back}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {card.strongsId && (
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      {card.strongsId}
                    </span>
                  )}
                  <span className={clsx(
                    'text-xs px-2 py-0.5 rounded',
                    card.known
                      ? 'bg-green-100 text-green-700'
                      : 'bg-stone-100 text-stone-500'
                  )}>
                    {card.known ? 'Known' : 'Learning'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t border-stone-100">
                <button
                  onClick={() => onEdit(card)}
                  className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(card.id)}
                  disabled={deleting === card.id}
                  className="text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting === card.id ? 'Deleting...' : 'Delete'}
                </button>
                {card.reviewCount > 0 && (
                  <span className="text-xs text-stone-400 ml-auto">
                    Reviewed {card.reviewCount}x
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
