# /turbo - Mode Turbo ULTRA-CREATE

Active tous les systèmes d'optimisation pour création ultra-rapide.

## Usage

```
/turbo [type] "[description]" [options]
```

## Types Disponibles

| Type | Temps | Agents | Description |
|------|-------|--------|-------------|
| `saas` | < 3 min | 18-22 | SaaS complet avec auth, billing, dashboard |
| `landing` | < 1 min | 8-10 | Landing page professionnelle |
| `ecommerce` | < 5 min | 20-25 | Boutique e-commerce complète |
| `api` | < 2 min | 10-12 | API REST/GraphQL |
| `mobile` | < 4 min | 15-18 | App mobile iOS + Android |

## Exemples

```bash
# SaaS
/turbo saas "Application de gestion de projets pour équipes"

# Landing Page
/turbo landing "Startup IA de productivité"

# E-commerce
/turbo ecommerce "Boutique de vêtements vintage"

# API
/turbo api "API de réservation de salles"

# Mobile
/turbo mobile "App de suivi fitness"
```

## Options

```bash
--style=[modern|minimal|playful|corporate]  # Style UI
--auth=[clerk|supabase|nextauth]            # Provider auth
--db=[supabase|prisma|planetscale]          # Database
--deploy=[cloudflare|vercel|railway]        # Platform deploy
--skip-tests                                 # Skip quality phase
--skip-deploy                                # Skip deploy phase
```

## Ce qui est activé

1. **Queen v18** - Orchestration intelligente
2. **Parallel Executor** - 15-25 agents simultanés
3. **Super-Agents** - MCPs synergisés
4. **Quality Pipeline** - 4 couches de validation
5. **Memory Bridge** - Persistance cross-session
6. **Self-Healer** - Auto-correction erreurs
7. **Checkpoints** - Sauvegarde après chaque phase

## Output

```
/turbo saas "Mon SaaS"

Queen v18 Orchestrating...
├── Phase 1: Foundation (8 agents)
│   ├── [ui-super] Landing... DONE (12s)
│   ├── [backend-super] Auth... DONE (15s)
│   └── ... (6 more)
├── Checkpoint: phase_1 saved
├── Phase 2: Integration (3 agents)
│   └── ... DONE (25s)
├── Phase 3: Quality (4 agents)
│   ├── [SonarQube] Security... A
│   ├── [Tests] 156/156 passed
│   └── ...
├── Phase 4: Deploy (3 agents)
│   └── Deployed to Cloudflare
└── COMPLETE in 2m 47s

URL: https://mon-saas.pages.dev
Dashboard: https://dash.cloudflare.com
Monitoring: https://sentry.io
```

## Prompt

Quand l'utilisateur tape `/turbo [type] "[description]"`:

1. Identifier le type de projet (saas, landing, ecommerce, api, mobile)
2. Charger le workflow correspondant depuis `workflows/[type]-parallel.md`
3. Activer Queen v18 pour orchestration
4. Décomposer la tâche avec Task Decomposer
5. Exécuter en parallèle avec Parallel Executor
6. Sauvegarder checkpoints après chaque phase
7. Valider avec Quality Super
8. Déployer avec Deploy Super
9. Reporter les métriques finales

Utiliser les MCPs suivants en priorité:
- Context7 pour documentation actualisée
- Magic-UI pour UI professionnelle
- SonarQube + Semgrep pour sécurité
- Cloudflare pour déploiement edge
- Sentry pour monitoring

Objectif: Livrer un projet production-ready dans le temps cible.
