'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, Package, LayoutDashboard, LogOut, User, Shield, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/lib/store'

export default function Navbar() {
  const { data: session } = useSession()
  const count = useCartStore((s) => s.count())
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white font-bold text-sm">Z</div>
          <span className="text-lg font-bold text-white">ZenyShop</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">Home</Link>
          <Link href="/products" className="text-sm text-zinc-400 hover:text-white transition-colors">Products</Link>
          <Link href="/products" className="text-sm text-zinc-400 hover:text-white transition-colors"></Link>
          {session?.user?.role === 'admin' && (
            <Link href="/admin" className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors">
              <Shield className="w-3.5 h-3.5" /> Admin
            </Link>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Link href="/cart" className="relative p-2 text-zinc-400 hover:text-white transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-purple-600 text-[10px] font-bold text-white flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          {session ? (
            <div className="hidden md:flex items-center gap-1">
              <Link href="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login" className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors">Login</Link>
              <Link href="/register" className="px-3 py-1.5 rounded-lg bg-purple-600 text-sm text-white hover:bg-purple-700 transition-colors">
                Sign Up
              </Link>
            </div>
          )}

          <button className="md:hidden p-2 text-zinc-400" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-4 space-y-2">
          <Link href="/products" className="flex items-center gap-2 py-2 text-zinc-300" onClick={() => setOpen(false)}>
            <Package className="w-4 h-4" /> All Apps
          </Link>
          {session ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-2 py-2 text-zinc-300" onClick={() => setOpen(false)}>
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              {session.user.role === 'admin' && (
                <Link href="/admin" className="flex items-center gap-2 py-2 text-purple-400" onClick={() => setOpen(false)}>
                  <Shield className="w-4 h-4" /> Admin
                </Link>
              )}
              <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-2 py-2 text-red-400 w-full">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="flex items-center gap-2 py-2 text-zinc-300" onClick={() => setOpen(false)}>
                <User className="w-4 h-4" /> Login
              </Link>
              <Link href="/register" className="flex items-center gap-2 py-2 text-purple-400" onClick={() => setOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
