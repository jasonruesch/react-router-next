import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  computeRouteKey,
  isPrivateSegment,
  isRouteGroupSegment,
  isSlotSegment,
  parseInterceptPrefix,
  routeHasParams,
  routeKeyFor,
  ROUTE_FILE_RE,
  scanAppDir,
  toPosix,
} from "./scan";

describe("toPosix", () => {
  it("converts backslashes to forward slashes", () => {
    expect(toPosix("a\\b\\c")).toBe("a/b/c");
  });

  it("leaves posix paths untouched", () => {
    expect(toPosix("a/b/c")).toBe("a/b/c");
  });
});

describe("isPrivateSegment", () => {
  it("returns true for segments starting with underscore", () => {
    expect(isPrivateSegment("_internal")).toBe(true);
  });

  it("returns false for normal segments", () => {
    expect(isPrivateSegment("foo")).toBe(false);
    expect(isPrivateSegment("[id]")).toBe(false);
  });
});

describe("isSlotSegment", () => {
  it("returns true for @slot segments", () => {
    expect(isSlotSegment("@modal")).toBe(true);
  });

  it("returns false for bare @", () => {
    expect(isSlotSegment("@")).toBe(false);
  });

  it("returns false for non-slot segments", () => {
    expect(isSlotSegment("foo")).toBe(false);
  });
});

describe("parseInterceptPrefix", () => {
  it("parses (.)x as depth 1", () => {
    expect(parseInterceptPrefix("(.)[id]")).toEqual({
      depth: 1,
      rest: "[id]",
    });
  });

  it("parses (..)x as depth 2", () => {
    expect(parseInterceptPrefix("(..)[id]")).toEqual({
      depth: 2,
      rest: "[id]",
    });
  });

  it("parses (..)(..) as depth 3", () => {
    expect(parseInterceptPrefix("(..)(..)[id]")).toEqual({
      depth: 3,
      rest: "[id]",
    });
  });

  it("parses (...) as root", () => {
    expect(parseInterceptPrefix("(...)login")).toEqual({
      depth: "root",
      rest: "login",
    });
  });

  it("matches the most specific prefix first — (...) is not caught by (.)", () => {
    const parsed = parseInterceptPrefix("(...)x");
    expect(parsed?.depth).toBe("root");
    expect(parsed?.rest).toBe("x");
  });

  it("matches (..)(..) before (..)", () => {
    const parsed = parseInterceptPrefix("(..)(..)x");
    expect(parsed?.depth).toBe(3);
    expect(parsed?.rest).toBe("x");
  });

  it("returns null for non-intercept segments", () => {
    expect(parseInterceptPrefix("posts")).toBeNull();
    expect(parseInterceptPrefix("(group)")).toBeNull();
    expect(parseInterceptPrefix("[id]")).toBeNull();
  });
});

describe("isRouteGroupSegment", () => {
  it("returns true for (group)", () => {
    expect(isRouteGroupSegment("(marketing)")).toBe(true);
  });

  it("returns false for intercept segments", () => {
    expect(isRouteGroupSegment("(.)[id]")).toBe(false);
    expect(isRouteGroupSegment("(..)[id]")).toBe(false);
    expect(isRouteGroupSegment("(...)login")).toBe(false);
  });

  it("returns false for plain segments", () => {
    expect(isRouteGroupSegment("posts")).toBe(false);
    expect(isRouteGroupSegment("[id]")).toBe(false);
  });
});

describe("computeRouteKey", () => {
  it("returns empty string for empty input", () => {
    expect(computeRouteKey([])).toBe("");
  });

  it("joins simple parts", () => {
    expect(computeRouteKey(["posts", "[id]"])).toBe("posts/[id]");
  });

  it("preserves route groups in the key", () => {
    expect(computeRouteKey(["(marketing)", "about"])).toBe("(marketing)/about");
  });

  it("strips private segments", () => {
    expect(computeRouteKey(["_internal", "foo"])).toBe("foo");
    expect(computeRouteKey(["a", "_helpers", "b"])).toBe("a/b");
  });

  it("strips slot segments", () => {
    expect(computeRouteKey(["dashboard", "@modal"])).toBe("dashboard");
    expect(computeRouteKey(["dashboard", "@modal", "settings"])).toBe(
      "dashboard/settings",
    );
  });

  it("resolves a (.) intercept to its sibling", () => {
    expect(computeRouteKey(["photos", "(.)[id]"])).toBe("photos/[id]");
  });

  it("resolves a (..) intercept by popping one prefix level", () => {
    expect(computeRouteKey(["feed", "photos", "(..)[id]"])).toBe("feed/[id]");
  });

  it("resolves a (..)(..) intercept by popping two prefix levels", () => {
    expect(computeRouteKey(["a", "b", "c", "(..)(..)[id]"])).toBe("a/[id]");
  });

  it("resolves a (...) intercept to the root", () => {
    expect(computeRouteKey(["a", "b", "(...)login"])).toBe("login");
  });

  it("strips slots and private segments from the resolved intercept prefix", () => {
    expect(computeRouteKey(["dashboard", "@modal", "(..)[id]"])).toBe(
      "dashboard/[id]",
    );
  });
});

describe("routeKeyFor", () => {
  it("returns the empty string when the route dir equals the app dir", () => {
    expect(routeKeyFor("/app", "/app")).toBe("");
  });

  it("computes a route key from app-relative path", () => {
    expect(routeKeyFor("/app", "/app/posts/[id]")).toBe("posts/[id]");
  });
});

describe("routeHasParams", () => {
  it("returns true for keys containing a bracket", () => {
    expect(routeHasParams("posts/[id]")).toBe(true);
    expect(routeHasParams("[...slug]")).toBe(true);
  });

  it("returns false for static keys", () => {
    expect(routeHasParams("about")).toBe(false);
    expect(routeHasParams("")).toBe(false);
  });
});

describe("scanAppDir", () => {
  let tmpRoot: string;

  beforeEach(() => {
    tmpRoot = mkdtempSync(join(tmpdir(), "rrn-scan-"));
  });

  afterEach(() => {
    rmSync(tmpRoot, { recursive: true, force: true });
  });

  it("returns an empty result when the app directory does not exist", () => {
    expect(scanAppDir(join(tmpRoot, "missing"))).toEqual({ routeDirs: [] });
  });

  it("discovers directories containing route files and skips private subtrees", () => {
    mkdirSync(join(tmpRoot, "posts"), { recursive: true });
    writeFileSync(join(tmpRoot, "posts", "page.tsx"), "export default null");
    mkdirSync(join(tmpRoot, "_internal"), { recursive: true });
    writeFileSync(
      join(tmpRoot, "_internal", "page.tsx"),
      "export default null",
    );

    const { routeDirs } = scanAppDir(tmpRoot);
    expect(routeDirs).toEqual([join(tmpRoot, "posts")]);
  });
});

describe("ROUTE_FILE_RE", () => {
  it("matches the file kinds in the convention", () => {
    expect(ROUTE_FILE_RE.test("/src/app/posts/not-found.tsx")).toBe(true);
    expect(ROUTE_FILE_RE.test("/src/app/page.tsx")).toBe(true);
  });
});
