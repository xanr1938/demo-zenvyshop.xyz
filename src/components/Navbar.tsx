"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import CartDrawer from "./CartDrawer";
import ProfileDropdown from "./ProfileDropdown";
import { getAvatarUrl } from "@appwrite/storage";

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const { count } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/register") return null;

  const avatarUrl = profile?.avatar ? getAvatarUrl(profile.avatar, 40) : null;
  const initials = (user?.name || user?.email || "?").slice(0, 2).toUpperCase();

  const NAV_LINKS = [
    { label: "หน้าแรก", href: "/", show: true, accent: true },
    { label: "สินค้า", href: "/shop", show: true, accent: false },
    { label: "เติมเงิน", href: "/topup", show: true || !!user, accent: false },
    { label: "ประวัติการสั่งซื้อ", href: "/history", show: true || !!user, accent: false },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200/60 dark:border-slate-700/60 transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">

          {/* Logo */}
          <Link href="/" className="font-bold text-lg text-slate-900 dark:text-white tracking-tight flex-shrink-0">
            Zenvy<span className="text-[#d44242]">Shop</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-300">
            {NAV_LINKS.filter((l) => l.show).map((l) => (
              <Link key={l.href} href={l.href}
                className={l.accent
                  ? "flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#FCE9E9] dark:bg-[#d44242]/20 text-[#d44242] hover:bg-[#d44242] hover:text-white transition-all"
                  : "hover:text-[#d44242] transition-colors"}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme */}
            <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400" aria-label="Theme">
              {isDark
                ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>
                : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>
              }
            </button>

            {/* Cart */}
            <button onClick={() => setCartOpen(true)} className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Cart">
              <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              {count > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center bg-[#d44242] text-white text-[10px] font-bold rounded-full">{count > 9 ? "9+" : count}</span>}
            </button>

            {/* Profile / Login — แสดงทุกหน้าจอ */}
            {user ? <ProfileDropdown /> : <Link href="/login" className="text-xs px-4 py-1.5 rounded-lg bg-[#d44242] hover:bg-[#E87A7A] text-white font-semibold transition-colors">Login</Link>}

            {/* Mobile: Hamburger — เฉพาะ nav links */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="sm:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Menu">
              {mobileOpen
                ? <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                : <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
              }
            </button>
          </div>
        </div>

        {/* Mobile dropdown — nav links only */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
            {NAV_LINKS.filter((l) => l.show).map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                className={`flex items-center px-4 py-3 rounded-2xl font-semibold text-sm transition-colors ${l.accent ? "bg-[#FCE9E9] dark:bg-[#d44242]/15 text-[#d44242]"
                  : pathname === l.href ? "bg-[#d44242] text-white"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}>
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
