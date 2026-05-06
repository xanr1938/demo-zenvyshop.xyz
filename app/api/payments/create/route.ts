import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// TODO: เชื่อมต่อ Payment Gateway จริง (Omise/Stripe/2C2P)
// ปัจจุบันเป็น mock — return QR code / payment URL จาก gateway แทน

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId, method } = await req.json()

  const order = db.orders.findById(orderId)
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (order.status !== 'pending') return NextResponse.json({ error: 'Order already processed' }, { status: 400 })

  // Mock payment response
  const mockRef = `PAY-${Date.now()}`

  if (method === 'promptpay') {
    return NextResponse.json({
      method: 'promptpay',
      ref: mockRef,
      qrUrl: `https://promptpay.io/0812345678/${order.totalAmount}`,
      amount: order.totalAmount,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    })
  }

  if (method === 'card') {
    return NextResponse.json({
      method: 'card',
      ref: mockRef,
      // Omise: return token request, Stripe: return PaymentIntent clientSecret
      clientSecret: `mock_secret_${mockRef}`,
      amount: order.totalAmount,
    })
  }

  return NextResponse.json({ error: 'Payment method not supported' }, { status: 400 })
}
