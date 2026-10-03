import { NextResponse, type NextRequest } from "next/server";
import { RESULTS_ACCESS_COOKIE, getResultsAccessToken } from "@/src/lib/resultsAccess";

const UNLOCK_PAGE = "/results/unlock";
const UNLOCK_API = "/api/results/unlock";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === UNLOCK_PAGE || pathname === UNLOCK_API) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(RESULTS_ACCESS_COOKIE)?.value;
  if (cookie && cookie === (await getResultsAccessToken())) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { message: "Enter the results password to continue." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  // Show the password screen while keeping /results in the address bar
  return NextResponse.rewrite(new URL(UNLOCK_PAGE, request.url));
}

export const config = {
  matcher: ["/results", "/results/:path*", "/api/results", "/api/results/:path*"],
};
