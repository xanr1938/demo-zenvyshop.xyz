import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'
import { db } from '@/lib/db'
import { ensureSeeded } from '@/lib/seed'

export async function POST(req: NextRequest) {
  ensureSeeded()
  const { name, email, password } = await req.json()

  if (!name || !email || !password)
    return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 })

  if (password.length < 6)
    return NextResponse.json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัว' }, { status: 400 })

  if (db.users.findByEmail(email))
    return NextResponse.json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' }, { status: 409 })

  const hashed = await bcrypt.hash(password, 10)
  const user = {
    id: uuid(), name, email, password: hashed,
    role: 'customer' as const, createdAt: new Date().toISOString(),
  }
  db.users.create(user)

  return NextResponse.json({ success: true, userId: user.id }, { status: 201 })
}
