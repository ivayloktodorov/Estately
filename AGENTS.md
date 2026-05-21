# Estately Monorepo - Global Instructions

## Project Overview

**Estately** is a modern, full-stack real estate platform inspired by Zillow, enabling users to browse, search, and save property listings while admins manage content and platform operations.

---

## Architecture Overview

Estately is a **monorepo** containing:
- **Web Application**: Next.js full-stack web platform with admin dashboard
- **Mobile Application**: Expo React Native cross-platform app
- **Shared Packages**: Reusable types, UI components, and database layer

### Technology Stack

**Backend & Database:**
- Next.js (API routes)
- TypeScript
- Neon PostgreSQL
- Drizzle ORM
- JWT authentication

**Web Frontend:**
- React 19
- Next.js App Router
- Tailwind CSS
- Server Components

**Mobile Frontend:**
- Expo
- React Native
- Expo Router
- TypeScript

**Infrastructure:**
- Cloudflare R2 (file storage)
- Neon (database hosting)

---

## Monorepo Structure

```
estately/
├── estately-web/          # Next.js web app + backend APIs
├── estately-mobile/       # Expo React Native mobile app
├── estately-shared/       # Shared packages (types, UI, db)
├── package.json           # Root workspace config
├── AGENTS.md             # This file
└── README.md             # Project overview & setup
```

---

## Shared Development Rules

### 1. TypeScript Enforcement
- **Strict mode** enabled in all TypeScript configurations
- Use explicit types; avoid `any`
- Define proper interfaces/types for all data structures
- Use discriminated unions for variant types

### 2. Code Organization
- Keep files focused and single-responsibility
- Use barrel exports (`index.ts`) for clean imports
- Organize by feature, not by file type
- Collocate related types and utilities

### 3. Naming Conventions
- **Files**: kebab-case (`user-profile.tsx`, `api-handler.ts`)
- **Types**: PascalCase (`UserProfile`, `ApiResponse`)
- **Functions/Variables**: camelCase (`getUserData`, `isActive`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `API_TIMEOUT`)

### 4. Environment Variables
- Use `.env.local` for local development (not committed)
- Document all env vars in `.env.example`
- Prefix app-specific vars: `NEXT_PUBLIC_` for web, `EXPO_` for mobile
- Validate env vars at startup

### 5. Error Handling
- Use typed error responses across APIs
- Include error codes and messages for debugging
- Log errors with context (user ID, request ID, etc.)
- Never expose sensitive info in error messages

### 6. Performance
- Implement pagination for list endpoints (default 20 items)
- Use database indexes on frequently queried columns
- Optimize image loading and caching
- Monitor bundle sizes and Core Web Vitals

---

## Shared Coding Conventions

### Import Organization
```typescript
// 1. External packages
import React from 'react';
import { useEffect } from 'react';

// 2. Internal absolute imports
import { UserProfile } from '@/types';
import { getUserData } from '@/services';

// 3. Relative imports
import { LOCAL_CONST } from './constants';
```

### Async/Await Pattern
- Prefer `async/await` over `.then()` chains
- Always handle errors with try/catch
- Use `AbortController` for cancellable requests
- Set reasonable timeouts (5s for API calls)

### Type Safety
```typescript
// Define interfaces for API responses
interface ListingResponse {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
}

// Use branded types for IDs
type ListingId = string & { readonly __brand: 'ListingId' };
```

### Constants & Configuration
- Store magic numbers as named constants
- Use configuration objects for feature flags
- Document defaults and limits clearly

---

## Shared Database Rules

### 1. Schema Design
- Use `id` as primary key (UUID or auto-increment)
- Add timestamps: `createdAt`, `updatedAt`
- Use enums for fixed status values
- Denormalize sparingly for performance

### 2. Relations & Foreign Keys
- Define explicit foreign key constraints
- Use CASCADE for safe deletes
- Index frequently joined columns
- Document relationship cardinality

### 3. Query Optimization
- Use Drizzle for type-safe queries
- Filter at the database layer, not in app code
- Limit returned columns to what's needed
- Use pagination for all list queries

### 4. Migrations
- Use Drizzle migrations for schema changes
- Make migrations reversible
- Test migrations on data before production
- Document data transformation logic

---

## Shared Authentication Rules

### 1. JWT Implementation
- Tokens expire after 24 hours
- Use refresh tokens for extending sessions
- Store tokens securely in httpOnly cookies (web)
- Include user ID and role in JWT payload

### 2. Authorization
- Implement role-based access control (RBAC)
- Roles: `user`, `admin`, `moderator`
- Check permissions on both client and server
- Deny by default; allow explicitly

### 3. Security
- Hash passwords with bcrypt (cost factor: 12)
- Validate tokens on every protected route/API
- Use HTTPS only in production
- Implement rate limiting on auth endpoints

### 4. Session Management
- Invalidate tokens on logout
- Implement blacklist for revoked tokens (if needed)
- Clear stored tokens on app uninstall/reset
- Log authentication events for security audits

---

## Shared API Architecture Rules

### 1. REST Conventions
```
GET    /api/listings           # List all
POST   /api/listings           # Create
GET    /api/listings/:id       # Get one
PATCH  /api/listings/:id       # Update
DELETE /api/listings/:id       # Delete
```

### 2. Request/Response Format
```typescript
// Success response
{ status: 'success', data: T, meta?: { page: 1, total: 100 } }

// Error response
{ status: 'error', error: { code: 'INVALID_INPUT', message: '...' } }
```

### 3. Status Codes
- `200 OK`: Successful GET/PATCH/DELETE
- `201 Created`: Successful POST
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing/invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Constraint violation
- `500 Internal Server Error`: Unexpected error

### 4. Rate Limiting
- Implement per-user rate limits
- Return `429 Too Many Requests` when exceeded
- Include retry-after header in response

---

## Shared Scalability Guidelines

### 1. Database Scalability
- Use indexes strategically
- Archive old data to separate tables
- Implement soft deletes for audit trails
- Monitor query performance with slow query logs

### 2. Caching Strategy
- Cache read-heavy endpoints (listings, user profiles)
- Use Redis for session storage
- Invalidate cache on writes
- Set appropriate TTLs (5 min to 1 hour)

### 3. File Storage
- Use Cloudflare R2 for all media files
- Implement file size limits
- Serve images via CDN with compression
- Clean up unused files periodically

### 4. API Scalability
- Implement pagination and filtering
- Use database connection pooling
- Monitor API response times
- Plan for horizontal scaling

---

## AI Agent Coding Instructions

### 1. Code Generation Guidelines
- Generate TypeScript code exclusively
- Always include proper error handling
- Write self-documenting code with clear variable names
- Include JSDoc comments for public functions

### 2. When Creating New Features
- Define types first, implementation second
- Create services/utilities before UI components
- Write unit tests for business logic
- Add integration tests for API routes

### 3. Code Review Checklist
- ✓ TypeScript strict mode compliance
- ✓ No `any` types without explanation
- ✓ Error handling implemented
- ✓ Input validation present
- ✓ Comments for complex logic
- ✓ No hardcoded values
- ✓ Performance implications considered

### 4. Documentation
- Keep README.md files updated
- Document breaking changes
- Include setup instructions for new features
- Add examples for complex features

### 5. Testing Requirements
- Unit tests for utilities and services
- Integration tests for API routes
- Component tests for reusable UI
- E2E tests for critical user flows

---

## Development Workflow

### Running the Project
```bash
# Install dependencies (monorepo)
npm install

# Run all dev servers in parallel
npm run dev

# Build all projects
npm run build

# Web app only
npm run --workspace=estately-web dev

# Mobile app only
npm run --workspace=estately-mobile dev
```

### Git Conventions
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, etc.
- Keep commits atomic and focused
- Reference issues in commit messages: `fixes #123`
- Create feature branches from `main`

### Code Quality
- Run linters before committing
- Format code with Prettier
- Run tests before pushing
- Keep bundle size in check

---

## Related Documentation

- [Web App Instructions](./estately-web/AGENTS.md)
- [Mobile App Instructions](./estately-mobile/AGENTS.md)
- [Project Setup](./README.md)
