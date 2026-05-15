"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { getUserOrders } from "@appwrite/database";
import { subscribeToUserOrders } from "@appwrite/realtime";
import type { Order, OrderStatus } from "@appwrite/types";
import { RealtimeResponseEvent } from "appwrite";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800",
  confirmed: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800",
  paid: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800",
  cancelled: "text-slate-400 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700",
  disputed: "text-[#d44242] bg-[#FCE9E9] border-[#d44242]/20 dark:bg-[#d44242]/15 dark:border-[#d44242]/30",
};

interface OrderItem {
  id: string; name: string; qty: number; price: number;
  source?: "appwrite" | "gafiw";
  description?: string; deliveryEmail?: string; deliveryPassword?: string;
  // GaFiwShop
  gafiwOrderId?: number; gafiwCredentials?: string;
}

function parseItems(raw: string): OrderItem[] {
  try { return JSON.parse(raw); } catch { return []; }
}

function PasswordField({ value }: { value: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="font-mono text-sm text-slate-900 dark:text-white break-all">
        {show ? value : "•".repeat(Math.min(value.length, 16))}
      </span>
      <button type="button" onClick={() => setShow(!show)} className="text-xs text-slate-400 hover:text-[#d44242] transition-colors">{show ? "ซ่อน" : "แสดง"}</button>
      <button type="button" onClick={() => navigator.clipboard.writeText(value)} className="text-xs text-slate-400 hover:text-[#d44242] transition-colors">คัดลอก</button>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const items = parseItems(order.items);
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full p-5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left">
        <div className="min-w-0">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mb-0.5">#{order.$id.slice(-8).toUpperCase()}</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{items.length} รายการ</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {new Date(order.$createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}>{order.status}</span>
            <p className="text-base font-extrabold text-[#d44242] mt-1">฿{order.total.toLocaleString()}</p>
          </div>
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((item, idx) => (
            <div key={idx} className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</p>
                <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">x{item.qty} — ฿{(item.price * item.qty).toLocaleString()}</span>
              </div>
              {item.description && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">รายละเอียด</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{item.description}</p>
                </div>
              )}
              {/* GaFiwShop credentials */}
              {item.source === "gafiw" && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-[#d44242] uppercase tracking-wide">ข้อมูล Streaming</p>
                    {item.gafiwOrderId && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">Order ID:</span>
                        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">{item.gafiwOrderId}</span>
                        <button onClick={() => navigator.clipboard.writeText(String(item.gafiwOrderId))} className="text-[10px] text-slate-400 hover:text-[#d44242] transition-colors">คัดลอก</button>
                      </div>
                    )}
                  </div>
                  {item.gafiwCredentials && item.gafiwCredentials.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim().split("\n").filter(Boolean).map((line, i) => {
                    const [label, ...rest] = line.split(":");
                    const val = rest.join(":").trim();
                    return val ? (
                      <div key={i} className="flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold flex-shrink-0">{label.trim()}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-slate-900 dark:text-white break-all">{val}</span>
                          <button onClick={() => navigator.clipboard.writeText(val)} className="text-xs text-slate-400 hover:text-[#d44242]">คัดลอก</button>
                        </div>
                      </div>
                    ) : <p key={i} className="text-xs text-slate-400 dark:text-slate-500">{line}</p>;
                  })}
                  {!item.gafiwCredentials && item.gafiwOrderId && (
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      ยังไม่ได้รับ credentials —{" "}
                      <a href={`/claim?order_id=${item.gafiwOrderId}`} className="text-[#d44242] font-semibold hover:underline">เคลมสินค้า →</a>
                    </p>
                  )}
                </div>
              )}
              {(item.deliveryEmail || item.deliveryPassword) && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-3">
                  <p className="text-[10px] font-bold text-[#d44242] uppercase tracking-wide">ข้อมูลสินค้าดิจิทัล</p>
                  {item.deliveryEmail && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1">Email</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-slate-900 dark:text-white break-all">{item.deliveryEmail}</span>
                        <button onClick={() => navigator.clipboard.writeText(item.deliveryEmail!)} className="text-xs text-slate-400 hover:text-[#d44242] transition-colors flex-shrink-0">คัดลอก</button>
                      </div>
                    </div>
                  )}
                  {item.deliveryPassword && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1">Password / License</p>
                      <PasswordField value={item.deliveryPassword} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryPage() {
  const { user, profile } = useAuth();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const refunded = searchParams.get("refunded");
  const failedItems = searchParams.get("failed");

  useEffect(() => {
    if (!user) return;
    getUserOrders(user.$id).then((r) => setOrders(r.documents)).catch(() => setOrders([])).finally(() => setLoading(false));
    const unsub = subscribeToUserOrders(user.$id, (event: RealtimeResponseEvent<unknown>) => {
      const updated = event.payload as Order;
      setOrders((prev) => prev.map((o) => (o.$id === updated.$id ? { ...o, ...updated } : o)));
    });
    return () => unsub();
  }, [user]);

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">History</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{user?.email}</p>
          </div>
          <Link href="/claim" className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:border-[#d44242]/40 hover:text-[#d44242] transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
            เคลมสินค้า
          </Link>
        </div>

        {/* Refund notification */}
        {refunded && (
          <div className="mb-5 px-5 py-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
            <p className="font-semibold text-amber-700 dark:text-amber-400 text-sm mb-1">
              ⚠️ บางรายการซื้อไม่สำเร็จ — คืนเงิน ฿{parseFloat(refunded).toLocaleString()} แล้ว
            </p>
            {failedItems && (
              <p className="text-xs text-amber-600 dark:text-amber-500">
                รายการที่ไม่สำเร็จ: {failedItems.split(",").join(", ")}
              </p>
            )}
            <p className="text-xs text-amber-500 dark:text-amber-600 mt-1">
              สาเหตุ: ยอดเงินต้นทาง (GaFiwShop) ไม่เพียงพอ กรุณาติดต่อแอดมินเพื่อเติมยอด
            </p>
          </div>
        )}
        {/* <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide">ยอดเงินในกระเป๋า</p>
            <p className="text-2xl font-extrabold text-[#d44242] mt-1">฿{(profile?.balance ?? 0).toLocaleString()}</p>
          </div>
          <Link href="/topup" className="px-5 py-2.5 bg-[#d44242] hover:bg-[#E87A7A] text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-[#d44242]/20">เติมเงิน</Link>
        </div> */}
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse h-24" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
            <p className="text-lg font-semibold mb-1">ยังไม่มีคำสั่งซื้อ</p>
            <p className="text-sm mb-4">เริ่มช้อปเพื่อดูประวัติที่นี่</p>
            <Link href="/shop" className="px-6 py-2.5 bg-[#d44242] text-white font-bold rounded-xl text-sm">ไปช้อปเลย</Link>
          </div>
        ) : (
          <div className="space-y-3">{orders.map((order) => <OrderCard key={order.$id} order={order} />)}</div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default function DashboardPageWrapper() {
  return (
    <Suspense fallback={null}>
      <HistoryPage />
    </Suspense>
  );
}
