// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   const maintenance = process.env.MAINTENANCE_MODE === "true";
//   const { pathname } = request.nextUrl;

//   // ถ้าเปิด maintenance mode → redirect ทุกหน้าไป /maintenance
//   if (
//     maintenance &&
//     pathname !== "/maintenance" &&
//     !pathname.startsWith("/_next") &&
//     !pathname.startsWith("/api") &&
//     !pathname.startsWith("/favicon")
//   ) {
//     return NextResponse.redirect(new URL("/maintenance", request.url));
//   }

//   // ถ้า maintenance ปิดแล้ว แต่ยังพยายามเข้า /maintenance → redirect กลับ /
//   if (!maintenance && pathname === "/maintenance") {
//     return NextResponse.redirect(new URL("/", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
// };

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ❌ กัน loop + กันระบบพัง
  const isApi = pathname.startsWith("/api");
  const isStatic = pathname.startsWith("/_next");
  const isFavicon = pathname.includes("favicon");
  if (isApi || isStatic || isFavicon) {
    return NextResponse.next();
  }

  let enabled = false;

  try {
    const res = await fetch(
      new URL("/api/maintenance", request.url),
      { cache: "no-store" }
    );

    const data = await res.json();
    enabled = data?.enabled;
  } catch (e) {
    console.error("middleware fetch error:", e);
    return NextResponse.next(); // ❗ กันเว็บพัง
  }

  // 🔴 เปิด maintenance — redirect ทุกหน้า (ยกเว้น /) มาที่ /
  if (enabled && pathname !== "/") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};