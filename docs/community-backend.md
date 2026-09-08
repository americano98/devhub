# Community backend integration

Backend repository: [pixel-point/devhub-backend](https://github.com/pixel-point/devhub-backend).
Follow its [Vercel setup guide](https://github.com/pixel-point/devhub-backend/blob/main/docs/vercel.md)
to deploy the API/admin and initialize Neon. In the Vercel project connected to
`pixel-point/devhub`, set `DEVHUB_BACKEND_URL` to the backend's stable HTTPS
origin for **Preview**, then redeploy this PR. Configure **Production** separately.
The API and `/headshots` must be publicly reachable; no browser CORS wildcard
or auth/database/email secrets are needed in the frontend.

The MVP and Student Fellows pages read published profiles from the separate
`devhub-backend` service. The website contains no editable profile database or
duplicated data snapshot.

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

Requests are rendered on the server, time out after eight seconds, and use
`cache: "no-store"`. Admin edits therefore appear on the next page request.
Search and pagination stay in the page URL for navigation and sharing.
Service errors must display an unavailable state, while an actual detail 404
must render the website's not-found page. An unavailable service must never be
presented as a genuinely empty directory.

`/community-sitemap.xml` lists published student detail pages at request time.
It is added to robots.txt when `DEVHUB_BACKEND_URL` is configured, and returns
a retryable 503 during backend outages. Split it into a sitemap index before
the directory exceeds 50,000 student profiles. Its public cache lasts five
minutes; website profile requests remain uncached.

Backend setup, Better Auth administrator provisioning, Neon migrations, source
data provenance, and Resend configuration live in the backend repository's
documentation. A future member cabinet can link authenticated accounts to
profiles there without making the public website responsible for authentication.
