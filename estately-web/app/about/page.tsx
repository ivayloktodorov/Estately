import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/button-link';
import { Container } from '@/components/ui/container';
import { SectionHeader } from '@/components/ui/section-header';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Estately and its modern approach to real estate search.',
};

const values = [
  'Cleaner listing discovery',
  'Secure saved-home workflows',
  'Admin tools built for scale',
];

export default function AboutPage() {
  return (
    <main>
      <section className="bg-slate-50 py-20">
        <Container className="grid gap-12 lg:grid-cols-[0.9fr_1fr] lg:items-center">
          <div>
            <SectionHeader
              description="Estately is a Zillow-inspired platform focused on helping people browse, save, and manage property decisions without clutter."
              eyebrow="About Estately"
              title="A calmer foundation for modern real estate."
            />
            <div className="mt-8">
              <ButtonLink href="/contact">Talk to us</ButtonLink>
            </div>
          </div>
          <div className="min-h-[460px] rounded-lg bg-[url('https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&auto=format&fit=crop')] bg-cover bg-center shadow-2xl shadow-slate-900/15" />
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1fr]">
            <h2 className="text-3xl font-semibold text-slate-950">What we are building</h2>
            <div className="space-y-5 text-lg leading-8 text-slate-600">
              <p>
                Real estate search should feel fast, trustworthy, and easy to revisit. Estately
                combines public browsing, account-based favorites, and protected admin workflows in
                one product foundation.
              </p>
              <p>
                The platform is designed for practical growth: strong authentication, typed data,
                responsive layouts, and a clean interface that can expand into listings, messaging,
                and property management.
              </p>
            </div>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {values.map((value) => (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6" key={value}>
                <p className="font-semibold text-slate-950">{value}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
