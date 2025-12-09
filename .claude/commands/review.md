# Commande: /review

## Description
Effectue une code review complète avec suggestions d'amélioration.

## Usage
```
/review [chemin|PR-url]
```

## Exemples
```
/review src/components/Button.tsx
/review src/api/
/review https://github.com/user/repo/pull/123
```

## Checklist de Review

### Correctness
- [ ] Le code fait ce qui est attendu
- [ ] Les edge cases sont gérés
- [ ] Pas de bugs évidents
- [ ] Tests adéquats

### Security
- [ ] Pas de vulnérabilités d'injection
- [ ] Validation des inputs
- [ ] Gestion sécurisée des secrets
- [ ] Auth/AuthZ correcte

### Performance
- [ ] Pas de N+1 queries
- [ ] Algorithmes optimaux
- [ ] Pas de memory leaks
- [ ] Lazy loading approprié

### Maintainability
- [ ] Code lisible
- [ ] Nommage explicite
- [ ] Fonctions courtes
- [ ] DRY respecté

### Standards
- [ ] TypeScript strict
- [ ] Style guide respecté
- [ ] Conventions du projet

## Format de Sortie

```markdown
# Code Review: [Chemin/PR]

## Résumé
- **Verdict:** ✅ Approved | ⚠️ Needs Work | ❌ Changes Required
- **Score:** X/100
- **Issues:** X critiques, Y warnings, Z suggestions

## Issues

### 🔴 Critiques
#### [Fichier:Ligne] Titre du problème
**Problème:**
[Description du problème]

**Code actuel:**
\`\`\`typescript
// Code problématique
\`\`\`

**Suggestion:**
\`\`\`typescript
// Code corrigé
\`\`\`

### 🟡 Warnings
[Même format...]

### 💡 Suggestions
[Même format...]

## Points Positifs
- ✅ [Bonne pratique observée]
- ✅ [Pattern bien utilisé]

## Recommandations
1. [Recommandation prioritaire]
2. [Autre recommandation]
```

## Agents utilisés
- `code-reviewer` (principal)
- `security-auditor`
- `performance-optimizer`
