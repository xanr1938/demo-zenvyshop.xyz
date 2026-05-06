import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const licenses = session.user.role === 'admin'
    ? db.licenses.findAll()
    : db.licenses.findByUserId(session.user.id)

  return NextResponse.json(licenses)
}
