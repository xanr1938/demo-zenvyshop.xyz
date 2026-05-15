import { NextResponse } from "next/server";
const KEY = process.env.GAFIW_API_KEY || "xjgDHdjI0uYPrsrld5cu";
export async function GET() {
  const res = await fetch(`https://gafiwshop.xyz/api/api_history?keyapi=${KEY}`, { cache: "no-store" });
  return NextResponse.json(await res.json());
}
