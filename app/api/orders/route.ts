import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { v4 as uuid } from 'uuid'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const orders = session.user.role === 'admin'
    ? db.orders.findAll()
    : db.orders.findByUserId(session.user.id)

  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { items, paymentMethod } = await req.json()

  if (!items?.length)
    return NextResponse.json({ error: 'ไม่มีสินค้าในรายการ' }, { status: 400 })

  const totalAmount = items.reduce((sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity, 0)
  const now = new Date().toISOString()

  const order = {
    id: uuid(),
    userId: session.user.id,
    status: 'pending' as const,
    totalAmount,
    currency: 'THB',
    paymentMethod,
    items,
    createdAt: now,
    updatedAt: now,
  }

  db.orders.create(order)
  return NextResponse.json(order, { status: 201 })
}
