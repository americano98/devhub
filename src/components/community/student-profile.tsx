import { ArrowUpRight } from "lucide-react";

import type { PublicPerson } from "@/lib/community/schema";
import { BackLink } from "@/components/ui/back-link";
import { PersonLinks, PersonPhoto } from "@/components/community/person-card";
import { SectionKicker } from "@/components/products/section-kicker";

export function StudentProfile({ person }: { person: PublicPerson }) {
  return (
    <article className="mx-auto max-w-320 px-5 pt-12 pb-24 md:px-8 lg:pb-40">
      <nav
        aria-label="Breadcrumb"
        className="text-grey-60 mb-14 flex flex-wrap items-center gap-2.5"
      >
        <BackLink href="/student-fellows/fellows">Back</BackLink>
        <span aria-hidden="true">/</span>
        <span className="font-mono text-xs uppercase">
          Individual fellow page
        </span>
      </nav>
      <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,736px)_minmax(0,352px)] lg:gap-24">
        <div className="min-w-0">
          <h1 className="border-grey-20 border-b pb-12 text-3xl/[1.25] font-normal tracking-[-0.04em] md:text-4xl/[1.25] xl:text-[2.75rem]/[1.25]">
            <span>{person.name}.</span>
            {person.headline ? (
              <>
                <br />
                <span className="text-grey-70">[{person.headline}]</span>
              </>
            ) : null}
          </h1>
          {person.bio ? (
            <section aria-labelledby="fellow-about" className="mt-12">
              <h2 id="fellow-about" className="text-2xl/[1.5] font-medium">
                About
              </h2>
              <div className="text-grey-70 mt-6 flex flex-col gap-6 text-lg/[1.5] tracking-tight">
                {person.bio
                  .split(/\n\s*\n/)
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p className="whitespace-pre-line" key={index}>
                      {paragraph}
                    </p>
                  ))}
              </div>
            </section>
          ) : null}
          {person.highlights.length ? (
            <section className="mt-12" aria-labelledby="fellow-highlights">
              <h2 id="fellow-highlights" className="text-2xl/[1.5] font-medium">
                Highlights
              </h2>
              <div className="mt-6 space-y-12">
                {person.highlights.map((highlight, index) => (
                  <article
                    key={`${highlight.title}-${index}`}
                    className="flex items-start gap-4"
                  >
                    <span
                      className="bg-orange mt-2.5 size-2 shrink-0"
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="text-xl/7 font-medium">
                        {highlight.url ? (
                          <a
                            href={highlight.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-orange inline-flex items-center gap-2"
                          >
                            {highlight.title}
                            <ArrowUpRight
                              className="size-4"
                              aria-hidden="true"
                            />
                          </a>
                        ) : (
                          highlight.title
                        )}
                      </h3>
                      <p className="text-grey-70 mt-2.5 text-lg/[1.5] tracking-tight whitespace-pre-line">
                        {highlight.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
          {person.expertise.length ? (
            <section className="mt-12" aria-labelledby="fellow-interests">
              <h2 id="fellow-interests" className="text-2xl/[1.5] font-medium">
                Expertise
              </h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {person.expertise.map((skill) => (
                  <li
                    key={skill}
                    className="border-grey-20 text-grey-70 border px-3 py-2 text-sm"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        <aside aria-label="Fellow details" className="min-w-0 lg:pt-3">
          <PersonPhoto
            person={person}
            eager
            className="bg-grey-12 aspect-[352/390] max-w-88"
          />
          <dl className="divide-grey-20 mt-12 divide-y">
            {[
              [
                "Based in",
                [person.city, person.country].filter(Boolean).join(", "),
              ],
              ["Studying at", person.organization],
              ["Cohort", person.cohort],
            ]
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label} className="py-7 first:pt-0">
                  <dt>
                    <SectionKicker className="text-grey-50">
                      {label}
                    </SectionKicker>
                  </dt>
                  <dd className="mt-4.5 text-2xl/[1.375] tracking-tight">
                    {value}
                  </dd>
                </div>
              ))}
          </dl>
          {Object.values(person.links).some(Boolean) ||
          person.additionalLinks.length ? (
            <div className="border-grey-20 border-t pt-7">
              <SectionKicker className="text-grey-50">Connect</SectionKicker>
              <PersonLinks
                person={person}
                theme="dark"
                className="mt-4.5 gap-5"
              />
            </div>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
