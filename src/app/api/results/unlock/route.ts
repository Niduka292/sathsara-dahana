import { NextResponse } from "next/server";
import {
  RESULTS_ACCESS_COOKIE,
  RESULTS_ACCESS_MAX_AGE,
  RESULTS_PASSWORD,
  getResultsAccessToken,
} from "@/src/lib/resultsAccess";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";

  if (password !== RESULTS_PASSWORD) {
    return NextResponse.json(
      { ok: false, message: "Incorrect password. Please try again." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(RESULTS_ACCESS_COOKIE, await getResultsAccessToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: RESULTS_ACCESS_MAX_AGE,
  });
  return response;
}
