import { describe, expect, it } from "vitest";
import { generateUrl } from "./generate-url";

describe("generateUrl", () => {
  it("renders a static route", () => {
    expect(generateUrl("about", {})).toBe("/about");
  });

  it("renders the root for an empty route", () => {
    expect(generateUrl("", {})).toBe("/");
  });

  it("substitutes a required [id] param", () => {
    expect(generateUrl("posts/[id]", { id: "1" })).toBe("/posts/1");
  });

  it("expands a [...slug] rest param", () => {
    expect(generateUrl("docs/[...slug]", { slug: ["a", "b", "c"] })).toBe(
      "/docs/a/b/c",
    );
  });

  it("expands an empty rest param to just the prefix", () => {
    expect(generateUrl("docs/[...slug]", { slug: [] })).toBe("/docs");
  });

  it("includes an optional rest [[...slug]] only when populated", () => {
    expect(generateUrl("docs/[[...slug]]", { slug: ["x", "y"] })).toBe(
      "/docs/x/y",
    );
    expect(generateUrl("docs/[[...slug]]", { slug: [] })).toBe("/docs");
    expect(generateUrl("docs/[[...slug]]", {})).toBe("/docs");
  });

  it("skips @slot segments", () => {
    expect(generateUrl("dashboard/@modal/settings", {})).toBe(
      "/dashboard/settings",
    );
  });

  it("skips (group) segments", () => {
    expect(generateUrl("(marketing)/about", {})).toBe("/about");
  });

  it("renders a mix of group, static, and required/optional params", () => {
    expect(
      generateUrl("(shop)/products/[category]/[[...filters]]", {
        category: "shoes",
        filters: ["red", "size-10"],
      }),
    ).toBe("/products/shoes/red/size-10");
  });
});
