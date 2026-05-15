"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { adminFetch } from "@/lib/admin-fetch";

interface Stats {
  totalOrders: number; totalRevenue: number; pendingOrders: number;
  totalProducts: number; totalUsers: number;
}

const CARDS = [
  { key: "totalRevenue", label: "รายได้รวม", format: (v: number) => `฿${v.toLocaleString()}`, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  { key: "totalOrders", label: "คำสั่งซื้อทั้งหมด", format: (v: number) => v.toLocaleString(), color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { key: "pendingOrders", label: "รอดำเนินการ", format: (v: number) => v.toLocaleString(), color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
  { key: "totalProducts", label: "สินค้า", format: (v: number) => v.toLocaleString(), color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20" },
  { key: "totalUsers", label: "ผู้ใช้", format: (v: number) => v.toLocaleString(), color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-50 dark:bg-slate-800" },
];

const QUICK_LINKS = [
  { label: "จัดการคำสั่งซื้อ", href: "/admin/orders", icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z", desc: "ดู/อัปเดตสถานะคำสั่งซื้อทั้งหมด" },
  { label: "จัดการสินค้า (Appwrite)", href: "/admin/products", icon: "m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z", desc: "เพิ่ม แก้ไข สินค้าในร้าน" },
  { label: "ตั้งค่าร้าน", href: '/admin/overview', icon: "", desc: "ตั้งค่าร้าน" },
  { label: "🎬 GaFiwShop Products", href: "/admin/gafiw", icon: "M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125a.375.375 0 0 1 0-.75m0 .75h.375a.375.375 0 0 0 0-.75H3.375m0 0V4.875C3.375 3.839 4.214 3 5.25 3h1.5m-.75 0h.75m-4.5 7.5h16.5m-16.5 0V4.875M20.25 15H3.75m16.5 0v-3.75m0 3.75v.75a1.125 1.125 0 0 1-1.125 1.125m0 0h-1.5m1.5 0h-14.25A1.125 1.125 0 0 1 3 18.375V4.875m16.5 0c0-.621-.504-1.125-1.125-1.125H5.25A1.125 1.125 0 0 0 4.125 4.875", desc: "ตั้งราคา เปิด/ปิดสินค้า Streaming + ดูยอดเงิน GaFiw" },
  { label: "ไปหน้าร้าน", href: "/shop", icon: "M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z", desc: "เปิดหน้าร้านลูกค้า" },
];

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    adminFetch("/api/admin/stats").then((r) => r.json()).then(setStats).catch(() => { });
  }, []);

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Admin Panel</h1>
              <span className="text-xs font-bold px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg border border-amber-200 dark:border-amber-700">ADMIN</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {CARDS.map((card) => (
            <div key={card.key} className={`${card.bg} rounded-2xl p-4 border border-slate-200 dark:border-slate-700`}>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">{card.label}</p>
              <p className={`text-2xl font-extrabold ${card.color}`}>
                {stats ? card.format(stats[card.key as keyof Stats]) : "—"}
              </p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid sm:grid-cols-3 gap-4">
          {QUICK_LINKS.map((item) => (
            <Link key={item.href} href={item.href}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg hover:border-[#d44242]/30 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-[#FCE9E9] dark:bg-[#d44242]/15 flex items-center justify-center mb-4 group-hover:bg-[#d44242] transition-colors">
                <svg className="w-5 h-5 text-[#d44242] group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <p className="font-bold text-slate-900 dark:text-white mb-1">{item.label}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{item.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
