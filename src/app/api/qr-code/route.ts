import { NextRequest } from "next/server";
import QRCode from "qrcode";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const generatePayload = require("promptpay-qr");

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const amount = parseFloat(searchParams.get("amount") || "0");
  const id = searchParams.get("id") || "0943164353";

  const payload: string = generatePayload(id, { amount });
  const dataUrl: string = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    width: 280,
    margin: 2,
    color: { dark: "#1e293b", light: "#ffffff" },
  });

  const base64 = dataUrl.split(",")[1];
  const buffer = Buffer.from(base64, "base64");

  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
