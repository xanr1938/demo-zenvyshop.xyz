import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, ID, Permission, Role } from "node-appwrite";

const ENDPOINT   = "https://sgp.cloud.appwrite.io/v1";
const PROJECT_ID = "69fb7f200039526c5d2e";
const API_KEY    = process.env.APPWRITE_API_KEY ||
  "standard_979247c9b5c9d9d687436ab286f30f3cb7f04ae51e580830384672a7086530ae44ffe6ec5bf5df9622964b7c89bc945bb4e2534c164a20c4d93682c72b731ec8e76397d517ee829b1e3b4ce3a023b5d042941d7f8f7533d4a190466d42ebf1650a7f017f533308f21516375238e73e78387d0781a8b1e77f0fcfa39c7888f67f";
const GAFIW_KEY  = process.env.GAFIW_API_KEY || "xjgDHdjI0uYPrsrld5cu";
const DB         = "zenvyshop";

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const db     = new Databases(client);

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
      body: new URLSearchParams({ keyapi: GAFIW_KEY }),
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
      body: new URLSearchParams({ keyapi: GAFIW_KEY, type_id }),
    });
    const data = await res.json() as { ok: boolean; status: string; data?: { uid: number; textdb: string } };
    if (data.ok && data.data) return { orderId: data.data.uid, credentials: data.data.textdb };
    return null;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      userId: string; items: CartItemInput[];
      total: number; note?: string; paymentMethod: "wallet" | "slip";
    };
    const { userId, items, total, note, paymentMethod } = body;
    if (!userId || !items?.length || !total) {
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
      const profile = await db.getDocument(DB, "profiles", userId) as Record<string, unknown>;
      currentBalance = (profile.balance as number) ?? 0;
      if (currentBalance < total) {
        return NextResponse.json({
          success: false,
          message: `ยอดเงินในกระเป๋าไม่พอ (มี ฿${currentBalance.toLocaleString()} ต้องการ ฿${total.toLocaleString()})`,
        });
      }
      await db.updateDocument(DB, "profiles", userId, {
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
          const product = await db.getDocument(DB, "products", item.id) as Record<string, unknown>;
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
      const profile = await db.getDocument(DB, "profiles", userId) as Record<string, unknown>;
      const afterDeduct = (profile.balance as number) ?? 0;
      await db.updateDocument(DB, "profiles", userId, {
        balance: Math.round((afterDeduct + refundAmount) * 100) / 100,
      });
    }

    // ── 5. สร้าง order ────────────────────────────────────────────────────────
    const hasFailed = enrichedItems.some((i) => i.failed);
    const finalStatus = actualTotal === 0 ? "cancelled" : hasFailed ? "disputed" : orderStatus;

    const order = await db.createDocument(
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
