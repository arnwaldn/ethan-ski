# /refactor - Refactoring Automatique

Analyse et améliore la qualité du code en utilisant l'agent refactoring-expert.

## Usage
```
/refactor [mode] [target]
```

## Modes

### analyze - Analyse sans modification
```
/refactor analyze src/components/Dashboard.tsx
```
Retourne:
- Code smells détectés
- Suggestions d'amélioration
- Score de qualité

### auto - Refactoring automatique
```
/refactor auto src/components/Dashboard.tsx
```
Applique automatiquement:
- Extract Method pour fonctions trop longues
- Early returns pour conditions imbriquées
- Renommage pour clarté

### extract-component
```
/refactor extract-component src/pages/Home.tsx HeroSection
```
Extrait une partie du JSX en composant séparé.

### extract-hook
```
/refactor extract-hook src/components/Form.tsx useFormValidation
```
Extrait la logique d'état en custom hook.

### simplify
```
/refactor simplify src/utils/helpers.ts
```
Simplifie le code:
- Supprime le code mort
- Inline les variables inutiles
- Simplifie les conditions

### typescript
```
/refactor typescript src/
```
Améliore le typage:
- Remplace `any` par des types spécifiques
- Ajoute des type guards
- Génère des interfaces

## Exemples

### Analyser tout le projet
```
/refactor analyze src/
```

### Refactorer un composant
```
/refactor auto src/components/UserProfile.tsx
```

### Extraire un hook de data fetching
```
/refactor extract-hook src/components/UserList.tsx useUsers
```

## Output

```
📊 Analyse de: src/components/Dashboard.tsx

Code Smells Détectés:
├── 🔴 Long Method (ligne 45-120): 75 lignes
├── 🟡 Deep Nesting (ligne 67): 4 niveaux
├── 🟡 Magic Numbers (lignes 23, 45, 89)
└── 🟢 Good naming conventions

Score Qualité: 65/100

Suggestions:
1. Extraire la logique de stats en <StatsSection />
2. Utiliser early returns dans renderContent()
3. Créer constantes pour magic numbers

Voulez-vous appliquer les corrections automatiquement? [O/n]
```
