"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import type { PeopleFacets, PersonKind } from "@/lib/community/schema";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { DirectoryFilter } from "@/components/community/directory-filter";
import {
  directoryHref,
  readDirectoryQuery,
  type DirectorySearchParams,
} from "@/components/community/directory-query";

export function DirectoryFilters({
  kind,
  params,
  facets,
}: {
  kind: PersonKind;
  params: DirectorySearchParams;
  facets: PeopleFacets;
}) {
  const query = readDirectoryQuery(params, kind);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(query.q || "");
  const [previousQuery, setPreviousQuery] = useState(query.q);
  if (previousQuery !== query.q) {
    setPreviousQuery(query.q);
    setSearch(query.q || "");
  }
  const input = useRef<HTMLInputElement>(null);
  return (
    <form
      action={directoryHref(kind, {})}
      method="get"
      aria-busy={pending}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const href = directoryHref(kind, {
          q: String(data.get("q") || ""),
          city: String(data.get("city") || ""),
          country: String(data.get("country") || ""),
        });
        startTransition(() => router.push(href, { scroll: false }));
      }}
      role="search"
      aria-label={kind === "student" ? "Find student fellows" : "Find MVPs"}
    >
      <fieldset disabled={pending} className="min-w-0">
        <FieldGroup className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-7.5">
          <span className="shrink-0 text-base text-black">Filter by:</span>
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
              <Field key={filter.name} className="w-40 shrink-0">
                <FieldLabel
                  htmlFor={kind + "-" + filter.name}
                  className="sr-only"
                >
                  {filter.label}
                </FieldLabel>
                <DirectoryFilter
                  id={kind + "-" + filter.name}
                  name={filter.name === "city" ? "city" : "country"}
                  label={filter.label}
                  options={filter.options}
                  value={filter.value}
                />
              </Field>
            ))}
          </div>
          <Field className="w-full lg:ml-auto lg:max-w-109.25">
            <FieldLabel htmlFor={kind + "-search"} className="sr-only">
              Search by name or expertise
            </FieldLabel>
            <InputGroup className="border-grey-80 bg-db-oat-medium h-11 rounded-none text-black shadow-none dark:bg-black/4">
              <InputGroupInput
                ref={input}
                type="search"
                id={kind + "-search"}
                name="q"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                maxLength={200}
                placeholder="Search by name or expertise"
                className="placeholder:text-grey-60 text-base tracking-tight text-black md:text-base dark:text-black [&::-webkit-search-cancel-button]:appearance-none"
              />
              <InputGroupAddon>
                <InputGroupButton
                  type="submit"
                  size="icon-sm"
                  aria-label="Search and apply filters"
                  className="text-grey-70 hover:bg-transparent hover:text-black dark:hover:bg-transparent [&_svg:not([class*='size-'])]:size-5"
                >
                  <Search aria-hidden="true" />
                </InputGroupButton>
              </InputGroupAddon>
              {search ? (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-sm"
                    aria-label="Clear search"
                    className="text-grey-80 hover:bg-transparent hover:text-black dark:hover:bg-transparent [&_svg:not([class*='size-'])]:size-5"
                    onClick={() => {
                      setSearch("");
                      if (input.current) {
                        input.current.value = "";
                        input.current.focus();
                        input.current.form?.requestSubmit();
                      }
                    }}
                  >
                    <X aria-hidden="true" />
                  </InputGroupButton>
                </InputGroupAddon>
              ) : null}
            </InputGroup>
          </Field>
        </FieldGroup>
      </fieldset>
      <span className="sr-only" role="status">
        {pending ? "Updating results" : ""}
      </span>
    </form>
  );
}
