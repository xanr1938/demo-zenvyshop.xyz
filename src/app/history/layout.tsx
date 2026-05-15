import type { Metadata } from "next";
import HistoryLayoutClient from "./histoy-layout-client";

export const metadata: Metadata = {
  title: "ประวัติการสั่งซื้อ",
  description: "ประวัติการสั่งซื้อ",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HistoryLayoutClient>{children}</HistoryLayoutClient>
    </>
  );
}