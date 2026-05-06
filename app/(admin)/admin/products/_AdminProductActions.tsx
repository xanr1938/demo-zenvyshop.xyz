'use client'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function AdminProductActions({ productId }: { productId: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('ลบแอพนี้?')) return
    await fetch(`/api/products/${productId}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <button onClick={handleDelete} className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors rounded">
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
