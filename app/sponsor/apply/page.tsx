import { PublicSponsorApplicationForm } from "@/components/public-sponsor-application-form";
import { db } from "@/lib/db";
import { SectionTitle } from "@/components/section-title";

export default async function SponsorApplyPage() {
  const packages = await db.sponsorPackage.findMany({
    where: { status: "ACTIVE" },
    orderBy: { sortOrder: "asc" }
  });

  return (
    <div className="page-shell">
      <div className="container">
        <div className="grid-2">
          <div>
            <SectionTitle
              eyebrow="Sponsor Apply"
              title="Apply for sponsorship partnership"
              subtitle="Submit your brand profile and package interest. Applications enter the admin review queue and sponsor workflow."
            />
            <div className="card">
              <div className="card-title">Available Packages</div>
              <ul className="feature-list">
                {packages.map((pkg) => (
                  <li key={pkg.id}>{pkg.title} — {pkg.priceRange}</li>
                ))}
              </ul>
            </div>
          </div>
          <PublicSponsorApplicationForm />
        </div>
      </div>
    </div>
  );
}
