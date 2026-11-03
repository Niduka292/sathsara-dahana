import { NextResponse } from "next/server";
import { createHash } from "crypto";
import fs from "fs";
import path from "path";
import {
  TIMEPORTAL_UNLOCK_COOKIE,
  getTimePortalUnlockToken,
} from "@/src/lib/timeportalAccess.server";

export const dynamic = "force-dynamic";

const LEADERBOARD_LIMIT = 10;
const WINNER_COOKIE_NAME = "sd_puzzle_first_winner";
const DASHBOARD_AUTH_COOKIE = "sd_dashboard_auth";
const DASHBOARD_PASSWORD =
  process.env.DASHBOARD_PASSWORD ||
  process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD ||
  "sathsara2026";

function attachTimePortalUnlockCookie(response: NextResponse): void {
  response.cookies.set({
    name: TIMEPORTAL_UNLOCK_COOKIE,
    value: getTimePortalUnlockToken(),
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

function isDashboardAuthorized(request: Request): boolean {
  const headerPassword = request.headers.get("x-dashboard-password")?.trim();
  if (headerPassword && headerPassword === DASHBOARD_PASSWORD) {
    return true;
  }

  const { searchParams } = new URL(request.url);
  const queryPassword = searchParams.get("password")?.trim();
  if (queryPassword && queryPassword === DASHBOARD_PASSWORD) {
    return true;
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const expectedToken = createHash("sha256")
    .update(`dashboard-auth::${DASHBOARD_PASSWORD}`)
    .digest("hex")
    .slice(0, 32);

  return cookieHeader
    .split(";")
    .map((c) => c.trim())
    .includes(`${DASHBOARD_AUTH_COOKIE}=${expectedToken}`);
}

function attachDashboardAuthCookie(response: NextResponse): void {
  const token = createHash("sha256")
    .update(`dashboard-auth::${DASHBOARD_PASSWORD}`)
    .digest("hex")
    .slice(0, 32);

  response.cookies.set({
    name: DASHBOARD_AUTH_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours
  });
}

export interface FirstWinnerRecord {
  fullName: string;
  registrationNumber: string;
  email: string;
  completedAtIso: string;
  completedAtLocal: string;
  solveTimeSeconds: number | null;
  visitorId: string;
}

export interface RankedLeaderboardRecord extends FirstWinnerRecord {
  rank: number;
}

export interface PublicLeaderboardEntry {
  rank: number;
  fullName: string;
  registrationNumber: string;
  solveTimeSeconds: number | null;
  completedAtLocal: string;
  completedAtIso: string;
}

const globalForWinner = globalThis as unknown as {
  __sdPuzzleFirstWinner?: FirstWinnerRecord | null;
  __sdPuzzleLeaderboardEntries?: FirstWinnerRecord[];
};

function isValidRecord(item: unknown): item is FirstWinnerRecord {
  if (!item || typeof item !== "object") return false;
  const r = item as Partial<FirstWinnerRecord>;
  return (
    typeof r.fullName === "string" &&
    r.fullName.trim().length > 0 &&
    typeof r.registrationNumber === "string" &&
    r.registrationNumber.trim().length > 0
  );
}

function normalizeRecord(raw: FirstWinnerRecord): FirstWinnerRecord {
  const numericTime =
    typeof raw.solveTimeSeconds === "number" &&
    Number.isFinite(raw.solveTimeSeconds) &&
    raw.solveTimeSeconds >= 0
      ? Number(raw.solveTimeSeconds.toFixed(2))
      : null;

  return {
    fullName: raw.fullName.trim(),
    registrationNumber: raw.registrationNumber.trim().toUpperCase(),
    email: (raw.email ?? "").trim().toLowerCase(),
    completedAtIso: raw.completedAtIso || new Date().toISOString(),
    completedAtLocal: raw.completedAtLocal || "",
    solveTimeSeconds: numericTime,
    visitorId: raw.visitorId || "unknown",
  };
}

/**
 * Compares two records to determine which has the faster solve time.
 * Returns < 0 if `a` is better (faster) than `b`, > 0 if `b` is better.
 */
function comparePuzzleRecords(a: FirstWinnerRecord, b: FirstWinnerRecord): number {
  const aTime =
    typeof a.solveTimeSeconds === "number" && Number.isFinite(a.solveTimeSeconds)
      ? a.solveTimeSeconds
      : Number.POSITIVE_INFINITY;
  const bTime =
    typeof b.solveTimeSeconds === "number" && Number.isFinite(b.solveTimeSeconds)
      ? b.solveTimeSeconds
      : Number.POSITIVE_INFINITY;

  if (aTime !== bTime) {
    return aTime - bTime;
  }

  const aDate = Date.parse(a.completedAtIso || "") || Number.MAX_SAFE_INTEGER;
  const bDate = Date.parse(b.completedAtIso || "") || Number.MAX_SAFE_INTEGER;
  return aDate - bDate;
}

/**
 * Deduplicates records by normalized Registration Number (keeping the fastest solve time per reg no.)
 * and sorts them ascending by solveTimeSeconds (then completedAtIso).
 */
function deduplicateAndSortLeaderboard(
  records: FirstWinnerRecord[]
): FirstWinnerRecord[] {
  const byRegNo = new Map<string, FirstWinnerRecord>();

  for (const raw of records) {
    if (!isValidRecord(raw)) continue;
    const candidate = normalizeRecord(raw);
    const key = candidate.registrationNumber;
    const existing = byRegNo.get(key);

    if (!existing) {
      byRegNo.set(key, candidate);
    } else if (comparePuzzleRecords(candidate, existing) < 0) {
      byRegNo.set(key, candidate);
    }
  }

  return Array.from(byRegNo.values()).sort(comparePuzzleRecords);
}

function toRankedRecords(sorted: FirstWinnerRecord[]): RankedLeaderboardRecord[] {
  return sorted.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));
}

function toPublicLeaderboard(
  sorted: FirstWinnerRecord[],
  limit = LEADERBOARD_LIMIT
): PublicLeaderboardEntry[] {
  return sorted.slice(0, limit).map((entry, idx) => ({
    rank: idx + 1,
    fullName: entry.fullName,
    registrationNumber: entry.registrationNumber,
    solveTimeSeconds: entry.solveTimeSeconds,
    completedAtLocal: entry.completedAtLocal,
    completedAtIso: entry.completedAtIso,
  }));
}

function parseRecordsFromUnknown(raw: unknown): FirstWinnerRecord[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter(isValidRecord).map(normalizeRecord);
  }
  if (isValidRecord(raw)) {
    return [normalizeRecord(raw)];
  }
  if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const collected: FirstWinnerRecord[] = [];
    if (Array.isArray(obj.entries)) {
      collected.push(...obj.entries.filter(isValidRecord).map(normalizeRecord));
    }
    if (Array.isArray(obj.leaderboard)) {
      collected.push(...obj.leaderboard.filter(isValidRecord).map(normalizeRecord));
    }
    if (isValidRecord(obj.winner)) {
      collected.push(normalizeRecord(obj.winner));
    }
    if (collected.length > 0) {
      return collected;
    }
    // Handle Firebase object map (e.g., { AS2023442: { ... } })
    for (const val of Object.values(obj)) {
      if (isValidRecord(val)) {
        collected.push(normalizeRecord(val));
      }
    }
    return collected;
  }
  return [];
}

// --- FILE SYSTEM PERSISTENCE (WORKS ACROSS LOCAL SERVER RESTARTS & RUNTIMES) ---
function getStorageFilePaths(): string[] {
  const paths: string[] = [];
  try {
    paths.push(path.join(process.cwd(), "src", "data", "puzzle-winner.json"));
  } catch {
    // Ignore cwd resolution
  }
  try {
    const tmpDir = process.platform === "win32" ? process.cwd() : "/tmp";
    paths.push(path.join(tmpDir, ".puzzle-winner-cache.json"));
  } catch {
    // Ignore tmp resolution
  }
  return paths;
}

function readLocalLeaderboardFiles(): FirstWinnerRecord[] {
  const all: FirstWinnerRecord[] = [];
  for (const filePath of getStorageFilePaths()) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw) as unknown;
        all.push(...parseRecordsFromUnknown(parsed));
      }
    } catch {
      // Ignore read errors
    }
  }
  return deduplicateAndSortLeaderboard(all);
}

function writeLocalLeaderboardFiles(records: FirstWinnerRecord[]): void {
  const sorted = deduplicateAndSortLeaderboard(records);
  for (const filePath of getStorageFilePaths()) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(sorted, null, 2), "utf-8");
    } catch {
      // Ignore write errors (e.g. read-only filesystem on serverless)
    }
  }
}

function deleteLocalLeaderboardFiles(): void {
  for (const filePath of getStorageFilePaths()) {
    try {
      if (fs.existsSync(filePath)) {
        try {
          fs.writeFileSync(filePath, "[]", "utf-8");
        } catch {
          // Ignore write error
        }
        try {
          if (filePath.includes(".puzzle-winner-cache.json")) {
            fs.unlinkSync(filePath);
          }
        } catch {
          // Ignore unlink errors
        }
      }
    } catch {
      // Ignore
    }
  }
}

function getClientIp(request: Request): string {
  const netlifyIp = request.headers.get("x-nf-client-connection-ip");
  if (netlifyIp) return netlifyIp.trim();

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "local-ip";
}

function computeVisitorId(request: Request, fingerprint = "unknown-fp"): string {
  const clientIp = getClientIp(request);
  return createHash("sha256")
    .update(`${clientIp}::${fingerprint}`)
    .digest("hex")
    .slice(0, 32);
}

// --- FIREBASE REALTIME DATABASE ---
async function readFirebaseLeaderboard(): Promise<FirstWinnerRecord[]> {
  const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.trim().replace(/\/+$/, "");
  if (!dbUrl) return [];

  const collected: FirstWinnerRecord[] = [];
  try {
    const [leaderboardRes, firstWinnerRes] = await Promise.allSettled([
      fetch(`${dbUrl}/puzzle/leaderboard.json`, {
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      }),
      fetch(`${dbUrl}/puzzle/firstWinner.json`, {
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      }),
    ]);

    if (leaderboardRes.status === "fulfilled" && leaderboardRes.value.ok) {
      const data = (await leaderboardRes.value.json()) as unknown;
      collected.push(...parseRecordsFromUnknown(data));
    }
    if (firstWinnerRes.status === "fulfilled" && firstWinnerRes.value.ok) {
      const data = (await firstWinnerRes.value.json()) as unknown;
      collected.push(...parseRecordsFromUnknown(data));
    }
  } catch {
    // Ignore Firebase read error
  }

  return deduplicateAndSortLeaderboard(collected);
}

async function writeFirebaseLeaderboard(records: FirstWinnerRecord[]): Promise<boolean> {
  const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.trim().replace(/\/+$/, "");
  if (!dbUrl) return true;

  const sorted = deduplicateAndSortLeaderboard(records);
  const topWinner = sorted[0] ?? null;

  try {
    const [resLeaderboard] = await Promise.allSettled([
      fetch(`${dbUrl}/puzzle/leaderboard.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sorted),
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      }),
      fetch(`${dbUrl}/puzzle/firstWinner.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(topWinner),
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      }),
    ]);
    return resLeaderboard.status === "fulfilled" && resLeaderboard.value.ok;
  } catch {
    return false;
  }
}

async function deleteFirebaseLeaderboard(): Promise<boolean> {
  const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.trim().replace(/\/+$/, "");
  if (!dbUrl) return true;

  try {
    await Promise.allSettled([
      fetch(`${dbUrl}/puzzle/leaderboard.json`, {
        method: "DELETE",
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      }),
      fetch(`${dbUrl}/puzzle/firstWinner.json`, {
        method: "DELETE",
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      }),
    ]);
    return true;
  } catch {
    return false;
  }
}

// --- GOOGLE APPS SCRIPT WEBHOOK (TWO-WAY SYNC WITH GOOGLE SHEET) ---
function getGoogleSheetWebhookUrl(): string | null {
  return (
    process.env.PUZZLE_GOOGLE_SHEET_WEBHOOK_URL ||
    process.env.NEXT_PUBLIC_PUZZLE_GOOGLE_SHEET_WEBHOOK_URL ||
    process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL ||
    process.env.GOOGLE_SCRIPT_URL ||
    "https://script.google.com/macros/s/AKfycbx_jYd2htLu6LBkHhiC5Jn9-FEnLmAGkpVfpQrhnd82Fr7bGIOaYe9pSqiIPmfHBmme/exec"
  )?.trim() || null;
}

function getWinnerVerificationToken(winner: FirstWinnerRecord | null): string {
  if (!winner || !winner.registrationNumber) return "";
  return createHash("sha256")
    .update(`${winner.registrationNumber.toUpperCase()}::sd-2026-winner-auth-token`)
    .digest("hex")
    .slice(0, 32);
}

async function queryGoogleSheetLeaderboard(): Promise<FirstWinnerRecord[]> {
  const webhookUrl = getGoogleSheetWebhookUrl();
  if (!webhookUrl) return [];

  try {
    const getUrl = webhookUrl.includes("?")
      ? `${webhookUrl}&action=get_winner`
      : `${webhookUrl}?action=get_winner`;

    const res = await fetch(getUrl, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        status?: string;
        claimed?: boolean;
        winner?: FirstWinnerRecord | null;
        leaderboard?: FirstWinnerRecord[];
        entries?: FirstWinnerRecord[];
      };

      if (data && data.status === "success") {
        return parseRecordsFromUnknown(data);
      }
    }
  } catch {
    // Ignore webhook timeout or error
  }

  return [];
}

async function resetGoogleSheetWebhook(): Promise<boolean> {
  const webhookUrl = getGoogleSheetWebhookUrl();
  if (!webhookUrl) return true;

  try {
    const resetUrl = webhookUrl.includes("?")
      ? `${webhookUrl}&action=reset`
      : `${webhookUrl}?action=reset`;

    const res = await fetch(resetUrl, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) return true;
  } catch {
    // Fallback to POST
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "reset" }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function forwardToGoogleSheetWebhook(record: FirstWinnerRecord): Promise<boolean> {
  const webhookUrl = getGoogleSheetWebhookUrl();
  if (!webhookUrl) return false;

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "submit", ...record }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// --- AUTHORITATIVE LEADERBOARD RETRIEVAL ---
async function getAuthoritativeLeaderboard(): Promise<FirstWinnerRecord[]> {
  const memoryEntries = globalForWinner.__sdPuzzleLeaderboardEntries ?? [];
  const localEntries = readLocalLeaderboardFiles();
  const firebaseEntries = await readFirebaseLeaderboard();

  // Only query Google Sheet if we have no entries yet in memory/local/firebase
  let sheetEntries: FirstWinnerRecord[] = [];
  if (
    memoryEntries.length === 0 &&
    localEntries.length === 0 &&
    firebaseEntries.length === 0
  ) {
    sheetEntries = await queryGoogleSheetLeaderboard();
  }

  const merged = deduplicateAndSortLeaderboard([
    ...memoryEntries,
    ...localEntries,
    ...firebaseEntries,
    ...sheetEntries,
  ]);

  globalForWinner.__sdPuzzleLeaderboardEntries = merged;
  globalForWinner.__sdPuzzleFirstWinner = merged[0] ?? null;

  if (merged.length !== localEntries.length) {
    writeLocalLeaderboardFiles(merged);
  }

  return merged;
}

function escapeCsvCell(value: string | number | null | undefined): string {
  const str = String(value ?? "");
  const sanitized = /^[=+\-@]/.test(str) ? `'${str}` : str;
  return `"${sanitized.replace(/"/g, '""')}"`;
}

function buildExcelCsv(entries: FirstWinnerRecord[]): string {
  const headers = [
    "Rank",
    "Full Name",
    "Registration Number",
    "Puzzle Solve Time (Seconds)",
    "Email",
    "Completed At (Sri Lanka Time)",
    "Completed At (ISO)",
  ];

  const rows: string[] = [headers.map(escapeCsvCell).join(",")];

  entries.forEach((entry, index) => {
    rows.push(
      [
        index + 1,
        entry.fullName,
        entry.registrationNumber,
        entry.solveTimeSeconds ?? "",
        entry.email,
        entry.completedAtLocal,
        entry.completedAtIso,
      ]
        .map(escapeCsvCell)
        .join(",")
    );
  });

  return `\uFEFF${rows.join("\r\n")}\r\n`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format")?.toLowerCase();
  const isAdmin = searchParams.get("admin") === "1";
  const isLogout = searchParams.get("logout") === "1";

  if (isLogout) {
    const res = NextResponse.json(
      { authenticated: false },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
    res.cookies.set({
      name: DASHBOARD_AUTH_COOKIE,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return res;
  }

  if (format === "csv" || isAdmin) {
    if (!isDashboardAuthorized(request)) {
      return NextResponse.json(
        {
          authenticated: false,
          message: "Invalid dashboard password.",
        },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }
  }

  const allSorted = await getAuthoritativeLeaderboard();
  const rankedAll = toRankedRecords(allSorted);
  const top10Ranked = rankedAll.slice(0, LEADERBOARD_LIMIT);
  const winner = allSorted[0] ?? null;

  if (format === "csv") {
    const csvContent = buildExcelCsv(allSorted);
    const res = new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="sathsara-dahana-puzzle-leaderboard.csv"',
        "Cache-Control": "no-store",
      },
    });
    attachDashboardAuthCookie(res);
    return res;
  }

  if (isAdmin) {
    const res = NextResponse.json(
      {
        authenticated: true,
        claimed: Boolean(winner),
        winner,
        leaderboard: top10Ranked,
        allEntries: rankedAll,
        totalSubmissions: rankedAll.length,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
    attachDashboardAuthCookie(res);
    return res;
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const clientHeaderToken = request.headers.get("x-winner-token")?.trim();
  const queryToken = searchParams.get("token")?.trim();

  let matchedEntry: RankedLeaderboardRecord | null = null;
  let matchedToken = "";

  for (const entry of rankedAll) {
    const token = getWinnerVerificationToken(entry);
    if (
      token &&
      (cookieHeader.includes(`${WINNER_COOKIE_NAME}=${token}`) ||
        clientHeaderToken === token ||
        queryToken === token)
    ) {
      matchedEntry = entry;
      matchedToken = token;
      break;
    }
  }

  const publicLeaderboard = toPublicLeaderboard(allSorted, LEADERBOARD_LIMIT);

  const res = NextResponse.json(
    {
      claimed: Boolean(winner),
      claimedByCurrentVisitor: Boolean(matchedEntry),
      winnerToken: matchedEntry ? matchedToken : undefined,
      myEntry: matchedEntry
        ? {
            rank: matchedEntry.rank,
            fullName: matchedEntry.fullName,
            registrationNumber: matchedEntry.registrationNumber,
            solveTimeSeconds: matchedEntry.solveTimeSeconds,
            inTop10: matchedEntry.rank <= LEADERBOARD_LIMIT,
          }
        : null,
      leaderboard: publicLeaderboard,
      totalParticipants: rankedAll.length,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );

  // Clear stale winner cookie if the cookie belongs to an older/reset competition
  if (!matchedEntry && cookieHeader.includes(WINNER_COOKIE_NAME)) {
    res.cookies.set({
      name: WINNER_COOKIE_NAME,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }

  if (searchParams.get("solved") === "1") {
    attachTimePortalUnlockCookie(res);
  }

  return res;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fullName?: string;
      registrationNumber?: string;
      email?: string;
      solveTimeSeconds?: number;
      fingerprint?: string;
    };

    const fullName = (body.fullName ?? "").trim();
    const registrationNumber = (body.registrationNumber ?? "").trim().toUpperCase();
    const email = (body.email ?? "").trim().toLowerCase();

    if (fullName.length < 2 || fullName.length > 120) {
      return NextResponse.json(
        { message: "Please enter a valid full name." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (registrationNumber.length < 3 || registrationNumber.length > 40) {
      return NextResponse.json(
        { message: "Please enter a valid registration number." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const now = new Date();
    const completedAtLocal = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Colombo",
      dateStyle: "medium",
      timeStyle: "medium",
    }).format(now);

    const solveTimeSeconds =
      typeof body.solveTimeSeconds === "number" &&
      Number.isFinite(body.solveTimeSeconds) &&
      body.solveTimeSeconds >= 0
        ? Number(body.solveTimeSeconds.toFixed(2))
        : null;

    const visitorId = computeVisitorId(request, body.fingerprint?.trim() || "unknown-fp");

    const candidateRecord: FirstWinnerRecord = {
      fullName,
      registrationNumber,
      email,
      completedAtIso: now.toISOString(),
      completedAtLocal,
      solveTimeSeconds,
      visitorId,
    };

    const currentLeaderboard = await getAuthoritativeLeaderboard();
    const existingForReg = currentLeaderboard.find(
      (r) => r.registrationNumber.toUpperCase() === registrationNumber
    );

    const improvedOrNew =
      !existingForReg || comparePuzzleRecords(candidateRecord, existingForReg) < 0;

    // Merge and keep best time per registration number
    const updatedLeaderboard = deduplicateAndSortLeaderboard([
      ...currentLeaderboard,
      candidateRecord,
    ]);

    const rankedAll = toRankedRecords(updatedLeaderboard);
    const playerEntry =
      rankedAll.find((r) => r.registrationNumber === registrationNumber) ?? null;
    const playerRank = playerEntry?.rank ?? rankedAll.length;
    const inTop10 = playerRank <= LEADERBOARD_LIMIT;

    // Persist across in-memory global, local disk file, Firebase, and Google Sheet
    globalForWinner.__sdPuzzleLeaderboardEntries = updatedLeaderboard;
    globalForWinner.__sdPuzzleFirstWinner = updatedLeaderboard[0] ?? null;
    writeLocalLeaderboardFiles(updatedLeaderboard);
    await writeFirebaseLeaderboard(updatedLeaderboard);
    if (improvedOrNew) {
      void forwardToGoogleSheetWebhook(candidateRecord);
    }

    const winnerToken = getWinnerVerificationToken(playerEntry ?? candidateRecord);
    const bestTimeText =
      playerEntry?.solveTimeSeconds != null ? `${playerEntry.solveTimeSeconds}s` : "recorded";

    let message: string;
    if (!existingForReg) {
      message = inTop10
        ? `Congratulations! You are ranked #${playerRank} on the Top 10 Leaderboard (${bestTimeText})!`
        : `Submission recorded! Your best time is ${bestTimeText} (Current Rank #${playerRank}).`;
    } else if (improvedOrNew) {
      message = `New Personal Best! You improved your time to ${bestTimeText} and are now Rank #${playerRank}!`;
    } else {
      message = `Your faster time of ${bestTimeText} is already kept on the leaderboard (Rank #${playerRank}).`;
    }

    const response = NextResponse.json(
      {
        claimed: true,
        status: !existingForReg
          ? "new_entry"
          : improvedOrNew
          ? "improved_time"
          : "kept_best_time",
        rank: playerRank,
        inTop10,
        bestTimeSeconds: playerEntry?.solveTimeSeconds ?? solveTimeSeconds,
        myEntry: playerEntry
          ? {
              rank: playerEntry.rank,
              fullName: playerEntry.fullName,
              registrationNumber: playerEntry.registrationNumber,
              solveTimeSeconds: playerEntry.solveTimeSeconds,
              inTop10,
            }
          : null,
        leaderboard: toPublicLeaderboard(updatedLeaderboard, LEADERBOARD_LIMIT),
        totalParticipants: rankedAll.length,
        redirectTo: "/timeportal",
        winnerToken,
        message,
      },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );

    response.cookies.set({
      name: WINNER_COOKIE_NAME,
      value: winnerToken,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 60,
    });
    attachTimePortalUnlockCookie(response);

    return response;
  } catch {
    return NextResponse.json(
      { message: "Unable to process submission. Please try again." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function DELETE(request: Request) {
  if (!isDashboardAuthorized(request)) {
    return NextResponse.json(
      { authenticated: false, message: "Unauthorized." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  // 1. Clear memory
  globalForWinner.__sdPuzzleFirstWinner = null;
  globalForWinner.__sdPuzzleLeaderboardEntries = [];

  // 2. Clear local file
  deleteLocalLeaderboardFiles();

  // 3. Clear Firebase & Google Sheet in parallel
  await Promise.allSettled([
    deleteFirebaseLeaderboard(),
    resetGoogleSheetWebhook(),
  ]);

  const response = NextResponse.json(
    {
      reset: true,
      claimed: false,
      winner: null,
      leaderboard: [],
      allEntries: [],
      totalSubmissions: 0,
      message: "Leaderboard records and submissions have been cleared.",
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );

  response.cookies.set({
    name: WINNER_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set({
    name: TIMEPORTAL_UNLOCK_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
