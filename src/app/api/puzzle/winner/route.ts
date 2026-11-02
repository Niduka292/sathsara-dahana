import { NextResponse } from "next/server";
import { createHash } from "crypto";
import fs from "fs";
import path from "path";
import {
  TIMEPORTAL_UNLOCK_COOKIE,
  getTimePortalUnlockToken,
} from "@/src/lib/timeportalAccess.server";

export const dynamic = "force-dynamic";

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

const globalForWinner = globalThis as unknown as {
  __sdPuzzleFirstWinner?: FirstWinnerRecord | null;
};

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

function readLocalWinnerFile(): FirstWinnerRecord | null {
  for (const filePath of getStorageFilePaths()) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw) as FirstWinnerRecord;
        if (parsed && parsed.fullName && parsed.registrationNumber) {
          return parsed;
        }
      }
    } catch {
      // Ignore read errors
    }
  }
  return null;
}

function writeLocalWinnerFile(record: FirstWinnerRecord): void {
  for (const filePath of getStorageFilePaths()) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(record, null, 2), "utf-8");
    } catch {
      // Ignore write errors (e.g. read-only filesystem on serverless)
    }
  }
}

function deleteLocalWinnerFile(): void {
  for (const filePath of getStorageFilePaths()) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // Ignore unlink errors
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
async function readFirebaseFirstWinner(): Promise<FirstWinnerRecord | null> {
  const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.trim().replace(/\/+$/, "");
  if (!dbUrl) return null;

  try {
    const res = await fetch(`${dbUrl}/puzzle/firstWinner.json`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as FirstWinnerRecord | null;
    if (!data || !data.fullName || !data.registrationNumber) return null;
    return data;
  } catch {
    return null;
  }
}

async function writeFirebaseFirstWinner(record: FirstWinnerRecord): Promise<boolean> {
  const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.trim().replace(/\/+$/, "");
  if (!dbUrl) return true;

  try {
    const res = await fetch(`${dbUrl}/puzzle/firstWinner.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function deleteFirebaseFirstWinner(): Promise<boolean> {
  const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.trim().replace(/\/+$/, "");
  if (!dbUrl) return true;

  try {
    const res = await fetch(`${dbUrl}/puzzle/firstWinner.json`, {
      method: "DELETE",
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
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
    process.env.GOOGLE_SCRIPT_URL
  )?.trim() || null;
}

async function queryGoogleSheetWinner(): Promise<{ claimed: boolean; winner: FirstWinnerRecord | null } | null> {
  const webhookUrl = getGoogleSheetWebhookUrl();
  if (!webhookUrl) return null;

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "get_winner" }),
      signal: AbortSignal.timeout(4500),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as {
      status?: string;
      claimed?: boolean;
      winner?: FirstWinnerRecord | null;
    };

    if (data && data.status === "success") {
      if (data.claimed && data.winner && data.winner.fullName) {
        return { claimed: true, winner: data.winner };
      }
      if (data.claimed === false) {
        return { claimed: false, winner: null };
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function resetGoogleSheetWebhook(): Promise<boolean> {
  const webhookUrl = getGoogleSheetWebhookUrl();
  if (!webhookUrl) return true;

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "reset" }),
      signal: AbortSignal.timeout(6000),
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
      signal: AbortSignal.timeout(10000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// --- AUTHORITATIVE WINNER RETRIEVAL (CHECKS MEMORY, LOCAL FILE, FIREBASE, GOOGLE SHEET) ---
async function getAuthoritativeFirstWinner(): Promise<FirstWinnerRecord | null> {
  // 1. In-memory
  if (globalForWinner.__sdPuzzleFirstWinner) {
    return globalForWinner.__sdPuzzleFirstWinner;
  }

  // 2. Local disk file
  const localWinner = readLocalWinnerFile();
  if (localWinner) {
    globalForWinner.__sdPuzzleFirstWinner = localWinner;
    return localWinner;
  }

  // 3. Firebase
  const fbWinner = await readFirebaseFirstWinner();
  if (fbWinner) {
    globalForWinner.__sdPuzzleFirstWinner = fbWinner;
    writeLocalWinnerFile(fbWinner);
    return fbWinner;
  }

  // 4. Google Sheet Webhook
  const sheetResult = await queryGoogleSheetWinner();
  if (sheetResult && sheetResult.claimed && sheetResult.winner) {
    globalForWinner.__sdPuzzleFirstWinner = sheetResult.winner;
    writeLocalWinnerFile(sheetResult.winner);
    void writeFirebaseFirstWinner(sheetResult.winner);
    return sheetResult.winner;
  }

  return null;
}

function escapeCsvCell(value: string | number | null | undefined): string {
  const str = String(value ?? "");
  const sanitized = /^[=+\-@]/.test(str) ? `'${str}` : str;
  return `"${sanitized.replace(/"/g, '""')}"`;
}

function buildExcelCsv(winner: FirstWinnerRecord | null): string {
  const headers = [
    "Rank",
    "Full Name",
    "Registration Number",
    "Email",
    "Completed At (Sri Lanka Time)",
    "Completed At (ISO)",
    "Puzzle Solve Time (Seconds)",
  ];

  const rows: string[] = [headers.map(escapeCsvCell).join(",")];

  if (winner) {
    rows.push(
      [
        1,
        winner.fullName,
        winner.registrationNumber,
        winner.email,
        winner.completedAtLocal,
        winner.completedAtIso,
        winner.solveTimeSeconds ?? "",
      ]
        .map(escapeCsvCell)
        .join(",")
    );
  }

  return `\uFEFF${rows.join("\r\n")}\r\n`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format")?.toLowerCase();
  const isAdmin = searchParams.get("admin") === "1";
  const isLogout = searchParams.get("logout") === "1";
  const fingerprint = searchParams.get("fp")?.trim() || "unknown-fp";

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

  const winner = await getAuthoritativeFirstWinner();

  if (format === "csv") {
    const csvContent = buildExcelCsv(winner);
    const res = new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="sathsara-dahana-first-puzzle-winner.csv"',
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
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
    attachDashboardAuthCookie(res);
    return res;
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const hasWinnerCookie = cookieHeader.includes(`${WINNER_COOKIE_NAME}=1`);
  const visitorId = computeVisitorId(request, fingerprint);
  const claimedByCurrentVisitor =
    Boolean(winner) && (hasWinnerCookie || winner?.visitorId === visitorId);

  const res = NextResponse.json(
    {
      claimed: Boolean(winner),
      claimedByCurrentVisitor,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );

  if (searchParams.get("solved") === "1") {
    attachTimePortalUnlockCookie(res);
  }

  return res;
}

export async function POST(request: Request) {
  try {
    const existing = await getAuthoritativeFirstWinner();
    if (existing) {
      const alreadyRes = NextResponse.json(
        {
          claimed: true,
          status: "already_claimed",
          redirectTo: "/timeportal",
          message:
            "Someone else has already claimed the #1 First Finisher spot! The Time Portal is unlocked for you.",
        },
        { status: 409, headers: { "Cache-Control": "no-store" } }
      );
      attachTimePortalUnlockCookie(alreadyRes);
      return alreadyRes;
    }

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

    const record: FirstWinnerRecord = {
      fullName,
      registrationNumber,
      email,
      completedAtIso: now.toISOString(),
      completedAtLocal,
      solveTimeSeconds,
      visitorId,
    };

    // Double-check race condition
    const raceCheck = await getAuthoritativeFirstWinner();
    if (raceCheck) {
      const alreadyRes = NextResponse.json(
        {
          claimed: true,
          status: "already_claimed",
          redirectTo: "/timeportal",
          message:
            "Someone else just claimed the #1 First Finisher spot moments ago! The Time Portal is unlocked for you.",
        },
        { status: 409, headers: { "Cache-Control": "no-store" } }
      );
      attachTimePortalUnlockCookie(alreadyRes);
      return alreadyRes;
    }

    // Persist across in-memory global, local disk file, Firebase, and Google Sheet
    globalForWinner.__sdPuzzleFirstWinner = record;
    writeLocalWinnerFile(record);
    await writeFirebaseFirstWinner(record);
    await forwardToGoogleSheetWebhook(record);

    const response = NextResponse.json(
      {
        claimed: true,
        status: "claimed_by_you",
        redirectTo: "/timeportal",
        message: "Congratulations! Your details have been recorded as the #1 First Finisher.",
      },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );

    response.cookies.set({
      name: WINNER_COOKIE_NAME,
      value: "1",
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

  // 2. Clear local file
  deleteLocalWinnerFile();

  // 3. Clear Firebase & Google Sheet in parallel
  await Promise.allSettled([
    deleteFirebaseFirstWinner(),
    resetGoogleSheetWebhook(),
  ]);

  const response = NextResponse.json(
    {
      reset: true,
      claimed: false,
      winner: null,
      totalSubmissions: 0,
      message: "First finisher record and submissions have been cleared.",
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
