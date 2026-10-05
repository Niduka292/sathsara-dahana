import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const release = Date.parse("2026-10-06T20:00:00+05:30");

// Isolated test clock/module loader: no production time override or extra dependencies.
function fixture(now, overrides = {}, globals = {}) {
  const clock = { now };
  const cache = new Map();
  class TestDate extends Date {
    static now() { return clock.now; }
  }
  function load(id, parent = path.join(root, "entry.ts")) {
    if (Object.hasOwn(overrides, id)) return overrides[id];
    if (id === "server-only" || id.endsWith(".css")) return {};
    if (!id.startsWith(".") && !id.startsWith("@/")) return require(id);
    const base = id.startsWith("@/") ? path.join(root, id.slice(2)) : path.resolve(path.dirname(parent), id);
    const filename = [base, `${base}.ts`, `${base}.tsx`].find((candidate) => existsSync(candidate));
    assert.ok(filename, `Cannot resolve ${id}`);
    if (cache.has(filename)) return cache.get(filename).exports;
    const loadedModule = { exports: {} };
    cache.set(filename, loadedModule);
    const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    });
    vm.runInNewContext(outputText, {
      exports: loadedModule.exports, module: loadedModule, require: (dependency) => load(dependency, filename),
      Date: TestDate, URL, URLSearchParams, Request, Response, console, ...globals,
    }, { filename });
    return loadedModule.exports;
  }
  return { clock, load };
}

test("Colombo release instant, label, countdown rounding, and zero clamp", () => {
  const { load } = fixture(release - 1000);
  const config = load("@/src/lib/resultsRelease");
  assert.equal(config.RESULTS_RELEASE_TIME.toISOString(), "2026-10-06T14:30:00.000Z");
  assert.equal(config.RESULTS_RELEASE_LABEL, "October 6, 2026 • 8:00 PM");
  assert.equal(config.areResultsReleased(), false);
  assert.deepEqual(Object.values(config.getResultsCountdown(release - 192858000)), [2, 5, 34, 18]);
  assert.deepEqual(Object.values(config.getResultsCountdown()), [0, 0, 0, 1]);
  assert.deepEqual(Object.values(config.getResultsCountdown(release - 1)), [0, 0, 0, 1]);
  for (const now of [release, release + 1000]) {
    assert.equal(config.areResultsReleased(now), true);
    assert.deepEqual(Object.values(config.getResultsCountdown(now)), [0, 0, 0, 0]);
  }
});

test("both APIs deny early requests, then unlock without cookies at the exact boundary", async () => {
  const { load, clock } = fixture(release - 1);
  const lookup = load("@/src/app/api/results/route").GET;
  const list = load("@/src/app/api/results/list/route").GET;
  for (const category of ["dancing", "singing", "instrumental"]) {
    for (const [handler, url] of [
      [list, `https://example.test/api/results/list?category=${category}`],
      [lookup, `https://example.test/api/results?category=${category}&identifier=S011`],
    ]) {
      const response = await handler(new Request(url, { headers: { Cookie: "results_access=anything" } }));
      assert.equal(response.status, 403);
      assert.equal(response.headers.get("Cache-Control"), "no-store");
      const body = await response.json();
      assert.equal(body.releaseTime, "2026-10-06T14:30:00.000Z");
      assert.equal("result" in body || "results" in body, false);
    }
  }

  clock.now = release;
  for (const category of ["dancing", "singing", "instrumental"]) {
    const response = await list(new Request(`https://example.test/api/results/list?category=${category}`));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    const { results } = await response.json();
    assert.ok(results.length > 0);
    for (const identifier of [results[0].indexNumber, results[0].registrationNumber]) {
      const params = new URLSearchParams({ category, identifier: ` ${identifier.toLowerCase()} ` });
      const found = await lookup(new Request(`https://example.test/api/results?${params}`));
      assert.equal(found.status, 200);
      assert.deepEqual((await found.json()).result, results[0]);
    }
  }
  assert.equal((await lookup(new Request("https://example.test/api/results?category=dancing&identifier=not-found"))).status, 404);
  assert.equal((await lookup(new Request("https://example.test/api/results?category=invalid"))).status, 400);
  assert.equal((await list(new Request("https://example.test/api/results/list?category=invalid"))).status, 400);
});

test("live hook ticks, crosses release without refresh, resumes, and cleans up", () => {
  let value;
  let initialized = false;
  let effect;
  const intervals = new Map();
  const timeouts = new Map();
  const listeners = new Map();
  const browser = {
    setInterval(fn, delay) { intervals.set(fn, delay); return fn; },
    clearInterval(id) { intervals.delete(id); },
    setTimeout(fn, delay) { timeouts.set(fn, delay); return fn; },
    clearTimeout(id) { timeouts.delete(id); },
    addEventListener(event, fn) { listeners.set(event, fn); },
    removeEventListener(event) { listeners.delete(event); },
  };
  const { load, clock } = fixture(release - 1250, {
    react: {
      useState(initial) { if (!initialized) { value = initial; initialized = true; } return [value, (next) => { value = next; }]; },
      useEffect(fn) { effect ??= fn; },
    },
  }, { window: browser, document: browser });
  const hook = load("@/hooks/useResultsRelease").useResultsRelease;
  assert.equal(hook().countdown, null);
  const cleanup = effect();
  assert.equal(hook().countdown.seconds, 2);
  assert.deepEqual([...intervals.values()], [1000]);
  assert.deepEqual([...timeouts.values()], [1250]);
  clock.now = release - 250;
  [...intervals.keys()][0]();
  assert.equal(hook().countdown.seconds, 1);
  assert.equal(hook().released, false);
  clock.now = release;
  [...timeouts.keys()][0]();
  assert.equal(hook().released, true);
  clock.now = release + 60000;
  listeners.get("visibilitychange")();
  assert.equal(hook().released, true);
  cleanup();
  assert.equal(intervals.size + timeouts.size + listeners.size, 0);
});

test("results page renders countdown before release and original search interface afterwards", () => {
  const { load } = fixture(release);
  const Gate = load("@/src/components/results/ResultsReleaseGate").default;
  const before = renderToStaticMarkup(React.createElement(Gate, { initialNow: release - 1000 }));
  assert.match(before, /Results reveal in/);
  assert.match(before, /October 6, 2026/);
  assert.doesNotMatch(before, /Select a result category|password|G\.A\. Imadhi/i);
  const after = renderToStaticMarkup(React.createElement(Gate, { initialNow: release }));
  assert.match(after, /Select a result category/);
  assert.doesNotMatch(after, /Results reveal in|password/i);
});

test("existing popup has the requested before/after copy and the same results link", () => {
  for (const released of [false, true]) {
    const { load } = fixture(release, {
      "@/hooks/useResultsRelease": { useResultsRelease: () => ({ released, countdown: { days: 0, hours: 0, minutes: 0, seconds: 1 } }) },
    });
    const Popup = load("@/src/components/results/ResultsAnnouncement").default;
    const markup = renderToStaticMarkup(React.createElement(Popup));
    assert.match(markup, released ? /The wait is over/ : /The wait is almost over/);
    assert.match(markup, released ? /are out!/ : /are coming soon!/);
    assert.match(markup, /href="\/results"/);
    assert.equal(markup.includes('role="timer"'), !released);
    assert.equal((markup.match(/<dialog/g) ?? []).length, 1);
  }
});
