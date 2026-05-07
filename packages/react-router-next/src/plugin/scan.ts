import { readdirSync } from "node:fs";
import { relative } from "node:path";

const PAGE_OR_LAYOUT_RE = /^(page|layout)\.(tsx|jsx|ts|js)$/;

export function toPosix(p: string): string {
  return p.split("\\").join("/");
}

export type ScanResult = {
  /** Absolute paths of directories that contain a page.* or layout.* file. */
  routeDirs: string[];
};

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
    if (!PAGE_OR_LAYOUT_RE.test(entry.name)) continue;
    // Node 20+ provides `parentPath`; older typings expose `path`.
    const dir =
      (entry as unknown as { parentPath?: string; path?: string }).parentPath ??
      (entry as unknown as { path?: string }).path ??
      appDir;
    routeDirs.add(dir);
  }
  return { routeDirs: [...routeDirs] };
}

export function routeKeyFor(appDir: string, routeDir: string): string {
  const rel = toPosix(relative(appDir, routeDir));
  return rel === "" ? "" : rel;
}

export function routeHasParams(routeKey: string): boolean {
  return routeKey.includes("[");
}

/** Match `(page|layout|loader|loading|error|404).{tsx,jsx,ts,js}`. */
export const ROUTE_FILE_RE =
  /[\\/](page|layout|loader|loading|error|404)\.(tsx|jsx|ts|js)$/;
