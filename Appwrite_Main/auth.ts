import { ID, Models } from "appwrite";
import { account, databases } from "./appwrite";
import { DATABASE_ID, COLLECTIONS } from "./config";

export async function register(
  name: string,
  email: string,
  password: string
): Promise<Models.User<Models.Preferences>> {
  const user = await account.create(ID.unique(), email, password, name);
  await account.createEmailPasswordSession(email, password);
  await databases.createDocument(DATABASE_ID, COLLECTIONS.PROFILES, user.$id, {
    userId: user.$id,
    name,
  });
  return user;
}

export async function login(email: string, password: string): Promise<Models.Session> {
  try { await account.deleteSession("current"); } catch { /* no active session */ }
  return account.createEmailPasswordSession(email, password);
}

export async function logout(): Promise<void> {
  await account.deleteSession("current");
}

export async function getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

export async function forgotPassword(email: string): Promise<Models.Token> {
  return account.createRecovery(
    email,
    `${typeof window !== "undefined" ? window.location.origin : ""}/reset-password`
  );
}
