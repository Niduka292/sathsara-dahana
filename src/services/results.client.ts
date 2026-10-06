import type { ResultCategory, SelectionResult } from "@/src/data/dancingCrewResults";

type LookupResponse = {
  result: SelectionResult | null;
  message?: string;
};

type MultiLookupResponse = {
  results: SelectionResult[];
  message?: string;
};

export async function lookupSelectionResult(
  category: ResultCategory,
  identifier: string,
  signal?: AbortSignal,
) {
  const parameters = new URLSearchParams({ category, identifier });
  const response = await fetch(`/api/results?${parameters.toString()}`, {
    method: "GET",
    cache: "no-store",
    signal,
  });
  const payload = await response.json() as LookupResponse;

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(payload.message || "Unable to check this result.");
  return payload.result;
}

/**
 * Search across all categories at once using a name or index number.
 * Returns every entry the student is found in (could be multiple categories).
 */
export async function lookupAllResults(
  query: string,
  signal?: AbortSignal,
): Promise<SelectionResult[]> {
  const parameters = new URLSearchParams({ identifier: query });
  const response = await fetch(`/api/results?${parameters.toString()}`, {
    method: "GET",
    cache: "no-store",
    signal,
  });
  const payload = await response.json() as MultiLookupResponse;
  if (!response.ok) throw new Error(payload.message || "Unable to search results.");
  return payload.results ?? [];
}

export async function loadCategoryResults(category: ResultCategory, signal?: AbortSignal) {
  const response = await fetch(`/api/results/list?category=${encodeURIComponent(category)}`, {
    method: "GET",
    cache: "no-store",
    signal,
  });
  const payload = await response.json() as { results?: SelectionResult[]; message?: string };
  if (!response.ok || !payload.results) throw new Error(payload.message || "Unable to load results.");
  return payload.results;
}

