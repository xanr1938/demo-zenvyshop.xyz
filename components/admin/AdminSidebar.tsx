'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, Users, BarChart3, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin', label: 'Overview', icon: BarChart3, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Users', icon: Users },
]

export default function AdminSidebar() {
  const path = usePathname()

  return (
    <aside className="w-56 shrink-0 border-r border-zinc-800 bg-zinc-950 min-h-screen pt-6 pb-8 flex flex-col">
      <div className="px-4 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Admin Panel</p>
        <p className="text-xs text-zinc-600">ZenyShop</p>
      </div>

      <nav className="flex-1 px-2 space-y-0.5">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? path === href : path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-purple-600/20 text-purple-300 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800',
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 mt-auto">
        <Link href="/" className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Shop
        </Link>
      </div>
    </aside>
  )
}
