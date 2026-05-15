import { NextRequest, NextResponse } from "next/server";
import { Client, Databases } from "node-appwrite";
import { getUserFromRequest, unauthorized } from "@/lib/server-auth";

const DB = "zenvyshop";

function makeClient() {
  return new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
}

interface BuyBody { type_id: string; price: number; name: string; }

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();

  try {
    const { type_id, price } = await req.json() as BuyBody;
    if (!type_id || !price) return NextResponse.json({ ok: false, message: "ข้อมูลไม่ครบ" }, { status: 400 });

    const db = new Databases(makeClient());
    const profile = await db.getDocument(DB, "profiles", user.$id) as Record<string, unknown>;
    const balance = (profile.balance as number) ?? 0;
    if (balance < price) {
      return NextResponse.json({ ok: false, message: `ยอดเงินไม่พอ (มี ฿${balance} ต้องการ ฿${price})` });
    }
    const newBalance = Math.round((balance - price) * 100) / 100;
    await db.updateDocument(DB, "profiles", user.$id, { balance: newBalance });

    const gafiwRes = await fetch("https://gafiwshop.xyz/api/api_buy", {
      method: "POST",
      body: new URLSearchParams({ keyapi: process.env.GAFIW_API_KEY!, type_id }),
    });
    const gafiwData = await gafiwRes.json() as {
      ok: boolean; status: string; message?: string;
      data?: { uid: number; name: string; textdb: string; date: string; imageapi: string };
    };

    if (!gafiwData.ok || gafiwData.status !== "success") {
      await db.updateDocument(DB, "profiles", user.$id, { balance });
      return NextResponse.json({ ok: false, message: gafiwData.message || "ซื้อสินค้าไม่สำเร็จ" });
    }

    return NextResponse.json({
      ok: true, message: "ซื้อสำเร็จ", newBalance,
      order: {
        id:     gafiwData.data!.uid,
        name:   gafiwData.data!.name,
        textdb: gafiwData.data!.textdb,
        date:   gafiwData.data!.date,
        image:  gafiwData.data!.imageapi,
      },
    });
  } catch (err) {
    console.error("[gafiw/buy]", err);
    return NextResponse.json({ ok: false, message: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
