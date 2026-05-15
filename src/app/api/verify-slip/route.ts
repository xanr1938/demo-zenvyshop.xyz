import { NextRequest, NextResponse } from "next/server";
import { Client, Databases } from "node-appwrite";
import { getUserFromRequest, unauthorized } from "@/lib/server-auth";

const DB_ID = "zenvyshop";

function makeAdminClient() {
  return new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  try {
    const form           = await request.formData();
    const slip           = form.get("slip") as File | null;
    const expectedAmount = form.get("amount");

    if (!slip) return NextResponse.json({ success: false, message: "กรุณาแนบสลิป" }, { status: 400 });

    const slipokForm = new FormData();
    slipokForm.append("files", slip);
    slipokForm.append("log", "true");

    const slipRes = await fetch(
      `https://api.slipok.com/api/line/apikey/${process.env.SLIPOK_BRANCH}`,
      { method: "POST", headers: { "x-authorization": process.env.SLIPOK_KEY! }, body: slipokForm }
    );
    const slipData = await slipRes.json();

    if (!slipRes.ok || !slipData.success) {
      return NextResponse.json({ success: false, message: slipData.message || "ไม่สามารถยืนยันสลิปได้ กรุณาลองใหม่" });
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

    // Credit balance — userId comes from validated JWT, not from request body
    let newBalance: number | null = null;
    try {
      const db      = new Databases(makeAdminClient());
      const profile = await db.getDocument(DB_ID, "profiles", user.$id);
      const current = (profile as Record<string, unknown>).balance as number ?? 0;
      newBalance    = Math.round((current + paidAmount) * 100) / 100;
      await db.updateDocument(DB_ID, "profiles", user.$id, { balance: newBalance });
    } catch (e) {
      console.error("[verify-slip] balance update failed:", e);
    }

    return NextResponse.json({
      success: true, message: "ยืนยันสลิปสำเร็จ",
      paid: paidAmount, newBalance,
      sender: slipData.data?.sender?.account?.name?.th ?? "",
      date:   slipData.data?.date ?? "",
      ref:    slipData.data?.transRef ?? "",
    });
  } catch (err) {
    console.error("[verify-slip]", err);
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาด กรุณาลองใหม่" }, { status: 500 });
  }
}
