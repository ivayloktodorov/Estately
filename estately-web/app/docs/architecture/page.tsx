import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { SectionHeader } from '@/components/ui/section-header';

export const metadata: Metadata = {
  title: 'Architecture Documentation',
  description: 'Visual architecture overview for the Estately platform.',
};

const docsLinks = [
  { href: '/docs/api', label: 'API Docs' },
  { href: '/docs/database-schema', label: 'Database Schema' },
  { href: '/docs/requirements', label: 'Requirements' },
  { href: '/docs/architecture', label: 'Architecture' },
  { href: '/docs/project-health', label: 'Project Health' },
  { href: '/docs/production-readiness', label: 'Production Readiness' },
  { href: '/docs/compliance', label: 'Compliance' },
  { href: '/docs/final-qa-report', label: 'Final QA Report' },
];

const monorepoItems = [
  { path: 'estately-web/app', purpose: 'Next.js App Router pages, dashboards, and API routes.' },
  { path: 'apps/mobile/app', purpose: 'Expo Router screens for auth, tabs, and property details.' },
  { path: 'estately-web/components', purpose: 'Reusable web UI, property cards, filters, forms, and layout.' },
  { path: 'apps/mobile/components', purpose: 'Reusable mobile UI and property components.' },
  { path: 'estately-web/lib', purpose: 'Auth, validation, properties, favorites, inquiries, admin, and mobile API helpers.' },
  { path: 'estately-web/services', purpose: 'Cloudflare R2 storage services.' },
  { path: 'estately-web/src/db/schema', purpose: 'Drizzle ORM table definitions.' },
  { path: 'estately-web/src/drizzle', purpose: 'Drizzle migration files.' },
  { path: 'docs', purpose: 'Project review documentation and schema notes.' },
];

const sections = [
  {
    title: 'Frontend Architecture',
    body: [
      'The web frontend uses the Next.js App Router with route-based pages for public browsing, auth, dashboards, admin views, and documentation.',
      'Server Components are used where data can be loaded on the server. Client Components are used for interactive forms, filters, favorites, uploads, and navigation controls.',
      'Reusable UI lives in component folders so property cards, filters, galleries, buttons, and layout elements can be shared across pages.',
    ],
    files: ['estately-web/app', 'estately-web/components', 'estately-web/lib/properties/search.ts'],
  },
  {
    title: 'Backend Architecture',
    body: [
      'The backend is part of the Next.js web app. Route handlers expose the mobile REST API under /api/mobile.',
      'Web form workflows use Server Actions for authentication, property management, favorites, inquiries, and admin operations.',
      'Validation is handled before database writes, and protected workflows check JWT-backed user state and roles.',
    ],
    files: ['estately-web/app/api/mobile', 'estately-web/lib/auth', 'estately-web/lib/mobile-api'],
  },
  {
    title: 'Database Architecture',
    body: [
      'Neon PostgreSQL stores users, properties, images, favorites, inquiries, and supported cities.',
      'Drizzle ORM defines the schema in TypeScript and powers type-safe queries throughout the backend.',
      'Drizzle migrations version schema changes and indexes for search, filtering, sorting, admin moderation, and favorites.',
    ],
    files: ['estately-web/src/db/schema', 'estately-web/src/drizzle', 'docs/database-schema.md'],
  },
  {
    title: 'Mobile Architecture',
    body: [
      'The mobile app is an Expo React Native app using Expo Router for file-based navigation.',
      'React Query handles API data loading, caching, refresh, mutations, and optimistic favorites updates.',
      'AsyncStorage stores JWT sessions on native platforms, while web-safe storage fallbacks support Expo Web.',
      'Mobile services call the REST API with EXPO_PUBLIC_API_URL and bearer tokens for protected endpoints.',
    ],
    files: ['apps/mobile/app', 'apps/mobile/services', 'apps/mobile/hooks', 'apps/mobile/services/storage.service.ts'],
  },
];

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-charcoal-950 p-4 text-sm leading-6 text-stone-100">
      <code>{children}</code>
    </pre>
  );
}

function DocsNav() {
  return (
    <nav className="flex flex-wrap gap-3" aria-label="Documentation navigation">
      {docsLinks.map((link) => (
        <Link
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          href={link.href}
          key={link.href}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function FlowCard({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-xl font-bold text-slate-950">{title}</h3>
      <div className="mt-5 grid gap-3">
        {steps.map((step, index) => (
          <div key={step}>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-800">
              {step}
            </div>
            {index < steps.length - 1 ? (
              <div className="flex justify-center py-1 text-lg font-bold text-estate-700">↓</div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ArchitecturePage() {
  return (
    <main>
      <section className="bg-slate-50 py-16 sm:py-20">
        <Container>
          <SectionHeader
            description="A reviewer-facing overview of how the Estately web app, mobile app, backend API, database, authentication, and file storage communicate."
            eyebrow="Developer Docs"
            title="System Architecture"
          />
          <div className="mt-8">
            <DocsNav />
          </div>
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container className="space-y-8">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">High-level Architecture</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The web and mobile clients share the same Next.js backend and Neon database. Images are
              uploaded through the backend to Cloudflare R2, while database records store public image URLs.
            </p>
            <div className="mt-5">
              <CodeBlock>{`flowchart TD
  User[User / Reviewer] --> Web[Next.js Web App]
  Web --> Actions[Server Actions / REST API]
  Actions --> Drizzle[Drizzle ORM]
  Drizzle --> Neon[(Neon PostgreSQL)]

  Mobile[Expo Mobile App] --> MobileApi[Mobile REST API]
  MobileApi --> Backend[Next.js Backend]
  Backend --> Drizzle

  Web --> Upload[Property Image Upload]
  Upload --> R2[Cloudflare R2]
  R2 --> ImageUrl[Public Property Image URL]
  ImageUrl --> Neon`}</CodeBlock>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <FlowCard
              title="Web Data Path"
              steps={['User', 'Next.js Web App', 'Server Actions / REST API', 'Drizzle ORM', 'Neon PostgreSQL']}
            />
            <FlowCard
              title="Mobile Data Path"
              steps={['Expo Mobile App', 'REST API', 'Next.js Backend', 'Drizzle ORM', 'Neon PostgreSQL']}
            />
          </div>
        </Container>
      </section>

      <section className="bg-slate-50 py-14">
        <Container>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">Monorepo Structure</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The repository keeps the web/backend, mobile app, shared documentation, services,
              components, database schema, and migrations in one workspace.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {monorepoItems.map((item) => (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={item.path}>
                  <code className="text-sm font-bold text-estate-700">{item.path}</code>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.purpose}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container className="grid gap-5">
          {sections.map((section) => (
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" key={section.title}>
              <h2 className="text-2xl font-bold text-slate-950">{section.title}</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {section.files.map((file) => (
                  <code className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700" key={file}>
                    {file}
                  </code>
                ))}
              </div>
            </article>
          ))}
        </Container>
      </section>

      <section className="bg-slate-50 py-14">
        <Container className="grid gap-5 lg:grid-cols-3">
          <FlowCard
            title="Authentication Flow"
            steps={[
              'Register / Login',
              'bcrypt password hashing or validation',
              'JWT generation',
              'Token stored in web/mobile session storage',
              'Bearer auth for protected mobile API requests',
            ]}
          />
          <FlowCard
            title="File Storage Flow"
            steps={[
              'Property image upload',
              'Next.js backend route',
              'Cloudflare R2 object storage',
              'Public image URL returned',
              'URL saved on property record',
            ]}
          />
          <FlowCard
            title="Property Search Request Flow"
            steps={[
              'User searches properties',
              'Frontend sends query params',
              'REST API validates filters',
              'Drizzle builds indexed query',
              'Neon PostgreSQL returns paginated rows',
              'Response rendered in web/mobile UI',
            ]}
          />
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">Scalability Strategy</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                ['10,000+ properties', 'The database contains a large seed dataset for browsing and filtering validation.'],
                ['Pagination', 'Property lists return limited pages instead of loading all records at once.'],
                ['Indexes', 'Common filters and sort fields are indexed in Drizzle migrations.'],
                ['Optimized queries', 'Filtering happens in PostgreSQL through Drizzle, not in application memory.'],
              ].map(([title, description]) => (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={title}>
                  <h3 className="font-bold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
