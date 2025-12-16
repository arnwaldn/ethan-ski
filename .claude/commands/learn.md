# /learn - Apprentissage et Persistance

Sauvegarde des patterns, erreurs-solutions et insights pour apprentissage cross-session.

## Usage
```
/learn "pattern découvert"           # Enregistrer un pattern
/learn --error "erreur" "solution"   # Enregistrer erreur + solution
/learn --session "résumé"            # Sauvegarder résumé de session
/learn --list                        # Voir les patterns appris
/learn --search "keyword"            # Chercher dans les patterns
/learn --reflect                     # Générer des insights (si Hindsight actif)
/learn --export                      # Exporter pour MCP Memory
```

## Stockage

### Local (.ultra-state/)
```
.ultra-state/
├── learned-patterns.json    # Patterns appris
├── error-solutions.json     # Paires erreur-solution
├── session-history.json     # Historique des sessions
├── current-project.json     # Projet actif
└── edit-stats.json          # Stats d'édition (auto)
```

### MCP Memory (Cross-session)
```javascript
mcp__memory__create_entities([{
  name: "pattern-xyz",
  entityType: "learned_pattern",
  observations: ["Pattern content..."]
}])
```

### Hindsight (Si actif)
```bash
# Auto-sync vers Hindsight
.\scripts\hindsight-sync.ps1 -Action retain -Bank skills -Content "..."
```

## Exemples

### Enregistrer un Pattern
```
/learn "Toujours utiliser useCallback pour les fonctions passées en props"
/learn "Préférer server actions à API routes pour mutations simples"
```

### Enregistrer Erreur + Solution
```
/learn --error "TypeError: Cannot read property 'map' of undefined" "Ajouter une vérification null: data?.map() ou data ?? []"
/learn --error "Module not found: @supabase/ssr" "npm install @supabase/ssr"
```

### Fin de Session
```
/learn --session "Implémenté auth flow complet avec Supabase: signup, login, logout, reset password"
```

### Recherche
```
/learn --search "supabase"
/learn --search "typescript"
```

## CLI Direct

```bash
# Via Memory Bridge
node scripts/memory-bridge.js pattern "Mon pattern"
node scripts/memory-bridge.js error "L'erreur" "La solution"
node scripts/memory-bridge.js session "Résumé de session"
node scripts/memory-bridge.js patterns
node scripts/memory-bridge.js search "keyword"
node scripts/memory-bridge.js export-mcp
```

## Intégration Workflow

### Début de tâche
```javascript
// Claude recherche automatiquement le contexte
mcp__memory__search_nodes("related keywords")
```

### Pendant la tâche
```
# Après avoir résolu un problème
/learn --error "le problème" "la solution"
```

### Fin de tâche
```
# Sauvegarder les apprentissages
/learn "Pattern découvert pendant cette tâche"
/learn --session "Résumé de ce qui a été fait"
```

## Output Exemple

```
✅ Pattern enregistré
   Content: "Utiliser zod + react-hook-form pour validation"
   Context: { category: "forms", framework: "react" }
   Synced to: local, mcp-memory

📊 Stats actuelles:
   - Patterns: 15
   - Error-Solutions: 8
   - Sessions: 5
```

---

*ULTRA-CREATE v19.0 - Learning System*
