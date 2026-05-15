import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";
import { getAdminFromRequest, unauthorized } from "@/lib/server-auth";

function makeClient() {
  return new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
}

export async function GET(req: NextRequest) {
  if (!await getAdminFromRequest(req)) return unauthorized();

  const db = new Databases(makeClient());
  const [orders, products, profiles] = await Promise.all([
    db.listDocuments("zenvyshop", "orders",   [Query.limit(500)]),
    db.listDocuments("zenvyshop", "products",  [Query.limit(100)]),
    db.listDocuments("zenvyshop", "profiles",  [Query.limit(500)]),
  ]);

  const totalRevenue = orders.documents
    .filter((o) => (o as unknown as { status: string }).status === "paid")
    .reduce((sum, o) => sum + ((o as unknown as { total: number }).total ?? 0), 0);
  const pending = orders.documents.filter((o) => (o as unknown as { status: string }).status === "pending").length;

  return NextResponse.json({
    totalOrders:   orders.total,
    totalRevenue,
    pendingOrders: pending,
    totalProducts: products.total,
    totalUsers:    profiles.total,
  });
}
