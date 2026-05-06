'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)

    const res = await signIn('credentials', {
      email: fd.get('email'),
      password: fd.get('password'),
      redirect: false,
    })

    if (res?.error) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      setLoading(false)
    } else {
      router.push(callbackUrl)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="text-2xl font-bold text-white mb-1">เข้าสู่ระบบ</h1>
        <p className="text-sm text-zinc-500 mb-6">ยินดีต้อนรับกลับ</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="email" name="email" type="email" label="อีเมล" placeholder="you@example.com" required autoComplete="email" />
          <Input id="password" name="password" type="password" label="รหัสผ่าน" placeholder="••••••••" required autoComplete="current-password" />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" size="lg" className="w-full mt-2" loading={loading}>
            เข้าสู่ระบบ
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          ยังไม่มีบัญชี?{' '}
          <Link href="/register" className="text-purple-400 hover:underline">สมัครสมาชิก</Link>
        </p>

        <div className="mt-4 rounded-lg bg-zinc-800 px-4 py-3 text-xs text-zinc-500">
          <strong className="text-zinc-400">Demo Admin:</strong> admin@zenyshop.xyz / admin1234
        </div>
      </div>
    </div>
  )
}
