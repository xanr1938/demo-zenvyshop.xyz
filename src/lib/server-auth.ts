import type { NextRequest } from "next/server";
import { Client, Account, Databases } from "node-appwrite";

const ENDPOINT   = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "https://sgp.cloud.appwrite.io/v1";
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "69fb7f200039526c5d2e";
const DB         = "zenvyshop";

function makeAdminClient() {
  return new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY!);
}

export async function getUserFromRequest(req: NextRequest) {
  const jwt = req.headers.get("x-appwrite-jwt");
  if (!jwt) return null;
  try {
    const client = new Client()
      .setEndpoint(ENDPOINT)
      .setProject(PROJECT_ID)
      .setJWT(jwt);
    return await new Account(client).get();
  } catch {
    return null;
  }
}

export async function getAdminFromRequest(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return null;
  try {
    const db = new Databases(makeAdminClient());
    const profile = await db.getDocument(DB, "profiles", user.$id);
    if ((profile as Record<string, unknown>).role !== "admin") return null;
    return user;
  } catch {
    return null;
  }
}

export const unauthorized = () => Response.json({ error: "Unauthorized" }, { status: 401 });
export const forbidden    = () => Response.json({ error: "Forbidden" },    { status: 403 });
