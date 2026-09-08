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
    title: "Meet the Databricks MVPs",
    description:
      "Meet experts who share knowledge, build community, and grow the Databricks ecosystem.",
    pathname: "/mvps/directory",
  });
  return {
    ...metadata,
    ...(hasDirectoryFilters(params)
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}

export default async function MVPDirectoryPage({ searchParams }: PageProps) {
  return (
    <main className="bg-black text-white">
      <DirectoryHero kind="mvp" />
      <BrandStrip />
      <div className="bg-db-paper text-black [color-scheme:light]">
        <PeopleDirectory kind="mvp" params={await searchParams} />
        <CommunityCTA variant="mvp" />
        <Footer className="border-t border-white/10 lg:px-8" />
      </div>
    </main>
  );
}
