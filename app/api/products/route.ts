import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { v4 as uuid } from 'uuid'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { ensureSeeded } from '@/lib/seed'
import { slugify } from '@/lib/utils'

export async function GET(req: NextRequest) {
  ensureSeeded()
  const { searchParams } = new URL(req.url)
  const categoryId = searchParams.get('categoryId') || undefined
  const featured = searchParams.get('featured')
  const search = searchParams.get('search') || undefined

  const products = db.products.findAll({
    categoryId,
    isActive: true,
    isFeatured: featured === 'true' ? true : undefined,
    search,
  })

  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const now = new Date().toISOString()
  const product = {
    id: uuid(),
    ...body,
    slug: slugify(body.name),
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }
  db.products.create(product)
  return NextResponse.json(product, { status: 201 })
}
