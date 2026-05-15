"use client";

import { useState, useRef, useEffect, MouseEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { getProductImageUrl } from "@appwrite/storage";
import type { Product, CartItem } from "@appwrite/types";

export interface GafiwProduct {
  name: string; imageapi: string; details: string;
  price: number; pricevip: number; stock: number;
  type_menu: string; type_id: string;
}

function gafiwToCartItem(p: GafiwProduct): CartItem {
  return {
    $id: `gafiw_${p.type_id}`, $collectionId: "gafiw", $databaseId: "gafiw",
    $createdAt: "", $updatedAt: "", $permissions: [],
    name: p.name, slug: `gafiw/${p.type_id}`, description: p.details,
    price: p.pricevip, originalPrice: undefined, discount: 0,
    stock: p.stock, images: [], featured: false, categoryId: p.type_menu,
    qty: 1, source: "gafiw", _imageUrl: p.imageapi, type_id: p.type_id, type_menu: p.type_menu,
  };
}

function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transition = "transform 0.08s ease";
    el.style.transform = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.03)`;
  }
  function onMouseLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 0.45s ease";
    el.style.transform = "perspective(700px) rotateY(0deg) rotateX(0deg) scale(1)";
  }
  return { ref, onMouseMove, onMouseLeave };
}

function htmlToText(html: string) {
  return html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim();
}

function DescModal({ title, desc, onClose }: { title: string; desc: string; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  return createPortal(
    <>
      <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[61] flex items-center justify-center px-4 pointer-events-none">
        <div
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate pr-4">{title}</h3>
            <button onClick={onClose} className="flex-shrink-0 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-5 max-h-72 overflow-y-auto">
            {desc.trim() ? (
              <pre className="text-slate-600 dark:text-slate-300 text-xs leading-4 whitespace-pre-wrap font-sans">
                {htmlToText(desc)}
              </pre>
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-4">ไม่มีคำอธิบายสินค้านี้</p>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

type Props =
  | { source: "appwrite"; product: Product }
  | { source: "gafiw"; product: GafiwProduct; accentColor?: string };

export default function ProductCard(props: Props) {
  const { addItem, items } = useCart();
  const { showToast } = useToast();
  const [showDesc, setShowDesc] = useState(false);
  const tilt = useTilt();

  if (props.source === "gafiw") {
    const { product: p, accentColor = "#d44242" } = props;
    const cartItem = gafiwToCartItem(p);
    const inCart = items.some((i) => i.$id === cartItem.$id);

    return (
      <>
        <div
          className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
          style={{ "--accent": accentColor } as React.CSSProperties}
          ref={tilt.ref}
          onMouseMove={tilt.onMouseMove}
          onMouseLeave={tilt.onMouseLeave}
        >
          {/* แถบสีแบรนด์บนสุด */}
          {/* <div className="h-1 w-full flex-shrink-0" style={{ backgroundColor: accentColor }} /> */}

          <Link href={`/products/${p.type_id}`}>
            <div className="aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden relative flex items-center justify-center p-6 cursor-pointer">
              <img
                src={p.imageapi} alt={p.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/2165/2165004.png"; }}
              />
              {p.stock === 0 && (
                <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center">
                  <span className="font-mono text-xs font-bold text-slate-500 tracking-widest">OUT OF STOCK</span>
                </div>
              )}
            </div>
          </Link>

          <div className="p-5 flex flex-col flex-1">
            <p className="font-mono text-[9px] tracking-widest uppercase mb-1 font-bold" style={{ color: accentColor }}>{p.type_menu}</p>
            <Link href={`/products/${p.type_id}`}>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#d44242] transition-colors cursor-pointer min-h-[2.5rem]">{p.name}</h3>
            </Link>

            {/* ราคา + สต็อก */}
            <div className="flex items-center justify-between mb-3 mt-auto">
              <span className="text-xl font-extrabold text-[#d44242]">฿{p.pricevip.toLocaleString()}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.stock > 0
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}>
                {p.stock > 0 ? `เหลือ ${p.stock} ชิ้น` : "หมดแล้ว"}
              </span>
            </div>

            {/* ปุ่ม */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowDesc(true)}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#d44242] hover:border-[#d44242]/40 transition-all"
                title="ดูคำอธิบาย"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>
              </button>
              <button
                disabled={inCart || p.stock === 0}
                onClick={() => { addItem(cartItem); showToast(`เพิ่ม ${p.name} ลงตะกร้าแล้ว`); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${inCart
                    ? "bg-emerald-500 text-white cursor-not-allowed"
                    : p.stock === 0
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                      : "bg-[#d44242] hover:bg-[#E87A7A] text-white shadow-md shadow-[#d44242]/20"
                  }`}
              >
                {inCart ? "✓ เพิ่มแล้ว" : p.stock === 0 ? "สินค้าหมด" : "เพิ่มลงตะกร้า"}
              </button>
            </div>
          </div>
        </div>

        {showDesc && <DescModal title={p.name} desc={p.details} onClose={() => setShowDesc(false)} />}
      </>
    );
  }

  // ── Appwrite product ─────────────────────────────────────────────────────────
  const { product } = props;
  const inCart = items.some((i) => i.$id === product.$id);
  const imageUrl = product.images?.length > 0 ? getProductImageUrl(product.images[0], 400, 400) : null;

  return (
    <>
      <div
        className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden hover:shadow-xl hover:border-[#d44242]/25 transition-shadow duration-300 flex flex-col"
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
      >
        <div className="aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden relative flex-shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center">
              <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 tracking-widest">OUT OF STOCK</span>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1">
          <p className="font-mono text-[9px] text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-1">{product.categoryId ?? "product"}</p>
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#d44242] transition-colors cursor-pointer min-h-[2.5rem]">{product.name}</h3>
          </Link>

          {/* ราคา + สต็อก */}
          <div className="flex items-center justify-between mb-3 mt-auto">
            <span className="text-xl font-extrabold text-[#d44242]">฿{product.price.toLocaleString()}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${product.stock > 0
                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              }`}>
              {product.stock > 0 ? `เหลือ ${product.stock} ชิ้น` : "หมดแล้ว"}
            </span>
          </div>

          {/* ปุ่ม */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowDesc(true)}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#d44242] hover:border-[#d44242]/40 transition-all"
              title="ดูคำอธิบาย"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
            </button>
            <button
              disabled={inCart || product.stock === 0}
              onClick={() => { addItem(product); showToast(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${inCart
                  ? "bg-emerald-500 text-white cursor-not-allowed"
                  : "bg-[#d44242] hover:bg-[#E87A7A] text-white shadow-md shadow-[#d44242]/20 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                }`}
            >
              {inCart ? "✓ เพิ่มแล้ว" : product.stock === 0 ? "สินค้าหมด" : "เพิ่มลงตะกร้า"}
            </button>
          </div>
        </div>
      </div>

      {showDesc && (
        <DescModal
          title={product.name}
          desc={product.description ?? ""}
          onClose={() => setShowDesc(false)}
        />
      )}
    </>
  );
}
