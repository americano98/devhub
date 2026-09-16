# Community backend integration

> Student Fellows routes and their dynamic sitemap are deferred to the
> `feat/student-fellows` branch. The shared data contract remains here because
> it is also used by the MVP directory and will be reused when those routes ship.

Backend repository: [pixel-point/devhub-backend](https://github.com/pixel-point/devhub-backend).
Follow its [Vercel setup guide](https://github.com/pixel-point/devhub-backend/blob/main/docs/vercel.md)
to deploy the API/admin and initialize Neon. In the Vercel project connected to
`pixel-point/devhub`, set `DEVHUB_BACKEND_URL` to the backend's stable HTTPS
origin for **Preview**, then redeploy this PR. Configure **Production** separately.
The API and `/headshots` must be publicly reachable; no browser CORS wildcard
or auth/database/email secrets are needed in the frontend.

The MVP and Student Fellows pages read published profiles from the separate
`devhub-backend` service. The website contains no editable profile database or
checked-in data snapshot. Next.js caches published data and rendered pages.

Start the backend with `pnpm dev:local` on port 3001 and this website with
`pnpm dev` on port 3000. The backend's explicitly enabled local mode uses the
imported source data and keeps local edits separate from the source snapshot.

For production or a different local endpoint, set the server-only environment
variable `DEVHUB_BACKEND_URL` to the backend origin, for example
`https://backend.example.com`. Restart the website after changing configuration.
The development default is `http://127.0.0.1:3001`. Production requires an
explicit URL. Never expose database or authentication secrets through
`NEXT_PUBLIC_` variables.

## Public API

- `GET /api/v1/people`: `kind=student|mvp`, `q`, `country`, `city`, `cohort`,
  `expertise`, `featured`, `page`, `pageSize` (1–100, default 24).
- `GET /api/v1/people/:slug`: a published profile or 404.
- `GET /api/v1/facets?kind=student|mvp`: countries, cities, cohorts, expertise.

The client in `src/lib/community/people.server.ts` validates response schemas
and strips undeclared fields before sending data to React. Private email,
account identifiers, and internal notes are never part of the website DTO.
Only `published` profiles are accepted. Relative `/headshots/` URLs are resolved
against the backend origin; ensure that origin and its media files are publicly
reachable over HTTPS in production.

`additionalLinks` preserves named HTTPS destinations beyond the four primary
`links` keys, such as YouTube, Medium, and Databricks Community. Its shape is
`[{ label, url }]` (up to 20 items); the SDK defaults missing arrays to `[]` for
older responses. Cards expose these destinations through an accessible More
links menu. An MVP with only an additional link uses that destination for its
card; student profiles also include these URLs in their Connect menu and
`sameAs` metadata. Empty labels, unsafe URLs, and private extra fields are not
accepted into the rendered contract.

## Rendering and freshness

Both directories use ISR with `revalidate = 3600`. The build loads all published
members of each program in API batches of 100, validates the complete result,
and prerenders the first 20 cards. `/mvps/directory/page/2` and
`/student-fellows/fellows/page/2` (and later pages) generate on demand with the same
hourly ISR, serving the requested 20-card slice in HTML before JavaScript runs.
Malformed or out-of-range page paths return 404; `/page/1` permanently redirects
to the base directory while retaining query parameters.
The backend must therefore be reachable and
`DEVHUB_BACKEND_URL` configured **during the production build**, not only at runtime.
The browser receives only public card fields and normalized, weighted search terms;
highlights and other detail-only fields are not sent with the directory.
Snapshots over 5,000 members per program are rejected; revisit browser payload
size and server-side search before approaching that scale.

GitHub Actions reads the backend origin from the repository variable
`DEVHUB_BACKEND_URL` for its build and integration tests. Configure it before
running CI; no backend URL or fallback is committed in the workflow. Vercel's
Production and Preview environment settings remain separate. CI needs network
access to the configured backend. A GitHub billing/spending-limit failure prevents the job from
starting and must be resolved in the account settings independently of code.

Search, City/Country multiselect and pagination use this local snapshot, without
API requests or Next.js server navigations. Values within a facet use OR;
different facets and search combine with AND. Filtering resets to page 1.
The dependency-free search matches all query words across name, expertise,
headline, organization, location and bio, regardless of word order. Accents,
case, apostrophes and whitespace are normalized; `C++` and `C#` remain distinct.
Exact words rank above prefixes, which match from the first character; one insertion,
deletion, replacement or adjacent transposition is allowed only when both words
have at least five characters. Results needing fewer typo corrections come first.
Exact full names get a bonus; name and expertise matches outweigh biography
matches. Ties and empty queries preserve the original directory order. City/Country
dropdown search uses the same normalization, but remains a strict substring match.
Country URLs use comma-separated names, for example
`?country=Belgium,Brazil,Canada`; older repeated `country` parameters are still
accepted. City values remain repeated parameters because city names can contain
commas. Page numbers use `/page/N`, with page 1 at the base path; for example
`/mvps/directory/page/2?q=data&country=Belgium,Brazil`.
Legacy `?page=N` links remain readable in the browser, but generated links use
path pagination. A page in the path takes precedence over a legacy query page.
Native History API updates observe both pathname and search, preserving shareable
URLs and back/forward navigation without data requests; typing replaces the
current history entry. Reloaded query URLs apply filters after hydration; the
initial static HTML is the unfiltered slice for the requested path page.
Each page path has its own title and canonical; filtered URLs canonicalize to
the same path without query parameters and share its static metadata.
Local pagination keeps the document and social titles/canonical in sync without
fetching a route, including Back/Forward. Activating a pagination link moves focus
and scroll to the directory so the newly selected cards are immediately visible.
Query-specific `X-Robots-Tag: noindex, follow` headers keep filtered URLs out of
the index without making the page dynamically rendered.
Published student detail URLs remain discoverable through the community sitemap.

Student profiles are generated on demand on their first visit and cached for
an hour, including metadata. New slugs work without a rebuild. Public API calls
time out after eight seconds. After an hour, the next visit can receive the old
page while Next.js regenerates it in the background; this is not a scheduled job
or a hard one-hour freshness guarantee. An already open tab keeps its snapshot
until navigation/reload. No webhook or immediate invalidation is configured.

Failed regeneration throws, retaining the last successful page rather than
caching an unavailable panel or an incomplete list as successful content.
A first-render failure uses the route error boundary. Actual detail 404s use
the website's not-found page. Urgent unpublishing needs explicit cache invalidation;
a redeploy alone may reuse the data cache. Public content can remain in cached
pages during an outage.

`/community-sitemap.xml` lists published student detail pages at request time.
It is added to robots.txt when `DEVHUB_BACKEND_URL` is configured, and returns
a retryable 503 during backend outages. Split it into a sitemap index before
the directory exceeds 50,000 student profiles. Its public cache lasts five
minutes; its backend requests remain uncached and independent of the hourly pages.

Backend setup, Better Auth administrator provisioning, Neon migrations, source
data provenance, and Resend configuration live in the backend repository's
documentation. A future member cabinet can link authenticated accounts to
profiles there without making the public website responsible for authentication.
