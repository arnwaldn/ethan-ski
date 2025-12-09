# /create - Créer un nouveau projet

Crée un projet complet et professionnel de A à Z.

## Usage
```
/create [type] [nom] [options]
```

## Types disponibles
- `web` - Application web Next.js
- `saas` - SaaS avec auth et paiements
- `ecommerce` - Boutique e-commerce
- `dashboard` - Dashboard admin
- `landing` - Landing page
- `mobile` - Application mobile Expo
- `desktop` - Application desktop Tauri
- `api` - API FastAPI/Express

## Exemples
```
/create saas MonSaaS
/create mobile MaSupperApp
/create ecommerce MaBoutique
```

## Ce qui est créé
1. Structure du projet complète
2. Configuration TypeScript
3. UI avec shadcn/ui
4. Authentication (si applicable)
5. Database schema (si applicable)
6. Tests de base
7. CI/CD GitHub Actions
8. README.md
9. .env.example

## Workflow
1. Analyse de la demande
2. Sélection de la stack optimale
3. Création de la structure
4. Installation des dépendances
5. Configuration initiale
6. Git init + premier commit
7. Instructions de démarrage
