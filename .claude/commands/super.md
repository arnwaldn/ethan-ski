# /super - Super-Agents

Invoque un Super-Agent spécialisé qui combine plusieurs MCPs en synergie.

## Usage

```
/super-[type] "[tâche]"
```

## Super-Agents Disponibles

### /super-fullstack
Combine: **Context7 + Magic-UI + Firecrawl + SonarQube**

```bash
/super-fullstack "Ajoute un système de notifications en temps réel"
/super-fullstack "Crée un module de gestion des utilisateurs"
```

**Capacités:**
- Docs framework actualisées (Context7)
- UI professionnelle (Magic-UI)
- Patterns recherchés (Firecrawl)
- Code sécurisé (SonarQube)

---

### /super-ui
Combine: **Magic-UI + shadcn + Mermaid + Figma**

```bash
/super-ui "Crée un dashboard analytics moderne"
/super-ui "Redesign la page pricing"
```

**Capacités:**
- Composants pro (Magic-UI)
- Base solide (shadcn)
- Diagrammes (Mermaid)
- Design-to-code (Figma)

---

### /super-backend
Combine: **Supabase + Prisma + Neo4j + Stripe**

```bash
/super-backend "Crée un système de subscriptions"
/super-backend "Implémente le panier avec checkout"
```

**Capacités:**
- BaaS complet (Supabase)
- ORM type-safe (Prisma)
- Graph queries (Neo4j)
- Paiements (Stripe)

---

### /super-research
Combine: **Tavily + Exa + Firecrawl + Context7**

```bash
/super-research "Meilleures pratiques React Server Components 2025"
/super-research "Compare Prisma vs Drizzle pour mon use case"
```

**Capacités:**
- Search AI (Tavily)
- Neural search (Exa)
- Web scraping (Firecrawl)
- Docs framework (Context7)

---

### /super-deploy
Combine: **Cloudflare + Browserbase + Sentry + Expo**

```bash
/super-deploy "Déploie en production avec monitoring"
/super-deploy "Setup CI/CD complet"
```

**Capacités:**
- Edge deploy (Cloudflare)
- Tests cloud (Browserbase)
- Monitoring (Sentry)
- Mobile deploy (Expo)

---

### /super-quality
Combine: **SonarQube + Semgrep + Self-Healer + Reflection**

```bash
/super-quality "Audit complet du projet"
/super-quality "Fix tous les problèmes de sécurité"
```

**Capacités:**
- Code quality (SonarQube)
- Security (Semgrep OWASP)
- Auto-fix (Self-Healer)
- Auto-amélioration (Reflection)

---

## Output Exemple

```
/super-fullstack "Ajoute authentification 2FA"

FullStack Super-Agent
├── [Context7] Loading Next.js 15 + Auth docs...
├── [Firecrawl] Researching 2FA patterns...
├── [Magic-UI] Generating UI components...
├── Generating:
│   ├── src/app/settings/security/page.tsx
│   ├── src/components/auth/TwoFactorSetup.tsx
│   ├── src/components/auth/OTPInput.tsx
│   ├── src/lib/2fa.ts
│   ├── src/app/api/auth/2fa/setup/route.ts
│   ├── src/app/api/auth/2fa/verify/route.ts
│   └── prisma/schema.prisma (updated)
├── [SonarQube] Security scan... PASSED
└── COMPLETE: 2FA system ready

Files: 7
Security: A+
Tests: 12 generated
```

## Prompt

Quand l'utilisateur tape `/super-[type] "[tâche]"`:

1. Identifier le Super-Agent demandé
2. Charger la configuration depuis `agents/super-agents/[type]-super.md`
3. Activer les MCPs associés en synergie
4. Exécuter la tâche avec les capacités combinées
5. Valider le résultat avec Quality Super si applicable
6. Reporter les fichiers créés/modifiés

Prioriser la qualité sur la vitesse pour les Super-Agents.
