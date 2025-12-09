# /test - Lancer les tests

Exécute les tests du projet.

## Usage
```
/test [type]
```

## Types
- `unit` - Tests unitaires (Vitest)
- `e2e` - Tests end-to-end (Playwright)
- `all` - Tous les tests
- `coverage` - Avec rapport de couverture

## Exemples
```
/test             # Tous les tests
/test unit        # Unit tests seulement
/test e2e         # E2E tests seulement
/test coverage    # Avec couverture
```

## Objectifs de couverture
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%
