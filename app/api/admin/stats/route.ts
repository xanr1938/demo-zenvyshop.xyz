import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const recentOrders = db.orders.findAll()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return NextResponse.json({
    totalRevenue: db.orders.totalRevenue(),
    totalOrders: db.orders.count(),
    totalUsers: db.users.count(),
    totalProducts: db.products.count(),
    recentOrders,
  })
}
