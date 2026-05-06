import { db } from '@/lib/db'
import ProductCard from '@/components/shop/ProductCard'
import type { Product } from '@/types'

interface Props {
  searchParams: Promise<{ category?: string; search?: string; platform?: string }>
}

export const metadata = { title: 'All Apps' }

export default async function ProductsPage({ searchParams }: Props) {
  const { category, search, platform } = await searchParams
  const categories = db.categories.findAll()
  const cat = category ? categories.find(c => c.slug === category) : null

  let products = db.products.findAll({
    isActive: true,
    categoryId: cat?.id,
    search,
  })

  if (platform && platform !== 'all') {
    products = products.filter(p => p.platform === platform || p.platform === 'all')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{cat ? cat.name : 'All Apps'}</h1>
        <p className="text-sm text-zinc-500 mt-1">{products.length} แอปพรีเมี่ยม</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-52 shrink-0">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-6 sticky top-20">
            {/* Search */}
            <div>
              <form method="GET">
                {cat && <input type="hidden" name="category" value={category} />}
                {platform && <input type="hidden" name="platform" value={platform} />}
                <label className="block text-xs font-semibold text-zinc-400 mb-2">ค้นหา</label>
                <input
                  name="search"
                  defaultValue={search}
                  placeholder="ชื่อแอป..."
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
                />
                <button type="submit" className="mt-2 w-full rounded-lg bg-purple-600 py-1.5 text-xs text-white hover:bg-purple-700 transition-colors">
                  ค้นหา
                </button>
              </form>
            </div>

            {/* Category filter */}
            <div>
              <p className="text-xs font-semibold text-zinc-400 mb-2">หมวดหมู่</p>
              <ul className="space-y-1">
                <li>
                  <a
                    href="/products"
                    className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${!cat ? 'bg-purple-600/20 text-purple-300' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
                  >
                    ทั้งหมด
                  </a>
                </li>
                {categories.map(c => (
                  <li key={c.id}>
                    <a
                      href={`/products?category=${c.slug}`}
                      className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${cat?.id === c.id ? 'bg-purple-600/20 text-purple-300' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
                    >
                      {c.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Platform filter */}
            <div>
              <p className="text-xs font-semibold text-zinc-400 mb-2">Platform</p>
              <ul className="space-y-1">
                {['all', 'windows', 'mac', 'web'].map(p => (
                  <li key={p}>
                    <a
                      href={`/products?${category ? `category=${category}&` : ''}platform=${p}`}
                      className={`block rounded-lg px-3 py-1.5 text-sm capitalize transition-colors ${(platform ?? 'all') === p ? 'bg-purple-600/20 text-purple-300' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
                    >
                      {p === 'all' ? 'ทั้งหมด' : p}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-zinc-300">ไม่พบแอปที่ค้นหา</h3>
              <p className="text-sm text-zinc-500 mt-1">ลองปรับเงื่อนไขการค้นหาใหม่</p>
              <a href="/products" className="mt-4 text-sm text-purple-400 hover:underline">ดูแอปทั้งหมด</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {products.map((p: Product) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
