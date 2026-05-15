import { NextRequest, NextResponse } from "next/server";
import { Client as ServerClient, Databases, Users } from "node-appwrite";
import { cookies } from "next/headers";

const SLIPOK_KEY    = process.env.SLIPOK_KEY    || "SLIPOKFBI6HHE";
const SLIPOK_BRANCH = process.env.SLIPOK_BRANCH || "64978";
const APPWRITE_KEY  = process.env.APPWRITE_API_KEY ||
  "standard_979247c9b5c9d9d687436ab286f30f3cb7f04ae51e580830384672a7086530ae44ffe6ec5bf5df9622964b7c89bc945bb4e2534c164a20c4d93682c72b731ec8e76397d517ee829b1e3b4ce3a023b5d042941d7f8f7533d4a190466d42ebf1650a7f017f533308f21516375238e73e78387d0781a8b1e77f0fcfa39c7888f67f";

const PROJECT_ID = "69fb7f200039526c5d2e";
const DB_ID      = "zenvyshop";

function makeServerClient(session?: string) {
  const c = new ServerClient()
    .setEndpoint("https://sgp.cloud.appwrite.io/v1")
    .setProject(PROJECT_ID);
  if (session) c.setSession(session);
  else c.setKey(APPWRITE_KEY);
  return c;
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const slip           = form.get("slip") as File | null;
    const expectedAmount = form.get("amount");
    const userId         = form.get("userId") as string | null;

    if (!slip) {
      return NextResponse.json({ success: false, message: "กรุณาแนบสลิป" }, { status: 400 });
    }

    // ── 1. Verify with SlipOK ─────────────────────────────────────────────────
    const slipokForm = new FormData();
    slipokForm.append("files", slip);
    slipokForm.append("log", "true");

    const slipRes = await fetch(
      `https://api.slipok.com/api/line/apikey/${SLIPOK_BRANCH}`,
      { method: "POST", headers: { "x-authorization": SLIPOK_KEY }, body: slipokForm }
    );
    const slipData = await slipRes.json();

    if (!slipRes.ok || !slipData.success) {
      return NextResponse.json({
        success: false,
        message: slipData.message || "ไม่สามารถยืนยันสลิปได้ กรุณาลองใหม่",
      });
    }

    const paidAmount: number = slipData.data?.amount ?? 0;
    const expected = expectedAmount ? parseFloat(expectedAmount.toString()) : null;

    if (expected && Math.abs(paidAmount - expected) > 0.01) {
      return NextResponse.json({
        success: false,
        message: `ยอดเงินไม่ตรง — สลิปแสดง ฿${paidAmount.toLocaleString()} แต่ต้องการ ฿${expected.toLocaleString()}`,
        paid: paidAmount,
      });
    }

    // ── 2. Credit balance ─────────────────────────────────────────────────────
    let newBalance: number | null = null;

    if (userId) {
      try {
        const db = new Databases(makeServerClient());
        const profile = await db.getDocument(DB_ID, "profiles", userId);
        const current: number = (profile as Record<string, unknown>).balance as number ?? 0;
        newBalance = Math.round((current + paidAmount) * 100) / 100;
        await db.updateDocument(DB_ID, "profiles", userId, { balance: newBalance });
      } catch (e) {
        console.error("[verify-slip] balance update failed:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: "ยืนยันสลิปสำเร็จ",
      paid: paidAmount,
      newBalance,
      sender: slipData.data?.sender?.account?.name?.th ?? "",
      date:   slipData.data?.date ?? "",
      ref:    slipData.data?.transRef ?? "",
    });
  } catch (err) {
    console.error("[verify-slip]", err);
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาด กรุณาลองใหม่" }, { status: 500 });
  }
}
