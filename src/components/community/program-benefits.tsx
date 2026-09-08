import { SectionKicker } from "@/components/products/section-kicker";

const mvpBenefits = [
  [
    "Join the MVP Community",
    "Connect with other Databricks MVPs through a dedicated private community.",
  ],
  [
    "Connect With Experts",
    "Connect directly with Databricks and open source product managers and engineers.",
  ],
  [
    "Get Early Access",
    "Try out new features and products before they are released and early roadmap access.",
  ],
  [
    "Receive monthly credits",
    "Get monthly credits to develop content and create demos.",
  ],
  [
    "Attend Data + AI Summit",
    "Attend the annual Databricks Data + AI Summit with complimentary passes.",
  ],
  [
    "Share Your Expertise",
    "Get opportunities to share your expertise at events, like Data + AI Summit.",
  ],
  [
    "Showcase Your MVP Status",
    "Showcase your MVP status with an official badge across your social profiles and website.",
  ],
  [
    "Earn Community Recognition",
    "Get featured across Databricks’ website and social media channels.",
  ],
];

export function MVPBenefits() {
  return (
    <section
      id="program"
      aria-labelledby="mvp-benefits"
      className="mx-auto max-w-320 scroll-mt-24 px-5 pt-28 pb-24 md:px-8 md:pt-40 md:pb-32 xl:pt-60 xl:pb-40"
    >
      <SectionKicker className="text-grey-50">Program Benefits</SectionKicker>
      <h2
        id="mvp-benefits"
        className="mt-6 max-w-240 text-3xl/[1.25] font-normal tracking-[-0.04em] md:text-4xl/[1.25] xl:text-[2.75rem]/[1.25]"
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
            <h3 className="max-w-60 text-2xl/tight font-medium tracking-tight lg:min-h-17.5 xl:text-[1.75rem]/[1.25]">
              {title}
            </h3>
            <p className="text-grey-70 mt-3 max-w-64 text-base/6 tracking-[-0.04em]">
              {description}
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
      className="mx-auto max-w-320 scroll-mt-24 px-5 pt-28 pb-24 md:px-8 md:pt-40 md:pb-32 xl:pt-60 xl:pb-40"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <SectionKicker className="text-grey-50 shrink-0">
          On campus
        </SectionKicker>
        <h2
          id="campus-benefits"
          className="text-3xl/[1.25] font-normal tracking-[-0.04em] md:text-4xl/[1.25] xl:text-[2.75rem]/[1.25]"
        >
          Bring data and AI to your campus.
        </h2>
      </div>
      <p className="text-grey-70 mt-3 text-3xl/[1.25] tracking-[-0.04em] md:text-4xl/[1.25] lg:mt-0 xl:text-[2.75rem]/[1.25]">
        Fellows share what they learn through events and activities that bring
        students together around data and AI.
      </p>
      <div className="mt-14 grid gap-8 md:grid-cols-3">
        {campusBenefits.map(({ icon, title, description }) => (
          <article
            key={icon}
            className="border-grey-60 relative overflow-hidden border p-6 xl:p-8"
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
              <h3 className="mt-16 text-2xl/tight font-medium tracking-tight xl:mt-29 xl:text-[1.75rem]/[1.25]">
                {title}
              </h3>
              <p className="text-grey-70 mt-3 text-lg/[1.5] tracking-tight xl:text-xl/[1.5]">
                {description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
