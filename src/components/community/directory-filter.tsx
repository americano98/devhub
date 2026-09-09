"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DirectoryFilter({
  id,
  name,
  label,
  options,
  value,
}: {
  id: string;
  name: "city" | "country";
  label: string;
  options: string[];
  value?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const choices =
    value && !options.includes(value) ? [value, ...options] : options;
  const visible = choices.filter((option) =>
    option.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  );
  const placeholder = name === "country" ? "Search countries" : "Search cities";
  function apply(next: string) {
    if (!input.current) return;
    input.current.value = next;
    input.current.form?.requestSubmit();
    setOpen(false);
    setSearch("");
  }
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setSearch("");
      }}
    >
      <input
        key={value || ""}
        ref={input}
        type="hidden"
        name={name}
        defaultValue={value || ""}
      />
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-label={label}
          disabled={choices.length === 0}
          className="bg-db-oat-medium hover:bg-db-oat-medium hover:border-grey-60 dark:bg-db-oat-medium dark:hover:bg-db-oat-medium text-grey-40 hover:text-grey-20 border-grey-80 dark:border-grey-80 h-11 w-40 justify-start gap-1.5 rounded-none px-3 text-base font-normal shadow-none disabled:opacity-100"
        >
          {label}
          {value && (
            <Badge
              className="bg-orange size-5 rounded-none border-0 p-0 text-sm font-normal text-white"
              aria-label="1 selected"
            >
              1
            </Badge>
          )}
          <img
            src="/img/community/select-arrow.svg"
            alt=""
            width={9}
            height={8}
            className={cn("ml-auto h-2 w-2.25", !open && "rotate-180")}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={13}
        collisionPadding={16}
        aria-label={`${label} filter`}
        className="bg-db-oat-medium flex max-h-(--radix-popover-content-available-height) w-64 max-w-[calc(100vw-32px)] flex-col gap-0 rounded-none border-black/20 p-0 text-black shadow-none"
      >
        <Field className="p-3 pb-0">
          <FieldLabel htmlFor={`${id}-search`} className="sr-only">
            {placeholder}
          </FieldLabel>
          <InputGroup className="bg-db-paper dark:bg-db-paper h-10 rounded-none border-black/20 shadow-none">
            <InputGroupInput
              id={`${id}-search`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={placeholder}
              className="text-base tracking-tight placeholder:text-black/40 md:text-base"
            />
            <InputGroupAddon>
              <img
                src="/img/community/filter-search.svg"
                alt=""
                width={16}
                height={16}
                className="size-4"
              />
            </InputGroupAddon>
          </InputGroup>
        </Field>
        <FieldSet className="mt-5 mb-3 min-h-0 gap-0">
          <FieldLegend className="sr-only">{label}</FieldLegend>
          <FieldGroup className="max-h-49 [scrollbar-width:thin] [scrollbar-color:var(--color-grey-60)_transparent] gap-1 overflow-y-auto overscroll-contain px-4">
            {visible.map((option) => (
              <Field
                key={option}
                orientation="horizontal"
                className="min-h-9 gap-2.5 py-1.5"
              >
                <Checkbox
                  id={`${id}-${option}`}
                  checked={value === option}
                  onCheckedChange={(checked) => apply(checked ? option : "")}
                  indicatorIcon={
                    <img
                      src="/img/community/filter-check.svg"
                      alt=""
                      width={16}
                      height={15}
                      className="h-3.75 w-4"
                    />
                  }
                  className="data-[state=checked]:bg-orange data-[state=checked]:border-orange dark:data-[state=checked]:bg-orange size-5 rounded-none border-black/40 bg-transparent shadow-none dark:bg-transparent"
                />
                <FieldLabel
                  htmlFor={`${id}-${option}`}
                  className="cursor-pointer text-base leading-[1.375] font-normal wrap-anywhere"
                >
                  {option}
                </FieldLabel>
              </Field>
            ))}
            {!visible.length && (
              <p className="py-4 text-sm text-black/60" role="status">
                No matches found
              </p>
            )}
          </FieldGroup>
        </FieldSet>
        <Button
          type="button"
          variant="ghost"
          disabled={!value}
          onClick={() => apply("")}
          className="h-9.75 shrink-0 justify-start rounded-none border-t border-black/20 px-4 text-base font-normal tracking-tight text-black/40 hover:bg-black/5 hover:text-black/60 disabled:opacity-100 dark:hover:bg-black/5"
        >
          Clear all
        </Button>
      </PopoverContent>
    </Popover>
  );
}
