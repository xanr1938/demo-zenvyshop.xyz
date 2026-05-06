import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = db.users.findById(session.user.id)
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { password: _, ...safe } = user
  return NextResponse.json(safe)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, avatarUrl } = await req.json()
  const updated = db.users.update(session.user.id, { name, avatarUrl })
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { password: _, ...safe } = updated
  return NextResponse.json(safe)
}
