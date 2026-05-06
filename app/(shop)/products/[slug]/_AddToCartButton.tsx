'use client'
import { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import type { Product } from '@/types'

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem, items } = useCartStore()
  const [added, setAdded] = useState(false)
  const inCart = items.some(i => i.productId === product.id)
  const price = product.salePrice ?? product.price

  const handle = () => {
    addItem({ productId: product.id, name: product.name, price, originalPrice: product.price, thumbnailUrl: product.thumbnailUrl })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (inCart) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-green-400 font-medium">
          <Check className="w-4 h-4" /> อยู่ในตะกร้าแล้ว
        </div>
        <Link href="/cart">
          <Button size="lg" className="w-full" variant="secondary">ไปที่ตะกร้า</Button>
        </Link>
      </div>
    )
  }

  return (
    <Button size="lg" className="w-full" onClick={handle} loading={added}>
      <ShoppingCart className="w-4 h-4" />
      {added ? 'เพิ่มแล้ว!' : 'เพิ่มลงตะกร้า'}
    </Button>
  )
}
