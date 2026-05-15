import { NextRequest } from "next/server";
import { getAdminFromRequest, unauthorized } from "@/lib/server-auth";

let state = { enabled: false, type: "server" };

export async function GET() {
  return Response.json(state);
}

export async function POST(req: NextRequest) {
  if (!await getAdminFromRequest(req)) return unauthorized();
  const body = await req.json() as { enabled?: boolean; type?: string };
  if (typeof body.enabled === "boolean") state.enabled = body.enabled;
  if (body.type) state.type = body.type;
  return Response.json({ success: true, state });
}
