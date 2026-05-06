import fs from 'fs'
import path from 'path'
import type { User, Product, Category, Order, License } from '@/types'

const DATA_DIR = path.join(process.cwd(), 'data')

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function readFile<T>(filename: string, fallback: T): T {
  ensureDir()
  const fp = path.join(DATA_DIR, filename)
  if (!fs.existsSync(fp)) return fallback
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')) } catch { return fallback }
}

function writeFile<T>(filename: string, data: T): void {
  ensureDir()
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8')
}

const users = {
  findAll: (): User[] => readFile('users.json', []),
  findById: (id: string) => readFile<User[]>('users.json', []).find(u => u.id === id),
  findByEmail: (email: string) => readFile<User[]>('users.json', []).find(u => u.email === email),
  create: (user: User) => {
    const list = readFile<User[]>('users.json', [])
    list.push(user)
    writeFile('users.json', list)
  },
  update: (id: string, data: Partial<User>) => {
    const list = readFile<User[]>('users.json', [])
    const idx = list.findIndex(u => u.id === id)
    if (idx === -1) return null
    list[idx] = { ...list[idx], ...data }
    writeFile('users.json', list)
    return list[idx]
  },
  count: () => readFile<User[]>('users.json', []).length,
}

const products = {
  findAll: (filters?: { categoryId?: string; isActive?: boolean; isFeatured?: boolean; search?: string }): Product[] => {
    let list = readFile<Product[]>('products.json', [])
    if (filters?.categoryId) list = list.filter(p => p.categoryId === filters.categoryId)
    if (filters?.isActive !== undefined) list = list.filter(p => p.isActive === filters.isActive)
    if (filters?.isFeatured !== undefined) list = list.filter(p => p.isFeatured === filters.isFeatured)
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.shortDesc.toLowerCase().includes(q))
    }
    return list
  },
  findById: (id: string) => readFile<Product[]>('products.json', []).find(p => p.id === id),
  findBySlug: (slug: string) => readFile<Product[]>('products.json', []).find(p => p.slug === slug),
  create: (product: Product) => {
    const list = readFile<Product[]>('products.json', [])
    list.push(product)
    writeFile('products.json', list)
  },
  update: (id: string, data: Partial<Product>) => {
    const list = readFile<Product[]>('products.json', [])
    const idx = list.findIndex(p => p.id === id)
    if (idx === -1) return null
    list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() }
    writeFile('products.json', list)
    return list[idx]
  },
  delete: (id: string): boolean => {
    const list = readFile<Product[]>('products.json', [])
    const next = list.filter(p => p.id !== id)
    if (next.length === list.length) return false
    writeFile('products.json', next)
    return true
  },
  count: () => readFile<Product[]>('products.json', []).length,
}

const categories = {
  findAll: (): Category[] => readFile('categories.json', []),
  findById: (id: string) => readFile<Category[]>('categories.json', []).find(c => c.id === id),
  findBySlug: (slug: string) => readFile<Category[]>('categories.json', []).find(c => c.slug === slug),
  create: (cat: Category) => {
    const list = readFile<Category[]>('categories.json', [])
    list.push(cat)
    writeFile('categories.json', list)
  },
}

const orders = {
  findAll: (): Order[] => readFile('orders.json', []),
  findByUserId: (userId: string) => readFile<Order[]>('orders.json', []).filter(o => o.userId === userId),
  findById: (id: string) => readFile<Order[]>('orders.json', []).find(o => o.id === id),
  create: (order: Order) => {
    const list = readFile<Order[]>('orders.json', [])
    list.push(order)
    writeFile('orders.json', list)
  },
  update: (id: string, data: Partial<Order>) => {
    const list = readFile<Order[]>('orders.json', [])
    const idx = list.findIndex(o => o.id === id)
    if (idx === -1) return null
    list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() }
    writeFile('orders.json', list)
    return list[idx]
  },
  count: () => readFile<Order[]>('orders.json', []).length,
  totalRevenue: () =>
    readFile<Order[]>('orders.json', [])
      .filter(o => o.status === 'paid')
      .reduce((sum, o) => sum + o.totalAmount, 0),
}

const licenses = {
  findAll: (): License[] => readFile('licenses.json', []),
  findByUserId: (userId: string) => readFile<License[]>('licenses.json', []).filter(l => l.userId === userId),
  findByKey: (key: string) => readFile<License[]>('licenses.json', []).find(l => l.key === key),
  findByOrderId: (orderId: string) => readFile<License[]>('licenses.json', []).filter(l => l.orderId === orderId),
  create: (license: License) => {
    const list = readFile<License[]>('licenses.json', [])
    list.push(license)
    writeFile('licenses.json', list)
  },
  update: (id: string, data: Partial<License>) => {
    const list = readFile<License[]>('licenses.json', [])
    const idx = list.findIndex(l => l.id === id)
    if (idx === -1) return null
    list[idx] = { ...list[idx], ...data }
    writeFile('licenses.json', list)
    return list[idx]
  },
}

export const db = { users, products, categories, orders, licenses }
