import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, ID, Permission, Role } from "node-appwrite";
import { getUserFromRequest, unauthorized } from "@/lib/server-auth";

const DB = "zenvyshop";

function makeClient() {
  return new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
}

interface CartItemInput {
  id: string; name: string; qty: number; price: number;
  source?: "appwrite" | "gafiw"; type_id?: string;
}

interface OrderItem {
  id: string; name: string; qty: number; price: number;
  source: "appwrite" | "gafiw";
  description?: string;
  deliveryEmail?: string;
  deliveryPassword?: string;
  gafiwOrderId?: number;
  gafiwCredentials?: string;
  failed?: boolean;
}

// ── fetch GaFiwShop balance (บาท) ─────────────────────────────────────────────
async function getGafiwBalance(): Promise<number> {
  try {
    const res  = await fetch("https://gafiwshop.xyz/api/api_money", {
      method: "POST",
      body: new URLSearchParams({ keyapi: process.env.GAFIW_API_KEY! }),
    });
    const data = await res.json() as { status: string; msg?: string };
    if (data.status === "success" && data.msg) {
      return parseFloat(data.msg.replace(/[^0-9.-]/g, "")) || 0;
    }
    return 0;
  } catch { return 0; }
}

// ── buy single GaFiw product ──────────────────────────────────────────────────
async function buyGafiw(type_id: string): Promise<{ orderId: number; credentials: string } | null> {
  try {
    const res  = await fetch("https://gafiwshop.xyz/api/api_buy", {
      method: "POST",
      body: new URLSearchParams({ keyapi: process.env.GAFIW_API_KEY!, type_id }),
    });
    const data = await res.json() as { ok: boolean; status: string; data?: { uid: number; textdb: string } };
    if (data.ok && data.data) {
      const creds = data.data.textdb ?? "";
      // GaFiw บางครั้งคืน ok:true แต่ textdb เป็น error message
      const isError = !creds || /ไม่สามารถ|ติดต่อแอดมิน|out of stock|error|ไม่มีสินค้า/i.test(creds);
      if (isError) return null;
      return { orderId: data.data.uid, credentials: creds };
    }
    return null;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();

  try {
    const body = await req.json() as {
      items: CartItemInput[];
      total: number; note?: string; paymentMethod: "wallet" | "slip";
    };
    const { items, total, note, paymentMethod } = body;
    const userId = user.$id;
    if (!items?.length || !total) {
      return NextResponse.json({ success: false, message: "ข้อมูลไม่ครบ" }, { status: 400 });
    }

    // ── 1. ตรวจยอด GaFiw ก่อน (pre-check) ───────────────────────────────────
    const gafiwItems = items.filter((i) => i.source === "gafiw");
    if (gafiwItems.length > 0) {
      const gafiwBalance = await getGafiwBalance();
      const gafiwRequired = gafiwItems.reduce((sum, i) => sum + i.price * i.qty, 0);
      if (gafiwBalance < gafiwRequired) {
        return NextResponse.json({
          success: false,
          message: `ขณะนี้ไม่สามารถดำเนินการสั่งซื้อได้ กรุณาลองใหม่ภายหลังหรือติดต่อแอดมิน`,
        });
      }
    }

    // ── 2. ตรวจและหัก ZenvyShop balance ──────────────────────────────────────
    let currentBalance = 0;
    let orderStatus = "pending";
    if (paymentMethod === "wallet") {
      const profile = await new Databases(makeClient()).getDocument(DB, "profiles", userId) as Record<string, unknown>;
      currentBalance = (profile.balance as number) ?? 0;
      if (currentBalance < total) {
        return NextResponse.json({
          success: false,
          message: `ยอดเงินในกระเป๋าไม่พอ (มี ฿${currentBalance.toLocaleString()} ต้องการ ฿${total.toLocaleString()})`,
        });
      }
      await new Databases(makeClient()).updateDocument(DB, "profiles", userId, {
        balance: Math.round((currentBalance - total) * 100) / 100,
      });
      orderStatus = "paid";
    } else {
      orderStatus = "paid";
    }

    // ── 3. ประมวลผลแต่ละ item + refund ถ้า api_buy fail ─────────────────────
    let refundAmount = 0;
    const enrichedItems: OrderItem[] = await Promise.all(
      items.map(async (item) => {
        if (item.source === "gafiw" && item.type_id) {
          const result = await buyGafiw(item.type_id);
          if (!result) {
            // api_buy ล้มเหลว → คืนเงินรายการนี้
            refundAmount += item.price * item.qty;
            return {
              id: item.id, name: item.name, qty: item.qty, price: item.price,
              source: "gafiw" as const,
              gafiwCredentials: "❌ ซื้อไม่สำเร็จ — ยอดเงินต้นทางหรือ stock หมด (คืนเงินแล้ว)",
              failed: true,
            };
          }
          return {
            id: item.id, name: item.name, qty: item.qty, price: item.price,
            source: "gafiw" as const,
            gafiwOrderId:     result.orderId,
            gafiwCredentials: result.credentials,
          };
        }
        // Appwrite product
        try {
          const product = await new Databases(makeClient()).getDocument(DB, "products", item.id) as Record<string, unknown>;
          return {
            id: item.id, name: item.name, qty: item.qty, price: item.price,
            source: "appwrite" as const,
            description:      (product.description as string) ?? "",
            deliveryEmail:    (product.deliveryEmail as string) ?? "",
            deliveryPassword: (product.deliveryPassword as string) ?? "",
          };
        } catch {
          return { id: item.id, name: item.name, qty: item.qty, price: item.price, source: "appwrite" as const };
        }
      })
    );

    // ── 4. คืนเงินรายการที่ fail ─────────────────────────────────────────────
    const actualTotal = total - refundAmount;
    if (refundAmount > 0 && paymentMethod === "wallet") {
      const profile = await new Databases(makeClient()).getDocument(DB, "profiles", userId) as Record<string, unknown>;
      const afterDeduct = (profile.balance as number) ?? 0;
      await new Databases(makeClient()).updateDocument(DB, "profiles", userId, {
        balance: Math.round((afterDeduct + refundAmount) * 100) / 100,
      });
    }

    // ── 5. สร้าง order ────────────────────────────────────────────────────────
    const hasFailed = enrichedItems.some((i) => i.failed);
    const finalStatus = actualTotal === 0 ? "cancelled" : hasFailed ? "disputed" : orderStatus;

    const order = await new Databases(makeClient()).createDocument(
      DB, "orders", ID.unique(),
      {
        userId, status: finalStatus, total: actualTotal,
        items: JSON.stringify(enrichedItems),
        shippingAddress: "",
        note: note ?? "",
      },
      [Permission.read(Role.user(userId)), Permission.update(Role.user(userId))]
    );

    return NextResponse.json({
      success: true,
      orderId:   order.$id,
      status:    finalStatus,
      refunded:  refundAmount > 0 ? refundAmount : undefined,
      failedItems: hasFailed
        ? enrichedItems.filter((i) => i.failed).map((i) => i.name)
        : undefined,
    });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาด กรุณาลองใหม่" }, { status: 500 });
  }
}
