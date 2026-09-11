import { notFound } from "next/navigation";

import { getPerson } from "@/lib/community/people.server";
import { absoluteSiteUrl, getMetadata } from "@/lib/get-metadata";
import { BrandStrip } from "@/components/ui/brand-strip";
import { CommunityCTA } from "@/components/community/community-cta";
import { StudentProfile } from "@/components/community/student-profile";
import Footer from "@/components/footer";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const person = await getPerson(slug);
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
  const person = await getPerson(slug);
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
      <BrandStrip className="hidden h-12 xl:block" />
      <div className="xl:bg-db-paper flow-root bg-black">
        <CommunityCTA variant="student-profile" theme="outline" />
        <Footer className="border-t border-white/10 lg:px-8" />
      </div>
    </main>
  );
}

export const revalidate = 3600;
