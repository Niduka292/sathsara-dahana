import { NextResponse } from "next/server";
import { resultsReleaseResponse } from "@/src/lib/resultsRelease.server";
import { findSelectionResult, isResultCategory } from "@/src/services/results.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const lockedResponse = resultsReleaseResponse();
  if (lockedResponse) return lockedResponse;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category")?.trim() ?? "";
  const identifier = searchParams.get("identifier")?.trim() ?? "";

  if (!isResultCategory(category) || !identifier) {
    return NextResponse.json(
      { result: null, message: "A valid category and identifier are required." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const result = findSelectionResult(category, identifier);
  return NextResponse.json(
    { result },
    { status: result ? 200 : 404, headers: { "Cache-Control": "no-store" } },
  );
}
