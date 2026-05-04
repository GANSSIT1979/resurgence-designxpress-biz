import Link from 'next/link';

import {
  getEventScheduleLabel,
  sponsorshipEvents,
} from '@/lib/sponsorship-events';

import {
  getPublicPageContent,
  getPublicPageContentMap,
  PUBLIC_PAGE_CONTENT_KEYS,
} from '@/lib/public-page-content';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Events | RESURGENCE',
  description:
    'Browse RESURGENCE sponsorship events, basketball activations, sponsor packages, and application links.',
};

export default async function EventsPage() {
  const contentMap = await getPublicPageContentMap([
    PUBLIC_PAGE_CONTENT_KEYS.eventsHero,
    PUBLIC_PAGE_CONTENT_KEYS.eventsOverview,
  ]);

  const hero = getPublicPageContent(contentMap, PUBLIC_PAGE_CONTENT_KEYS.eventsHero, {
    title: 'Sponsorship-ready events, community activations, and creator moments.',
    body: 'Explore official RESURGENCE event pages, review sponsorship opportunities, and apply for packages connected to each activation.',
    ctaLabel: 'View Sponsor Packages',
    ctaHref: '/sponsors',
  });

  const overview = getPublicPageContent(contentMap, PUBLIC_PAGE_CONTENT_KEYS.eventsOverview, {
    title: 'Choose an event to open its sponsor landing page.',
    body: 'Official RESURGENCE event pages connect sponsors, creators, basketball communities, and activation opportunities.',
  });

  return (
    <main className="min-h-screen bg-[#0B0E14] text-[#F8FAFC]">
      <section className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(90deg,rgba(11,14,20,0.98),rgba(230,57,70,0.16))] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[#E63946]">
            RESURGENCE Events
          </p>

          <h1 className="mt-5 max-w-5xl text-5xl font-black uppercase leading-[0.95] tracking-tight text-[#D4AF37] md:text-7xl">
            {hero.title}
          </h1>

          <p className="mt-6 max-w-3xl border-l-4 border-[#E63946] pl-5 text-xl leading-8 text-slate-100">
            {hero.body}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={hero.ctaHref || '/sponsors'}
              className="rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-black text-[#0B0E14] no-underline transition hover:bg-[#f5d76e]"
            >
              {hero.ctaLabel || 'View Sponsor Packages'}
            </Link>
            <Link
              href="/feed"
              className="rounded-full border border-[#D4AF37]/70 px-6 py-3 text-sm font-black text-white no-underline transition hover:bg-white/10"
            >
              Open Creator Feed
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-400">
              Active Event Catalog
            </p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
              {overview.title}
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              {overview.body}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
            <strong className="block text-3xl text-[#D4AF37]">
              {sponsorshipEvents.length}
            </strong>
            <span className="text-sm text-slate-300">events configured</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {sponsorshipEvents.map((event) => (
            <article
              key={event.slug}
              className="rounded-3xl border border-[#D4AF37]/20 bg-[#111827] p-6 shadow-2xl shadow-black/30"
            >
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#E63946]">
                {event.heroKicker}
              </p>
              <h3 className="mt-4 text-3xl font-black uppercase leading-tight text-[#D4AF37]">
                {event.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-slate-200">
                {event.heroSubtitle}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <MiniInfo label="Schedule" value={getEventScheduleLabel(event)} />
                <MiniInfo label="Market" value={event.market} />
                <MiniInfo label="Organizer" value={event.organizer} />
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={`/events/${event.slug}`}
                  className="rounded-full bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#0B0E14] no-underline transition hover:bg-[#f5d76e]"
                >
                  Open Event
                </Link>
                <Link
                  href={`/events/${event.slug}/apply`}
                  className="rounded-full border border-[#D4AF37]/70 px-5 py-3 text-sm font-black text-white no-underline transition hover:bg-white/10"
                >
                  Apply as Sponsor
                </Link>
                <Link
                  href={`/events/${event.slug}#packages`}
                  className="rounded-full border border-white/15 px-5 py-3 text-sm font-black text-slate-100 no-underline transition hover:bg-white/10"
                >
                  View Packages
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function MiniInfo({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#0B0E14] p-4">
      <div className="text-[11px] font-black uppercase tracking-widest text-[#D4AF37]">
        {label}
      </div>
      <strong className="mt-1 block text-sm text-white">
        {value || 'Coming Soon'}
      </strong>
    </div>
  );
}