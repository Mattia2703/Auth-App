import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = ["/signin", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Get the access token from cookies
  const accessToken = request.cookies.get("accessToken")?.value;

  // If trying to access a protected route without a token
  if (!isPublicRoute && !accessToken) {
    const loginUrl = new URL("/signin", request.url);
    loginUrl.searchParams.set("from", pathname); // Store the intended destination
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access login/register while already authenticated
  if (isPublicRoute && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
