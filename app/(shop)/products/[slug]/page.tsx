import { notFound } from 'next/navigation'
import Image from 'next/image'
import { db } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import AddToCartButton from './_AddToCartButton'
import Badge from '@/components/ui/Badge'
import { Monitor, Globe, Apple, CheckCircle } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const p = db.products.findBySlug(slug)
  if (!p) return {}
  return { title: p.name, description: p.shortDesc }
}

const PlatformIcon = ({ p }: { p: string }) => {
  if (p === 'windows') return <Monitor className="w-4 h-4" />
  if (p === 'mac') return <Apple className="w-4 h-4" />
  if (p === 'web') return <Globe className="w-4 h-4" />
  return <><Monitor className="w-4 h-4" /><Apple className="w-4 h-4" /><Globe className="w-4 h-4" /></>
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const product = db.products.findBySlug(slug)
  if (!product) notFound()

  const category = db.categories.findById(product.categoryId)
  const price = product.salePrice ?? product.price

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
        <a href="/" className="hover:text-zinc-300 transition-colors">Home</a>
        <span>/</span>
        <a href="/products" className="hover:text-zinc-300 transition-colors">Apps</a>
        {category && <>
          <span>/</span>
          <a href={`/products?category=${category.slug}`} className="hover:text-zinc-300 transition-colors">{category.name}</a>
        </>}
        <span>/</span>
        <span className="text-zinc-300">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left — Image & Description */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            <Image src={product.thumbnailUrl} alt={product.name} fill className="object-cover" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
            <p className="text-zinc-400 leading-relaxed">{product.description}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag: string) => (
              <Badge key={tag} variant="zinc">{tag}</Badge>
            ))}
          </div>

          {/* Features */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="font-semibold text-zinc-200 mb-4">สิ่งที่คุณได้รับ</h3>
            <ul className="space-y-2.5">
              {[
                'License key ส่งทันทีหลังชำระเงิน',
                'ใช้งานได้ตลอดชีพ (Lifetime License)',
                'อัปเดตฟรี 12 เดือน',
                'รองรับทาง email ตลอด 24/7',
                'Validate ผ่าน License API ได้',
              ].map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-400">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right — Purchase */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-5">
            {/* Price */}
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-purple-400">{formatPrice(price)}</span>
                {product.salePrice && (
                  <span className="text-lg text-zinc-500 line-through">{formatPrice(product.price)}</span>
                )}
              </div>
              {product.salePrice && (
                <Badge variant="red" className="mt-1">
                  ลด {Math.round((1 - product.salePrice / product.price) * 100)}%
                </Badge>
              )}
            </div>

            <AddToCartButton product={product} />

            {/* Meta */}
            <div className="border-t border-zinc-800 pt-4 space-y-2.5 text-xs text-zinc-500">
              <div className="flex items-center justify-between">
                <span>Version</span>
                <span className="text-zinc-300">{product.version}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Platform</span>
                <div className="flex items-center gap-1 text-zinc-300 capitalize">
                  <PlatformIcon p={product.platform} />
                  <span>{product.platform}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Category</span>
                <span className="text-zinc-300">{category?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>License</span>
                <span className="text-zinc-300">Lifetime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
