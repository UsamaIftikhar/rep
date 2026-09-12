import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "rep1_secret_jwt_key_super_secure_production_change_me_32char"
);

const PROTECTED_PLATFORM_ROUTES = ["/dashboard", "/academy", "/settings", "/interview", "/recruiting"];
const ADMIN_ROUTES = ["/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("rep1_session")?.value;

  let session: { sub?: string; role?: string } | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      session = {
        sub: payload.sub as string,
        role: payload.role as string,
      };
    } catch {
      session = null;
    }
  }

  const isPlatformRoute = PROTECTED_PLATFORM_ROUTES.some((route) => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  if (isAdminRoute) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (isPlatformRoute && !session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/academy/:path*",
    "/settings/:path*",
    "/interview/:path*",
    "/recruiting/:path*",
    "/admin/:path*",
  ],
};
