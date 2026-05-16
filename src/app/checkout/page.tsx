"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { adminFetch } from "@/lib/admin-fetch";

const PROMPTPAY_ID = "0943164353";
type PayMethod = "wallet" | "slip";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();

  const [payMethod, setPayMethod]   = useState<PayMethod>("wallet");
  const [note, setNote]             = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");

  // Slip states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [slipFile, setSlipFile]       = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [verifying, setVerifying]     = useState(false);
  const [slipVerified, setSlipVerified] = useState(false);

  const balance     = profile?.balance ?? 0;
  const canPayWallet = balance >= total;

  if (!user)          { router.push("/login"); return null; }
  if (items.length === 0) { router.push("/shop"); return null; }

  function handleSlipChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSlipFile(file);
    setSlipPreview(URL.createObjectURL(file));
    setSlipVerified(false);
    setError("");
  }

  async function handleVerifySlip() {
    if (!slipFile) return;
    setVerifying(true);
    setError("");
    try {
      const form = new FormData();
      form.append("slip", slipFile);
      form.append("amount", total.toString());
      const res  = await adminFetch("/api/verify-slip", { method: "POST", body: form });
      const data = await res.json();
      if (data.success) { setSlipVerified(true); await refreshProfile(); }
      else setError(data.message || "ยืนยันสลิปไม่สำเร็จ");
    } catch { setError("เกิดข้อผิดพลาด กรุณาลองใหม่"); }
    finally  { setVerifying(false); }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (payMethod === "slip" && !slipVerified) { setError("กรุณายืนยันสลิปก่อนสั่งซื้อ"); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await adminFetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.$id, name: i.name, qty: i.qty, price: i.price, source: i.source, type_id: i.type_id })),
          total,
          note,
          paymentMethod: payMethod,
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message || "สั่งซื้อไม่สำเร็จ"); return; }
      clearCart();
      // แจ้งถ้ามีรายการที่ล้มเหลวและได้รับเงินคืน
      if (data.refunded && data.failedItems?.length > 0) {
        await refreshProfile();
        router.push(`/history?refunded=${data.refunded}&failed=${data.failedItems.join(",")}`);
        return;
      }
      await refreshProfile();
      router.push("/history");
    } catch { setError("เกิดข้อผิดพลาด กรุณาลองใหม่"); }
    finally  { setSubmitting(false); }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <nav className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 mb-8">
          <Link href="/" className="hover:text-[#d44242] transition-colors">หน้าแรก</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#d44242] transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-slate-600 dark:text-slate-300">Checkout</span>
        </nav>

        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8">ยืนยันคำสั่งซื้อ</h1>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-5 gap-6">

          {/* ── Left: Order summary ──────────────────────────────────────── */}
          <div className="md:col-span-3 space-y-5">

            {/* Items */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-5">รายการสินค้า</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.$id} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden">
                      {item.source === "gafiw" && item._imageUrl ? (
                        <img src={item._imageUrl} className="w-full h-full object-contain p-1" alt={item.name}
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/2165/2165004.png"; }} />
                      ) : item.images?.[0] ? (
                        <img
                          src={`https://sgp.cloud.appwrite.io/v1/storage/buckets/product-images/files/${item.images[0]}/preview?project=69fb7f200039526c5d2e&width=96&height=96`}
                          className="w-full h-full object-cover"
                          alt={item.name}
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{item.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">จำนวน {item.qty} ชิ้น</p>
                    </div>
                    <p className="font-bold text-[#d44242] text-sm flex-shrink-0">฿{(item.price * item.qty).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-slate-100 dark:border-slate-800 mt-5 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 dark:text-white">ยอดรวม</span>
                  <span className="text-2xl font-extrabold text-[#d44242]">฿{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-6">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">หมายเหตุ (ถ้ามี)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="ระบุรายละเอียดเพิ่มเติม"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d44242]/30 focus:border-[#d44242]"
              />
            </div>
          </div>

          {/* ── Right: Payment ───────────────────────────────────────────── */}
          <div className="md:col-span-2 space-y-5">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-4">วิธีชำระเงิน</h2>

              {/* Wallet */}
              <button type="button" onClick={() => { setPayMethod("wallet"); setSlipVerified(false); }}
                className={`w-full p-4 rounded-2xl border-2 text-left mb-3 transition-all ${payMethod === "wallet" ? "border-[#d44242] bg-[#FCE9E9] dark:bg-[#d44242]/10" : "border-slate-200 dark:border-slate-700 hover:border-[#d44242]/40"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${payMethod === "wallet" ? "border-[#d44242]" : "border-slate-300 dark:border-slate-600"}`}>
                      {payMethod === "wallet" && <div className="w-2 h-2 rounded-full bg-[#d44242]" />}
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">กระเป๋าเงิน</span>
                  </div>
                  <span className={`text-sm font-bold ${canPayWallet ? "text-emerald-600 dark:text-emerald-400" : "text-[#d44242]"}`}>฿{balance.toLocaleString()}</span>
                </div>
                {!canPayWallet && (
                  <p className="text-xs text-[#d44242] mt-2 ml-6">
                    ยอดไม่พอ — <Link href="/topup" className="underline font-semibold">เติมเงิน</Link>{` ฿${(total - balance).toLocaleString()} อีก`}
                  </p>
                )}
              </button>

              {/* Slip */}
              <button type="button" onClick={() => setPayMethod("slip")}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${payMethod === "slip" ? "border-[#d44242] bg-[#FCE9E9] dark:bg-[#d44242]/10" : "border-slate-200 dark:border-slate-700 hover:border-[#d44242]/40"}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${payMethod === "slip" ? "border-[#d44242]" : "border-slate-300 dark:border-slate-600"}`}>
                    {payMethod === "slip" && <div className="w-2 h-2 rounded-full bg-[#d44242]" />}
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">โอน PromptPay + สลิป</span>
                </div>
              </button>

              {payMethod === "slip" && (
                <div className="mt-4 space-y-4">
                  <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-800 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">QR PromptPay ฿{total.toLocaleString()}</p>
                    <img src={`/api/qr-code?amount=${total}&id=${PROMPTPAY_ID}`} alt="QR" className="w-36 h-36 rounded-xl" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">{PROMPTPAY_ID.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">แนบสลิป</p>
                    <div onClick={() => fileInputRef.current?.click()}
                      className={`rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 p-4 min-h-[100px] transition-all relative ${slipVerified ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20" : "border-slate-200 dark:border-slate-700 hover:border-[#d44242]/40"}`}>
                      {slipPreview
                        ? <img src={slipPreview} alt="slip" className="max-h-24 rounded-xl object-contain" />
                        : <p className="text-xs text-slate-400 dark:text-slate-500">คลิกเพื่อเลือกสลิป</p>}
                      {slipVerified && <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">✓ ยืนยันแล้ว</span>}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleSlipChange} />
                    {slipFile && !slipVerified && (
                      <button type="button" onClick={handleVerifySlip} disabled={verifying}
                        className="mt-2 w-full py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold disabled:opacity-60">
                        {verifying ? "กำลังตรวจสอบ..." : "ยืนยันสลิป"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="px-4 py-3 bg-[#FCE9E9] dark:bg-[#d44242]/15 border border-[#d44242]/20 text-[#d44242] text-sm rounded-2xl">{error}</div>
            )}

            <button type="submit"
              disabled={submitting || (payMethod === "wallet" && !canPayWallet) || (payMethod === "slip" && !slipVerified)}
              className="w-full py-4 bg-[#d44242] hover:bg-[#E87A7A] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-lg shadow-[#d44242]/20 text-sm">
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  กำลังสั่งซื้อ...
                </span>
              ) : "ยืนยันคำสั่งซื้อ"}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
}
