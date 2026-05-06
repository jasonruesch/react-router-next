import { useParams } from "react-router";

type ParseSegment<S extends string> = S extends `[[...${infer Name}]]`
  ? { [K in Name]?: string[] }
  : S extends `[...${infer Name}]`
    ? { [K in Name]: string[] }
    : S extends `[[${infer Name}]]`
      ? { [K in Name]?: string }
      : S extends `[${infer Name}]`
        ? { [K in Name]: string }
        : S extends `(${string})`
          ? Record<never, never>
          : Record<never, never>;

type ParseRoute<S extends string> = S extends `${infer Head}/${infer Tail}`
  ? ParseSegment<Head> & ParseRoute<Tail>
  : ParseSegment<S>;

export type RouteParams<S extends string> = string extends S
  ? Record<string, string | string[] | undefined>
  : { [K in keyof ParseRoute<S>]: ParseRoute<S>[K] };

export type RouteProps<S extends string> = {
  params: RouteParams<S>;
};

export function parseRouteParams<S extends string>(
  route: S,
  rrParams: Readonly<Record<string, string | undefined>>,
): RouteParams<S> {
  const out: Record<string, string | string[] | undefined> = {};
  for (const seg of route.split("/")) {
    if (seg.startsWith("[[...") && seg.endsWith("]]")) {
      const splat = rrParams["*"];
      out[seg.slice(5, -2)] =
        splat === undefined ? undefined : splat.split("/").filter(Boolean);
    } else if (seg.startsWith("[...") && seg.endsWith("]")) {
      out[seg.slice(4, -1)] = (rrParams["*"] ?? "").split("/").filter(Boolean);
    } else if (seg.startsWith("[[") && seg.endsWith("]]")) {
      const name = seg.slice(2, -2);
      out[name] = rrParams[name];
    } else if (seg.startsWith("[") && seg.endsWith("]")) {
      const name = seg.slice(1, -1);
      out[name] = rrParams[name]!;
    }
  }
  return out as RouteParams<S>;
}

export function useRouteParams<S extends string>(route: S): RouteParams<S> {
  return parseRouteParams(route, useParams());
}

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
