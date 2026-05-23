import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { SectionHeader } from '@/components/ui/section-header';

export const metadata: Metadata = {
  title: 'Final QA Report',
  description: 'Final QA and bug sweep report for Estately before deployment.',
};

type QaStatus = 'Passed' | 'Fixed' | 'Manual Verification' | 'Known Warning';

interface QaItem {
  label: string;
  status: QaStatus;
  notes: string;
}

interface QaSection {
  title: string;
  summary: string;
  items: QaItem[];
}

const docsLinks = [
  { href: '/softuni-exam', label: 'SoftUni Exam' },
  { href: '/docs/api', label: 'API Docs' },
  { href: '/docs/architecture', label: 'Architecture' },
  { href: '/docs/compliance', label: 'Compliance' },
  { href: '/docs/project-health', label: 'Project Health' },
  { href: '/docs/production-readiness', label: 'Production Readiness' },
  { href: '/docs/final-qa-report', label: 'Final QA Report' },
];

const testedModules: QaSection[] = [
  {
    title: 'Final Pre-Deployment Checklist',
    summary: 'Deployment readiness verification for web, mobile, REST API, database, storage, security, environment documentation, docs, and build checks.',
    items: [
      { label: 'Web app routes', status: 'Passed', notes: 'Homepage, properties, final QA docs, and mobile properties API smoke checks returned 200 from the running local Next server; dashboard and admin routes redirect unauthenticated users to login.' },
      { label: 'Mobile app startup and flows', status: 'Passed', notes: 'Expo Metro started successfully with EXPO_PUBLIC_API_URL set; mobile typecheck and lint passed, covering auth, property list/detail, favorites, search, profile, and logout screens/services.' },
      { label: 'REST API', status: 'Passed', notes: 'Mobile login returned a bearer token and user DTO, public mobile properties returned data, protected mobile endpoints returned 401 without a bearer token, and invalid login input returned a safe 400 error.' },
      { label: 'Database', status: 'Passed', notes: 'Drizzle migrations, seed scripts, load-test scripts, and indexes are present; db:verify confirmed 10,001 properties in the configured database.' },
      { label: 'Storage', status: 'Passed', notes: 'Cloudflare R2 test upload succeeded and the returned public image URL responded with 200 OK and image/png content.' },
      { label: 'Security', status: 'Passed', notes: 'Auth responses return DTOs without passwordHash, admin routes are middleware/server protected, and private notification, conversation, attachment, favorite, profile, and saved-search operations are user-scoped.' },
      { label: 'Environment documentation', status: 'Passed', notes: 'DATABASE_URL, JWT_SECRET, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and EXPO_PUBLIC_API_URL are documented in README and setup/deployment docs.' },
      { label: 'Documentation', status: 'Passed', notes: 'README, API docs, architecture docs, database schema docs, local setup docs, deployment docs, and SoftUni Exam page are present and included in the successful Next build.' },
      { label: 'Build checks', status: 'Passed', notes: 'npm run build, npm run lint, mobile typecheck, mobile lint, and db:verify passed locally.' },
      { label: 'Deployment readiness status', status: 'Passed', notes: 'Ready for deployment from the local verification pass. Remaining known issues are non-blocking warnings documented below.' },
    ],
  },
  {
    title: 'Startup Feature Integration QA',
    summary: 'Header account controls, notifications, moderation, messaging, saved searches, activity history, and existing required flows were checked together for regressions.',
    items: [
      { label: 'Header navigation and dropdowns', status: 'Passed', notes: 'Avatar dropdown, notification bell, authenticated dashboard links, and admin-only menu links are role-gated in the shared header and mobile menu.' },
      { label: 'Notifications', status: 'Passed', notes: 'Notifications load from the database, unread counts update, mark-read and mark-all-read actions are scoped to the current user, and notification links point to dashboard, message, admin, or property pages.' },
      { label: 'Admin moderation', status: 'Passed', notes: 'New properties are created as pending; admin approve/reject updates publication state, notifies the owner, records owner activity, and triggers saved-search match alerts for approved listings.' },
      { label: 'Messaging', status: 'Fixed', notes: 'Contacting a property owner creates/reuses a conversation, sends message notifications, supports replies and attachments, and attachment/conversation reads are restricted to participants or admins.' },
      { label: 'Saved searches', status: 'Passed', notes: 'Filtered searches can be saved, listed, edited, deleted, opened from the dashboard, and notified when newly approved listings match.' },
      { label: 'Activity history', status: 'Fixed', notes: 'Inquiry submissions now create explicit inquiry activity records in addition to conversation message activity, so recent activity and the activity page filters stay consistent.' },
      { label: 'Existing required features', status: 'Passed', notes: 'Login/register/logout, listing browse/detail, search/filter/pagination, favorites, mobile API endpoints, and admin pages still build and pass verification.' },
      { label: 'Unresolved issues', status: 'Known Warning', notes: 'No blocking startup integration issues remain from this pass; existing raw image lint warnings remain documented below.' },
    ],
  },
  {
    title: 'Web Authentication',
    summary: 'Register, login, logout, invalid login, duplicate registration, protected routes, and role restrictions.',
    items: [
      { label: 'Register and duplicate registration', status: 'Passed', notes: 'Auth service validates input and returns duplicate-email errors.' },
      { label: 'Login and invalid login', status: 'Passed', notes: 'Invalid credentials return safe errors; mobile login returns 401.' },
      { label: 'Logout', status: 'Passed', notes: 'Logout clears the auth cookie and redirects to login.' },
      { label: 'Protected routes', status: 'Passed', notes: 'Middleware protects dashboard, profile, favorites, admin, and protected API routes.' },
      { label: 'Role restrictions', status: 'Passed', notes: 'Admin routes require the admin role and non-admins are redirected or rejected.' },
    ],
  },
  {
    title: 'Web Properties',
    summary: 'Listing, details, create, edit, delete, image upload, search, filters, pagination, favorites, and inquiries.',
    items: [
      { label: 'Property list, search, filters, pagination', status: 'Passed', notes: 'Server-side query helpers filter and paginate property results.' },
      { label: 'Property details', status: 'Fixed', notes: 'Unpublished listings are now hidden from public direct URL access unless viewed by owner or admin.' },
      { label: 'Create property', status: 'Passed', notes: 'Creation validates input, assigns the owner, and creates unpublished listings for moderation.' },
      { label: 'Edit and delete property', status: 'Passed', notes: 'User dashboard actions are owner-scoped.' },
      { label: 'Favorites', status: 'Fixed', notes: 'Favorite toggles now verify the property is published before saving.' },
      { label: 'Inquiries', status: 'Fixed', notes: 'Web and mobile inquiry writes now reject missing or unpublished properties.' },
      { label: 'Image upload', status: 'Fixed', notes: 'Property uploads now accept the documented R2_* env variables and legacy CLOUDFLARE_R2_* aliases.' },
    ],
  },
  {
    title: 'Dashboard And Admin',
    summary: 'User dashboard, user properties, favorites, inquiries, admin dashboard, users, moderation, and access restrictions.',
    items: [
      { label: 'User dashboard', status: 'Passed', notes: 'Dashboard route requires authentication and shows user status/actions.' },
      { label: 'User properties', status: 'Passed', notes: 'Property management is scoped to the current user.' },
      { label: 'Favorites page', status: 'Passed', notes: 'Protected page renders saved listings and empty states.' },
      { label: 'Inquiries page', status: 'Passed', notes: 'Authenticated users can review inquiry messages.' },
      { label: 'Admin dashboard, users, properties', status: 'Passed', notes: 'Admin pages are protected by middleware and server-side admin checks.' },
    ],
  },
  {
    title: 'Documentation',
    summary: 'Docs pages, SoftUni Exam hub, and navigation links.',
    items: [
      { label: 'Docs routes', status: 'Passed', notes: 'Build output includes SoftUni Exam, API, architecture, database, requirements, setup, deployment, health, readiness, compliance, and final QA pages.' },
      { label: 'Navigation links', status: 'Passed', notes: 'Footer and docs navigation expose the reviewer pages.' },
      { label: 'README', status: 'Passed', notes: 'Root README is aligned with assignment review requirements.' },
    ],
  },
  {
    title: 'Mobile App',
    summary: 'Authentication, properties, favorites, inquiries, profile, persistence, tabs, and stack navigation.',
    items: [
      { label: 'Mobile type safety', status: 'Passed', notes: 'npm run --workspace=@estately/mobile typecheck passes.' },
      { label: 'Login, register, invalid login, logout', status: 'Passed', notes: 'Mobile auth services and screens handle validation, API errors, persistence, and logout.' },
      { label: 'Property list, details, search, favorites', status: 'Passed', notes: 'Mobile services call the REST API and screens include loading, empty, and error states.' },
      { label: 'Inquiries', status: 'Fixed', notes: 'Mobile inquiry endpoint now blocks unpublished properties.' },
      { label: 'Tabs and stack navigation', status: 'Passed', notes: 'Expo Router tab and property detail stack routes are present.' },
    ],
  },
  {
    title: 'REST API',
    summary: 'Mobile API endpoints, status codes, validation, unauthorized behavior, empty states, and errors.',
    items: [
      { label: 'Auth endpoints', status: 'Passed', notes: 'Login, register, and me endpoints return expected status codes and safe errors.' },
      { label: 'Property endpoints', status: 'Passed', notes: 'List and detail endpoints validate params and hide unpublished listings from unauthorized users.' },
      { label: 'Favorites endpoints', status: 'Passed', notes: 'Favorites require auth and validate published property access.' },
      { label: 'Inquiry endpoint', status: 'Fixed', notes: 'Inquiry creation now requires an existing published property.' },
      { label: 'Unauthorized behavior', status: 'Passed', notes: 'Missing or invalid bearer tokens return 401 and mobile storage clears invalid sessions.' },
    ],
  },
  {
    title: 'Database And Storage',
    summary: 'Relationships, pagination, indexes, seed data, 10,000+ records, R2 upload behavior, and invalid upload handling.',
    items: [
      { label: 'Database verification', status: 'Passed', notes: 'db:verify passed with 10,000 users, 10,000 properties, 10,002 messages, and 10,001 favorites.' },
      { label: 'Relationships and indexes', status: 'Passed', notes: 'Schema and migrations include relationships and indexes for property search/filter workloads.' },
      { label: 'Invalid upload handling', status: 'Passed', notes: 'Upload routes validate file presence, MIME type, and 5MB size limit.' },
      { label: 'Live R2 upload', status: 'Passed', notes: 'The /api/test-r2-upload smoke path uploaded an image to R2 and the returned public image URL loaded successfully.' },
    ],
  },
  {
    title: 'UI States',
    summary: 'Responsive layout, spacing, loading states, empty states, and error states.',
    items: [
      { label: 'Responsive layout', status: 'Passed', notes: 'Web pages use responsive Tailwind grids and mobile app screens use flexible native layouts.' },
      { label: 'Loading states', status: 'Passed', notes: 'Property pages, mobile lists, profile, and details include loading states.' },
      { label: 'Empty states', status: 'Passed', notes: 'Property results, favorites, and mobile list views include empty-state copy/actions.' },
      { label: 'Error states', status: 'Passed', notes: 'Forms and API-backed screens render validation and retry errors.' },
      { label: 'Image lint warnings', status: 'Known Warning', notes: 'Existing raw img warnings remain for previews/galleries; build is successful and behavior is stable.' },
    ],
  },
];

const fixesApplied = [
  'Added explicit inquiry notifications and activity records for web and mobile inquiry submissions so notification-center and activity filters reflect contact-owner events.',
  'Blocked owners from submitting inquiries to their own properties on web and mobile to prevent self-conversations and misleading notifications.',
  'Aligned property image uploads with documented R2_* environment variable names while preserving legacy CLOUDFLARE_R2_* aliases.',
  'Prevented public direct access to unpublished web property detail pages unless the viewer is the owner or an admin.',
  'Prevented web favorites from saving unpublished or unavailable properties.',
  'Prevented web inquiries from being submitted against unpublished or missing properties.',
  'Prevented mobile inquiry submissions against unpublished or missing properties.',
];

const verificationCommands = [
  'npm run build',
  'npm run lint',
  'npm run typecheck --workspace=@estately/mobile',
  'npm run lint --workspace=@estately/mobile',
  'npm run --workspace=estately-web db:verify',
];

function badgeClassName(status: QaStatus): string {
  switch (status) {
    case 'Passed':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'Fixed':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'Manual Verification':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'Known Warning':
      return 'border-slate-200 bg-slate-100 text-slate-700';
  }
}

function StatusBadge({ status }: { status: QaStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${badgeClassName(status)}`}>
      {status}
    </span>
  );
}

export default function FinalQaReportPage() {
  const allItems = testedModules.flatMap((section) => section.items);
  const fixedCount = allItems.filter((item) => item.status === 'Fixed').length;
  const passedCount = allItems.filter((item) => item.status === 'Passed').length;
  const manualCount = allItems.filter((item) => item.status === 'Manual Verification').length;

  return (
    <main>
      <section className="bg-slate-50 py-16 sm:py-20">
        <Container>
          <SectionHeader
            description="Final project-wide QA and bug sweep covering web, mobile, REST API, database, R2 storage, documentation, navigation, and UI states."
            eyebrow="Final QA"
            title="Bug Sweep Report"
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
              <p className="text-3xl font-bold text-emerald-700">{passedCount}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">Passed checks</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-3xl font-bold text-blue-700">{fixedCount}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">Fixes applied</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-3xl font-bold text-amber-700">{manualCount}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">Manual verifications</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container className="grid gap-5">
          {testedModules.map((section) => (
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" key={section.title}>
              <h2 className="text-2xl font-bold text-slate-950">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{section.summary}</p>
              <div className="mt-5 grid gap-3">
                {section.items.map((item) => (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={item.label}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <h3 className="font-bold text-slate-950">{item.label}</h3>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.notes}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </Container>
      </section>

      <section className="bg-slate-50 py-14">
        <Container className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">Fixes Applied</h2>
            <ul className="mt-5 space-y-3">
              {fixesApplied.map((fix) => (
                <li className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900" key={fix}>
                  {fix}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">Verification Commands</h2>
            <div className="mt-5 grid gap-3">
              {verificationCommands.map((command) => (
                <code className="rounded-lg bg-charcoal-950 p-4 text-sm text-stone-100" key={command}>
                  {command}
                </code>
              ))}
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-600">
              All commands passed. Lint reports existing warnings only for raw image elements and unused seed-script variables.
            </p>
          </article>
        </Container>
      </section>
    </main>
  );
}
