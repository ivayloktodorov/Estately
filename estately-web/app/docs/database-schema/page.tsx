import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { SectionHeader } from '@/components/ui/section-header';

export const metadata: Metadata = {
  title: 'Database Schema Documentation',
  description: 'Database schema and ERD reference for Estately.',
};

const tables = [
  'users',
  'properties',
  'property_images',
  'favorites',
  'property_messages',
  'cities',
];

export default function DatabaseSchemaDocsPage() {
  return (
    <main>
      <section className="bg-slate-50 py-16 sm:py-20">
        <Container>
          <SectionHeader
            description="A web-friendly entry point for the full database schema reference and ERD stored in docs/database-schema.md."
            eyebrow="Developer Docs"
            title="Database Schema"
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="rounded-lg bg-estate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-estate-800"
              href="/docs/architecture"
            >
              Architecture Docs
            </Link>
            <Link
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              href="/docs/requirements"
            >
              Requirements Checklist
            </Link>
          </div>
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container className="grid gap-5 lg:grid-cols-[0.8fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">Main Tables</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {tables.map((table) => (
                <code className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800" key={table}>
                  {table}
                </code>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-2xl font-bold text-slate-950">Full Markdown Reference</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The complete schema documentation includes a Mermaid ERD, relationships, field examples,
              Drizzle notes, indexes, and scalability strategy.
            </p>
            <p className="mt-4">
              <code className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-estate-700">
                docs/database-schema.md
              </code>
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}
