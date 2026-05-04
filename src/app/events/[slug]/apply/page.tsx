import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getSponsorshipEvent } from '@/lib/sponsorship-events';

type ApplyPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ package?: string }>;
};

export default async function ApplyPage({ params, searchParams }: ApplyPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const event = getSponsorshipEvent(slug);

  if (!event) notFound();

  const selectedPackage = resolvedSearchParams?.package || '';

  return (
    <main className="min-h-screen bg-[#070B12] text-slate-100">
      <section className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Link
          href={`/events/${slug}`}
          className="inline-flex items-center text-sm font-semibold text-[#D4AF37] transition hover:text-[#f5d76e]"
        >
          ← Back to Event
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <aside className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/30">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
              Sponsor Application
            </p>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              {event.title}
            </h1>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              Apply as a sponsor for this event. Submit your company details and our
              partnerships team will review your application.
            </p>

            <div className="mt-6 rounded-2xl border border-[#D4AF37]/25 bg-[#D4AF37]/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                Selected Package
              </p>
              <p className="mt-2 text-lg font-bold text-white">
                {selectedPackage || 'General Sponsorship'}
              </p>
            </div>

            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#D4AF37]" />
                <p>Brand exposure across RESURGENCE event channels.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#D4AF37]" />
                <p>Partnership review by the DesignXpress sponsorship team.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#D4AF37]" />
                <p>Follow-up proposal and activation details after approval.</p>
              </div>
            </div>
          </aside>

          <form
            method="POST"
            action="/api/sponsor/submit"
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-8"
          >
            <input type="hidden" name="eventSlug" value={slug} />

            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                Company Details
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Sponsorship Form
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Fields marked with required validation must be completed before submission.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  Company Name
                </span>
                <input
                  name="companyName"
                  placeholder="Example: GANSS Information Technology Solutions"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-[#0B111D] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  Contact Name
                </span>
                <input
                  name="contactName"
                  placeholder="Full name"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-[#0B111D] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  Email Address
                </span>
                <input
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-[#0B111D] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  Phone / Viber / WhatsApp
                </span>
                <input
                  name="phone"
                  placeholder="+63..."
                  className="w-full rounded-2xl border border-white/10 bg-[#0B111D] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  Website / Social Page
                </span>
                <input
                  name="websiteUrl"
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-white/10 bg-[#0B111D] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  Interested Package
                </span>
                <input
                  name="interestedPackage"
                  defaultValue={selectedPackage}
                  placeholder="Supporting Sponsor"
                  className="w-full rounded-2xl border border-white/10 bg-[#0B111D] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  Budget Range
                </span>
                <select
                  name="budgetRange"
                  defaultValue=""
                  className="w-full rounded-2xl border border-white/10 bg-[#0B111D] px-4 py-3 text-sm text-white outline-none transition focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10"
                >
                  <option value="" disabled>
                    Select budget range
                  </option>
                  <option value="Below ₱10,000">Below ₱10,000</option>
                  <option value="₱10,000 - ₱25,000">₱10,000 - ₱25,000</option>
                  <option value="₱25,000 - ₱50,000">₱25,000 - ₱50,000</option>
                  <option value="₱50,000+">₱50,000+</option>
                  <option value="In-kind sponsorship">In-kind sponsorship</option>
                  <option value="To be discussed">To be discussed</option>
                </select>
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  Message / Sponsorship Goals
                </span>
                <textarea
                  name="message"
                  placeholder="Tell us what you want to sponsor, your target exposure, activation ideas, or partnership goals."
                  rows={6}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-[#0B111D] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10"
                />
              </label>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-500">
                By submitting, you agree to be contacted by the RESURGENCE partnerships team.
              </p>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-black text-[#070B12] shadow-lg shadow-[#D4AF37]/20 transition hover:-translate-y-0.5 hover:bg-[#f5d76e] focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/25"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}