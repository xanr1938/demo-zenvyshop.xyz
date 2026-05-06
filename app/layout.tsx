import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import { ensureSeeded } from '@/lib/seed'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: { default: 'ZenyShop — Premium App Store', template: '%s | ZenyShop' },
  description: 'ร้านขายแอปพรีเมี่ยมคุณภาพสูง พร้อม license key ทันที',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  ensureSeeded()
  return (
    <html lang="th" className={geist.variable}>
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
