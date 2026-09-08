import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "../src/app/community-sitemap.xml/route";

const { getPeople } = vi.hoisted(() => ({ getPeople: vi.fn() }));
vi.mock("../src/lib/community/people.server", () => ({ getPeople }));

afterEach(() => {
  getPeople.mockReset();
  vi.unstubAllEnvs();
});

describe("community sitemap", () => {
  it("includes all published student pages across backend pagination", async () => {
    vi.stubEnv("SITE_URL", "https://developers.example.com");
    getPeople.mockResolvedValueOnce({
      items: [{ slug: "student-one", kind: "student" }],
      total: 101,
      totalPages: 2,
    });
    getPeople.mockResolvedValueOnce({
      items: [{ slug: "student-two", kind: "student" }],
      total: 101,
      totalPages: 2,
    });
    const response = await GET();
    expect(response.status).toBe(200);
    const xml = await response.text();
    expect(xml).toContain(
      "https://developers.example.com/student-fellows/fellows/student-one",
    );
    expect(xml).toContain(
      "https://developers.example.com/student-fellows/fellows/student-two",
    );
    expect(getPeople).toHaveBeenLastCalledWith({
      kind: "student",
      page: 2,
      pageSize: 100,
    });
  });

  it("returns a retryable failure instead of an empty sitemap on an outage", async () => {
    getPeople.mockRejectedValue(new Error("unavailable"));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get("Retry-After")).toBe("300");
  });
});
