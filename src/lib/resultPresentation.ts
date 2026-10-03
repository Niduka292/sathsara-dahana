import type { SelectionResult } from "@/src/data/dancingCrewResults";

export type ResultVariant =
  | "DANCING_SELECTED"
  | "SINGING_SELECTED"
  | "SINGING_RESERVE"
  | "INSTRUMENTAL_SELECTED"
  | "INSTRUMENTAL_RESERVE";

export function getResultVariant(result: SelectionResult): ResultVariant {
  if (result.category === "dancing") return "DANCING_SELECTED";
  if (result.category === "singing") {
    return result.status === "reserve" ? "SINGING_RESERVE" : "SINGING_SELECTED";
  }
  return result.status === "reserve" ? "INSTRUMENTAL_RESERVE" : "INSTRUMENTAL_SELECTED";
}

export function articleForRole(role: string) {
  if (/^(first|second|lead)\b/i.test(role.trim())) return "the";
  return /^[aeiou]/i.test(role.trim()) ? "an" : "a";
}

export function getResultHighlight(result: SelectionResult) {
  if (result.status === "reserve") return "Reserve Performer";
  if (result.category === "dancing") return "Dancing Crew";
  if (result.category === "singing") return "Singing Crew";
  return result.instrument || "Orchestra";
}

export function getDownloadFilename(result: SelectionResult) {
  const descriptor = result.status === "reserve"
    ? "reserve"
    : result.category === "instrumental"
      ? result.instrument || "instrumental"
      : result.category;
  const sanitize = (value: string) => value
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `sathsara-dahana-2026-${sanitize(descriptor)}-${sanitize(result.name)}.png`;
}
