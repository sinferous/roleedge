import { NextResponse, type NextRequest } from "next/server";

// Optimistic check only: send signed-out visitors to the login page with a real redirect.
// The signature and allowlist are verified on every admin request by requireAdmin().
export function proxy(request: NextRequest) {
  if (!request.cookies.has("re_admin")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/leads/:path*", "/admin/bookings/:path*"],
};
