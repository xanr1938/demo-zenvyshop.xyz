import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { v4 as uuid } from 'uuid'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateLicenseKey } from '@/lib/utils'

// เรียกหลังจากชำระเงินสำเร็จ (หรือ webhook จาก gateway)
// TODO: ใน production ควรใช้ webhook signature verification แทน

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId, paymentRef } = await req.json()

  const order = db.orders.findById(orderId)
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.userId !== session.user.id && session.user.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Mark order as paid
  db.orders.update(orderId, { status: 'paid', paymentRef })

  // Generate license keys for each item
  const now = new Date().toISOString()
  const licenses = order.items.map((item) => {
    const license = {
      id: uuid(),
      key: generateLicenseKey(),
      orderId,
      productId: item.productId,
      productName: item.productName,
      userId: order.userId,
      status: 'active' as const,
      createdAt: now,
    }
    db.licenses.create(license)
    return license
  })

  return NextResponse.json({ success: true, licenses })
}
