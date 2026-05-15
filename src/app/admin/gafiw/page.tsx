"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { GafiwProduct } from "@/components/ProductCard";
import type { GafiwSettings } from "@/app/api/admin/gafiw-settings/route";

export default function AdminGafiwPage() {
  const [products, setProducts] = useState<GafiwProduct[]>([]);
  const [settings, setSettings] = useState<GafiwSettings>({});
  const [balance,  setBalance]  = useState<string | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [filter,   setFilter]   = useState<"all" | "on" | "off">("all");
  const [search,   setSearch]   = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [pRes, sRes, bRes] = await Promise.all([
      fetch("/api/gafiw/products").then((r) => r.json()),
      fetch("/api/admin/gafiw-settings").then((r) => r.json()),
      fetch("/api/gafiw/balance").then((r) => r.json()),
    ]);
    const prods: GafiwProduct[] = pRes.data ?? [];
    setProducts(prods);
    // Initialize settings for new products
    const base: GafiwSettings = {};
    for (const p of prods) {
      base[p.type_id] = sRes[p.type_id] ?? { enabled: true, customPrice: undefined };
    }
    setSettings(base);
    setBalance(bRes.msg ?? null);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function toggle(type_id: string) {
    setSettings((prev) => ({
      ...prev,
      [type_id]: { ...prev[type_id], enabled: !prev[type_id]?.enabled },
    }));
  }

  function setPrice(type_id: string, val: string) {
    setSettings((prev) => ({
      ...prev,
      [type_id]: { ...prev[type_id], customPrice: val === "" ? undefined : parseFloat(val) },
    }));
  }

  async function save() {
    setSaving(true);
    await fetch("/api/admin/gafiw-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // Derived counts
  const enabledCount  = Object.values(settings).filter((s) => s.enabled).length;
  const disabledCount = Object.values(settings).filter((s) => !s.enabled).length;

  const visible = products.filter((p) => {
    const s = settings[p.type_id];
    if (filter === "on"  && !s?.enabled) return false;
    if (filter === "off" && s?.enabled)  return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.type_menu.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/admin" className="text-slate-400 dark:text-slate-500 hover:text-[#d44242] text-sm">← Admin</Link>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">GaFiwShop Products</h1>
          </div>
          {/* Balance card */}
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 flex flex-col items-end">
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">ยอดเงินต้นทาง (GaFiw)</p>
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {balance ?? "—"}
              </p>
            </div>
            <button onClick={save} disabled={saving}
              className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg ${saved ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-[#d44242] hover:bg-[#E87A7A] text-white shadow-[#d44242]/20 disabled:opacity-60"}`}>
              {saved ? "✓ บันทึกแล้ว" : saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
            </button>
          </div>
        </div>

        {/* Stats chips */}
        <div className="flex gap-2 mb-5 flex-wrap items-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{products.length} สินค้า:</span>
          <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
            ✓ เปิดขาย {enabledCount}
          </span>
          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-full border border-slate-200 dark:border-slate-700">
            ✗ ปิด {disabledCount}
          </span>
        </div>

        {/* Filter + search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input type="text" placeholder="ค้นหาสินค้า..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#d44242]" />
          <div className="flex gap-2">
            {(["all","on","off"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${filter === f ? "bg-[#d44242] text-white border-[#d44242]" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#d44242]/40"}`}>
                {f === "all" ? "ทั้งหมด" : f === "on" ? "✓ เปิด" : "✗ ปิด"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">{[1,2,3,4,5].map((i) => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)}</div>
        ) : (
          <div className="space-y-2">
            {visible.map((p) => {
              const s = settings[p.type_id] ?? { enabled: true };
              const displayPrice = s.customPrice ?? p.pricevip;
              const discount     = p.price > displayPrice ? Math.round((1 - displayPrice / p.price) * 100) : 0;

              return (
                <div key={p.type_id} className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all overflow-hidden ${s.enabled ? "border-slate-200 dark:border-slate-700" : "border-slate-100 dark:border-slate-800 opacity-60"}`}>
                  <div className="p-4 flex items-center gap-4 flex-wrap">
                    {/* Image */}
                    <img src={p.imageapi} alt={p.name} className="w-10 h-10 rounded-xl object-contain bg-slate-100 dark:bg-slate-800 p-1 flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/2165/2165004.png"; }} />

                    {/* Name + category */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{p.type_menu}</span>
                        <span className={`text-[10px] font-semibold ${p.stock > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-[#d44242]"}`}>
                          {p.stock > 0 ? `stock ${p.stock}` : "หมด"}
                        </span>
                      </div>
                    </div>

                    {/* Prices */}
                    <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                      {/* Cost price (from GaFiw) */}
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">ต้นทุน</p>
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">฿{p.pricevip}</p>
                      </div>

                      {/* Custom selling price */}
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">ราคาขาย</p>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400">฿</span>
                          <input
                            type="number"
                            min={p.pricevip}
                            value={s.customPrice ?? ""}
                            placeholder={String(p.pricevip)}
                            onChange={(e) => setPrice(p.type_id, e.target.value)}
                            className="w-16 text-sm font-bold text-[#d44242] bg-transparent border-b border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#d44242] text-right"
                          />
                        </div>
                      </div>

                      {/* Margin */}
                      {s.customPrice && s.customPrice > p.pricevip && (
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">กำไร</p>
                          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+฿{(s.customPrice - p.pricevip).toFixed(0)}</p>
                        </div>
                      )}

                      {/* Toggle */}
                      <button
                        onClick={() => toggle(p.type_id)}
                        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${s.enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`}
                        aria-label="Toggle"
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${s.enabled ? "left-7" : "left-1"}`} />
                      </button>
                      <span className="text-xs font-semibold w-10 text-left flex-shrink-0">
                        {s.enabled
                          ? <span className="text-emerald-600 dark:text-emerald-400">เปิด</span>
                          : <span className="text-slate-400">ปิด</span>}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Save floating button on mobile */}
        <div className="fixed bottom-6 right-6 sm:hidden">
          <button onClick={save} disabled={saving}
            className="w-14 h-14 rounded-full bg-[#d44242] hover:bg-[#E87A7A] text-white shadow-xl flex items-center justify-center disabled:opacity-60">
            {saved ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            )}
          </button>
        </div>
      </main>
    </>
  );
}
