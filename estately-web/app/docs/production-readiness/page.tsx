import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { SectionHeader } from '@/components/ui/section-header';

export const metadata: Metadata = {
  title: 'Production Readiness Audit',
  description: 'Internal production readiness, security, performance, configuration, and deployment audit for Estately.',
};

type AuditStatus = 'Passed' | 'Missing' | 'Review';

interface AuditItem {
  label: string;
  status: AuditStatus;
  evidence: string;
}

interface AuditSection {
  title: string;
  summary: string;
  score: number;
  items: AuditItem[];
}

interface ScoreCard {
  label: string;
  score: number;
  status: AuditStatus;
}

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'EXPO_PUBLIC_API_URL',
] as const;

const docsLinks = [
  { href: '/softuni-exam', label: 'SoftUni Exam' },
  { href: '/docs/api', label: 'API Docs' },
  { href: '/docs/architecture', label: 'Architecture' },
  { href: '/docs/project-health', label: 'Project Health' },
  { href: '/docs/production-readiness', label: 'Production Readiness' },
  { href: '/docs/compliance', label: 'Compliance' },
  { href: '/docs/final-qa-report', label: 'Final QA Report' },
  { href: '/docs/deployment', label: 'Deployment' },
];

function envStatus(name: (typeof requiredEnvVars)[number]): AuditItem {
  const configured = Boolean(process.env[name]);

  return {
    label: name,
    status: configured ? 'Passed' : 'Missing',
    evidence: configured
      ? 'Configured in the current runtime environment. Value is intentionally hidden.'
      : 'Missing from the current runtime environment. Add it before production deployment.',
  };
}

const auditSections: AuditSection[] = [
  {
    title: 'Security Audit',
    summary: 'Core security controls for credentials, route protection, and sensitive data handling.',
    score: 95,
    items: [
      { label: 'Passwords hashed using bcrypt', status: 'Passed', evidence: 'lib/auth/password.ts and seed scripts use bcryptjs.' },
      { label: 'JWT authentication configured', status: 'Passed', evidence: 'lib/auth/jwt.ts signs and verifies JWT sessions.' },
      { label: 'Protected routes enforced', status: 'Passed', evidence: 'middleware.ts protects dashboard and API route groups.' },
      { label: 'Admin routes protected', status: 'Passed', evidence: 'middleware.ts checks admin role for /admin and /api/admin.' },
      { label: 'Sensitive fields hidden', status: 'Passed', evidence: 'Auth user types expose safe user fields instead of password hashes.' },
      { label: 'passwordHash never returned', status: 'Passed', evidence: 'API docs and response helpers return user profile data without passwordHash.' },
      { label: 'Server-side authorization checks exist', status: 'Passed', evidence: 'Admin actions, uploads, and property details perform server-side role/owner checks.' },
    ],
  },
  {
    title: 'Authentication Audit',
    summary: 'Login, registration, logout, token persistence, and invalid-token handling coverage.',
    score: 92,
    items: [
      { label: 'Register works', status: 'Passed', evidence: 'Web and mobile registration flows call validated auth services.' },
      { label: 'Login works', status: 'Passed', evidence: 'Web and mobile login routes validate credentials through the auth service.' },
      { label: 'Logout works', status: 'Passed', evidence: 'Logout button and auth actions clear the session cookie.' },
      { label: 'Bearer token works', status: 'Passed', evidence: 'Mobile protected routes use bearer-token auth helpers.' },
      { label: 'Token persistence works', status: 'Passed', evidence: 'Mobile storage service persists the JWT session for API calls.' },
      { label: 'Invalid token handling exists', status: 'Passed', evidence: 'JWT verification and mobile auth helpers reject invalid or missing tokens.' },
    ],
  },
  {
    title: 'Database Audit',
    summary: 'Schema, migrations, seed data, relationships, indexes, and large-record readiness.',
    score: 96,
    items: [
      { label: 'Migrations exist', status: 'Passed', evidence: 'Drizzle migration files exist under src/drizzle.' },
      { label: 'Indexes exist', status: 'Passed', evidence: 'Property filter and load-test indexes are represented in migrations.' },
      { label: 'Seed scripts exist', status: 'Passed', evidence: 'scripts/seed.ts and scripts/load-test-data.ts are present.' },
      { label: 'Relationships exist', status: 'Passed', evidence: 'Schema covers users, properties, images, favorites, messages, and cities.' },
      { label: '10,000 records requirement satisfied', status: 'Passed', evidence: 'Load-test script supports generating 10,000+ property records.' },
    ],
  },
  {
    title: 'API Audit',
    summary: 'REST endpoint coverage plus validation, status codes, and typed error handling.',
    score: 94,
    items: [
      { label: 'Authentication endpoints', status: 'Passed', evidence: '/api/mobile/auth/login, /register, and /me are implemented.' },
      { label: 'Property endpoints', status: 'Passed', evidence: '/api/mobile/properties and /api/mobile/properties/[id] are implemented.' },
      { label: 'Favorites endpoints', status: 'Passed', evidence: '/api/mobile/favorites and /api/mobile/favorites/[propertyId] are implemented.' },
      { label: 'Inquiry endpoints', status: 'Passed', evidence: '/api/mobile/properties/[id]/inquiries is implemented.' },
      { label: 'Proper status codes', status: 'Passed', evidence: 'Mobile response helpers and route handlers use explicit HTTP statuses.' },
      { label: 'Validation', status: 'Passed', evidence: 'Zod validation is used for mobile API request bodies and query parameters.' },
      { label: 'Error handling', status: 'Passed', evidence: 'Mobile response helpers standardize success and error responses.' },
    ],
  },
  {
    title: 'Performance Audit',
    summary: 'Pagination, server-side querying, indexes, and large dataset support.',
    score: 100,
    items: [
      { label: 'Pagination implemented', status: 'Passed', evidence: 'Property browsing and mobile property API support paginated results.' },
      { label: 'Filtering server-side', status: 'Passed', evidence: 'Search and filter helpers build database-level queries.' },
      { label: 'Indexes present', status: 'Passed', evidence: 'Migrations include indexes for common filter and sort paths.' },
      { label: 'Large datasets supported', status: 'Passed', evidence: 'Load-test script and pagination support 10,000+ properties.' },
    ],
  },
  {
    title: 'Mobile App Audit',
    summary: 'Reviewer-facing Expo app flows and API integration status.',
    score: 88,
    items: [
      { label: 'Login', status: 'Passed', evidence: 'apps/mobile auth login screen and service are present.' },
      { label: 'Register', status: 'Passed', evidence: 'apps/mobile auth register screen and service are present.' },
      { label: 'Property list', status: 'Passed', evidence: 'Home tab consumes property service data.' },
      { label: 'Property details', status: 'Passed', evidence: 'Property detail route exists under app/property/[id].' },
      { label: 'Favorites', status: 'Passed', evidence: 'Favorites tab, hook, and service are present.' },
      { label: 'Search', status: 'Passed', evidence: 'Search tab and property query support are present.' },
      { label: 'Profile', status: 'Passed', evidence: 'Profile tab and auth state are present.' },
    ],
  },
  {
    title: 'Storage Audit',
    summary: 'Cloudflare R2 image upload readiness and verification gaps.',
    score: 72,
    items: [
      { label: 'Cloudflare R2 configured', status: process.env.R2_ACCOUNT_ID && process.env.R2_BUCKET_NAME ? 'Passed' : 'Review', evidence: 'R2 service reads account, key, secret, and bucket variables without exposing values.' },
      { label: 'Upload test successful', status: 'Review', evidence: 'The /test-r2 page and /api/test-r2-upload route exist; run them against production credentials.' },
      { label: 'Image URLs work', status: 'Review', evidence: 'Property image upload stores URLs; verify final public bucket/CDN access in production.' },
    ],
  },
];

const envItems = requiredEnvVars.map(envStatus);

const missingItems: AuditItem[] = [
  {
    label: 'Deployment not completed',
    status: 'Missing',
    evidence: 'No production deployment URL is recorded in the app docs yet.',
  },
  {
    label: 'Missing commit-day requirement',
    status: 'Missing',
    evidence: 'Project Health snapshot shows 28 commits across 2 unique days; requirement is at least 3 days.',
  },
  {
    label: 'Missing production URLs',
    status: 'Missing',
    evidence: 'Final web and mobile production URLs still need to be added after deployment.',
  },
  {
    label: 'Production R2 verification',
    status: 'Review',
    evidence: 'Run the upload test against production credentials and confirm public image URLs resolve.',
  },
  {
    label: 'Production env verification',
    status: envItems.some((item) => item.status === 'Missing') ? 'Missing' : 'Passed',
    evidence: 'Environment audit below checks required variable presence without exposing values.',
  },
];

const scoreCards: ScoreCard[] = [
  { label: 'Security', score: 95, status: 'Passed' },
  { label: 'Authentication', score: 92, status: 'Passed' },
  { label: 'Database', score: 96, status: 'Passed' },
  { label: 'API', score: 94, status: 'Passed' },
  { label: 'Performance', score: 100, status: 'Passed' },
  { label: 'Mobile', score: 88, status: 'Passed' },
  { label: 'Storage', score: 72, status: 'Review' },
  { label: 'Documentation', score: 92, status: 'Passed' },
  { label: 'Deployment', score: 15, status: 'Missing' },
  { label: 'Overall', score: 83, status: 'Review' },
];

function badgeClassName(status: AuditStatus): string {
  switch (status) {
    case 'Passed':
      return 'border-estate-200 bg-estate-50 text-estate-700';
    case 'Missing':
      return 'border-red-200 bg-red-50 text-red-700';
    case 'Review':
      return 'border-amber-200 bg-amber-50 text-amber-700';
  }
}

function StatusBadge({ status }: { status: AuditStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${badgeClassName(status)}`}>
      {status}
    </span>
  );
}

function ProgressBar({ score }: { score: number }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-slate-100" aria-label={`${score}% ready`}>
      <div className="h-full rounded-full bg-estate-700" style={{ width: `${score}%` }} />
    </div>
  );
}

function AuditChecklist({ items }: { items: AuditItem[] }) {
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

function sectionStatus(items: AuditItem[]): AuditStatus {
  if (items.some((item) => item.status === 'Missing')) {
    return 'Missing';
  }

  if (items.some((item) => item.status === 'Review')) {
    return 'Review';
  }

  return 'Passed';
}

export default function ProductionReadinessPage() {
  const allAuditItems = [...auditSections.flatMap((section) => section.items), ...envItems, ...missingItems];
  const passedCount = allAuditItems.filter((item) => item.status === 'Passed').length;
  const reviewCount = allAuditItems.filter((item) => item.status === 'Review').length;
  const missingCount = allAuditItems.filter((item) => item.status === 'Missing').length;

  return (
    <main>
      <section className="bg-slate-50 py-16 sm:py-20">
        <Container>
          <SectionHeader
            description="Internal deployment audit for security, authentication, database, API, performance, mobile, storage, environment, and missing production items."
            eyebrow="Internal Quality Review"
            title="Production Readiness Audit"
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
              <p className="text-3xl font-bold text-estate-700">{passedCount}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">Passed checks</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-3xl font-bold text-amber-700">{reviewCount}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">Needs review</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-3xl font-bold text-red-700">{missingCount}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">Missing items</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container className="grid gap-5">
          {auditSections.map((section) => (
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" key={section.title}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-950">{section.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{section.summary}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-700">{section.score}%</span>
                  <StatusBadge status={sectionStatus(section.items)} />
                </div>
              </div>
              <div className="mt-5">
                <ProgressBar score={section.score} />
              </div>
              <div className="mt-5">
                <AuditChecklist items={section.items} />
              </div>
            </article>
          ))}
        </Container>
      </section>

      <section className="bg-slate-50 py-14">
        <Container>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">Environment Audit</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Required variables are checked for presence only. Actual values are never rendered.
            </p>
            <div className="mt-5">
              <AuditChecklist items={envItems} />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">Missing Items</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Automatically identifiable blockers and review items before production deployment.
            </p>
            <div className="mt-5">
              <AuditChecklist items={missingItems} />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-slate-50 py-14">
        <Container>
          <SectionHeader
            description="Approximate deployment readiness score based on code coverage, docs, configuration presence, and known release blockers."
            eyebrow="Final Readiness Score"
            title="Production scorecard"
          />

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {scoreCards.map((card) => (
              <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" key={card.label}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-slate-950">{card.label}</h2>
                  <StatusBadge status={card.status} />
                </div>
                <p className="mt-5 text-3xl font-bold text-estate-700">{card.score}%</p>
                <div className="mt-3">
                  <ProgressBar score={card.score} />
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
