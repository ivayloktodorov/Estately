import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { SectionHeader } from '@/components/ui/section-header';
import type { SoftUniAccountType } from './actions';
import { SoftUniLoginButton } from './softuni-login-button';

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
    email: 'softuni_admin@estately.com',
    password: 'pass123',
    actionLabel: 'Test as Admin',
    accountType: 'admin' as SoftUniAccountType,
  },
  {
    role: 'User',
    email: 'softuni_user@estately.com',
    password: 'pass123',
    actionLabel: 'Test as User',
    accountType: 'user' as SoftUniAccountType,
  },
];

const quickAccessLinks: HubLink[] = [
  { href: '/sale', label: 'Sale Listings', description: 'Browse published sale properties as a guest.' },
  { href: '/rent', label: 'Rent Listings', description: 'Browse published rental properties as a guest.' },
  { href: '/dashboard/properties/new', label: 'Add Property', description: 'Create a pending listing as the demo user.' },
  { href: '/favorites', label: 'Favorites', description: 'Review saved properties for the signed-in user.' },
  { href: '/dashboard/offers', label: 'Offers', description: 'Check offer history after making an offer.' },
  { href: '/dashboard/messages', label: 'Messages', description: 'Review inquiry and conversation messages.' },
  { href: '/dashboard/notifications', label: 'Notifications', description: 'Check saved alerts, inquiries, offers, and moderation updates.' },
  { href: '/admin/properties', label: 'Admin Moderation', description: 'Approve or reject pending property submissions.' },
  { href: '/admin/users', label: 'Manage Users', description: 'Review user roles, status, and admin safeguards.' },
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
  { href: '/', label: 'Live Web App', description: 'Root application route for the deployed or local web app.' },
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

const reviewerFlow = [
  { href: '/sale', label: 'Browse Sale as guest', description: 'Open sale listings, use filters/search, and open a property detail page.' },
  { href: '/rent', label: 'Browse Rent as guest', description: 'Confirm rental listings are published and reachable separately from sale listings.' },
  { href: '/softuni-exam', label: 'Login as demo user', description: 'Use Test as User or softuni_user@estately.com / pass123.' },
  { href: '/favorites', label: 'Save a favorite', description: 'Open a property and use the favorite control, then confirm it appears here.' },
  { href: '/dashboard/messages', label: 'Send inquiry', description: 'Use the contact/inquiry form on a property, then check messages.' },
  { href: '/dashboard/offers', label: 'Make offer', description: 'Submit an offer from a property page, then review the offer dashboard.' },
  { href: '/dashboard/properties/new', label: 'Add property', description: 'Create a listing as the user; it should enter pending moderation.' },
  { href: '/softuni-exam', label: 'Login as admin', description: 'Use Test as Admin or softuni_admin@estately.com / pass123.' },
  { href: '/admin/properties', label: 'Approve or reject property', description: 'Moderate the pending listing and confirm publication status changes.' },
  { href: '/admin/users', label: 'Manage users', description: 'Inspect user list, roles, status controls, and self-protection safeguards.' },
  { href: '/dashboard/notifications', label: 'Check notifications/messages', description: 'Confirm moderation, inquiry, and offer examples are visible where seeded.' },
];

const deploymentUrls = [
  { label: 'Local web review', value: 'http://localhost:3000/softuni-exam' },
  { label: 'Local mobile API', value: 'http://localhost:3000/api/mobile' },
  { label: 'Production web URL', value: 'Add final deployment URL after hosting is connected.' },
  { label: 'Production mobile URL', value: 'Add Expo web/native preview URL after deployment.' },
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
                <SoftUniLoginButton accountType="user" className="flex-1">
                  Test as User
                </SoftUniLoginButton>
                <SoftUniLoginButton accountType="admin" className="flex-1" variant="secondary">
                  Test as Admin
                </SoftUniLoginButton>
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
                    <SoftUniLoginButton accountType={account.accountType} variant="outline">
                      {account.actionLabel}
                    </SoftUniLoginButton>
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
          <h2 className="text-3xl font-bold text-charcoal-950">Recommended 5-10 Minute Testing Path</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {reviewerFlow.map((step, index) => (
              <Link
                className="group flex gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-estate-700 hover:shadow-estate-soft"
                href={step.href}
                key={`${step.label}-${index}`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-estate-700 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <span>
                  <span className="text-base font-bold text-charcoal-950 group-hover:text-estate-700">{step.label}</span>
                  <span className="mt-1 block text-sm leading-6 text-stone-600">{step.description}</span>
                </span>
              </Link>
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
            <h2 className="text-3xl font-bold text-slate-950">Deployment URLs</h2>
            <div className="mt-6 grid gap-3 lg:grid-cols-2">
              {deploymentUrls.map((url) => (
                <div className="rounded-md border border-slate-200 bg-white px-4 py-3" key={url.label}>
                  <p className="text-sm font-bold text-slate-950">{url.label}</p>
                  <p className="mt-1 break-words font-mono text-sm text-slate-600">{url.value}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
