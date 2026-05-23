import type { Metadata } from 'next';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/button-link';
import { Container } from '@/components/ui/container';
import { SectionHeader } from '@/components/ui/section-header';

export const metadata: Metadata = {
  title: 'SoftUni Exam',
  description: 'Everything required for Estately project evaluation in one place.',
};

interface HubLink {
  href: string;
  label: string;
  description: string;
}

const demoAccounts = [
  {
    role: 'Admin',
    email: 'admin@estately.com',
    password: 'pass123',
    actionLabel: 'Login as Admin',
    href: '/login?email=admin%40estately.com',
  },
  {
    role: 'User',
    email: 'john@gmail.com',
    password: 'pass123',
    actionLabel: 'Login as User',
    href: '/login?email=john%40gmail.com',
  },
];

const quickAccessLinks: HubLink[] = [
  { href: '/properties', label: 'Browse Properties', description: 'Search, filter, paginate, and open property details.' },
  { href: '/dashboard', label: 'Dashboard', description: 'Open the authenticated user workspace.' },
  { href: '/favorites', label: 'Favorites', description: 'Review saved properties for the signed-in user.' },
  { href: '/admin', label: 'Admin Dashboard', description: 'Inspect moderation, listings, users, and platform stats.' },
  { href: '/docs/api', label: 'API Documentation', description: 'Review REST endpoints, payloads, auth, and responses.' },
  { href: '/docs/database-schema', label: 'Database Schema', description: 'Inspect tables, relationships, and indexing notes.' },
];

const requirementsCoverage = [
  'Backend + Web + Mobile',
  'JWT Authentication',
  'Admin Panel',
  'REST API',
  'Neon + Drizzle',
  'Cloudflare R2',
  '10,000+ records',
  'Pagination',
  'Mobile App',
  'Documentation',
];

const technicalResources: HubLink[] = [
  { href: '/docs/api', label: 'API Docs', description: 'Endpoint reference for web and mobile review.' },
  { href: '/docs/database-schema', label: 'Database Schema', description: 'Tables, relations, and data model overview.' },
  { href: '/docs/requirements', label: 'Requirements', description: 'Assignment requirements and implementation evidence.' },
  { href: '/docs/architecture', label: 'Architecture', description: 'Monorepo, web, mobile, API, and storage design.' },
  { href: '/docs/project-health', label: 'Project Health', description: 'Completion status and platform readiness notes.' },
  { href: '/docs/production-readiness', label: 'Production Readiness', description: 'Deployment, environment, and operational checks.' },
  { href: '/docs/compliance', label: 'Compliance', description: 'Mandatory exam criteria and final compliance status.' },
  { href: '/docs/final-qa-report', label: 'Final QA Report', description: 'Bug sweep, verification status, and remaining manual checks.' },
  { href: '/docs/local-setup', label: 'Local Setup', description: 'Steps for running the project locally.' },
  { href: '/docs/deployment', label: 'Deployment', description: 'Deployment process and production configuration.' },
];

const testingChecklist = [
  'Register new user',
  'Login',
  'Browse properties',
  'Search/filter',
  'Add favorite',
  'Send inquiry',
  'Open dashboard',
  'Test admin panel',
  'Test mobile app',
];

function StatusCard({ label }: { label: string }) {
  return (
    <article className="flex min-h-24 items-start gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <span
        aria-hidden="true"
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-estate-700 text-sm font-bold text-white"
      >
        ✓
      </span>
      <h3 className="text-base font-bold leading-6 text-charcoal-950">{label}</h3>
    </article>
  );
}

function LinkCard({ link }: { link: HubLink }) {
  return (
    <Link
      className="group rounded-lg border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-estate-700 hover:shadow-estate-soft"
      href={link.href}
    >
      <span className="text-lg font-bold text-charcoal-950 group-hover:text-estate-700">{link.label}</span>
      <p className="mt-2 text-sm leading-6 text-stone-600">{link.description}</p>
    </Link>
  );
}

export default function SoftUniExamPage() {
  return (
    <main>
      <section className="bg-cream-50 py-16 sm:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <SectionHeader
              description="Everything required for project evaluation in one place."
              eyebrow="Reviewer Hub"
              title="SoftUni Exam"
            />
            <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-estate-soft">
              <h2 className="text-2xl font-bold text-charcoal-950">Review path</h2>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                Start with a user account, validate the property workflow, then switch to admin tools and technical documentation.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col">
                <ButtonLink className="flex-1" href="/login?email=john%40gmail.com">
                  Login as User
                </ButtonLink>
                <ButtonLink className="flex-1" href="/login?email=admin%40estately.com" variant="secondary">
                  Login as Admin
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container>
          <div className="rounded-lg border border-stone-200 bg-cream-50 p-6 shadow-sm">
            <h2 className="text-3xl font-bold text-charcoal-950">Demo Accounts</h2>
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {demoAccounts.map((account) => (
                <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm" key={account.email}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="text-2xl font-bold text-charcoal-950">{account.role}</h3>
                    <ButtonLink href={account.href} variant="outline">
                      {account.actionLabel}
                    </ButtonLink>
                  </div>
                  <dl className="mt-5 grid gap-3 text-sm">
                    <div>
                      <dt className="font-semibold text-stone-500">Email</dt>
                      <dd className="mt-1 rounded-md border border-stone-200 bg-cream-50 px-3 py-2 font-mono text-charcoal-950">
                        {account.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-stone-500">Password</dt>
                      <dd className="mt-1 rounded-md border border-stone-200 bg-cream-50 px-3 py-2 font-mono text-charcoal-950">
                        {account.password}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-slate-50 py-14">
        <Container>
          <h2 className="text-3xl font-bold text-slate-950">Quick Access</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickAccessLinks.map((link) => (
              <LinkCard key={link.href} link={link} />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container>
          <h2 className="text-3xl font-bold text-charcoal-950">Project Requirements Coverage</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {requirementsCoverage.map((requirement) => (
              <StatusCard key={requirement} label={requirement} />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-cream-50 py-14">
        <Container>
          <h2 className="text-3xl font-bold text-charcoal-950">Technical Resources</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {technicalResources.map((link) => (
              <LinkCard key={link.href} link={link} />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container>
          <div className="rounded-lg border border-stone-200 bg-slate-50 p-6 shadow-sm">
            <h2 className="text-3xl font-bold text-slate-950">Testing Checklist</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {testingChecklist.map((item) => (
                <label
                  className="flex min-h-12 items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800"
                  key={item}
                >
                  <input
                    className="h-4 w-4 rounded border-slate-300 text-estate-700 focus:ring-estate-700"
                    type="checkbox"
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
