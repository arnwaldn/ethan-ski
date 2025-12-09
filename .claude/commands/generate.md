# /generate - Génération Full-Stack Complète

Génère une application complète de A à Z en utilisant l'agent full-stack-generator.

## Usage
```
/generate [type] "[nom]" [features]
```

## Types Disponibles
- `saas` - Application SaaS avec auth et billing
- `ecommerce` - Boutique e-commerce
- `dashboard` - Dashboard admin
- `mobile` - App mobile Expo
- `desktop` - App desktop Tauri
- `api` - API REST

## Features Optionnelles

### Pour SaaS
- `auth` - Authentification (email + OAuth)
- `teams` - Multi-tenant / équipes
- `billing` - Stripe subscriptions
- `analytics` - Dashboard analytics

### Pour E-commerce
- `products` - Catalogue produits
- `cart` - Panier d'achat
- `checkout` - Processus de paiement
- `reviews` - Avis clients
- `wishlist` - Liste de souhaits

### Pour Dashboard
- `users` - Gestion utilisateurs
- `analytics` - Graphiques et stats
- `reports` - Génération de rapports
- `settings` - Paramètres admin

## Exemples

### SaaS Complet
```
/generate saas "ProjectHub" auth,teams,billing,analytics
```
Crée:
- Auth complète (email + Google + GitHub)
- Système d'équipes/organisations
- Abonnements Stripe (Free/Pro/Enterprise)
- Dashboard avec analytics

### E-commerce
```
/generate ecommerce "TechShop" products,cart,checkout,reviews
```
Crée:
- Catalogue avec catégories
- Panier persistant
- Checkout Stripe
- Système d'avis

### Dashboard Admin
```
/generate dashboard "AdminPanel" users,analytics,reports
```
Crée:
- CRUD utilisateurs avec rôles
- Graphiques Recharts
- Export PDF/CSV

### App Mobile
```
/generate mobile "FitnessTracker" auth,offline
```
Crée:
- App Expo avec navigation
- Auth Supabase
- Storage offline

## Processus de Génération

1. **Analyse** (2 min)
   - Parsing de la demande
   - Sélection de la stack
   - Plan de développement

2. **Structure** (3 min)
   - Création du projet
   - Configuration TypeScript
   - Schéma base de données

3. **Backend** (5-10 min)
   - API routes
   - Server Actions
   - Webhooks

4. **Frontend** (10-15 min)
   - Composants UI
   - Pages
   - Intégrations

5. **Quality** (5 min)
   - Tests de base
   - Lint + Type check
   - Audit sécurité

6. **Deploy** (2 min)
   - Build production
   - Configuration Vercel
   - Premier déploiement

## Output Attendu

```
✅ Projet créé: C:\Claude-Code-Creation\projects\[nom]
✅ Stack: Next.js 15 + Supabase + Stripe + shadcn/ui
✅ Features: auth, teams, billing, analytics
✅ Tests: 12 passing
✅ Build: Success
✅ Deploy: https://[nom].vercel.app

📁 Structure:
├── app/
├── components/
├── lib/
├── prisma/
└── tests/

📝 .env.example créé avec les variables requises
📚 README.md avec instructions de setup

🚀 Prochaines étapes:
1. Configurer les variables d'environnement
2. Créer le projet Supabase
3. Configurer Stripe
4. Personnaliser selon vos besoins
```
