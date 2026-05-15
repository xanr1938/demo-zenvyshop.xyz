import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="text-2xl font-extrabold text-white">
              Zenvy<span className="text-[#d44242]">Shop</span>
            </Link>
            <p className="text-sm leading-relaxed">
              ร้านค้าออนไลน์สำหรับสินค้าดิจิทัลและกายภาพคุณภาพสูง
              ปลอดภัย รวดเร็ว เชื่อถือได้
            </p>
            <div className="flex gap-3 pt-1">
              {/* Social icons */}
              {[
                { label: "Facebook", path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
                { label: "Twitter/X", path: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" },
                { label: "Instagram", path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zm1.5-4.87h.01M6.5 3.5h11A3 3 0 0 1 20.5 6.5v11a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3v-11a3 3 0 0 1 3-3z" },
              ].map((s) => (
                <button key={s.label} aria-label={s.label} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#d44242]/20 hover:text-[#d44242] flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d={s.path} />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm tracking-wide uppercase">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Shop", href: "/shop" },
                { label: "ประวัติคำสั่งซื้อ", href: "/history" },
                { label: "Login", href: "/login" },
                { label: "Register", href: "/register" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-[#d44242] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm tracking-wide uppercase">ติดต่อเรา</h3>
            <ul className="space-y-2 text-sm">
              {[
                { icon: "M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z", text: "support@zenvyshop.xyz" },
                { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", text: "Thailand 🇹🇭" },
              ].map((c, i) => (
                <li key={i} className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 text-[#d44242]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={c.icon} />
                  </svg>
                  {c.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-500">
          <p>© 2026 ZenvyShop. All rights reserved.</p>
          <p>Built with Next.js 15 + Appwrite</p>
        </div>
      </div>
    </footer>
  );
}
