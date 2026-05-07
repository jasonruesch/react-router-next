import { readdirSync } from "node:fs";
import { relative } from "node:path";

const ROUTE_DIR_FILE_RE = /^(page|layout|default|template)\.(tsx|jsx|ts|js)$/;

export function toPosix(p: string): string {
  return p.split("\\").join("/");
}

export type ScanResult = {
  /** Absolute paths of directories that contain a page/layout/default/template file. */
  routeDirs: string[];
};

export function isPrivateSegment(seg: string): boolean {
  return seg.startsWith("_");
}

export function isSlotSegment(seg: string): boolean {
  return seg.startsWith("@") && seg.length > 1;
}

export type InterceptDepth = 1 | 2 | 3 | "root";

export type InterceptParse = { depth: InterceptDepth; rest: string };

export function parseInterceptPrefix(seg: string): InterceptParse | null {
  // Check from most specific to least so e.g. "(...)x" doesn't get caught by "(.)".
  if (seg.startsWith("(...)")) return { depth: "root", rest: seg.slice(5) };
  if (seg.startsWith("(..)(..)")) return { depth: 3, rest: seg.slice(8) };
  if (seg.startsWith("(..)")) return { depth: 2, rest: seg.slice(4) };
  if (seg.startsWith("(.)")) return { depth: 1, rest: seg.slice(3) };
  return null;
}

export function isRouteGroupSegment(seg: string): boolean {
  return (
    seg.startsWith("(") &&
    seg.endsWith(")") &&
    parseInterceptPrefix(seg) === null
  );
}

export function scanAppDir(appDir: string): ScanResult {
  let entries;
  try {
    entries = readdirSync(appDir, { recursive: true, withFileTypes: true });
  } catch {
    return { routeDirs: [] };
  }
  const routeDirs = new Set<string>();
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!ROUTE_DIR_FILE_RE.test(entry.name)) continue;
    const dir =
      (entry as unknown as { parentPath?: string; path?: string }).parentPath ??
      (entry as unknown as { path?: string }).path ??
      appDir;
    const rel = toPosix(relative(appDir, dir));
    if (rel !== "" && rel.split("/").some(isPrivateSegment)) continue;
    routeDirs.add(dir);
  }
  return { routeDirs: [...routeDirs] };
}

function routeKeySegmentsOf(parts: readonly string[]): string[] {
  // Keep route groups in the routeKey (they're literal directory components).
  // Strip @slots and `_private` because they don't appear in any URL.
  return parts.filter((s) => !isSlotSegment(s) && !isPrivateSegment(s));
}

/**
 * Compute the route key for a sequence of filesystem segments.
 *
 * - `_private` folders and `@slot` folders are stripped (they don't appear in URLs).
 * - Route groups `(group)` are preserved literally, matching the existing
 *   `(marketing)/about` shape.
 * - An intercept-prefixed segment (`(.)x`, `(..)x`, `(..)(..)x`, `(...)x`)
 *   collapses preceding filesystem segments by `depth - 1` levels (or all the
 *   way to the root for `(...)`), then appends the stripped name.
 *
 * For an interceptor folder, the returned key is the resolved target route key
 * — e.g. `photos/(.)[id]` → `photos/[id]`, the same key as the interceptor's
 * target page. That keeps `useRouteParams<...>()` aligned with the URL the
 * user sees regardless of which file rendered.
 */
export function computeRouteKey(parts: readonly string[]): string {
  let interceptIdx = -1;
  let intercept: InterceptParse | null = null;
  for (let i = 0; i < parts.length; i++) {
    const p = parseInterceptPrefix(parts[i]);
    if (p) {
      interceptIdx = i;
      intercept = p;
      break;
    }
  }

  if (intercept === null) return routeKeySegmentsOf(parts).join("/");

  const fsPrefix = parts.slice(0, interceptIdx);
  let resolved: string[];
  if (intercept.depth === "root") {
    resolved = [];
  } else {
    const popCount = intercept.depth - 1;
    resolved = fsPrefix.slice(0, Math.max(0, fsPrefix.length - popCount));
  }
  const prefixSegs = routeKeySegmentsOf(resolved);
  const tail = parts.slice(interceptIdx + 1);
  const restSegments: string[] = [];
  if (intercept.rest) restSegments.push(intercept.rest);
  restSegments.push(...tail);
  return [...prefixSegs, ...routeKeySegmentsOf(restSegments)].join("/");
}

export function routeKeyFor(appDir: string, routeDir: string): string {
  const rel = toPosix(relative(appDir, routeDir));
  if (rel === "") return "";
  return computeRouteKey(rel.split("/"));
}

export function routeHasParams(routeKey: string): boolean {
  return routeKey.includes("[");
}

/** Match `(page|layout|loader|loading|error|default|template|not-found).{tsx,jsx,ts,js}`. */
export const ROUTE_FILE_RE =
  /[\\/](page|layout|loader|loading|error|default|template|not-found)\.(tsx|jsx|ts|js)$/;
