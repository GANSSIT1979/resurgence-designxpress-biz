import { db } from "@/lib/db";
import { SectionTitle } from "@/components/section-title";

export default async function SponsorsPage() {
  const sponsors = await db.sponsor.findMany({
    where: { status: "ACTIVE" },
    include: { package: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="page-shell">
      <div className="container">
        <SectionTitle
          eyebrow="Sponsors"
          title="Active sponsors and business partners"
          subtitle="Public-facing sponsor profiles that reflect package alignment and brand visibility."
        />
        <div className="grid-3">
          {sponsors.map((sponsor) => (
            <div className="card sponsor-logo-card" key={sponsor.id}>
              <img src={sponsor.logo || "/uploads/resurgence-logo.jpg"} alt={sponsor.name} />
              <div className="card-title">{sponsor.name}</div>
              <div className="muted">{sponsor.package?.title || "Custom package"}</div>
              <p>{sponsor.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
