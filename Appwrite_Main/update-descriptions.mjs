/**
 * อัปเดต description ของสินค้า seed ที่มีอยู่แล้ว
 * รัน: node Appwrite_Main/update-descriptions.mjs
 */
import { Client, Databases } from "node-appwrite";

const client = new Client()
  .setEndpoint("https://sgp.cloud.appwrite.io/v1")
  .setProject("69fb7f200039526c5d2e")
  .setKey(process.env.APPWRITE_API_KEY ||
    "standard_979247c9b5c9d9d687436ab286f30f3cb7f04ae51e580830384672a7086530ae44ffe6ec5bf5df9622964b7c89bc945bb4e2534c164a20c4d93682c72b731ec8e76397d517ee829b1e3b4ce3a023b5d042941d7f8f7533d4a190466d42ebf1650a7f017f533308f21516375238e73e78387d0781a8b1e77f0fcfa39c7888f67f");

const db = new Databases(client);
const DB = "zenvyshop";
const COL = "products";

const updates = [
  {
    id: "zenvyshop-pro",
    description: `ZenvyShop Pro License ให้คุณเข้าถึงฟีเจอร์ทั้งหมดของระบบร้านค้าออนไลน์อย่างเต็มรูปแบบ

✅ ฟีเจอร์ที่ได้รับ:
• ระบบจัดการสินค้าไม่จำกัดจำนวน
• Dashboard วิเคราะห์ยอดขายแบบ Realtime
• ระบบ Auth ด้วย Appwrite (Login / Register)
• ระบบตะกร้าสินค้าและ Checkout
• การแจ้งเตือน Order Status อัปเดตแบบ Realtime
• Priority Support ตลอด 24 ชั่วโมง

📦 ส่งมอบ: License Key ส่งทาง Email ภายใน 5 นาทีหลังชำระเงิน
🔄 อัปเดต: ฟรีตลอดอายุการใช้งาน`,
  },
  {
    id: "design-system-pack",
    description: `Design System Pack ครบชุดสำหรับนักพัฒนาและนักออกแบบที่ต้องการ UI Component พร้อมใช้งาน

🎨 สิ่งที่ได้รับในแพ็กนี้:
• Component Library 200+ ชิ้น (Tailwind CSS v4)
• Design Token ครบ: สี, Typography, Spacing, Shadow
• Dark Mode รองรับทุก Component
• Figma File พร้อม Auto Layout
• React + TypeScript source code

🛠 รองรับ Framework: Next.js 15 / React 19

📁 ส่งมอบ: ไฟล์ ZIP ดาวน์โหลดทันทีหลังชำระเงิน ขนาด ~45 MB`,
  },
  {
    id: "api-integration-kit",
    description: `API Integration Kit รวม hook และ wrapper function พร้อมใช้งานสำหรับ Appwrite SDK

📦 เนื้อหาที่ได้รับ:
• TypeScript hooks สำหรับ Auth, Database, Storage, Realtime
• Error handling แบบ centralized ทุก endpoint
• React Query integration พร้อม caching
• ตัวอย่างโค้ดครบทุก use case
• Unit test ครอบคลุม 90%

📁 ส่งมอบ: GitHub Repository access (Private Repo)`,
  },
];

console.log("Updating product descriptions...");
for (const u of updates) {
  try {
    await db.updateDocument(DB, COL, u.id, { description: u.description });
    console.log(`  ✓ ${u.id}`);
  } catch (e) {
    console.error(`  ✗ ${u.id}: ${e.message}`);
  }
}
console.log("Done!");
