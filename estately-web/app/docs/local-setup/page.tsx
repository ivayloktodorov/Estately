import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { SectionHeader } from '@/components/ui/section-header';

export const metadata: Metadata = {
  title: 'Local Development Setup',
  description: 'Step-by-step local development setup for Estately.',
};

const docsLinks = [
  { href: '/docs/api', label: 'API Docs' },
  { href: '/docs/database-schema', label: 'Database Schema' },
  { href: '/docs/requirements', label: 'Requirements' },
  { href: '/docs/architecture', label: 'Architecture' },
];

const setupSections = [
  {
    title: '1. Prerequisites',
    body: 'Install Node.js 20+, npm 10+, Git, create a Neon PostgreSQL database, and create a Cloudflare R2 bucket for image uploads. Expo can be run through npx or the included npm scripts.',
    command: `node --version
npm --version
git --version`,
  },
  {
    title: '2. Clone Repository',
    body: 'Clone the repository supplied for review and enter the project folder.',
    command: `git clone <repository-url>
cd Estately`,
  },
  {
    title: '3. Install Dependencies',
    body: 'Install all npm workspace dependencies from the repository root.',
    command: 'npm install',
  },
  {
    title: '4. Environment Variables',
    body: 'Create root, web, or mobile env files as needed. Do not commit real secrets.',
    command: `DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret

R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=your-r2-bucket-name

EXPO_PUBLIC_API_URL=http://localhost:3000`,
  },
  {
    title: '5. Database Setup',
    body: 'Create a Neon project, copy the connection string, and set it as DATABASE_URL. Scripts load env files from the root and estately-web folder.',
    command: 'DATABASE_URL=postgresql://user:password@host/database?sslmode=require',
  },
  {
    title: '6. Database Migration',
    body: 'Apply Drizzle migrations. Use db:generate only after schema edits.',
    command: `npm run --workspace=estately-web db:migrate
npm run --workspace=estately-web db:generate`,
  },
  {
    title: '7. Database Seed',
    body: 'Seed demo users and sample data, then create or verify the 10,000+ property scalability dataset.',
    command: `npm run --workspace=estately-web db:seed
npm run --workspace=estately-web db:load-test
npm run --workspace=estately-web db:verify`,
  },
  {
    title: '8. Running Web App',
    body: 'Start the Next.js web app. Open http://localhost:3000 in the browser.',
    command: 'npm run --workspace=estately-web dev',
  },
  {
    title: '9. Running Mobile App',
    body: 'Start Expo for native simulator/device testing. Make sure the backend is running first.',
    command: `npm run mobile

cd apps/mobile
npx expo start`,
  },
  {
    title: '10. Running Expo Web',
    body: 'Run the Expo mobile app in web mode with the backend URL configured.',
    command: `EXPO_PUBLIC_API_URL=http://localhost:3000 npm run --workspace=@estately/mobile web

cd apps/mobile
EXPO_PUBLIC_API_URL=http://localhost:3000 npx expo start --web`,
  },
];

const troubleshooting = [
  {
    issue: 'Cannot connect to database',
    causes: ['Invalid DATABASE_URL', 'Neon database is paused', 'Migration not executed'],
  },
  {
    issue: 'Mobile app cannot reach API',
    causes: ['Backend is not running', 'EXPO_PUBLIC_API_URL is incorrect', 'localhost used on physical device'],
  },
  {
    issue: 'Cloudflare R2 upload fails',
    causes: ['Invalid credentials', 'Missing bucket variables', 'Bucket permissions are not configured'],
  },
  {
    issue: 'Login fails with demo credentials',
    causes: ['Seed script has not been run', 'App points to a different database', 'Demo users were deleted'],
  },
];

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-charcoal-950 p-4 text-sm leading-6 text-stone-100">
      <code>{children}</code>
    </pre>
  );
}

export default function LocalSetupPage() {
  return (
    <main>
      <section className="bg-slate-50 py-16 sm:py-20">
        <Container>
          <SectionHeader
            description="A complete local setup guide for reviewers who need to clone, configure, seed, and run Estately without additional instructions."
            eyebrow="Developer Docs"
            title="Local Development Setup"
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
          {setupSections.map((section) => (
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" key={section.title}>
              <h2 className="text-2xl font-bold text-slate-950">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{section.body}</p>
              <div className="mt-4">
                <CodeBlock>{section.command}</CodeBlock>
              </div>
            </article>
          ))}
        </Container>
      </section>

      <section className="bg-slate-50 py-14">
        <Container className="grid gap-5 lg:grid-cols-[0.8fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">Demo Credentials</h2>
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

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">Mobile API URL Notes</h2>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
              <li>iOS simulator and Expo Web can usually use `http://localhost:3000`.</li>
              <li>Android emulator usually needs `http://10.0.2.2:3000`.</li>
              <li>Physical devices must use your computer&apos;s LAN IP.</li>
            </ul>
          </div>
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container>
          <h2 className="text-3xl font-bold text-slate-950">Troubleshooting</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {troubleshooting.map((item) => (
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
