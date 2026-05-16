"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { DigitalProduct } from "@/components/ProductCard";

const SERVICES = [
  { name: "Netflix", color: "#E50914", img: "https://gafiwshop.xyz/api/image/netflix.png" },
  { name: "YouTube", color: "#FF0000", img: "https://gafiwshop.xyz/api/image/yt.png" },
  { name: "Disney+", color: "#1138C8", img: "https://gafiwshop.xyz/api/image/Disney.png" },
  { name: "HBO Max", color: "#5B21B6", img: "https://gafiwshop.xyz/api/image/max.jpeg" },
  { name: "WeTV", color: "#15803D", img: "https://gafiwshop.xyz/api/image/wetv.png" },
  { name: "VIU", color: "#D97706", img: "https://gafiwshop.xyz/api/image/viu.png" },
  { name: "BiliBili", color: "#FB7299", img: "https://gafiwshop.xyz/api/image/bili.png" },
  { name: "iQIYI", color: "#00BE06", img: "https://gafiwshop.xyz/api/image/iq.png" },
  { name: "Prime Video", color: "#00A8E0", img: "https://gafiwshop.xyz/api/image/pv.png" },
  { name: "ChatGPT", color: "#10A37F", img: "https://gafiwshop.xyz/api/image/ChatGPT.png" },
  { name: "Canva Pro", color: "#7C3AED", img: "https://gafiwshop.xyz/api/image/canva.png" },
  { name: "Spotify", color: "#1DB954", img: "https://gafiwshop.xyz/api/image/spotify.png" },
];

const STEPS = [
  { n: "01", icon: "M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z", title: "เลือกสินค้า", desc: "เลือก Streaming ที่ต้องการจาก Netflix, YouTube, Disney+ และอีกมาก" },
  { n: "02", icon: "M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z", title: "เติมเงิน", desc: "เติมเงินเข้ากระเป๋าผ่าน PromptPay ง่าย สะดวก รวดเร็ว" },
  { n: "03", icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z", title: "รับทันที", desc: "ได้รับ Email + Password ทันทีหลังจ่าย ไม่ต้องรอนาน" },
];

const MAINTENANCE_MESSAGES: Record<string, { title: string; detail: string }> = {
  server:   { title: "กำลังปรับปรุงเซิร์ฟเวอร์",  detail: "เราปรับปรุงระบบเพื่อประสิทธิภาพที่ดีขึ้น" },
  migrate:  { title: "กำลังย้ายเครื่องเซิร์ฟเวอร์", detail: "เรากำลังย้ายข้อมูลไปยังเซิร์ฟเวอร์ใหม่" },
  database: { title: "กำลังย้ายฐานข้อมูล",          detail: "เรากำลังอัปเดตโครงสร้างฐานข้อมูล" },
};

function MaintenanceOverlay({ type }: { type: string }) {
  const { title, detail } = MAINTENANCE_MESSAGES[type] ?? { title: "กำลังปรับปรุงระบบ", detail: "ใช้เวลาสักครู่" };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center px-4">
      <div className="w-20 h-20 rounded-3xl bg-[#d44242]/10 border border-[#d44242]/20 flex items-center justify-center mb-8">
        <svg className="w-10 h-10 text-[#d44242]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63" />
        </svg>
      </div>
      <p className="text-xs font-bold text-[#d44242] tracking-[0.2em] uppercase mb-4">Maintenance</p>
      <h1 className="text-3xl font-extrabold text-white text-center mb-3">{title}</h1>
      <p className="text-slate-400 text-sm text-center max-w-xs leading-relaxed mb-10">
        {detail}<br />กรุณารอสักครู่ ขออภัยในความไม่สะดวก
      </p>
      <div className="flex gap-2">
        <span className="w-2 h-2 rounded-full bg-[#d44242] animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 rounded-full bg-[#d44242] animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 rounded-full bg-[#d44242] animate-bounce [animation-delay:300ms]" />
      </div>
      <p className="text-slate-700 text-xs mt-12">ZenvyShop — ขอบคุณที่รอคอย</p>
    </div>
  );
}

function ServiceMarquee() {
  const doubled = [...SERVICES, ...SERVICES];
  return (
    <div className="overflow-hidden py-2">
      <div className="flex gap-4 animate-[marquee_25s_linear_infinite] w-max">
        {doubled.map((s, i) => (
          <div key={i} className="flex items-center gap-2.5 px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex-shrink-0 shadow-sm">
            <img src={s.img} alt={s.name} className="w-6 h-6 object-contain rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [featured, setFeatured] = useState<DigitalProduct[]>([]);
  const [maintenance, setMaintenance] = useState<{ enabled: boolean; type: string }>({ enabled: false, type: "server" });

  useEffect(() => {
    const check = () =>
      fetch("/api/maintenance").then((r) => r.json()).then(setMaintenance).catch(() => {});
    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/gafiw/products").then((r) => r.json()),
      fetch("/api/admin/gafiw-settings").then((r) => r.json()),
    ]).then(([pData, sData]) => {
      const all: DigitalProduct[] = pData.data ?? [];
      const visible = all
        .filter((p) => sData?.[p.type_id]?.enabled !== false && p.stock > 0)
        .map((p) => sData?.[p.type_id]?.customPrice ? { ...p, pricevip: sData[p.type_id].customPrice } : p)
        .sort((a, b) => a.pricevip - b.pricevip)
        .slice(0, 8);
      setFeatured(visible);
    }).catch(() => { });
  }, []);

  return (
    <>
      {maintenance.enabled && <MaintenanceOverlay type={maintenance.type} />}
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
      `}</style>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-950 min-h-[92vh] flex items-center border-b border-slate-100 dark:border-slate-900">
        {/* Gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#d44242]/10 dark:bg-[#d44242]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#d44242]/5 dark:bg-[#d44242]/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20 w-full">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#d44242]/10 border border-[#d44242]/30 rounded-full text-xs font-bold text-[#d44242] mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d44242] animate-pulse" />
              Streaming Premium ราคาถูก
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mb-6">
              ดู Streaming
              <br />
              <span className="text-[#d44242]">ราคาคุ้มค่า</span>
              <br />
              ส่งทันที
            </h1>

            <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
              Netflix · YouTube · Disney+ · HBO · VIU · WeTV · และอีกกว่า 20 แอป
              ราคาเริ่มต้นหลักสิบบาท รับ Email + Password ทันที
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/shop" className="px-8 py-4 bg-[#d44242] hover:bg-[#E87A7A] text-white font-extrabold rounded-2xl transition-all shadow-xl shadow-[#d44242]/25 text-base">
                เริ่มช้อปเลย →
              </Link>
              <Link href="/register" className="px-8 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white font-bold rounded-2xl border border-slate-200 dark:border-white/20 transition-all text-base">
                สมัครฟรี
              </Link>
            </div>

            {/* Mini stats */}
            <div className="flex flex-wrap gap-8 justify-center mt-14">
              {[
                { v: "20+", l: "Streaming Apps" },
                { v: "฿19", l: "ราคาเริ่มต้น" },
                { v: "24/7", l: "พร้อมให้บริการ" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{s.v}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ────────────────────────────────────────────────── */}


      {/* ── How it works ───────────────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-950 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">วิธีการสั่งซื้อ</h2>
            <p className="text-slate-400 dark:text-slate-500 text-sm">3 ขั้นตอน ง่ายมาก</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div key={i} className="relative bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 hover:border-[#d44242]/40 dark:hover:border-[#d44242]/40 transition-all group shadow-sm dark:shadow-none">
                <span className="absolute top-6 right-6 text-5xl font-extrabold text-slate-200 dark:text-slate-800 group-hover:text-[#d44242]/20 transition-colors">{step.n}</span>
                <div className="w-12 h-12 rounded-2xl bg-[#d44242]/10 flex items-center justify-center mb-5 group-hover:bg-[#d44242] transition-colors">
                  <svg className="w-6 h-6 text-[#d44242] group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                  </svg>
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white mb-2 text-lg">{step.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured products ──────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="bg-slate-50 dark:bg-slate-950 py-20 border-t border-slate-100 dark:border-slate-900">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-3">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">สินค้าราคาถูก</h2>
                <p className="text-slate-400 dark:text-slate-500 text-sm">เริ่มต้นราคาหลักสิบบาท</p>
              </div>
              <Link href="/shop" className="text-sm text-[#d44242] hover:underline font-semibold">ดูทั้งหมด →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((p) => (
                <Link key={p.type_id} href={`/products/${p.type_id}`}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 hover:border-[#d44242]/40 hover:-translate-y-0.5 transition-all group shadow-sm dark:shadow-none">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 overflow-hidden">
                    <img src={p.imageapi} alt={p.name} className="w-8 h-8 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/2165/2165004.png"; }} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wide mb-1">{p.type_menu}</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white mb-2 line-clamp-2 group-hover:text-[#d44242] transition-colors">{p.name}</p>
                  <p className="text-xl font-extrabold text-[#d44242]">฿{p.pricevip.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Why us ─────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-950 py-20 border-t border-slate-100 dark:border-slate-900">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">ทำไมต้อง ZenvyShop?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: "⚡", title: "ส่งทันที", desc: "รับ Email + Password ทันทีหลังชำระ ไม่ต้องรอ" },
              { icon: "💰", title: "ราคาถูก", desc: "ราคาเริ่มต้น ฿19 ถูกกว่าราคาปกติมาก" },
              { icon: "🔒", title: "ปลอดภัย", desc: "ระบบ Appwrite เข้ารหัสข้อมูลทุกชั้น" },
              { icon: "📱", title: "ใช้ได้ทุกอุปกรณ์", desc: "รองรับมือถือ แท็บเล็ต คอมพิวเตอร์" },
            ].map((f) => (
              <div key={f.title} className="bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 text-center hover:border-[#d44242]/30 transition-all shadow-sm dark:shadow-none">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-extrabold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────── */}
      <section className="bg-slate-50 dark:bg-slate-950 pb-20 pt-4 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#d44242] to-[#9B1C1C] rounded-3xl px-8 py-16 text-center">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">พร้อมเริ่มแล้วหรือยัง?</h2>
              <p className="text-white/70 mb-8 text-sm">สมัครฟรี ไม่มีค่าธรรมเนียม เริ่มช้อปได้ทันที</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/register" className="px-8 py-3.5 bg-white text-[#d44242] font-extrabold rounded-2xl hover:bg-slate-50 transition-all shadow-lg text-sm">
                  สมัครสมาชิกฟรี
                </Link>
                <Link href="/shop" className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 transition-all text-sm">
                  ดูสินค้าก่อน
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
