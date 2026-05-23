import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { SectionHeader } from '@/components/ui/section-header';

export const metadata: Metadata = {
  title: 'Mobile API Documentation',
  description: 'Internal REST API documentation for the Estately Expo mobile app.',
};

type HttpMethod = 'GET' | 'POST' | 'DELETE';

interface EndpointDoc {
  group: 'Authentication' | 'Properties' | 'Favorites' | 'Inquiries';
  method: HttpMethod;
  url: string;
  auth: 'None' | 'Bearer token required' | 'Optional bearer token';
  description: string;
  request: string;
  response: string;
  errors: string[];
}

const endpoints: EndpointDoc[] = [
  {
    group: 'Authentication',
    method: 'POST',
    url: '/api/mobile/auth/login',
    auth: 'None',
    description: 'Authenticate an existing mobile user and return a JWT session.',
    request: `{
  "email": "john@gmail.com",
  "password": "pass123"
}`,
    response: `{
  "success": true,
  "data": {
    "token": "<jwt_token>",
    "user": {
      "id": 2,
      "email": "john@gmail.com",
      "fullName": "John Doe",
      "role": "user"
    }
  }
}`,
    errors: ['400 invalid request body', '401 invalid credentials'],
  },
  {
    group: 'Authentication',
    method: 'POST',
    url: '/api/mobile/auth/register',
    auth: 'None',
    description: 'Create a mobile user account and return a JWT session.',
    request: `{
  "email": "new.user@example.com",
  "password": "pass123",
  "fullName": "New User"
}`,
    response: `{
  "success": true,
  "data": {
    "token": "<jwt_token>",
    "user": {
      "id": 15,
      "email": "new.user@example.com",
      "fullName": "New User",
      "role": "user"
    }
  }
}`,
    errors: ['400 validation error', '409 email already exists'],
  },
  {
    group: 'Authentication',
    method: 'GET',
    url: '/api/mobile/me',
    auth: 'Bearer token required',
    description: 'Return the current authenticated mobile user.',
    request: `Authorization: Bearer <jwt_token>`,
    response: `{
  "success": true,
  "data": {
    "id": 2,
    "email": "john@gmail.com",
    "fullName": "John Doe",
    "role": "user"
  }
}`,
    errors: ['401 authentication required'],
  },
  {
    group: 'Properties',
    method: 'GET',
    url: '/api/mobile/properties?page=1&limit=20&city=Sofia',
    auth: 'None',
    description: 'Return paginated, searchable, filterable property results for the mobile app.',
    request: `GET /api/mobile/properties?search=center&city=Sofia&propertyType=apartment&page=1&limit=20`,
    response: `{
  "success": true,
  "data": {
    "properties": [
      {
        "id": 101,
        "title": "Modern Apartment in Sofia Center",
        "price": "250000.00",
        "city": "Sofia",
        "propertyType": "apartment",
        "listingType": "sale",
        "bedrooms": 2,
        "bathrooms": 1,
        "areaSqm": 85,
        "imageCoverUrl": "https://..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10000,
      "totalPages": 500,
      "hasPreviousPage": false,
      "hasNextPage": true
    }
  }
}`,
    errors: ['400 invalid query parameters'],
  },
  {
    group: 'Properties',
    method: 'GET',
    url: '/api/mobile/properties/[id]',
    auth: 'Optional bearer token',
    description: 'Return property details. Unpublished listings are only visible to admins or owners.',
    request: `GET /api/mobile/properties/101`,
    response: `{
  "success": true,
  "data": {
    "id": 101,
    "title": "Modern Apartment in Sofia Center",
    "description": "Beautiful modern apartment...",
    "price": "250000.00",
    "city": "Sofia",
    "address": "123 Main Street, Sofia",
    "propertyType": "apartment",
    "listingType": "sale",
    "images": [
      {
        "id": 1,
        "propertyId": 101,
        "imageUrl": "https://...",
        "sortOrder": 0
      }
    ]
  }
}`,
    errors: ['400 invalid property id', '404 property not found'],
  },
  {
    group: 'Favorites',
    method: 'GET',
    url: '/api/mobile/favorites',
    auth: 'Bearer token required',
    description: 'Return the current user’s saved published properties.',
    request: `Authorization: Bearer <jwt_token>`,
    response: `{
  "success": true,
  "data": {
    "properties": [
      {
        "id": 101,
        "title": "Modern Apartment in Sofia Center",
        "favoritedAt": "2026-05-23T10:15:00.000Z"
      }
    ]
  }
}`,
    errors: ['401 authentication required'],
  },
  {
    group: 'Favorites',
    method: 'POST',
    url: '/api/mobile/favorites',
    auth: 'Bearer token required',
    description: 'Save a published property to the current user’s favorites.',
    request: `{
  "propertyId": 101
}`,
    response: `{
  "success": true,
  "data": {
    "propertyId": 101,
    "isFavorited": true
  }
}`,
    errors: ['400 invalid request body', '401 authentication required', '404 property not found'],
  },
  {
    group: 'Favorites',
    method: 'DELETE',
    url: '/api/mobile/favorites/[propertyId]',
    auth: 'Bearer token required',
    description: 'Remove a property from the current user’s favorites.',
    request: `DELETE /api/mobile/favorites/101`,
    response: `{
  "success": true,
  "data": {
    "propertyId": 101,
    "isFavorited": false
  }
}`,
    errors: ['400 invalid property id', '401 authentication required'],
  },
  {
    group: 'Inquiries',
    method: 'POST',
    url: '/api/mobile/properties/[id]/inquiries',
    auth: 'Bearer token required',
    description: 'Send an inquiry message about a property.',
    request: `{
  "message": "I am interested in this property. Can we schedule a viewing?"
}`,
    response: `{
  "success": true,
  "data": {
    "inquiry": {
      "id": 55,
      "propertyId": 101,
      "userId": 2,
      "message": "I am interested in this property. Can we schedule a viewing?",
      "createdAt": "2026-05-23T10:30:00.000Z"
    }
  }
}`,
    errors: ['400 invalid request body', '401 authentication required', '404 property not found'],
  },
];

const groups = ['Authentication', 'Properties', 'Favorites', 'Inquiries'] as const;

const queryParams = [
  { name: 'page', description: 'Positive page number. Defaults to 1.' },
  { name: 'limit', description: 'Page size from 1 to 48. Defaults to 20.' },
  { name: 'search', description: 'Searches title, city, address, and description.' },
  { name: 'city', description: 'Filters by city, such as Sofia, Varna, Burgas, or Plovdiv.' },
  { name: 'propertyType', description: 'apartment, house, villa, office, or land.' },
  { name: 'listingType', description: 'sale or rent.' },
  { name: 'minPrice', description: 'Minimum property price.' },
  { name: 'maxPrice', description: 'Maximum property price.' },
  { name: 'bedrooms', description: 'Minimum bedroom count.' },
  { name: 'bathrooms', description: 'Minimum bathroom count.' },
  { name: 'sort', description: 'newest, oldest, price_asc, price_desc, area_asc, or area_desc.' },
];

function methodClassName(method: HttpMethod): string {
  switch (method) {
    case 'POST':
      return 'bg-estate-700 text-white';
    case 'DELETE':
      return 'bg-red-700 text-white';
    case 'GET':
    default:
      return 'bg-slate-900 text-white';
  }
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-charcoal-950 p-4 text-sm leading-6 text-stone-100">
      <code>{children}</code>
    </pre>
  );
}

function EndpointCard({ endpoint }: { endpoint: EndpointDoc }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${methodClassName(endpoint.method)}`}>
              {endpoint.method}
            </span>
            <code className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-900">
              {endpoint.url}
            </code>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{endpoint.description}</p>
        </div>
        <span className="w-fit rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
          {endpoint.auth}
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500">Request</h4>
          <CodeBlock>{endpoint.request}</CodeBlock>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500">Response</h4>
          <CodeBlock>{endpoint.response}</CodeBlock>
        </div>
      </div>

      <div className="mt-5">
        <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500">Possible errors</h4>
        <div className="mt-2 flex flex-wrap gap-2">
          {endpoint.errors.map((error) => (
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700" key={error}>
              {error}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function MobileApiDocsPage() {
  return (
    <main>
      <section className="bg-slate-50 py-16 sm:py-20">
        <Container>
          <SectionHeader
            description="Internal REST API reference for the Expo mobile app. These endpoints are served by the Next.js backend under /api/mobile."
            eyebrow="Developer Docs"
            title="Mobile REST API"
          />

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">Authentication header</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Mobile clients authenticate protected endpoints with a JWT bearer token.
              </p>
              <div className="mt-4">
                <CodeBlock>{'Authorization: Bearer <jwt_token>'}</CodeBlock>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">Reviewer credentials</h2>
              <div className="mt-4 grid gap-3 text-sm text-slate-700">
                <p>
                  <span className="font-semibold text-slate-950">Admin:</span>{' '}
                  <code>admin@estately.com / pass123</code>
                </p>
                <p>
                  <span className="font-semibold text-slate-950">Regular user:</span>{' '}
                  <code>john@gmail.com / pass123</code>
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-2xl font-bold text-slate-950">Property query parameters</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Supported by <code className="font-semibold">GET /api/mobile/properties</code>.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {queryParams.map((param) => (
                <div className="rounded-lg border border-slate-200 bg-white p-4" key={param.name}>
                  <code className="text-sm font-bold text-estate-700">{param.name}</code>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{param.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-slate-50 py-14">
        <Container className="space-y-12">
          {groups.map((group) => (
            <div className="space-y-4" key={group}>
              <h2 className="text-3xl font-bold text-slate-950">{group}</h2>
              <div className="grid gap-5">
                {endpoints
                  .filter((endpoint) => endpoint.group === group)
                  .map((endpoint) => (
                    <EndpointCard endpoint={endpoint} key={`${endpoint.method}-${endpoint.url}`} />
                  ))}
              </div>
            </div>
          ))}
        </Container>
      </section>
    </main>
  );
}
