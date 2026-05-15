"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getProducts } from "@appwrite/database";
import { updateProduct } from "@appwrite/database";
import type { Product } from "@appwrite/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Product>>({});
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    getProducts({ limit: 100 }).then((r) => setProducts(r.documents)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function startEdit(p: Product) {
    setEditing(p.$id);
    setEditData({ name: p.name, price: p.price, stock: p.stock, deliveryEmail: p.deliveryEmail ?? "", deliveryPassword: p.deliveryPassword ?? "", description: p.description ?? "" });
  }

  async function saveEdit(id: string) {
    setSaving(true);
    try {
      const updated = await updateProduct(id, editData);
      setProducts((prev) => prev.map((p) => p.$id === id ? { ...p, ...updated } : p));
      setEditing(null);
    } catch {}
    finally { setSaving(false); }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-slate-400 dark:text-slate-500 hover:text-[#d44242] text-sm">← Admin</Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">จัดการสินค้า</h1>
          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">{products.length}</span>
        </div>

        {loading ? (
          <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 h-16 animate-pulse" />)}</div>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <div key={p.$id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {editing === p.$id ? (
                  <div className="p-5 space-y-3">
                    <div className="grid sm:grid-cols-3 gap-3">
                      {[
                        { label: "ชื่อ", key: "name", type: "text" },
                        { label: "ราคา (฿)", key: "price", type: "number" },
                        { label: "Stock", key: "stock", type: "number" },
                      ].map((f) => (
                        <div key={f.key}>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{f.label}</label>
                          <input type={f.type} value={(editData[f.key as keyof typeof editData] ?? "") as string}
                            onChange={(e) => setEditData({ ...editData, [f.key]: f.type === "number" ? parseFloat(e.target.value) : e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#d44242]" />
                        </div>
                      ))}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Delivery Email</label>
                        <input type="text" value={editData.deliveryEmail ?? ""}
                          onChange={(e) => setEditData({ ...editData, deliveryEmail: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#d44242]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Delivery Password</label>
                        <input type="text" value={editData.deliveryPassword ?? ""}
                          onChange={(e) => setEditData({ ...editData, deliveryPassword: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#d44242]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Description</label>
                      <textarea rows={3} value={editData.description ?? ""}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#d44242] resize-none" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(p.$id)} disabled={saving}
                        className="px-4 py-2 bg-[#d44242] hover:bg-[#E87A7A] text-white text-xs font-bold rounded-xl disabled:opacity-60">
                        {saving ? "กำลังบันทึก..." : "บันทึก"}
                      </button>
                      <button onClick={() => setEditing(null)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 rounded-xl hover:border-slate-400 transition-all">ยกเลิก</button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{p.name}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-[#d44242] font-bold">฿{p.price.toLocaleString()}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">Stock: {p.stock}</span>
                        {p.deliveryEmail && <span className="text-xs text-emerald-600 dark:text-emerald-400">✓ Email set</span>}
                        {p.deliveryPassword && <span className="text-xs text-emerald-600 dark:text-emerald-400">✓ Pass set</span>}
                      </div>
                    </div>
                    <button onClick={() => startEdit(p)} className="text-xs px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#d44242]/40 hover:text-[#d44242] transition-all flex-shrink-0">แก้ไข</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
