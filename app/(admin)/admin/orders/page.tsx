import { db } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import AdminOrderStatus from './_AdminOrderStatus'

export const metadata = { title: 'Admin — Orders' }

export default function AdminOrdersPage() {
  const orders = db.orders.findAll()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const statusColor = (s: string) =>
    s === 'paid' ? 'green' : s === 'pending' ? 'yellow' : 'red'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <p className="text-sm text-zinc-500 mt-1">{orders.length} คำสั่งซื้อทั้งหมด</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center text-zinc-500 text-sm">
          ยังไม่มีคำสั่งซื้อ
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                {['Order', 'ผู้ซื้อ', 'สินค้า', 'ยอดรวม', 'วิธีชำระ', 'วันที่', 'สถานะ', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {orders.map(o => {
                const user = db.users.findById(o.userId)
                return (
                  <tr key={o.id} className="bg-zinc-900 hover:bg-zinc-800/50">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">#{o.id.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs max-w-32 truncate">{user?.email ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-300 max-w-40 truncate">{o.items.map(i => i.productName).join(', ')}</td>
                    <td className="px-4 py-3 text-purple-400 font-medium">{formatPrice(o.totalAmount)}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs capitalize">{o.paymentMethod ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(o.createdAt).toLocaleDateString('th-TH')}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusColor(o.status) as 'green' | 'yellow' | 'red'}>{o.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <AdminOrderStatus orderId={o.id} currentStatus={o.status} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
