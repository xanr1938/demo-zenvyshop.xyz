import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ใช้ validate license key (เรียกจาก app ที่ขาย)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const license = db.licenses.findByKey(key)

  if (!license) return NextResponse.json({ valid: false, reason: 'License not found' }, { status: 404 })
  if (license.status === 'revoked') return NextResponse.json({ valid: false, reason: 'License revoked' })
  if (license.status === 'expired') return NextResponse.json({ valid: false, reason: 'License expired' })
  if (license.expiresAt && new Date(license.expiresAt) < new Date())
    return NextResponse.json({ valid: false, reason: 'License expired' })

  return NextResponse.json({
    valid: true,
    license: {
      key: license.key,
      productId: license.productId,
      productName: license.productName,
      status: license.status,
      expiresAt: license.expiresAt,
    },
  })
}
