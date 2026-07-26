'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useFlashcards } from '@/hooks/useFlashcards'
import { FlashcardList } from '@/components/flashcards/FlashcardList'
import { FlashcardForm } from '@/components/flashcards/FlashcardForm'
import { FlashcardReview } from '@/components/flashcards/FlashcardReview'

export default function FlashcardsContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { cards, isLoading, createCard, updateCard, deleteCard } = useFlashcards()
  const [showForm, setShowForm] = useState(false)
  const [editingCard, setEditingCard] = useState<{ id: string; front: string; back: string } | null>(null)
  const [reviewMode, setReviewMode] = useState(false)

  if (status === 'loading') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-stone-800 mb-3">Sign in to use Flash Cards</h1>
        <p className="text-stone-500 mb-6">
          Create an account to build and review your Greek vocabulary flash cards.
        </p>
        <button
          onClick={() => router.push('/auth/signin')}
          className="px-6 py-2.5 bg-amber-700 text-white rounded-lg font-medium hover:bg-amber-800 transition-colors"
        >
          Sign in
        </button>
      </div>
    )
  }

  if (reviewMode) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <FlashcardReview
          cards={cards}
          onMark={async (id, known) => {
            const card = cards.find(c => c.id === id)
            if (card) {
              await updateCard(id, {
                known,
                reviewCount: (card.reviewCount || 0) + 1,
                lastReviewed: new Date().toISOString(),
              } as Record<string, unknown>)
            }
          }}
          onExit={() => setReviewMode(false)}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-stone-800">My Flash Cards</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-amber-700 text-white rounded-lg text-sm font-medium hover:bg-amber-800 transition-colors"
          >
            + New Card
          </button>
          {cards.length > 0 && (
            <button
              onClick={() => setReviewMode(true)}
              className="px-4 py-2 border border-amber-700 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors"
            >
              Review ({cards.length})
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <FlashcardList
          cards={cards}
          onDelete={deleteCard}
          onEdit={card => setEditingCard(card)}
        />
      )}

      <FlashcardForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={async data => {
          await createCard(data)
        }}
      />

      <FlashcardForm
        isOpen={!!editingCard}
        onClose={() => setEditingCard(null)}
        onSave={async data => {
          if (editingCard) {
            await updateCard(editingCard.id, data)
          }
        }}
        initialData={editingCard || undefined}
        title="Edit Flash Card"
      />
    </div>
  )
}
