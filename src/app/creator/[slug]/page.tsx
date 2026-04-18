import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "../../../lib/db";
import { parseJsonSafely } from "../../../lib/format";

type SocialLink = {
  label?: string;
  url?: string;
};

type PlatformProfile = {
  label: string;
  url?: string;
  followers?: string;
};

type CreatorOverride = {
  fullName: string;
  aliases?: string[];
  contactNumber?: string;
  address?: string;
  dateOfBirth?: string;
  jobDescription?: string;
  position?: string;
  height?: string;
  biography?: string;
  journeyStory?: string;
  platforms?: PlatformProfile[];
  trendingVideoUrl?: string;
};

function normalizeKey(value: string | null | undefined) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const CREATOR_OVERRIDES: CreatorOverride[] = [
  {
    fullName: "Jake Anilao",
    aliases: ["jake-anilao", "coach-jake"],
    contactNumber: "09387841636",
    address: "#59 Calamansi St., Zone C, Brgy. San Miguel, Tarlac City",
    dateOfBirth: "June 16, 1991",
    jobDescription:
      "Resurgence Powered by DesignXpress Co-Owner, Brand Ambassador, Basketball Coach and Influencer/Vlogger",
    biography:
      "Jake Anilao is one of the public faces behind RESURGENCE Powered by DesignXpress, combining leadership, coaching, creator marketing, and brand storytelling into one sponsorship-ready profile.",
    journeyStory:
      "Jake Anilao leads creator-facing brand partnerships for RESURGENCE while also building direct audience trust as a basketball coach, business connector, and influencer/vlogger. His profile is positioned for sponsor activations, basketball campaigns, creator-led promotions, and long-term commercial collaborations.",
    platforms: [
      {
        label: "Facebook",
        url: "https://www.facebook.com/profile.php?id=100086690809185",
        followers: "1M followers",
      },
      {
        label: "YouTube",
        url: "https://www.youtube.com/@jakeanilao3861",
        followers: "5.64K subscribers",
      },
    ],
    trendingVideoUrl: "https://www.facebook.com/reel/734220602866816",
  },
  {
    fullName: "Klinthon S. Almine",
    aliases: ["klinthon-s-almine", "klinthon-almine", "klinthon"],
    contactNumber: "09664117353",
    address: "P-2 Sta. Cruz, San Jose, Dinagat Island",
    dateOfBirth: "July 13, 1997",
    jobDescription: "Basketball Player and Influencer/Vlogger",
    position: "All Around",
    height: "6'3",
    biography:
      "Klinthon S. Almine is an all-around basketball talent positioned for player-led collaborations, event visibility, and creator-driven sports storytelling.",
    journeyStory:
      "Klinthon represents the athlete side of the RESURGENCE network, combining on-court versatility with creator potential for brand activations and basketball community engagement.",
    platforms: [],
  },
  {
    fullName: "Joshua Dollente",
    aliases: ["joshua-dollente", "joshua"],
    contactNumber: "09267206345",
    address: "Blk 21 Lot 4, St. Therese, Deca Homes, Marilao, Bulacan",
    dateOfBirth: "July 20, 1997",
    jobDescription:
      "Resurgence Powered by DesignXpress Co-Owner, Basketball Player and Influencer/Vlogger",
    position: "Shooting Guard",
    height: "5'8",
    biography:
      "Joshua Dollente bridges entrepreneurship, player branding, and creator visibility as a RESURGENCE co-owner and basketball-focused influencer.",
    journeyStory:
      "Joshua contributes both creator energy and basketball identity to the RESURGENCE network, supporting sponsor storytelling, campaign amplification, and player-driven audience engagement.",
    platforms: [
      {
        label: "Facebook",
        url: "https://www.facebook.com/joshua.dollente.399421",
        followers: "35K followers",
      },
      {
        label: "Instagram",
        url: "https://www.instagram.com/joshuadollente20",
        followers: "32 followers",
      },
    ],
  },
  {
    fullName: "Gabriel Dimalanta",
    aliases: ["gabriel-dimalanta", "gab-dimalanta", "gabriel"],
    contactNumber: "09153953622",
    address: "20 Don Jose St., Kimco Village, Sauyo, Novaliches, Quezon City",
    dateOfBirth: "April 28, 2000",
    jobDescription:
      "Resurgence Powered by DesignXpress Co-Owner, Basketball Player and Influencer/Vlogger",
    position: "Small Forward",
    biography:
      "Gabriel Dimalanta is part of the RESURGENCE creator-athlete core, supporting basketball storytelling, sponsorship visibility, and community-facing digital engagement.",
    journeyStory:
      "As a co-owner and player personality within RESURGENCE, Gabriel adds modern basketball culture, creator presence, and partner-facing value to campaigns and activations.",
    platforms: [],
  },
  {
    fullName: "Angelo Deciembre",
    aliases: ["angelo-deciembre", "angelo"],
    contactNumber: "09295751793",
    address: "26 Don Francisco St., Villa Beatriz, Brgy. Matandang Balara",
    dateOfBirth: "December 16, 1994",
    jobDescription:
      "Resurgence Powered by DesignXpress Co-Owner, Basketball Player and Influencer/Vlogger",
    position: "Power Forward",
    height: "5'9",
    biography:
      "Angelo Deciembre adds co-owner credibility, basketball identity, and influencer potential to the RESURGENCE creator network.",
    journeyStory:
      "Angelo’s profile is suited for sports promotions, basketball business campaigns, and audience-facing activations aligned with the RESURGENCE brand.",
    platforms: [],
  },
  {
    fullName: "Marlon Villamin Facundo",
    aliases: ["marlon-villamin-facundo", "macol-facundo", "marlon-facundo", "macol"],
    contactNumber: "09675102324",
    address: "35 Jose Abad Santos, Barangay Sta. Lucia, Novaliches, QC",
    dateOfBirth: "July 18, 1999",
    jobDescription:
      "Resurgence Powered by DesignXpress Co-Owner, Basketball Player and Influencer/Vlogger",
    position: "Point Guard",
    height: "5'6",
    biography:
      "Marlon Villamin Facundo brings point-guard identity, creator visibility, and community appeal into the RESURGENCE platform as both athlete and co-owner.",
    journeyStory:
      "Marlon strengthens the creator roster with grassroots sports energy, digital visibility, and sponsor-friendly basketball positioning for campaigns and activations.",
    platforms: [
      {
        label: "Facebook",
        url: "https://www.facebook.com/macol.facundo7",
        followers: "12K followers",
      },
    ],
    trendingVideoUrl: "https://www.facebook.com/reel/26628084156811313",
  },
  {
    fullName: "Neil Martin Liceralde",
    aliases: ["neil-martin-liceralde", "neil-liceralde", "neil-martin"],
    contactNumber: "09514057238",
    address: "Area 5A, Sitio Cabuyao St., Brgy. Sauyo, Quezon City",
    dateOfBirth: "October 29, 1983",
    jobDescription:
      "Businessman and Basketball Coach Consultant / Co-Owner of Resurgence Powered by DesignXpress",
    biography:
      "Neil Martin Liceralde supports RESURGENCE from a business and basketball consultancy perspective, adding strategic value to partnerships, activations, and organizational development.",
    journeyStory:
      "Neil strengthens the commercial and operational side of RESURGENCE through business leadership, coaching insight, and long-term sports partnership value.",
    platforms: [],
  },
];

function findOverride(slug: string, fullName: string) {
  const slugKey = normalizeKey(slug);
  const nameKey = normalizeKey(fullName);

  return (
    CREATOR_OVERRIDES.find((item) => {
      const keys = [
        normalizeKey(item.fullName),
        ...(item.aliases || []).map(normalizeKey),
      ];
      return keys.includes(slugKey) || keys.includes(nameKey);
    }) || null
  );
}

function normalizeSocialLinks(value: string | null | undefined): SocialLink[] {
  const parsed = parseJsonSafely<unknown>(value, []);

  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        return {
          label: typeof record.label === "string" ? record.label : "Profile",
          url: typeof record.url === "string" ? record.url : "",
        };
      })
      .filter((item): item is SocialLink => Boolean(item?.url));
  }

  if (parsed && typeof parsed === "object") {
    return Object.entries(parsed as Record<string, unknown>)
      .map(([key, value]) => ({
        label: key,
        url: typeof value === "string" ? value : "",
      }))
      .filter((item) => item.url);
  }

  return [];
}

function statValue(value: number | string | null | undefined, fallback = "—") {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "number") return Number.isFinite(value) ? value.toFixed(1) : fallback;
  if (typeof value === "string" && value.trim()) return value;
  return fallback;
}

function buildPlatformCards(
  creatorSocialLinks: SocialLink[],
  overridePlatforms: PlatformProfile[],
) {
  const map = new Map<string, PlatformProfile>();

  for (const platform of overridePlatforms) {
    map.set(platform.label.toLowerCase(), platform);
  }

  for (const link of creatorSocialLinks) {
    const key = String(link.label || "Profile").toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        label: link.label || "Profile",
        url: link.url || "",
      });
    }
  }

  return ["Facebook", "TikTok", "Instagram", "YouTube"].map((label) => {
    const item = map.get(label.toLowerCase());
    return {
      label,
      url: item?.url || "",
      followers: item?.followers || "",
    };
  });
}

function infoValue(value: string | null | undefined, fallback = "To be updated") {
  return value && value.trim() ? value : fallback;
}

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [creator, relatedCreators] = await Promise.all([
    db.creatorProfile.findUnique({
      where: { slug },
    }),
    db.creatorProfile.findMany({
      where: { slug: { not: slug } },
      take: 3,
      orderBy: [{ featured: "desc" }, { fullName: "asc" }],
    }),
  ]);

  if (!creator) {
    notFound();
  }

  const creatorRecord = creator as Record<string, unknown>;
  const override = findOverride(slug, creator.fullName);
  const socialLinks = normalizeSocialLinks(creatorRecord.socialLinks as string | null | undefined);
  const platformCards = buildPlatformCards(socialLinks, override?.platforms || []);

  const journeyStory =
    typeof creatorRecord.journeyStory === "string" && creatorRecord.journeyStory.trim()
      ? (creatorRecord.journeyStory as string)
      : override?.journeyStory || "";

  const biography =
    typeof creator.biography === "string" && creator.biography.trim()
      ? creator.biography
      : override?.biography || "Creator profile details will be updated soon.";

  const heroImage = creator.image || "/uploads/resurgence-logo.jpg";
  const position =
    (typeof creatorRecord.position === "string" && creatorRecord.position) ||
    override?.position ||
    "";
  const height =
    (typeof creatorRecord.height === "string" && creatorRecord.height) ||
    override?.height ||
    "";
  const contactNumber =
    (typeof creatorRecord.contactNumber === "string" && creatorRecord.contactNumber) ||
    override?.contactNumber ||
    "";
  const address =
    (typeof creatorRecord.address === "string" && creatorRecord.address) ||
    override?.address ||
    "";
  const dateOfBirth =
    (typeof creatorRecord.dateOfBirth === "string" && creatorRecord.dateOfBirth) ||
    override?.dateOfBirth ||
    "";
  const jobDescription =
    (typeof creatorRecord.jobDescription === "string" && creatorRecord.jobDescription) ||
    override?.jobDescription ||
    biography;
  const trendingVideoUrl =
    (typeof creatorRecord.trendingVideoUrl === "string" && creatorRecord.trendingVideoUrl) ||
    override?.trendingVideoUrl ||
    "";

  const totalReach = platformCards
    .map((item) => item.followers)
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="page-shell">
      <div className="container">
        <section
          className="card creator-profile-hero"
          style={{
            padding: 0,
            overflow: "hidden",
            marginBottom: 24,
            background:
              "linear-gradient(135deg, rgba(255, 211, 77, 0.10), rgba(57, 181, 255, 0.08)), linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))",
          }}
        >
          <div
            className="creator-profile-hero"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(320px, 0.95fr) 1.15fr",
              gap: 0,
            }}
          >
            <div
              style={{
                padding: 16,
                minHeight: 420,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
              }}
            >
              <img
                src={heroImage}
                alt={creator.fullName}
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: 388,
                  objectFit: "cover",
                  borderRadius: 24,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
            </div>

            <div style={{ padding: 28 }}>
              <div className="eyebrow">Creator Profile</div>
              <h1
                style={{
                  marginTop: 0,
                  marginBottom: 12,
                  fontSize: "clamp(2rem, 4vw, 3.2rem)",
                  lineHeight: 1.02,
                }}
              >
                {creator.fullName}
              </h1>

              <div className="muted" style={{ marginBottom: 12, fontSize: "1rem" }}>
                {jobDescription}
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                {position ? <span className="status-pill">{position}</span> : null}
                {height ? <span className="status-pill">{height}</span> : null}
                <span className="status-pill">
                  {creator.featured ? "Featured Creator" : "Creator Profile"}
                </span>
                {totalReach ? <span className="status-pill">{totalReach}</span> : null}
              </div>

              <p
                className="muted"
                style={{
                  fontSize: "1.05rem",
                  lineHeight: 1.8,
                  marginBottom: 22,
                  maxWidth: 780,
                }}
              >
                {biography}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                {[
                  { label: "PPG", value: statValue(creatorRecord.pointsPerGame) },
                  { label: "APG", value: statValue(creatorRecord.assistsPerGame) },
                  { label: "RPG", value: statValue(creatorRecord.reboundsPerGame) },
                  { label: "Trending", value: trendingVideoUrl ? "Live" : "Pending" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="card"
                    style={{
                      padding: 18,
                      borderRadius: 22,
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                      boxShadow: "none",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "2.2rem",
                        fontWeight: 800,
                        lineHeight: 1,
                        marginBottom: 8,
                      }}
                    >
                      {item.value}
                    </div>
                    <div className="muted" style={{ fontSize: "0.95rem" }}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="inline-actions" style={{ gap: 10 }}>
                <Link href="/sponsors" className="button">
                  Explore Sponsors
                </Link>
                <Link href="/contact" className="button button-secondary">
                  Book a Collaboration
                </Link>
                <Link href="/support" className="button button-secondary">
                  Support Desk
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="grid-2">
          <div className="card" style={{ padding: 26 }}>
            <div className="eyebrow">Creator Details</div>
            <h2 style={{ marginTop: 0, marginBottom: 14 }}>Identity and contact information</h2>

            <div className="list-stack">
              {[
                { label: "Full Name", value: creator.fullName },
                { label: "Contact Number", value: infoValue(contactNumber) },
                { label: "Address", value: infoValue(address) },
                { label: "Date of Birth", value: infoValue(dateOfBirth) },
                { label: "Position", value: infoValue(position) },
                { label: "Height", value: infoValue(height) },
                { label: "Role / Job Description", value: infoValue(jobDescription) },
              ].map((item) => (
                <div
                  key={item.label}
                  className="list-item"
                  style={{ alignItems: "flex-start", padding: "16px 18px" }}
                >
                  <div style={{ minWidth: 160 }}>
                    <strong style={{ display: "block", marginBottom: 6 }}>{item.label}</strong>
                    <div className="muted">RESURGENCE creator record</div>
                  </div>
                  <div style={{ fontWeight: 700, lineHeight: 1.7 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 26 }}>
            <div className="eyebrow">Journey Story</div>
            <h2 style={{ marginTop: 0, marginBottom: 12 }}>Career journey and creator narrative</h2>
            <p className="muted" style={{ lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
              {journeyStory || "Journey story details will be added to strengthen the creator narrative and sponsorship pitch."}
            </p>

            <div
              style={{
                marginTop: 18,
                padding: 16,
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.025)",
              }}
            >
              <strong style={{ display: "block", marginBottom: 8 }}>Engagement Fit</strong>
              <div className="muted" style={{ lineHeight: 1.7 }}>
                Ideal for sponsorship storytelling, event activations, branded creator campaigns,
                basketball promotions, and audience-facing sports-business collaborations.
              </div>
            </div>
          </div>
        </section>

        <section className="grid-2 section">
          <div className="card" style={{ padding: 26 }}>
            <div className="eyebrow">Social Reach</div>
            <h2 style={{ marginTop: 0, marginBottom: 14 }}>Platform presence and audience touchpoints</h2>

            <div className="list-stack">
              {platformCards.map((item) => (
                <div
                  key={item.label}
                  className="list-item"
                  style={{ alignItems: "center", padding: "16px 18px" }}
                >
                  <div>
                    <strong style={{ display: "block", marginBottom: 6 }}>{item.label}</strong>
                    <div className="muted">
                      {item.followers || "Followers to be updated"}
                    </div>
                  </div>

                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="button button-secondary button-small"
                    >
                      Open
                    </a>
                  ) : (
                    <span className="status-pill">To be updated</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 26 }}>
            <div className="eyebrow">Trend Link</div>
            <h2 style={{ marginTop: 0, marginBottom: 14 }}>Featured trending content</h2>

            {trendingVideoUrl ? (
              <a
                href={trendingVideoUrl}
                target="_blank"
                rel="noreferrer"
                className="list-item"
                style={{ padding: "18px 20px", alignItems: "center" }}
              >
                <div>
                  <strong style={{ display: "block", marginBottom: 6 }}>Open trending video</strong>
                  <div className="muted" style={{ wordBreak: "break-all" }}>
                    {trendingVideoUrl}
                  </div>
                </div>
                <span className="button button-secondary button-small">Watch</span>
              </a>
            ) : (
              <div className="empty-state">
                No trending FB / YouTube / TikTok video link has been published for this creator yet.
              </div>
            )}

            <div
              style={{
                marginTop: 18,
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 14,
              }}
            >
              <Link href="/sponsor/apply" className="card" style={{ padding: 18 }}>
                <div className="eyebrow">Business Link</div>
                <strong style={{ display: "block", marginBottom: 6 }}>Apply as Sponsor</strong>
                <div className="muted">Launch a partnership using this creator profile as a campaign asset.</div>
              </Link>

              <Link href="/contact" className="card" style={{ padding: 18 }}>
                <div className="eyebrow">Direct Inquiry</div>
                <strong style={{ display: "block", marginBottom: 6 }}>Contact the Team</strong>
                <div className="muted">Coordinate creator campaigns, events, or sponsorship discussions.</div>
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="grid-2">
            <div className="card" style={{ padding: 26 }}>
              <div className="eyebrow">Performance Snapshot</div>
              <h2 style={{ marginTop: 0, marginBottom: 14 }}>At-a-glance metrics</h2>

              <div className="list-stack">
                {[
                  { label: "Points Per Game", value: statValue(creatorRecord.pointsPerGame) },
                  { label: "Assists Per Game", value: statValue(creatorRecord.assistsPerGame) },
                  { label: "Rebounds Per Game", value: statValue(creatorRecord.reboundsPerGame) },
                  { label: "Featured Status", value: creator.featured ? "Featured creator" : "Standard listing" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="list-item"
                    style={{
                      alignItems: "flex-start",
                      padding: "16px 18px",
                    }}
                  >
                    <div>
                      <strong style={{ display: "block", marginBottom: 6 }}>{item.label}</strong>
                      <div className="muted">RESURGENCE creator dashboard record</div>
                    </div>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: "1.1rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 26 }}>
              <div className="eyebrow">Creator Network</div>
              <h2 style={{ marginTop: 0, marginBottom: 14 }}>Interlinked creator profiles</h2>

              {relatedCreators.length ? (
                <div className="list-stack">
                  {relatedCreators.map((item) => (
                    <Link
                      key={item.id}
                      href={`/creator/${item.slug}`}
                      className="list-item"
                      style={{ padding: "16px 18px", alignItems: "center" }}
                    >
                      <div>
                        <strong style={{ display: "block", marginBottom: 6 }}>{item.fullName}</strong>
                        <div className="muted">
                          {typeof item.biography === "string" && item.biography.trim()
                            ? item.biography
                            : "Open profile"}
                        </div>
                      </div>
                      <span className="button button-secondary button-small">View Profile</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  Additional creator links will appear here as more profiles are published.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
