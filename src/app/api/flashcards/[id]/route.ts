import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const card = await prisma.flashcard.findUnique({ where: { id } })
  if (!card || card.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json()
  const updated = await prisma.flashcard.update({
    where: { id },
    data: {
      front: body.front ?? card.front,
      back: body.back ?? card.back,
      known: body.known ?? card.known,
      reviewCount: body.reviewCount ?? card.reviewCount,
      lastReviewed: body.lastReviewed ? new Date(body.lastReviewed) : card.lastReviewed,
    },
  })

  return NextResponse.json({ card: updated })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const card = await prisma.flashcard.findUnique({ where: { id } })
  if (!card || card.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.flashcard.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
