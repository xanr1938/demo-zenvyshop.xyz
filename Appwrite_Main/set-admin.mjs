import { Client, Databases } from "node-appwrite";
const client = new Client()
  .setEndpoint("https://sgp.cloud.appwrite.io/v1")
  .setProject("69fb7f200039526c5d2e")
  .setKey("standard_979247c9b5c9d9d687436ab286f30f3cb7f04ae51e580830384672a7086530ae44ffe6ec5bf5df9622964b7c89bc945bb4e2534c164a20c4d93682c72b731ec8e76397d517ee829b1e3b4ce3a023b5d042941d7f8f7533d4a190466d42ebf1650a7f017f533308f21516375238e73e78387d0781a8b1e77f0fcfa39c7888f67f");
const db = new Databases(client);
const DB = "zenvyshop";

// Add role attribute
try {
  await db.createEnumAttribute(DB, "profiles", "role", ["admin","user"], false, "user");
  console.log("✓ role attribute added");
} catch(e) {
  if (e.code === 409) console.log("- role already exists");
  else throw e;
}

// Wait for attribute to be ready
console.log("Waiting 3s...");
await new Promise(r => setTimeout(r, 3000));

// Set admin role for the owner
const ADMIN_EMAIL = "romsuaihsantongrom@gmail.com";
const profiles = await db.listDocuments(DB, "profiles");
for (const p of profiles.documents) {
  if (p.userId) {
    // Find user by checking account
    try {
      const { Users } = await import("node-appwrite");
      // We'll just set by profile userId matching known admin
    } catch {}
  }
}

// Set admin directly on the profile document (using userId from earlier orders)
const orders = await db.listDocuments(DB, "orders");
const adminUserId = orders.documents[0]?.userId;
if (adminUserId) {
  await db.updateDocument(DB, "profiles", adminUserId, { role: "admin" });
  console.log("✓ Admin role set for userId:", adminUserId);
} else {
  console.log("No orders found, please set admin manually in Appwrite Console");
  console.log("Go to: profiles collection > find your document > set role = admin");
}
