# Commande: /deep-research

## Description
Recherche approfondie avec Firecrawl, multi-sources, et elaboration automatique.
Version avancee de /research avec scraping web profond.

## Usage
```
/deep-research [sujet] [options]
```

## Exemples
```bash
/deep-research "authentication patterns 2025"
/deep-research "AI agents architecture" --elaborate
/deep-research "Next.js 15 new features" --sources=5
```

## Differences avec /research

| Aspect | /research | /deep-research |
|--------|-----------|----------------|
| Sources | 5-10 | 15-25 |
| Profondeur | 2 hops | 5 hops |
| Scraping | Non | Firecrawl |
| Elaboration | Non | Oui |
| Temps | 30s | 60-90s |

## Workflow

### Phase 1: Query Expansion
```yaml
actions:
  - Reformuler la question
  - Generer queries alternatives
  - Identifier mots-cles
```

### Phase 2: Multi-Source Search
```yaml
sources_paralleles:
  - mcp__github__search_repositories
  - mcp__github__search_code
  - mcp__exa__web_search_exa
  - mcp__context7__get-library-docs

scoring:
  - Relevance
  - Authority
  - Recency
```

### Phase 3: Firecrawl Deep Research
```yaml
firecrawl:
  mcp__firecrawl__firecrawl_search:
    query: "[topic]"
    limit: 5

  mcp__firecrawl__firecrawl_scrape:
    urls: [best_results]
    format: markdown

config:
  maxDepth: 3
  timeLimit: 180
  maxUrls: 10
```

### Phase 4: Multi-Hop Reasoning
```yaml
iterations: 5
process:
  - Analyser resultats
  - Identifier gaps
  - Rechercher reponses
  - Cross-reference
  - Saturation check
```

### Phase 5: Elaboration (si --elaborate)
```yaml
enhancements:
  - Explications detaillees
  - Exemples concrets
  - Case studies
  - Trends et predictions
  - Implications pratiques
```

### Phase 6: Synthesis
```yaml
output:
  summary: "3-5 points cles"
  findings: [detailed_list]
  sources: [scored_list]
  recommendations: [actionable]
  confidence: 0.0-1.0
```

## Output Format

```markdown
# Deep Research: [SUJET]

## Executive Summary
[2-3 phrases resumant les findings]

## Key Findings
1. **Finding 1**: Description detaillee
   - Evidence: [source]
   - Confidence: XX%

2. **Finding 2**: Description detaillee
   - Evidence: [source]
   - Confidence: XX%

## Detailed Analysis

### Aspect 1
[Analyse approfondie]

**Example:**
[Code ou exemple concret]

### Aspect 2
[Analyse approfondie]

**Case Study:**
[Exemple reel]

## Elaboration Insights
- Trend 1: [Prediction future]
- Trend 2: [Impact industrie]

## Practical Recommendations
- [ ] Action 1 (Priority: High)
- [ ] Action 2 (Priority: Medium)

## Sources
| Source | Type | Relevance | Method |
|--------|------|-----------|--------|
| [URL] | Doc | 95% | Firecrawl |

## Confidence Level
Overall: XX/100
Elaboration: YY/100
```

## Options

```bash
--elaborate       # Ajouter phase d'elaboration
--sources=[n]     # Nombre de sources (default: 10)
--depth=[n]       # Profondeur multi-hop (default: 5)
--time=[s]        # Timeout en secondes (default: 90)
--focus=[area]    # Focus sur un aspect
--save            # Sauvegarder dans Hindsight
```

## Agent Utilise
- `deep-researcher` v2.0 (enhanced)
- MCPs: firecrawl, exa, github, context7

## Integration
- Sauvegarde automatique dans Hindsight (bank: patterns)
- Cross-reference avec recherches precedentes
- Apprentissage continu des patterns
