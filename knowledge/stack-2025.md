# Stack Recommandée 2025

## Web Applications

### SaaS / Dashboard
```yaml
Framework: Next.js 15 (App Router)
Language: TypeScript (strict)
Styling: TailwindCSS + shadcn/ui
Database: Supabase (PostgreSQL)
ORM: Prisma ou Drizzle
Auth: Supabase Auth ou Clerk
Payments: Stripe
State: Zustand + React Query
Forms: React Hook Form + Zod
Testing: Vitest + Playwright
Deploy: Vercel
```

### E-commerce
```yaml
Framework: Next.js 15
Styling: TailwindCSS + shadcn/ui
Database: Supabase
ORM: Prisma
Auth: Supabase Auth
Payments: Stripe (Checkout + Connect)
Search: Algolia ou Meilisearch
State: Zustand
Deploy: Vercel
```

### Landing Page / Marketing
```yaml
Framework: Astro ou Next.js
Styling: TailwindCSS
Animations: Framer Motion
CMS: Sanity ou Contentful (optionnel)
Analytics: Plausible ou Posthog
Deploy: Vercel ou Netlify
```

## Mobile Applications

### Cross-Platform
```yaml
Framework: Expo (React Native)
Routing: Expo Router
Styling: NativeWind (TailwindCSS)
State: Zustand + React Query
Storage: Expo SecureStore + AsyncStorage
Push: Expo Notifications
Auth: Supabase Auth
Build: EAS Build
Deploy: EAS Submit
```

### Alternative Flutter
```yaml
Framework: Flutter
State: Riverpod ou Bloc
Storage: Hive ou SQLite
Auth: Firebase Auth ou Supabase
Build: flutter build
Deploy: Manual ou Codemagic
```

## Desktop Applications

### Léger & Performant
```yaml
Framework: Tauri 2.0
Frontend: React + TypeScript
Styling: TailwindCSS + shadcn/ui
Database: SQLite (via rusqlite)
State: Zustand
Build: tauri build
```

### Feature-Rich
```yaml
Framework: Electron
Frontend: React + TypeScript
Styling: TailwindCSS + shadcn/ui
Database: SQLite (better-sqlite3)
State: Zustand
Build: electron-builder
```

## Backend / API

### Node.js
```yaml
Framework: Hono ou Express
Runtime: Node.js ou Bun
Database: PostgreSQL
ORM: Prisma ou Drizzle
Validation: Zod
Auth: JWT + Cookies
```

### Python
```yaml
Framework: FastAPI
Database: PostgreSQL
ORM: SQLAlchemy
Validation: Pydantic
Auth: JWT
```

## DevOps & Infrastructure

### CI/CD
```yaml
Platform: GitHub Actions
Linting: ESLint + Prettier
Testing: Vitest + Playwright
Build: Turbo (monorepo)
```

### Deployment
```yaml
Web: Vercel (primary), Netlify, Railway
Edge: Cloudflare Workers
Database: Supabase, PlanetScale, Neon
Storage: Supabase Storage, Cloudflare R2
```

## Outils Recommandés

### VS Code Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma
- Error Lens
- GitLens

### Packages Essentiels
```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.5.0",
    "zod": "^3.23.0",
    "react-hook-form": "^7.52.0",
    "@hookform/resolvers": "^3.9.0",
    "date-fns": "^3.6.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vitest": "^2.0.0",
    "@playwright/test": "^1.45.0",
    "prettier": "^3.3.0",
    "eslint": "^9.0.0"
  }
}
```
