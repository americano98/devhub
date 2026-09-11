import { ArrowUpRight } from "lucide-react";

import type { PublicPerson } from "@/lib/community/schema";
import { BackLink } from "@/components/ui/back-link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PersonLinks, PersonPhoto } from "@/components/community/person-card";
import { SectionKicker } from "@/components/products/section-kicker";

export function StudentProfile({ person }: { person: PublicPerson }) {
  return (
    <article className="mx-auto max-w-7xl px-5 pt-12 pb-10 md:px-8 xl:pb-40">
      <Breadcrumb aria-label="Breadcrumb" className="mb-14">
        <BreadcrumbList className="text-grey-60 gap-2.5">
          <BreadcrumbItem>
            <BackLink href="/student-fellows/fellows">All fellows</BackLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="font-mono text-xs text-white uppercase">
              {person.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid items-start gap-y-12 lg:grid-cols-[minmax(0,736px)_minmax(0,352px)] lg:grid-rows-[auto_1fr] lg:gap-x-24">
        <h1 className="border-grey-20 border-b pb-12 text-3xl/tight font-normal tracking-[-0.04em] md:text-4xl/tight xl:text-[2.75rem]/[1.25]">
          <span>{person.name}.</span>
          {person.headline ? (
            <>
              <br />
              <span className="text-white/60">[{person.headline}]</span>
            </>
          ) : null}
        </h1>
        <aside
          aria-label="Fellow details"
          className="grid min-w-0 gap-10 md:grid-cols-2 md:gap-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block lg:pt-3"
        >
          <PersonPhoto
            person={person}
            eager
            className="bg-grey-12 aspect-[352/390] max-w-88"
          />
          <div className="min-w-0">
            <dl className="divide-grey-20 divide-y lg:mt-12">
              {[
                ["Based in", person.country],
                ["Studying at", person.organization],
                ["Cohort", person.cohort],
              ]
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label} className="py-5 first:pt-0 md:py-7">
                    <dt>
                      <SectionKicker font="sans" className="text-white/30">
                        {label}
                      </SectionKicker>
                    </dt>
                    <dd className="mt-4.5 text-xl tracking-tight md:text-2xl/snug">
                      {value}
                    </dd>
                  </div>
                ))}
            </dl>
            {Object.values(person.links).some(Boolean) ||
            person.additionalLinks.length ? (
              <div className="border-grey-20 border-t pt-7">
                <SectionKicker font="sans" className="text-white/30">
                  Connect
                </SectionKicker>
                <PersonLinks person={person} className="mt-6 gap-5" />
              </div>
            ) : null}
          </div>
        </aside>
        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          {person.bio ? (
            <section aria-labelledby="fellow-about">
              <h2 id="fellow-about" className="text-2xl/normal font-medium">
                About
              </h2>
              <div className="text-grey-90 mt-6 flex flex-col gap-6 text-lg/normal tracking-tight">
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
              <h2
                id="fellow-highlights"
                className="text-2xl/normal font-medium"
              >
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
                      <p className="text-grey-90 mt-2.5 text-lg/normal tracking-tight whitespace-pre-line">
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
              <h2 id="fellow-interests" className="text-2xl/normal font-medium">
                Expertise
              </h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {person.expertise.map((skill) => (
                  <li
                    key={skill}
                    className="border-grey-20 text-grey-90 border px-3 py-2 text-sm"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </article>
  );
}
