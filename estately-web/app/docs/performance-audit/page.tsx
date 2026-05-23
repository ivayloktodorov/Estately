import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { SectionHeader } from '@/components/ui/section-header';

export const metadata: Metadata = {
  title: 'Performance Audit',
  description: 'Image, request, render, database, and dashboard performance audit for Estately.',
};

const summaryCards = [
  { label: 'Target requests', value: '<200', detail: 'No known repeated image loading after optimization.' },
  { label: 'Target transfer', value: '<15-20 MB', detail: 'Large listing images now flow through Next image optimization.' },
  { label: 'Render loops', value: '0 found', detail: 'No infinite useEffect or polling loops found in audited areas.' },
];

const findings = [
  {
    area: 'Images',
    issue: 'High-traffic property cards, property gallery, dashboard rows, admin rows, map previews, and message images used raw <img> tags.',
    fixed:
      'Converted repeated production image surfaces to next/image with width/height or fill, responsive sizes, lazy loading defaults, and AVIF/WebP support.',
  },
  {
    area: 'Image caching',
    issue: 'Static branding and uploaded images did not have explicit immutable cache headers.',
    fixed:
      'Added long-lived Cache-Control headers for /branding and /uploads, and configured next/image minimumCacheTTL for optimized image derivatives.',
  },
  {
    area: 'Notifications',
    issue: 'Opening the notification dropdown triggered an extra notification refresh even though the header already server-rendered initial data.',
    fixed:
      'Kept the server-rendered notification payload as the single initial load. Mark-as-read actions still refresh state after mutations.',
  },
  {
    area: 'Messages database access',
    issue: 'Conversation lists had N+1 query behavior: each conversation loaded last message, unread count, and attachment state separately.',
    fixed:
      'Batched last-message, unread-count, message-count, and attachment lookups across the visible conversation ids.',
  },
  {
    area: 'Dashboard data',
    issue: 'Dashboard property cards selected full property rows while rendering only a small subset of fields.',
    fixed:
      'Narrowed the dashboard property query to id, title, city, address, and cover image only.',
  },
  {
    area: 'Client renders',
    issue: 'Map view recalculated mapped properties and selected property on every render.',
    fixed:
      'Memoized map-derived data and selection callbacks, and memoized the map content component.',
  },
];

const requestCounts = [
  {
    route: '/dashboard',
    before: '5 server reads plus one duplicate client notification refresh on dropdown open',
    after: '5 server reads, 0 duplicate client refreshes on initial dropdown open',
    transferred: 'Lower image transfer through optimized dashboard thumbnails',
  },
  {
    route: '/dashboard/messages',
    before: '1 conversation query + up to 3 queries per conversation',
    after: '1 conversation query + 3 batched queries for the visible page',
    transferred: 'Property and avatar images use optimized thumbnails',
  },
  {
    route: '/admin/messages',
    before: '1 page query + up to 4 stat/preview queries per conversation',
    after: '1 page query + 4 batched stat/preview queries for the visible page',
    transferred: 'No UI redesign; request count reduced at the database layer',
  },
  {
    route: '/properties and listing cards',
    before: 'Raw full-size image requests for repeated listing cards',
    after: 'Responsive Next image variants with AVIF/WebP negotiation',
    transferred: 'Expected large reduction for repeated remote property images',
  },
];

const remainingNotes = [
  'File preview images in upload forms intentionally remain raw <img> tags because they render local blob URLs before upload.',
  'The internal /test-r2 diagnostic page still uses a raw preview image and is not part of the production user flow.',
  'Exact browser before/after transfer totals should be captured from Netlify after redeploy because production image optimization and CDN cache behavior depend on the deployed edge environment.',
];

export default function PerformanceAuditPage() {
  return (
    <main>
      <section className="bg-slate-50 py-16 sm:py-20">
        <Container>
          <SectionHeader
            description="A focused audit of image loading, render behavior, request duplication, database access, and dashboard performance."
            eyebrow="Performance"
            title="Performance Audit"
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {summaryCards.map((card) => (
              <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" key={card.label}>
                <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{card.label}</p>
                <p className="mt-3 text-3xl font-bold text-estate-700">{card.value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.detail}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container className="grid gap-5">
          {findings.map((finding) => (
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" key={finding.area}>
              <h2 className="text-2xl font-bold text-slate-950">{finding.area}</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-bold uppercase tracking-wide text-amber-800">Issue found</p>
                  <p className="mt-2 text-sm leading-6 text-amber-900">{finding.issue}</p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-bold uppercase tracking-wide text-emerald-800">Issue fixed</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-900">{finding.fixed}</p>
                </div>
              </div>
            </article>
          ))}
        </Container>
      </section>

      <section className="bg-slate-50 py-14">
        <Container>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">Before / After Request Notes</h2>
            <div className="mt-5 grid gap-3">
              {requestCounts.map((row) => (
                <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[0.7fr_1fr_1fr_1fr]" key={row.route}>
                  <p className="font-mono text-sm font-bold text-slate-950">{row.route}</p>
                  <p className="text-sm leading-6 text-slate-600"><span className="font-bold">Before:</span> {row.before}</p>
                  <p className="text-sm leading-6 text-slate-600"><span className="font-bold">After:</span> {row.after}</p>
                  <p className="text-sm leading-6 text-slate-600"><span className="font-bold">Transfer:</span> {row.transferred}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">Remaining Verification Notes</h2>
            <ul className="mt-4 grid gap-3">
              {remainingNotes.map((note) => (
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700" key={note}>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    </main>
  );
}
