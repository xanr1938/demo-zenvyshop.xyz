"use client";

import { useState, useRef, ChangeEvent, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

// ── แก้ข้อมูลบัญชีที่นี่ ──────────────────────────────────────────
const ACCOUNT = {
  promptpayId: "0943164353",
  bankName: "ธนาคารกรุงไทย",
  accountNumber: "6637747785",
  accountName: "นาย รอมซูอิฮซาน ทองรมย์",  // ← แก้ตรงนี้
};
// ─────────────────────────────────────────────────────────────────

type VerifyState = "idle" | "loading" | "success" | "error";

interface VerifyResult {
  success: boolean;
  message: string;
  paid?: number;
  sender?: string;
  date?: string;
  ref?: string;
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const amount = parseFloat(searchParams.get("amount") || "0");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [state, setState] = useState<VerifyState>("idle");
  const [result, setResult] = useState<VerifyResult | null>(null);

  useEffect(() => {
    if (!amount || amount < 10) router.push("/topup");
  }, [amount, router]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSlipFile(file);
    setSlipPreview(URL.createObjectURL(file));
    setResult(null);
    setState("idle");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setSlipFile(file);
    setSlipPreview(URL.createObjectURL(file));
    setResult(null);
    setState("idle");
  }

  async function handleVerify() {
    if (!slipFile) return;
    setState("loading");
    try {
      const form = new FormData();
      form.append("slip", slipFile);
      form.append("amount", amount.toString());
      form.append("userId", user?.$id ?? "");

      const res = await fetch("/api/verify-slip", { method: "POST", body: form });
      const data: VerifyResult = await res.json();
      setResult(data);
      setState(data.success ? "success" : "error");
    } catch {
      setResult({ success: false, message: "เกิดข้อผิดพลาด กรุณาลองใหม่" });
      setState("error");
    }
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
  }

  if (!amount || amount < 10) return null;

  // ── SUCCESS ────────────────────────────────────────────────────────
  if (state === "success" && result) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200 dark:border-emerald-800 p-10 text-center">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">ยืนยันสำเร็จ!</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">ระบบรับสลิปของคุณเรียบร้อยแล้ว</p>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 text-left space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400 dark:text-slate-500">ยอดเงิน</span>
            <span className="font-bold text-emerald-600">฿{result.paid?.toLocaleString()}</span>
          </div>
          {result.sender && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 dark:text-slate-500">ผู้โอน</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{result.sender}</span>
            </div>
          )}
          {result.ref && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 dark:text-slate-500">อ้างอิง</span>
              <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{result.ref}</span>
            </div>
          )}
        </div>
        <Link href="/" className="inline-block px-8 py-3.5 bg-[#d44242] text-white font-bold rounded-2xl text-sm">กลับหน้าแรก</Link>
      </div>
    );
  }

  return (
    <>
      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {["เลือกยอด", "ชำระเงิน", "สำเร็จ"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 text-xs font-semibold ${i === 1 ? "text-[#d44242]" : i === 0 ? "text-slate-400" : "text-slate-300"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 1 ? "bg-[#d44242] text-white" : i === 0 ? "bg-slate-200 dark:bg-slate-700 text-slate-500" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>{i === 0 ? "✓" : i + 1}</span>
              {s}
            </div>
            {i < 2 && <span className="text-slate-200 text-xs">›</span>}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Account Info + QR */}
        <div className="space-y-5">
          {/* Amount */}
          <div className="bg-[#d44242] rounded-3xl p-6 text-white text-center">
            <p className="text-white/70 text-xs mb-1">ยอดที่ต้องโอน</p>
            <p className="text-4xl font-extrabold">฿{amount.toLocaleString()}</p>
            <p className="text-white/60 text-xs mt-1">โอนให้ตรงยอดเพื่อยืนยันอัตโนมัติ</p>
          </div>

          {/* Account info */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">ข้อมูลบัญชีรับโอน</h3>
            {[
              { label: "ธนาคาร", value: ACCOUNT.bankName, copy: false },
              { label: "เลขบัญชี / PromptPay", value: ACCOUNT.accountNumber, copy: true },
              { label: "ชื่อบัญชี", value: ACCOUNT.accountName, copy: false },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{row.label}</p>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{row.value}</p>
                </div>
                {row.copy && (
                  <button
                    onClick={() => copyText(row.value)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#FCE9E9] dark:hover:bg-[#d44242]/15 hover:text-[#d44242] transition-colors text-slate-500 dark:text-slate-400 font-medium"
                  >
                    คัดลอก
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* QR Code */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 p-6 text-center">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">QR Code PromptPay</h3>
            <img
              src={`/api/qr-code?amount=${amount}&id=${ACCOUNT.promptpayId}`}
              alt="PromptPay QR"
              className="w-48 h-48 mx-auto rounded-2xl"
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">สแกนด้วยแอปธนาคาร</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{ACCOUNT.promptpayId.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")}</p>
          </div>
        </div>

        {/* Right: Slip Upload */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 p-6 flex flex-col">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">แนบสลิปการโอนเงิน</h3>

          {/* Upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`flex-1 min-h-[200px] rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${slipPreview ? "border-emerald-300 bg-emerald-50/30 dark:bg-emerald-900/10" : "border-slate-200 dark:border-slate-700 hover:border-[#d44242]/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
              }`}
          >
            {slipPreview ? (
              <img src={slipPreview} alt="slip" className="max-h-52 rounded-xl object-contain" />
            ) : (
              <>
                <svg className="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">คลิกหรือลากไฟล์มาวาง</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">JPG, PNG, WEBP สูงสุด 10 MB</p>
                </div>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {slipFile && (
            <button
              onClick={() => { setSlipFile(null); setSlipPreview(null); setState("idle"); setResult(null); }}
              className="text-xs text-slate-400 hover:text-[#d44242] mt-2 self-end transition-colors"
            >
              ลบสลิป
            </button>
          )}

          {/* Error message */}
          {state === "error" && result && (
            <div className="mt-3 p-3 bg-[#FCE9E9] dark:bg-[#d44242]/15 border border-[#d44242]/20 rounded-xl text-[#d44242] text-xs">
              {result.message}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleVerify}
            disabled={!slipFile || state === "loading"}
            className={`mt-4 w-full py-4 rounded-2xl font-bold text-sm transition-all ${!slipFile
              ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              : state === "loading"
                ? "bg-amber-400 text-white cursor-wait"
                : "bg-[#d44242] hover:bg-[#E87A7A] text-white shadow-lg shadow-[#d44242]/20"
              }`}
          >
            {state === "loading" ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                กำลังตรวจสอบสลิป...
              </span>
            ) : "ยืนยันการชำระเงิน"}
          </button>

          <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-3">
            ระบบจะตรวจสอบสลิปอัตโนมัติผ่าน SlipOK
          </p>
        </div>
      </div>
    </>
  );
}

export default function TopupPaymentPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <nav className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 mb-8">
          <Link href="/" className="hover:text-[#d44242] transition-colors">หน้าแรก</Link>
          <span>/</span>
          <Link href="/topup" className="hover:text-[#d44242] transition-colors">เติมเงิน</Link>
          <span>/</span>
          <span className="text-slate-600 dark:text-slate-300">ชำระเงิน</span>
        </nav>
        <Suspense fallback={<div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />}>
          <PaymentContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
