import "server-only";

import type { ResultCategory, SelectionResult } from "@/src/data/dancingCrewResults";
import { dancingCrewResults } from "@/src/data/dancingCrewResults";
import { instrumentalResults } from "@/src/data/instrumentalResults";
import { singingResults } from "@/src/data/singingResults";

const allResults: SelectionResult[] = [
  ...dancingCrewResults,
  ...singingResults,
  ...instrumentalResults,
];

const resultGroups: Record<ResultCategory, SelectionResult[]> = {
  dancing: dancingCrewResults,
  singing: singingResults,
  instrumental: instrumentalResults,
};

export const normalizeIdentifier = (value: string) => value.trim().toLocaleLowerCase();

export function isResultCategory(value: string): value is ResultCategory {
  return value === "dancing" || value === "singing" || value === "instrumental";
}

export function findSelectionResult(category: ResultCategory, identifier: string) {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  if (!normalizedIdentifier) return null;

  return resultGroups[category].find((participant) => (
    normalizeIdentifier(participant.indexNumber) === normalizedIdentifier
    || normalizeIdentifier(participant.registrationNumber) === normalizedIdentifier
  )) ?? null;
}

/**
 * Search across ALL categories by name (substring) or index number.
 * Index / registration number matching is flexible:
 *   - exact match  ("AS2023578" → "AS2023578")
 *   - suffix match ("2023578"   → "AS2023578")  ← fixes missing "AS" prefix
 * Returns every entry the student appears in (e.g. selected for both singing and dancing).
 */
export function findAllResultsForIdentifier(query: string): SelectionResult[] {
  const q = normalizeIdentifier(query);
  if (!q) return [];

  return allResults.filter((participant) => {
    const normIndex = normalizeIdentifier(participant.indexNumber);
    const normReg   = normalizeIdentifier(participant.registrationNumber);
    const nameMatch  = normalizeIdentifier(participant.name).includes(q);
    const indexMatch = normIndex === q || normIndex.endsWith(q);
    const regMatch   = normReg === q   || normReg.endsWith(q);
    return nameMatch || indexMatch || regMatch;
  });
}

export function getCategoryResults(category: ResultCategory) {
  return resultGroups[category];
}
