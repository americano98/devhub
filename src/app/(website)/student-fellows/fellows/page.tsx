import { notFound } from "next/navigation";

import {
  directoryHref,
  directoryPageNumber,
  directoryTitle,
} from "@/lib/community/directory-query";
import { getMetadata } from "@/lib/get-metadata";
import { BrandStrip } from "@/components/ui/brand-strip";
import { CommunityCTA } from "@/components/community/community-cta";
import { DirectoryHero } from "@/components/community/directory-hero";
import { PeopleDirectory } from "@/components/community/people-directory";
import Footer from "@/components/footer";

type PageProps = { params: Promise<{ page?: string }> };

export async function generateMetadata({ params }: PageProps) {
  const page = directoryPageNumber((await params).page);
  if (!page) notFound();
  return getMetadata({
    title: directoryTitle("student", page),
    description:
      "Meet the students building, learning, and shaping the future of data and AI. Explore Databricks Student Fellows from around the world.",
    pathname: directoryHref("student", {}, page),
  });
}

export default async function StudentsDirectoryPage({ params }: PageProps) {
  const page = directoryPageNumber((await params).page);
  if (!page) notFound();
  return (
    <main className="bg-black text-white">
      <DirectoryHero kind="student" />
      <BrandStrip className="h-12" />
      <div className="bg-db-paper text-black [color-scheme:light]">
        <PeopleDirectory kind="student" page={page} />
        <CommunityCTA variant="student-profile" />
        <Footer className="border-t border-white/10 lg:px-8" />
      </div>
    </main>
  );
}

export const revalidate = 3600;
