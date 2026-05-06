'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const name = fd.get('name') as string
    const email = fd.get('email') as string
    const password = fd.get('password') as string
    const confirm = fd.get('confirm') as string

    if (password !== confirm) {
      setError('รหัสผ่านไม่ตรงกัน')
      setLoading(false)
      return
    }

    const res = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'เกิดข้อผิดพลาด')
      setLoading(false)
      return
    }

    await signIn('credentials', { email, password, redirect: false })
    router.push('/dashboard')
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="text-2xl font-bold text-white mb-1">สมัครสมาชิก</h1>
        <p className="text-sm text-zinc-500 mb-6">สร้างบัญชีฟรี ใช้งานได้ทันที</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="name" name="name" label="ชื่อ" placeholder="Your name" required />
          <Input id="email" name="email" type="email" label="อีเมล" placeholder="you@example.com" required />
          <Input id="password" name="password" type="password" label="รหัสผ่าน" placeholder="อย่างน้อย 6 ตัวอักษร" required />
          <Input id="confirm" name="confirm" type="password" label="ยืนยันรหัสผ่าน" placeholder="••••••••" required />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" size="lg" className="w-full mt-2" loading={loading}>
            สมัครสมาชิก
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          มีบัญชีแล้ว?{' '}
          <Link href="/login" className="text-purple-400 hover:underline">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  )
}
