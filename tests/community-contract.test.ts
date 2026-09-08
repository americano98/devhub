import { describe, expect, it } from "vitest";

import {
  directorySearchParams,
  publicPersonSchema,
} from "../src/lib/community/schema";

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
  photoUrl: "",
  links: {},
  expertise: [],
  status: "published",
  featured: false,
};

describe("community public boundary", () => {
  it("removes private and undeclared fields from backend responses", () => {
    const parsed = publicPersonSchema.parse({
      ...profile,
      email: "private@example.com",
      userId: "account-id",
      internalNotes: "private",
    });
    expect(parsed).toEqual({ ...profile, highlights: [], additionalLinks: [] });
  });

  it("preserves named additional links without exposing undeclared fields", () => {
    const parsed = publicPersonSchema.parse({
      ...profile,
      additionalLinks: [
        {
          label: "YouTube",
          url: "https://www.youtube.com/@example",
          privateNote: "internal",
        },
      ],
    });
    expect(parsed.additionalLinks).toEqual([
      { label: "YouTube", url: "https://www.youtube.com/@example" },
    ]);
    for (const link of [
      { label: "", url: "https://example.com" },
      { label: "Example", url: "" },
      { label: "Example", url: "javascript:alert(1)" },
      { label: "Example", url: "https://user:secret@example.com" },
      { label: "Example", url: "http://example.com" },
    ]) {
      expect(
        publicPersonSchema.safeParse({ ...profile, additionalLinks: [link] })
          .success,
      ).toBe(false);
    }
  });

  it("rejects unpublished records and executable links", () => {
    expect(
      publicPersonSchema.safeParse({ ...profile, status: "draft" }).success,
    ).toBe(false);
    expect(
      publicPersonSchema.safeParse({
        ...profile,
        links: { website: "javascript:alert(1)" },
      }).success,
    ).toBe(false);
    expect(
      publicPersonSchema.safeParse({
        ...profile,
        photoUrl: "//untrusted.example/photo",
      }).success,
    ).toBe(false);
  });

  it("encodes filters as values and constrains pagination", () => {
    const query = directorySearchParams({
      kind: "student",
      q: "A&B",
      country: "United States",
    });
    expect(query.get("q")).toBe("A&B");
    expect(query.get("pageSize")).toBe("24");
    expect(query.has("B")).toBe(false);
    expect(() =>
      directorySearchParams({ kind: "mvp", pageSize: 10000 }),
    ).toThrow();
  });
});
