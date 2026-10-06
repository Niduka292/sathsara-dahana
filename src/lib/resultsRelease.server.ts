import "server-only";

import { NextResponse } from "next/server";
import { areResultsReleased, RESULTS_RELEASE_TIME } from "./resultsRelease";

/** Check the server clock on every request, before inspecting or returning any result. */
export function resultsReleaseResponse() {
  if (areResultsReleased()) return null;

  return NextResponse.json(
    { message: "Results have not been released yet.", releaseTime: RESULTS_RELEASE_TIME.toISOString() },
    { status: 403, headers: { "Cache-Control": "no-store" } },
  );
}
