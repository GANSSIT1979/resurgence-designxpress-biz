import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser, getDashboardPath } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseJsonSafely } from "@/lib/format";

type SocialLink = {
  label?: string;
  url?: string;
};

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

function statValue(
  value: number | string | null | undefined,
  fallback = "—",
) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toFixed(1) : fallback;
  }
  if (typeof value === "string" && value.trim()) return value;
  return fallback;
}

function normalizeKey(value: string | null | undefined) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const dynamic = "force-dynamic";

export default async function CreatorDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/creator/dashboard");
  }

  if (user.role !== "CREATOR") {
    redirect(getDashboardPath(user.role));
  }

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    notFound();
  }

  const dbUserRecord = dbUser as unknown as Record<string, unknown>;
  const linkedCreatorProfileId =
    typeof dbUserRecord.creatorProfileId === "string"
      ? dbUserRecord.creatorProfileId
      : null;

  let creator: any = null;

  if (linkedCreatorProfileId) {
    creator = await (db.creatorProfile as any).findUnique({
      where: { id: linkedCreatorProfileId },
    });
  }

  if (!creator) {
    const possibleNames = [
      typeof dbUserRecord.name === "string" ? dbUserRecord.name : "",
      typeof dbUserRecord.displayName === "string" ? dbUserRecord.displayName : "",
      String(dbUserRecord.email || "")
        .split("@")[0]
        .replace(/\./g, " "),
    ]
      .map((item) => item.trim())
      .filter(Boolean);

    const allCreators = await db.creatorProfile.findMany({
      orderBy: [{ featured: "desc" }, { fullName: "asc" }],
    });

    creator =
      allCreators.find((item) =>
        possibleNames.some(
          (name) => normalizeKey(item.fullName) === normalizeKey(name),
        ),
      ) || null;
  }

  if (!creator) {
    return (
      <div className="page-shell">
        <div className="container">
          <section className="dashboard-surface">
            <div className="eyebrow">Creator Dashboard</div>
            <h1 className="dashboard-section-title">Creator profile not linked yet</h1>
            <p className="dashboard-section-subtitle">
              Your account is authenticated, but it is not yet linked to a creator
              profile record. Ask the admin to link your account in the user or
              creator-network module.
            </p>

            <div className="inline-actions">
              <Link href="/contact" className="button">
                Contact Admin
              </Link>
              <Link href="/support" className="button button-secondary">
                Support Desk
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  const creatorRecord = creator as Record<string, unknown>;
  const socialLinks = normalizeSocialLinks(
    creatorRecord.socialLinks as string | null | undefined,
  );
  const heroImage = creator.image || "/uploads/resurgence-logo.jpg";
  const biography =
    typeof creator.biography === "string" && creator.biography.trim()
      ? creator.biography
      : "Creator profile details will be updated soon.";
  const journeyStory =
    typeof creatorRecord.journeyStory === "string"
      ? (creatorRecord.journeyStory as string)
      : "";

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
                minHeight: 380,
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
                  minHeight: 348,
                  objectFit: "cover",
                  borderRadius: 24,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
            </div>

            <div style={{ padding: 28 }}>
              <div className="eyebrow">Creator Dashboard</div>
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
                  {
                    label: "PPG",
                    value: statValue(creatorRecord.pointsPerGame),
                  },
                  {
                    label: "APG",
                    value: statValue(creatorRecord.assistsPerGame),
                  },
                  {
                    label: "RPG",
                    value: statValue(creatorRecord.reboundsPerGame),
                  },
                  {
                    label: "Featured",
                    value: creator.featured ? "Yes" : "No",
                  },
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
                <Link href={`/creator/${creator.slug}`} className="button">
                  Public Profile
                </Link>
                <Link href="/sponsors" className="button button-secondary">
                  Explore Sponsors
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
            <div className="eyebrow">Professional Summary</div>
            <h2 style={{ marginTop: 0, marginBottom: 12 }}>
              Brand positioning and creator value
            </h2>
            <p className="muted" style={{ lineHeight: 1.8 }}>
              {biography}
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
              <strong style={{ display: "block", marginBottom: 8 }}>
                Creator Access
              </strong>
              <div className="muted" style={{ lineHeight: 1.7 }}>
                This dashboard is reserved for creator accounts and should be used
                for profile review, sponsor-readiness, and creator-facing platform
                operations.
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 26 }}>
            <div className="eyebrow">Journey Story</div>
            <h2 style={{ marginTop: 0, marginBottom: 12 }}>
              Career journey and creator narrative
            </h2>
            <p className="muted" style={{ lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
              {journeyStory ||
                "Journey story details will be added to strengthen the creator narrative and sponsorship pitch."}
            </p>
          </div>
        </section>

        <section className="grid-2 section">
          <div className="card" style={{ padding: 26 }}>
            <div className="eyebrow">Performance Snapshot</div>
            <h2 style={{ marginTop: 0, marginBottom: 14 }}>At-a-glance metrics</h2>

            <div className="list-stack">
              {[
                {
                  label: "Points Per Game",
                  value: statValue(creatorRecord.pointsPerGame),
                },
                {
                  label: "Assists Per Game",
                  value: statValue(creatorRecord.assistsPerGame),
                },
                {
                  label: "Rebounds Per Game",
                  value: statValue(creatorRecord.reboundsPerGame),
                },
                {
                  label: "Featured Status",
                  value: creator.featured ? "Featured creator" : "Standard listing",
                },
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
                    <strong style={{ display: "block", marginBottom: 6 }}>
                      {item.label}
                    </strong>
                    <div className="muted">
                      RESURGENCE creator dashboard record
                    </div>
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
            <div className="eyebrow">Social Links</div>
            <h2 style={{ marginTop: 0, marginBottom: 14 }}>
              Public channels and reach points
            </h2>

            {socialLinks.length ? (
              <div className="list-stack">
                {socialLinks.map((link, index) => (
                  <a
                    key={`${link.label}-${index}`}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="list-item"
                    style={{
                      padding: "16px 18px",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong style={{ display: "block", marginBottom: 6 }}>
                        {link.label || "Profile"}
                      </strong>
                      <div className="muted" style={{ wordBreak: "break-all" }}>
                        {link.url}
                      </div>
                    </div>
                    <span className="button button-secondary button-small">
                      Open
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                No social links have been published for this creator yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}