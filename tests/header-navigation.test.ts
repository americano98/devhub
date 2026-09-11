import { describe, expect, test } from "vitest";

import { HEADER_LINKS, isHeaderNavItemActive } from "@/lib/header-navigation";

describe("header navigation active state", () => {
  const docsItem = HEADER_LINKS.find(({ label }) => label === "Docs");

  test("keeps Docs active on the docs landing page", () => {
    expect(docsItem).toBeDefined();
    expect(isHeaderNavItemActive(docsItem!, "/docs/start-here")).toBe(true);
  });

  test("keeps Docs active on nested docs pages", () => {
    expect(docsItem).toBeDefined();
    expect(isHeaderNavItemActive(docsItem!, "/docs/apps/quickstart")).toBe(
      true,
    );
  });

  test("does not mark Docs active outside the docs section", () => {
    expect(docsItem).toBeDefined();
    expect(isHeaderNavItemActive(docsItem!, "/templates")).toBe(false);
  });

  test("marks Resources active on solutions and community program routes", () => {
    const resourcesItem = HEADER_LINKS.find(
      ({ label }) => label === "Resources",
    );
    expect(resourcesItem).toBeDefined();
    for (const path of [
      "/solutions",
      "/solutions/devhub-launch",
      "/mvps",
      "/mvps/directory/page/2",
      "/student-fellows",
      "/student-fellows/fellows/student-example",
    ]) {
      expect(isHeaderNavItemActive(resourcesItem!, path)).toBe(true);
    }
    for (const path of ["/", "/templates", "/mvps-other"]) {
      expect(isHeaderNavItemActive(resourcesItem!, path)).toBe(false);
    }
  });
});
