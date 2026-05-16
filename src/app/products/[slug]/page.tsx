"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { getProductBySlug } from "@appwrite/database";
import { getProductImageUrl } from "@appwrite/storage";
import { subscribeToProducts } from "@appwrite/realtime";
import type { Product, CartItem } from "@appwrite/types";
import type { DigitalProduct } from "@/components/ProductCard";
import { RealtimeResponseEvent } from "appwrite";

type Tab = "description" | "details";

function htmlToText(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<a[^>]*>(.*?)<\/a>/gi, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function digitalToCartItem(p: DigitalProduct): CartItem {
  return {
    $id: `gafiw_${p.type_id}`,
    $collectionId: "gafiw",
    $databaseId: "gafiw",
    $createdAt: "",
    $updatedAt: "",
    $permissions: [],
    name: p.name,
    slug: p.type_id,
    description: p.details,
    price: p.pricevip,
    originalPrice: undefined,
    discount: 0,
    stock: p.stock,
    images: [],
    featured: false,
    categoryId: p.type_menu,
    qty: 1,
    source: "gafiw",
    _imageUrl: p.imageapi,
    type_id: p.type_id,
    type_menu: p.type_menu,
  };
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { addItem, items } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [digital, setDigital] = useState<DigitalProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState<Tab>("description");

  useEffect(() => {
    setLoading(true);
    getProductBySlug(slug)
      .then(async (p) => {
        if (p) {
          setProduct(p);
          setLoading(false);
          return;
        }
        // Not found in Appwrite → try Digital (+ apply admin settings)
        const [pRes, sRes] = await Promise.all([
          fetch("/api/gafiw/products").then((r) => r.json()),
          fetch("/api/admin/gafiw-settings").then((r) => r.json()),
        ]);
        const found = (pRes.data as DigitalProduct[])?.find((g) => g.type_id === slug);
        if (!found) { router.push("/shop"); return; }
        // Apply custom price if admin set one
        const customPrice = sRes?.[found.type_id]?.customPrice;
        const enabled = sRes?.[found.type_id]?.enabled;
        if (enabled === false) { router.push("/shop"); return; }
        setDigital(customPrice ? { ...found, pricevip: customPrice } : found);
        setLoading(false);
      })
      .catch(async () => {
        try {
          const [pRes, sRes] = await Promise.all([
            fetch("/api/gafiw/products").then((r) => r.json()),
            fetch("/api/admin/gafiw-settings").then((r) => r.json()),
          ]);
          const found = (pRes.data as DigitalProduct[])?.find((g) => g.type_id === slug);
          if (!found) { router.push("/shop"); return; }
          const customPrice = sRes?.[found.type_id]?.customPrice;
          if (sRes?.[found.type_id]?.enabled === false) { router.push("/shop"); return; }
          setDigital(customPrice ? { ...found, pricevip: customPrice } : found);
        } catch {
          router.push("/shop");
        }
        setLoading(false);
      });
  }, [slug, router]);

  // Realtime for Appwrite products
  useEffect(() => {
    if (!product) return;
    const unsub = subscribeToProducts((event: RealtimeResponseEvent<unknown>) => {
      const payload = event.payload as Product;
      if (payload?.$id === product.$id)
        setProduct((prev) => (prev ? { ...prev, ...payload } : prev));
    });
    return () => unsub();
  }, [product]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-2 gap-10 mb-10">
            <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
            <div className="space-y-4 pt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
          <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
        </div>
        <Footer />
      </>
    );
  }

  // ── Digital product ──────────────────────────────────────────────────────
  if (digital) {
    const inCart = items.some((i) => i.$id === `gafiw_${digital.type_id}`);
    const DETAILS = [
      { label: "หมวดหมู่", value: digital.type_menu },
      { label: "คงเหลือ", value: digital.stock > 0 ? `${digital.stock} ชิ้น` : "หมด" },
      { label: "รหัสสินค้า", value: digital.type_id.slice(-8) },
    ];

    function handleAdd() {
      addItem(digitalToCartItem(digital!));
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }

    return (
      <>
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-10">
          <nav className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 mb-8">
            <Link href="/" className="hover:text-[#d44242] transition-colors">หน้าแรก</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-[#d44242] transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-slate-600 dark:text-slate-300 truncate max-w-[200px]">{digital.name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-10 mb-10">
            {/* Image */}
            <div className="aspect-square rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-8">
              <img
                src={digital.imageapi}
                alt={digital.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://cdn-icons-png.flaticon.com/512/2165/2165004.png";
                }}
              />
            </div>

            {/* Info */}
            <div className="flex flex-col justify-between pt-1">
              <div>
                <p className="font-mono text-[10px] text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-2">
                  {digital.type_menu}
                </p>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-5 leading-snug">
                  {digital.name}
                </h1>
                <div className="flex items-end gap-3 mb-5">
                  <span className="text-4xl font-extrabold text-[#d44242]">
                    ฿{digital.pricevip.toLocaleString()}
                  </span>
                </div>
                <div className="mb-6">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${digital.stock > 0
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                    : "bg-[#FCE9E9] dark:bg-[#d44242]/15 text-[#d44242] border-[#d44242]/20"
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${digital.stock > 0 ? "bg-emerald-500" : "bg-[#d44242]"}`} />
                    {digital.stock > 0 ? `มีสินค้า ${digital.stock} ชิ้น` : "สินค้าหมด"}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleAdd}
                  disabled={inCart || added || digital.stock === 0}
                  className={`w-full py-4 rounded-2xl font-bold text-sm transition-all shadow-lg ${added || inCart
                    ? "bg-emerald-500 text-white shadow-emerald-200 cursor-not-allowed"
                    : "bg-[#d44242] hover:bg-[#E87A7A] text-white shadow-[#d44242]/20 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:shadow-none disabled:text-slate-400 disabled:cursor-not-allowed"
                    }`}
                >
                  {added
                    ? "✓ เพิ่มลงตะกร้าแล้ว"
                    : inCart
                      ? "✓ อยู่ในตะกร้าแล้ว"
                      : digital.stock === 0
                        ? "สินค้าหมด"
                        : "เพิ่มลงตะกร้า"}
                </button>
                <Link
                  href="/shop"
                  className="block w-full py-3.5 rounded-2xl font-semibold text-sm text-center border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#d44242]/30 hover:text-[#d44242] transition-all"
                >
                  ← ดูสินค้าอื่น
                </Link>
              </div>
            </div>
          </div>

          {/* Description Tabs */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex border-b border-slate-100 dark:border-slate-800">
              {(["description", "details"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-4 text-sm font-semibold transition-all relative ${tab === t
                    ? "text-[#d44242]"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                >
                  {t === "description" ? "รายละเอียดสินค้า" : "ข้อมูลทั่วไป"}
                  {tab === t && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-[#d44242] rounded-full" />
                  )}
                </button>
              ))}
            </div>
            <div className="p-8">
              {tab === "description" ? (
                <p className="text-slate-600 dark:text-slate-300 leading-8 whitespace-pre-line text-sm">
                  {htmlToText(digital.details)}
                </p>
              ) : (
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {DETAILS.map((d) => (
                    <div key={d.label} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4">
                      <dt className="text-xs text-slate-400 dark:text-slate-500 mb-1">{d.label}</dt>
                      <dd className="font-semibold text-slate-900 dark:text-white text-sm">{d.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Appwrite product ───────────────────────────────────────────────────────
  if (!product) return null;

  const imageUrl = product.images?.length > 0
    ? getProductImageUrl(product.images[0], 600, 600)
    : null;

  const DETAILS = [
    { label: "หมวดหมู่", value: product.categoryId ?? "—" },
    { label: "คงเหลือ", value: product.stock > 0 ? `${product.stock} ชิ้น` : "หมด" },
    { label: "ส่วนลด", value: product.discount > 0 ? `${product.discount}%` : "—" },
    { label: "รหัสสินค้า", value: product.$id.slice(-8).toUpperCase() },
  ];

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <nav className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 mb-8">
          <Link href="/" className="hover:text-[#d44242] transition-colors">หน้าแรก</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#d44242] transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-slate-600 dark:text-slate-300 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 mb-10">
          {/* Image */}
          <div className="aspect-square rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-200 dark:text-slate-700">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" strokeWidth={0.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
            )}
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-[#d44242] text-white text-xs font-bold rounded-full shadow">
                -{product.discount}% OFF
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-between pt-1">
            <div>
              <p className="font-mono text-[10px] text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-2">
                {product.categoryId ?? "product"}
              </p>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-5 leading-snug">
                {product.name}
              </h1>
              <div className="flex items-end gap-3 mb-5">
                <span className="text-4xl font-extrabold text-[#d44242]">
                  ฿{product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-slate-400 dark:text-slate-500 line-through text-xl mb-1">
                    ฿{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="mb-6">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${product.stock > 0
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                  : "bg-[#FCE9E9] dark:bg-[#d44242]/15 text-[#d44242] border-[#d44242]/20"
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? "bg-emerald-500" : "bg-[#d44242]"}`} />
                  {product.stock > 0 ? `มีสินค้า ${product.stock} ชิ้น` : "สินค้าหมด"}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {(() => {
                const inCart = items.some((i) => i.$id === product.$id);
                const isDisabled = inCart || added || product.stock === 0;
                const label = added
                  ? "✓ เพิ่มลงตะกร้าแล้ว"
                  : inCart
                    ? "✓ อยู่ในตะกร้าแล้ว"
                    : product.stock === 0
                      ? "สินค้าหมด"
                      : "เพิ่มลงตะกร้า";
                const cls = inCart || added
                  ? "bg-emerald-500 text-white shadow-emerald-200 cursor-not-allowed"
                  : "bg-[#d44242] hover:bg-[#E87A7A] text-white shadow-[#d44242]/20 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:shadow-none disabled:text-slate-400 disabled:cursor-not-allowed";
                return (
                  <button
                    onClick={() => {
                      addItem(product);
                      setAdded(true);
                      setTimeout(() => setAdded(false), 1500);
                    }}
                    disabled={isDisabled}
                    className={`w-full py-4 rounded-2xl font-bold text-sm transition-all shadow-lg ${cls}`}
                  >
                    {label}
                  </button>
                );
              })()}
              <Link
                href="/shop"
                className="block w-full py-3.5 rounded-2xl font-semibold text-sm text-center border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#d44242]/30 hover:text-[#d44242] transition-all"
              >
                ← ดูสินค้าอื่น
              </Link>
            </div>
          </div>
        </div>

        {/* Description Tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex border-b border-slate-100 dark:border-slate-800">
            {(["description", "details"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-4 text-sm font-semibold transition-all relative ${tab === t
                  ? "text-[#d44242]"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
              >
                {t === "description" ? "รายละเอียดสินค้า" : "ข้อมูลทั่วไป"}
                {tab === t && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-[#d44242] rounded-full" />
                )}
              </button>
            ))}
          </div>
          <div className="p-8">
            {tab === "description" ? (
              product.description ? (
                <p className="text-slate-600 dark:text-slate-300 leading-8 whitespace-pre-line text-sm md:text-base">
                  {product.description}
                </p>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-300 dark:text-slate-600 gap-3">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  <p className="text-sm">ยังไม่มีคำอธิบายสินค้านี้</p>
                </div>
              )
            ) : (
              <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {DETAILS.map((d) => (
                  <div key={d.label} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4">
                    <dt className="text-xs text-slate-400 dark:text-slate-500 mb-1">{d.label}</dt>
                    <dd className="font-semibold text-slate-900 dark:text-white text-sm">{d.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
