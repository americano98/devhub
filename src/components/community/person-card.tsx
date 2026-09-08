import Link from "next/link";
import { ArrowUpRight, Globe } from "lucide-react";

import type { PublicPerson } from "@/lib/community/schema";
import { cn } from "@/lib/utils";
import { MorePersonLinks } from "@/components/community/more-person-links";
import { Icons } from "@/components/icons";

export function PersonLinks({
  person,
  className,
  theme = "light",
}: {
  person: PublicPerson;
  className?: string;
  theme?: "light" | "dark";
}) {
  return (
    <div className={cn("flex shrink-0 items-center gap-3", className)}>
      {Object.entries(person.links).map(([kind, href]) => {
        if (!href) return null;
        const Icon = kind === "github" ? Icons.github : Globe;
        return (
          <a
            key={kind}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${person.name} on ${kind === "x" ? "X" : kind === "website" ? "their website" : kind === "linkedin" ? "LinkedIn" : "GitHub"}`}
            className="hover:text-db-lava focus-visible:outline-db-lava inline-flex min-h-8 min-w-6 items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {kind === "linkedin" || kind === "x" ? (
              <img
                src={`/img/community/${kind}.svg`}
                alt=""
                width={20}
                height={20}
                className={cn("size-5", theme === "light" && "brightness-0")}
              />
            ) : (
              <Icon className="size-5" aria-hidden="true" />
            )}
          </a>
        );
      })}
      {person.additionalLinks.length > 0 && (
        <MorePersonLinks name={person.name} links={person.additionalLinks} />
      )}
    </div>
  );
}

export function PersonPhoto({
  person,
  className,
  eager = false,
}: {
  person: PublicPerson;
  className?: string;
  eager?: boolean;
}) {
  return (
    <div
      className={cn(
        "aspect-square w-full overflow-hidden bg-black/5",
        className,
      )}
    >
      {person.photoUrl ? (
        <img
          src={person.photoUrl}
          alt={person.name}
          width={352}
          height={352}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover object-top grayscale"
        />
      ) : (
        <div className="bg-grey-80/30 text-grey-40 flex h-full min-h-44 items-center justify-center p-4 text-center text-sm">
          Photo unavailable
        </div>
      )}
    </div>
  );
}

export function PersonCard({ person }: { person: PublicPerson }) {
  const href =
    person.kind === "student"
      ? `/student-fellows/fellows/${person.slug}`
      : person.links.website ||
        person.links.linkedin ||
        person.links.github ||
        person.links.x ||
        person.additionalLinks[0]?.url;
  const external = person.kind === "mvp";
  const content = (
    <>
      <PersonPhoto person={person} />
      {href ? (
        <span className="bg-orange absolute top-0 right-0 grid size-11 place-items-center text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <ArrowUpRight className="size-7" aria-hidden="true" />
        </span>
      ) : null}
      <h2 className="mt-3 text-xl/6 font-normal tracking-tight">
        {person.name}
      </h2>
      {person.organization || person.headline ? (
        <p
          className="text-grey-40 mt-1 truncate text-base/5 tracking-tight"
          title={person.organization || person.headline}
        >
          {person.organization || person.headline}
        </p>
      ) : null}
    </>
  );
  return (
    <article className="min-w-0">
      {href ? (
        <Link
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="group focus-visible:outline-db-lava relative block text-black no-underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {content}
        </Link>
      ) : (
        <div>{content}</div>
      )}
      <div className="mt-3 flex min-h-10 items-center justify-between gap-2 border-t border-black/15 pt-2">
        {person.country ? (
          <p className="text-grey-40 flex min-w-0 items-center gap-1.5 text-sm/none tracking-tight uppercase">
            <span className="bg-orange size-1.5 shrink-0" aria-hidden="true" />
            <span className="truncate" title={person.country}>
              [{person.country}]
            </span>
          </p>
        ) : (
          <span />
        )}
        <PersonLinks person={person} />
      </div>
    </article>
  );
}
