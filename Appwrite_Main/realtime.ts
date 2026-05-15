import { RealtimeResponseEvent } from "appwrite";
import { client } from "./appwrite";
import { DATABASE_ID, COLLECTIONS, BUCKETS } from "./config";

type UnsubscribeFn = () => void;

const dbChannel = (collection: string, id = ""): string =>
  `databases.${DATABASE_ID}.collections.${collection}.documents${id ? `.${id}` : ""}`;

export function subscribeToOrder(
  orderId: string,
  callback: (event: RealtimeResponseEvent<unknown>) => void
): UnsubscribeFn {
  return client.subscribe(dbChannel(COLLECTIONS.ORDERS, orderId), callback);
}

export function subscribeToUserOrders(
  userId: string,
  callback: (event: RealtimeResponseEvent<unknown>) => void
): UnsubscribeFn {
  return client.subscribe(dbChannel(COLLECTIONS.ORDERS), (event) => {
    const payload = event.payload as { userId?: string };
    if (payload?.userId === userId) callback(event);
  });
}

export function subscribeToProducts(
  callback: (event: RealtimeResponseEvent<unknown>) => void
): UnsubscribeFn {
  return client.subscribe(dbChannel(COLLECTIONS.PRODUCTS), callback);
}

export function subscribeToProductImages(
  callback: (event: RealtimeResponseEvent<unknown>) => void
): UnsubscribeFn {
  return client.subscribe(`buckets.${BUCKETS.PRODUCT_IMAGES}.files`, callback);
}
