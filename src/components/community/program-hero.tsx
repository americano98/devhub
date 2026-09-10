import Image from "next/image";
import Link from "next/link";

import type { PersonKind } from "@/lib/community/schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MVP_NOMINATION_URL } from "@/components/community/community-cta";

export function ProgramHero({ kind }: { kind: PersonKind }) {
  const mvp = kind === "mvp";
  return (
    <section
      className={cn(
        "mx-auto max-w-7xl px-5 pt-12 md:px-8 md:pt-18",
        mvp ? "xl:pt-21.75" : "xl:pt-21",
      )}
    >
      <Image
        src={
          mvp
            ? "/img/community/mvp-badge.svg"
            : "/img/community/student-badge.svg"
        }
        alt={mvp ? "Databricks MVP" : "Databricks Student Fellows"}
        width={116}
        height={mvp ? 135 : 138}
        priority
        loading="eager"
        className="mb-8 h-auto w-29 object-contain"
      />
      <h1 className="font-heading max-w-3xl text-4xl/none font-normal tracking-normal text-pretty md:text-5xl/none xl:max-w-241.5 xl:text-[3.5rem]/none">
        <span className="text-db-lava">
          {mvp ? "Databricks MVPs." : "Student fellows."}
        </span>{" "}
        {mvp
          ? "How Databricks recognizes and supports experts in the Data + AI community."
          : "Turn your data expertise into a career in AI."}
      </h1>
      <div className="mt-4.5 flex flex-col justify-between gap-6 border-t border-white/16 pt-4.5 lg:flex-row lg:items-start">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-5">
          <Button
            asChild
            size="xl"
            className="bg-white px-5 font-mono text-sm font-medium tracking-tight text-black uppercase hover:bg-white/90 md:text-base"
          >
            <Link href={mvp ? MVP_NOMINATION_URL : "/student-fellows/fellows"}>
              {mvp ? "Nominate a Peer" : "Browse fellow profiles"}
            </Link>
          </Button>
          <Button
            asChild
            size="xl"
            className="bg-grey-20 hover:bg-grey-30 font-mono text-sm font-medium tracking-tight text-white uppercase md:text-base"
          >
            {mvp ? (
              <Link href="/mvps/directory">Browse MVP profiles</Link>
            ) : (
              <a href="#program">Explore the Program</a>
            )}
          </Button>
        </div>
        <p className="text-grey-70 max-w-80 text-base/5 text-pretty lg:pt-1">
          {mvp
            ? "Recognizing those who share knowledge and grow the community."
            : "Learn from Databricks experts and build real-world data and AI skills."}
        </p>
      </div>
    </section>
  );
}
