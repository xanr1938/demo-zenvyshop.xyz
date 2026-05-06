import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import DashboardNav from '@/components/dashboard/DashboardNav'
import Badge from '@/components/ui/Badge'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'My Orders' }

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  const orders = db.orders.findByUserId(session!.user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const statusColor = (s: string) =>
    s === 'paid' ? 'green' : s === 'pending' ? 'yellow' : 'red'

  return (
    <div>
      <DashboardNav />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">คำสั่งซื้อของฉัน</h1>
        <p className="text-sm text-zinc-500 mt-1">{orders.length} คำสั่งซื้อ</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
          <ShoppingBag className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 mb-4">ยังไม่มีคำสั่งซื้อ</p>
          <Link href="/products" className="text-sm text-purple-400 hover:underline">เลือกซื้อแอป</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-mono text-xs text-zinc-500">#{o.id.slice(-8).toUpperCase()}</span>
                  <div className="text-xs text-zinc-600 mt-0.5">{new Date(o.createdAt).toLocaleDateString('th-TH')}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-purple-400">{formatPrice(o.totalAmount)}</span>
                  <Badge variant={statusColor(o.status) as 'green' | 'yellow' | 'red'}>{o.status}</Badge>
                </div>
              </div>
              <div className="space-y-1.5">
                {o.items.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-zinc-300">{item.productName}</span>
                    <span className="text-zinc-500">{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
