import { expect, test, type APIRequestContext } from "@playwright/test";

import {
  directoryPerson,
  filterDirectory,
} from "../../src/lib/community/directory";
import { readDirectoryQuery } from "../../src/lib/community/directory-query";
import type { PeoplePage } from "../../src/lib/community/schema";

const backendUrl = process.env.DEVHUB_BACKEND_URL;

async function readPeople(
  request: APIRequestContext,
  params: Record<string, string | number>,
): Promise<PeoplePage> {
  const response = await request.get(`${backendUrl}/api/v1/people`, { params });
  expect(response.ok(), `People API returned ${response.status()}`).toBe(true);
  return response.json();
}

for (const { path, title } of [
  { path: "/mvps", title: /Databricks MVPs/i },
  { path: "/student-fellows", title: /Student fellows/i },
]) {
  test(`${path} renders its program content on mobile`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`${path}$`),
    );
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  });
}

test.describe("community directory integration", () => {
  test.skip(
    !backendUrl,
    "Set DEVHUB_BACKEND_URL and run the backend to test real directory integration.",
  );

  test("student search, profile and browser back preserve backend records", async ({
    page,
    request,
  }) => {
    const { items } = await readPeople(request, {
      kind: "student",
      pageSize: 100,
    });
    const person = items.find((item) => item.bio.includes("\n\n"));
    expect(
      person,
      "The source fixture includes a multi-paragraph biography",
    ).toBeDefined();
    if (!person) throw new Error("Missing source biography fixture");
    await page.goto("/student-fellows/fellows");
    const search = page.getByRole("searchbox", {
      name: "Search by name or expertise",
    });
    await search.fill(person.name);
    await search.press("Enter");
    await expect
      .poll(() => new URL(page.url()).searchParams.get("q"))
      .toBe(person.name);
    const searchUrl = page.url();
    await page
      .locator(`a[href="/student-fellows/fellows/${person.slug}"]`)
      .click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      person.name,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`${person.slug}$`),
    );
    await expect(
      page.getByRole("region", { name: "About", exact: true }).locator("p"),
    ).toHaveText(person.bio.split(/\n\s*\n/).filter(Boolean));
    await page.goBack();
    await expect(page).toHaveURL(searchUrl);
    await expect(search).toHaveValue(person.name);
    await expect(
      page.getByRole("heading", { name: person.name, exact: true }),
    ).toBeVisible();
    await page.goto(`/student-fellows/fellows/${person.slug}`);
    await page
      .getByRole("navigation", { name: "Breadcrumb" })
      .getByRole("link", { name: "Back", exact: true })
      .click();
    await expect(page).toHaveURL("/student-fellows/fellows");
  });

  test("an empty search has a clear result state", async ({ page }) => {
    await page.goto(
      "/student-fellows/fellows?q=does-not-match-any-person-01a07c3d",
    );
    await expect(
      page.getByRole("heading", { name: "No matches found" }),
    ).toBeVisible();
    await page
      .getByRole("link", { name: "Clear filters", exact: true })
      .click();
    await expect(page).toHaveURL("/student-fellows/fellows");
    await expect(page.getByRole("searchbox")).toHaveValue("");
    await expect(
      page
        .getByRole("region", { name: "Student fellows directory" })
        .getByRole("heading", { level: 2 })
        .first(),
    ).toBeVisible();
  });

  test("MVP directory renders actual published MVPs", async ({
    page,
    request,
  }) => {
    const result = await readPeople(request, { kind: "mvp", pageSize: 20 });
    expect(result.items.length).toBeGreaterThan(0);
    await page.goto("/mvps/directory");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const directory = page.getByRole("region", {
      name: "MVP directory",
      exact: true,
    });
    await expect(directory.getByRole("heading", { level: 2 })).toHaveText(
      result.items.map((person) => person.name),
    );
    await expect(
      directory.getByRole("status", { name: "Directory results" }),
    ).toHaveText(`${result.total} MVPs`);
  });

  test("student highlights render their source descriptions and links", async ({
    page,
    request,
  }) => {
    const { items } = await readPeople(request, {
      kind: "student",
      pageSize: 100,
    });
    const person = items.find(
      (item) =>
        item.highlights.length > 1 &&
        item.highlights.some((highlight) => highlight.url),
    );
    expect(
      person,
      "The source fixture includes linked student highlights",
    ).toBeDefined();
    if (!person) throw new Error("Missing source highlights fixture");
    await page.goto(`/student-fellows/fellows/${person.slug}`);
    const highlights = page.getByRole("region", {
      name: "Highlights",
      exact: true,
    });
    await expect(highlights.getByRole("heading", { level: 3 })).toHaveText(
      person.highlights.map((highlight) => highlight.title),
    );
    for (const [index, highlight] of person.highlights.entries()) {
      const article = highlights.getByRole("article").nth(index);
      await expect(article.locator("p")).toHaveText(highlight.description);
      if (highlight.url) {
        const link = article.getByRole("link", {
          name: highlight.title,
          exact: true,
        });
        await expect(link).toHaveAttribute("href", highlight.url);
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", /noopener/);
      } else {
        await expect(article.getByRole("link")).toHaveCount(0);
      }
    }
    if (person.photoUrl) {
      const photo = page
        .getByRole("complementary", { name: "Fellow details" })
        .getByRole("img", { name: person.name, exact: true });
      await expect(photo).toBeVisible();
      await expect
        .poll(() =>
          photo.evaluate((image: HTMLImageElement) => image.naturalWidth),
        )
        .toBeGreaterThan(0);
    }
  });

  for (const { kind, route, region } of [
    {
      kind: "student",
      route: "/student-fellows/fellows",
      region: "Student fellows directory",
    },
    { kind: "mvp", route: "/mvps/directory", region: "MVP directory" },
  ]) {
    test(`${kind} page URLs render the requested records without JavaScript`, async ({
      browser,
      request,
      baseURL,
    }) => {
      const source = await readPeople(request, { kind, pageSize: 20, page: 2 });
      const context = await browser.newContext({
        javaScriptEnabled: false,
        baseURL,
      });
      try {
        const page = await context.newPage();
        const response = await page.goto(`${route}/page/2`);
        expect(response?.status()).toBe(200);
        await expect(
          page
            .getByRole("region", { name: region, exact: true })
            .getByRole("heading", { level: 2 }),
        ).toHaveText(source.items.map((person) => person.name));
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
          "href",
          new RegExp(`${route}/page/2$`),
        );
        await expect(page).toHaveTitle(/Page 2/);
        await expect(
          page.getByRole("link", { name: "Page 2", exact: true }),
        ).toHaveAttribute("aria-current", "page");
        for (const segment of ["0", "abc", String(source.totalPages + 1)]) {
          const invalid = await request.get(`${route}/page/${segment}`);
          expect(invalid.status(), segment).toBe(404);
        }
        const first = await request.get(`${route}/page/1?country=Brazil`, {
          maxRedirects: 0,
        });
        expect(first.status()).toBe(308);
        expect(new URL(first.headers().location, baseURL).pathname).toBe(route);
        expect(first.headers().location).toContain("country=Brazil");
        const filtered = await request.get(`${route}/page/2?q=data`);
        expect(filtered.headers()["x-robots-tag"]).toBe("noindex, follow");
      } finally {
        await context.close();
      }
    });

    test(`${kind} filters reset pagination${kind === "student" ? " and support local multiselect" : ""}`, async ({
      page,
      request,
    }) => {
      const { items } = await readPeople(request, { kind, pageSize: 100 });
      const person =
        items.find((item) => item.country && item.city) ||
        items.find((item) => item.country);
      if (!person) throw new Error("Missing source filter fixture");
      const filters: Record<string, string> = { country: person.country };
      if (person.city) filters.city = person.city;
      const expected = await readPeople(request, {
        kind,
        pageSize: 20,
        ...filters,
      });
      expect(expected.items.length).toBeGreaterThan(0);
      await page.goto(`${route}/page/2`);
      const directory = page.getByRole("region", { name: region, exact: true });
      await directory
        .getByRole("button", { name: "Country", exact: true })
        .click();
      await page
        .getByRole("checkbox", { name: person.country, exact: true })
        .click();
      await page.keyboard.press("Escape");
      const city = directory.getByRole("button", {
        name: "City",
        exact: true,
      });
      if (person.city) {
        await city.click();
        await page
          .getByRole("checkbox", { name: person.city, exact: true })
          .click();
        await page.keyboard.press("Escape");
      }
      const url = new URL(page.url());
      expect(url.pathname).toBe(route);
      expect(Object.fromEntries(url.searchParams)).toEqual(filters);
      await expect(directory.getByRole("heading", { level: 2 })).toHaveText(
        expected.items.map((item) => item.name),
      );
      await expect(
        directory.getByRole("status", { name: "Directory results" }),
      ).toHaveText(
        `${expected.total} ${kind === "student" ? "student fellows" : "MVPs"}`,
      );
      if (kind === "mvp") return;

      const another = items.find(
        (item) => item.country && item.country !== person.country,
      );
      if (!another) throw new Error("Source fixture needs two countries");
      const dataRequests: string[] = [];
      page.on("request", (req) => {
        if (
          ["document", "fetch", "xhr"].includes(req.resourceType()) &&
          !req.headers()["next-router-prefetch"]
        )
          dataRequests.push(req.url());
      });
      if (person.city) {
        await city.click();
        await page
          .getByRole("button", { name: "Clear all", exact: true })
          .click();
        await page.keyboard.press("Escape");
      }
      await directory
        .getByRole("button", { name: "Country", exact: true })
        .click();
      await page
        .getByRole("checkbox", { name: another.country, exact: true })
        .click();
      await expect(
        page.getByRole("checkbox", { name: person.country, exact: true }),
      ).toBeChecked();
      await expect(
        page.getByRole("checkbox", { name: another.country, exact: true }),
      ).toBeChecked();
      await expect(
        directory.getByLabel("2 selected", { exact: true }),
      ).toBeVisible();
      expect(new URL(page.url()).searchParams.getAll("country")).toEqual([
        `${person.country},${another.country}`,
      ]);
      await page.keyboard.press("Escape");
      const combinedUrl = page.url();
      const selectedCountries = await directory
        .locator("article > div p")
        .allTextContents();
      expect(selectedCountries.length).toBeGreaterThan(0);
      expect(
        selectedCountries.every((text) =>
          [person.country, another.country].some((country) =>
            text.includes(`[${country}]`),
          ),
        ),
      ).toBe(true);
      await page.goBack();
      await expect(
        directory.getByLabel("1 selected", { exact: true }),
      ).toBeVisible();
      await page.goForward();
      await expect(page).toHaveURL(combinedUrl);
      await expect(
        directory.getByLabel("2 selected", { exact: true }),
      ).toBeVisible();
      const search = directory.getByRole("searchbox");
      await search.pressSequentially("no matches 01a07c3d");
      await expect(search).toHaveValue("no matches 01a07c3d");
      await expect(
        directory.getByRole("heading", { name: "No matches found" }),
      ).toBeVisible();
      await directory
        .getByRole("button", { name: "Clear search", exact: true })
        .click();
      await expect(search).toHaveValue("");
      await expect(
        directory.getByRole("heading", { name: "No matches found" }),
      ).toHaveCount(0);
      expect(dataRequests).toEqual([]);
      await page.reload();
      await expect(
        directory.getByLabel("2 selected", { exact: true }),
      ).toBeVisible();
      await directory
        .getByRole("button", { name: "Country", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Clear all", exact: true })
        .click();
      await expect(page).toHaveURL(route);
      await expect(
        directory.getByLabel("2 selected", { exact: true }),
      ).toHaveCount(0);
    });
  }

  test("student pagination retains search and renders the correct next and previous records", async ({
    page,
    request,
  }) => {
    const source = await readPeople(request, {
      kind: "student",
      pageSize: 100,
    });
    const members = [...source.items];
    for (let pageNumber = 2; pageNumber <= source.totalPages; pageNumber++) {
      const next = await readPeople(request, {
        kind: "student",
        pageSize: 100,
        page: pageNumber,
      });
      members.push(...next.items);
    }
    const query = readDirectoryQuery({ q: "data" }, "student");
    const directoryMembers = members.map(directoryPerson);
    const first = filterDirectory(directoryMembers, query);
    const second = filterDirectory(directoryMembers, { ...query, page: 2 });
    expect(
      first.totalPages,
      "The source fixture has two pages matching data",
    ).toBeGreaterThan(1);
    expect(second.items.length).toBeGreaterThan(0);
    await page.goto("/student-fellows/fellows?q=data");
    const directory = page.getByRole("region", {
      name: "Student fellows directory",
    });
    const pagination = directory.getByRole("navigation", {
      name: "Directory pages",
    });
    await expect(directory.getByRole("heading", { level: 2 })).toHaveText(
      first.items.map((person) => person.name),
    );
    const dataRequests: string[] = [];
    page.on("request", (req) => {
      // Footer links may prefetch when pagination scrolls them into view.
      if (
        ["document", "fetch", "xhr"].includes(req.resourceType()) &&
        !req.headers()["next-router-prefetch"]
      )
        dataRequests.push(req.url());
    });
    await pagination.getByRole("link", { name: "Go to next page" }).click();
    await expect(page).toHaveURL("/student-fellows/fellows/page/2?q=data");
    await expect(page).toHaveTitle(/Student Fellows — Page 2/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/student-fellows\/fellows\/page\/2$/,
    );
    await expect(directory).toBeFocused();
    await expect(directory.getByRole("article").first()).toBeInViewport();
    await expect(page.getByRole("searchbox")).toHaveValue("data");
    await expect(
      pagination.getByRole("link", { name: "Page 2", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(directory.getByRole("heading", { level: 2 })).toHaveText(
      second.items.map((person) => person.name),
    );
    await pagination.getByRole("link", { name: "Go to previous page" }).click();
    await expect(page).toHaveURL("/student-fellows/fellows?q=data");
    await expect(page).toHaveTitle(
      "Meet the Student Fellows | Databricks Developer",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/student-fellows\/fellows$/,
    );
    await expect(directory.getByRole("heading", { level: 2 })).toHaveText(
      first.items.map((person) => person.name),
    );
    expect(dataRequests).toEqual([]);
    await page.goBack();
    await expect(page).toHaveURL("/student-fellows/fellows/page/2?q=data");
    await expect(page).toHaveTitle(/Student Fellows — Page 2/);
    await expect(directory.getByRole("heading", { level: 2 })).toHaveText(
      second.items.map((person) => person.name),
    );
    await page.reload();
    await expect(directory.getByRole("heading", { level: 2 })).toHaveText(
      second.items.map((person) => person.name),
    );
  });

  test("community sitemap serves valid XML with student profile URLs", async ({
    page,
    request,
  }) => {
    const response = await request.get("/community-sitemap.xml");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/^application\/xml\b/);
    const sitemap = await page.evaluate(
      (xml) => {
        const document = new DOMParser().parseFromString(
          xml,
          "application/xml",
        );
        return {
          error: document.querySelector("parsererror")?.textContent ?? null,
          urls: Array.from(
            document.getElementsByTagNameNS(
              "http://www.sitemaps.org/schemas/sitemap/0.9",
              "loc",
            ),
            (location) => location.textContent ?? "",
          ),
        };
      },
      await response.text(),
    );
    expect(sitemap.error).toBeNull();
    expect(sitemap.urls.length).toBeGreaterThan(0);
    for (const url of sitemap.urls) {
      expect(url).toMatch(
        /^https?:\/\/[^/]+\/student-fellows\/fellows\/[a-z0-9-]+$/,
      );
    }
  });

  test("unknown community profiles and pages render one website not-found shell", async ({
    page,
  }) => {
    for (const path of [
      "/student-fellows/fellows/unknown-person-01a07c3d",
      "/student-fellows/fellows/page/0",
      "/mvps/directory/page/0",
      "/mvps/directory/page/100000",
    ]) {
      await page.goto(path);
      await expect(
        page.getByRole("heading", { name: /page not found/i }),
      ).toBeVisible();
      await expect(
        page.locator('header a[aria-label="Databricks Developer home"]'),
      ).toHaveCount(1);
    }
  });

  test("MVP cards expose every additional source link with keyboard access", async ({
    page,
    request,
  }) => {
    const { items } = await readPeople(request, { kind: "mvp", pageSize: 100 });
    const person = items.find((item) => item.additionalLinks.length >= 2);
    expect(
      person,
      "The workbook includes profiles with multiple additional links",
    ).toBeDefined();
    if (!person) throw new Error("Missing additional links source fixture");
    await page.goto(`/mvps/directory?q=${encodeURIComponent(person.name)}`);
    const trigger = page.getByRole("button", {
      name: `More links for ${person.name}`,
      exact: true,
    });
    await trigger.focus();
    await trigger.press("Enter");
    const menu = page.getByRole("menu");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page
        .getByRole("navigation", {
          name: `Additional links for ${person.name}`,
        })
        .getByRole("menu"),
    ).toBeVisible();
    await expect(menu.getByRole("menuitem")).toHaveText(
      person.additionalLinks.map((link) => link.label),
    );
    for (const [index, link] of person.additionalLinks.entries()) {
      const item = menu.getByRole("menuitem").nth(index);
      await expect(item).toHaveAttribute("href", link.url);
      await expect(item).toHaveAttribute("target", "_blank");
      await expect(item).toHaveAttribute("rel", "noopener noreferrer");
    }
    await page.keyboard.press("Escape");
    await expect(menu).not.toBeVisible();
    await expect(trigger).toBeFocused();

    const additionalOnly = items.find(
      (item) =>
        item.additionalLinks.length && !Object.values(item.links).some(Boolean),
    );
    expect(
      additionalOnly,
      "The workbook includes an MVP whose only destination is YouTube",
    ).toBeDefined();
    if (!additionalOnly)
      throw new Error("Missing additional-only source fixture");
    await page.goto(
      `/mvps/directory?q=${encodeURIComponent(additionalOnly.name)}`,
    );
    await expect(
      page.getByRole("link", { name: new RegExp(additionalOnly.name) }).first(),
    ).toHaveAttribute("href", additionalOnly.additionalLinks[0].url);
  });
});
