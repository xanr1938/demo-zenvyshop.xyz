import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "เติมเงิน",
    description: "เติมเงิน",
}

export default function TopupLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}