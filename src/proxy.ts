import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifiserToken } from "@/lib/access/tokens";
import { VISITOR_COOKIE, cookieSecret } from "@/lib/access/constants";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(VISITOR_COOKIE)?.value;
  const payload = await verifiserToken(token, cookieSecret());

  if (payload) return NextResponse.next();

  const url = new URL("/tilgang", request.url);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!tilgang|admin|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/).*)",
  ],
};
