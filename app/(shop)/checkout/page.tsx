'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Link from 'next/link'
import { CreditCard, Smartphone, ShieldCheck } from 'lucide-react'

export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { items, total, clearCart } = useCartStore()
  const [method, setMethod] = useState<'promptpay' | 'card'>('promptpay')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h2 className="text-xl font-semibold text-zinc-300 mb-4">ไม่มีสินค้าในตะกร้า</h2>
        <Link href="/products"><Button>ดูแอปทั้งหมด</Button></Link>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h2 className="text-xl font-semibold text-zinc-300 mb-4">กรุณาเข้าสู่ระบบก่อนชำระเงิน</h2>
        <Link href="/login?callbackUrl=/checkout"><Button>เข้าสู่ระบบ</Button></Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Create order
      const orderItems = items.map(i => ({
        productId: i.productId,
        productName: i.name,
        price: i.price,
        quantity: 1,
      }))

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: orderItems, paymentMethod: method }),
      })
      const order = await orderRes.json()
      if (!orderRes.ok) throw new Error(order.error)

      // 2. Create payment
      await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, method }),
      })

      // 3. Confirm payment (mock — in production: wait for gateway callback)
      const confirmRes = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, paymentRef: `MOCK-${Date.now()}` }),
      })
      const confirm = await confirmRes.json()
      if (!confirmRes.ok) throw new Error(confirm.error)

      clearCart()
      router.push(`/checkout/success?orderId=${order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">ชำระเงิน</h1>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left */}
          <div className="flex-1 space-y-6">
            {/* Billing info */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
              <h3 className="font-semibold text-zinc-200">ข้อมูลผู้ซื้อ</h3>
              <Input label="ชื่อ-นามสกุล" defaultValue={session.user.name ?? ''} required />
              <Input label="อีเมล" type="email" defaultValue={session.user.email ?? ''} required />
            </div>

            {/* Payment method */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
              <h3 className="font-semibold text-zinc-200">วิธีชำระเงิน</h3>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { id: 'promptpay', label: 'PromptPay', desc: 'QR Code', icon: Smartphone },
                  { id: 'card', label: 'บัตรเครดิต', desc: 'Visa / Mastercard', icon: CreditCard },
                ] as const).map(({ id, label, desc, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMethod(id)}
                    className={`flex items-center gap-3 rounded-xl border p-4 transition-all text-left ${
                      method === id
                        ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <div>
                      <div className="text-sm font-medium">{label}</div>
                      <div className="text-xs opacity-60">{desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              {method === 'card' && (
                <div className="space-y-3 mt-2">
                  <Input label="หมายเลขบัตร" placeholder="1234 5678 9012 3456" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="หมดอายุ" placeholder="MM/YY" />
                    <Input label="CVV" placeholder="123" />
                  </div>
                </div>
              )}

              {method === 'promptpay' && (
                <div className="flex items-center gap-2 text-sm text-zinc-500 bg-zinc-800 rounded-lg px-4 py-3">
                  <Smartphone className="w-4 h-4 shrink-0" />
                  QR Code จะแสดงหลังยืนยันคำสั่งซื้อ
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>

          {/* Right — Summary */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 sticky top-20 space-y-4">
              <h3 className="font-semibold text-zinc-200">สรุปรายการ</h3>
              <div className="space-y-2 text-sm">
                {items.map(i => (
                  <div key={i.productId} className="flex justify-between text-zinc-400">
                    <span className="truncate mr-2">{i.name}</span>
                    <span className="shrink-0">{formatPrice(i.price)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-zinc-800 pt-3 flex justify-between font-bold text-white">
                <span>ยอดรวม</span>
                <span className="text-purple-400">{formatPrice(total())}</span>
              </div>
              <Button type="submit" size="lg" className="w-full" loading={loading}>
                <ShieldCheck className="w-4 h-4" />
                ยืนยันและชำระเงิน
              </Button>
              <p className="text-center text-xs text-zinc-600">ปลอดภัย · ได้รับ license ทันที</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
