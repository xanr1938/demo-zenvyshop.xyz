import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // อ่าน env var โดยตรง — ไม่ต้อง HTTP fetch ทุก request
  const enabled = process.env.MAINTENANCE_MODE === "true";

  if (enabled && pathname !== "/" && pathname !== "/maintenance") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!enabled && pathname === "/maintenance") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
