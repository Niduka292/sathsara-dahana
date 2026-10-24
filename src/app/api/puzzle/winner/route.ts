import { NextResponse } from "next/server";
import { createHash } from "crypto";

export const dynamic = "force-dynamic";

const WINNER_COOKIE_NAME = "sd_puzzle_first_winner";

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

async function forwardToGoogleSheetWebhook(record: FirstWinnerRecord): Promise<void> {
  const webhookUrl = process.env.PUZZLE_GOOGLE_SHEET_WEBHOOK_URL?.trim();
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    // Ignore webhook network errors so primary submission still succeeds
  }
}

async function getAuthoritativeFirstWinner(): Promise<FirstWinnerRecord | null> {
  const fbWinner = await readFirebaseFirstWinner();
  if (fbWinner) {
    globalForWinner.__sdPuzzleFirstWinner = fbWinner;
    return fbWinner;
  }
  return globalForWinner.__sdPuzzleFirstWinner ?? null;
}

function escapeCsvCell(value: string | number | null | undefined): string {
  const str = String(value ?? "");
  // Prevent CSV formula injection and properly quote fields
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

  // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel opens UTF-8 columns directly
  return `\uFEFF${rows.join("\r\n")}\r\n`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format")?.toLowerCase();
  const isAdmin = searchParams.get("admin") === "1";
  const fingerprint = searchParams.get("fp")?.trim() || "unknown-fp";

  const winner = await getAuthoritativeFirstWinner();

  if (format === "csv") {
    const csvContent = buildExcelCsv(winner);
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="sathsara-dahana-first-puzzle-winner.csv"',
        "Cache-Control": "no-store",
      },
    });
  }

  if (isAdmin) {
    return NextResponse.json(
      {
        claimed: Boolean(winner),
        winner,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const hasWinnerCookie = cookieHeader.includes(`${WINNER_COOKIE_NAME}=1`);
  const visitorId = computeVisitorId(request, fingerprint);
  const claimedByCurrentVisitor =
    Boolean(winner) && (hasWinnerCookie || winner?.visitorId === visitorId);

  return NextResponse.json(
    {
      claimed: Boolean(winner),
      claimedByCurrentVisitor,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: Request) {
  try {
    const existing = await getAuthoritativeFirstWinner();
    if (existing) {
      return NextResponse.json(
        {
          claimed: true,
          status: "already_claimed",
          message:
            "Someone else has already claimed the #1 First Finisher spot!",
        },
        { status: 409, headers: { "Cache-Control": "no-store" } }
      );
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

    // Double-check Firebase right before writing
    const raceCheck = await readFirebaseFirstWinner();
    if (raceCheck) {
      globalForWinner.__sdPuzzleFirstWinner = raceCheck;
      return NextResponse.json(
        {
          claimed: true,
          status: "already_claimed",
          message:
            "Someone else just claimed the #1 First Finisher spot moments ago!",
        },
        { status: 409, headers: { "Cache-Control": "no-store" } }
      );
    }

    globalForWinner.__sdPuzzleFirstWinner = record;
    await writeFirebaseFirstWinner(record);
    void forwardToGoogleSheetWebhook(record);

    const response = NextResponse.json(
      {
        claimed: true,
        status: "claimed_by_you",
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

    return response;
  } catch {
    return NextResponse.json(
      { message: "Unable to process submission. Please try again." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }
}
