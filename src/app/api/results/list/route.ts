import { NextResponse } from "next/server";
import { getCategoryResults, isResultCategory } from "@/src/services/results.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const category = new URL(request.url).searchParams.get("category")?.trim() ?? "";
  if (!isResultCategory(category)) {
    return NextResponse.json(
      { results: [], message: "A valid category is required." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { results: getCategoryResults(category) },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}

