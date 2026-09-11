import { SectionKicker } from "@/components/products/section-kicker";

const mvpBenefits = [
  [
    "Join the MVP\nCommunity",
    "Connect with other Databricks MVPs through a dedicated private community.",
  ],
  [
    "Connect With\nExperts",
    "Connect directly with Databricks and open source product managers and engineers.",
  ],
  [
    "Get Early\nAccess",
    "Try out new features and products before they are released and early roadmap access.",
  ],
  [
    "Receive monthly\ncredits",
    "Get monthly credits to develop content and create demos.",
  ],
  [
    "Attend Data + AI\nSummit",
    "Attend the annual Databricks Data + AI Summit with complimentary passes.",
  ],
  [
    "Share Your\nExpertise",
    "Get opportunities to share your expertise at events, like Data + AI Summit.",
  ],
  [
    "Showcase Your\nMVP Status",
    "Showcase your MVP status with an official badge across your social profiles and website.",
  ],
  [
    "Earn Community\nRecognition",
    "Get featured across Databricks’ website and social media channels.",
  ],
];

export function MVPBenefits() {
  return (
    <section
      id="program"
      aria-labelledby="mvp-benefits"
      className="mx-auto max-w-7xl scroll-mt-24 px-5 pt-28 pb-24 md:px-8 md:pt-40 md:pb-32 xl:pt-60 xl:pb-40"
    >
      <SectionKicker className="text-grey-50">Program Benefits</SectionKicker>
      <h2
        id="mvp-benefits"
        className="mt-6 max-w-240 text-3xl/tight font-normal tracking-[-0.04em] md:text-4xl/tight xl:text-[2.75rem]/[1.25]"
      >
        See what MVPs get from the program.
        <br />
        <span className="text-grey-70">
          [Connect, contribute, and grow your impact.]
        </span>
      </h2>
      <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
        {mvpBenefits.map(([title, description]) => (
          <article key={title} className="border-grey-20 border-t pt-7">
            <h3 className="text-2xl/tight font-medium tracking-tight text-pretty lg:whitespace-pre-line xl:text-[1.75rem]/[1.25]">
              {title}
            </h3>
            <p className="mt-3 text-base/6 tracking-[-0.04em] text-pretty text-white/80 sm:max-w-64">
              {title === "Share Your\nExpertise" ? (
                <>
                  Get opportunities to share your expertise at events, like{" "}
                  <a
                    href="https://www.databricks.com/dataaisummit"
                    className="text-orange underline-offset-4 hover:underline"
                  >
                    Data + AI Summit
                  </a>
                  .
                </>
              ) : (
                description
              )}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

const campusBenefits = [
  {
    icon: "build",
    title: "Build together",
    description:
      "Host hackathons where students can explore real-world data and AI challenges together.",
  },
  {
    icon: "share",
    title: "Share knowledge",
    description:
      "Bring data and AI topics to your campus through technical talks and discussions.",
  },
  {
    icon: "learn",
    title: "Learn together",
    description:
      "Create opportunities for students to learn and explore data and AI skills together.",
  },
];

export function CampusBenefits() {
  return (
    <section
      id="program"
      aria-labelledby="campus-benefits"
      className="mx-auto max-w-7xl scroll-mt-24 px-5 pt-28 pb-24 md:px-8 md:pt-40 md:pb-32 xl:pt-60 xl:pb-40"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <SectionKicker className="text-grey-40 shrink-0">
          On campus
        </SectionKicker>
        <h2
          id="campus-benefits"
          className="mt-6 text-3xl/tight font-normal tracking-[-0.04em] text-pretty md:text-4xl/tight lg:mt-0 xl:text-[2.75rem]/[1.25]"
        >
          Bring data and AI to your campus.
        </h2>
      </div>
      <p className="text-grey-70 text-3xl/tight tracking-[-0.04em] text-pretty md:text-4xl/tight lg:mt-0 xl:text-[2.75rem]/[1.25]">
        Fellows share what they learn through events and activities that bring
        students together around data and AI.
      </p>
      <div className="mt-11 grid gap-6 md:mt-14 md:grid-cols-3 md:gap-3 lg:mt-12 lg:gap-8 xl:mt-14">
        {campusBenefits.map(({ icon, title, description }) => (
          <article
            key={icon}
            className="border-grey-60 relative min-h-0 overflow-hidden border p-4.5 md:min-h-64 md:p-5 lg:p-6 xl:p-8 xl:pr-6"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(45deg,rgb(255_255_255/0.035)_0px,rgb(255_255_255/0.035)_1px,transparent_1px,transparent_8px)]"
            />
            <div className="relative">
              <img
                src={`/img/community/${icon}.svg`}
                alt=""
                width={48}
                height={48}
                className="size-12"
              />
              <h3 className="mt-12 text-lg/tight font-medium tracking-normal md:mt-15 md:text-xl/tight lg:mt-18 lg:text-2xl/tight xl:text-[1.75rem]/tight 2xl:mt-29">
                {title}
              </h3>
              <p className="text-grey-70 mt-1.5 max-w-80 text-base tracking-normal text-pretty md:mt-2 md:max-w-100 md:text-lg/normal lg:mt-2.5 xl:mt-3 xl:text-xl/normal">
                {description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
