import type { RouteParams } from "./use-route-params";

export function generateUrl<S extends string>(
  route: S,
  params: RouteParams<S>,
): string {
  const p = params as Record<string, string | string[] | undefined>;
  const out: string[] = [];
  for (const seg of route.split("/")) {
    if (seg === "") continue;
    if (seg.startsWith("(") && seg.endsWith(")")) continue;
    if (seg.startsWith("[[...") && seg.endsWith("]]")) {
      const v = p[seg.slice(5, -2)];
      if (Array.isArray(v) && v.length > 0) out.push(...v);
    } else if (seg.startsWith("[...") && seg.endsWith("]")) {
      const v = p[seg.slice(4, -1)];
      if (Array.isArray(v)) out.push(...v);
    } else if (seg.startsWith("[[") && seg.endsWith("]]")) {
      const v = p[seg.slice(2, -2)];
      if (typeof v === "string" && v.length > 0) out.push(v);
    } else if (seg.startsWith("[") && seg.endsWith("]")) {
      const v = p[seg.slice(1, -1)];
      if (typeof v === "string") out.push(v);
    } else {
      out.push(seg);
    }
  }
  return "/" + out.join("/");
}
