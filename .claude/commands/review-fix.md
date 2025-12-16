# /review-fix - Code Review et Auto-Fix

Analyse le code, détecte les problèmes et applique les corrections automatiques.

## Usage
```
/review-fix [chemin]          # Analyse un fichier ou dossier
/review-fix                    # Analyse le projet entier
/review-fix --strict           # Mode strict (0 warning toléré)
```

## Workflow

### 1. Analyse Statique
```bash
# ESLint avec auto-fix
npx eslint . --fix --ext .ts,.tsx,.js,.jsx

# Prettier formatting
npx prettier --write "**/*.{ts,tsx,js,jsx,json,md}"

# TypeScript strict check
npx tsc --noEmit
```

### 2. Vérifications
- [ ] **Lint:** Pas d'erreurs ESLint
- [ ] **Types:** TypeScript compile sans erreurs
- [ ] **Format:** Code formaté avec Prettier
- [ ] **Imports:** Pas d'imports inutilisés
- [ ] **Console:** Pas de console.log en production

### 3. Sécurité (si disponible)
```bash
# SonarQube scan
npx sonarqube-scanner

# Semgrep patterns
npx semgrep --config=auto
```

### 4. Rapport
Génère un rapport avec:
- Erreurs corrigées automatiquement
- Erreurs nécessitant intervention manuelle
- Suggestions d'amélioration
- Score de qualité estimé

## Patterns Vérifiés

### TypeScript
- Typage strict (no `any`)
- Null checks
- Exhaustive switch cases

### React
- Hooks rules
- Keys dans les listes
- Deps array complètes

### Sécurité
- Pas de secrets hardcodés
- XSS prevention
- SQL injection patterns

## Exemples

```
/review-fix src/components/
/review-fix ./api/routes.ts
/review-fix --strict
```

## Output Exemple

```
🔍 Review-Fix Report
━━━━━━━━━━━━━━━━━━━━
✅ ESLint: 3 erreurs auto-fixées
✅ Prettier: 12 fichiers formatés
⚠️ TypeScript: 2 warnings (voir ci-dessous)
✅ Sécurité: Aucun problème détecté

Warnings TypeScript:
  src/utils/api.ts:45 - Implicit any type
  src/hooks/useData.ts:23 - Missing return type

Score: 92/100
```

---

*ULTRA-CREATE v19.0 - Review & Auto-Fix*
