import "server-only";
import { createHash } from "crypto";

export const TIMEPORTAL_UNLOCK_COOKIE = "sd_timeportal_unlocked";

export function getTimePortalUnlockToken(): string {
  const secret =
    process.env.PUZZLE_COOKIE_SECRET ||
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "sathsara-dahana-chrono-cipher-2026-secret";
  return createHash("sha256")
    .update(`timeportal-unlocked::${secret}`)
    .digest("hex")
    .slice(0, 32);
}
