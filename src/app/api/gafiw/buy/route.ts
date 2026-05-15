import { NextRequest, NextResponse } from "next/server";
import { Client, Databases } from "node-appwrite";

const GAFIW_KEY  = process.env.GAFIW_API_KEY  || "xjgDHdjI0uYPrsrld5cu";
const API_KEY    = process.env.APPWRITE_API_KEY ||
  "standard_979247c9b5c9d9d687436ab286f30f3cb7f04ae51e580830384672a7086530ae44ffe6ec5bf5df9622964b7c89bc945bb4e2534c164a20c4d93682c72b731ec8e76397d517ee829b1e3b4ce3a023b5d042941d7f8f7533d4a190466d42ebf1650a7f017f533308f21516375238e73e78387d0781a8b1e77f0fcfa39c7888f67f";
const DB = "zenvyshop";

const appwrite = new Client()
  .setEndpoint("https://sgp.cloud.appwrite.io/v1")
  .setProject("69fb7f200039526c5d2e")
  .setKey(API_KEY);
const db = new Databases(appwrite);

interface BuyBody { userId: string; type_id: string; price: number; name: string; }

export async function POST(req: NextRequest) {
  try {
    const { userId, type_id, price, name } = await req.json() as BuyBody;
    if (!userId || !type_id || !price) return NextResponse.json({ ok: false, message: "ข้อมูลไม่ครบ" }, { status: 400 });

    // 1. Check & deduct ZenvyShop balance
    const profile = await db.getDocument(DB, "profiles", userId) as Record<string, unknown>;
    const balance = (profile.balance as number) ?? 0;
    if (balance < price) {
      return NextResponse.json({ ok: false, message: `ยอดเงินไม่พอ (มี ฿${balance} ต้องการ ฿${price})` });
    }
    const newBalance = Math.round((balance - price) * 100) / 100;
    await db.updateDocument(DB, "profiles", userId, { balance: newBalance });

    // 2. Call GaFiwShop api_buy
    const gafiwRes = await fetch("https://gafiwshop.xyz/api/api_buy", {
      method: "POST",
      body: new URLSearchParams({ keyapi: GAFIW_KEY, type_id }),
    });
    const gafiwData = await gafiwRes.json() as {
      ok: boolean; status: string; message?: string;
      data?: { uid: number; name: string; textdb: string; date: string; imageapi: string };
    };

    if (!gafiwData.ok || gafiwData.status !== "success") {
      // Refund balance if GaFiwShop fails
      await db.updateDocument(DB, "profiles", userId, { balance: balance });
      return NextResponse.json({ ok: false, message: gafiwData.message || "ซื้อสินค้าไม่สำเร็จ" });
    }

    return NextResponse.json({
      ok: true,
      message: "ซื้อสำเร็จ",
      newBalance,
      order: {
        id:      gafiwData.data!.uid,
        name:    gafiwData.data!.name,
        textdb:  gafiwData.data!.textdb,
        date:    gafiwData.data!.date,
        image:   gafiwData.data!.imageapi,
      },
    });
  } catch (err) {
    console.error("[gafiw/buy]", err);
    return NextResponse.json({ ok: false, message: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
