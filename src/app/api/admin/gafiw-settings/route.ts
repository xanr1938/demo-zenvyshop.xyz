import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { getAdminFromRequest, unauthorized } from "@/lib/server-auth";
// GET is intentionally public — shop pages need it to show enabled products

const FILE = join(process.cwd(), "data", "gafiw-settings.json");

export interface DigitalSetting  { enabled: boolean; customPrice?: number; }
export type    DigitalSettings   = Record<string, DigitalSetting>;

function readSettings(): DigitalSettings {
  try {
    if (!existsSync(FILE)) return {};
    return JSON.parse(readFileSync(FILE, "utf-8"));
  } catch { return {}; }
}

export async function GET() {
  return NextResponse.json(readSettings());
}

export async function POST(req: NextRequest) {
  if (!await getAdminFromRequest(req)) return unauthorized();
  const body = await req.json() as DigitalSettings;
  writeFileSync(FILE, JSON.stringify(body, null, 2), "utf-8");
  return NextResponse.json({ ok: true });
}
