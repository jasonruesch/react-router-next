import { describe, expect, it } from "vitest";
import { parseRouteParams } from "./use-route-params";

describe("parseRouteParams", () => {
  it("extracts a required [id] param", () => {
    expect(parseRouteParams("posts/[id]", { id: "1" })).toEqual({ id: "1" });
  });

  it("extracts an optional [[id]] when present", () => {
    expect(parseRouteParams("posts/[[id]]", { id: "42" })).toEqual({
      id: "42",
    });
  });

  it("returns undefined for an absent optional [[id]]", () => {
    expect(parseRouteParams("posts/[[id]]", {})).toEqual({ id: undefined });
  });

  it("parses a [...slug] rest param from the splat", () => {
    expect(parseRouteParams("docs/[...slug]", { "*": "a/b/c" })).toEqual({
      slug: ["a", "b", "c"],
    });
  });

  it("returns an empty array for [...slug] when the splat is missing", () => {
    expect(parseRouteParams("docs/[...slug]", {})).toEqual({ slug: [] });
  });

  it("returns an array for [[...slug]] when the splat is present", () => {
    expect(parseRouteParams("docs/[[...slug]]", { "*": "x/y" })).toEqual({
      slug: ["x", "y"],
    });
  });

  it("returns undefined for [[...slug]] when the splat is missing", () => {
    expect(parseRouteParams("docs/[[...slug]]", {})).toEqual({
      slug: undefined,
    });
  });

  it("filters empty path segments from rest params", () => {
    expect(parseRouteParams("docs/[...slug]", { "*": "a//b/" })).toEqual({
      slug: ["a", "b"],
    });
  });

  it("skips @slot and (group) segments", () => {
    expect(
      parseRouteParams("(shop)/@modal/products/[id]", { id: "5" }),
    ).toEqual({ id: "5" });
  });

  it("extracts multiple params from a nested route", () => {
    expect(
      parseRouteParams("users/[userId]/posts/[postId]", {
        userId: "u1",
        postId: "p2",
      }),
    ).toEqual({ userId: "u1", postId: "p2" });
  });
});
