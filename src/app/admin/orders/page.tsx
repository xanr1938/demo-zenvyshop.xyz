"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { adminFetch } from "@/lib/admin-fetch";

interface Order {
  $id: string; $createdAt: string; userId: string;
  status: string; total: number; items: string; note?: string;
}

const STATUSES = ["pending","confirmed","paid","cancelled","disputed"] as const;
const STATUS_STYLES: Record<string, string> = {
  pending:   "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20",
  confirmed: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20",
  paid:      "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20",
  cancelled: "text-slate-400 bg-slate-100 border-slate-200 dark:bg-slate-800",
  disputed:  "text-[#d44242] bg-[#FCE9E9] border-[#d44242]/20",
};

export default function AdminOrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    adminFetch("/api/admin/orders").then((r) => r.json()).then((d) => setOrders(d.documents ?? [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function updateStatus(orderId: string, status: string) {
    setUpdating(orderId);
    try {
      await adminFetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, status }) });
      setOrders((prev) => prev.map((o) => o.$id === orderId ? { ...o, status } : o));
    } catch {}
    finally { setUpdating(null); }
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-slate-400 dark:text-slate-500 hover:text-[#d44242] text-sm">← Admin</Link>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">คำสั่งซื้อทั้งหมด</h1>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full">{orders.length}</span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", ...STATUSES].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${filter === s ? "bg-[#d44242] text-white border-[#d44242]" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#d44242]/40"}`}>
              {s === "all" ? "ทั้งหมด" : s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 h-20 animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">ไม่มีคำสั่งซื้อ</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => {
              const items = (() => { try { return JSON.parse(order.items); } catch { return []; } })() as { name: string; qty: number }[];
              return (
                <div key={order.$id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-slate-400 dark:text-slate-500 mb-1">#{order.$id.slice(-8).toUpperCase()}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 truncate">
                        {items.map((i) => `${i.name} x${i.qty}`).join(", ")}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {new Date(order.$createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-extrabold text-[#d44242]">฿{order.total.toLocaleString()}</span>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[order.status] ?? ""}`}>{order.status}</span>
                    </div>
                  </div>
                  {/* Status update */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {STATUSES.filter((s) => s !== order.status).map((s) => (
                      <button key={s} onClick={() => updateStatus(order.$id, s)} disabled={updating === order.$id}
                        className="text-[11px] px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-[#d44242]/40 hover:text-[#d44242] transition-all disabled:opacity-50">
                        → {s}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
