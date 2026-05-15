import { ID, Query, Permission, Role, Models } from "appwrite";
import { databases } from "./appwrite";
import { DATABASE_ID, COLLECTIONS } from "./config";
import type { Product, Category, Order, Profile, OrderStatus } from "./types";

interface GetProductsOptions {
  categoryId?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(
  options: GetProductsOptions = {}
): Promise<Models.DocumentList<Product>> {
  const { categoryId, featured, search, limit = 20, offset = 0 } = options;
  const queries = [Query.limit(limit), Query.offset(offset), Query.orderDesc("$createdAt")];
  if (categoryId) queries.push(Query.equal("categoryId", categoryId));
  if (featured !== undefined) queries.push(Query.equal("featured", featured));
  if (search) queries.push(Query.search("name", search));
  return databases.listDocuments<Product>(DATABASE_ID, COLLECTIONS.PRODUCTS, queries);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const res = await databases.listDocuments<Product>(DATABASE_ID, COLLECTIONS.PRODUCTS, [
    Query.equal("slug", slug),
    Query.limit(1),
  ]);
  return res.documents[0] ?? null;
}

export async function getProduct(id: string): Promise<Product> {
  return databases.getDocument<Product>(DATABASE_ID, COLLECTIONS.PRODUCTS, id);
}

export async function createProduct(
  data: Omit<Product, keyof Models.Document>
): Promise<Product> {
  return databases.createDocument<Product>(DATABASE_ID, COLLECTIONS.PRODUCTS, ID.unique(), data);
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, keyof Models.Document>>
): Promise<Product> {
  return databases.updateDocument<Product>(DATABASE_ID, COLLECTIONS.PRODUCTS, id, data);
}

export async function deleteProduct(id: string): Promise<void> {
  await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PRODUCTS, id);
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Models.DocumentList<Category>> {
  return databases.listDocuments<Category>(DATABASE_ID, COLLECTIONS.CATEGORIES, [
    Query.limit(100),
  ]);
}

export async function createCategory(
  data: Omit<Category, keyof Models.Document>
): Promise<Category> {
  return databases.createDocument<Category>(
    DATABASE_ID, COLLECTIONS.CATEGORIES, ID.unique(), data
  );
}

// ─── Orders ───────────────────────────────────────────────────────────────────

type CreateOrderData = Omit<Order, keyof Models.Document | "userId" | "status">;

export async function createOrder(
  userId: string,
  data: CreateOrderData
): Promise<Order> {
  return databases.createDocument<Order>(
    DATABASE_ID, COLLECTIONS.ORDERS, ID.unique(),
    { ...data, userId, status: "pending" as OrderStatus },
    [Permission.read(Role.user(userId)), Permission.update(Role.user(userId))]
  );
}

export async function getUserOrders(userId: string): Promise<Models.DocumentList<Order>> {
  return databases.listDocuments<Order>(DATABASE_ID, COLLECTIONS.ORDERS, [
    Query.equal("userId", userId),
    Query.orderDesc("$createdAt"),
  ]);
}

export async function getOrder(id: string): Promise<Order> {
  return databases.getDocument<Order>(DATABASE_ID, COLLECTIONS.ORDERS, id);
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return databases.updateDocument<Order>(DATABASE_ID, COLLECTIONS.ORDERS, id, { status });
}

// ─── Profiles ─────────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    return await databases.getDocument<Profile>(DATABASE_ID, COLLECTIONS.PROFILES, userId);
  } catch {
    return null;
  }
}

export async function updateProfile(
  userId: string,
  data: Partial<Omit<Profile, keyof Models.Document>>
): Promise<Profile> {
  return databases.updateDocument<Profile>(DATABASE_ID, COLLECTIONS.PROFILES, userId, data);
}
