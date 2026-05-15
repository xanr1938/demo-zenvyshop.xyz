import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "แจ้งปัญหาการใช้งาน",
    description: "แจ้งปัญหาการใช้งาน",
}

export default function ClaimLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}