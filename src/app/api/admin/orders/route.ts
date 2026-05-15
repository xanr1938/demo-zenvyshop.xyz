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
  const res = await db.listDocuments("zenvyshop", "orders", [
    Query.orderDesc("$createdAt"), Query.limit(100),
  ]);
  return NextResponse.json(res);
}

export async function PATCH(req: NextRequest) {
  if (!await getAdminFromRequest(req)) return unauthorized();
  const { orderId, status } = await req.json() as { orderId: string; status: string };
  const db = new Databases(makeClient());
  const doc = await db.updateDocument("zenvyshop", "orders", orderId, { status });
  return NextResponse.json(doc);
}
