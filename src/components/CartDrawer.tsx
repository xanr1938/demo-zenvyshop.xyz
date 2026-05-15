"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ENDPOINT, PROJECT_ID, BUCKETS } from "@appwrite/config";

interface Props { open: boolean; onClose: () => void; }

export default function CartDrawer({ open, onClose }: Props) {
  const { items, total, count, removeItem, updateQty } = useCart();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      window.addEventListener("keydown", handler);
      return () => {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
        window.removeEventListener("keydown", handler);
      };
    }
  }, [open, onClose]);

  return (
    <>
      <div ref={overlayRef} onClick={onClose} className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} />
      <aside className={`fixed right-0 top-0 z-50 h-[100dvh] w-full max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <h2 className="font-bold text-slate-900 dark:text-white text-base">Cart <span className="text-[#d44242]">({count})</span></h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-500 gap-2">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272" /></svg>
              <p className="text-sm">Cart is empty</p>
            </div>
          ) : items.map((item) => (
            <div key={item.$id} className="flex gap-3 items-start">
              <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden">
                {item.source === "gafiw" && item._imageUrl ? (
                  <img src={item._imageUrl} className="w-full h-full object-contain p-1" alt={item.name} onError={(e) => { (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/2165/2165004.png"; }} />
                ) : item.images?.length > 0 ? (
                  <img src={`${ENDPOINT}/storage/buckets/${BUCKETS.PRODUCT_IMAGES}/files/${item.images[0]}/preview?project=${PROJECT_ID}&width=128&height=128`} className="w-full h-full object-cover" alt={item.name} />
                ) : <div className="w-full h-full bg-slate-100 dark:bg-slate-800" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{item.name}</p>
                <p className="text-sm text-[#d44242] font-bold">฿{item.price.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => item.qty === 1 ? removeItem(item.$id) : updateQty(item.$id, item.qty - 1)} className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-bold dark:text-slate-200">−</button>
                  <span className="text-xs font-semibold w-4 text-center dark:text-slate-200">{item.qty}</span>
                  <button onClick={() => updateQty(item.$id, item.qty + 1)} className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-bold dark:text-slate-200">+</button>
                </div>
              </div>
              <button onClick={() => removeItem(item.$id)} className="text-slate-300 dark:text-slate-600 hover:text-[#d44242] transition-colors mt-0.5" aria-label="Remove">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-4 flex-shrink-0">
            <div className="flex justify-between font-extrabold text-base">
              <span className="text-slate-900 dark:text-white">Total</span>
              <span className="text-[#d44242]">฿{total.toLocaleString()}</span>
            </div>
            <Link href="/checkout" onClick={onClose} className="block w-full text-center py-3.5 bg-[#d44242] hover:bg-[#E87A7A] text-white font-bold rounded-2xl transition-all shadow-lg shadow-[#d44242]/20 text-sm">Checkout</Link>
          </div>
        )}
      </aside>
    </>
  );
}
