import type { PersonKind } from "@/lib/community/schema";

export type DirectorySearchParams = Record<
  string,
  string | string[] | undefined
>;

export function readDirectoryQuery(
  params: DirectorySearchParams,
  kind: PersonKind,
) {
  const value = (key: string, limit: number) => {
    const entry = params[key];
    return (
      (Array.isArray(entry) ? entry[0] : entry)?.trim().slice(0, limit) ||
      undefined
    );
  };
  const requestedPage = Number(value("page", 12));
  return {
    kind,
    q: value("q", 200),
    city: value("city", 100),
    country: value("country", 100),
    page:
      Number.isSafeInteger(requestedPage) &&
      requestedPage > 0 &&
      requestedPage <= 100000
        ? requestedPage
        : 1,
    pageSize: 20,
  };
}

export function directoryHref(
  kind: PersonKind,
  params: DirectorySearchParams,
  page = 1,
) {
  const query = readDirectoryQuery(params, kind);
  const search = new URLSearchParams();
  for (const key of ["q", "city", "country"] as const) {
    if (query[key]) search.set(key, query[key]);
  }
  if (page > 1) search.set("page", String(page));
  const route = kind === "mvp" ? "/mvps/directory" : "/student-fellows/fellows";
  return search.size ? `${route}?${search}` : route;
}

export function hasDirectoryFilters(params: DirectorySearchParams) {
  return ["q", "city", "country", "page"].some((key) => {
    const entry = params[key];
    return Array.isArray(entry) ? entry.some(Boolean) : Boolean(entry);
  });
}
