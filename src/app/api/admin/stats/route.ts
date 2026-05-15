import { NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";

const client = new Client()
  .setEndpoint("https://sgp.cloud.appwrite.io/v1")
  .setProject("69fb7f200039526c5d2e")
  .setKey(process.env.APPWRITE_API_KEY || "standard_979247c9b5c9d9d687436ab286f30f3cb7f04ae51e580830384672a7086530ae44ffe6ec5bf5df9622964b7c89bc945bb4e2534c164a20c4d93682c72b731ec8e76397d517ee829b1e3b4ce3a023b5d042941d7f8f7533d4a190466d42ebf1650a7f017f533308f21516375238e73e78387d0781a8b1e77f0fcfa39c7888f67f");
const db = new Databases(client);

export async function GET() {
  const [orders, products, profiles] = await Promise.all([
    db.listDocuments("zenvyshop", "orders", [Query.limit(500)]),
    db.listDocuments("zenvyshop", "products", [Query.limit(100)]),
    db.listDocuments("zenvyshop", "profiles", [Query.limit(500)]),
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
