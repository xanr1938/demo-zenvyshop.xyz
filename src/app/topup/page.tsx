"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const PRESETS = [50, 100, 200, 500, 1000];

export default function TopupPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  function handlePreset(val: number) {
    setAmount(val.toString());
    setError("");
  }

  function handleNext() {
    const num = parseFloat(amount);
    if (!amount || isNaN(num)) { setError("กรุณากรอกยอดเงิน"); return; }
    if (num < 10) { setError("ยอดขั้นต่ำ 10 บาท"); return; }
    if (num > 50000) { setError("ยอดสูงสุด 50,000 บาท"); return; }
    router.push(`/topup/payment?amount=${num}`);
  }

  if (!loading && !user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-500 mb-4">กรุณาเข้าสู่ระบบก่อนเติมเงิน</p>
            <Link href="/login" className="px-6 py-2.5 bg-[#d44242] text-white rounded-xl font-semibold text-sm">เข้าสู่ระบบ</Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-12">
        <nav className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 mb-8">
          <Link href="/" className="hover:text-[#d44242] transition-colors">หน้าแรก</Link>
          <span>/</span>
          <span className="text-slate-600 dark:text-slate-300">เติมเงิน</span>
        </nav>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {["เลือกยอด", "ชำระเงิน", "สำเร็จ"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 text-xs font-semibold ${i === 0 ? "text-[#d44242]" : "text-slate-300"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-[#d44242] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>{i + 1}</span>
                {s}
              </div>
              {i < 2 && <span className="text-slate-200 text-xs">›</span>}
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 p-8">
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6">เติมเงินกระเป๋า</h1>

          {/* Presets */}
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">เลือกยอดที่ต้องการ</p>
          <div className="grid grid-cols-5 gap-2 mb-5">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => handlePreset(p)}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all border ${
                  amount === p.toString()
                    ? "bg-[#d44242] text-white border-[#d44242] shadow-md shadow-[#d44242]/20"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#d44242]/40"
                }`}
              >
                ฿{p}
              </button>
            ))}
          </div>

          {/* Manual input */}
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">หรือกรอกยอดเอง</p>
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">฿</span>
            <input
              type="number"
              min="10"
              max="50000"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(""); }}
              placeholder="0"
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#d44242]/30 focus:border-[#d44242] bg-white dark:bg-slate-800 text-right font-semibold text-slate-900 dark:text-white text-lg"
            />
          </div>

          {error && (
            <p className="text-[#d44242] text-xs mb-4">{error}</p>
          )}

          {amount && !isNaN(parseFloat(amount)) && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-6 flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">ยอดที่จะเติม</span>
              <span className="text-xl font-extrabold text-[#d44242]">฿{parseFloat(amount).toLocaleString()}</span>
            </div>
          )}

          <button
            onClick={handleNext}
            className="w-full py-4 bg-[#d44242] hover:bg-[#E87A7A] text-white font-bold rounded-2xl transition-all shadow-lg shadow-[#d44242]/20 text-sm"
          >
            ถัดไป — ดูข้อมูลการโอน →
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
