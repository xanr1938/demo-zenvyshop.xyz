import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { getAdminFromRequest, unauthorized } from "@/lib/server-auth";

const FILE = join(process.cwd(), "data", "gafiw-settings.json");

export interface GafiwSetting  { enabled: boolean; customPrice?: number; }
export type    GafiwSettings   = Record<string, GafiwSetting>;

function readSettings(): GafiwSettings {
  try {
    if (!existsSync(FILE)) return {};
    return JSON.parse(readFileSync(FILE, "utf-8"));
  } catch { return {}; }
}

export async function GET(req: NextRequest) {
  if (!await getAdminFromRequest(req)) return unauthorized();
  return NextResponse.json(readSettings());
}

export async function POST(req: NextRequest) {
  if (!await getAdminFromRequest(req)) return unauthorized();
  const body = await req.json() as GafiwSettings;
  writeFileSync(FILE, JSON.stringify(body, null, 2), "utf-8");
  return NextResponse.json({ ok: true });
}
