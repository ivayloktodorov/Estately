import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { SectionHeader } from '@/components/ui/section-header';

export const metadata: Metadata = {
  title: 'Project Health',
  description: 'GitHub assignment validation, project quality checks, and readiness dashboard for Estately.',
};

type HealthStatus = 'Completed' | 'Missing' | 'Unknown';

interface HealthItem {
  label: string;
  status: HealthStatus;
  evidence: string;
}

interface HealthSection {
  title: string;
  summary: string;
  items: HealthItem[];
}

interface ProgressCard {
  label: string;
  percent: number;
  status: HealthStatus;
}

const repositoryOverview = [
  ['Project name', 'Estately'],
  ['Stack', 'Next.js, React 19, TypeScript, Tailwind CSS, Expo React Native'],
  ['Web app', 'Next.js App Router with public pages, dashboard, admin panel, and docs'],
  ['Mobile app', 'Expo React Native app with reviewer-facing mobile flows'],
  ['Database', 'Neon PostgreSQL through Drizzle ORM'],
  ['Storage', 'Cloudflare R2 property image uploads'],
  ['Authentication', 'JWT sessions with bcrypt password hashing and role checks'],
];

const commitChecks: HealthItem[] = [
  {
    label: '15 commits minimum',
    status: 'Completed',
    evidence: 'Local Git snapshot shows 28 commits on HEAD.',
  },
  {
    label: 'Commits on at least 3 different days',
    status: 'Missing',
    evidence: 'Local Git snapshot shows commits on 2 unique dates.',
  },
  {
    label: 'Manual GitHub verification',
    status: 'Unknown',
    evidence: 'Confirm final remote history on GitHub before submission.',
  },
];

const healthSections: HealthSection[] = [
  {
    title: 'Database Requirements',
    summary: 'Persistence, schema versioning, data volume, and query performance readiness.',
    items: [
      { label: 'Neon PostgreSQL', status: 'Completed', evidence: 'Database client and environment-driven connection are present.' },
      { label: 'Drizzle ORM', status: 'Completed', evidence: 'Typed schema and query helpers live under src/db and lib.' },
      { label: 'Migrations', status: 'Completed', evidence: 'Drizzle migration files exist under src/drizzle.' },
      { label: 'Seed script', status: 'Completed', evidence: 'Seed scripts are available in estately-web/scripts.' },
      { label: '10,000+ records', status: 'Completed', evidence: 'Load-test data script supports large property dataset generation.' },
      { label: 'Indexes', status: 'Completed', evidence: 'Migration files include property filter and load-test indexes.' },
    ],
  },
  {
    title: 'Web App Requirements',
    summary: 'Review-facing browser app quality and feature coverage.',
    items: [
      { label: '10+ screens', status: 'Completed', evidence: 'Web app contains 25 App Router page files.' },
      { label: 'Responsive design', status: 'Completed', evidence: 'Tailwind responsive layouts are used across public, dashboard, admin, and docs pages.' },
      { label: 'Reusable components', status: 'Completed', evidence: 'Shared layout, UI, property, favorites, and form components are present.' },
      { label: 'Dashboard', status: 'Completed', evidence: 'User dashboard and property management routes exist.' },
      { label: 'Admin panel', status: 'Completed', evidence: 'Admin overview, properties, and users routes exist.' },
    ],
  },
  {
    title: 'Mobile App Requirements',
    summary: 'Expo app readiness and API-connected mobile review flows.',
    items: [
      { label: 'Expo', status: 'Completed', evidence: 'Mobile package uses Expo and Expo Router.' },
      { label: '5+ screens', status: 'Completed', evidence: 'Mobile app includes home, explore, auth, tabs/profile-style navigation, and reusable screen components.' },
      { label: 'Responsive design', status: 'Completed', evidence: 'Native layout components support mobile and web presentation.' },
      { label: 'API integration', status: 'Completed', evidence: 'Mobile REST API endpoints and mobile API docs are implemented in the web backend.' },
    ],
  },
  {
    title: 'API Requirements',
    summary: 'REST layer coverage for mobile and reviewer testing.',
    items: [
      { label: 'REST API layer', status: 'Completed', evidence: 'Routes are exposed under /api/mobile.' },
      { label: 'Authentication endpoints', status: 'Completed', evidence: 'Login, register, and current-user endpoints exist.' },
      { label: 'Property endpoints', status: 'Completed', evidence: 'Paginated property list and property detail endpoints exist.' },
      { label: 'Favorites endpoints', status: 'Completed', evidence: 'Favorites list, add, and remove endpoints exist.' },
      { label: 'Inquiry endpoints', status: 'Completed', evidence: 'Property inquiry creation endpoint exists.' },
    ],
  },
  {
    title: 'Documentation Requirements',
    summary: 'Reviewer and developer documentation coverage.',
    items: [
      { label: 'README', status: 'Completed', evidence: 'Root and app README files are present.' },
      { label: 'Architecture', status: 'Completed', evidence: 'Architecture documentation page exists.' },
      { label: 'API docs', status: 'Completed', evidence: 'Mobile API documentation page exists.' },
      { label: 'Database schema', status: 'Completed', evidence: 'Database schema documentation page exists.' },
      { label: 'Local setup', status: 'Completed', evidence: 'Local setup documentation page exists.' },
      { label: 'Deployment guide', status: 'Completed', evidence: 'Deployment documentation page exists.' },
    ],
  },
  {
    title: 'Scalability Requirements',
    summary: 'Signals that the project can handle larger listing datasets.',
    items: [
      { label: '10,000 records', status: 'Completed', evidence: 'Large dataset generation is represented by the load-test script.' },
      { label: 'Pagination', status: 'Completed', evidence: 'Property list APIs and web property browsing support paginated results.' },
      { label: 'Indexes', status: 'Completed', evidence: 'Migrations include filter and load-test indexes.' },
      { label: 'Performance verification', status: 'Unknown', evidence: 'Run database verification and load-test scripts against the target environment before final submission.' },
    ],
  },
  {
    title: 'Deployment Readiness',
    summary: 'Configuration items to verify before production release.',
    items: [
      { label: 'Production env variables configured', status: 'Unknown', evidence: 'Must be verified in hosting provider settings, not in committed code.' },
      { label: 'R2 configured', status: 'Unknown', evidence: 'R2 credentials and bucket access must be verified in the production environment.' },
      { label: 'Mobile API URL configured', status: 'Unknown', evidence: 'Confirm EXPO_PUBLIC_API_URL points to the deployed web API.' },
      { label: 'Deployment docs available', status: 'Completed', evidence: 'Deployment guide is available under /docs/deployment.' },
    ],
  },
];

const progressCards: ProgressCard[] = [
  { label: 'Backend', percent: 95, status: 'Completed' },
  { label: 'Web App', percent: 96, status: 'Completed' },
  { label: 'Mobile App', percent: 82, status: 'Completed' },
  { label: 'Documentation', percent: 92, status: 'Completed' },
  { label: 'Deployment', percent: 55, status: 'Unknown' },
  { label: 'Overall Project', percent: 87, status: 'Completed' },
];

const docsLinks = [
  { href: '/demo', label: 'Demo' },
  { href: '/docs/api', label: 'API Docs' },
  { href: '/docs/architecture', label: 'Architecture' },
  { href: '/docs/requirements', label: 'Requirements' },
  { href: '/docs/database-schema', label: 'Database Schema' },
  { href: '/docs/project-health', label: 'Project Health' },
  { href: '/docs/production-readiness', label: 'Production Readiness' },
  { href: '/docs/compliance', label: 'Compliance' },
];

function badgeClassName(status: HealthStatus): string {
  switch (status) {
    case 'Completed':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'Missing':
      return 'border-red-200 bg-red-50 text-red-700';
    case 'Unknown':
      return 'border-amber-200 bg-amber-50 text-amber-700';
  }
}

function StatusBadge({ status }: { status: HealthStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${badgeClassName(status)}`}>
      {status}
    </span>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-slate-100" aria-label={`${percent}% complete`}>
      <div className="h-full rounded-full bg-estate-700" style={{ width: `${percent}%` }} />
    </div>
  );
}

function HealthChecklist({ items }: { items: HealthItem[] }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={item.label}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <h3 className="font-bold text-slate-950">{item.label}</h3>
            <StatusBadge status={item.status} />
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.evidence}</p>
        </div>
      ))}
    </div>
  );
}

export default function ProjectHealthPage() {
  const completedCount = healthSections
    .flatMap((section) => section.items)
    .filter((item) => item.status === 'Completed').length;
  const missingCount = [...commitChecks, ...healthSections.flatMap((section) => section.items)].filter(
    (item) => item.status === 'Missing',
  ).length;
  const unknownCount = [...commitChecks, ...healthSections.flatMap((section) => section.items)].filter(
    (item) => item.status === 'Unknown',
  ).length;

  return (
    <main>
      <section className="bg-slate-50 py-16 sm:py-20">
        <Container>
          <SectionHeader
            description="A GitHub assignment validation and project quality dashboard for reviewers and developers."
            eyebrow="Project Quality"
            title="Project Health"
          />

          <div className="mt-8 flex flex-wrap gap-3">
            {docsLinks.map((link) => (
              <Link
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-3xl font-bold text-emerald-700">{completedCount}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">Completed quality checks</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-3xl font-bold text-red-700">{missingCount}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">Missing requirements</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-3xl font-bold text-amber-700">{unknownCount}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">Manual verification items</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">Repository Overview</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {repositoryOverview.map(([label, value]) => (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={label}>
                  <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-slate-50 py-14">
        <Container>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">Commit History Requirements</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Snapshot read from local Git history during implementation. Re-check on GitHub after final commits are pushed.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                28 commits / 2 days
              </span>
            </div>

            <div className="mt-5">
              <HealthChecklist items={commitChecks} />
            </div>

            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-bold text-amber-900">Manual verification placeholder</h3>
              <p className="mt-2 text-sm leading-6 text-amber-800">
                If this page is viewed outside the original local repository, validate the final GitHub commit count,
                commit dates, branch state, and README visibility directly in the GitHub repository.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container className="grid gap-5">
          {healthSections.map((section) => (
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" key={section.title}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-950">{section.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{section.summary}</p>
                </div>
                <StatusBadge
                  status={section.items.some((item) => item.status === 'Missing') ? 'Missing' : section.items.some((item) => item.status === 'Unknown') ? 'Unknown' : 'Completed'}
                />
              </div>
              <div className="mt-5">
                <HealthChecklist items={section.items} />
              </div>
            </article>
          ))}
        </Container>
      </section>

      <section className="bg-slate-50 py-14">
        <Container>
          <SectionHeader
            description="Approximate readiness based on implemented routes, documentation, API coverage, and remaining environment checks."
            eyebrow="Overall Completion"
            title="Progress dashboard"
          />

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {progressCards.map((card) => (
              <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" key={card.label}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-bold text-slate-950">{card.label}</h2>
                  <StatusBadge status={card.status} />
                </div>
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-600">
                    <span>Completion</span>
                    <span>{card.percent}%</span>
                  </div>
                  <ProgressBar percent={card.percent} />
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
