import Link from 'next/link'
import { ArrowRight, Zap, Shield, Key } from 'lucide-react'
import { db } from '@/lib/db'
import ProductCard from '@/components/shop/ProductCard'
import type { Product } from '@/types'

export default function HomePage() {
  const featured = db.products.findAll({ isActive: true, isFeatured: true })
  const categories = db.categories.findAll()
  const allProducts = db.products.findAll({ isActive: true })

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-zinc-950 border-b border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-zinc-950 to-zinc-950" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 md:py-36 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-300 mb-6">
            <Zap className="w-3.5 h-3.5" /> Premium Software Marketplace
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
            แอปพรีเมี่ยม<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              ที่คุ้มค่าที่สุด
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400 mb-10">
            ซอฟต์แวร์คุณภาพสูงสำหรับมืออาชีพ ซื้อครั้งเดียว ใช้ได้ตลอด พร้อม license key ส่งทันที
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/products"
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-purple-700 transition-colors"
            >
              ดูแอปทั้งหมด <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-xl border border-zinc-700 px-8 py-3.5 text-base font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              สมัครฟรี
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
            {[
              { n: `${allProducts.length}+`, l: 'แอปพรีเมี่ยม' },
              { n: '1000+', l: 'ลูกค้าที่ไว้วางใจ' },
              { n: '24/7', l: 'License API' },
            ].map(({ n, l }) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-bold text-purple-400">{n}</div>
                <div className="text-xs text-zinc-500 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'License Key ทันที', desc: 'หลังชำระเงิน ได้รับ license key ใน dashboard ทันที' },
              { icon: Shield, title: 'ปลอดภัย 100%', desc: 'ระบบ payment ที่เชื่อถือได้ ข้อมูลเข้ารหัสทุกขั้นตอน' },
              { icon: Key, title: 'License API', desc: 'Validate license ผ่าน REST API ในแอปของคุณได้เลย' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 rounded-xl border border-zinc-800">
                <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/20 text-purple-400">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100 mb-1">{title}</h3>
                  <p className="text-sm text-zinc-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Featured Apps</h2>
              <p className="text-sm text-zinc-500 mt-1">แอปยอดนิยมที่เราแนะนำ</p>
            </div>
            <Link href="/products" className="flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors">
              ดูทั้งหมด <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((p: Product) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="border-t border-zinc-800 bg-zinc-900/30 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">หมวดหมู่</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center hover:border-purple-500/50 hover:bg-zinc-800 transition-all"
              >
                <div className="text-2xl mb-2">
                  {cat.slug === 'productivity' ? '⚡' : cat.slug === 'design' ? '🎨' : cat.slug === 'security' ? '🔒' : '🛠️'}
                </div>
                <h3 className="font-semibold text-zinc-200 group-hover:text-purple-300 transition-colors">{cat.name}</h3>
                <p className="text-xs text-zinc-600 mt-1">
                  {allProducts.filter(p => p.categoryId === cat.id).length} apps
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-900/10 to-transparent p-12">
          <h2 className="text-3xl font-bold text-white mb-4">พร้อมเริ่มต้นแล้วหรือยัง?</h2>
          <p className="text-zinc-400 mb-8">สมัครฟรี ไม่มีค่าใช้จ่าย เริ่มซื้อแอปพรีเมี่ยมได้ทันที</p>
          <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-8 py-3.5 font-semibold text-white hover:bg-purple-700 transition-colors">
            สมัครสมาชิกฟรี <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
