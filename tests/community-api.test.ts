import { afterEach, describe, expect, it, vi } from "vitest";

import {
  CommunityApiError,
  getPeople,
  getPerson,
} from "../src/lib/community/people.server";

vi.mock("server-only", () => ({}));

const profile = {
  id: "student-example",
  slug: "student-example",
  kind: "student",
  name: "Example Fellow",
  headline: "",
  bio: "",
  country: "",
  city: "",
  organization: "",
  cohort: "",
  photoUrl: "/headshots/example.jpg",
  links: {},
  expertise: [],
  status: "published",
  featured: false,
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("backend integration", () => {
  it("resolves backend assets, strips private fields, and forwards encoded filters", async () => {
    vi.stubEnv("DEVHUB_BACKEND_URL", "https://backend.example.com");
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        items: [{ ...profile, email: "private@example.com" }],
        total: 1,
        page: 1,
        pageSize: 24,
        totalPages: 1,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const page = await getPeople({ kind: "student", q: "A&B" });
    expect(page.items[0].photoUrl).toBe(
      "https://backend.example.com/headshots/example.jpg",
    );
    expect(page.items[0]).not.toHaveProperty("email");
    expect(String(fetchMock.mock.calls[0][0])).toContain("q=A%26B");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ cache: "no-store" });
  });

  it("distinguishes missing profiles from service failures", async () => {
    vi.stubEnv("DEVHUB_BACKEND_URL", "https://backend.example.com");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 404 })),
    );
    expect(await getPerson("missing-person")).toBeNull();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 503 })),
    );
    await expect(getPerson("another-person")).rejects.toThrow(
      CommunityApiError,
    );
  });

  it("rejects malformed responses instead of silently showing an empty directory", async () => {
    vi.stubEnv("DEVHUB_BACKEND_URL", "https://backend.example.com");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ items: [profile] })),
    );
    await expect(getPeople({ kind: "mvp" })).rejects.toThrow(CommunityApiError);
  });

  it("does not request arbitrary paths via a profile slug", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await getPerson("../../api/admin/people")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
