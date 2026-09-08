# MVP and Student Fellows design implementation

Implemented 2026-09-07 using the existing DevHub Next.js, Tailwind, and shadcn components. Figma is the visual source. Prime setup was unavailable, and the parent authorized native implementation; no Prime candidate validation, export, or visual parity claim is made.

## Routes and Figma sources

All frames belong to `auWfvBwnxY9q6acMsE4xdd`, page `2:5` (Preview).

| Route                             | Figma frame                                                                                                                                        | Canvas      |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `/mvps`                           | [12378:7437 — databricks-MVPs-1920](https://www.figma.com/design/auWfvBwnxY9q6acMsE4xdd/Databricks-Website-Design?node-id=12378-7437)              | 1920 × 3775 |
| `/mvps/directory`                 | [12378:6109 — databricks-MVP-directory](https://www.figma.com/design/auWfvBwnxY9q6acMsE4xdd/Databricks-Website-Design?node-id=12378-6109)          | 1920 × 3829 |
| `/student-fellows`                | [12378:10492 — databricks-student-fellows-1920](https://www.figma.com/design/auWfvBwnxY9q6acMsE4xdd/Databricks-Website-Design?node-id=12378-10492) | 1920 × 3473 |
| `/student-fellows/fellows`        | [12378:8397 — databricks-student-fellows](https://www.figma.com/design/auWfvBwnxY9q6acMsE4xdd/Databricks-Website-Design?node-id=12378-8397)        | 1920 × 3779 |
| `/student-fellows/fellows/[slug]` | [12378:9655 — databricks-individual-fellow-page](https://www.figma.com/design/auWfvBwnxY9q6acMsE4xdd/Databricks-Website-Design?node-id=12378-9655) | 1920 × 2093 |

The original MVP and MVP directory URLs were duplicates. The separate directory was discovered programmatically as a sibling of `12378:7437`, under section `12378:6108`. Student frames share section `12378:8396`.

## Design evidence

Design evidence was captured in the local project workspace at
`docs/design/community`. These QA artifacts are maintained outside this repository.

- Full reference screenshots: `mvp.png`, `mvp-directory.png`, `student-fellows.png`, `students-list.png`, `student-profile.png`.
- Exact Plugin API measurements and visible copy: `mvp-measurements.json`, `student-fellows-measurements.json`, `student-profile-measurements.json`, `directories-measurements.json`.
- Coordinates in measurement manifests are relative to each page canvas, in pixels. They are not inferred from resized screenshots.
- Whole-page `get_design_context` responses exceeded provider size limits. Section calls recovered the MVP hero (`8376`), benefits (`7538`), requirements (`7574`), and badge (`8335`); Student hero (`11383`), campus cards (`11403`), career sections (`10500`, `10524`), and badge (`11328`); directory heading (`6112`) and card collection (`8486`); profile body (`9751`) and sidebar (`9783`). These IDs use prefix `12378:`.
- Measurement values are retained as evidence. No browser measurement manifest or machine-owned `audit.json` was produced, so these files do not certify pixel parity.

Important desktop measurements:

| Element                       | Figma geometry / type                                        |
| ----------------------------- | ------------------------------------------------------------ |
| Standard content              | x=352, width=1216 on 1920 canvas                             |
| Program headline              | x=352, y=318, width=966; DM Sans 56/56                       |
| Program badge                 | width=116; MVP height=135, Student height≈138                |
| Directory headline            | x=192, y=224, width=1344; Inter 96/96, first-line indent=160 |
| Directory intro               | x=1472, y=347, width=256; Inter 16/20                        |
| Directory filters             | y=675, height=44; two 160-wide selects, 437-wide search      |
| Directory grid                | x=352, y=779, width=1216; 4 columns, 64px gaps               |
| Directory portrait            | 256 × 255, displayed as a square media slot                  |
| Directory name / organization | Inter 20/25 and 16/20                                        |
| Student campus cards          | 3 × 384-wide, 32px gaps, 364-high; 48px vector icons         |
| Section headings              | Inter 44/55, -4% tracking                                    |
| Profile content               | x=383.5, width=736; sidebar x=1215.5, width=352; 96px gap    |
| Profile portrait              | 352 × 390.193                                                |

The implementation uses the existing `Inter`, `DM Sans`, and `Geist Mono` font setup. Directory text uses Inter; program hero text uses DM Sans. Native responsive layouts collapse grids and stack profile columns. No mobile Figma frames were supplied, so responsive checks are acceptance checks, not pixel-parity evidence.

## Implementation decisions

| Section                            | Native mode        | Implementation                                                                                                                                      |
| ---------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared header / skip link / search | Reuse              | `(website)/layout.tsx` and existing Header; no duplicate navigation shell                                                                           |
| Shared footer                      | Adapt              | Added MVP and Student Fellows program/directory links to existing Community list; increased copyright and legal-link contrast                       |
| Program heroes                     | Custom composition | `program-hero.tsx`, existing Button, local Figma badges, exact Figma copy                                                                           |
| MVP benefits                       | Custom composition | `program-benefits.tsx`, existing SectionKicker, eight content blocks                                                                                |
| Student campus cards               | Custom composition | `program-benefits.tsx`, three semantic cards with exact Figma SVG icons                                                                             |
| MVP requirements                   | Custom composition | `program-requirements.tsx`, four rows and exact exported angled SVG rule                                                                            |
| Student career pathways            | Custom composition | `program-requirements.tsx`, two numbered sections with native lists                                                                                 |
| Directory headline                 | Custom composition | `directory-hero.tsx`; shared between the two data kinds                                                                                             |
| Filters / search                   | Adapt              | Existing NativeSelect, Input, Button; native GET form, including a keyboard-operable magnifier submit button                                        |
| People cards                       | Custom composition | `person-card.tsx`, backend photographs, actual names and organization, local social glyphs                                                          |
| Pagination                         | Adapt              | Existing shadcn Pagination components, real links, current-page state and ellipses                                                                  |
| Student profile                    | Custom composition | `student-profile.tsx`, existing BackLink and SectionKicker; actual biography/highlights                                                             |
| Bottom CTA                         | Adapt              | Existing home CTA gains optional `highlightedText`; its default remains `agentic app`. Community CTA supplies Figma titles, actions, and highlights |

All substantial new sections live in `src/components/community/`. The five route files own metadata and visible section order. API fetch/schema implementation stays in the parent-owned `src/lib/community/` domain.

Small shared changes: `src/components/home/cta.tsx`, `src/components/footer.tsx`, and `src/css/custom.css`. The added `db-paper` token preserves the Figma light surface (`#f9f7f4`) inside the site's existing dark root. No dependencies, header logic, or image optimizer configuration were changed by this frontend work.

## Data and interaction contract

- Directories request published records through `getPeople`, `getFacets`, and the parent SDK. They never contain a frontend seed or synthetic participant records.
- Filters are City and Country in both directories; the native form submits `q`, `city`, and `country`.
- The list uses 20 records per page, matching the Figma four-column/five-row layout. `page`, search, and filters round-trip in the URL; submitting filters starts on page 1. Pagination preserves the active search/filter values. An out-of-range page redirects to the last available page.
- Query values are normalized from Next.js `searchParams`; page is a safe integer in 1–100000, `q` is capped at 200 characters, City/Country at 100. Cohort and Expertise remain API capabilities and are not exposed by these Figma-aligned controls.
- Student cards navigate to `/student-fellows/fellows/[slug]`. MVP cards link to an actual published external website/social profile; no unrequested MVP detail route is created.
- The profile rejects missing records and `kind !== "student"` with `notFound()`. Highlights render only when supplied by the backend. Missing biographies, organizations, expertise, locations, and social URLs do not generate invented copy.
- `CommunityApiError` produces a visible nonfatal error panel with a real reload link. Empty successful searches have their own “No matches found” state and clear-filters link. Unknown student slugs remain 404s, distinct from service outages.
- The parent SDK uses `cache: "no-store"`; admin updates are visible on subsequent navigation. Server requests use the configured backend origin and do not expose its configuration in client controls.
- Every page has a specific title, description, and canonical. Directory query URLs use `noindex, follow`; public profile pages add escaped JSON-LD using `ProfilePage`, `Person`, and educational `affiliation` (not an unsupported graduation claim). Sitemap integration is parent-owned.

Verified CTA destinations:

- [MVP nomination](https://surveys.training.databricks.com/jfe/form/SV_6Ed034QOD4pcQFU), linked from the existing [Databricks MVP page](https://www.databricks.com/discover/mvps).
- [Student Fellows application](https://airtable.com/appasC90KmqZ5x1t5/pag6tvR9VUG4Kf1iM/form), supplied by the source/data agent's verified program-link extraction.
- “Explore the Program” scrolls to `#program`; “Browse fellow profiles” navigates to the internal directory.

## Assets, accessibility, and deviations

Local assets under `public/img/community/`: MVP badge SVG; Student badge PNG; `build.svg`, `share.svg`, `learn.svg`; LinkedIn and X SVG glyphs; `membership-rule.svg`. These are actual Figma exports, not approximate redrawn icons. The Student badge is 116 × 138 PNG, matching its displayed size; a higher-resolution/vector replacement can improve high-DPI rendering later.

Participant photos always use normalized backend `photoUrl` values. Native images specify dimensions and fixed media geometry, lazy-load directory images, and eagerly load the main profile photo. The source agent reported 110 delivered photos totaling approximately 10 MB, so no frontend image optimizer or permissive remote-host rule is needed for this delivery. Future arbitrary admin uploads should retain server-side image size limits/optimization; the frontend does not enforce upload limits. Missing photos show a neutral “Photo unavailable” slot and never invent a face.

Known differences and product decisions:

1. Both directories use the Figma City/Country filters. The parent added City to the backend and SDK contract. Empty facet lists are disabled unless a currently active query value must remain clearable. City values are never inferred from institutions or invented.
2. Directory names and photos in Figma are illustrative and partly duplicated between MVP and Student designs. Actual data determines displayed records, result count, wrapping, and page height. The profile Figma contains inconsistent example location/university/achievements; none are hardcoded into a person's profile.
3. Existing Header/Footer, legal/privacy links, and product navigation take precedence over obsolete Figma shell links. Four new Community links increase footer height.
4. The default CTA was extended through a prop rather than copied. CTA window-label contrast and existing footer small-text contrast were raised after browser accessibility findings.
5. There is no invented mobile reference and no claim of full visual parity. Prime remains unconfigured and no Prime Studio mutations were made.

Keyboard/focus contracts: labelled native selects and search input; Enter or magnifier submit; normal link navigation and pagination; current-page ARIA; named social links; decorative assets with empty alt; real person-name alt text; existing skip-to-main link. Content sections remain semantic headings, paragraphs, articles, and lists.

## Verification and handoff

- Frontend `pnpm typecheck`: passed after final component changes.
- Scoped Prettier formatting: completed for all owned source files. `git diff --check`: passed.
- `pnpm exec fallow dead-code`: final rerun passed with no issues after City integration. Three SDK-only findings (`personKindSchema`, `directoryQuerySchema`, `PeoplePage`) were handed to and resolved by the parent; the frontend did not mutate parent-owned schema exports.
- `pnpm exec fallow dupes`: completed, 17 existing clone groups / about 1% duplication; no groups involved `src/components/community` or the new routes. Reports were saved in `/tmp/devhub-frontend-{dead-code,dupes}.json`.
- Local SVG files parsed as XML and contain no script elements. Badge availability and the Student badge appearance were checked.
- Parent browser review found and prompted correction of numeric Tailwind line-height syntax, missing glyph exports, profile heading colors, JSON-LD educational relation, and CTA/footer contrast. Current code contains these corrections.
- Parent subsequently reported no overflow or broken images at 390px on Student/MVP program pages, MVP directory, and a student profile. Source worker reported the six baseline integration checks passed; the expanded City/Country suite is owned by that worker.
- Parent/source worker owns the final production build, repository test suite, live desktop/mobile screenshots, automated accessibility check, and `tests/e2e/community.spec.ts`. Do not infer those final results from the typecheck or design screenshots; record their actual outcomes in the overall delivery report.

No commits, deployment, publication, Prime Studio changes, Figma edits, `.env` changes, or backend-source mutations were performed by this frontend work.

## Workbook reconciliation — 2026-09-08

The supplied MVP export includes links beyond the four primary social icons.
Cards now expose named `additionalLinks` through an accessible **More links**
menu built with the existing shadcn DropdownMenu. The menu is nonmodal, stays
inside its named navigation landmark through an optional portal container,
supports keyboard navigation and restores trigger focus on Escape. It preserves the card's
existing layout and uses real source labels and HTTPS destinations. MVP cards
with only an additional link, such as a YouTube channel, use that destination
for the name and portrait link. Student profile connections and JSON-LD also
support the same optional field.

The backend now supplies 105 MVP city values from the workbook and 127 local
photos across both programs. City filters become available from those actual
facets. No student source data changed during this reconciliation. This small
data-driven interaction extension does not establish new Figma or Prime parity
evidence. Current import and browser checks are summarized in the backend's
[verification record](https://github.com/pixel-point/devhub-backend/blob/main/docs/verification.md).

Before publication on 2026-09-08, the changes were transferred to
`feat/community-programs` from the current `origin/main` (`07e7f51`). The final
production build, 355 unit tests across 39 files and 199 browser tests passed,
including all 12 community scenarios. Formatting, typecheck and dead-code
checks passed; existing duplication remains outside the community components.
