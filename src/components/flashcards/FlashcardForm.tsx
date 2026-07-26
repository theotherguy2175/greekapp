'use client'

import { useState, useEffect } from 'react'

interface FlashcardFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { front: string; back: string }) => Promise<void>
  initialData?: { front: string; back: string }
  title?: string
}

export function FlashcardForm({ isOpen, onClose, onSave, initialData, title = 'New Flash Card' }: FlashcardFormProps) {
  const [front, setFront] = useState(initialData?.front || '')
  const [back, setBack] = useState(initialData?.back || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setFront(initialData?.front || '')
      setBack(initialData?.back || '')
      setError('')
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!front.trim() || !back.trim()) {
      setError('Both front and back text are required')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave({ front: front.trim(), back: back.trim() })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-stone-800 mb-4">{title}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Front (question / word)
            </label>
            <textarea
              value={front}
              onChange={e => setFront(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
              placeholder="Enter the front text..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Back (answer / definition)
            </label>
            <textarea
              value={back}
              onChange={e => setBack(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
              placeholder="Enter the back text..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-lg border border-stone-300 text-stone-700 font-medium hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 px-4 bg-amber-700 text-white rounded-lg font-medium hover:bg-amber-800 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
