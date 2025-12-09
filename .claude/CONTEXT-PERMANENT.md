# CONTEXT-PERMANENT - ULTRA-CREATE v11.0

**IMPORTANT**: Ce fichier doit être consulté au début de chaque session.

## Inventaire Complet du Système (Vérifié et Validé)

### Architecture Swarm Intelligence

```
                    ┌─────────────┐
                    │   QUEEN     │  ← Orchestrateur Suprême
                    │ (Strategy)  │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │ COORDINATOR │  ← Moteur d'exécution
                    │ (Execution) │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
      ┌────┴────┐     ┌────┴────┐     ┌────┴────┐
      │ Workers │     │ Workers │     │ Workers │
      │ Core    │     │ Special │     │ Research│
      └─────────┘     └─────────┘     └─────────┘
```

---

## AGENTS SPÉCIALISÉS (54 agents vérifiés)

### Swarm (3)
| Agent | Fichier | Description |
|-------|---------|-------------|
| Queen | `agents/swarm/queen.md` | Orchestrateur suprême |
| Worker Protocol | `agents/swarm/worker-protocol.md` | Protocole workers |
| Swarm Coordinator | `agents/swarm/swarm-coordinator.md` | Moteur d'orchestration |

### Core (7)
| Agent | Fichier | Description |
|-------|---------|-------------|
| Orchestrator | `agents/core/orchestrator.md` | Tech Lead, coordination |
| Frontend Developer | `agents/core/frontend-developer.md` | React/Next.js expert |
| Backend Developer | `agents/core/backend-developer.md` | API/Database expert |
| UI Designer | `agents/core/ui-designer.md` | shadcn/TailwindCSS |
| Tester | `agents/core/tester.md` | Vitest/Playwright |
| Self-Improver | `agents/core/self-improver.md` | Amélioration continue |
| Full-Stack Generator | `agents/core/full-stack-generator.md` | Orchestrateur principal |

### AI/ML (2)
| Agent | Fichier | Description |
|-------|---------|-------------|
| ML Engineer | `agents/ai-ml/ml-engineer.md` | TensorFlow, PyTorch, MLOps |
| Prompt Engineer | `agents/ai-ml/prompt-engineer.md` | LLM prompts, LangChain |

### Analysis (2)
| Agent | Fichier | Description |
|-------|---------|-------------|
| Code Reviewer | `agents/analysis/code-reviewer.md` | Review qualité, sécurité |
| Tech Scout | `agents/analysis/tech-scout.md` | Veille technologique |

### Research (1)
| Agent | Fichier | Description |
|-------|---------|-------------|
| Deep Researcher | `agents/research/deep-researcher.md` | Recherche multi-hop |

### Cloud (2)
| Agent | Fichier | Description |
|-------|---------|-------------|
| AWS Architect | `agents/cloud/aws-architect.md` | Solutions AWS |
| Kubernetes Expert | `agents/cloud/kubernetes-expert.md` | K8s, Helm, EKS/GKE |

### Automation (2)
| Agent | Fichier | Description |
|-------|---------|-------------|
| CI/CD Engineer | `agents/automation/ci-cd-engineer.md` | GitHub Actions, pipelines |
| Test Automation | `agents/automation/test-automation.md` | Vitest, Playwright |

### Quality (2)
| Agent | Fichier | Description |
|-------|---------|-------------|
| Security Auditor | `agents/quality/security-auditor.md` | OWASP, audits sécurité |
| Auto Validator | `agents/quality/auto-validator.md` | Validation automatique |

### Security (1)
| Agent | Fichier | Description |
|-------|---------|-------------|
| Penetration Tester | `agents/security/penetration-tester.md` | Pentest éthique |

### Content (1)
| Agent | Fichier | Description |
|-------|---------|-------------|
| Technical Writer | `agents/content/technical-writer.md` | Documentation |

### Data (1)
| Agent | Fichier | Description |
|-------|---------|-------------|
| Data Modeler | `agents/data/data-modeler.md` | Prisma, schémas DB |

### Web (1)
| Agent | Fichier | Description |
|-------|---------|-------------|
| Next.js Expert | `agents/web/nextjs-expert.md` | Next.js 15 + App Router |

### Mobile (1)
| Agent | Fichier | Description |
|-------|---------|-------------|
| Expo Expert | `agents/mobile/expo-expert.md` | React Native Expo |

### Desktop (1)
| Agent | Fichier | Description |
|-------|---------|-------------|
| Tauri Expert | `agents/desktop/tauri-expert.md` | Tauri 2.0 |

### DevOps (1)
| Agent | Fichier | Description |
|-------|---------|-------------|
| Deployer | `agents/devops/deployer.md` | CI/CD, Vercel, Docker |

### Specialized (14)
| Agent | Fichier | Description |
|-------|---------|-------------|
| Database Architect | `agents/specialized/database-architect.md` | Prisma, Supabase |
| API Designer | `agents/specialized/api-designer.md` | REST/GraphQL |
| Performance Optimizer | `agents/specialized/performance-optimizer.md` | Core Web Vitals |
| SEO Expert | `agents/specialized/seo-expert.md` | Référencement |
| Accessibility Auditor | `agents/specialized/accessibility-auditor.md` | WCAG |
| Payment Expert | `agents/specialized/payment-expert.md` | Stripe |
| Refactoring Expert | `agents/specialized/refactoring-expert.md` | Code quality |
| Debugger | `agents/specialized/debugger.md` | Résolution d'erreurs |
| Migration Expert | `agents/specialized/migration-expert.md` | Modernisation |
| Documentation Generator | `agents/specialized/documentation-generator.md` | Docs auto |
| MQL5 Expert | `agents/specialized/mql5-expert.md` | Trading MT5, EA |
| Odoo Expert | `agents/specialized/odoo-expert.md` | Odoo v19, ORM |
| Integration Expert | `agents/specialized/integration-expert.md` | API, Webhooks |
| Hospitality Expert | `agents/specialized/hospitality-expert.md` | Hôtellerie, PMS |

### Odoo Experts (12)
| Agent | Fichier | Description |
|-------|---------|-------------|
| Odoo ORM Expert | `agents/odoo/odoo-orm-expert.md` | ORM Odoo avancé |
| Odoo Accounting | `agents/odoo/odoo-accounting-expert.md` | Comptabilité |
| Odoo Manufacturing | `agents/odoo/odoo-manufacturing-expert.md` | Production MRP |
| Odoo Retail POS | `agents/odoo/odoo-retail-pos-expert.md` | Point de vente |
| Odoo Hospitality | `agents/odoo/odoo-hospitality-expert.md` | Hôtellerie |
| Odoo Integration | `agents/odoo/odoo-integration-expert.md` | API externe |
| Odoo Education | `agents/odoo/odoo-education-expert.md` | Formation |
| Odoo Events | `agents/odoo/odoo-events-expert.md` | Événementiel |
| Odoo Food & Beverage | `agents/odoo/odoo-food-beverage-expert.md` | Restauration |
| Odoo Healthcare | `agents/odoo/odoo-healthcare-expert.md` | Santé |
| Odoo Real Estate | `agents/odoo/odoo-realestate-expert.md` | Immobilier |
| Odoo Field Service | `agents/odoo/odoo-field-service-expert.md` | Interventions |

---

## MODES COMPORTEMENTAUX (7)

| Mode | Fichier | Description | Quand l'utiliser |
|------|---------|-------------|------------------|
| Standard | `modes/standard.md` | Mode équilibré par défaut | Tâches générales |
| Brainstorm | `modes/brainstorm.md` | Exploration créative | Début projet, options |
| Architect | `modes/architect.md` | Focus architecture | Conception, patterns |
| Speed | `modes/speed.md` | Vitesse maximale | Prototypes, urgences |
| Quality | `modes/quality.md` | Qualité maximale | Production, APIs publiques |
| Mentor | `modes/mentor.md` | Explications détaillées | Apprentissage, formation |
| Autonomous | `modes/autonomous.md` | Exécution sans interruption | Tâches définies |

### Activation des Modes
```
"Mode speed" → Vitesse maximale
"Mode quality" → Qualité exhaustive
"Mode mentor" → Explications pédagogiques
"Mode brainstorm" → Exploration options
"Mode architect" → Diagrammes et patterns
"Mode autonomous" → Exécution complète
```

---

## COMMANDES SLASH (18)

### Création & Génération
| Commande | Fichier | Description |
|----------|---------|-------------|
| `/create` | `commands/create.md` | Créer un projet |
| `/scaffold` | `commands/scaffold.md` | Structure projet complète |
| `/generate` | `commands/generate.md` | Génération full-stack |

### Qualité & Review
| Commande | Fichier | Description |
|----------|---------|-------------|
| `/test` | `commands/test.md` | Lancer les tests |
| `/review` | `commands/review.md` | Code review complet |
| `/analyze` | `commands/analyze.md` | Analyse (sécurité, perf) |

### DevOps
| Commande | Fichier | Description |
|----------|---------|-------------|
| `/deploy` | `commands/deploy.md` | Déployer |

### Amélioration
| Commande | Fichier | Description |
|----------|---------|-------------|
| `/refactor` | `commands/refactor.md` | Refactoring automatique |
| `/migrate` | `commands/migrate.md` | Migration de projet |
| `/debug` | `commands/debug.md` | Diagnostic d'erreurs |

### Documentation & Recherche
| Commande | Fichier | Description |
|----------|---------|-------------|
| `/docs` | `commands/docs.md` | Génération documentation |
| `/research` | `commands/research.md` | Recherche multi-sources |
| `/plan` | `commands/plan.md` | Mode planification |

### Spécialisées MQL5
| Commande | Fichier | Description |
|----------|---------|-------------|
| `/mql5` | `commands/mql5.md` | Robots/indicateurs MT5 |

### Spécialisées Odoo
| Commande | Fichier | Description |
|----------|---------|-------------|
| `/odoo` | `commands/odoo.md` | Création modules Odoo |
| `/odoo-module` | `commands/odoo-module.md` | Génération module |
| `/odoo-audit` | `commands/odoo-audit.md` | Audit module Odoo |
| `/odoo-migrate` | `commands/odoo-migrate.md` | Migration Odoo |

---

## SCRIPTS POWERSHELL (7)

| Script | Description |
|--------|-------------|
| `ULTRA-CREATE.ps1` | Création de projet |
| `ULTRA-DEPLOY.ps1` | Déploiement multi-plateforme |
| `ULTRA-TEST.ps1` | Tests automatisés |
| `ULTRA-QUALITY.ps1` | Audit qualité |
| `ULTRA-VALIDATE.ps1` | Validation complète |
| `ULTRA-ODOO.ps1` | Création modules Odoo |
| `odoo-validator.ps1` | Validation modules Odoo |

---

## HOOKS SYSTÈME (6)

| Hook | Trigger | Action |
|------|---------|--------|
| PreToolUse | Avant Edit/Write | Validation du changement |
| PreToolUse | Avant Bash | Log de la commande |
| PostToolUse | Après Edit/Write | Type checking automatique |
| PreCommit | Avant git commit | Lint validation |
| PostCommit | Après git commit | Update learnings |
| OnError | Sur erreur | Auto-diagnostic |

---

## KNOWLEDGE BASE

### Core Knowledge (8 fichiers)
| Fichier | Description |
|---------|-------------|
| `patterns.md` | Patterns d'architecture |
| `stack-2025.md` | Stack recommandée |
| `ui-components.md` | Composants UI |
| `production-checklist.md` | Checklist prod |
| `code-snippets.md` | Snippets réutilisables |
| `mcp-servers-recommended.md` | MCP servers |
| `learnings/system.md` | Système de mémoire |
| `limitations-and-solutions.md` | Contournements |

### Templates Complets (5 fichiers)
| Template | Fichier |
|----------|---------|
| Auth System | `complete-templates/auth-system.md` |
| Dashboard Layout | `complete-templates/dashboard-layout.md` |
| Landing Page | `complete-templates/landing-page.md` |
| E-commerce Cart | `complete-templates/ecommerce-cart.md` |
| Form Builder | `complete-templates/form-builder.md` |

### Knowledge MQL5 (4 fichiers)
| Fichier | Description |
|---------|-------------|
| `mql5/mql5-complete-guide.md` | Guide complet MQL5 |
| `mql5/trading-strategies.md` | Stratégies de trading |
| `mql5/templates/ea-scalper-template.mq5` | Template EA Scalper |
| `mql5/templates/indicator-template.mq5` | Template Indicateur |

### Knowledge Odoo (12+ fichiers)
| Fichier | Description |
|---------|-------------|
| `odoo/odoo-v19-complete-guide.md` | Guide Odoo v19 |
| `odoo/odoo-api-integration.md` | Intégration API |
| `odoo/odoo-testing-guide.md` | Tests Odoo |
| `odoo/odoo-performance-guide.md` | Performance |
| `odoo/odoo-security-guide.md` | Sécurité |
| `odoo/odoo-multi-company-guide.md` | Multi-société |
| `odoo/odoo-migration-guide.md` | Migration |
| `odoo/odoo-deployment-guide.md` | Déploiement |
| `odoo/odoo-oca-standards-guide.md` | Standards OCA |
| `odoo/odoo-owl-frontend-guide.md` | Frontend OWL |
| `odoo/mcp-odoo-integration.md` | MCP Odoo |
| `odoo/templates/` | Templates modules |

---

## STACK TECHNIQUE 2025

```yaml
Frontend:
  - Next.js 15 (App Router)
  - React 19
  - TypeScript 5.x
  - TailwindCSS 4
  - shadcn/ui

Backend:
  - Supabase (Auth + DB + Storage)
  - Prisma ORM
  - Server Actions
  - Hono (alternative Express)

Mobile:
  - Expo SDK 52+
  - React Native
  - Expo Router

Desktop:
  - Tauri 2.0
  - Rust backend
  - Web frontend

DevOps:
  - Vercel (web)
  - GitHub Actions (CI/CD)
  - Docker (containers)

AI/ML:
  - LangChain / LlamaIndex
  - OpenAI / Anthropic APIs
  - Hugging Face

ERP:
  - Odoo v19
  - Python 3.10+
  - PostgreSQL
```

---

## CAPACITÉS PRINCIPALES v11.0

1. **Swarm Intelligence** - Orchestration multi-agents parallèle (Queen + 54 workers)
2. **Deep Research** - Recherche multi-hop multi-sources (5 itérations)
3. **54 Agents** - Couverture complète de tous les domaines
4. **7 Modes** - Adaptation comportementale au contexte
5. **18 Commandes** - Actions rapides et structurées
6. **Hooks Avancés** - Automatisation pre/post opérations
7. **Multi-Plateforme** - Web, Mobile, Desktop
8. **Full-Stack** - Frontend + Backend + DB
9. **Trading MQL5** - Expert Advisors, Indicateurs MT5
10. **Odoo v19** - Modules complets, 12 experts domaine

---

## GUIDE D'UTILISATION RAPIDE

### Créer un Projet Web
```
"Crée-moi un SaaS de gestion de tâches"
→ Agents: queen → full-stack-generator → frontend + backend + database-architect
→ Mode: autonomous pour exécution complète
```

### Créer un Module Odoo
```
"Crée un module de gestion hôtelière pour Odoo"
→ Agents: odoo-expert → odoo-hospitality-expert → odoo-orm-expert
→ Commande: /odoo-module hospitality_management
```

### Recherche Technique
```
"Recherche les best practices d'authentification 2025"
→ Agents: deep-researcher + tech-scout
→ Commande: /research
```

### Code Review
```
"Review ce code pour sécurité et performance"
→ Agents: code-reviewer + security-auditor + performance-optimizer
→ Commande: /review + /analyze security + /analyze performance
```

### Mode Apprentissage
```
"Explique-moi comment fonctionne le RSC de Next.js"
→ Mode: mentor
→ Explications détaillées avec exemples
```

---

## MCP SERVERS CONNECTÉS

| Server | Status | Usage |
|--------|--------|-------|
| memory | ✅ OK | Mémoire persistante |
| git | ✅ OK | Operations Git |
| github | ✅ OK | API GitHub |
| fetch | ✅ OK | Web fetching |
| sequential-thinking | ✅ OK | Raisonnement |
| vscode | ⚠️ Extension | Intégration VS Code |
| e2b | ⚠️ API Key | Code sandbox |
| notion | ✅ OK | Gestion projets |

---

## RAPPELS IMPORTANTS

1. **Toujours consulter** `USER-PROFILE.md` pour les préférences utilisateur
2. **Sauvegarder les learnings** après chaque projet significatif
3. **Utiliser les templates** existants plutôt que recréer
4. **Valider avec** `ULTRA-VALIDATE.ps1` avant de livrer
5. **Documenter** les décisions architecturales importantes
6. **Utiliser le Swarm** pour les projets complexes (3+ agents)
7. **Adapter le mode** au contexte (speed pour urgence, quality pour prod)

---

**Version:** 11.0
**Dernière mise à jour:** 2025-12-06
**Agents:** 54 | **Modes:** 7 | **Commandes:** 18
