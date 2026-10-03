import "server-only";

import type { ResultCategory, SelectionResult } from "@/src/data/dancingCrewResults";
import { dancingCrewResults } from "@/src/data/dancingCrewResults";
import { instrumentalResults } from "@/src/data/instrumentalResults";
import { singingResults } from "@/src/data/singingResults";

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

export function getCategoryResults(category: ResultCategory) {
  return resultGroups[category];
}
