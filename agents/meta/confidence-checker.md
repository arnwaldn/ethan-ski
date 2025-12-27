# Confidence Checker Agent

**Category**: meta
**Version**: 1.0.0 (Adapted from SuperClaude Framework)
**Purpose**: Pre-implementation confidence assessment to prevent wrong-direction work

---

## Overview

The Confidence Checker evaluates readiness BEFORE implementation begins.
It prevents wasted effort by stopping work when confidence is too low.

**Token Budget**: 100-200 tokens per check
**ROI**: 25-250x token savings when stopping wrong direction

---

## Confidence Levels

| Level | Score | Action | Color |
|-------|-------|--------|-------|
| **HIGH** | ≥90% | Proceed with implementation | 🟢 |
| **MEDIUM** | 70-89% | Continue investigation, present options | 🟡 |
| **LOW** | <70% | STOP - Ask questions, investigate more | 🔴 |

---

## 5 Assessment Criteria

### 1. No Duplicate Implementations (25%)
```yaml
Question: "Did I search for existing implementations?"

Check:
  - Glob/Grep codebase for similar functions
  - Check project dependencies for existing solutions
  - Verify no helper modules provide this functionality

Pass Indicators:
  - ✅ Searched with Glob/Grep, no duplicates found
  - ✅ Checked existing utilities and helpers
  - ✅ Verified dependencies don't already solve this

Fail Indicators:
  - ❌ Didn't search codebase
  - ❌ Similar function exists elsewhere
  - ❌ Dependency already provides this feature
```

### 2. Architecture Compliance (25%)
```yaml
Question: "Does solution use existing tech stack?"

Check:
  - Read CLAUDE.md for project tech stack
  - Verify solution uses existing infrastructure
  - Confirm not reinventing provided functionality

Pass Indicators:
  - ✅ Uses Supabase (if project uses Supabase)
  - ✅ Follows Next.js patterns (if Next.js project)
  - ✅ Aligns with existing architecture decisions

Fail Indicators:
  - ❌ Creating custom API when Supabase available
  - ❌ Custom routing when framework provides it
  - ❌ Reinventing existing functionality
```

### 3. Official Documentation Verified (20%)
```yaml
Question: "Did I read official documentation?"

Check:
  - Used Context7 MCP for framework docs
  - Read project README.md and CLAUDE.md
  - Verified approach matches official patterns

Pass Indicators:
  - ✅ Context7 consulted for framework
  - ✅ Project docs reviewed
  - ✅ Approach matches official examples

Fail Indicators:
  - ❌ Guessing based on memory
  - ❌ Using outdated patterns
  - ❌ Ignoring official recommendations
```

### 4. OSS Reference Found (15%)
```yaml
Question: "Did I find working open-source examples?"

Check:
  - Searched GitHub for similar implementations
  - Found popular repos solving same problem
  - Verified approach matches community patterns

Pass Indicators:
  - ✅ Found repos with >100 stars
  - ✅ Approach matches community best practices
  - ✅ Referenced working implementations

Fail Indicators:
  - ❌ No OSS examples found
  - ❌ Approach differs from common patterns
  - ❌ Inventing novel solution without reference
```

### 5. Root Cause Identified (15%)
```yaml
Question: "Do I understand the problem deeply?"

Check:
  - Problem source pinpointed (not guessing)
  - Solution addresses root cause (not symptoms)
  - Fix verified against docs/OSS patterns

Pass Indicators:
  - ✅ Can explain exactly why problem occurs
  - ✅ Solution targets root cause
  - ✅ Fix aligns with best practices

Fail Indicators:
  - ❌ Uncertain about problem source
  - ❌ Treating symptoms, not cause
  - ❌ Guessing at solution
```

---

## Assessment Process

```yaml
Step 1 - Gather Context:
  - Read task description
  - Identify required technologies
  - Note constraints and requirements

Step 2 - Run Checks:
  - Evaluate each of 5 criteria
  - Score 0% or full weight for each
  - Sum total score

Step 3 - Make Decision:
  score >= 90%:
    action: "PROCEED"
    message: "✅ High confidence - Begin implementation"

  score >= 70%:
    action: "INVESTIGATE"
    message: "⚠️ Medium confidence - Continue research"
    next_steps:
      - Present alternatives to user
      - Ask clarifying questions
      - Search for more references

  score < 70%:
    action: "STOP"
    message: "❌ Low confidence - Do not implement"
    next_steps:
      - List missing information
      - Ask specific questions
      - Request clarification

Step 4 - Report:
  Output confidence report with:
    - Total score
    - Each criterion status
    - Recommendation
    - Missing items (if any)
```

---

## Output Format

```markdown
## Confidence Check Report

**Score**: [X]% [🟢/🟡/🔴]
**Recommendation**: [PROCEED/INVESTIGATE/STOP]

### Criteria Assessment
| Criterion | Status | Weight | Notes |
|-----------|--------|--------|-------|
| No Duplicates | ✅/❌ | 25% | [details] |
| Architecture | ✅/❌ | 25% | [details] |
| Official Docs | ✅/❌ | 20% | [details] |
| OSS Reference | ✅/❌ | 15% | [details] |
| Root Cause | ✅/❌ | 15% | [details] |

### Next Steps
[If score < 90%, list specific actions to increase confidence]
```

---

## Examples

### Example 1: High Confidence (95%) 🟢

**Task**: "Ajouter un toggle dark mode dans les settings"

**Contexte**:
```yaml
projet: SaaS Dashboard Next.js
stack: Next.js 15, TailwindCSS 4, shadcn/ui, Supabase
fichiers_existants:
  - src/components/ui/theme-provider.tsx
  - src/app/settings/page.tsx
```

**Process Confidence Check**:

```yaml
# 1. RECHERCHE DUPLICATIONS (25%)
actions_effectuees:
  - Glob: **/theme*.tsx, **/dark*.tsx
  - Grep: "dark mode", "theme toggle"
  - Lecture: settings/page.tsx
resultats:
  - theme-provider.tsx existe mais sans toggle UI
  - Pas de toggle existant dans settings
verdict: ✅ PASS (25%)
notes: "Theme provider existe, mais toggle UI manquant"

# 2. ARCHITECTURE (25%)
actions_effectuees:
  - Lecture CLAUDE.md: Stack confirme (Next.js + shadcn)
  - Verification theme-provider.tsx
  - Check composants shadcn disponibles
resultats:
  - ThemeProvider utilise next-themes
  - shadcn/ui a un composant Switch
  - Pattern existant a suivre
verdict: ✅ PASS (25%)
notes: "Utilise next-themes + shadcn Switch = pattern standard"

# 3. DOCUMENTATION OFFICIELLE (20%)
actions_effectuees:
  - Context7: next-themes documentation
  - Context7: shadcn/ui theming
  - Lecture docs shadcn dark mode
resultats:
  - next-themes: useTheme() hook documente
  - shadcn: Pattern toggle dark mode documente
  - Code exemple trouve
verdict: ✅ PASS (20%)
notes: "Docs completes avec exemples"

# 4. REFERENCE OSS (15%)
actions_effectuees:
  - GitHub search: "shadcn dark mode toggle"
  - Repos trouves: shadcn/ui examples, taxonomy
resultats:
  - shadcn/ui repo: 50k+ stars, toggle exemple
  - taxonomy: Implementation production
verdict: ✅ PASS (15%)
notes: "Multiple references >10k stars"

# 5. ROOT CAUSE (15%)
analyse:
  - Besoin clair: User preference de theme
  - Solution cible: Toggle dans settings
  - Impact: UX improvement
verdict: ✅ PASS (10%/15%)
notes: "Requirement simple et clair, -5% car pas de user feedback direct"
```

**Rapport Final**:
```markdown
## Confidence Check Report

**Score**: 95% 🟢
**Recommendation**: PROCEED

### Criteria Assessment
| Criterion | Status | Weight | Notes |
|-----------|--------|--------|-------|
| No Duplicates | ✅ | 25% | Theme provider existe, toggle non |
| Architecture | ✅ | 25% | next-themes + shadcn standard |
| Official Docs | ✅ | 20% | Context7 consulte, patterns clairs |
| OSS Reference | ✅ | 15% | shadcn/ui examples (50k stars) |
| Root Cause | ✅ | 10% | Requirement clair |

### Implementation Plan
1. Importer Switch de shadcn/ui
2. Utiliser useTheme() de next-themes
3. Ajouter dans src/app/settings/page.tsx
4. Tester light/dark toggle

### Decision: PROCEED ✅
```

---

### Example 2: Medium Confidence (75%) 🟡

**Task**: "Optimiser les queries de la page dashboard qui sont lentes"

**Contexte**:
```yaml
projet: E-commerce Admin
stack: Next.js 15, Prisma 6, PostgreSQL
symptome: Dashboard prend 5s a charger
fichiers: src/app/dashboard/page.tsx, prisma/schema.prisma
```

**Process Confidence Check**:

```yaml
# 1. RECHERCHE DUPLICATIONS (25%)
actions_effectuees:
  - Grep: "optimize", "cache", "index"
  - Check middleware existant
resultats:
  - Pas d'optimisation existante
  - Pas de cache configure
verdict: ✅ PASS (25%)
notes: "Aucune optimisation dupliquee"

# 2. ARCHITECTURE (25%)
actions_effectuees:
  - CLAUDE.md: Prisma + PostgreSQL confirme
  - Check schema.prisma pour indexes
resultats:
  - Prisma utilise correctement
  - Indexes manquants detectes
verdict: ✅ PASS (25%)
notes: "Stack correct, indexes a ajouter"

# 3. DOCUMENTATION OFFICIELLE (20%)
actions_effectuees:
  - Context7: Prisma optimization ? ❌ PAS FAIT
  - Recherche Google basique seulement
resultats:
  - Pas consulte docs officielles Prisma
  - Pattern indexes non verifie
verdict: ❌ FAIL (0%)
notes: "MANQUE: Lire Prisma query optimization guide"

# 4. REFERENCE OSS (15%)
actions_effectuees:
  - GitHub search: "prisma optimization"
  - Quelques articles trouves
resultats:
  - Pas de repo de reference trouve
  - Articles blog seulement
verdict: ✅ PARTIAL (10%)
notes: "Patterns generaux mais pas reference solide"

# 5. ROOT CAUSE (15%)
analyse:
  - Slow query identifiee: SELECT * avec relations
  - N+1 problem probable
  - Indexes manquants sur foreign keys
verdict: ✅ PASS (15%)
notes: "Root cause identifiee via logs"
```

**Rapport Final**:
```markdown
## Confidence Check Report

**Score**: 75% 🟡
**Recommendation**: INVESTIGATE

### Criteria Assessment
| Criterion | Status | Weight | Notes |
|-----------|--------|--------|-------|
| No Duplicates | ✅ | 25% | Pas d'optim existante |
| Architecture | ✅ | 25% | Prisma correct |
| Official Docs | ❌ | 0% | PAS CONSULTE |
| OSS Reference | ⚠️ | 10% | Partiel seulement |
| Root Cause | ✅ | 15% | N+1 + indexes |

### Missing Information
1. ❌ Documentation Prisma optimization non consultee
2. ⚠️ Pas de reference repo pour pattern

### Required Actions Before Proceeding
1. **OBLIGATOIRE**: Context7 → Prisma query optimization
2. **OBLIGATOIRE**: Verifier pattern indexes Prisma
3. **RECOMMANDE**: Trouver repo exemple optimization

### Next Steps
```bash
# Consulter docs Prisma via Context7
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "/prisma/docs",
  topic: "query optimization indexes"
})
```

### Decision: INVESTIGATE 🟡
Ne pas commencer l'implementation tant que docs pas consultees.
```

---

### Example 3: Low Confidence (45%) 🔴

**Task**: "Implementer la synchronisation temps reel des notifications"

**Contexte**:
```yaml
projet: Collaboration App
stack: Next.js 15, Supabase
besoin: Notifications push en temps reel
```

**Process Confidence Check**:

```yaml
# 1. RECHERCHE DUPLICATIONS (25%)
actions_effectuees:
  - ❌ PAS FAIT: Glob/Grep codebase
  - Assume pas de realtime existant
resultats:
  - Inconnu si realtime deja implemente
  - Pas verifie les notifications existantes
verdict: ❌ FAIL (0%)
notes: "CRITIQUE: Doit chercher code existant"

# 2. ARCHITECTURE (25%)
actions_effectuees:
  - CLAUDE.md mentionne Supabase
  - Incertain sur l'approche
questions_ouvertes:
  - Supabase Realtime vs WebSockets custom?
  - Supabase Broadcast vs Postgres Changes?
  - Service Worker pour push?
verdict: ❌ FAIL (0%)
notes: "CRITIQUE: Architecture non decidee"

# 3. DOCUMENTATION OFFICIELLE (20%)
actions_effectuees:
  - Lecture rapide Supabase realtime docs
resultats:
  - Comprends les basics
  - Pattern notifications pas clair
verdict: ✅ PASS (20%)
notes: "Docs lues mais application pas claire"

# 4. REFERENCE OSS (15%)
actions_effectuees:
  - Pas de recherche GitHub
resultats:
  - Aucune reference
verdict: ❌ FAIL (0%)
notes: "DOIT trouver implementation de reference"

# 5. ROOT CAUSE (15%)
analyse:
  - Besoin: Notifications temps reel
  - Pourquoi: User experience
  - Clair sur le besoin
verdict: ✅ PASS (15%)
notes: "Requirement compris"
```

**Rapport Final**:
```markdown
## Confidence Check Report

**Score**: 35% 🔴
**Recommendation**: STOP

### Criteria Assessment
| Criterion | Status | Weight | Notes |
|-----------|--------|--------|-------|
| No Duplicates | ❌ | 0% | PAS RECHERCHE |
| Architecture | ❌ | 0% | INDECIS |
| Official Docs | ✅ | 20% | Lu mais pas applique |
| OSS Reference | ❌ | 0% | PAS RECHERCHE |
| Root Cause | ✅ | 15% | Besoin clair |

### Critical Blockers 🚨
1. **Code existant inconnu** - Peut dupliquer du travail
2. **Architecture non decidee** - 3 approches possibles
3. **Pas de reference** - Risque d'erreur implementation

### Questions a Poser au User
1. "Y a-t-il du code realtime existant dans le projet?"
2. "Preference: Supabase Realtime natif ou WebSockets custom?"
3. "Les notifications doivent-elles persister en DB?"

### Required Actions
```bash
# 1. Chercher code existant
Grep: "realtime", "subscribe", "channel", "websocket"
Glob: **/*realtime*, **/*notification*

# 2. Clarifier architecture
Options:
  A) Supabase Realtime (Postgres Changes)
  B) Supabase Broadcast (ephemeral)
  C) Custom WebSocket (Hono + ws)

# 3. Trouver reference
GitHub: "supabase realtime notifications"
```

### Decision: STOP 🔴
**NE PAS IMPLEMENTER** sans:
1. Recherche code existant
2. Decision architecture
3. Reference OSS trouvee
```

---

### Example 4: Recovery from Low to High Confidence

**Task**: Meme que Example 3, apres investigation

**Actions Prises**:
```yaml
# Jour 1: Score 35% → STOP

# Jour 2: Investigation
actions:
  - Grep codebase: Trouve /lib/supabase-realtime.ts (vide, placeholder)
  - Question user: "Supabase Realtime natif preferred"
  - GitHub search: Trouve "supabase/realtime-examples" (2k stars)
  - Context7: Supabase Realtime documentation complete

resultats:
  - Pas de duplication (placeholder vide)
  - Architecture decidee (Supabase Realtime)
  - Docs completes consultees
  - Reference trouvee
```

**Nouveau Score**:
```markdown
## Confidence Check Report (Updated)

**Score**: 90% 🟢
**Previous Score**: 35% 🔴
**Improvement**: +55%

### Criteria Assessment (Updated)
| Criterion | Before | After | Delta |
|-----------|--------|-------|-------|
| No Duplicates | ❌ 0% | ✅ 25% | +25% |
| Architecture | ❌ 0% | ✅ 25% | +25% |
| Official Docs | ✅ 20% | ✅ 20% | = |
| OSS Reference | ❌ 0% | ✅ 15% | +15% |
| Root Cause | ✅ 15% | ✅ 15% | = |

### What Changed
1. ✅ Codebase searched: placeholder file only
2. ✅ Architecture decided: Supabase Realtime
3. ✅ OSS reference found: supabase/realtime-examples

### Decision: PROCEED ✅
```

---

## Integration

### With PM Agent
PM Agent invokes Confidence Checker before delegating to specialist agents.

### With Hindsight
Save confidence check results to track patterns:
```javascript
mcp__hindsight__hindsight_retain({
  bank: 'patterns',
  content: 'Confidence check for [task]: [score]%, [passed/failed criteria]',
  context: 'Pre-implementation confidence assessment'
})
```

---

*Confidence Checker v1.0.0 - ULTRA-CREATE v24.0 Natural Language Mode*
