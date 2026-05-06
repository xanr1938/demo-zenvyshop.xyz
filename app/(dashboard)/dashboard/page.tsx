import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import DashboardNav from '@/components/dashboard/DashboardNav'
import Link from 'next/link'
import { ShoppingBag, Key, ArrowRight } from 'lucide-react'
import Badge from '@/components/ui/Badge'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)!
  const orders = db.orders.findByUserId(session!.user.id)
  const licenses = db.licenses.findByUserId(session!.user.id)
  const paidOrders = orders.filter(o => o.status === 'paid')
  const totalSpent = paidOrders.reduce((s, o) => s + o.totalAmount, 0)

  const statusColor = (s: string) =>
    s === 'paid' ? 'green' : s === 'pending' ? 'yellow' : 'red'

  return (
    <div>
      <DashboardNav />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">สวัสดี, {session!.user.name} 👋</h1>
        <p className="text-sm text-zinc-500 mt-1">จัดการคำสั่งซื้อและ license keys ของคุณ</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'คำสั่งซื้อทั้งหมด', value: orders.length, icon: ShoppingBag },
          { label: 'ชำระแล้ว', value: paidOrders.length, icon: ShoppingBag },
          { label: 'License Keys', value: licenses.length, icon: Key },
          { label: 'ยอดรวม', value: formatPrice(totalSpent), icon: ShoppingBag },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <Icon className="w-4 h-4 text-purple-400 mb-2" />
            <div className="text-xl font-bold text-white">{value}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-zinc-200">คำสั่งซื้อล่าสุด</h2>
          <Link href="/dashboard/orders" className="flex items-center gap-1 text-xs text-purple-400 hover:underline">
            ดูทั้งหมด <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <ShoppingBag className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">ยังไม่มีคำสั่งซื้อ</p>
            <Link href="/products" className="mt-3 inline-block text-sm text-purple-400 hover:underline">
              เลือกซื้อแอปเลย
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Order</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">สินค้า</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">ยอดรวม</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {orders.slice(0, 5).map(o => (
                  <tr key={o.id} className="bg-zinc-900 hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">#{o.id.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3 text-zinc-300">{o.items.map(i => i.productName).join(', ')}</td>
                    <td className="px-4 py-3 text-purple-400 font-medium">{formatPrice(o.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusColor(o.status) as 'green' | 'yellow' | 'red'}>{o.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
