import { db } from './db'
import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'

export function ensureSeeded() {
  if (db.categories.findAll().length > 0) return

  // Categories
  const cats = {
    prod: uuid(), design: uuid(), security: uuid(), util: uuid(),
  }
  db.categories.create({ id: cats.prod, name: 'Productivity', slug: 'productivity', description: 'Boost your workflow with smart tools' })
  db.categories.create({ id: cats.design, name: 'Design', slug: 'design', description: 'Professional design & creative tools' })
  db.categories.create({ id: cats.security, name: 'Security', slug: 'security', description: 'Protect your digital life' })
  db.categories.create({ id: cats.util, name: 'Utilities', slug: 'utilities', description: 'Essential system utilities' })

  // Products
  const now = new Date().toISOString()
  const thumb = (name: string, color: string) =>
    `https://placehold.co/480x320/${color}/ffffff?text=${encodeURIComponent(name)}&font=montserrat`

  const productList = [
    {
      id: uuid(), name: 'ZenFlow Pro', slug: 'zenflow-pro',
      description: 'ZenFlow Pro คือแอปจัดการงานและโปรเจคที่ขับเคลื่อนด้วย AI ช่วยจัดลำดับความสำคัญงานอัตโนมัติ วิเคราะห์เวลาการทำงาน และสร้าง daily plan ที่เหมาะกับสไตล์การทำงานของคุณ ซิงค์ข้ามอุปกรณ์ได้ทุกที่',
      shortDesc: 'Task manager อัจฉริยะที่ขับเคลื่อนด้วย AI', price: 990, salePrice: 690,
      currency: 'THB', categoryId: cats.prod, thumbnailUrl: thumb('ZenFlow+Pro', '5b21b4'),
      screenshots: [], version: '2.3.1', platform: 'all' as const,
      tags: ['productivity', 'ai', 'tasks'], isActive: true, isFeatured: true,
      downloadUrl: 'https://example.com/download/zenflow', createdAt: now, updatedAt: now,
    },
    {
      id: uuid(), name: 'PixelCraft Studio', slug: 'pixelcraft-studio',
      description: 'PixelCraft Studio เป็นเครื่องมือออกแบบ UI/UX และ Pixel Art ระดับมืออาชีพ มาพร้อม component library กว่า 500 ชิ้น export ได้ทุกฟอร์แมต รองรับ design token และ handoff สำหรับนักพัฒนา',
      shortDesc: 'ออกแบบ UI/UX และ Pixel Art ระดับ Pro', price: 1490, salePrice: undefined,
      currency: 'THB', categoryId: cats.design, thumbnailUrl: thumb('PixelCraft', '0f766e'),
      screenshots: [], version: '1.8.0', platform: 'windows' as const,
      tags: ['design', 'ui', 'pixel-art'], isActive: true, isFeatured: true,
      downloadUrl: 'https://example.com/download/pixelcraft', createdAt: now, updatedAt: now,
    },
    {
      id: uuid(), name: 'SecureVault', slug: 'securevault',
      description: 'SecureVault ปกป้องรหัสผ่านและข้อมูลสำคัญด้วย AES-256 encryption รองรับ biometric login, password generator, dark web monitoring และ secure share สำหรับทีม',
      shortDesc: 'Password manager ที่ปลอดภัยสุดขีด', price: 590, salePrice: 390,
      currency: 'THB', categoryId: cats.security, thumbnailUrl: thumb('SecureVault', 'b45309'),
      screenshots: [], version: '3.1.0', platform: 'all' as const,
      tags: ['security', 'passwords', 'encryption'], isActive: true, isFeatured: false,
      downloadUrl: 'https://example.com/download/securevault', createdAt: now, updatedAt: now,
    },
    {
      id: uuid(), name: 'CodeLens Pro', slug: 'codelens-pro',
      description: 'CodeLens Pro วิเคราะห์ code quality, security vulnerabilities และ performance bottleneck ด้วย AI รองรับกว่า 30 ภาษา integrate กับ VS Code, JetBrains และ GitHub',
      shortDesc: 'AI code reviewer สำหรับนักพัฒนา', price: 1990, salePrice: undefined,
      currency: 'THB', categoryId: cats.prod, thumbnailUrl: thumb('CodeLens', '1e40af'),
      screenshots: [], version: '4.0.2', platform: 'all' as const,
      tags: ['development', 'ai', 'code-review'], isActive: true, isFeatured: true,
      downloadUrl: 'https://example.com/download/codelens', createdAt: now, updatedAt: now,
    },
    {
      id: uuid(), name: 'ClipMaster', slug: 'clipmaster',
      description: 'ClipMaster เก็บประวัติ clipboard ไม่จำกัด จัดหมวดหมู่อัตโนมัติ ค้นหาได้ทันที รองรับ snippets, templates และ sync ข้าม device แบบ encrypted',
      shortDesc: 'Clipboard manager ที่ทรงพลังที่สุด', price: 290, salePrice: undefined,
      currency: 'THB', categoryId: cats.util, thumbnailUrl: thumb('ClipMaster', '065f46'),
      screenshots: [], version: '2.0.5', platform: 'windows' as const,
      tags: ['utilities', 'clipboard', 'productivity'], isActive: true, isFeatured: false,
      downloadUrl: 'https://example.com/download/clipmaster', createdAt: now, updatedAt: now,
    },
    {
      id: uuid(), name: 'FocusBlocks', slug: 'focusblocks',
      description: 'FocusBlocks ใช้เทคนิค Pomodoro ผสาน AI เพื่อปรับระยะเวลาโฟกัสให้เหมาะกับแต่ละคน ติดตาม deep work hours สถิติ productivity และ block distraction sites',
      shortDesc: 'Pomodoro timer อัจฉริยะพร้อม AI coaching', price: 390, salePrice: 290,
      currency: 'THB', categoryId: cats.prod, thumbnailUrl: thumb('FocusBlocks', '86198f'),
      screenshots: [], version: '1.2.3', platform: 'all' as const,
      tags: ['focus', 'pomodoro', 'productivity'], isActive: true, isFeatured: false,
      downloadUrl: 'https://example.com/download/focusblocks', createdAt: now, updatedAt: now,
    },
    {
      id: uuid(), name: 'ColorMind AI', slug: 'colormind-ai',
      description: 'ColorMind AI สร้าง color palette จาก mood board, ภาพถ่าย หรือ keyword ด้วย AI รองรับ export เป็น CSS, Figma, Tailwind variables และมี accessibility checker',
      shortDesc: 'สร้าง color palette สวยด้วย AI', price: 490, salePrice: undefined,
      currency: 'THB', categoryId: cats.design, thumbnailUrl: thumb('ColorMind', 'be185d'),
      screenshots: [], version: '1.0.1', platform: 'web' as const,
      tags: ['design', 'color', 'ai'], isActive: true, isFeatured: false,
      downloadUrl: 'https://example.com/download/colormind', createdAt: now, updatedAt: now,
    },
    {
      id: uuid(), name: 'GitDash', slug: 'gitdash',
      description: 'GitDash รวม dashboard สำหรับ GitHub, GitLab และ Bitbucket ในที่เดียว ดู PR, issues, CI/CD status พร้อม analytics ทีม รองรับ multiple organizations',
      shortDesc: 'Dashboard สำหรับ Git ทุก platform', price: 890, salePrice: 690,
      currency: 'THB', categoryId: cats.util, thumbnailUrl: thumb('GitDash', '1d4ed8'),
      screenshots: [], version: '3.2.0', platform: 'all' as const,
      tags: ['git', 'dashboard', 'developer'], isActive: true, isFeatured: true,
      downloadUrl: 'https://example.com/download/gitdash', createdAt: now, updatedAt: now,
    },
  ]

  productList.forEach(p => db.products.create(p as Product))

  // Admin user
  const hash = bcrypt.hashSync('admin1234', 10)
  db.users.create({
    id: uuid(), name: 'Admin', email: 'admin@zenyshop.xyz',
    password: hash, role: 'admin', createdAt: now,
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Product = any
