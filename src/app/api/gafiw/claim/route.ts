import { NextRequest, NextResponse } from "next/server";
const KEY = process.env.GAFIW_API_KEY || "xjgDHdjI0uYPrsrld5cu";
export async function POST(req: NextRequest) {
  const { order_id } = await req.json() as { order_id: number };
  const res = await fetch("https://gafiwshop.xyz/api/api_claim", {
    method: "POST", body: new URLSearchParams({ keyapi: KEY, order_id: String(order_id) }),
  });
  return NextResponse.json(await res.json());
}
