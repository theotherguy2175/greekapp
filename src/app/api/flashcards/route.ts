import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const strongsIds = request.nextUrl.searchParams.get('strongsIds')

  if (strongsIds) {
    const ids = strongsIds.split(',').filter(Boolean)
    const cards = await prisma.flashcard.findMany({
      where: { userId: session.user.id, strongsId: { in: ids } },
      select: { id: true, strongsId: true },
    })
    const bookmarked: Record<string, string | null> = {}
    for (const id of ids) {
      const card = cards.find(c => c.strongsId === id)
      bookmarked[id] = card?.id || null
    }
    return NextResponse.json({ bookmarked })
  }

  const cards = await prisma.flashcard.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ cards })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { front, back, strongsId, greekWord } = body

  if (!front || !back) {
    return NextResponse.json(
      { error: 'Front and back text are required' },
      { status: 400 }
    )
  }

  if (strongsId) {
    const existing = await prisma.flashcard.findUnique({
      where: { userId_strongsId: { userId: session.user.id, strongsId } },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'This word is already bookmarked' },
        { status: 409 }
      )
    }
  }

  const card = await prisma.flashcard.create({
    data: {
      userId: session.user.id,
      front,
      back,
      strongsId: strongsId || null,
      greekWord: greekWord || null,
    },
  })

  return NextResponse.json({ card })
}
