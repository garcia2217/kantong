import { type NextRequest, NextResponse } from "next/server";

export default function proxy(request: NextRequest): NextResponse {
  if (request.cookies.has("access_token")) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: [
    "/overview/:path*",
    "/transactions/:path*",
    "/budget/:path*",
    "/debts/:path*",
    "/settings/:path*",
  ],
};
