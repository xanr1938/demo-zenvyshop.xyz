import { Models } from "appwrite";

export interface Product extends Models.Document {
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discount: number;
  stock: number;
  categoryId?: string;
  images: string[];
  featured: boolean;
  deliveryEmail?: string;
  deliveryPassword?: string;
}

export interface Category extends Models.Document {
  name: string;
  slug: string;
}

export type OrderStatus = "pending" | "confirmed" | "paid" | "cancelled" | "disputed";

export interface Order extends Models.Document {
  userId: string;
  status: OrderStatus;
  total: number;
  items: string;
  shippingAddress?: string;
  note?: string;
}

export interface Profile extends Models.Document {
  userId: string;
  name?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  balance?: number;
  role?: "admin" | "user";
}

export interface CartItem extends Product {
  qty: number;
  // GaFiwShop extras (undefined for Appwrite products)
  source?: "appwrite" | "gafiw";
  _imageUrl?: string;   // direct image URL (gafiw only)
  type_id?: string;     // gafiw type_id
  type_menu?: string;   // gafiw category label
}
