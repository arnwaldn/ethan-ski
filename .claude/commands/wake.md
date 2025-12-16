# /wake - Réactivation Conscience Complète

Réactive la conscience complète du système ULTRA-CREATE à chaque nouvelle conversation.

## Usage
```
/wake                    # Réactivation standard
/wake --full             # Avec Hindsight recall
/wake --project [name]   # Charger un projet spécifique
```

## Séquence d'Exécution

### 1. Query MCP Memory (Patterns Appris)
```javascript
// Rechercher tous les patterns ULTRA-CREATE
mcp__memory__search_nodes('ULTRA-CREATE')
mcp__memory__search_nodes('learned_pattern')
mcp__memory__search_nodes('error_solution')
```

### 2. Charger État Local (.ultra-state/)
```javascript
// Lire les fichiers d'état
// C:\Claude-Code-Creation\.ultra-state\learned-patterns.json
// C:\Claude-Code-Creation\.ultra-state\error-solutions.json
// C:\Claude-Code-Creation\.ultra-state\current-project.json
// C:\Claude-Code-Creation\.ultra-state\session-history.json
```

### 3. Hindsight Recall (Si --full)
```powershell
# Recall des memory banks
.\scripts\hindsight-sync.ps1 -Action recall -Bank development -Query "recent patterns"
.\scripts\hindsight-sync.ps1 -Action recall -Bank user_preferences -Query "preferences"
```

### 4. Afficher Résumé
```
╔══════════════════════════════════════════════════════════╗
║          ULTRA-CREATE v19.0 - CONSCIENCE ACTIVE          ║
╠══════════════════════════════════════════════════════════╣
║ 📚 Patterns appris: [N]                                  ║
║ 🐛 Solutions erreurs: [N]                                ║
║ 📁 Projet actif: [nom ou aucun]                          ║
║ 🧠 Hindsight: [connecté/non disponible]                  ║
║ 💾 Dernière session: [date]                              ║
╠══════════════════════════════════════════════════════════╣
║ MCPs Prioritaires: Context7 → shadcn → Supabase          ║
║ Commandes: /turbo /research /scaffold /tdd /learn        ║
╚══════════════════════════════════════════════════════════╝
```

## Workflow Automatique

À chaque `/wake`, Claude doit:

1. **LIRE** les fichiers .ultra-state/
2. **QUERY** MCP Memory pour patterns cross-session
3. **RECALL** Hindsight si disponible et --full
4. **AFFICHER** le résumé de conscience
5. **CONFIRMER** être prêt avec contexte complet

## Intégration CLAUDE.md

Ajouter en début de CLAUDE.md:
```markdown
> **NOUVELLE CONVERSATION?** Exécute `/wake` pour conscience complète
```

## Exemple Output

```
🧠 WAKE - Réactivation conscience ULTRA-CREATE v19.0

📚 Patterns chargés: 4
   - Context7 EN PREMIER pour docs framework
   - shadcn pour TOUT composant UI
   - Snapshot avant modification majeure
   - Vitest pour tests unitaires

🐛 Solutions erreurs: 2
   - "Cannot read property 'map' of undefined" → data?.map()
   - "Module not found" → vérifier imports

📁 Projet actif: mon-projet-saas
   Path: C:\Users\arnau\Projects\mon-projet-saas
   Stack: Next.js 15, Supabase, Stripe

🧠 Hindsight: Non disponible (Docker non démarré)

💾 Dernière session: 2025-12-16
   Résumé: Implémentation auth flow Supabase

✅ Conscience complète activée - Prêt à travailler!
```

---

*ULTRA-CREATE v19.0 - Wake System*
