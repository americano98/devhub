import { redirect } from "next/navigation";
import { Search } from "lucide-react";

import {
  CommunityApiError,
  getFacets,
  getPeople,
} from "@/lib/community/people.server";
import type { PeopleFacets, PersonKind } from "@/lib/community/schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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

function DirectoryFilters({
  kind,
  params,
  facets,
}: {
  kind: PersonKind;
  params: DirectorySearchParams;
  facets: PeopleFacets;
}) {
  const query = readDirectoryQuery(params, kind);
  return (
    <form
      action={directoryHref(kind, {})}
      method="get"
      role="search"
      aria-label={kind === "student" ? "Find student fellows" : "Find MVPs"}
      className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-7.5"
    >
      <span className="text-base">Filter by:</span>
      <div className="flex flex-wrap gap-2.5">
        {[
          {
            name: "city",
            label: "City",
            options: facets.cities,
            value: query.city,
          },
          {
            name: "country",
            label: "Country",
            options: facets.countries,
            value: query.country,
          },
        ].map((filter) => (
          <label key={filter.name}>
            <span className="sr-only">{filter.label}</span>
            <NativeSelect
              name={filter.name}
              defaultValue={filter.value || ""}
              disabled={filter.options.length === 0 && !filter.value}
              className="h-11 w-40 rounded-none border-black/15 bg-black/4 text-black shadow-none dark:bg-black/4 dark:hover:bg-black/8"
            >
              <NativeSelectOption value="">
                {filter.name === "city" ? "All cities" : "All countries"}
              </NativeSelectOption>
              {filter.value && !filter.options.includes(filter.value) ? (
                <NativeSelectOption value={filter.value}>
                  {filter.value}
                </NativeSelectOption>
              ) : null}
              {filter.options.map((option) => (
                <NativeSelectOption key={option} value={option}>
                  {option}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
        ))}
      </div>
      <div className="relative w-full lg:ml-auto lg:max-w-109.25">
        <label htmlFor={`${kind}-search`} className="sr-only">
          Search by name or expertise
        </label>
        <Input
          key={query.q || ""}
          type="search"
          id={`${kind}-search`}
          name="q"
          defaultValue={query.q || ""}
          maxLength={200}
          placeholder="Search by name or expertise"
          className="placeholder:text-grey-40 h-11 rounded-none border-black/15 bg-black/4 pl-11 text-black shadow-none dark:bg-black/4"
        />
        <Button
          type="submit"
          variant="ghost"
          aria-label="Search and apply filters"
          className="text-grey-40 absolute top-0 left-0 size-11 rounded-none hover:bg-black/10 hover:text-black dark:hover:bg-black/10"
        >
          <Search className="size-5" aria-hidden="true" />
        </Button>
      </div>
    </form>
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
    <Pagination className="mt-16 md:mt-22" aria-label="Directory pages">
      <PaginationContent className="gap-1 sm:gap-3">
        {page > 1 ? (
          <PaginationItem>
            <PaginationPrevious
              href={directoryHref(kind, params, page - 1)}
              className={linkClass}
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
                  "border-orange bg-orange hover:bg-orange dark:bg-orange text-black shadow-none",
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
              className={linkClass}
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
      <section className="mx-auto max-w-320 px-5 pt-16 pb-10 md:px-8 lg:pt-22">
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
      className="mx-auto max-w-320 px-5 pt-16 md:px-8 lg:pt-22"
    >
      <DirectoryFilters kind={kind} params={params} facets={facets} />
      <p className="sr-only" role="status">
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
            <a href={directoryHref(kind, {})}>Clear filters</a>
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
