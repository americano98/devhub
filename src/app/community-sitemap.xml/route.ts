import { getPeople } from "@/lib/community/people.server";
import { resolveSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const first = await getPeople({ kind: "student", pageSize: 100 });
    if (first.total > 50_000 || first.totalPages > 500) {
      throw new Error(
        "The community sitemap needs to be split before exceeding 50,000 URLs.",
      );
    }
    const people = [...first.items];
    for (let page = 2; page <= first.totalPages; page += 1) {
      const next = await getPeople({ kind: "student", page, pageSize: 100 });
      people.push(...next.items);
    }
    const origin = resolveSiteUrl();
    const urls = [
      ...new Set(
        people
          .filter((person) => person.kind === "student")
          .map((person) => person.slug),
      ),
    ]
      .map(
        (slug) =>
          `<url><loc>${origin}/student-fellows/fellows/${slug}</loc></url>`,
      )
      .join("");
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
      {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=300, s-maxage=300",
        },
      },
    );
  } catch {
    return new Response("Community sitemap temporarily unavailable", {
      status: 503,
      headers: { "Cache-Control": "no-store", "Retry-After": "300" },
    });
  }
}
