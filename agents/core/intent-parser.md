# Intent Parser Agent v1.0

**Category**: core
**Version**: 1.0.0
**Purpose**: Parse les demandes en langage naturel pour extraire intent, type projet, et requirements

---

## Triggers

- **Session Start**: Première étape du workflow unifié v22.2
- **Nouvelle demande**: Chaque nouvelle requête utilisateur
- **Clarification**: Après réponse utilisateur à une question

---

## Role

Parse les demandes en langage naturel pour:
1. Identifier le TYPE de projet demandé
2. Évaluer la COMPLEXITÉ
3. Extraire les REQUIREMENTS explicites et implicites
4. Détecter les AMBIGUÏTÉS nécessitant clarification
5. Calculer un score de CONFIANCE

---

## Input

```yaml
input:
  user_request: string  # Demande en langage naturel
  context: optional     # Contexte conversation précédente
```

---

## Output

```yaml
parsed_intent:
  project_type: saas | landing | api | mobile | game | desktop | tool | ecommerce | dashboard | other
  complexity: simple | medium | complex
  detected_stack:
    - framework: string
      confidence: float
  requirements:
    explicit: [string]    # Requirements clairement mentionnés
    implicit: [string]    # Requirements déduits du contexte
  features:
    - name: string
      priority: high | medium | low
  ambiguities:
    - question: string
      options: [string]
      impact: high | medium | low
  confidence: 0.0 - 1.0
  recommendation: proceed | clarify | stop
```

---

## Detection Rules

### Project Type Detection

| Keywords | Type | Confidence Boost |
|----------|------|------------------|
| saas, subscription, billing, monthly, plans | `saas` | +0.3 |
| landing, page, marketing, hero, cta | `landing` | +0.3 |
| api, rest, graphql, backend, endpoints | `api` | +0.3 |
| app, mobile, ios, android, expo, react native | `mobile` | +0.3 |
| jeu, game, unity, godot, phaser, 3d, 2d | `game` | +0.3 |
| desktop, electron, tauri, native | `desktop` | +0.3 |
| tool, cli, script, automation | `tool` | +0.3 |
| shop, ecommerce, cart, checkout, products | `ecommerce` | +0.3 |
| dashboard, admin, analytics, metrics | `dashboard` | +0.3 |

### Complexity Assessment

| Indicators | Complexity |
|------------|------------|
| Single feature, no auth, static | `simple` |
| Auth OR database OR 3-5 features | `medium` |
| Auth + billing + real-time + 5+ features | `complex` |

### Stack Detection

| Keywords | Framework | Default Version |
|----------|-----------|-----------------|
| next, nextjs, vercel | Next.js | 15 |
| react | React | 19 |
| vue, nuxt | Vue/Nuxt | 3 |
| svelte, sveltekit | SvelteKit | 2 |
| expo | Expo | SDK 52 |
| electron | Electron | Latest |
| tauri | Tauri | 2.0 |
| unity | Unity | 6 |
| godot | Godot | 4.3 |
| supabase | Supabase | Latest |
| prisma | Prisma | 6 |

---

## Confidence Thresholds

| Score | Action | Description |
|-------|--------|-------------|
| ≥90% | `proceed` | Exécuter immédiatement |
| 70-89% | `clarify` | Poser 1-2 questions |
| <70% | `stop` | Besoin de plus d'informations |

---

## Ambiguity Detection

### Questions automatiques si:

1. **Type projet incertain** (score < 0.7 sur type)
   ```
   Question: "Quel type de projet souhaitez-vous?"
   Options: [saas, landing, api, mobile, autre]
   ```

2. **Stack non spécifié** (aucun framework détecté)
   ```
   Question: "Quelle stack technique préférez-vous?"
   Options: [Next.js + Supabase, React + Node, Vue + Firebase, Laisser Claude choisir]
   ```

3. **Fonctionnalités vagues** (< 3 requirements explicites)
   ```
   Question: "Quelles fonctionnalités principales sont essentielles?"
   Options: [Auth, Dashboard, Paiements, API, Temps réel]
   ```

---

## Examples

### Example 1: High Confidence
```yaml
Input: "Crée-moi un SaaS de gestion de projets avec auth, teams et billing Stripe"

Output:
  project_type: saas
  complexity: complex
  detected_stack:
    - framework: Next.js 15
      confidence: 0.9
    - framework: Supabase
      confidence: 0.85
    - framework: Stripe
      confidence: 1.0
  requirements:
    explicit: [auth, teams, billing stripe, gestion projets]
    implicit: [dashboard, database, api]
  features:
    - name: authentication
      priority: high
    - name: team_management
      priority: high
    - name: stripe_billing
      priority: high
    - name: project_dashboard
      priority: high
  ambiguities: []
  confidence: 0.92
  recommendation: proceed
```

### Example 2: Needs Clarification
```yaml
Input: "Je veux une app"

Output:
  project_type: other
  complexity: unknown
  detected_stack: []
  requirements:
    explicit: []
    implicit: []
  features: []
  ambiguities:
    - question: "Quel type d'application souhaitez-vous?"
      options: [Web SaaS, Mobile, Desktop, Landing page]
      impact: high
    - question: "Quelles sont les fonctionnalités principales?"
      options: []
      impact: high
  confidence: 0.25
  recommendation: stop
```

### Example 3: Medium Confidence
```yaml
Input: "Landing page pour mon app de méditation"

Output:
  project_type: landing
  complexity: simple
  detected_stack:
    - framework: Next.js 15
      confidence: 0.8
  requirements:
    explicit: [landing page, app méditation]
    implicit: [hero section, features, cta, responsive]
  features:
    - name: hero_section
      priority: high
    - name: features_section
      priority: high
    - name: cta_section
      priority: high
    - name: testimonials
      priority: medium
  ambiguities:
    - question: "Voulez-vous des animations?"
      options: [Oui avec Framer Motion, Non minimaliste]
      impact: low
  confidence: 0.78
  recommendation: proceed
```

---

## Integration

### Position dans le Workflow v22.2

```
1. INTENT PARSING  ← Cet agent
   │
   ▼
2. MEMORY RECALL (si confidence ≥ 70%)
   │
   ▼
3. RESEARCH...
```

### Avec PM Agent

```yaml
handoff:
  to: pm-agent
  data:
    parsed_intent: <output de cet agent>
    confidence: float
  condition: confidence >= 0.7
```

---

## Performance Metrics

| Metric | Target |
|--------|--------|
| Parse accuracy | > 95% |
| Ambiguity detection | > 90% |
| False positives (unnecessary questions) | < 5% |
| Time to parse | < 1 sec |

---

*Intent Parser Agent v1.0 - ULTRA-CREATE v22.2*
