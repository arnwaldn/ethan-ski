# /migrate - Migration de Projets

Migre des projets legacy vers des technologies modernes.

## Usage
```
/migrate [action] [options]
```

## Actions

### analyze - Analyser un projet
```
/migrate analyze C:\path\to\project
```
Retourne:
- Stack actuelle détectée
- Version des dépendances
- Points de migration identifiés
- Estimation de complexité

### plan - Créer un plan de migration
```
/migrate plan react-to-nextjs
/migrate plan vue2-to-vue3
/migrate plan js-to-typescript
```
Génère un plan détaillé étape par étape.

### execute - Exécuter une migration
```
/migrate execute [plan-file]
```
Applique les transformations automatiquement.

### upgrade - Mettre à jour les dépendances
```
/migrate upgrade
/migrate upgrade --major
/migrate upgrade --security-only
```

## Migrations Supportées

| De | Vers | Commande |
|----|------|----------|
| React | Next.js | `/migrate plan react-to-nextjs` |
| Vue 2 | Vue 3 | `/migrate plan vue2-to-vue3` |
| JavaScript | TypeScript | `/migrate plan js-to-typescript` |
| Express | Fastify | `/migrate plan express-to-fastify` |
| REST | GraphQL | `/migrate plan rest-to-graphql` |
| CSS | TailwindCSS | `/migrate plan css-to-tailwind` |

## Exemples

### Migration React → Next.js
```
/migrate analyze ./my-react-app
```
Output:
```
📊 Analyse du projet

Stack Détectée:
├── Framework: React 18.2
├── Router: React Router 6
├── State: Redux Toolkit
├── Styling: CSS Modules
└── Build: Create React App

Migration Recommandée: Next.js 15 App Router

Complexité: Moyenne (2-3 jours estimés)

Changements Requis:
├── 🔄 15 fichiers de routing
├── 🔄 8 composants avec data fetching
├── 🔄 3 API endpoints
└── ✅ 42 composants UI (compatibles)

Commencer? /migrate plan react-to-nextjs
```

### Migration JavaScript → TypeScript
```
/migrate plan js-to-typescript
```
Output:
```
📋 Plan de Migration: JS → TypeScript

Phase 1: Setup (automatique)
├── Installer typescript, @types/*
├── Créer tsconfig.json
└── Configurer ESLint

Phase 2: Migration Progressive
├── Renommer .js → .ts (utils en premier)
├── Ajouter types aux fonctions exportées
├── Résoudre les erreurs any
└── Activer strict mode

Phase 3: Finalisation
├── Supprimer allowJs
├── Ajouter type guards
└── Documenter les types

Fichiers à migrer: 45
Estimation: 4-6 heures

Exécuter? /migrate execute js-to-typescript
```

## Options

```
--dry-run     # Voir les changements sans appliquer
--backup      # Créer backup avant migration
--step        # Exécuter étape par étape
--verbose     # Logs détaillés
```

## Checklist Automatique

Avant chaque migration:
- [x] Backup créé
- [x] Tests existants passent
- [x] Git status clean
- [x] Plan de rollback prêt

Après migration:
- [x] Build réussi
- [x] Tests passent
- [x] Fonctionnalités vérifiées
- [x] Performance stable
