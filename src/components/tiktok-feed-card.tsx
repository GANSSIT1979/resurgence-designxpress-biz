import Link from 'next/link';

import type { TikTokFeedItem } from '@/lib/tiktok-feed-data';

export function TikTokFeedCard({ item }: { item: TikTokFeedItem }) {
  return (
    <section className="relative min-h-[calc(100vh-88px)] snap-start overflow-hidden bg-[#05070B] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-45"
        style={{ backgroundImage: `url(${item.imageUrl})` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,11,0.96),rgba(5,7,11,0.48),rgba(230,57,70,0.30))]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl grid-cols-1 items-end gap-8 px-5 pb-28 pt-20 md:grid-cols-[1fr_96px] md:px-8 md:pb-20">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.36em] text-[#E63946]">
            {item.eyebrow}
          </p>
          <h1 className="mt-4 text-5xl font-black uppercase leading-[0.92] text-[#D4AF37] md:text-7xl">
            {item.title}
          </h1>
          <p className="mt-5 max-w-2xl border-l-4 border-[#E63946] pl-5 text-lg leading-8 text-slate-100 md:text-xl">
            {item.caption}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-slate-100"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={item.primaryCtaHref}
              className="rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-black text-[#05070B] no-underline"
            >
              {item.primaryCtaLabel}
            </Link>
            <Link
              href={item.secondaryCtaHref}
              className="rounded-full border border-[#D4AF37]/70 px-6 py-3 text-sm font-black text-white no-underline"
            >
              {item.secondaryCtaLabel}
            </Link>
          </div>

          <div className="mt-7 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full border border-[#D4AF37]/50 bg-black/50 text-sm font-black text-[#D4AF37]">
              RX
            </div>
            <div>
              <strong className="block text-sm">{item.creator}</strong>
              <span className="text-xs text-slate-300">{item.role}</span>
            </div>
          </div>
        </div>

        <aside className="fixed bottom-24 right-4 z-20 flex flex-col gap-3 md:static md:bottom-auto md:right-auto">
          <ActionPill label="Like" value={item.stats.likes} />
          <ActionPill label="Comment" value={item.stats.comments} />
          <ActionPill label="Share" value={item.stats.shares} />
          <Link
            href={item.primaryCtaHref}
            className="grid h-16 w-16 place-items-center rounded-full bg-[#E63946] text-center text-[10px] font-black uppercase text-white no-underline shadow-2xl"
          >
            Open
          </Link>
        </aside>
      </div>
    </section>
  );
}

function ActionPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid h-16 w-16 place-items-center rounded-full border border-white/15 bg-black/55 text-center shadow-2xl backdrop-blur">
      <div>
        <div className="text-[10px] font-black uppercase text-slate-300">{label}</div>
        <strong className="block text-xs text-white">{value}</strong>
      </div>
    </div>
  );
}