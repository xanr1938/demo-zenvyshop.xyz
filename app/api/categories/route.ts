import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ensureSeeded } from '@/lib/seed'

export async function GET() {
  ensureSeeded()
  return NextResponse.json(db.categories.findAll())
}
