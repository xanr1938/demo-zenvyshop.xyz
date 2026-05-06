'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { Category } from '@/types'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name'),
      shortDesc: fd.get('shortDesc'),
      description: fd.get('description'),
      price: Number(fd.get('price')),
      salePrice: fd.get('salePrice') ? Number(fd.get('salePrice')) : undefined,
      categoryId: fd.get('categoryId'),
      platform: fd.get('platform'),
      version: fd.get('version'),
      thumbnailUrl: fd.get('thumbnailUrl'),
      tags: (fd.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
      isFeatured: fd.get('isFeatured') === 'on',
      screenshots: [],
    }

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      router.push('/admin/products')
      router.refresh()
    } else {
      const d = await res.json()
      setError(d.error)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-8">เพิ่มแอพใหม่</h1>
      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <Input name="name" label="ชื่อแอพ" placeholder="ZenFlow Pro" required />
        <Input name="shortDesc" label="คำอธิบายสั้น" placeholder="คำอธิบายสั้น 1 บรรทัด" required />
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">คำอธิบายเต็ม</label>
          <textarea name="description" rows={4} required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-purple-500 focus:outline-none resize-none"
            placeholder="รายละเอียดแอพ..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input name="price" type="number" label="ราคา (THB)" placeholder="990" required />
          <Input name="salePrice" type="number" label="ราคาลด (ถ้ามี)" placeholder="690" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">หมวดหมู่</label>
            <CategoriesSelect />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Platform</label>
            <select name="platform" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-purple-500 focus:outline-none">
              <option value="all">All</option>
              <option value="windows">Windows</option>
              <option value="mac">Mac</option>
              <option value="web">Web</option>
            </select>
          </div>
        </div>
        <Input name="version" label="Version" placeholder="1.0.0" defaultValue="1.0.0" required />
        <Input name="thumbnailUrl" label="Thumbnail URL" placeholder="https://..." required />
        <Input name="tags" label="Tags (คั่นด้วยคอมมา)" placeholder="productivity, ai, tasks" />
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="isFeatured" className="rounded border-zinc-600" />
          <span className="text-sm text-zinc-300">Featured product</span>
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-3">
          <Button type="submit" loading={loading}>เพิ่มแอพ</Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>ยกเลิก</Button>
        </div>
      </form>
    </div>
  )
}

function CategoriesSelect() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(setCategories)
      .catch(() => {})
  }, [])

  return (
    <select name="categoryId" required className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-purple-500 focus:outline-none">
      <option value="">เลือกหมวดหมู่...</option>
      {categories.map(c => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  )
}
