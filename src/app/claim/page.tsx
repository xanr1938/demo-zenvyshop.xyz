"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ClaimResult {
  lines: { label: string; value: string }[];
  raw: string;
}

function parseCredentials(raw: string): ClaimResult {
  const cleaned = raw.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim();
  const lines = cleaned.split("\n").filter(Boolean).map((line) => {
    const [label, ...rest] = line.split(":");
    return { label: label.trim(), value: rest.join(":").trim() };
  }).filter((l) => l.value);
  return { lines, raw: cleaned };
}

function ClaimPage() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("order_id") ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClaimResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  // auto-submit if order_id is in URL
  useEffect(() => {
    const id = searchParams.get("order_id");
    if (id) { setOrderId(id); handleClaim(id); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleClaim(id?: string) {
    const oid = id ?? orderId;
    if (!oid.trim()) { setError("กรุณากรอก Order ID"); return; }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/gafiw/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: Number(oid) }),
      });
      const data = await res.json();
      if (data.ok && data.data?.textdb) {
        setResult(parseCredentials(data.data.textdb));
      } else {
        setError(data.msg || data.message || "ไม่พบ Order นี้ หรือยังไม่ได้ชำระเงิน");
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-12">
        <nav className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 mb-8">
          <Link href="/" className="hover:text-[#d44242] transition-colors">หน้าแรก</Link>
          <span>/</span>
          <Link href="/history" className="hover:text-[#d44242] transition-colors">ประวัติการสั่งซื้อ</Link>
          <span>/</span>
          <span className="text-slate-600 dark:text-slate-300">เคลมสินค้า</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">เคลมสินค้า</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            กรอก Order ID จากประวัติการสั่งซื้อเพื่อดึง credentials ใหม่
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            zenvyshop Order ID
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleClaim()}
              placeholder="เช่น 12345"
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d44242]/30 focus:border-[#d44242] font-mono"
            />
            <button
              onClick={() => handleClaim()}
              disabled={loading}
              className="px-6 py-3 bg-[#d44242] hover:bg-[#E87A7A] disabled:opacity-60 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-[#d44242]/20 flex-shrink-0"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : "เคลม"}
            </button>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
            Order ID อยู่ในประวัติการสั่งซื้อ ข้างข้อมูล Streaming ของแต่ละรายการ
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 bg-[#FCE9E9] dark:bg-[#d44242]/15 border border-[#d44242]/20 text-[#d44242] text-sm rounded-2xl mb-6">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200 dark:border-emerald-800 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">พบข้อมูลสินค้า</p>
            </div>
            <div className="p-6 space-y-3">
              {result.lines.map((l, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold flex-shrink-0 w-24">{l.label}</span>
                  <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                    <span className="font-mono text-sm text-slate-900 dark:text-white break-all text-right">{l.value}</span>
                    <button
                      onClick={() => copy(l.value, l.label)}
                      className="text-xs flex-shrink-0 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#d44242] transition-colors"
                    >
                      {copied === l.label ? "✓" : "คัดลอก"}
                    </button>
                  </div>
                </div>
              ))}

              {/* Copy all */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => copy(result.raw, "__all__")}
                  className="w-full py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:border-[#d44242]/30 hover:text-[#d44242] transition-all"
                >
                  {copied === "__all__" ? "✓ คัดลอกแล้ว" : "คัดลอกทั้งหมด"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/history" className="text-sm text-slate-400 dark:text-slate-500 hover:text-[#d44242] transition-colors">
            ← กลับประวัติการสั่งซื้อ
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function ClaimPageWrapper() {
  return (
    <Suspense fallback={null}>
      <ClaimPage />
    </Suspense>
  );
}
