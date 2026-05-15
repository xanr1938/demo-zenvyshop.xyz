"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId") ?? "";
  const status  = params.get("status") ?? "pending";
  const isPaid  = status === "paid";

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      {/* Icon */}
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isPaid ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-amber-50 dark:bg-amber-900/20"}`}>
        {isPaid ? (
          <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        ) : (
          <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        )}
      </div>

      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
        {isPaid ? "สั่งซื้อสำเร็จ! 🎉" : "รับคำสั่งซื้อแล้ว"}
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
        {isPaid
          ? "ชำระเงินเรียบร้อย ขอบคุณที่ใช้บริการ ZenvyShop"
          : "คำสั่งซื้อของคุณอยู่ระหว่างรอการชำระเงิน"}
      </p>

      {/* Order ID */}
      {orderId && (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-8 inline-block">
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">หมายเลขคำสั่งซื้อ</p>
          <p className="font-mono font-bold text-slate-900 dark:text-white text-lg tracking-wider">
            #{orderId.slice(-8).toUpperCase()}
          </p>
        </div>
      )}

      {/* Status badge */}
      <div className="mb-8">
        <span className={`inline-block text-xs font-bold px-4 py-2 rounded-full border ${
          isPaid
            ? "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800"
            : "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800"
        }`}>
          {isPaid ? "✓ ชำระเงินแล้ว" : "⏳ รอชำระเงิน"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-[#d44242] hover:bg-[#E87A7A] text-white font-bold rounded-2xl transition-all shadow-md shadow-[#d44242]/20 text-sm"
        >
          ดูคำสั่งซื้อของฉัน
        </Link>
        <Link
          href="/shop"
          className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-2xl hover:border-[#d44242]/40 hover:text-[#d44242] transition-all text-sm"
        >
          ช้อปต่อ
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <>
      <Navbar />
      <main>
        <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#d44242] border-t-transparent rounded-full animate-spin" /></div>}>
          <SuccessContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
