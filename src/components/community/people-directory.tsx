import Link from "next/link";
import { redirect } from "next/navigation";

import {
  CommunityApiError,
  getFacets,
  getPeople,
} from "@/lib/community/people.server";
import type { PersonKind } from "@/lib/community/schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { DirectoryFilters } from "@/components/community/directory-filters";
import {
  directoryHref,
  readDirectoryQuery,
  type DirectorySearchParams,
} from "@/components/community/directory-query";
import { PersonCard } from "@/components/community/person-card";

export function CommunityUnavailable({ href }: { href: string }) {
  return (
    <div
      role="status"
      className="border-grey-60/30 mx-auto max-w-304 border px-6 py-12 text-center"
    >
      <h2 className="text-2xl font-medium">
        The community directory is temporarily unavailable.
      </h2>
      <p className="mt-3 text-base">Please try again in a moment.</p>
      <Button
        asChild
        variant="orange"
        size="xl"
        className="mt-6 font-mono uppercase"
      >
        <a href={href}>Try again</a>
      </Button>
    </div>
  );
}

function DirectoryPagination({
  kind,
  params,
  page,
  totalPages,
}: {
  kind: PersonKind;
  params: DirectorySearchParams;
  page: number;
  totalPages: number;
}) {
  if (totalPages < 2) return null;
  const pages = Array.from(new Set([1, page - 1, page, page + 1, totalPages]))
    .filter((n) => n > 0 && n <= totalPages)
    .sort((a, b) => a - b);
  const linkClass =
    "rounded-none text-black hover:bg-black/5 hover:text-black dark:hover:bg-black/5";
  return (
    <Pagination className="mt-12 md:mt-22" aria-label="Directory pages">
      <PaginationContent className="flex-wrap justify-center gap-1 sm:gap-3">
        {page > 1 ? (
          <PaginationItem>
            <PaginationPrevious
              href={directoryHref(kind, params, page - 1)}
              className={cn(
                linkClass,
                "text-grey-50 hover:bg-transparent dark:hover:bg-transparent",
              )}
            />
          </PaginationItem>
        ) : null}
        {pages.map((number, index) => (
          <PaginationItem
            key={number}
            className="flex items-center gap-1 sm:gap-3"
          >
            {index > 0 && number - pages[index - 1] > 1 ? (
              <PaginationEllipsis />
            ) : null}
            <PaginationLink
              href={directoryHref(kind, params, number)}
              isActive={page === number}
              aria-label={`Page ${number}`}
              className={cn(
                linkClass,
                page === number &&
                  "bg-orange hover:bg-orange dark:bg-orange dark:hover:bg-orange border-0 text-white shadow-none hover:text-white",
              )}
            >
              {number}
            </PaginationLink>
          </PaginationItem>
        ))}
        {page < totalPages ? (
          <PaginationItem>
            <PaginationNext
              href={directoryHref(kind, params, page + 1)}
              className={cn(
                linkClass,
                "text-grey-50 hover:bg-transparent dark:hover:bg-transparent",
              )}
            />
          </PaginationItem>
        ) : null}
      </PaginationContent>
    </Pagination>
  );
}

export async function PeopleDirectory({
  kind,
  params,
}: {
  kind: PersonKind;
  params: DirectorySearchParams;
}) {
  const query = readDirectoryQuery(params, kind);
  let result;
  try {
    result = await Promise.all([getPeople(query), getFacets(kind)]);
  } catch (error) {
    if (!(error instanceof CommunityApiError)) throw error;
    return (
      <section className="mx-auto max-w-7xl px-5 pt-16 pb-10 md:px-8 lg:pt-22">
        <CommunityUnavailable href={directoryHref(kind, params, query.page)} />
      </section>
    );
  }
  const [people, facets] = result;
  if (people.totalPages > 0 && query.page > people.totalPages)
    redirect(directoryHref(kind, params, people.totalPages));
  return (
    <section
      aria-label={
        kind === "student" ? "Student fellows directory" : "MVP directory"
      }
      className="mx-auto max-w-7xl px-5 pt-16 md:px-8 lg:pt-22"
    >
      <DirectoryFilters kind={kind} params={params} facets={facets} />
      <p className="sr-only" role="status" aria-label="Directory results">
        {people.total} {kind === "student" ? "student fellows" : "MVPs"}
        {query.q ? ` matching “${query.q}”` : ""}
      </p>
      {people.items.length ? (
        <div className="mt-15 grid grid-cols-1 gap-x-8 gap-y-14 min-[480px]:grid-cols-2 lg:grid-cols-4 xl:gap-x-16 xl:gap-y-16">
          {people.items.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <h2 className="text-2xl">No matches found</h2>
          <p className="text-grey-40 mt-3">
            Try another search or clear your filters.
          </p>
          <Button
            asChild
            variant="orange"
            size="xl"
            className="mt-6 font-mono uppercase"
          >
            <Link href={directoryHref(kind, {})} scroll={false}>
              Clear filters
            </Link>
          </Button>
        </div>
      )}
      <DirectoryPagination
        kind={kind}
        params={params}
        page={people.page}
        totalPages={people.totalPages}
      />
    </section>
  );
}
