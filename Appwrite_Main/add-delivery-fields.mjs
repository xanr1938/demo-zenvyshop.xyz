import { Client, Databases } from "node-appwrite";
const client = new Client()
  .setEndpoint("https://sgp.cloud.appwrite.io/v1")
  .setProject("69fb7f200039526c5d2e")
  .setKey("standard_979247c9b5c9d9d687436ab286f30f3cb7f04ae51e580830384672a7086530ae44ffe6ec5bf5df9622964b7c89bc945bb4e2534c164a20c4d93682c72b731ec8e76397d517ee829b1e3b4ce3a023b5d042941d7f8f7533d4a190466d42ebf1650a7f017f533308f21516375238e73e78387d0781a8b1e77f0fcfa39c7888f67f");
const db = new Databases(client);
const DB = "zenvyshop";
const COL = "products";

async function addAttr(fn, label) {
  try { await fn(); console.log("  ✓", label); }
  catch(e) { if (e.code === 409) console.log("  -", label, "(exists)"); else throw e; }
}

console.log("Adding delivery fields to products...");
await addAttr(() => db.createStringAttribute(DB, COL, "deliveryEmail", 255, false), "deliveryEmail");
await addAttr(() => db.createStringAttribute(DB, COL, "deliveryPassword", 500, false), "deliveryPassword");
console.log("Done!");
