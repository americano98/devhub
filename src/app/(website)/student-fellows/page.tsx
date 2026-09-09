import { getMetadata } from "@/lib/get-metadata";
import { BrandStrip } from "@/components/ui/brand-strip";
import { CommunityCTA } from "@/components/community/community-cta";
import { CampusBenefits } from "@/components/community/program-benefits";
import { ProgramHero } from "@/components/community/program-hero";
import { StudentPathways } from "@/components/community/program-requirements";
import Footer from "@/components/footer";

export const metadata = getMetadata({
  title: "Databricks Student Fellows",
  description:
    "Turn your data expertise into a career in AI. Learn from Databricks experts, build real-world skills, and bring data and AI to your campus.",
  pathname: "/student-fellows",
});

export default function StudentFellowsPage() {
  return (
    <main className="bg-black text-white">
      <ProgramHero kind="student" />
      <CampusBenefits />
      <BrandStrip className="h-12" />
      <div className="bg-db-paper text-black">
        <StudentPathways />
        <CommunityCTA variant="student" />
        <Footer className="border-t border-white/10 lg:px-8" />
      </div>
    </main>
  );
}
