import { ID } from "appwrite";
import { storage } from "./appwrite";
import { BUCKETS } from "./config";

export async function uploadProductImage(file: File) {
  return storage.createFile(BUCKETS.PRODUCT_IMAGES, ID.unique(), file);
}

export function getProductImageUrl(fileId: string, width = 600, height = 600): string {
  return storage.getFilePreview("product-images", fileId, width, height).toString();
}

export async function deleteProductImage(fileId: string) {
  return storage.deleteFile(BUCKETS.PRODUCT_IMAGES, fileId);
}

export async function listProductImages() {
  return storage.listFiles(BUCKETS.PRODUCT_IMAGES);
}

// ─── Avatars ──────────────────────────────────────────────────────────────────

export async function uploadAvatar(file: File) {
  return storage.createFile("product-images", ID.unique(), file);
}

export function getAvatarUrl(fileId: string, size = 200): string {
  return storage.getFileView("product-images", fileId).toString();
}

export async function deleteAvatar(fileId: string) {
  return storage.deleteFile("product-images", fileId);
}
