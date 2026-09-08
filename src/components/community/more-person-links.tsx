"use client";

import { useState } from "react";
import { ArrowUpRight, Ellipsis } from "lucide-react";

import type { PublicPerson } from "@/lib/community/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MorePersonLinks({
  name,
  links,
}: {
  name: string;
  links: PublicPerson["additionalLinks"];
}) {
  const [menuContainer, setMenuContainer] = useState<HTMLElement | null>(null);

  return (
    <nav ref={setMenuContainer} aria-label={`Additional links for ${name}`}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`More links for ${name}`}
            className="hover:text-db-lava focus-visible:outline-db-lava inline-flex min-h-8 min-w-6 items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <Ellipsis className="size-5" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        {menuContainer && (
          <DropdownMenuContent
            align="end"
            className="max-w-72"
            portalContainer={menuContainer}
          >
            {links.map(({ label, url }, index) => (
              <DropdownMenuItem key={`${url}-${index}`} asChild>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-10"
                >
                  <span className="min-w-0 break-words">{label}</span>
                  <ArrowUpRight className="ml-auto size-4" aria-hidden="true" />
                </a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </nav>
  );
}
