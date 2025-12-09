# Commande: /scaffold

## Description
Génère la structure complète d'un projet avec configuration optimale.

## Usage
```
/scaffold [type] [nom] [options]
```

## Types supportés
- `nextjs` - Application Next.js 15 avec App Router
- `expo` - Application mobile Expo
- `tauri` - Application desktop Tauri
- `api` - API REST avec FastAPI ou Hono
- `library` - Librairie npm/package
- `monorepo` - Monorepo avec Turborepo

## Options
- `--auth` - Ajouter authentification (Supabase/Clerk)
- `--db` - Ajouter database (Prisma + PostgreSQL)
- `--stripe` - Ajouter paiements Stripe
- `--testing` - Ajouter Vitest + Playwright
- `--docker` - Ajouter Dockerfile + docker-compose

## Exemples
```
/scaffold nextjs my-saas --auth --db --stripe
/scaffold expo my-app --auth
/scaffold api my-backend --db --docker
```

## Structure générée (Next.js exemple)
```
my-saas/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   └── dashboard/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   └── ...
│   ├── lib/
│   │   ├── db.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   └── types/
├── prisma/
│   └── schema.prisma
├── tests/
├── package.json
├── tailwind.config.ts
└── ...
```

## Agents utilisés
- `full-stack-generator` (orchestration)
- `frontend-developer`
- `backend-developer`
- `database-architect`
