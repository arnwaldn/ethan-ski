# Commande: /analyze

## Description
Analyse approfondie du code avec recommandations d'amélioration.

## Usage
```
/analyze [chemin] [focus]
```

## Focus disponibles
- `all` - Analyse complète (défaut)
- `security` - Focus sécurité (OWASP)
- `performance` - Focus performance
- `quality` - Focus qualité de code
- `architecture` - Focus architecture
- `accessibility` - Focus a11y (WCAG)

## Exemples
```
/analyze src/
/analyze src/components/auth security
/analyze src/api performance
```

## Rapport généré

### Analyse Complète
```markdown
# Analyse: [Chemin]

## Résumé Exécutif
- Score global: X/100
- Issues critiques: Y
- Améliorations suggérées: Z

## Sécurité (Score: X/100)
### Critiques
- [Issue avec localisation et fix]

### Warnings
- [Issue avec suggestion]

## Performance (Score: X/100)
### Optimisations Requises
- [Problème + solution]

### Opportunités
- [Amélioration optionnelle]

## Qualité de Code (Score: X/100)
### À Corriger
- [Pattern problématique]

### Recommandations
- [Best practice à adopter]

## Architecture
### Points Forts
- [Bon pattern identifié]

### Améliorations
- [Suggestion d'architecture]

## Plan d'Action
1. [ ] [Action prioritaire 1]
2. [ ] [Action prioritaire 2]
3. [ ] [Action prioritaire 3]
```

## Agents utilisés
- `code-reviewer`
- `security-auditor`
- `performance-optimizer`
- `accessibility-auditor`
