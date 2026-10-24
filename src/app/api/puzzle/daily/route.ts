import { NextResponse } from "next/server";
import { createHash, createHmac } from "crypto";

export const dynamic = "force-dynamic";

const MAX_DAILY_TRIES = 3;
const MAX_MANUAL_SHUFFLES = 2;
const COOKIE_NAME = "sd_puzzle_daily";
const COOKIE_SECRET =
  process.env.PUZZLE_COOKIE_SECRET ||
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
  "sathsara-dahana-chrono-cipher-2026-secret";

interface ServerDailyRecord {
  dateKey: string;
  triesUsed: number;
  shufflesUsed: number;
  attemptInProgress: boolean;
  updatedAt: number;
}

const globalForPuzzle = globalThis as unknown as {
  __sdPuzzleDailyStore?: Map<string, ServerDailyRecord>;
};

function getMemoryStore(): Map<string, ServerDailyRecord> {
  if (!globalForPuzzle.__sdPuzzleDailyStore) {
    globalForPuzzle.__sdPuzzleDailyStore = new Map<string, ServerDailyRecord>();
  }
  return globalForPuzzle.__sdPuzzleDailyStore;
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

function signCookiePayload(payloadJson: string): string {
  const b64 = Buffer.from(payloadJson, "utf8").toString("base64url");
  const sig = createHmac("sha256", COOKIE_SECRET).update(b64).digest("base64url");
  return `${b64}.${sig}`;
}

function verifyCookiePayload(token: string): ServerDailyRecord | null {
  try {
    const [b64, sig] = token.split(".");
    if (!b64 || !sig) return null;
    const expectedSig = createHmac("sha256", COOKIE_SECRET).update(b64).digest("base64url");
    if (sig !== expectedSig) return null;
    const json = Buffer.from(b64, "base64url").toString("utf8");
    return JSON.parse(json) as ServerDailyRecord;
  } catch {
    return null;
  }
}

function readSignedCookie(request: Request, dateKey: string): ServerDailyRecord | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;

  const token = decodeURIComponent(match.slice(COOKIE_NAME.length + 1));
  const record = verifyCookiePayload(token);
  if (!record || record.dateKey !== dateKey) return null;
  return record;
}

async function readFirebaseRecord(
  dateKey: string,
  visitorId: string
): Promise<ServerDailyRecord | null> {
  const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.trim().replace(/\/+$/, "");
  if (!dbUrl) return null;

  try {
    const res = await fetch(
      `${dbUrl}/puzzle/daily/${encodeURIComponent(dateKey)}/${encodeURIComponent(visitorId)}.json`,
      { cache: "no-store", signal: AbortSignal.timeout(2500) }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as ServerDailyRecord | null;
    if (!data || data.dateKey !== dateKey) return null;
    return data;
  } catch {
    return null;
  }
}

async function writeFirebaseRecord(
  dateKey: string,
  visitorId: string,
  record: ServerDailyRecord
): Promise<void> {
  const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.trim().replace(/\/+$/, "");
  if (!dbUrl) return;

  try {
    await fetch(
      `${dbUrl}/puzzle/daily/${encodeURIComponent(dateKey)}/${encodeURIComponent(visitorId)}.json`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
        cache: "no-store",
        signal: AbortSignal.timeout(2500),
      }
    );
  } catch {
    // Ignore Firebase network/rules error; fallback stores remain active
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fingerprint?: string;
      dateKey?: string;
      triesUsed?: number;
      shufflesUsed?: number;
      attemptInProgress?: boolean;
      recoverInterruptedAttempt?: boolean;
    };

    const dateKey =
      typeof body.dateKey === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.dateKey)
        ? body.dateKey
        : new Date().toISOString().slice(0, 10);

    const fingerprint =
      typeof body.fingerprint === "string" && body.fingerprint.trim().length > 0
        ? body.fingerprint.trim().slice(0, 128)
        : "unknown-fp";

    const clientIp = getClientIp(request);
    const visitorId = createHash("sha256")
      .update(`${clientIp}::${fingerprint}::${dateKey}`)
      .digest("hex")
      .slice(0, 40);

    const memoryKey = `${dateKey}::${visitorId}`;
    const memoryStore = getMemoryStore();

    const [cookieRecord, firebaseRecord] = await Promise.all([
      Promise.resolve(readSignedCookie(request, dateKey)),
      readFirebaseRecord(dateKey, visitorId),
    ]);
    const memoryRecord = memoryStore.get(memoryKey) ?? null;

    const existingRecords = [cookieRecord, firebaseRecord, memoryRecord].filter(
      (r): r is ServerDailyRecord => Boolean(r && r.dateKey === dateKey)
    );

    const serverMaxTries = existingRecords.reduce(
      (max, r) => Math.max(max, r.triesUsed ?? 0),
      0
    );
    const serverMaxShuffles = existingRecords.reduce(
      (max, r) => Math.max(max, r.shufflesUsed ?? 0),
      0
    );
    const wasAttemptInProgress = existingRecords.some((r) => Boolean(r.attemptInProgress));

    const clientTries = Math.max(0, Math.min(MAX_DAILY_TRIES, Number(body.triesUsed ?? 0)));
    const clientShuffles = Math.max(
      0,
      Math.min(MAX_MANUAL_SHUFFLES, Number(body.shufflesUsed ?? 0))
    );

    let mergedTries = Math.max(serverMaxTries, clientTries);
    const mergedShuffles = Math.max(serverMaxShuffles, clientShuffles);

    // If the user refreshed or reopened in Incognito while an attempt was running on the server
    if (body.recoverInterruptedAttempt && wasAttemptInProgress && mergedTries <= serverMaxTries) {
      mergedTries = Math.min(MAX_DAILY_TRIES, serverMaxTries + 1);
    }

    const nextAttemptInProgress = body.recoverInterruptedAttempt
      ? false
      : Boolean(body.attemptInProgress);

    const updatedRecord: ServerDailyRecord = {
      dateKey,
      triesUsed: Math.min(MAX_DAILY_TRIES, mergedTries),
      shufflesUsed: Math.min(MAX_MANUAL_SHUFFLES, mergedShuffles),
      attemptInProgress: nextAttemptInProgress,
      updatedAt: Date.now(),
    };

    memoryStore.set(memoryKey, updatedRecord);
    await writeFirebaseRecord(dateKey, visitorId, updatedRecord);

    const signedCookieValue = signCookiePayload(JSON.stringify(updatedRecord));
    const response = NextResponse.json(
      {
        dateKey: updatedRecord.dateKey,
        triesUsed: updatedRecord.triesUsed,
        shufflesUsed: updatedRecord.shufflesUsed,
        attemptInProgress: updatedRecord.attemptInProgress,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );

    response.cookies.set({
      name: COOKIE_NAME,
      value: signedCookieValue,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "Invalid request" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }
}
