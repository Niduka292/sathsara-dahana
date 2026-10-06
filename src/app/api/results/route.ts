import { NextResponse } from "next/server";
import { resultsReleaseResponse } from "@/src/lib/resultsRelease.server";
import { findAllResultsForIdentifier, findSelectionResult, isResultCategory } from "@/src/services/results.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const lockedResponse = resultsReleaseResponse();
  if (lockedResponse) return lockedResponse;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category")?.trim() ?? "";
  const identifier = searchParams.get("identifier")?.trim() ?? "";

  // Cross-category search (no category supplied) ─────────────────────────────
  if (!category) {
    if (!identifier) {
      return NextResponse.json(
        { results: [], message: "An identifier (name or index number) is required." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }
    const results = findAllResultsForIdentifier(identifier);
    return NextResponse.json(
      { results },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }

  // Single-category lookup (existing behaviour) ──────────────────────────────
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
