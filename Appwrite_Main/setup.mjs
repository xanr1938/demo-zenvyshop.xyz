/**
 * ZenvyShop — Appwrite Schema Setup
 * Run once: npm run setup
 * Creates database, collections, attributes, indexes, storage bucket, and seed data.
 */

import {
  Client, Databases, Storage,
  Permission, Role,
} from "node-appwrite";

const ENDPOINT   = "https://sgp.cloud.appwrite.io/v1";
const PROJECT_ID = "69fb7f200039526c5d2e";
const API_KEY    = process.env.APPWRITE_API_KEY ||
  "standard_979247c9b5c9d9d687436ab286f30f3cb7f04ae51e580830384672a7086530ae44ffe6ec5bf5df9622964b7c89bc945bb4e2534c164a20c4d93682c72b731ec8e76397d517ee829b1e3b4ce3a023b5d042941d7f8f7533d4a190466d42ebf1650a7f017f533308f21516375238e73e78387d0781a8b1e77f0fcfa39c7888f67f";

const DATABASE_ID = "zenvyshop";

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const db      = new Databases(client);
const storage = new Storage(client);

const ok  = (msg) => console.log(`  ✓ ${msg}`);
const skip = (msg) => console.log(`  - ${msg} (already exists)`);

async function tryCreate(fn, label) {
  try { await fn(); ok(label); }
  catch (e) { if (e.code === 409) skip(label); else throw e; }
}

// ─── Database ─────────────────────────────────────────────────────────────────
async function createDatabase() {
  console.log("\n[1/6] Database");
  try {
    await db.create(DATABASE_ID, "ZenvyShop");
    ok(`Database "${DATABASE_ID}"`);
  } catch (e) {
    if (e.code === 409) {
      skip(`Database "${DATABASE_ID}"`);
    } else {
      // Plan limit hit — check if database already exists from a previous run
      try {
        await db.get(DATABASE_ID);
        skip(`Database "${DATABASE_ID}" (plan limit — using existing)`);
      } catch {
        throw e; // Database truly doesn't exist and can't be created
      }
    }
  }
}

// ─── Collections ──────────────────────────────────────────────────────────────
async function createCollections() {
  console.log("\n[2/6] Collections");

  // products
  await tryCreate(() => db.createCollection(
    DATABASE_ID, "products", "Products",
    [Permission.read(Role.any()), Permission.write(Role.users())]
  ), "Collection: products");

  // categories
  await tryCreate(() => db.createCollection(
    DATABASE_ID, "categories", "Categories",
    [Permission.read(Role.any()), Permission.write(Role.users())]
  ), "Collection: categories");

  // orders
  await tryCreate(() => db.createCollection(
    DATABASE_ID, "orders", "Orders",
    [Permission.read(Role.users()), Permission.create(Role.users())]
  ), "Collection: orders");

  // profiles
  await tryCreate(() => db.createCollection(
    DATABASE_ID, "profiles", "Profiles",
    [Permission.read(Role.users()), Permission.create(Role.users()), Permission.update(Role.users())]
  ), "Collection: profiles");
}

// ─── Attributes ───────────────────────────────────────────────────────────────
async function createAttributes() {
  console.log("\n[3/6] Attributes");

  // helper wrappers
  const str  = (col, key, size, required, def) =>
    tryCreate(() => db.createStringAttribute(DATABASE_ID, col, key, size, required, def), `${col}.${key}`);
  const flt  = (col, key, required, def) =>
    tryCreate(() => db.createFloatAttribute(DATABASE_ID, col, key, required, def), `${col}.${key}`);
  const int  = (col, key, required, def) =>
    tryCreate(() => db.createIntegerAttribute(DATABASE_ID, col, key, required, undefined, undefined, def), `${col}.${key}`);
  const bool = (col, key, required, def) =>
    tryCreate(() => db.createBooleanAttribute(DATABASE_ID, col, key, required, def), `${col}.${key}`);
  const arr  = (col, key, size) =>
    tryCreate(() => db.createStringAttribute(DATABASE_ID, col, key, size, false, undefined, true), `${col}.${key}[]`);

  // products
  await str ("products", "name",          255,   true);
  await str ("products", "slug",          255,   true);
  await str ("products", "description",   5000,  false);
  await flt ("products", "price",         true);
  await flt ("products", "originalPrice", false);
  await int ("products", "discount",      false, 0);
  await int ("products", "stock",         false, 0);
  await str ("products", "categoryId",    36,    false);
  await arr ("products", "images",        36);
  await bool("products", "featured",      false, false);

  // categories
  await str("categories", "name", 100, true);
  await str("categories", "slug", 100, true);

  // orders
  await str("orders", "userId",          36,    true);
  await str("orders", "status",          20,    false, "pending");
  await flt("orders", "total",           true);
  await str("orders", "items",           65535, true);
  await str("orders", "shippingAddress", 1000,  false);
  await str("orders", "note",            500,   false);

  // profiles
  await str("profiles", "userId", 36,   true);
  await str("profiles", "name",   255,  false);
  await str("profiles", "phone",  20,   false);
  await str("profiles", "address",1000, false);
  await str("profiles", "avatar", 36,   false);
}

// ─── Indexes ──────────────────────────────────────────────────────────────────
async function createIndexes() {
  console.log("\n[4/6] Indexes");
  await tryCreate(() => db.createIndex(DATABASE_ID, "products", "idx_slug", "unique", ["slug"]), "products.slug unique");
  await tryCreate(() => db.createIndex(DATABASE_ID, "products", "idx_name_ft", "fulltext", ["name"]), "products.name fulltext");
  await tryCreate(() => db.createIndex(DATABASE_ID, "products", "idx_category", "key", ["categoryId"]), "products.categoryId");
  await tryCreate(() => db.createIndex(DATABASE_ID, "categories", "idx_slug", "unique", ["slug"]), "categories.slug unique");
  await tryCreate(() => db.createIndex(DATABASE_ID, "orders", "idx_user", "key", ["userId"]), "orders.userId");
  await tryCreate(() => db.createIndex(DATABASE_ID, "profiles", "idx_user", "key", ["userId"]), "profiles.userId");
}

// ─── Storage ──────────────────────────────────────────────────────────────────
async function createStorage() {
  console.log("\n[5/6] Storage");
  await tryCreate(() => storage.createBucket(
    "product-images", "Product Images",
    [Permission.read(Role.any()), Permission.create(Role.users()), Permission.delete(Role.users())],
    false, true, 5 * 1024 * 1024,
    ["image/jpeg", "image/png", "image/webp", "image/gif"]
  ), "Bucket: product-images");
}

// ─── Seed ─────────────────────────────────────────────────────────────────────
async function seedData() {
  console.log("\n[6/6] Seed Data");

  // Wait for attributes to be ready
  await new Promise(r => setTimeout(r, 3000));

  const cats = [
    { name: "Digital", slug: "digital" },
    { name: "Physical", slug: "physical" },
    { name: "Software", slug: "software" },
  ];
  for (const cat of cats) {
    await tryCreate(
      () => db.createDocument(DATABASE_ID, "categories", cat.slug, cat),
      `Category: ${cat.name}`
    );
  }

  const products = [
    {
      name: "ZenvyShop Pro License",
      slug: "zenvyshop-pro",
      description: `ZenvyShop Pro License ให้คุณเข้าถึงฟีเจอร์ทั้งหมดของระบบร้านค้าออนไลน์อย่างเต็มรูปแบบ

✅ ฟีเจอร์ที่ได้รับ:
• ระบบจัดการสินค้าไม่จำกัดจำนวน
• Dashboard วิเคราะห์ยอดขายแบบ Realtime
• ระบบ Auth ด้วย Appwrite (Login / Register / OAuth)
• ระบบตะกร้าสินค้าและ Checkout
• การแจ้งเตือน Order Status อัปเดตแบบ Realtime
• รองรับ Multi-language (TH / EN)
• Priority Support ตลอด 24 ชั่วโมง

📦 ส่งมอบ: License Key ส่งทาง Email ภายใน 5 นาทีหลังชำระเงิน
🔄 อัปเดต: ฟรีตลอดอายุการใช้งาน`,
      price: 990, discount: 0, stock: 999, categoryId: "software", featured: true, images: [],
    },
    {
      name: "Design System Pack",
      slug: "design-system-pack",
      description: `Design System Pack ครบชุดสำหรับนักพัฒนาและนักออกแบบที่ต้องการ UI Component พร้อมใช้งาน

🎨 สิ่งที่ได้รับในแพ็กนี้:
• Component Library 200+ ชิ้น (Tailwind CSS v4)
• Design Token ครบ: สี, Typography, Spacing, Shadow
• Dark Mode รองรับทุก Component
• Figma File พร้อม Auto Layout
• React + TypeScript source code

🛠 รองรับ Framework:
Next.js 15 / React 19 / Vite 6

📁 ส่งมอบ: ไฟล์ ZIP ดาวน์โหลดทันทีหลังชำระเงิน
ขนาด: ~45 MB`,
      price: 590, originalPrice: 990, discount: 40, stock: 999, categoryId: "digital", featured: true, images: [],
    },
    {
      name: "API Integration Kit",
      slug: "api-integration-kit",
      description: `API Integration Kit รวม hook และ wrapper function พร้อมใช้งานสำหรับ Appwrite SDK

📦 เนื้อหาที่ได้รับ:
• TypeScript hooks สำหรับ Auth, Database, Storage, Realtime
• Error handling แบบ centralized ทุก endpoint
• React Query integration พร้อม caching
• ตัวอย่างโค้ดครบทุก use case
• Unit test ครอบคลุม 90%

⚡ ใช้งานง่าย:
\`\`\`ts
import { useProducts } from "@/hooks/useProducts";
const { data, loading } = useProducts({ featured: true });
\`\`\`

📁 ส่งมอบ: GitHub Repository access (Private Repo)`,
      price: 390, discount: 0, stock: 50, categoryId: "software", featured: false, images: [],
    },
  ];
  for (const p of products) {
    await tryCreate(
      () => db.createDocument(DATABASE_ID, "products", p.slug, p),
      `Product: ${p.name}`
    );
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
console.log("ZenvyShop — Appwrite Setup");
console.log("==========================");
try {
  await createDatabase();
  await createCollections();
  await createAttributes();
  await createIndexes();
  await createStorage();
  await seedData();
  console.log("\n✅ Setup complete! Run `npm run dev` to start.");
} catch (err) {
  console.error("\n❌ Setup failed:", err.message);
  process.exit(1);
}
