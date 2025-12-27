# /uiux - UI/UX Feedback & Improvement Command

## Syntaxe
```
/uiux [mode] "[url ou description]"
```

## Modes

| Mode | Usage | Description |
|------|-------|-------------|
| `analyze` | `/uiux analyze "url"` | Analyse UI/UX avec scoring (10 dimensions) |
| `plan` | `/uiux plan "url"` | Analyse + Plan d'amelioration detaille |
| `full` | `/uiux full "url"` | Pipeline complet: Analyse → Plan → Code |
| `compare` | `/uiux compare "url1" "url2"` | Compare deux designs |
| `edit` | `/uiux edit "feedback"` | Modifier design existant |
| `score` | `/uiux score "url"` | Score rapide sans details |

## Exemples

### Analyse Complete
```
/uiux analyze "https://stripe.com"
```
Output: Rapport detaille avec scores sur 10 dimensions

### Plan d'Amelioration
```
/uiux plan "https://mon-site.com"
```
Output: Analyse + Specifications techniques (couleurs hex, fonts, px)

### Pipeline Complet (Recommande)
```
/uiux full "https://mon-landing.com"
```
Output: Analyse + Plan + Code React/Next.js avec shadcn

### Comparaison
```
/uiux compare "https://competitor1.com" "https://competitor2.com"
```
Output: Analyse comparative des deux sites

### Edition Iterative
```
/uiux edit "rendre le CTA plus visible et changer la couleur en orange"
```
Output: Nouvelle version du design avec modifications

## Pipeline Interne

```
┌─────────────────────────────────────────────────────────────┐
│                         /uiux full                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. CAPTURE                                                 │
│     └── Playwright screenshot + DOM extraction              │
│                           ↓                                 │
│  2. UI CRITIC                                               │
│     └── Analyse 10 dimensions + Scoring /100                │
│                           ↓                                 │
│  3. DESIGN STRATEGIST                                       │
│     └── Plan avec specs: hex, px, fonts, components         │
│                           ↓                                 │
│  4. CODE GENERATOR                                          │
│     └── React/Next.js + shadcn + Tailwind                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Dimensions Analysees

| # | Dimension | Poids |
|---|-----------|-------|
| 1 | Premiere Impression | 10% |
| 2 | Layout & Hierarchie | 15% |
| 3 | Typographie | 10% |
| 4 | Couleurs & Contraste | 10% |
| 5 | Call-to-Action | 15% |
| 6 | Whitespace & Balance | 10% |
| 7 | Structure Contenu | 10% |
| 8 | Accessibilite | 10% |
| 9 | Responsive/Mobile | 5% |
| 10 | Performance Percue | 5% |

## Output Structure

### Mode Analyze
```markdown
## ANALYSE UI/UX: [url]

**Score Global**: 72/100

### Scores Detailles
| Dimension | Score |
|-----------|-------|
| Layout | 8/10 |
| Typography | 7/10 |
| ... | ... |

### Problemes Critiques
1. [Issue avec solution]
2. [Issue avec solution]

### Points Forts
1. [Point positif]
2. [Point positif]

### Priorites d'Action
1. [Action #1]
2. [Action #2]
3. [Action #3]
```

### Mode Plan (ajoute)
```markdown
## PLAN D'AMELIORATION

### Palette Couleurs
| Role | Hex | Usage |
|------|-----|-------|
| Primary | #3B82F6 | Titres |
| CTA | #F97316 | Boutons |

### Typographie
- H1: 48px Inter Bold
- Body: 16px Inter Regular

### Composants shadcn
- button (lg, primary)
- card
- accordion
```

### Mode Full (ajoute)
```markdown
## CODE GENERE

### Fichiers
- app/page.tsx
- components/hero.tsx
- components/features.tsx

### Installation
npm install
npm run dev

### Preview
localhost:3000
```

## MCPs Utilises

| MCP | Fonction |
|-----|----------|
| Playwright | Screenshot, DOM |
| Figma | Reference design |
| Context7 | Docs Next.js, Tailwind |
| shadcn | Composants UI |
| Exa | Tendances UI/UX |

## Integration Autres Commandes

```
/uiux full "url" → genere code
/turbo landing → utilise le code genere
```

## Agents Impliques

| Agent | Role |
|-------|------|
| `ui-critic.md` | Analyse visuelle + scoring |
| `design-strategist.md` | Plan technique |
| `ui-ux-team.md` | Orchestration |
| `frontend-developer.md` | Generation code |

## Tips

1. **Meilleur input**: URL de production (pas localhost)
2. **Screenshots**: Automatiques via Playwright
3. **Iteratif**: Utiliser `/uiux edit` pour affiner
4. **Comparaison**: Analyser concurrents avant refonte

## Metriques

| Metrique | Valeur |
|----------|--------|
| Temps analyze | ~30 sec |
| Temps plan | ~1 min |
| Temps full | ~2-3 min |
| Score max | 100 |
| Code output | React/Next.js |

## Exemples Concrets

### Audit Landing Page
```
/uiux analyze "https://vercel.com"
```

### Refonte Complete
```
/uiux full "https://mon-vieux-site.com"
```

### Benchmark Concurrence
```
/uiux compare "https://mon-saas.com" "https://competitor.com"
```

---

*UI/UX Feedback Team v1.0 | Pattern: Sequential Pipeline | Agents: 3*
