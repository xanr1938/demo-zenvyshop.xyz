"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProductCard, { DigitalProduct } from "@/components/ProductCard";
import Footer from "@/components/Footer";
import type { DigitalSettings } from "@/app/api/admin/gafiw-settings/route";
import ServiceMarquee from "@/components/ui/ServiceMarquee"

// สีแบรนด์ของแต่ละแอป
const CAT_COLORS: Record<string, { bg: string; light: string; border: string }> = {
  NETFLIX: { bg: "#E50914", light: "#FEE2E2", border: "#E50914" },
  YOUTUBE: { bg: "#FF0000", light: "#FEE2E2", border: "#FF0000" },
  Disney: { bg: "#1138C8", light: "#DBEAFE", border: "#1138C8" },
  HBO: { bg: "#5B21B6", light: "#EDE9FE", border: "#5B21B6" },
  WETV: { bg: "#15803D", light: "#DCFCE7", border: "#15803D" },
  VIU: { bg: "#D97706", light: "#FEF3C7", border: "#D97706" },
  BiliBili: { bg: "#FB7299", light: "#FCE7F3", border: "#FB7299" },
  IQIYI: { bg: "#00BE06", light: "#DCFCE7", border: "#00BE06" },
  Monomax: { bg: "#1D4ED8", light: "#DBEAFE", border: "#1D4ED8" },
  CH3Plus: { bg: "#EA580C", light: "#FFEDD5", border: "#EA580C" },
  PrimeVideo: { bg: "#00A8E0", light: "#E0F7FA", border: "#00A8E0" },
  TrueID: { bg: "#FF6B00", light: "#FFEDD5", border: "#FF6B00" },
  YouKu: { bg: "#FF6600", light: "#FFEDD5", border: "#FF6600" },
  ONE: { bg: "#DC2626", light: "#FEE2E2", border: "#DC2626" },
  Spotify: { bg: "#1DB954", light: "#DCFCE7", border: "#1DB954" },
  "CapCut Pro": { bg: "#18181B", light: "#F4F4F5", border: "#18181B" },
  "Gemini Pro": { bg: "#4285F4", light: "#DBEAFE", border: "#4285F4" },
  "Canva Pro": { bg: "#7C3AED", light: "#EDE9FE", border: "#7C3AED" },
  ChatGPT: { bg: "#10A37F", light: "#CCFBF1", border: "#10A37F" },
  "Meitu VIP": { bg: "#EC4899", light: "#FCE7F3", border: "#EC4899" },
  TESTAPI: { bg: "#6B7280", light: "#F3F4F6", border: "#6B7280" },
};

function getCatColor(menu: string) {
  return CAT_COLORS[menu] ?? { bg: "#d44242", light: "#FCE9E9", border: "#d44242" };
}

export default function ShopPage() {
  const [digital, setDigital] = useState<DigitalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/gafiw/products").then((r) => r.json()),
      fetch("/api/admin/gafiw-settings").then((r) => r.json()),
    ]).then(([pData, sData]) => {
      const all: DigitalProduct[] = pData.data ?? [];
      const settings: DigitalSettings = sData ?? {};
      const visible = all
        .filter((p) => settings[p.type_id]?.enabled !== false)
        .map((p) => settings[p.type_id]?.customPrice
          ? { ...p, pricevip: settings[p.type_id]!.customPrice! }
          : p
        );
      setDigital(visible);
    }).catch(() => { }).finally(() => setLoading(false));
  }, []);

  // หมวดหมู่ที่มีสินค้า
  const categories = [...new Set(digital.map((p) => p.type_menu))];

  const filtered = digital.filter((p) => {
    if (activeCategory && p.type_menu !== activeCategory) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeCatColor = activeCategory ? getCatColor(activeCategory) : null;

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">

        {/* Hero */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
            Zenvy<span className="text-[#d44242]">Shop</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Netflix · YouTube · Disney+ · HBO · VIU · WeTV · และอีกมาก
          </p>
        </div>

        <ServiceMarquee />

        {/* Search */}
        <div className="mb-5">
          <input
            type="text"
            placeholder="ค้นหาสินค้า..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#d44242]/30 focus:border-[#d44242] bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>

        {/* Category chips — สีแบรนด์ */}
        <div className="flex gap-2 flex-wrap mb-8">
          <button
            onClick={() => setCategory(null)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${activeCategory === null
              ? "bg-[#d44242] text-white border-[#d44242] shadow-md shadow-[#d44242]/25"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              }`}
          >
            ทั้งหมด
          </button>
          {categories.map((cat) => {
            const col = getCatColor(cat);
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(isActive ? null : cat)}
                style={isActive
                  ? { backgroundColor: col.bg, borderColor: col.bg, color: "#fff", boxShadow: `0 4px 12px ${col.bg}40` }
                  : { borderColor: col.border + "60", color: col.bg }
                }
                className="px-4 py-1.5 rounded-xl text-xs font-bold transition-all border bg-white dark:bg-slate-900"
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Active category banner */}
        {activeCatColor && activeCategory && (
          <div
            className="rounded-2xl px-5 py-3 mb-6 flex items-center gap-2"
            style={{ backgroundColor: activeCatColor.light, borderLeft: `4px solid ${activeCatColor.bg}` }}
          >
            <span className="text-xs font-bold" style={{ color: activeCatColor.bg }}>
              {activeCategory}
            </span>
            <span className="text-xs text-slate-500">— {filtered.length} รายการ</span>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
                <div className="aspect-square bg-slate-100 dark:bg-slate-800" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400 dark:text-slate-500">
            <p className="text-lg font-semibold mb-1">ไม่พบสินค้า</p>
            {search && <p className="text-sm">ลองค้นหาด้วยคำอื่น</p>}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((p) => (
              <ProductCard
                key={p.type_id}
                source="gafiw"
                product={p}
                accentColor={getCatColor(p.type_menu).bg}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
