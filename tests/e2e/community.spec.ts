import { expect, test, type APIRequestContext } from "@playwright/test";

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
    test(`${kind} city/country controls submit source values and reset pagination`, async ({
      page,
      request,
    }) => {
      const { items } = await readPeople(request, { kind, pageSize: 100 });
      const facetResponse = await request.get(`${backendUrl}/api/v1/facets`, {
        params: { kind },
      });
      expect(facetResponse.ok()).toBe(true);
      const { cities }: { cities: string[] } = await facetResponse.json();
      expect(Array.isArray(cities)).toBe(true);
      const person =
        items.find((item) => item.country && item.city) ||
        items.find((item) => item.country);
      expect(
        person,
        "The source fixture includes filterable profile fields",
      ).toBeDefined();
      if (!person) throw new Error("Missing source filter fixture");
      const filters: Record<string, string> = { country: person.country };
      if (person.city) filters.city = person.city;
      const expected = await readPeople(request, {
        kind,
        pageSize: 20,
        ...filters,
      });
      expect(expected.items.length).toBeGreaterThan(0);
      await page.goto(`${route}?page=2`);
      const directory = page.getByRole("region", { name: region, exact: true });
      await directory
        .getByRole("button", { name: "Country", exact: true })
        .click();
      await page
        .getByRole("checkbox", { name: person.country, exact: true })
        .click();
      await expect
        .poll(() => new URL(page.url()).searchParams.get("country"))
        .toBe(person.country);
      const city = directory.getByRole("button", {
        name: "City",
        exact: true,
      });
      if (cities.length) {
        await expect(city).toBeEnabled();
        await city.click();
        await expect(page.getByRole("checkbox")).toHaveCount(cities.length);
        if (person.city) {
          await page
            .getByRole("checkbox", { name: person.city, exact: true })
            .click();
          await expect
            .poll(() => new URL(page.url()).searchParams.get("city"))
            .toBe(person.city);
        } else {
          await page.keyboard.press("Escape");
        }
      } else {
        await expect(city).toBeDisabled();
      }
      await directory
        .getByRole("button", { name: "Search and apply filters" })
        .click();
      await expect
        .poll(() => new URL(page.url()).searchParams.get("country"))
        .toBe(person.country);
      expect(new URL(page.url()).searchParams.has("page")).toBe(false);
      for (const [key, value] of Object.entries(filters)) {
        expect(new URL(page.url()).searchParams.get(key)).toBe(value);
        await expect(directory.locator(`input[name="${key}"]`)).toHaveValue(
          value,
        );
      }
      await expect(directory.getByRole("heading", { level: 2 })).toHaveText(
        expected.items.map((item) => item.name),
      );
      await expect(
        directory.getByRole("status", { name: "Directory results" }),
      ).toHaveText(
        `${expected.total} ${kind === "student" ? "student fellows" : "MVPs"}`,
      );
    });
  }

  test("student pagination retains search and renders the correct next and previous records", async ({
    page,
    request,
  }) => {
    const query = { kind: "student", q: "data", pageSize: 20 };
    const first = await readPeople(request, { ...query, page: 1 });
    const second = await readPeople(request, { ...query, page: 2 });
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
    await pagination.getByRole("link", { name: "Go to next page" }).click();
    await expect
      .poll(() => new URL(page.url()).searchParams.get("page"))
      .toBe("2");
    expect(new URL(page.url()).searchParams.get("q")).toBe("data");
    await expect(page.getByRole("searchbox")).toHaveValue("data");
    await expect(
      pagination.getByRole("link", { name: "Page 2", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(directory.getByRole("heading", { level: 2 })).toHaveText(
      second.items.map((person) => person.name),
    );
    await pagination.getByRole("link", { name: "Go to previous page" }).click();
    await expect(page).toHaveURL("/student-fellows/fellows?q=data");
    await expect(directory.getByRole("heading", { level: 2 })).toHaveText(
      first.items.map((person) => person.name),
    );
  });

  test("community sitemap contains every published student and no MVP profile URLs", async ({
    page,
    request,
  }) => {
    const first = await readPeople(request, { pageSize: 100 });
    const people = [...first.items];
    for (let pageNumber = 2; pageNumber <= first.totalPages; pageNumber += 1) {
      const next = await readPeople(request, {
        page: pageNumber,
        pageSize: 100,
      });
      people.push(...next.items);
    }
    expect(people).toHaveLength(first.total);
    expect(people.every((person) => person.status === "published")).toBe(true);
    const students = people.filter((person) => person.kind === "student");
    expect(students.length).toBeGreaterThan(0);
    expect(people.some((person) => person.kind === "mvp")).toBe(true);

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
          root: document.documentElement.localName,
          namespace: document.documentElement.namespaceURI,
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
    expect(sitemap.root).toBe("urlset");
    expect(sitemap.namespace).toBe(
      "http://www.sitemaps.org/schemas/sitemap/0.9",
    );
    expect(sitemap.urls).toHaveLength(students.length);
    expect(new Set(sitemap.urls).size).toBe(sitemap.urls.length);
    const urls = sitemap.urls.map((location) => new URL(location));
    for (const url of urls) {
      expect(url.protocol).toMatch(/^https?:$/);
      expect(url.search).toBe("");
      expect(url.hash).toBe("");
    }
    const paths = urls.map((url) => url.pathname);
    expect(paths.filter((path) => path.startsWith("/mvps/"))).toEqual([]);
    expect(paths.sort()).toEqual(
      students
        .map((person) => `/student-fellows/fellows/${person.slug}`)
        .sort(),
    );
  });

  test("unknown student slugs render the website not-found page", async ({
    page,
  }) => {
    await page.goto("/student-fellows/fellows/unknown-person-01a07c3d");
    await expect(
      page.getByRole("heading", { name: /page not found/i }),
    ).toBeVisible();
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
