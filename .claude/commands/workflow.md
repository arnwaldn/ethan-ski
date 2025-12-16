# /workflow - Workflows Parallèles

Exécute un workflow optimisé prédéfini pour un type de projet.

## Usage

```
/workflow-[type] "[nom du projet]" [options]
```

## Workflows Disponibles

### /workflow-saas
**Temps:** < 3 min | **Agents:** 18-22

```bash
/workflow-saas "Plateforme de gestion RH"
```

Génère:
- Landing page
- Auth (Clerk/Supabase)
- Dashboard
- API routes
- Stripe billing
- Email templates
- Tests + Docs

---

### /workflow-landing
**Temps:** < 1 min | **Agents:** 8-10

```bash
/workflow-landing "Startup IA productivité"
```

Génère:
- Hero section
- Features grid
- Pricing table
- Testimonials
- FAQ
- Contact form
- Footer
- SEO complet

---

### /workflow-ecommerce
**Temps:** < 5 min | **Agents:** 20-25

```bash
/workflow-ecommerce "Boutique artisanat"
```

Génère:
- Homepage
- Product catalog
- Product pages
- Cart + Checkout
- Admin dashboard
- Order management
- Inventory system
- Reviews + Wishlist

---

### /workflow-api
**Temps:** < 2 min | **Agents:** 10-12

```bash
/workflow-api "API réservations"
```

Génère:
- Prisma schema
- CRUD routes
- Validation (Zod)
- Auth middleware
- Rate limiting
- Caching (Redis)
- OpenAPI docs

---

### /workflow-mobile
**Temps:** < 4 min | **Agents:** 15-18

```bash
/workflow-mobile "App fitness tracker"
```

Génère:
- Navigation (Expo Router)
- Auth screens
- Tab navigation
- Profile + Settings
- API client
- Push notifications
- EAS build config

---

## Options Communes

```bash
--style=[modern|minimal|playful|corporate]
--auth=[clerk|supabase|nextauth]
--db=[supabase|prisma|planetscale]
--deploy=[cloudflare|vercel|railway]
--skip-quality    # Skip validation phase
--skip-deploy     # Skip deploy phase
--dry-run         # Show plan without executing
```

## Dry Run

```bash
/workflow-saas "Mon Projet" --dry-run

Workflow: saas-parallel
├── Phase 1: Foundation (8 agents, ~60s)
│   ├── landing_page → ui-super
│   ├── auth_system → backend-super
│   ├── database_schema → backend-super
│   └── ... (5 more)
├── Phase 2: Integration (3 agents, ~60s)
├── Phase 3: Quality (4 agents, ~60s)
└── Phase 4: Deploy (3 agents, ~20s)

Total: 18 agents, ~200s estimated
Files: ~50 expected
```

## Custom Workflow

Tu peux aussi créer un workflow custom:

```bash
/workflow custom --phases="foundation:5,features:8,quality:3" --timeout=300
```

## Prompt

Quand l'utilisateur tape `/workflow-[type] "[projet]"`:

1. Charger le workflow depuis `workflows/[type]-parallel.md`
2. Initialiser Queen v18 pour orchestration
3. Décomposer selon les phases définies
4. Exécuter avec Parallel Executor
5. Checkpoints après chaque phase
6. Quality check obligatoire
7. Deploy si non skip
8. Reporter les métriques

Chaque workflow a été optimisé pour le meilleur ratio temps/qualité.
