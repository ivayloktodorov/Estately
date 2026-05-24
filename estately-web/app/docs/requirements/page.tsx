import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { SectionHeader } from '@/components/ui/section-header';

export const metadata: Metadata = {
  title: 'Project Requirements Checklist',
  description: 'Assignment requirements checklist for the Estately project.',
};

type Status = 'Completed' | 'In Progress' | 'Pending';

interface ChecklistItem {
  label: string;
  status: Status;
  files: string[];
}

interface RequirementSection {
  title: string;
  summary: string;
  status: Status;
  files: string[];
  items: ChecklistItem[];
}

const sections: RequirementSection[] = [
  {
    title: 'Technologies',
    summary: 'Required platform technologies are present across the web, mobile, backend, database, and storage layers.',
    status: 'Completed',
    files: ['estately-web/package.json', 'apps/mobile/package.json', 'estately-web/src/db/schema'],
    items: [
      { label: 'Next.js web app', status: 'Completed', files: ['estately-web/app'] },
      { label: 'Expo React Native mobile app', status: 'Completed', files: ['apps/mobile/app'] },
      { label: 'TypeScript', status: 'Completed', files: ['estately-web/tsconfig.json', 'apps/mobile/tsconfig.json'] },
      { label: 'Tailwind CSS / NativeWind styling', status: 'Completed', files: ['estately-web/app/globals.css', 'apps/mobile/tailwind.config.js'] },
      { label: 'Cloudflare R2 integration', status: 'Completed', files: ['estately-web/services/storage'] },
    ],
  },
  {
    title: 'Architecture',
    summary: 'The project is organized as a monorepo with a Next.js backend/web app and a separate Expo mobile app.',
    status: 'Completed',
    files: ['package.json', 'estately-web', 'apps/mobile'],
    items: [
      { label: 'Monorepo workspace structure', status: 'Completed', files: ['package.json'] },
      { label: 'Web app uses Server Actions', status: 'Completed', files: ['estately-web/lib/auth/actions.ts', 'estately-web/lib/properties/actions.ts'] },
      { label: 'Mobile app uses REST API', status: 'Completed', files: ['apps/mobile/services'] },
      { label: 'Backend communicates with Neon through Drizzle', status: 'Completed', files: ['estately-web/src/db/client.ts'] },
    ],
  },
  {
    title: 'Web App',
    summary: 'The web application includes public browsing, authentication, dashboards, admin tooling, search, favorites, inquiries, maps, and image upload workflows.',
    status: 'Completed',
    files: ['estately-web/app', 'estately-web/components', 'estately-web/lib'],
    items: [
      { label: 'Web app 10+ screens', status: 'Completed', files: ['estately-web/app'] },
      { label: 'Property browsing and details', status: 'Completed', files: ['estately-web/app/properties', 'estately-web/components/ui/property-card.tsx'] },
      { label: 'Search, filters, pagination, and map/search functionality', status: 'Completed', files: ['estately-web/lib/properties/search.ts', 'estately-web/components/properties'] },
      { label: 'Favorites and inquiries', status: 'Completed', files: ['estately-web/app/favorites/page.tsx', 'estately-web/lib/inquiries'] },
      { label: 'Admin panel', status: 'Completed', files: ['estately-web/app/admin'] },
    ],
  },
  {
    title: 'Mobile App',
    summary: 'The Expo app implements the assignment-facing mobile flows and consumes the mobile REST API.',
    status: 'Completed',
    files: ['apps/mobile/app', 'apps/mobile/services', 'apps/mobile/hooks'],
    items: [
      { label: 'Mobile app 5+ screens', status: 'Completed', files: ['apps/mobile/app/(tabs)', 'apps/mobile/app/(auth)', 'apps/mobile/app/property/[id]'] },
      { label: 'Login and register', status: 'Completed', files: ['apps/mobile/app/(auth)'] },
      { label: 'Home property list and details', status: 'Completed', files: ['apps/mobile/app/(tabs)/home.tsx', 'apps/mobile/app/property/[id]/index.tsx'] },
      { label: 'Favorites, search filters, profile, logout', status: 'Completed', files: ['apps/mobile/app/(tabs)'] },
      { label: 'Expo web deployment readiness', status: 'In Progress', files: ['apps/mobile/README.md', 'apps/mobile/package.json'] },
    ],
  },
  {
    title: 'Backend',
    summary: 'The backend exposes mobile REST endpoints and web server actions using shared validation and database services.',
    status: 'Completed',
    files: ['estately-web/app/api/mobile', 'estately-web/lib/mobile-api'],
    items: [
      { label: 'REST API for mobile', status: 'Completed', files: ['estately-web/app/api/mobile'] },
      { label: 'Property listing and details endpoints', status: 'Completed', files: ['estately-web/app/api/mobile/properties'] },
      { label: 'Favorites endpoints', status: 'Completed', files: ['estately-web/app/api/mobile/favorites'] },
      { label: 'Inquiry endpoint', status: 'Completed', files: ['estately-web/app/api/mobile/properties/[id]/inquiries/route.ts'] },
    ],
  },
  {
    title: 'Authentication and Authorization',
    summary: 'Authentication uses bcrypt password hashing, JWT sessions, protected routes, roles, and bearer-token mobile API access.',
    status: 'Completed',
    files: ['estately-web/lib/auth', 'estately-web/lib/mobile-api/auth.ts', 'apps/mobile/services/auth.service.ts'],
    items: [
      { label: 'JWT authentication', status: 'Completed', files: ['estately-web/lib/auth/jwt.ts'] },
      { label: 'bcrypt password hashing', status: 'Completed', files: ['estately-web/lib/auth/password.ts'] },
      { label: 'Users and roles', status: 'Completed', files: ['estately-web/src/db/schema/users.ts'] },
      { label: 'Protected admin/user routes', status: 'Completed', files: ['estately-web/app/admin', 'estately-web/app/dashboard'] },
      { label: 'Bearer token auth for mobile API', status: 'Completed', files: ['estately-web/lib/mobile-api/auth.ts'] },
    ],
  },
  {
    title: 'Database',
    summary: 'Neon PostgreSQL and Drizzle ORM provide the persistent data model, migrations, and type-safe queries.',
    status: 'Completed',
    files: ['estately-web/src/db/schema', 'estately-web/src/drizzle', 'docs/database-schema.md'],
    items: [
      { label: 'PostgreSQL with Neon', status: 'Completed', files: ['estately-web/src/db/client.ts'] },
      { label: 'Drizzle ORM', status: 'Completed', files: ['estately-web/src/db/schema'] },
      { label: 'Drizzle migrations', status: 'Completed', files: ['estately-web/src/drizzle'] },
      { label: 'Database schema documentation and ERD', status: 'Completed', files: ['docs/database-schema.md'] },
    ],
  },
  {
    title: 'Scalability',
    summary: 'The database and API are prepared for large property datasets through indexes, pagination, and load-test scripts.',
    status: 'Completed',
    files: ['estately-web/scripts/load-test-data.ts', 'estately-web/src/db/schema/properties.ts'],
    items: [
      { label: '10,000 property records', status: 'Completed', files: ['estately-web/scripts/load-test-data.ts'] },
      { label: 'Server-side pagination', status: 'Completed', files: ['estately-web/lib/mobile-api/properties.ts', 'estately-web/lib/properties/search.ts'] },
      { label: 'Indexes for filters and sorting', status: 'Completed', files: ['estately-web/src/db/schema/properties.ts', 'estately-web/src/drizzle'] },
      { label: 'Performance notes documented', status: 'Completed', files: ['README.md', 'docs/database-schema.md'] },
    ],
  },
  {
    title: 'Deployment',
    summary: 'Deployment documentation exists, while final production deployments still need to be completed and verified.',
    status: 'In Progress',
    files: ['README.md', 'apps/mobile/README.md', 'apps/mobile/package.json'],
    items: [
      { label: 'Web deployment notes', status: 'Completed', files: ['README.md'] },
      { label: 'Mobile Expo web export script', status: 'Completed', files: ['apps/mobile/package.json'] },
      { label: 'Production deployment', status: 'Pending', files: ['README.md'] },
      { label: 'Expo web deployment', status: 'Pending', files: ['apps/mobile/README.md'] },
    ],
  },
  {
    title: 'GitHub Repo',
    summary: 'The repository is structured for review, but final GitHub commit history verification remains a release checklist item.',
    status: 'In Progress',
    files: ['package.json', 'README.md'],
    items: [
      { label: 'Monorepo project files present', status: 'Completed', files: ['package.json', 'estately-web', 'apps/mobile'] },
      { label: 'Professional README', status: 'In Progress', files: ['README.md'] },
      { label: 'GitHub commit history verification', status: 'Pending', files: ['.git'] },
    ],
  },
  {
    title: 'AI Agent Instructions',
    summary: 'Agent guidance is present at the root and app-specific levels.',
    status: 'Completed',
    files: ['AGENTS.md', 'estately-web/AGENTS.md', 'estately-mobile/AGENTS.md'],
    items: [
      { label: 'Root AGENTS.md', status: 'Completed', files: ['AGENTS.md'] },
      { label: 'Web AGENTS.md', status: 'Completed', files: ['estately-web/AGENTS.md'] },
      { label: 'Mobile AGENTS.md', status: 'Completed', files: ['estately-mobile/AGENTS.md'] },
    ],
  },
  {
    title: 'Documentation',
    summary: 'Review documentation covers setup, APIs, database schema, deployment, and assignment requirement mapping.',
    status: 'In Progress',
    files: ['README.md', 'docs/database-schema.md', 'estately-web/app/docs'],
    items: [
      { label: 'Project README', status: 'In Progress', files: ['README.md'] },
      { label: 'API documentation page', status: 'Completed', files: ['estately-web/app/docs/api/page.tsx'] },
      { label: 'Database schema documentation', status: 'Completed', files: ['docs/database-schema.md'] },
      { label: 'Requirements checklist page', status: 'Completed', files: ['estately-web/app/docs/requirements/page.tsx'] },
      { label: 'Final README polish', status: 'Pending', files: ['README.md'] },
    ],
  },
  {
    title: 'File Storage',
    summary: 'Property image upload support is integrated through Cloudflare R2 services.',
    status: 'Completed',
    files: ['estately-web/services/storage', 'estately-web/app/api/properties/[id]/images/route.ts'],
    items: [
      { label: 'Cloudflare R2 integration', status: 'Completed', files: ['estately-web/services/storage/r2.ts'] },
      { label: 'Property image uploads', status: 'Completed', files: ['estately-web/components/properties/property-image-upload.tsx'] },
      { label: 'Image URL persistence', status: 'Completed', files: ['estately-web/src/db/schema/properties.ts', 'estately-web/src/db/schema/property-images.ts'] },
    ],
  },
];

function badgeClassName(status: Status): string {
  switch (status) {
    case 'Completed':
      return 'border-estate-200 bg-estate-50 text-estate-700';
    case 'In Progress':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'Pending':
      return 'border-slate-200 bg-slate-100 text-slate-600';
  }
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${badgeClassName(status)}`}>
      {status}
    </span>
  );
}

function FileList({ files }: { files: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {files.map((file) => (
        <code className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700" key={file}>
          {file}
        </code>
      ))}
    </div>
  );
}

function RequirementCard({ section }: { section: RequirementSection }) {
  const completedCount = section.items.filter((item) => item.status === 'Completed').length;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">{section.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{section.summary}</p>
        </div>
        <StatusBadge status={section.status} />
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Relevant files and routes</h3>
        <div className="mt-2">
          <FileList files={section.files} />
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-slate-50 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Checklist</h3>
          <span className="text-xs font-semibold text-slate-500">
            {completedCount}/{section.items.length} completed
          </span>
        </div>
        <div className="space-y-3">
          {section.items.map((item) => (
            <div className="rounded-lg border border-slate-200 bg-white p-3" key={item.label}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-semibold text-slate-950">{item.label}</p>
                <StatusBadge status={item.status} />
              </div>
              <div className="mt-3">
                <FileList files={item.files} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function RequirementsPage() {
  const completedSections = sections.filter((section) => section.status === 'Completed').length;
  const inProgressSections = sections.filter((section) => section.status === 'In Progress').length;
  const pendingSections = sections.filter((section) => section.status === 'Pending').length;

  return (
    <main>
      <section className="bg-slate-50 py-16 sm:py-20">
        <Container>
          <SectionHeader
            description="A reviewer-facing map of assignment requirements to the Estately implementation, including status, files, routes, and remaining release tasks."
            eyebrow="Project Review"
            title="Requirements Checklist"
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-3xl font-bold text-estate-700">{completedSections}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">Completed sections</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-3xl font-bold text-amber-700">{inProgressSections}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">In progress sections</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-3xl font-bold text-slate-700">{pendingSections}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">Pending sections</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="rounded-lg bg-estate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-estate-800"
              href="/docs/api"
            >
              Mobile API Docs
            </Link>
            <Link
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              href="/properties"
            >
              View Properties
            </Link>
          </div>
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container className="grid gap-5">
          {sections.map((section) => (
            <RequirementCard key={section.title} section={section} />
          ))}
        </Container>
      </section>
    </main>
  );
}
