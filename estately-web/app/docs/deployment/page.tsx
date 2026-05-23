import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { SectionHeader } from '@/components/ui/section-header';

export const metadata: Metadata = {
  title: 'Deployment Guide',
  description: 'Deployment guide for the Estately web app and Expo mobile web export.',
};

const docsLinks = [
  { href: '/docs/api', label: 'API Docs' },
  { href: '/docs/database-schema', label: 'Database Schema' },
  { href: '/docs/requirements', label: 'Requirements' },
  { href: '/docs/architecture', label: 'Architecture' },
  { href: '/docs/local-setup', label: 'Local Setup' },
];

const sections = [
  {
    title: '1. Deployment Overview',
    body: 'The Next.js web app contains the public website, dashboards, backend APIs, and Server Actions. The Expo mobile app can be exported as a separate static web app. Neon PostgreSQL stores production data, and Cloudflare R2 stores uploaded property images.',
    command: null,
  },
  {
    title: '2. Web App Deployment',
    body: 'Deploy estately-web to Netlify, Vercel, or another Next.js-capable platform. The committed netlify.toml makes Netlify settings explicit; Vercel can use its default Next.js preset.',
    command: `# Verify from repository root
npm run web:build

# Netlify base directory
estately-web

# Build command
npm run build

# Expected output
estately-web/.next`,
  },
  {
    title: '3. Environment Variables',
    body: 'Configure these production variables in the hosting provider dashboard. Do not commit real secrets.',
    command: `DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_APP_URL=https://your-deployed-estately-web-url.com

R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=your-r2-bucket-name

EXPO_PUBLIC_API_URL=https://your-deployed-estately-web-url.com`,
  },
  {
    title: '4. Neon Production Database',
    body: 'Create a Neon production branch or database, copy the connection string, set DATABASE_URL, then run migrations and seed only if needed.',
    command: `DATABASE_URL=postgresql://... npm run --workspace=estately-web db:migrate
DATABASE_URL=postgresql://... npm run --workspace=estately-web db:seed
DATABASE_URL=postgresql://... npm run --workspace=estately-web db:load-test`,
  },
  {
    title: '5. Cloudflare R2 Configuration',
    body: 'Create an R2 bucket, create API credentials with object read/write permission, configure bucket variables, and verify uploads through the property image workflow.',
    command: `R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=`,
  },
  {
    title: '6. Expo Mobile Web Export',
    body: 'Configure the mobile app to point at the deployed backend, export the static web build, and deploy apps/mobile/dist to Netlify or another static host. Production export requires EXPO_PUBLIC_API_URL so localhost is not baked into the build.',
    command: `EXPO_PUBLIC_API_URL=https://your-deployed-estately-web-url.com npm run mobile:export-web

# Output
apps/mobile/dist`,
  },
  {
    title: '7. Mobile API URL Configuration',
    body: 'Development points to localhost. Production points to the deployed Next.js backend origin. The mobile app appends /api/mobile automatically.',
    command: `# Development
EXPO_PUBLIC_API_URL=http://localhost:3000

# Production
EXPO_PUBLIC_API_URL=https://your-deployed-estately-web-url.com`,
  },
];

const verificationItems = [
  'Homepage loads',
  'Login works',
  'Register works',
  'Properties page loads',
  'Property details page loads',
  'Dashboard redirects when logged out and loads when logged in',
  'Admin routes reject non-admins and load for admin users',
  'Docs pages load',
  'Mobile REST API works',
  'Protected REST endpoints return 401 without a Bearer token',
  'Invalid REST requests return safe 400 errors',
  'Mobile web export loads',
  'Image upload works',
  'Uploaded images load from R2',
  'Admin login works',
];

const commonIssues = [
  {
    issue: 'API works locally but fails in production',
    causes: ['Missing environment variables', 'Incorrect DATABASE_URL', 'CORS/API URL mismatch'],
  },
  {
    issue: 'Mobile app cannot login',
    causes: ['EXPO_PUBLIC_API_URL points to the wrong backend', 'Backend deployment URL is not available'],
  },
  {
    issue: 'R2 upload fails',
    causes: ['Invalid R2 credentials', 'Bucket name mismatch', 'Token does not have write permission'],
  },
];

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-charcoal-950 p-4 text-sm leading-6 text-stone-100">
      <code>{children}</code>
    </pre>
  );
}

export default function DeploymentDocsPage() {
  return (
    <main>
      <section className="bg-slate-50 py-16 sm:py-20">
        <Container>
          <SectionHeader
            description="Deployment notes for the Next.js web/backend app, Neon production database, Cloudflare R2, and the Expo mobile web export."
            eyebrow="Developer Docs"
            title="Deployment Guide"
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
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container className="grid gap-5">
          {sections.map((section) => (
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" key={section.title}>
              <h2 className="text-2xl font-bold text-slate-950">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{section.body}</p>
              {section.command ? (
                <div className="mt-4">
                  <CodeBlock>{section.command}</CodeBlock>
                </div>
              ) : null}
            </article>
          ))}
        </Container>
      </section>

      <section className="bg-slate-50 py-14">
        <Container className="grid gap-5 lg:grid-cols-[0.8fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">8. Post-deployment Verification</h2>
            <div className="mt-5 grid gap-2">
              {verificationItems.map((item) => (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">Reviewer Credentials</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p>
                <span className="font-semibold text-slate-950">Admin:</span>{' '}
                <code>admin@estately.com / pass123</code>
              </p>
              <p>
                <span className="font-semibold text-slate-950">User:</span>{' '}
                <code>john@gmail.com / pass123</code>
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container>
          <h2 className="text-3xl font-bold text-slate-950">9. Common Deployment Issues</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {commonIssues.map((item) => (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5" key={item.issue}>
                <h3 className="text-xl font-bold text-slate-950">{item.issue}</h3>
                <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Possible causes</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600">
                  {item.causes.map((cause) => (
                    <li key={cause}>{cause}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
