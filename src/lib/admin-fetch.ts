import { account } from "@appwrite/appwrite";

let _cache: { jwt: string; exp: number } | null = null;

async function getJwt(): Promise<string> {
  if (_cache && Date.now() < _cache.exp) return _cache.jwt;
  const result = await account.createJWT();
  _cache = { jwt: result.jwt, exp: Date.now() + 10 * 60 * 1000 };
  return result.jwt;
}

export async function adminFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const jwt = await getJwt();
  return fetch(url, {
    ...init,
    headers: { ...init.headers, "x-appwrite-jwt": jwt },
  });
}

export { getJwt };
