# /debug - Diagnostic et Résolution d'Erreurs

Analyse et résout les erreurs en utilisant l'agent debugger.

## Usage
```
/debug [mode] [context]
```

## Modes

### error - Analyser un message d'erreur
```
/debug error "TypeError: Cannot read property 'map' of undefined"
```
Fournit:
- Causes probables
- Solutions recommandées
- Code de correction

### trace - Tracer l'exécution
```
/debug trace src/components/DataTable.tsx
```
Analyse:
- Flow d'exécution
- Points de rupture suggérés
- Variables à surveiller

### perf - Problèmes de performance
```
/debug perf src/pages/Dashboard.tsx
```
Détecte:
- Re-renders inutiles
- Fuites mémoire
- Goulots d'étranglement

### deps - Problèmes de dépendances
```
/debug deps
```
Vérifie:
- Conflits de versions
- Packages obsolètes
- Vulnérabilités

### build - Erreurs de build
```
/debug build
```
Analyse les logs de build et propose des solutions.

## Exemples de Résolution

### Erreur Hydration
```
/debug error "Hydration failed because the initial UI does not match"
```
Output:
```
🔍 Analyse: Hydration Mismatch

Causes Probables:
1. Contenu dynamique (Date, Math.random)
2. Extension browser modifiant le DOM
3. localStorage/window utilisé côté serveur

Solutions:
┌─────────────────────────────────────┐
│ Solution 1: useEffect + useState    │
├─────────────────────────────────────┤
│ const [mounted, setMounted] =       │
│   useState(false);                  │
│ useEffect(() =>                     │
│   setMounted(true), []);            │
│ if (!mounted) return null;          │
└─────────────────────────────────────┘

Fichiers à vérifier:
- src/components/Header.tsx (Date detectée)
- src/components/Sidebar.tsx (localStorage)
```

### Erreur TypeScript
```
/debug error "Type 'string | undefined' is not assignable to type 'string'"
```
Output:
```
🔍 Analyse: Type Incompatible

Cause: Variable possiblement undefined

Solutions:
1. Nullish coalescing: value ?? "default"
2. Non-null assertion: value! (si certain)
3. Type guard: if (value) { ... }
4. Optional chaining: obj?.value
```

### Erreur API
```
/debug error "401 Unauthorized"
```
Output:
```
🔍 Analyse: Erreur d'Authentification

Checklist:
- [ ] Token présent dans headers?
- [ ] Token expiré?
- [ ] Format correct? (Bearer vs Basic)
- [ ] Endpoint correct?
- [ ] Permissions suffisantes?

Debug:
console.log('Token:', token?.substring(0, 20));
console.log('Headers:', JSON.stringify(headers));
```

## Commandes Rapides

```
/debug error "[paste error]"   - Diagnostic rapide
/debug perf                    - Audit performance
/debug deps                    - Check dépendances
/debug why [behavior]          - Expliquer un comportement
```
