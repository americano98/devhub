import { notFound } from "next/navigation";

import { CommunityApiError, getPerson } from "@/lib/community/people.server";
import { absoluteSiteUrl, getMetadata } from "@/lib/get-metadata";
import { BackLink } from "@/components/ui/back-link";
import { BrandStrip } from "@/components/ui/brand-strip";
import { CommunityCTA } from "@/components/community/community-cta";
import { CommunityUnavailable } from "@/components/community/people-directory";
import { StudentProfile } from "@/components/community/student-profile";
import Footer from "@/components/footer";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  let person;
  try {
    person = await getPerson(slug);
  } catch (error) {
    if (!(error instanceof CommunityApiError)) throw error;
    return getMetadata({
      title: "Student Fellow",
      description: "Databricks Student Fellows directory",
      pathname: `/student-fellows/fellows/${slug}`,
      noIndex: true,
    });
  }
  if (!person || person.kind !== "student") notFound();
  return getMetadata({
    title: `${person.name} — Student Fellow`,
    description: (
      person.headline ||
      person.bio ||
      `${person.name}, Databricks Student Fellow.`
    ).slice(0, 160),
    pathname: `/student-fellows/fellows/${person.slug}`,
  });
}

export default async function StudentProfilePage({ params }: PageProps) {
  const { slug } = await params;
  let person;
  try {
    person = await getPerson(slug);
  } catch (error) {
    if (!(error instanceof CommunityApiError)) throw error;
    return (
      <main className="bg-black text-white">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
          <BackLink href="/student-fellows/fellows">Back to fellows</BackLink>
          <h1 className="my-8 text-4xl">Student Fellow</h1>
          <CommunityUnavailable
            href={`/student-fellows/fellows/${encodeURIComponent(slug)}`}
          />
        </div>
        <Footer />
      </main>
    );
  }
  if (!person || person.kind !== "student") notFound();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absoluteSiteUrl(`/student-fellows/fellows/${person.slug}`),
    mainEntity: {
      "@type": "Person",
      name: person.name,
      description: person.headline || undefined,
      image: person.photoUrl || undefined,
      sameAs: [
        ...Object.values(person.links).filter(Boolean),
        ...person.additionalLinks.map((link) => link.url),
      ],
      affiliation: person.organization
        ? { "@type": "EducationalOrganization", name: person.organization }
        : undefined,
    },
  };
  return (
    <main className="bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <StudentProfile person={person} />
      <BrandStrip className="h-12" />
      <div className="bg-db-paper flow-root text-black">
        <CommunityCTA variant="student-profile" />
        <Footer className="border-t border-white/10 lg:px-8" />
      </div>
    </main>
  );
}
