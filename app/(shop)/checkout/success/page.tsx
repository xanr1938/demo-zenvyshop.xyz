import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Key, LayoutDashboard } from 'lucide-react'
import Button from '@/components/ui/Button'

interface Props {
  searchParams: Promise<{ orderId?: string }>
}

export const metadata = { title: 'Order Confirmed' }

export default async function SuccessPage({ searchParams }: Props) {
  const { orderId } = await searchParams
  const session = await getServerSession(authOptions)
  if (!session || !orderId) redirect('/')

  const order = db.orders.findById(orderId)
  if (!order || order.userId !== session.user.id) redirect('/')

  const licenses = db.licenses.findByOrderId(orderId)

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="flex justify-center mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">ชำระเงินสำเร็จ!</h1>
      <p className="text-zinc-400 mb-2">ขอบคุณที่ซื้อสินค้า Order #{orderId.slice(-8).toUpperCase()}</p>
      <p className="text-sm text-zinc-500 mb-10">License key ของคุณพร้อมใช้งานแล้ว</p>

      {/* License keys */}
      {licenses.length > 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 mb-8 text-left space-y-4">
          <div className="flex items-center gap-2 font-semibold text-zinc-200">
            <Key className="w-4 h-4 text-purple-400" />
            License Keys ของคุณ
          </div>
          {licenses.map(l => (
            <div key={l.id} className="rounded-xl border border-zinc-700 bg-zinc-800 p-4">
              <p className="text-xs text-zinc-500 mb-1">{l.productName}</p>
              <code className="block font-mono text-purple-300 text-sm tracking-widest select-all">{l.key}</code>
            </div>
          ))}
          <p className="text-xs text-zinc-600">คุณสามารถดู license keys ได้ตลอดเวลาใน Dashboard</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/dashboard/licenses">
          <Button><Key className="w-4 h-4" /> ดู Licenses ทั้งหมด</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="secondary"><LayoutDashboard className="w-4 h-4" /> Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
