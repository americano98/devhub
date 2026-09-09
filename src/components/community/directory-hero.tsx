import type { PersonKind } from "@/lib/community/schema";

export function DirectoryHero({ kind }: { kind: PersonKind }) {
  const mvp = kind === "mvp";
  return (
    <section className="bg-black pt-16 pb-20 text-white md:pt-24 md:pb-28 xl:pt-40 xl:pb-29">
      <div className="relative mx-auto max-w-400 px-5 md:px-8">
        <h1 className="max-w-240 font-sans text-4xl/none font-normal tracking-normal text-pretty md:text-6xl/none xl:indent-20 xl:text-7xl/none 2xl:max-w-336 2xl:indent-40 2xl:text-8xl/none">
          <span className="text-db-lava">
            {mvp ? "Meet the MVPs." : "Student Fellows."}
          </span>{" "}
          {mvp
            ? "[The people behind the impact.]"
            : "[Meet the next generation of AI.]"}
        </h1>
        <p className="text-grey-70 mt-6 max-w-80 text-base/tight text-pretty xl:absolute xl:right-8 xl:bottom-2 xl:max-w-64">
          {mvp
            ? "Meet experts who share knowledge, build community, and grow the Databricks ecosystem."
            : "Meet the students building, learning, and shaping the future of data and AI."}
        </p>
      </div>
    </section>
  );
}
