import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generateRouteTypes } from "./typegen";

function writePage(dir: string): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "page.tsx"), "export default function Page() {}");
}

describe("generateRouteTypes", () => {
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "rrn-typegen-"));
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it("returns an empty route list and writes a shim when appDir is missing", () => {
    const result = generateRouteTypes({
      root,
      appDir: "src/app",
      outDir: "out",
    });
    expect(result.routeKeys).toEqual([]);
    expect(result.written).toBe(true);
    const shim = readFileSync(result.shimPath, "utf8");
    expect(shim).toContain(
      'declare module "virtual:react-router-next/app-tree"',
    );
  });

  it("discovers a root page and emits its route key", () => {
    writePage(join(root, "src/app"));
    const result = generateRouteTypes({
      root,
      appDir: "src/app",
      outDir: "out",
    });
    expect(result.routeKeys).toEqual([""]);
    const shim = readFileSync(result.shimPath, "utf8");
    expect(shim).toContain('declare module "virtual:react-router-next/_root"');
  });

  it("returns nested route keys sorted alphabetically", () => {
    writePage(join(root, "src/app/posts/[id]"));
    writePage(join(root, "src/app/about"));
    writePage(join(root, "src/app"));

    const result = generateRouteTypes({
      root,
      appDir: "src/app",
      outDir: "out",
    });
    expect(result.routeKeys).toEqual(["", "about", "posts/[id]"]);
  });

  it("excludes private dirs and folds slot dirs under the parent key", () => {
    writePage(join(root, "src/app/_internal"));
    writePage(join(root, "src/app/dashboard"));
    writePage(join(root, "src/app/dashboard/@modal"));

    const result = generateRouteTypes({
      root,
      appDir: "src/app",
      outDir: "out",
    });
    expect(result.routeKeys).toEqual(["dashboard"]);
  });

  it("is idempotent — a second call with no change reports written: false", () => {
    writePage(join(root, "src/app/posts/[id]"));
    const first = generateRouteTypes({
      root,
      appDir: "src/app",
      outDir: "out",
    });
    expect(first.written).toBe(true);

    const second = generateRouteTypes({
      root,
      appDir: "src/app",
      outDir: "out",
    });
    expect(second.written).toBe(false);
  });

  it("resolves an absolute outDir against the filesystem, not the root", () => {
    writePage(join(root, "src/app"));
    const absoluteOut = join(root, "absolute-out");
    const result = generateRouteTypes({
      root,
      appDir: "src/app",
      outDir: absoluteOut,
    });
    expect(result.outDir).toBe(absoluteOut);
    expect(result.shimPath).toBe(join(absoluteOut, "routes.d.ts"));
    expect(readFileSync(result.shimPath, "utf8")).toContain(
      "virtual:react-router-next/_root",
    );
  });
});
