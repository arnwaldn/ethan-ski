# /optimize - Optimisation Tokens & Couts

## Syntaxe
```
/optimize
/optimize --estimate
/optimize --report
```

## Description
Active l'optimisation intelligente des tokens pour reduire les couts de 30-60% tout en maintenant la qualite des outputs. Utilise le format TOON et des strategies de compression.

## Exemples

### Activer Optimisation
```
/optimize
```
Active l'optimisation pour la session courante.

### Estimer Avant Execution
```
/optimize --estimate
```
Affiche estimation tokens avant d'executer une tache.

### Voir Rapport
```
/optimize --report
```
Affiche le rapport d'optimisation de la derniere session.

## Modes

### Mode Auto (Defaut)
S'active automatiquement quand:
- Projet > 20 fichiers
- Tache estimee > 50K tokens
- Session > 30 minutes

### Mode Force
```
/optimize --force
```
Force l'optimisation meme pour petites taches.

### Mode TOON
```
/optimize --format=toon
```
Force le format TOON pour tous les outputs.

## Format TOON

### Avant (Standard) - ~500 tokens
```markdown
## Analysis Results

The analysis of the codebase revealed several important
findings. First, we discovered that the authentication
system has some security vulnerabilities...
```

### Apres (TOON) - ~150 tokens
```yaml
analysis:
  auth:
    issues: [vuln_xss, session_weak]
    priority: HIGH
    fix: sanitize_inputs
  db:
    issues: [no_index, n+1]
    priority: MED
```

**Economie: 70%**

## Strategies

| Strategie | Economie | Description |
|-----------|----------|-------------|
| Context Compression | 40-60% | Ne charger que fichiers pertinents |
| Output Formatting | 30-50% | YAML/TOON au lieu de prose |
| Incremental Processing | 20-40% | Traiter par chunks |
| Cache Utilization | 50-70% | Reutiliser patterns Hindsight |

## Output Rapport

```markdown
## TOKEN OPTIMIZATION REPORT

### Session: abc123
**Duree**: 45 minutes
**Tache**: Refactoring auth system

### Metriques

| Metrique | Valeur |
|----------|--------|
| Tokens estimes | 85,000 |
| Tokens utilises | 52,000 |
| **Economie** | **38.8%** |
| Cout estime | $0.85 |
| Cout reel | $0.52 |

### Strategies Appliquees
- [x] Context compression (12 → 5 fichiers)
- [x] TOON output format
- [x] Cache Hindsight (3 patterns)
- [ ] Chunking (non requis)

### Recommandations
1. Utiliser `--focus` pour limiter scope
2. Preferer YAML pour configs
3. Eviter re-analyse fichiers non modifies
```

## Seuils

| Niveau | Tokens | Action |
|--------|--------|--------|
| Normal | < 50K | Continuer |
| Attention | 50K-100K | Optimiser output |
| Warning | 100K-200K | Chunking requis |
| Critical | > 200K | Pause + strategie |

## Options

| Option | Usage | Description |
|--------|-------|-------------|
| `--estimate` | Flag | Estimer avant execution |
| `--report` | Flag | Voir dernier rapport |
| `--force` | Flag | Forcer optimisation |
| `--format` | `--format=toon` | Format output |
| `--threshold` | `--threshold=30000` | Seuil custom |
| `--disable` | Flag | Desactiver temporairement |

## Abbreviations Standard

| Long | Court |
|------|-------|
| implementation | impl |
| configuration | config |
| authentication | auth |
| documentation | docs |
| development | dev |
| production | prod |
| repository | repo |
| dependencies | deps |
| parameters | params |

## Integration

### Avec PM Agent
```yaml
pre_execution:
  - /optimize --estimate
  - Confidence Check
post_execution:
  - /optimize --report
  - Self-Check
```

### Avec Hindsight
```javascript
// Verifier cache avant analyse
mcp__hindsight__hindsight_recall({
  bank: 'patterns',
  query: 'similar problem solved'
})
```

## Agent
Uses: `agents/meta/token-optimizer.md`

## Metriques

| Metrique | Valeur |
|----------|--------|
| Reduction moyenne | 35% |
| Precision estimation | 85% |
| Overhead agent | < 2% |
| ROI | 10-50x |

---

*ULTRA-CREATE v21.4 - Token Optimization Command*
