import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { KPIGrid } from "@/components/kpi-grid";
import { parseJsonSafely } from "@/lib/format";

export default async function CreatorProfilePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const creator = await db.creatorProfile.findUnique({ where: { slug } });

  if (!creator) return notFound();

  const socialLinks = parseJsonSafely<Record<string, string>>(creator.socialLinks, {});

  return (
    <div className="page-shell">
      <div className="container">
        <div className="grid-2">
          <div className="card creator-card">
            <img src={creator.image || "/uploads/jake-image3.jpg"} alt={creator.fullName} />
          </div>
          <div className="card">
            <div className="eyebrow">Creator Profile</div>
            <h1>{creator.fullName}</h1>
            <p className="muted">{creator.biography}</p>
            <p>{creator.journeyStory}</p>
            <KPIGrid
              items={[
                { label: "PPG", value: String(creator.pointsPerGame) },
                { label: "APG", value: String(creator.assistsPerGame) },
                { label: "RPG", value: String(creator.reboundsPerGame) },
                { label: "Featured", value: creator.featured ? "Yes" : "No" }
              ]}
            />
            <div className="card-title">Social Links</div>
            <ul className="feature-list">
              {Object.entries(socialLinks).map(([label, href]) => (
                <li key={label}>
                  <a href={href} target="_blank">{label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
