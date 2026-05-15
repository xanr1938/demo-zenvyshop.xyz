import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest, unauthorized } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  if (!await getAdminFromRequest(req)) return unauthorized();
  const res = await fetch("https://gafiwshop.xyz/api/api_money", {
    method: "POST",
    body: new URLSearchParams({ keyapi: process.env.GAFIW_API_KEY! }),
    next: { revalidate: 10 },
  });
  return NextResponse.json(await res.json());
}
