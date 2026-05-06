import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import DashboardNav from '@/components/dashboard/DashboardNav'
import Badge from '@/components/ui/Badge'
import { Key } from 'lucide-react'
import Link from 'next/link'
import CopyButton from './_CopyButton'

export const metadata = { title: 'My Licenses' }

export default async function LicensesPage() {
  const session = await getServerSession(authOptions)
  const licenses = db.licenses.findByUserId(session!.user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div>
      <DashboardNav />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">License Keys</h1>
        <p className="text-sm text-zinc-500 mt-1">{licenses.length} licenses</p>
      </div>

      {licenses.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
          <Key className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 mb-4">ยังไม่มี license key</p>
          <Link href="/products" className="text-sm text-purple-400 hover:underline">ซื้อแอปเพื่อรับ license</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {licenses.map(l => (
            <div key={l.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-zinc-200">{l.productName}</h3>
                <Badge variant={l.status === 'active' ? 'green' : 'red'}>{l.status}</Badge>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-zinc-800 px-4 py-3">
                <Key className="w-4 h-4 text-purple-400 shrink-0" />
                <code className="flex-1 font-mono text-purple-300 text-sm tracking-widest select-all">{l.key}</code>
                <CopyButton text={l.key} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-zinc-600">
                <span>ออกเมื่อ {new Date(l.createdAt).toLocaleDateString('th-TH')}</span>
                <span>{l.expiresAt ? `หมดอายุ ${new Date(l.expiresAt).toLocaleDateString('th-TH')}` : 'Lifetime'}</span>
              </div>
            </div>
          ))}

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="font-semibold text-zinc-300 mb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-400" /> License Validation API
            </h3>
            <p className="text-xs text-zinc-500 mb-3">Validate license key ผ่าน REST API ได้เลย</p>
            <code className="block bg-zinc-950 rounded-lg px-4 py-3 text-xs text-green-400 font-mono">
              GET /api/licenses/{'{'}'your-license-key{'}'}
            </code>
          </div>
        </div>
      )}
    </div>
  )
}

