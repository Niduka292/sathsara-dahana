import type { ResultCategory, SelectionResult, SelectionStatus } from "@/src/data/dancingCrewResults";

export type RawResultRow = Record<string, string | undefined>;

const headerAliases = {
  name: ["name", "full name", "name with initials"],
  indexNumber: ["index number", "index no", "index"],
  registrationNumber: ["registration number", "registration no", "reg no", "reg number"],
  instrument: ["instrument", "instrument category", "role"],
  status: ["status", "selection status"],
} as const;

const normalizeHeader = (value: string) => value
  .trim()
  .toLocaleLowerCase()
  .replace(/[().]/g, "")
  .replace(/\s+/g, " ");

const clean = (value: string | undefined) => value?.trim().replace(/\s+/g, " ") ?? "";

function readField(row: RawResultRow, aliases: readonly string[]) {
  const normalizedAliases = aliases.map(normalizeHeader);
  const entry = Object.entries(row).find(([header]) => normalizedAliases.includes(normalizeHeader(header)));
  return clean(entry?.[1]);
}

function requireField(value: string, fieldName: string) {
  if (!value) throw new Error(`Missing required result field: ${fieldName}`);
  return value;
}

function normalizeBase(
  row: RawResultRow,
  category: ResultCategory,
  fallbackStatus: SelectionStatus,
): SelectionResult {
  const rawStatus = readField(row, headerAliases.status).toLocaleLowerCase();
  const status = rawStatus.includes("reserve") ? "reserve" : fallbackStatus;

  return {
    category,
    status,
    name: requireField(readField(row, headerAliases.name), "name"),
    indexNumber: requireField(readField(row, headerAliases.indexNumber), "index number"),
    registrationNumber: requireField(readField(row, headerAliases.registrationNumber), "registration number"),
  };
}

export function normalizeSingingResult(
  row: RawResultRow,
  status: SelectionStatus,
): SelectionResult {
  return normalizeBase(row, "singing", status);
}

export function normalizeInstrumentalResult(
  row: RawResultRow,
  status: SelectionStatus = "selected",
): SelectionResult {
  const result = normalizeBase(row, "instrumental", status);
  return {
    ...result,
    instrument: requireField(readField(row, headerAliases.instrument), "instrument"),
  };
}

