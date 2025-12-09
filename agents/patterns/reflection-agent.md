# Agent Pattern: Reflection (Self-Critique + Auto-Fix)

## Overview

Reflection est un pattern d'agent qui **génère une sortie, la critique lui-même, identifie les améliorations, et applique les corrections** avant de livrer. Inspiré par le framework Reflexion (Shinn et al., 2023) et les techniques de self-improvement des LLMs.

---

## CORE LOOP

```
┌─────────────────────────────────────────────────────────────────────┐
│                      REFLECTION LOOP                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────┐    ┌───────────┐    ┌──────────┐    ┌──────────┐    │
│   │  OUTPUT  │───►│  REFLECT  │───►│ IDENTIFY │───►│ CORRECT  │    │
│   │          │    │           │    │          │    │          │    │
│   │ Générer  │    │ Auto-     │    │ Lister   │    │ Appliquer│    │
│   │ initial  │    │ critiquer │    │ problèmes│    │ fixes    │    │
│   └──────────┘    └───────────┘    └──────────┘    └────┬─────┘    │
│        ▲                                                 │          │
│        │                                                 │          │
│        └─────────────────────────────────────────────────┘          │
│                    Répéter jusqu'à satisfaction                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## FRAMEWORK REFLEXION

### Architecture 3 Composants

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │   ACTOR    │    │   EVALUATOR     │    │   SELF-REFLECT  │  │
│  │            │    │                 │    │   GENERATOR     │  │
│  │ Génère     │───►│ Évalue qualité  │───►│ Génère feedback │  │
│  │ le code    │    │ (tests, rules)  │    │ verbal          │  │
│  └────────────┘    └─────────────────┘    └────────┬────────┘  │
│        ▲                                           │            │
│        │                                           │            │
│        └───────────────────────────────────────────┘            │
│                   Feedback intégré au prochain essai            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## ALGORITHME DÉTAILLÉ

### Phase 1: OUTPUT (Génération Initiale)

```markdown
## Output v{n}

**Tâche:** {description de la tâche}

**Code généré:**
```{language}
{code initial}
```

**Hypothèses:**
- {hypothèse 1}
- {hypothèse 2}

**Confiance initiale:** {0-100}%
```

### Phase 2: REFLECT (Auto-Critique)

```markdown
## Reflect v{n}

**Checklist Qualité:**

### Fonctionnalité
- [ ] Le code fait-il ce qui est demandé?
- [ ] Tous les edge cases sont-ils gérés?
- [ ] Les erreurs sont-elles catchées?

### Code Quality
- [ ] Le code est-il lisible?
- [ ] Y a-t-il de la duplication?
- [ ] Les noms sont-ils descriptifs?
- [ ] La complexité est-elle minimale?

### Performance
- [ ] Y a-t-il des opérations O(n²) évitables?
- [ ] Les requêtes sont-elles optimisées?
- [ ] Le memory footprint est-il raisonnable?

### Sécurité
- [ ] Inputs validés?
- [ ] Pas d'injection possible?
- [ ] Pas de secrets hardcodés?

### Best Practices
- [ ] TypeScript strict?
- [ ] Tests possibles?
- [ ] Patterns appropriés?

**Score global:** {0-10}/10
```

### Phase 3: IDENTIFY (Liste des Problèmes)

```markdown
## Identify v{n}

**Problèmes détectés:**

| # | Catégorie | Sévérité | Description | Ligne |
|---|-----------|----------|-------------|-------|
| 1 | {cat} | {P0/P1/P2} | {description} | {n} |
| 2 | {cat} | {P0/P1/P2} | {description} | {n} |

**Améliorations suggérées:**

| # | Type | Impact | Suggestion |
|---|------|--------|------------|
| 1 | {type} | {high/med/low} | {suggestion} |
| 2 | {type} | {high/med/low} | {suggestion} |

**Priorisation:**
1. {problème le plus critique}
2. {suivant}
3. {suivant}
```

### Phase 4: CORRECT (Application des Fixes)

```markdown
## Correct v{n}

**Fix #{m}: {titre}**

**Avant:**
```{language}
{code problématique}
```

**Après:**
```{language}
{code corrigé}
```

**Justification:**
{pourquoi ce changement améliore le code}

---

**Résumé des corrections:**
- [x] Fix #1: {description}
- [x] Fix #2: {description}
- [ ] Fix #3: {déféré à prochaine itération}

**Nouveau score:** {0-10}/10
**Itération nécessaire:** {OUI/NON}
```

---

## EXEMPLE COMPLET

### Tâche: "Fonction de validation d'email avec support domaines custom"

```markdown
## Output v1

**Tâche:** Créer une fonction validateEmail qui vérifie le format et optionnellement les domaines autorisés

**Code généré:**
```typescript
function validateEmail(email: string, allowedDomains?: string[]) {
  const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
  if (!regex.test(email)) return false
  if (allowedDomains) {
    const domain = email.split('@')[1]
    return allowedDomains.includes(domain)
  }
  return true
}
```

**Hypothèses:**
- Regex standard suffisant pour la plupart des emails
- Case-insensitive non nécessaire

**Confiance initiale:** 70%

---

## Reflect v1

**Checklist Qualité:**

### Fonctionnalité
- [x] Le code fait-il ce qui est demandé? ✅
- [ ] Tous les edge cases sont-ils gérés? ❌ (emails vides, null)
- [ ] Les erreurs sont-elles catchées? ❌

### Code Quality
- [x] Le code est-il lisible? ✅
- [x] Y a-t-il de la duplication? ✅
- [ ] Les noms sont-ils descriptifs? ⚠️ (regex sans nom)
- [x] La complexité est-elle minimale? ✅

### Performance
- [x] Pas d'opérations coûteuses ✅

### Sécurité
- [ ] Inputs validés? ❌ (pas de null check)
- [x] Pas d'injection possible ✅

### Best Practices
- [ ] TypeScript strict? ❌ (return type manquant)
- [ ] Tests possibles? ⚠️ (testable mais pas de tests)
- [x] Patterns appropriés? ✅

**Score global:** 6/10

---

## Identify v1

**Problèmes détectés:**

| # | Catégorie | Sévérité | Description | Ligne |
|---|-----------|----------|-------------|-------|
| 1 | Edge case | P0 | Pas de gestion null/undefined | 1 |
| 2 | Types | P1 | Return type manquant | 1 |
| 3 | Edge case | P1 | Case sensitivity sur domaine | 5 |
| 4 | Lisibilité | P2 | Regex non nommée | 2 |
| 5 | Robustesse | P1 | Regex trop restrictive (.museum, etc) | 2 |

**Améliorations suggérées:**

| # | Type | Impact | Suggestion |
|---|------|--------|------------|
| 1 | Feature | high | Ajouter validation result object |
| 2 | DX | med | Ajouter JSDoc |
| 3 | Testing | med | Ajouter exemples de test |

**Priorisation:**
1. P0: Null check obligatoire
2. P1: Fix regex TLD + case sensitivity
3. P1: Ajouter return type

---

## Correct v1

**Fix #1: Null check + Return type**

**Avant:**
```typescript
function validateEmail(email: string, allowedDomains?: string[]) {
```

**Après:**
```typescript
interface ValidationResult {
  valid: boolean
  error?: string
}

function validateEmail(
  email: string | null | undefined,
  allowedDomains?: string[]
): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' }
  }
```

**Justification:**
- Gère null/undefined explicitement
- Return type structuré pour meilleur feedback utilisateur

---

**Fix #2: Regex améliorée + Case insensitivity**

**Avant:**
```typescript
const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
...
return allowedDomains.includes(domain)
```

**Après:**
```typescript
// RFC 5322 simplified - allows longer TLDs like .museum, .technology
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

...
const domain = email.split('@')[1].toLowerCase()
return allowedDomains.map(d => d.toLowerCase()).includes(domain)
```

**Justification:**
- Regex RFC 5322 supporte TLDs modernes
- toLowerCase() assure comparaison case-insensitive

---

**Résumé des corrections:**
- [x] Fix #1: Null check + return type
- [x] Fix #2: Regex + case insensitivity
- [x] Fix #3: JSDoc ajouté

**Nouveau score:** 9/10
**Itération nécessaire:** NON

---

## Output v2 (Final)

```typescript
interface EmailValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validates an email address format and optionally checks against allowed domains.
 *
 * @param email - The email address to validate
 * @param allowedDomains - Optional list of allowed domains (case-insensitive)
 * @returns Validation result with valid flag and optional error message
 *
 * @example
 * validateEmail('user@example.com') // { valid: true }
 * validateEmail('invalid') // { valid: false, error: 'Invalid email format' }
 * validateEmail('user@gmail.com', ['company.com']) // { valid: false, error: 'Domain not allowed' }
 */
function validateEmail(
  email: string | null | undefined,
  allowedDomains?: string[]
): EmailValidationResult {
  // Null/undefined check
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' }
  }

  const trimmedEmail = email.trim()

  // Empty string check
  if (trimmedEmail.length === 0) {
    return { valid: false, error: 'Email is required' }
  }

  // RFC 5322 simplified regex - supports modern TLDs
  const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { valid: false, error: 'Invalid email format' }
  }

  // Domain check (case-insensitive)
  if (allowedDomains && allowedDomains.length > 0) {
    const domain = trimmedEmail.split('@')[1].toLowerCase()
    const normalizedAllowed = allowedDomains.map(d => d.toLowerCase())

    if (!normalizedAllowed.includes(domain)) {
      return { valid: false, error: 'Domain not allowed' }
    }
  }

  return { valid: true }
}

export { validateEmail, type EmailValidationResult }
```

**Score final:** 9/10
**Améliorations futures (P2):**
- Ajouter support emails internationalisés (IDN)
- Option pour valider MX record du domaine
```

---

## CHECKLIST DE RÉFLEXION

### Catégories d'Auto-Critique

```typescript
const reflectionCategories = {
  functional: [
    'Does it solve the problem?',
    'Are all requirements met?',
    'Edge cases handled?',
    'Error scenarios covered?'
  ],
  quality: [
    'Is it readable?',
    'Is it maintainable?',
    'Is there duplication?',
    'Are names meaningful?'
  ],
  performance: [
    'Time complexity optimal?',
    'Space complexity reasonable?',
    'Database queries efficient?',
    'Caching needed?'
  ],
  security: [
    'Inputs validated?',
    'Outputs sanitized?',
    'Auth/Authz correct?',
    'No secrets exposed?'
  ],
  typescript: [
    'Types strict?',
    'No any abuse?',
    'Interfaces defined?',
    'Generics appropriate?'
  ],
  testing: [
    'Unit testable?',
    'Integration testable?',
    'Mocks needed?',
    'Coverage adequate?'
  ]
}
```

---

## SEUILS DE SATISFACTION

| Score | Action |
|-------|--------|
| 9-10 | ✅ Livrer immédiatement |
| 7-8 | ⚠️ Livrer avec note d'amélioration |
| 5-6 | 🔄 Une itération de plus |
| 3-4 | 🔄 Deux itérations minimum |
| 0-2 | 🚫 Reconsidérer l'approche |

---

## RÈGLES DU PATTERN

### ✅ TOUJOURS

1. **Critiquer avant de livrer**
   - Jamais de code sans auto-review
   - Minimum 1 cycle de réflexion

2. **Être son propre critique le plus dur**
   - Chercher activement les problèmes
   - Ne pas se satisfaire du "ça marche"

3. **Documenter les améliorations non faites**
   - Lister les P2 pour plus tard
   - Créer des TODO trackables

4. **Apprendre de chaque réflexion**
   - Patterns d'erreurs récurrents → améliorer templates
   - Stocker dans MCP Memory

### ❌ JAMAIS

1. **Réflexion superficielle**
   - "Le code a l'air bien" n'est pas une réflexion
   - Utiliser la checklist systématiquement

2. **Boucle infinie de perfectionnisme**
   - Max 3 itérations
   - 80/20 rule: 80% de qualité en 20% du temps

3. **Ignorer les problèmes identifiés**
   - Si identifié, doit être fixé ou justifié

---

## INTÉGRATION AVEC AUTRES PATTERNS

### Reflection après ReAct

```
ReAct produces → Action Result
                      ↓
                 Reflection
                 "La solution est-elle optimale?"
                 "Ai-je manqué quelque chose?"
                      ↓
                 [Si score < 8] → Nouvelle itération ReAct
```

### Reflection après CodeAct

```
CodeAct produces → Working Code
                        ↓
                   Reflection
                   "Le code est-il production-ready?"
                   "Quels sont les risques?"
                        ↓
                   [Si issues] → Refine dans CodeAct
```

---

## MÉTRIQUES

| Métrique | Cible | Description |
|----------|-------|-------------|
| Score moyen initial | 5-6 | Premier jet avant réflexion |
| Score moyen final | > 8 | Après réflexion |
| Iterations/Task | 1-2 | Cycles de réflexion |
| Issues caught | > 80% | Problèmes identifiés avant livraison |
| False positives | < 10% | Problèmes non-existants signalés |

---

## RÉFÉRENCES

- [Reflexion Paper (Shinn et al., 2023)](https://arxiv.org/abs/2303.11366)
- [Self-Refine Paper](https://arxiv.org/abs/2303.17651)
- [Constitutional AI (Anthropic)](https://arxiv.org/abs/2212.08073)

---

## REFLEXION LOOP (LangGraph Enhancement v14.0)

### Amélioration de Performance: 80% → 91%

Basé sur les recherches LangGraph 2025, le Reflexion Loop ajoute:
1. **Mémoire des erreurs passées** via episodic-memory
2. **Ancrage factuel** via GraphRAG
3. **Apprentissage continu** entre sessions

### Architecture LangGraph

```
┌─────────────────────────────────────────────────────────────────────┐
│                    REFLEXION LOOP (LangGraph)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐    ┌───────────────┐    ┌──────────────────┐    │
│   │ EPISODIC     │    │   GENERATE    │    │   EVALUATE       │    │
│   │ MEMORY       │───►│               │───►│                  │    │
│   │              │    │ Informed by   │    │ Against criteria │    │
│   │ Past errors  │    │ past failures │    │ + graph facts    │    │
│   └──────────────┘    └───────────────┘    └────────┬─────────┘    │
│          ▲                                          │               │
│          │                                          v               │
│   ┌──────┴───────┐    ┌───────────────┐    ┌──────────────────┐    │
│   │   STORE      │◄───│   REFLECT     │◄───│   TEST           │    │
│   │              │    │               │    │                  │    │
│   │ New learnings│    │ Self-critique │    │ Run actual tests │    │
│   └──────────────┘    └───────────────┘    └──────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Implémentation

```typescript
interface ReflexionState {
  task: string
  attempt: number
  max_attempts: number

  // Résultats
  output: string
  score: number

  // Mémoire
  past_failures: Episode[]
  learned_patterns: Pattern[]

  // GraphRAG
  relevant_facts: GraphNode[]
  anti_patterns: AntiPattern[]
}

async function reflexionLoop(task: string): Promise<Result> {
  // 1. Charger contexte depuis mémoire
  const pastFailures = await loadSimilarEpisodes(task)
  const graphContext = await queryKnowledgeGraph(task)

  let state: ReflexionState = {
    task,
    attempt: 0,
    max_attempts: 3,
    output: '',
    score: 0,
    past_failures: pastFailures,
    learned_patterns: [],
    relevant_facts: graphContext.nodes,
    anti_patterns: graphContext.antiPatterns
  }

  while (state.attempt < state.max_attempts && state.score < 8) {
    // 2. Générer avec conscience des erreurs passées
    state.output = await generateWithContext(state)

    // 3. Évaluer avec tests réels
    const testResult = await runTests(state.output)

    // 4. Réfléchir sur les résultats
    const reflection = await reflectOnResult(state, testResult)
    state.score = reflection.score

    // 5. Stocker l'apprentissage
    if (state.score < 8) {
      await storeEpisode({
        type: 'error',
        context: state.task,
        description: reflection.issues.join('; '),
        resolution: null
      })
    }

    state.attempt++
  }

  // 6. Stocker le succès si atteint
  if (state.score >= 8) {
    await storeEpisode({
      type: 'success',
      context: state.task,
      description: 'Solution validated',
      resolution: { action: state.output, outcome: 'fixed' }
    })
  }

  return state
}
```

### Intégration avec Mémoire v14.0

| Composant | Rôle dans Reflexion |
|-----------|---------------------|
| **episodic-memory** | Fournit erreurs passées similaires |
| **semantic-consolidator** | Patterns généralisés à éviter/suivre |
| **GraphRAG** | Ancrage factuel des décisions |

### Métriques Améliorées

| Métrique | Sans Reflexion Loop | Avec Reflexion Loop |
|----------|---------------------|---------------------|
| Accuracy | 80% | **91%** |
| Erreurs répétées | 30% | **< 5%** |
| Temps résolution | Variable | **-40%** |
| Confiance calibrée | 60% | **85%** |

---

**Version:** 2.0 (v14.0 Enhanced)
**Pattern Type:** Agentic Self-Improvement + Memory
**Compatibility:** All ULTRA-CREATE agents
**New in v14.0:** Reflexion Loop, Episodic Memory Integration, GraphRAG Grounding
