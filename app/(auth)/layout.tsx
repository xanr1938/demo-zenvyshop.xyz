import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white font-bold">Z</div>
        <span className="text-xl font-bold text-white">ZenyShop</span>
      </Link>
      {children}
    </div>
  )
}
