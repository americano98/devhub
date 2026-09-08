import "server-only";

import { cache } from "react";
import { z } from "zod";

import {
  directorySearchParams,
  peopleFacetsSchema,
  peoplePageSchema,
  publicPersonSchema,
  type DirectoryQuery,
  type PeoplePage,
  type PersonKind,
  type PublicPerson,
} from "./schema";

export class CommunityApiError extends Error {
  constructor() {
    super(
      "The community directory is temporarily unavailable. Please try again.",
    );
    this.name = "CommunityApiError";
  }
}

function backendOrigin(): string {
  const configured = process.env.DEVHUB_BACKEND_URL?.trim();
  const value =
    configured ||
    (process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:3001"
      : undefined);
  if (!value) throw new CommunityApiError();
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  ) {
    throw new CommunityApiError();
  }
  return url.origin;
}

async function request(path: string): Promise<Response> {
  try {
    return await fetch(new URL(path, backendOrigin()), {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new CommunityApiError();
  }
}

async function parseResponse<T>(
  response: Response,
  schema: z.ZodType<T>,
): Promise<T> {
  if (!response.ok) throw new CommunityApiError();
  try {
    return schema.parse(await response.json());
  } catch {
    throw new CommunityApiError();
  }
}

function resolvePhoto(person: PublicPerson): PublicPerson {
  return {
    ...person,
    photoUrl: person.photoUrl
      ? new URL(person.photoUrl, backendOrigin()).href
      : "",
  };
}

export async function getPeople(query: DirectoryQuery): Promise<PeoplePage> {
  const response = await request(
    `/api/v1/people?${directorySearchParams(query)}`,
  );
  const page = await parseResponse(response, peoplePageSchema);
  return { ...page, items: page.items.map(resolvePhoto) };
}

export const getPerson = cache(
  async (slug: string): Promise<PublicPerson | null> => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
    const response = await request(
      `/api/v1/people/${encodeURIComponent(slug)}`,
    );
    if (response.status === 404) return null;
    const { item } = await parseResponse(
      response,
      z.object({ item: publicPersonSchema }),
    );
    return resolvePhoto(item);
  },
);

export const getFacets = cache(async (kind: PersonKind) => {
  const response = await request(
    `/api/v1/facets?kind=${encodeURIComponent(kind)}`,
  );
  return parseResponse(response, peopleFacetsSchema);
});
