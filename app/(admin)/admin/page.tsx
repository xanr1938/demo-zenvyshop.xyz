import { db } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { TrendingUp, ShoppingBag, Users, Package } from 'lucide-react'

export const metadata = { title: 'Admin — Overview' }

export default function AdminPage() {
  const orders = db.orders.findAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const totalRevenue = db.orders.totalRevenue()
  const stats = [
    { label: 'Revenue', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'text-green-400' },
    { label: 'Orders', value: db.orders.count(), icon: ShoppingBag, color: 'text-blue-400' },
    { label: 'Users', value: db.users.count(), icon: Users, color: 'text-purple-400' },
    { label: 'Products', value: db.products.count(), icon: Package, color: 'text-yellow-400' },
  ]

  const statusColor = (s: string) =>
    s === 'paid' ? 'green' : s === 'pending' ? 'yellow' : 'red'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-sm text-zinc-500 mt-1">ภาพรวมร้านค้าทั้งหมด</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <Icon className={`w-5 h-5 ${color} mb-3`} />
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-zinc-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="font-semibold text-zinc-200 mb-4">คำสั่งซื้อล่าสุด</h2>
        {orders.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-500 text-sm">
            ยังไม่มีคำสั่งซื้อ
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80">
                  {['Order ID', 'User', 'สินค้า', 'ยอดรวม', 'วันที่', 'สถานะ'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {orders.slice(0, 10).map(o => {
                  const user = db.users.findById(o.userId)
                  return (
                    <tr key={o.id} className="bg-zinc-900 hover:bg-zinc-800/50">
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">#{o.id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">{user?.email ?? '—'}</td>
                      <td className="px-4 py-3 text-zinc-300 max-w-48 truncate">{o.items.map(i => i.productName).join(', ')}</td>
                      <td className="px-4 py-3 text-purple-400 font-medium">{formatPrice(o.totalAmount)}</td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(o.createdAt).toLocaleDateString('th-TH')}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusColor(o.status) as 'green' | 'yellow' | 'red'}>{o.status}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
