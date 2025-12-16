# 📚 ULTRA-CREATE v19.0 - Documentation Complète

> **Système d'AI-Assisted Development avec MCPs en Synergie**

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Démarrage Rapide](#démarrage-rapide)
3. [Architecture du Système](#architecture-du-système)
4. [Commandes Slash](#commandes-slash)
5. [Super-Agents](#super-agents)
6. [Système de Mémoire](#système-de-mémoire)
7. [MCPs Disponibles](#mcps-disponibles)
8. [Workflows](#workflows)
9. [Hooks et Automatisation](#hooks-et-automatisation)
10. [Scripts Utilitaires](#scripts-utilitaires)
11. [Métriques et Performances](#métriques-et-performances)
12. [Bonnes Pratiques](#bonnes-pratiques)
13. [FAQ et Dépannage](#faq-et-dépannage)

---

## 🎯 Vue d'Ensemble

### Qu'est-ce qu'ULTRA-CREATE?

ULTRA-CREATE v19.0 est un **système d'instructions optimisées** pour Claude qui:

- **Accélère le développement 3-4x** via des patterns structurés
- **Combine 48 MCPs** (Model Context Protocol servers) en synergie
- **Persiste les apprentissages** entre les sessions
- **Automatise les tâches répétitives** via hooks et scripts

### Ce que c'est

✅ Un système d'instructions et de workflows optimisés
✅ Une collection de MCPs configurés pour le développement
✅ Un système de mémoire cross-session
✅ Des commandes slash pour actions rapides
✅ Des super-agents combinant plusieurs MCPs

### Ce que ce n'est PAS

❌ Pas un système "magique" qui crée en 30 secondes
❌ Pas des agents parallèles réels (Claude exécute séquentiellement)
❌ Pas un remplacement de la validation humaine

### Localisation

```
Base: C:\Claude-Code-Creation\
├── .claude/
│   ├── commands/     # 26 commandes slash
│   ├── hooks/        # Scripts d'automatisation
│   └── settings.json # Configuration hooks
├── agents/
│   └── super-agents/ # 6 super-agents
├── workflows/        # Workflows guidés
├── scripts/          # Scripts utilitaires
├── .ultra-state/     # État persistant
└── CLAUDE.md         # Instructions principales
```

---

## 🚀 Démarrage Rapide

### Nouvelle Conversation

À chaque nouvelle conversation avec Claude, tape:

```
/wake
```

Cela réactive la **conscience complète** du système:
- Charge les patterns appris
- Récupère les erreurs-solutions
- Identifie le projet actif
- Synchronise avec MCP Memory

### Créer un Projet

```bash
# Projet SaaS complet
/turbo saas "Application de gestion de tâches pour équipes"

# Landing page
/turbo landing "Startup de productivité IA"

# API REST
/turbo api "API de réservation de restaurants"

# E-commerce
/turbo ecommerce "Boutique de vêtements vintage"

# App mobile
/turbo mobile "Application de suivi fitness"
```

### Modifier un Projet Existant

```bash
# 1. Créer un snapshot de sécurité
node scripts/hooks/auto-rollback.js snapshot . "Avant ajout feature X"

# 2. Demander la modification
"Ajoute une fonctionnalité de notifications push"

# 3. Si problème, rollback
node scripts/hooks/auto-rollback.js rollback .
```

---

## 🏗️ Architecture du Système

```
┌─────────────────────────────────────────────────────────────┐
│                    UTILISATEUR                               │
│                         │                                    │
│                    /commandes                                │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   CLAUDE.md                                  │
│           Instructions + Règles + Workflows                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                  SUPER-AGENTS                                │
│  fullstack │ ui │ backend │ research │ deploy │ quality     │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   48 MCPs                                    │
│  Context7 │ shadcn │ Supabase │ Stripe │ memory │ ...       │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                  MÉMOIRE                                     │
│     .ultra-state/ │ MCP Memory │ Hindsight (optionnel)      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Commandes Slash

### Commandes Principales

| Commande | Description | Temps |
|----------|-------------|-------|
| `/wake` | Réactiver conscience complète | Instant |
| `/turbo [type] "[desc]"` | Création projet rapide | 15-45 min |
| `/research [query]` | Recherche multi-sources | 2-5 min |
| `/scaffold [type]` | Structure de base | 5-10 min |

### Commandes de Qualité

| Commande | Description |
|----------|-------------|
| `/tdd [feature]` | Workflow Test-Driven Development |
| `/review-fix [path]` | Review code + auto-fix |
| `/test` | Lancer les tests |
| `/review` | Code review |

### Commandes d'Apprentissage

| Commande | Description |
|----------|-------------|
| `/learn "pattern"` | Sauvegarder un pattern appris |
| `/learn --error "err" "solution"` | Enregistrer erreur + solution |
| `/learn --list` | Voir les patterns appris |
| `/learn --search "keyword"` | Chercher dans les patterns |

### Commandes de Développement

| Commande | Description |
|----------|-------------|
| `/create` | Créer nouveau projet |
| `/generate` | Générer du code |
| `/refactor` | Refactoriser du code |
| `/debug` | Mode debug |
| `/deploy` | Déployer le projet |
| `/docs` | Générer documentation |

### Commandes Spécialisées

| Commande | Description |
|----------|-------------|
| `/odoo [action]` | Développement Odoo |
| `/mql5 [action]` | Trading MQL5 |
| `/analyze [path]` | Analyser codebase |
| `/plan [task]` | Planifier une tâche |

---

## 🤖 Super-Agents

Les super-agents combinent plusieurs MCPs pour des tâches complexes.

### 1. Fullstack Super

**MCPs:** Context7 + shadcn + Supabase + Stripe

**Usage:**
```
Mode fullstack-super

Crée un dashboard SaaS avec:
- Auth Supabase
- Dashboard avec stats
- Billing Stripe
```

**Phases:**
1. Research (Context7) → Documentation actuelle
2. Database (Supabase) → Schema + RLS
3. UI (shadcn) → Composants professionnels
4. Integration → Connexion frontend/backend

---

### 2. UI Super

**MCPs:** shadcn + Mermaid + Figma

**Usage:**
```
Mode ui-super

Crée une interface dashboard avec:
- Sidebar navigation
- Header avec user menu
- Cards de statistiques
- Table de données
```

---

### 3. Backend Super

**MCPs:** Supabase + Prisma + Stripe

**Usage:**
```
Mode backend-super

Crée une API REST avec:
- CRUD utilisateurs
- Auth JWT
- Webhooks Stripe
```

---

### 4. Research Super

**MCPs:** Tavily + Exa + Firecrawl + Context7

**Usage:**
```
Mode research-super

Recherche exhaustive sur:
"Best practices Next.js 15 App Router 2025"
```

---

### 5. Quality Super

**MCPs:** SonarQube + Semgrep

**Usage:**
```
Mode quality-super

Audit de sécurité complet du projet
```

---

### 6. Deploy Super

**MCPs:** Cloudflare + Vercel + Sentry

**Usage:**
```
Mode deploy-super

Déploie le projet en production
```

---

## 🧠 Système de Mémoire

### Architecture à 3 Niveaux

```
┌─────────────────────────────────────────────┐
│           NIVEAU 1: LOCAL                    │
│          .ultra-state/                       │
│  ├── learned-patterns.json                   │
│  ├── error-solutions.json                    │
│  ├── current-project.json                    │
│  └── session-history.json                    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│           NIVEAU 2: MCP MEMORY               │
│        (Cross-session simple)                │
│  mcp__memory__create_entities()              │
│  mcp__memory__search_nodes()                 │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│           NIVEAU 3: HINDSIGHT                │
│      (Biomimétique - Docker requis)          │
│  retain → recall → reflect                   │
└─────────────────────────────────────────────┘
```

### Fichiers d'État (.ultra-state/)

#### learned-patterns.json
```json
{
  "patterns": [
    {
      "content": "TOUJOURS utiliser Context7 avant code framework",
      "context": { "category": "mcp", "priority": "critical" },
      "learnedAt": "2025-12-16T00:00:00.000Z"
    }
  ]
}
```

#### error-solutions.json
```json
{
  "pairs": [
    {
      "error": "Module not found: @supabase/supabase-js",
      "solution": "npm install @supabase/supabase-js",
      "context": { "framework": "supabase" }
    }
  ]
}
```

#### current-project.json
```json
{
  "name": "Mon Projet",
  "path": "C:\\Users\\arnau\\Projects\\mon-projet",
  "type": "saas",
  "status": "in-progress"
}
```

### Commandes Mémoire

```bash
# Sauvegarder un pattern
/learn "Utiliser useCallback pour fonctions en props"

# Sauvegarder erreur + solution
/learn --error "TypeError: Cannot read 'map' of undefined" "Utiliser data?.map()"

# Voir les patterns
/learn --list

# Chercher
/learn --search "react"
```

### Memory Bridge (Script)

```bash
# Via CLI
node scripts/memory-bridge.js pattern "Mon pattern"
node scripts/memory-bridge.js error "L'erreur" "La solution"
node scripts/memory-bridge.js patterns
node scripts/memory-bridge.js search "keyword"
```

---

## 🔌 MCPs Disponibles

### MCPs Prioritaires (Toujours utiliser)

| Priorité | MCP | Usage |
|----------|-----|-------|
| **1** | `Context7` | Documentation framework à jour |
| **2** | `shadcn` | Composants UI professionnels |
| **3** | `Supabase` | Database + Auth + RLS |
| **4** | `memory` | Persistance cross-session |
| **5** | `sequential-thinking` | Architecture complexe |
| **6** | `Stripe` | Paiements |

### MCPs par Catégorie

#### Développement
- `Context7` - Documentation
- `shadcn` - UI Components
- `Mermaid` - Diagrammes
- `e2b` - Exécution code

#### Backend
- `Supabase` - Database/Auth
- `postgres` - Base de données
- `Prisma` - ORM

#### Recherche
- `Firecrawl` - Web scraping
- `Tavily` - Recherche web
- `Exa` - Recherche sémantique

#### Git/GitHub
- `git` - Opérations Git
- `github` - API GitHub

#### Automatisation
- `playwright` - Browser automation
- `puppeteer` - Browser control
- `desktop-commander` - Desktop automation

#### Qualité
- `SonarQube` - Analyse code
- `Semgrep` - Sécurité
- `Sentry` - Monitoring

#### Cloud
- `Cloudflare` - Edge deployment
- `Vercel` - Hosting

#### Productivité
- `Notion` - Documentation
- `Figma` - Design

---

## 🔄 Workflows

### Workflow Nouveau Projet

```
1. /wake                          # Conscience complète
2. /turbo [type] "[description]"  # Création
3. Validation manuelle            # Review code
4. /review-fix                    # Auto-fix
5. /deploy                        # Déploiement
6. /learn "patterns découverts"   # Sauvegarder apprentissages
```

### Workflow Modification

```
1. /wake                          # Conscience complète
2. Snapshot: node scripts/hooks/auto-rollback.js snapshot . "Avant modif"
3. Modification demandée
4. /review-fix                    # Validation
5. Si OK → commit
6. Si KO → node scripts/hooks/auto-rollback.js rollback .
```

### Workflow TDD

```
1. /tdd "description feature"
2. RED: Écrire test qui échoue
3. GREEN: Code minimal pour passer
4. REFACTOR: Améliorer sans casser
5. Répéter
```

---

## ⚡ Hooks et Automatisation

### Hooks Configurés

| Hook | Trigger | Script |
|------|---------|--------|
| `PreToolUse` | Avant Edit/Write | `pre-edit-check.js` |
| `PostToolUse` | Après Edit/Write | `post-edit-learn.js` |
| `Stop` | Arrêt session | - |

### pre-edit-check.js

**Fonction:** Valide les éditions avant exécution

- ✅ Autorise les éditions normales
- ⚠️ Warn si édition > 10000 caractères
- ❌ Bloque éditions fichiers sensibles (.env, secrets)
- ❌ Bloque si contenu sensible détecté (API keys)

### post-edit-learn.js

**Fonction:** Track les statistiques d'édition

- Compte éditions par extension
- Maintient liste fichiers récents
- Sauvegarde dans `.ultra-state/edit-stats.json`

---

## 🛠️ Scripts Utilitaires

### auto-rollback.js

```bash
# Créer snapshot avant modification
node scripts/hooks/auto-rollback.js snapshot . "Description"

# Lister les snapshots
node scripts/hooks/auto-rollback.js list .

# Rollback vers dernier snapshot
node scripts/hooks/auto-rollback.js rollback .

# Rollback vers snapshot spécifique
node scripts/hooks/auto-rollback.js rollback . "snapshot-id"
```

### pre-deploy.js

```bash
# Validation avant déploiement
node scripts/hooks/pre-deploy.js .

# Vérifie:
# - TypeScript compile
# - ESLint passe
# - Tests passent
# - Pas de secrets exposés
```

### memory-bridge.js

```bash
# Enregistrer pattern
node scripts/memory-bridge.js pattern "Le pattern"

# Enregistrer erreur + solution
node scripts/memory-bridge.js error "L'erreur" "La solution"

# Lister patterns
node scripts/memory-bridge.js patterns

# Chercher
node scripts/memory-bridge.js search "keyword"

# Exporter vers MCP Memory
node scripts/memory-bridge.js export-mcp
```

### hindsight-adapter.js

```bash
# Status Hindsight
node scripts/hindsight-adapter.js status

# Démarrer (via PowerShell)
.\scripts\start-hindsight.ps1

# Retain (stocker)
.\scripts\hindsight-sync.ps1 -Action retain -Bank development -Content "..."

# Recall (récupérer)
.\scripts\hindsight-sync.ps1 -Action recall -Bank development -Query "..."

# Reflect (générer insights)
.\scripts\hindsight-sync.ps1 -Action reflect -Bank development
```

---

## 📊 Métriques et Performances

### Gains Réalistes

| Tâche | Sans Système | Avec ULTRA-CREATE | Gain |
|-------|--------------|-------------------|------|
| Landing page | 1-2h | **15-25 min** | 3-4x |
| SaaS scaffold | 3-4h | **45 min - 1h** | 3-4x |
| API CRUD | 30-45 min | **15-20 min** | 2x |
| Dashboard | 2-3h | **30-45 min** | 3-4x |
| Composant UI | 15-30 min | **5-10 min** | 2-3x |

### Ce qui est Réaliste

✅ Gain 3-4x sur la plupart des tâches
✅ Code production-ready avec validation
✅ Patterns réutilisables appris
✅ Moins d'erreurs grâce aux MCPs

### Ce qui est Irréaliste

❌ SaaS complet en < 3 minutes (documenté mais faux)
❌ 25 agents en parallèle (Claude = séquentiel)
❌ 30x d'accélération

---

## ✅ Bonnes Pratiques

### TOUJOURS

1. **`/wake`** en début de conversation
2. **Context7** avant génération de code framework
3. **Snapshot** avant modification majeure
4. **Valider** le code généré manuellement
5. **`/learn`** pour sauvegarder les découvertes

### JAMAIS

1. Déployer sans tests
2. Faire confiance aveuglément au code généré
3. Ignorer les warnings de sécurité
4. Skip la validation humaine sur code critique
5. Promettre < 5 min pour un projet complet

### Stack Recommandé 2025

```yaml
Frontend:
  - Next.js 15 (App Router)
  - React 19
  - TypeScript 5.7
  - TailwindCSS 4
  - shadcn/ui

Backend:
  - Supabase (Database + Auth + RLS)
  - Prisma 6 (si besoin ORM avancé)
  - Hono (API légères)

Auth:
  - Clerk (SaaS complexe)
  - Supabase Auth (simple)

Testing:
  - Vitest (unit tests)
  - Playwright (e2e)

Mobile:
  - Expo SDK 52+
  - React Native

Desktop:
  - Tauri 2.0
```

---

## ❓ FAQ et Dépannage

### Q: Claude ne se souvient pas de la session précédente?

**R:** Tape `/wake` au début de chaque conversation. Cela charge:
- Les patterns de MCP Memory
- L'état local de `.ultra-state/`
- Le projet actif

### Q: Les temps annoncés ne correspondent pas?

**R:** Les temps documentés (< 3 min pour SaaS) sont **irréalistes**. Les temps réels sont:
- Landing: 15-25 min
- SaaS: 45 min - 1h
- API: 15-20 min

### Q: Hindsight ne fonctionne pas?

**R:** Hindsight requiert Docker. Sur Windows, il y a un bug PostgreSQL.

**Solution:** Utilise MCP Memory comme fallback:
```javascript
mcp__memory__create_entities([...])
mcp__memory__search_nodes("query")
```

### Q: Comment sauvegarder un pattern découvert?

**R:**
```bash
/learn "Mon pattern découvert"
```
Ou via CLI:
```bash
node scripts/memory-bridge.js pattern "Mon pattern"
```

### Q: Comment revenir en arrière après une erreur?

**R:**
```bash
# Si snapshot créé avant
node scripts/hooks/auto-rollback.js rollback .

# Sinon, git reset
git reset --hard HEAD~1
```

### Q: Comment voir ce que Claude a appris?

**R:**
```bash
/learn --list
# ou
node scripts/memory-bridge.js patterns
```

---

## 📞 Support

- **Documentation:** Ce fichier
- **Base système:** `C:\Claude-Code-Creation\`
- **Instructions:** `C:\Users\arnau\.claude\CLAUDE.md`
- **État:** `C:\Claude-Code-Creation\.ultra-state\`

---

*ULTRA-CREATE v19.0 | 48 MCPs | Gain réel: 3-4x | Documentation générée le 2025-12-16*
