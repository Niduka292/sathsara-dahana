"use client";

export interface DailyPuzzleRecord {
  dateKey: string;
  triesUsed: number;
  shufflesUsed: number;
  attemptInProgress: boolean;
}

const LOCAL_STORAGE_KEY = "sathsara_dahana_puzzle_daily_v1";
const IDB_DB_NAME = "sathsara_dahana_puzzle_db";
const IDB_STORE_NAME = "daily_limits";
const CACHE_NAME = "sathsara-dahana-puzzle-cache-v1";
const CACHE_ENTRY_URL = "/__puzzle_daily_limit_state__";

let cachedFingerprint: string | null = null;

function fnv1aHex(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= ch ^ (i & 0xff);
    h2 = Math.imul(h2, 0x01000193);
  }
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}

async function sha256Hex(input: string): Promise<string> {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    try {
      const encoded = new TextEncoder().encode(input);
      const buffer = await window.crypto.subtle.digest("SHA-256", encoded);
      return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    } catch {
      return fnv1aHex(input);
    }
  }
  return fnv1aHex(input);
}

function getWebGLSignature(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl") as WebGLRenderingContext | null) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) return "no-webgl";

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const vendor = debugInfo
      ? String(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL))
      : String(gl.getParameter(gl.VENDOR));
    const renderer = debugInfo
      ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
      : String(gl.getParameter(gl.RENDERER));
    return `${vendor}::${renderer}`;
  } catch {
    return "webgl-err";
  }
}

function getCanvasSignature(): string {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 220;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "no-2d";

    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#520c1d";
    ctx.fillRect(10, 4, 90, 26);
    ctx.fillStyle = "#fbbf24";
    ctx.font = "15px serif";
    ctx.fillText("SathsaraDahana-10.31", 6, 22);
    ctx.strokeStyle = "#93c5fd";
    ctx.beginPath();
    ctx.arc(60, 25, 18, 0, Math.PI * 1.5);
    ctx.stroke();

    return fnv1aHex(canvas.toDataURL());
  } catch {
    return "canvas-err";
  }
}

/**
 * Generates a deterministic hardware & rendering fingerprint that stays identical
 * across normal browsing and Incognito mode on the same device/browser.
 */
export async function getDeviceFingerprint(): Promise<string> {
  if (cachedFingerprint) return cachedFingerprint;
  if (typeof window === "undefined") return "ssr";

  const nav = window.navigator as Navigator & { deviceMemory?: number };
  const scr = window.screen;

  const components = [
    getWebGLSignature(),
    getCanvasSignature(),
    `${scr?.width ?? 0}x${scr?.height ?? 0}x${scr?.colorDepth ?? 0}`,
    String(window.devicePixelRatio ?? 1),
    String(nav.hardwareConcurrency ?? 0),
    String(nav.deviceMemory ?? 0),
    String(nav.maxTouchPoints ?? 0),
    String(nav.platform ?? ""),
    String(Intl.DateTimeFormat().resolvedOptions().timeZone ?? ""),
  ];

  cachedFingerprint = await sha256Hex(components.join("|"));
  return cachedFingerprint;
}

// --- IndexedDB Helper ---
function readFromIndexedDB(dateKey: string): Promise<DailyPuzzleRecord | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const openReq = window.indexedDB.open(IDB_DB_NAME, 1);
      openReq.onupgradeneeded = () => {
        const db = openReq.result;
        if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
          db.createObjectStore(IDB_STORE_NAME, { keyPath: "dateKey" });
        }
      };
      openReq.onsuccess = () => {
        try {
          const db = openReq.result;
          const tx = db.transaction(IDB_STORE_NAME, "readonly");
          const store = tx.objectStore(IDB_STORE_NAME);
          const getReq = store.get(dateKey);
          getReq.onsuccess = () => {
            resolve((getReq.result as DailyPuzzleRecord | undefined) ?? null);
          };
          getReq.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      };
      openReq.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function writeToIndexedDB(record: DailyPuzzleRecord): void {
  if (typeof window === "undefined" || !window.indexedDB) return;
  try {
    const openReq = window.indexedDB.open(IDB_DB_NAME, 1);
    openReq.onupgradeneeded = () => {
      const db = openReq.result;
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME, { keyPath: "dateKey" });
      }
    };
    openReq.onsuccess = () => {
      try {
        const db = openReq.result;
        const tx = db.transaction(IDB_STORE_NAME, "readwrite");
        tx.objectStore(IDB_STORE_NAME).put(record);
      } catch {
        // Ignore IDB write error
      }
    };
  } catch {
    // Ignore IDB open error
  }
}

// --- Cache API Helper ---
async function readFromCacheStorage(dateKey: string): Promise<DailyPuzzleRecord | null> {
  if (typeof window === "undefined" || !("caches" in window)) return null;
  try {
    const cache = await window.caches.open(CACHE_NAME);
    const res = await cache.match(CACHE_ENTRY_URL);
    if (!res) return null;
    const data = (await res.json()) as DailyPuzzleRecord;
    return data?.dateKey === dateKey ? data : null;
  } catch {
    return null;
  }
}

async function writeToCacheStorage(record: DailyPuzzleRecord): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) return;
  try {
    const cache = await window.caches.open(CACHE_NAME);
    await cache.put(
      CACHE_ENTRY_URL,
      new Response(JSON.stringify(record), {
        headers: { "Content-Type": "application/json" },
      })
    );
  } catch {
    // Ignore CacheStorage error
  }
}

// --- Multi-Storage Client Read / Write ---
export async function readMultiClientStorage(dateKey: string): Promise<DailyPuzzleRecord> {
  const candidates: DailyPuzzleRecord[] = [];

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DailyPuzzleRecord;
      if (parsed?.dateKey === dateKey) candidates.push(parsed);
    }
  } catch {
    // Ignore localStorage error
  }

  const [idbRec, cacheRec] = await Promise.all([
    readFromIndexedDB(dateKey),
    readFromCacheStorage(dateKey),
  ]);

  if (idbRec?.dateKey === dateKey) candidates.push(idbRec);
  if (cacheRec?.dateKey === dateKey) candidates.push(cacheRec);

  const merged: DailyPuzzleRecord = {
    dateKey,
    triesUsed: candidates.reduce((max, r) => Math.max(max, r.triesUsed ?? 0), 0),
    shufflesUsed: candidates.reduce((max, r) => Math.max(max, r.shufflesUsed ?? 0), 0),
    attemptInProgress: candidates.some((r) => Boolean(r.attemptInProgress)),
  };

  return merged;
}

export function writeMultiClientStorage(record: DailyPuzzleRecord): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Ignore localStorage error
  }
  writeToIndexedDB(record);
  void writeToCacheStorage(record);
}

/**
 * Syncs the user's daily puzzle limit state with the server API
 * (which tracks by IP + Device Fingerprint + HttpOnly Cookie + Firebase).
 */
export async function syncServerDailyPuzzleState(
  record: DailyPuzzleRecord,
  recoverInterruptedAttempt = false
): Promise<DailyPuzzleRecord> {
  try {
    const fingerprint = await getDeviceFingerprint();
    const response = await fetch("/api/puzzle/daily", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        fingerprint,
        dateKey: record.dateKey,
        triesUsed: record.triesUsed,
        shufflesUsed: record.shufflesUsed,
        attemptInProgress: record.attemptInProgress,
        recoverInterruptedAttempt,
      }),
    });

    if (!response.ok) return record;
    const data = (await response.json()) as Partial<DailyPuzzleRecord>;

    const merged: DailyPuzzleRecord = {
      dateKey: record.dateKey,
      triesUsed: Math.max(record.triesUsed, data.triesUsed ?? 0),
      shufflesUsed: Math.max(record.shufflesUsed, data.shufflesUsed ?? 0),
      attemptInProgress: Boolean(data.attemptInProgress ?? record.attemptInProgress),
    };

    writeMultiClientStorage(merged);
    return merged;
  } catch {
    return record;
  }
}
