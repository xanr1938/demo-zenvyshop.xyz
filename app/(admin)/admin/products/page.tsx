import { db } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil } from 'lucide-react'
import AdminProductActions from './_AdminProductActions'

export const metadata = { title: 'Admin — Products' }

export default function AdminProductsPage() {
  const products = db.products.findAll()
  const categories = db.categories.findAll()
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-sm text-zinc-500 mt-1">{products.length} แอพในระบบ</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-sm text-white hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> เพิ่มแอพ
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80">
              {['แอพ', 'หมวดหมู่', 'ราคา', 'Platform', 'สถานะ', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {products.map(p => (
              <tr key={p.id} className="bg-zinc-900 hover:bg-zinc-800/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                      <Image src={p.thumbnailUrl} alt={p.name} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="font-medium text-zinc-200">{p.name}</div>
                      <div className="text-xs text-zinc-600">v{p.version}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-400">{catMap[p.categoryId] ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className="text-purple-400 font-medium">{formatPrice(p.salePrice ?? p.price)}</span>
                  {p.salePrice && (
                    <span className="ml-1 text-xs text-zinc-600 line-through">{formatPrice(p.price)}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-400 capitalize text-xs">{p.platform}</td>
                <td className="px-4 py-3">
                  <Badge variant={p.isActive ? 'green' : 'zinc'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
                </td>
                <td className="px-4 py-3">
                  <AdminProductActions productId={p.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
