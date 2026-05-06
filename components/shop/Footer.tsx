import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white font-bold text-xs">Z</div>
              <span className="font-bold text-white">ZenyShop</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              ร้านขายซอฟต์แวร์พรีเมี่ยม คุณภาพสูง ราคาคุ้มค่า พร้อม license key ทันที
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3">Shop</h4>
            <ul className="space-y-2 text-xs text-zinc-500">
              <li><Link href="/products" className="hover:text-zinc-300 transition-colors">All Apps</Link></li>
              <li><Link href="/products?category=productivity" className="hover:text-zinc-300 transition-colors">Productivity</Link></li>
              <li><Link href="/products?category=design" className="hover:text-zinc-300 transition-colors">Design</Link></li>
              <li><Link href="/products?category=security" className="hover:text-zinc-300 transition-colors">Security</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3">Account</h4>
            <ul className="space-y-2 text-xs text-zinc-500">
              <li><Link href="/dashboard" className="hover:text-zinc-300 transition-colors">Dashboard</Link></li>
              <li><Link href="/dashboard/orders" className="hover:text-zinc-300 transition-colors">My Orders</Link></li>
              <li><Link href="/dashboard/licenses" className="hover:text-zinc-300 transition-colors">My Licenses</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3">Support</h4>
            <ul className="space-y-2 text-xs text-zinc-500">
              <li><span className="text-zinc-600">support@zenyshop.xyz</span></li>
              <li><Link href="/api/licenses" className="hover:text-zinc-300 transition-colors">License API</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-zinc-600">
          <span>© {new Date().getFullYear()} ZenyShop. All rights reserved.</span>
          <span>Built with Next.js 16 + Tailwind CSS 4</span>
        </div>
      </div>
    </footer>
  )
}
