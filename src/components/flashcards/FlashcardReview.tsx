'use client'

import { useState, useMemo } from 'react'

interface Card {
  id: string
  front: string
  back: string
  greekWord: string | null
  known: boolean
}

interface FlashcardReviewProps {
  cards: Card[]
  onMark: (id: string, known: boolean) => Promise<void>
  onExit: () => void
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function FlashcardReview({ cards, onMark, onExit }: FlashcardReviewProps) {
  const shuffled = useMemo(() => shuffle(cards), [cards])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState<Record<string, boolean>>({})
  const [marking, setMarking] = useState(false)

  const current = shuffled[index]
  const isFinished = index >= shuffled.length

  const knownCount = Object.values(results).filter(Boolean).length
  const unknownCount = Object.values(results).filter(v => !v).length

  const handleMark = async (known: boolean) => {
    if (!current || marking) return
    setMarking(true)
    try {
      await onMark(current.id, known)
      setResults(prev => ({ ...prev, [current.id]: known }))
      setFlipped(false)
      setIndex(i => i + 1)
    } finally {
      setMarking(false)
    }
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-stone-500">No cards to review</p>
        <button
          onClick={onExit}
          className="mt-4 px-6 py-2 bg-amber-700 text-white rounded-lg font-medium hover:bg-amber-800 transition-colors"
        >
          Go back
        </button>
      </div>
    )
  }

  if (isFinished) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-stone-800 mb-4">Review Complete!</h2>
        <div className="flex justify-center gap-8 mb-6">
          <div>
            <p className="text-3xl font-bold text-green-600">{knownCount}</p>
            <p className="text-sm text-stone-500">Known</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-red-500">{unknownCount}</p>
            <p className="text-sm text-stone-500">Still learning</p>
          </div>
        </div>
        <p className="text-stone-500 mb-6">
          {knownCount === shuffled.length
            ? 'Perfect score!'
            : `${Math.round((knownCount / shuffled.length) * 100)}% mastery`}
        </p>
        <button
          onClick={onExit}
          className="px-6 py-2.5 bg-amber-700 text-white rounded-lg font-medium hover:bg-amber-800 transition-colors"
        >
          Done
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onExit}
          className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
        >
          Exit Review
        </button>
        <span className="text-sm text-stone-500">
          {index + 1} of {shuffled.length}
        </span>
      </div>

      <div className="flex justify-center mb-8">
        <div
          onClick={() => setFlipped(!flipped)}
          className="w-full max-w-sm cursor-pointer"
          style={{ perspective: '1000px' }}
        >
          <div
            className="relative w-full transition-transform duration-500"
            style={{
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : '',
              minHeight: '240px',
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 rounded-2xl bg-white border-2 border-stone-200 shadow-lg flex flex-col items-center justify-center p-8"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <p
                className="text-3xl font-medium text-stone-800 text-center"
                style={{ fontFamily: current?.greekWord ? "'Noto Serif', serif" : undefined }}
              >
                {current?.front}
              </p>
              <p className="text-sm text-stone-400 mt-4">Tap to flip</p>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 rounded-2xl bg-amber-50 border-2 border-amber-200 shadow-lg flex flex-col items-center justify-center p-8"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <p className="text-xl text-stone-700 text-center">
                {current?.back}
              </p>
              <p className="text-sm text-stone-400 mt-4">Tap to flip back</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => handleMark(false)}
          disabled={marking}
          className="flex-1 max-w-[160px] py-3 px-6 rounded-xl border-2 border-red-200 text-red-600 font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          Don&apos;t know
        </button>
        <button
          onClick={() => handleMark(true)}
          disabled={marking}
          className="flex-1 max-w-[160px] py-3 px-6 rounded-xl border-2 border-green-200 text-green-600 font-medium hover:bg-green-50 disabled:opacity-50 transition-colors"
        >
          Know it
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-8 bg-stone-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-amber-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${(index / shuffled.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
