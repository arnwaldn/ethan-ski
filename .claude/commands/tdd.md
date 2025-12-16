# /tdd - Test-Driven Development Workflow

Active le workflow TDD (Red-Green-Refactor) pour une fonctionnalité.

## Usage
```
/tdd [description de la fonctionnalité]
```

## Cycle TDD

### 1. RED - Écrire le test (doit échouer)
```typescript
// Utiliser Vitest pour les tests
import { describe, it, expect } from 'vitest';
import { maFonction } from './ma-fonction';

describe('maFonction', () => {
  it('should [comportement attendu]', () => {
    expect(maFonction(input)).toBe(expected);
  });
});
```

### 2. GREEN - Implémenter le minimum
- Code MINIMUM pour faire passer le test
- Pas d'optimisation à ce stade
- Pas de fonctionnalités supplémentaires

### 3. REFACTOR - Améliorer
- Nettoyer le code
- Optimiser si nécessaire
- S'assurer que les tests passent toujours

## Workflow Automatisé

1. **Analyser** la demande de fonctionnalité
2. **Créer** le fichier de test avec Context7 pour patterns Vitest
3. **Exécuter** `npm test` → doit ÉCHOUER
4. **Implémenter** le code minimal
5. **Exécuter** `npm test` → doit PASSER
6. **Refactorer** si nécessaire
7. **Sauvegarder** le pattern via `/learn`

## Commandes Vitest Utiles

```bash
# Lancer tous les tests
npm test

# Mode watch
npm test -- --watch

# Un seul fichier
npm test -- mon-fichier.test.ts

# Avec coverage
npm test -- --coverage
```

## Exemples

```
/tdd Fonction de validation d'email
/tdd Hook useDebounce pour recherche
/tdd API endpoint pour créer un utilisateur
```

## Stack Recommandé

- **Test Runner:** Vitest
- **Assertions:** expect de Vitest
- **Mocking:** vi.mock(), vi.fn()
- **Components:** @testing-library/react

---

*ULTRA-CREATE v19.0 - TDD Workflow*
