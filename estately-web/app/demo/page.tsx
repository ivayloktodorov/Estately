import type { Metadata } from 'next';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/button-link';
import { Container } from '@/components/ui/container';
import { SectionHeader } from '@/components/ui/section-header';

export const metadata: Metadata = {
  title: 'Demo and Reviewer Mode',
  description: 'Reviewer guide, sample credentials, shortcuts, and test flow for Estately.',
};

interface QuickLink {
  href: string;
  label: string;
  description: string;
}

interface FeatureGroup {
  title: string;
  items: string[];
}

const platformHighlights = [
  'Web app',
  'Mobile app',
  'REST API',
  'Admin panel',
  'Property listings',
  'Favorites',
  'Property inquiries',
  'Cloudflare R2 uploads',
  'Search and filters',
];

const credentials = [
  {
    role: 'Admin',
    email: 'admin@estately.com',
    password: 'pass123',
    badge: 'Full review access',
  },
  {
    role: 'Regular User',
    email: 'john@gmail.com',
    password: 'pass123',
    badge: 'Buyer workflow',
  },
];

const quickLinks: QuickLink[] = [
  { href: '/', label: 'Home', description: 'Start from the public landing experience.' },
  { href: '/properties', label: 'Properties', description: 'Browse, search, filter, and open listing details.' },
  { href: '/login', label: 'Login', description: 'Sign in with reviewer credentials.' },
  { href: '/register', label: 'Register', description: 'Create a new test user account.' },
  { href: '/favorites', label: 'Favorites', description: 'Review saved homes for the current user.' },
  { href: '/dashboard', label: 'Dashboard', description: 'Open user property management tools.' },
  { href: '/admin', label: 'Admin Dashboard', description: 'Review moderation and platform controls.' },
  { href: '/docs/api', label: 'API Documentation', description: 'Inspect mobile REST API endpoints and payloads.' },
  { href: '/docs/architecture', label: 'Architecture Documentation', description: 'Review system structure and technical choices.' },
  { href: '/docs/database-schema', label: 'Database Documentation', description: 'Inspect tables, relationships, and indexing notes.' },
  { href: '/docs/project-health', label: 'Project Health', description: 'Review GitHub requirements and project readiness checks.' },
  { href: '/docs/production-readiness', label: 'Production Readiness', description: 'Review deployment blockers, environment checks, and audit scores.' },
  { href: '/docs/compliance', label: 'Compliance', description: 'Validate mandatory assignment requirements and completion score.' },
];

const featureGroups: FeatureGroup[] = [
  {
    title: 'Authentication',
    items: ['Register', 'Login', 'Logout'],
  },
  {
    title: 'Properties',
    items: ['Browse', 'Search', 'Filter', 'Pagination', 'Details page'],
  },
  {
    title: 'User',
    items: ['Add property', 'Edit property', 'Favorites', 'Send inquiry'],
  },
  {
    title: 'Admin',
    items: ['View dashboard', 'Moderate properties', 'Manage users'],
  },
  {
    title: 'Mobile',
    items: ['Login', 'Property list', 'Favorites', 'Search', 'Profile'],
  },
];

const reviewFlow = [
  'Login with demo account',
  'Browse properties',
  'Search properties',
  'Save favorites',
  'Add property',
  'Send inquiry',
  'Login as admin',
  'Open admin dashboard',
];

function CheckIcon() {
  return (
    <span
      aria-hidden="true"
      className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-estate-700 text-xs font-bold text-white"
    >
      ✓
    </span>
  );
}

export default function DemoPage() {
  return (
    <main>
      <section className="bg-cream-50 py-16 sm:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <SectionHeader
                description="Estately is a Zillow-inspired full-stack real estate platform built for reviewers to explore the product, API, and admin workflows quickly."
                eyebrow="Reviewer Mode"
                title="Demo and Testing Guide"
              />
              <div className="mt-8 flex flex-wrap gap-3">
                {platformHighlights.map((highlight) => (
                  <span
                    className="rounded-full border border-cream-200 bg-white px-3 py-1 text-sm font-semibold text-stone-700 shadow-sm"
                    key={highlight}
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-estate-soft">
              <h2 className="text-xl font-bold text-charcoal-950">Testing shortcuts</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Start with the regular user account for buyer flows, then switch to admin for moderation.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:flex-col">
                <ButtonLink className="flex-1" href="/login">
                  Login
                </ButtonLink>
                <ButtonLink className="flex-1" href="/properties" variant="outline">
                  Browse Properties
                </ButtonLink>
                <ButtonLink className="flex-1" href="/admin" variant="secondary">
                  Admin Dashboard
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container>
          <div className="grid gap-5 lg:grid-cols-2">
            {credentials.map((credential) => (
              <article className="rounded-xl border border-stone-200 bg-cream-50 p-5 shadow-sm" key={credential.role}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-2xl font-bold text-charcoal-950">{credential.role}</h2>
                  <span className="rounded-full bg-estate-700 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    {credential.badge}
                  </span>
                </div>
                <dl className="mt-5 grid gap-3 text-sm">
                  <div>
                    <dt className="font-semibold text-stone-500">Email</dt>
                    <dd className="mt-1 rounded-lg border border-stone-200 bg-white px-3 py-2 font-mono text-charcoal-950">
                      {credential.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-stone-500">Password</dt>
                    <dd className="mt-1 rounded-lg border border-stone-200 bg-white px-3 py-2 font-mono text-charcoal-950">
                      {credential.password}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-slate-50 py-14">
        <Container>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-estate-700">Quick Access Links</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950">Jump straight into review tasks</h2>
            </div>
            <Link className="text-sm font-semibold text-estate-700 hover:text-estate-800" href="/docs/requirements">
              Requirements
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((link) => (
              <Link
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-estate-700 hover:shadow-estate-soft"
                href={link.href}
                key={link.href}
              >
                <span className="text-lg font-bold text-slate-950 group-hover:text-estate-700">{link.label}</span>
                <p className="mt-2 text-sm leading-6 text-slate-600">{link.description}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container>
          <SectionHeader
            description="Use these checklists to verify the core web, admin, API-backed, and mobile review paths."
            eyebrow="Features To Test"
            title="Reviewer checklist"
          />

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {featureGroups.map((group) => (
              <article className="rounded-xl border border-stone-200 bg-cream-50 p-5 shadow-sm" key={group.title}>
                <h2 className="text-xl font-bold text-charcoal-950">{group.title}</h2>
                <ul className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <li className="flex gap-3 text-sm font-medium text-stone-700" key={item}>
                      <CheckIcon />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-cream-50 py-14">
        <Container>
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-estate-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-estate-700">
                  Recommended Review Flow
                </p>
                <h2 className="mt-2 text-3xl font-bold text-charcoal-950">A fast path through the product</h2>
              </div>
              <ButtonLink href="/login" variant="outline">
                Start Review
              </ButtonLink>
            </div>

            <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {reviewFlow.map((step, index) => (
                <li className="rounded-lg border border-stone-200 bg-cream-50 p-4" key={step}>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-charcoal-950 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="mt-4 text-sm font-semibold text-stone-800">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>
    </main>
  );
}
