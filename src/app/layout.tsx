import "./globals.css";
import { ReactNode } from "react";
import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import PageTransition from "@/components/PageTransition";
import { PageLoaderProvider } from "@/components/providers/page-loader-provider";



// export const metadata = {
//   title: "ZenvyShop",
//   description: "Premium digital & physical products",
// };
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const SITE_NAME = "ZenvyShop";
const DESCRIPTION = "แอปพรีเมียม ราคาถูก ได้ทันที — Netflix, Spotify, Disney+, YouTube Premium, HBO Max ราคาประหยัด รับ account ทันที ปลอดภัย 100%";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: DESCRIPTION,
  keywords: ["Netflix ราคาถูก", "Spotify premium", "Disney+ ราคาถูก", "YouTube Premium", "แอปพรีเมียม", "streaming ราคาถูก", "account sharing"],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DESCRIPTION,
    images: [{ url: `${SITE_URL}/api/og`, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DESCRIPTION,
    images: [`${SITE_URL}/api/og`],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: {
    icon: [{ url: "/favicon.ico", type: "image/ico" }],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&family=Poppins:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 antialiased transition-colors duration-200">
        <ThemeProvider>
          <PageLoaderProvider>
            <ToastProvider>
              <AuthProvider>
                <CartProvider>
                  <PageTransition>
                    <main className="min-h-[calc(100vh-4rem)]">{children}</main>
                  </PageTransition>
                </CartProvider>
              </AuthProvider>
            </ToastProvider>
          </PageLoaderProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
