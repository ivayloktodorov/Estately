# Estately - Project Overview & Setup

A modern, full-stack real estate platform inspired by Zillow, enabling users to browse, search, and save property listings while providing administrators with comprehensive management tools.

---

## Features Overview

### For Users
- **Property Search**: Browse and filter listings by location, price, beds, baths
- **Advanced Filtering**: Search by neighborhood, property type, price range
- **Listing Details**: View comprehensive property information with photo gallery
- **Favorites**: Save favorite listings for later viewing
- **Contact Agent**: Direct messaging with property agents
- **Responsive Design**: Seamless experience across web and mobile

### For Administrators
- **Listing Management**: Create, edit, and publish property listings
- **Analytics Dashboard**: Track views, clicks, and user engagement
- **User Management**: Monitor and moderate user accounts
- **Content Management**: Manage FAQs, support articles, and platform content
- **Moderation Tools**: Handle reports and flag inappropriate content

### For Agents
- **Listing Management**: Manage owned listings efficiently
- **Performance Analytics**: Track listing views and engagement
- **Contact Tracking**: View and respond to user inquiries

---

## Tech Stack

### Frontend
- **Web**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Mobile**: Expo, React Native, Expo Router, TypeScript

### Backend
- **Framework**: Next.js API Routes
- **Language**: TypeScript
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens with refresh mechanism

### Infrastructure
- **Database Hosting**: Neon
- **File Storage**: Cloudflare R2
- **Deployment**: Vercel (web) + EAS (mobile)

---

## Monorepo Structure

```
estately/
├── estately-web/               # Next.js full-stack web app
│   ├── app/                    # App Router pages & API routes
│   │   ├── api/               # RESTful API endpoints
│   │   ├── (auth)/            # Authentication pages
│   │   └── (dashboard)/       # Protected routes
│   ├── components/            # React components
│   ├── lib/
│   │   ├── db/               # Database queries (Drizzle)
│   │   ├── services/         # Business logic
│   │   └── types/            # TypeScript interfaces
│   └── package.json
│
├── estately-mobile/            # Expo React Native mobile app
│   ├── app/                    # Expo Router navigation
│   │   ├── (auth)/            # Auth screens
│   │   └── (tabs)/            # Tab navigation
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── services/          # API communication
│   │   ├── hooks/             # Custom hooks
│   │   ├── context/           # State management
│   │   └── types/             # TypeScript types
│   ├── app.json               # Expo configuration
│   └── package.json
│
├── estately-shared/            # Shared packages (future)
│   └── (empty for now)
│
├── package.json                # Monorepo workspace config
├── AGENTS.md                   # Global coding instructions
├── README.md                   # This file
└── .gitignore
```

---

## Local Development Setup

### Prerequisites
- Node.js 20+
- npm 10+ (for workspace support)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd estately
```

2. **Install dependencies**
```bash
npm install
```
This installs dependencies for all workspaces (web, mobile, shared).

3. **Set up environment variables**
```bash
# Root project
cp .env.example .env.local

# Web app
cd estately-web
cp .env.example .env.local
cd ..

# Mobile app
cd estately-mobile
cp .env.example .env.local
cd ..
```

### Running the Project

**Start all development servers in parallel:**
```bash
npm run dev
```

**Run individual projects:**
```bash
# Web app only (http://localhost:3000)
npm run --workspace=estately-web dev

# Mobile app only (Expo)
npm run --workspace=estately-mobile dev
```

**Mobile web preview:**
```bash
npm run web
```

### Building for Production

**Build all projects:**
```bash
npm run build
```

**Build specific project:**
```bash
npm run --workspace=estately-web build
```

---

## Environment Variables Overview

### Web App (`estately-web/.env.local`)

```env
# Database
DATABASE_URL=postgresql://user:password@host/db

# JWT Secret
JWT_SECRET=your-secret-key-min-32-chars

# API
NEXT_PUBLIC_API_URL=http://localhost:3000

# Cloudflare R2
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY=your-access-key
R2_SECRET_KEY=your-secret-key
R2_BUCKET=estately-uploads
R2_PUBLIC_URL=https://your-cdn-url.com

# Email Service (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Mobile App (`estately-mobile/.env.local`)

```env
# API
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_APP_NAME=Estately

# Feature Flags (optional)
EXPO_PUBLIC_DEBUG_MODE=false
```

---

## Database Setup Overview

### Initial Setup

1. **Create Neon PostgreSQL project** at [neon.tech](https://neon.tech)

2. **Get connection string** from Neon dashboard

3. **Set DATABASE_URL** in your environment variables

4. **Run migrations** (when available):
```bash
npm run migrate
```

### Database Schema Highlights

**Main tables:**
- `users` - User accounts with roles (user, admin, agent)
- `listings` - Property listings with details
- `photos` - Property photos/images
- `favorites` - User's saved listings
- `contacts` - Messages between users and agents

**Key constraints:**
- Foreign key relationships with CASCADE delete
- Timestamps on all tables (createdAt, updatedAt)
- Indexes on frequently queried columns (city, price, status)

---

## Deployment Overview

### Web App (Vercel)

1. **Connect GitHub repository** to Vercel

2. **Configure environment variables** in Vercel dashboard

3. **Deploy:**
```bash
git push origin main
```
Vercel automatically deploys on push.

### Mobile App (EAS Build)

1. **Initialize EAS:**
```bash
cd estately-mobile
eas build:configure
```

2. **Create build:**
```bash
eas build --platform all
```

3. **Submit to stores:**
```bash
eas submit --platform all
```

---

## API Documentation

### Key Endpoints

**Authentication:**
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh token

**Listings:**
- `GET /api/listings` - List all listings (paginated)
- `POST /api/listings` - Create listing (admin/agent)
- `GET /api/listings/:id` - Get listing details
- `PATCH /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

**Search:**
- `GET /api/search/listings?q=...` - Search listings

**Favorites:**
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:id` - Remove from favorites

### Response Format

**Success:**
```json
{
  "status": "success",
  "data": { /* ... */ },
  "meta": { "page": 1, "total": 100 }
}
```

**Error:**
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_INPUT",
    "message": "Price must be greater than 0"
  }
}
```

---

## Development Workflow

### Branching Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Commit Convention
```
feat: Add property search filters
fix: Fix listing detail loading
docs: Update API documentation
refactor: Extract listing service
style: Format code with Prettier
test: Add unit tests for search
```

### Code Quality
- **Linting**: `npm run lint`
- **Type Checking**: TypeScript strict mode
- **Testing**: Unit and E2E tests
- **Formatting**: Prettier (auto on save)

---

## Useful Commands

```bash
# Monorepo commands
npm install              # Install all dependencies
npm run dev             # Start all dev servers
npm run build           # Build all projects
npm run lint            # Lint all projects

# Web-specific
npm run --workspace=estately-web dev
npm run --workspace=estately-web build

# Mobile-specific
npm run --workspace=estately-mobile dev
npm run --workspace=estately-mobile web

# Database
npm run migrate         # Run migrations
npm run db:push        # Push schema to DB
npm run db:studio      # Open Drizzle Studio

# Git
git push origin main
git pull origin main
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Dependencies Not Installed
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Error
- Verify DATABASE_URL in .env.local
- Check Neon database is active
- Confirm credentials are correct

### Expo Development Issues
```bash
# Clear cache and restart
cd estately-mobile
npx expo start --clear
```

---

## Documentation Links

- [Global Instructions](./AGENTS.md) - Shared coding guidelines
- [Web App Guide](./estately-web/AGENTS.md) - Next.js & backend details
- [Mobile App Guide](./estately-mobile/AGENTS.md) - React Native & Expo details
- [Next.js Documentation](https://nextjs.org/docs)
- [Expo Documentation](https://docs.expo.dev)
- [Drizzle ORM](https://orm.drizzle.team)

---

## Support & Contact

For issues or questions:
1. Check existing documentation
2. Review related AGENTS.md files
3. Check GitHub issues
4. Contact development team

---

## License

This project is proprietary. All rights reserved.
