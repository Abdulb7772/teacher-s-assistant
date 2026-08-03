import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "token";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/outline",
  "/students/manage",
  "/quizzes",
  "/analytics",
  "/settings",
  "/users",
  "/subjects",
];

const PUBLIC_ONLY = ["/login", "/signup"];

async function hasValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const secret = process.env.JWT_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isPublicOnly = PUBLIC_ONLY.includes(pathname);

  const authed = await hasValidSession(req);

  if (isPublicOnly && authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (isProtected && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/outline/:path*",
    "/students/manage/:path*",
    "/quizzes/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/users/:path*",
    "/subjects/:path*",
    "/login",
    "/signup",
  ],
};
