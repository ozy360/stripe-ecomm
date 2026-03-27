// src/middleware.ts

import { NextResponse, NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // if (pathname === "/errorpage") {
  //   return NextResponse.next();
  // }

  // return NextResponse.redirect(new URL("/errorpage", req.url));

  const admintoken = req.cookies.get("adminsessionId")?.value;
  const usertoken = req.cookies.get("usersessionId")?.value;

  if (pathname === "/errorpage") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (pathname.startsWith("/dashboard") && !usertoken) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (pathname.startsWith("/admin") && !admintoken) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
}

export const config = {
  // matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
  matcher: ["/errorpage", "/dashboard/:path*", "/admin"],
};
