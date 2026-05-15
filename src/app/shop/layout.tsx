import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "สินค้า",
    description: "สินค้า",
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}