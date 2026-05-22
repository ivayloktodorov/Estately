import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { SectionHeader } from '@/components/ui/section-header';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact the Estately team.',
};

export default function ContactPage() {
  return (
    <main className="bg-slate-50 py-20">
      <Container className="grid gap-10 lg:grid-cols-[0.8fr_1fr]">
        <div>
          <SectionHeader
            description="Questions about listings, saved homes, or platform access? Send a note and the team will follow up."
            eyebrow="Contact"
            title="Let us help with your next move."
          />
          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            <p className="font-semibold text-slate-950">Estately HQ</p>
            <p className="mt-2">123 Market Street</p>
            <p>San Francisco, CA</p>
            <p className="mt-4">hello@estately.example</p>
          </div>
        </div>

        <form className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="name">
                Name
              </label>
              <input
                className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                id="name"
                name="name"
                type="text"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                Email
              </label>
              <input
                className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                id="email"
                name="email"
                type="email"
              />
            </div>
          </div>
          <div className="mt-5">
            <label className="text-sm font-medium text-slate-700" htmlFor="message">
              Message
            </label>
            <textarea
              className="mt-2 min-h-36 w-full rounded-md border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              id="message"
              name="message"
            />
          </div>
          <button
            className="mt-5 h-12 rounded-md bg-emerald-700 px-6 font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
            type="button"
          >
            Send message
          </button>
        </form>
      </Container>
    </main>
  );
}
