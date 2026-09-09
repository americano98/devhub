import { getMetadata } from "@/lib/get-metadata";
import { BrandStrip } from "@/components/ui/brand-strip";
import { CommunityCTA } from "@/components/community/community-cta";
import { DirectoryHero } from "@/components/community/directory-hero";
import {
  hasDirectoryFilters,
  type DirectorySearchParams,
} from "@/components/community/directory-query";
import { PeopleDirectory } from "@/components/community/people-directory";
import Footer from "@/components/footer";

type PageProps = { searchParams: Promise<DirectorySearchParams> };

export async function generateMetadata({ searchParams }: PageProps) {
  const params = await searchParams;
  const metadata = getMetadata({
    title: "Meet the Student Fellows",
    description:
      "Meet the students building, learning, and shaping the future of data and AI. Explore Databricks Student Fellows from around the world.",
    pathname: "/student-fellows/fellows",
  });
  return {
    ...metadata,
    ...(hasDirectoryFilters(params)
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}

export default async function StudentsDirectoryPage({
  searchParams,
}: PageProps) {
  return (
    <main className="bg-black text-white">
      <DirectoryHero kind="student" />
      <BrandStrip className="h-12" />
      <div className="bg-db-paper text-black [color-scheme:light]">
        <PeopleDirectory kind="student" params={await searchParams} />
        <CommunityCTA variant="student-profile" />
        <Footer className="border-t border-white/10 lg:px-8" />
      </div>
    </main>
  );
}
