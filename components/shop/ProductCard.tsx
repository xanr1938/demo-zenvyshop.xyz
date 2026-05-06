'use client'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Check } from 'lucide-react'
import { useState } from 'react'
import type { Product } from '@/types'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, items } = useCartStore()
  const [added, setAdded] = useState(false)
  const inCart = items.some((i) => i.productId === product.id)
  const price = product.salePrice ?? product.price

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      productId: product.id,
      name: product.name,
      price,
      originalPrice: product.price,
      thumbnailUrl: product.thumbnailUrl,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden transition-all duration-200 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
        <div className="relative aspect-[3/2] overflow-hidden bg-zinc-800">
          <Image
            src={product.thumbnailUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.salePrice && (
            <div className="absolute top-3 left-3">
              <Badge variant="red">Sale</Badge>
            </div>
          )}
          {product.isFeatured && (
            <div className="absolute top-3 right-3">
              <Badge variant="purple">Featured</Badge>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-zinc-100 group-hover:text-purple-300 transition-colors line-clamp-1">
              {product.name}
            </h3>
            <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{product.shortDesc}</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-purple-400">{formatPrice(price)}</span>
              {product.salePrice && (
                <span className="ml-2 text-xs text-zinc-500 line-through">{formatPrice(product.price)}</span>
              )}
            </div>
            <button
              onClick={handleAdd}
              disabled={inCart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 disabled:bg-zinc-700 disabled:text-zinc-400 transition-colors"
            >
              {inCart || added ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
              {inCart ? 'Added' : 'Add'}
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="capitalize">{product.platform}</span>
            <span>·</span>
            <span>v{product.version}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
