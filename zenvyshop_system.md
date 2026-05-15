# ZenvyShop Design System v1 — New Platform Reference

> Generated: 2026-05-04  Updated: 2026-05-04
> Scope: เว็บใหม่ที่ใช้ธีมเดียวกับ ZenvyShop + 4 feature หลัก:
> E-commerce · Cross-Platform (Mobile-first) · Max Security (Cloudflare)

---

## 1) Stack (เหมือน ZenvyShop v1 ทุกอย่าง)

| Layer | Library | Version |
|---|---|---|
| Framework | React 19 | `^19.0.0` |
| Build | NEXTJS 6 | ? |
| Styling | Tailwind CSS v4 | `^4.1.14` |
| Animation | Motion (Framer) | `^12.23.24` |
| Icons | Lucide React | `^0.546.0` |
| Router | React Router v7 | `^7.14.0` |
| Backend | Appwrite (Auth + DB + Storage + Realtime) | `^2.x` |
| Charts | Recharts | `^3.8.1` |
| Language | TypeScript 5.8 | `~5.8.2` |

> ดู zenvyshop_system_new.md สำหรับ global CSS, font, dark mode, base component patterns

---

## 2) Brand Colors (สืบทอดจาก v1 + เพิ่ม Semantic)

### 2.1 Core Brand (ไม่เปลี่ยน)
```css
--color-brand-main:  #d44242;   /* Primary action, accent */
--color-brand-hover: #E87A7A;   /* Hover state */
--color-brand-soft:  #FCE9E9;   /* Light bg chip/badge */
```

### 2.2 Status Colors (Order / Payment)
```
Pending   → text-amber-600   bg-amber-50   border-amber-200
            dark: text-amber-400 bg-amber-400/10 border-amber-400/20

Confirmed → text-emerald-700 bg-emerald-50 border-emerald-200
            dark: text-emerald-400 bg-emerald-400/10 border-emerald-400/20

Disputed  → text-[#d44242]   bg-[#FCE9E9]  border-[#d44242]/20
            dark: text-[#E87A7A] bg-[#d44242]/15 border-[#d44242]/20

Cancelled → text-slate-400   bg-slate-100  border-slate-200
            dark: text-slate-500 bg-slate-800 border-white/10

Paid      → text-emerald-700 bg-emerald-50 border-emerald-200 (เหมือน confirmed)
Overdue   → text-[#d44242]   bg-[#FCE9E9]  border-[#d44242]/20
```

## 4) E-Commerce Components

### 4.1 Product Card
```tsx
/* Grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 */
function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative bg-white/80 dark:bg-slate-900/70 rounded-3xl border 
      border-slate-200/60 dark:border-white/8 overflow-hidden 
      hover:shadow-xl hover:-translate-y-1 hover:border-[#d44242]/25 transition-all duration-300">
      <Corner pos="tl" /><Corner pos="br" />
      
      {/* Image */}
      <div className="aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
        <img src={product.image} alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {product.discount > 0 && (
          <span className="absolute top-3 left-3 px-2 py-0.5 bg-[#d44242] text-white text-[10px] font-bold rounded-full">
            -{product.discount}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/70 flex items-center justify-center">
            <span className="font-mono text-xs font-bold text-slate-500 tracking-widest">OUT OF STOCK</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <p className="font-mono text-[9px] text-slate-400 dark:text-slate-600 tracking-widest uppercase mb-1">
          {product.category}
        </p>
        <h3 className="font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-[#d44242] transition-colors">
          {product.name}
        </h3>
        <div className="flex items-end justify-between gap-2">
          <div>
            <span className="text-xl font-extrabold text-[#d44242]">฿{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="ml-2 text-xs text-slate-400 line-through">฿{product.originalPrice.toLocaleString()}</span>
            )}
          </div>
          <button disabled={product.stock === 0}
            className="px-4 py-2 bg-[#d44242] hover:bg-[#E87A7A] disabled:bg-slate-200 disabled:cursor-not-allowed text-white disabled:text-slate-400 text-xs font-bold rounded-xl transition-all shadow-md shadow-[#d44242]/20 disabled:shadow-none">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 4.2 Cart Drawer (Slide-in จากขวา)
```tsx
/* ใช้ AnimatePresence + motion.div */
<motion.div
  initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
  className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-slate-950 
    border-l border-slate-200 dark:border-white/5 shadow-2xl z-50 flex flex-col">
  
  {/* Header */}
  <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
    <h2 className="font-bold text-slate-900 dark:text-white">Cart ({count})</h2>
    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      <X className="w-5 h-5 text-slate-500" />
    </button>
  </div>

  {/* Items */}
  <div className="flex-1 overflow-y-auto p-6 space-y-4">
    {items.map(item => <CartItem key={item.id} item={item} />)}
  </div>

  {/* Footer */}
  <div className="p-6 border-t border-slate-100 dark:border-white/5 space-y-4">
    <div className="flex justify-between font-extrabold text-lg">
      <span className="text-slate-900 dark:text-white">Total</span>
      <span className="text-[#d44242]">฿{total.toLocaleString()}</span>
    </div>
    <Link to="/cart/checkout"
      className="block w-full text-center py-4 bg-[#d44242] hover:bg-[#E87A7A] text-white font-bold rounded-2xl transition-all shadow-xl shadow-[#d44242]/20">
      Checkout
    </Link>
  </div>
</motion.div>
```

### Status Colors

| Status | Light | Dark |
|---|---|---|
| Pending | `text-amber-600 bg-amber-50 border-amber-200` | `text-amber-400 bg-amber-400/10` |
| Confirmed/Paid | `text-emerald-700 bg-emerald-50 border-emerald-200` | `text-emerald-400 bg-emerald-400/10` |
| Disputed/Overdue | `text-[#d44242] bg-[#FCE9E9] border-[#d44242]/20` | `text-[#E87A7A] bg-[#d44242]/15` |
| Cancelled | `text-slate-400 bg-slate-100 border-slate-200` | `text-slate-500 bg-slate-800` |