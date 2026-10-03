// Server-only: never import this from a client component, or the password ships to the browser.

/** Password for the Results page. Set RESULTS_PASSWORD in the environment to override it. */
export const RESULTS_PASSWORD = process.env.RESULTS_PASSWORD || "2026@123";

export const RESULTS_ACCESS_COOKIE = "results_access";

/** How long one unlock lasts (12 hours). */
export const RESULTS_ACCESS_MAX_AGE = 60 * 60 * 12;

/**
 * Value stored in the access cookie: a SHA-256 hash of the password, so the password itself is
 * never stored in the browser, and changing the password signs everyone out.
 * Uses Web Crypto so it runs in both the middleware (edge) and route handlers (node).
 */
export async function getResultsAccessToken(): Promise<string> {
  const data = new TextEncoder().encode(`sathsara-dahana-results:${RESULTS_PASSWORD}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
