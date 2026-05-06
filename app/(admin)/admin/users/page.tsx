import { db } from '@/lib/db'
import Badge from '@/components/ui/Badge'

export const metadata = { title: 'Admin — Users' }

export default function AdminUsersPage() {
  const users = db.users.findAll()
    .map(({ password: _, ...u }) => u)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-sm text-zinc-500 mt-1">{users.length} ผู้ใช้ทั้งหมด</p>
      </div>

      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80">
              {['ชื่อ', 'อีเมล', 'Role', 'วันที่สมัคร', 'Orders'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {users.map(u => {
              const orderCount = db.orders.findByUserId(u.id).length
              return (
                <tr key={u.id} className="bg-zinc-900 hover:bg-zinc-800/50">
                  <td className="px-4 py-3 font-medium text-zinc-200">{u.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === 'admin' ? 'purple' : 'zinc'}>{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(u.createdAt).toLocaleDateString('th-TH')}</td>
                  <td className="px-4 py-3 text-zinc-400">{orderCount}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
