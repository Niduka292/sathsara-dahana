/** One release instant for the countdown, popup, and server-side access checks. */
export const RESULTS_RELEASE_TIME = new Date("2026-10-06T20:00:00+05:30");

export function areResultsReleased(now = Date.now()) {
  return now >= RESULTS_RELEASE_TIME.getTime();
}

export function getResultsCountdown(now = Date.now()) {
  // Round up so the final second stays visible until the release instant.
  const totalSeconds = Math.ceil(Math.max(0, RESULTS_RELEASE_TIME.getTime() - now) / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor(totalSeconds / 3600) % 24,
    minutes: Math.floor(totalSeconds / 60) % 60,
    seconds: totalSeconds % 60,
  };
}

export const RESULTS_RELEASE_LABEL = `${new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Colombo", month: "long", day: "numeric", year: "numeric",
}).format(RESULTS_RELEASE_TIME)} • ${new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Colombo", hour: "numeric", minute: "2-digit", hour12: true,
}).format(RESULTS_RELEASE_TIME)}`;
