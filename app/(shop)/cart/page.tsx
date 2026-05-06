'use client'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function CartPage() {
  const { items, removeItem, total } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-zinc-300 mb-2">ตะกร้าว่างเปล่า</h2>
        <p className="text-sm text-zinc-500 mb-8">เลือกแอปพรีเมี่ยมที่คุณต้องการแล้วเพิ่มลงตะกร้า</p>
        <Link href="/products">
          <Button>ดูแอปทั้งหมด</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">ตะกร้าสินค้า ({items.length})</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1 space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                <Image src={item.thumbnailUrl} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-zinc-100 truncate">{item.name}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Lifetime License</p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-purple-400">{formatPrice(item.price)}</div>
                {item.originalPrice !== item.price && (
                  <div className="text-xs text-zinc-600 line-through">{formatPrice(item.originalPrice)}</div>
                )}
              </div>
              <button
                onClick={() => removeItem(item.productId)}
                className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 sticky top-20 space-y-4">
            <h3 className="font-semibold text-zinc-200">สรุปคำสั่งซื้อ</h3>

            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-zinc-400">
                  <span className="truncate mr-2">{item.name}</span>
                  <span className="shrink-0">{formatPrice(item.price)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-800 pt-3 flex justify-between font-bold text-white">
              <span>รวมทั้งหมด</span>
              <span className="text-purple-400">{formatPrice(total())}</span>
            </div>

            <Link href="/checkout" className="block">
              <Button size="lg" className="w-full">
                ดำเนินการชำระเงิน <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <p className="text-center text-xs text-zinc-600">
              ปลอดภัย 100% · ได้รับ license ทันที
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
