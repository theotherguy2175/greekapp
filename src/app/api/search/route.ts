import { NextRequest, NextResponse } from 'next/server'
import { getLexicon } from '@/lib/lexicon/data'
import { search } from '@/lib/lexicon/search'

export async function GET(request: NextRequest) {
  getLexicon()

  const q = request.nextUrl.searchParams.get('q') || ''
  const limit = Math.min(
    parseInt(request.nextUrl.searchParams.get('limit') || '20'),
    50
  )

  if (!q.trim() || q.length > 100) {
    return NextResponse.json({ results: [], query: q })
  }

  const results = search(q, limit)
  return NextResponse.json({ results, query: q })
}
