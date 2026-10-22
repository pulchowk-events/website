import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // 1. Refresh Supabase session (replaces createMiddlewareClient)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );
  await supabase.auth.getSession();

  // 2. NextAuth protection (replaces withAuth)
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  const protectedPaths = [
    "/dashboard",
    "/profile",
    "/admin",
    "/product-hunt/submit",
  ];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isProtectedApi =
    pathname.startsWith("/api/protected") ||
    pathname.startsWith("/api/notifications");

  if ((isProtected || isProtectedApi) && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  // 3. Your custom cache headers
  if (pathname.startsWith("/api/notifications")) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate",
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile",
    "/api/protected/:path*",
    "/admin/:path*",
    "/product-hunt/submit",
    "/api/notifications/:path*",
  ],
};
