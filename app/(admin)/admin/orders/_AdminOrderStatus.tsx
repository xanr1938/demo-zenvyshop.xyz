'use client'
import { useRouter } from 'next/navigation'

export default function AdminOrderStatus({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter()

  const update = async (status: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    router.refresh()
  }

  return (
    <select
      value={currentStatus}
      onChange={e => update(e.target.value)}
      className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 focus:border-purple-500 focus:outline-none"
    >
      <option value="pending">pending</option>
      <option value="paid">paid</option>
      <option value="failed">failed</option>
      <option value="refunded">refunded</option>
    </select>
  )
}
