export interface User {
  id: string
  name: string
  email: string
  password: string
  role: 'customer' | 'admin'
  avatarUrl?: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDesc: string
  price: number
  salePrice?: number
  currency: string
  categoryId: string
  thumbnailUrl: string
  screenshots: string[]
  version: string
  platform: 'windows' | 'mac' | 'web' | 'all'
  tags: string[]
  isActive: boolean
  isFeatured: boolean
  downloadUrl?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  productId: string
  productName: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  userId: string
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  totalAmount: number
  currency: string
  paymentMethod?: string
  paymentRef?: string
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface License {
  id: string
  key: string
  orderId: string
  productId: string
  productName: string
  userId: string
  status: 'active' | 'revoked' | 'expired'
  expiresAt?: string
  createdAt: string
}

export interface CartItem {
  productId: string
  name: string
  price: number
  originalPrice: number
  thumbnailUrl: string
}

export interface AdminStats {
  totalRevenue: number
  totalOrders: number
  totalUsers: number
  totalProducts: number
  recentOrders: Order[]
}
