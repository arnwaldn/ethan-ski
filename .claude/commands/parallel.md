# /parallel - Exécution Parallèle

Force l'exécution parallèle d'une tâche avec plusieurs agents.

## Usage

```
/parallel "[tâche]" --agents=[n]
```

## Paramètres

| Param | Default | Description |
|-------|---------|-------------|
| `--agents` | auto | Nombre d'agents (1-25) |
| `--timeout` | 120s | Timeout par agent |
| `--checkpoint` | true | Sauvegarder checkpoints |
| `--recovery` | true | Auto-recovery si échec |

## Exemples

```bash
# Paralléliser une tâche
/parallel "Crée 5 pages de dashboard" --agents=5

# Avec timeout custom
/parallel "Génère les tests pour tous les composants" --agents=10 --timeout=180

# Sans checkpoints (plus rapide)
/parallel "Lint et fix tous les fichiers" --agents=8 --checkpoint=false
```

## Comment ça marche

1. **Task Decomposer** analyse la tâche
2. **Priority Queue** ordonne les sous-tâches
3. **Parallel Executor** lance N agents
4. Chaque agent travaille dans son **worktree isolé**
5. **Barrier sync** à chaque phase
6. **Merge** des résultats

## Output

```
/parallel "Crée les pages admin, user, settings, billing, analytics" --agents=5

Parallel Executor v18
├── Decomposing task...
│   └── 5 subtasks identified
├── Launching 5 agents:
│   ├── [Agent-1] admin page ████████░░ 80%
│   ├── [Agent-2] user page ██████████ 100% ✓
│   ├── [Agent-3] settings ███████░░░ 70%
│   ├── [Agent-4] billing █████████░ 95%
│   └── [Agent-5] analytics ██████░░░░ 60%
├── Barrier sync...
├── Merging results...
└── COMPLETE: 5 pages in 18s

Speed: 5x (vs sequential)
Files: 15 created
Conflicts: 0
```

## Cas d'Usage

### Génération de Composants
```bash
/parallel "Génère Button, Input, Card, Modal, Avatar, Badge" --agents=6
```

### Tests en Parallèle
```bash
/parallel "Run tests for auth, api, components, e2e" --agents=4
```

### Refactoring
```bash
/parallel "Migre tous les composants vers TypeScript strict" --agents=10
```

### Documentation
```bash
/parallel "Documente toutes les fonctions dans lib/" --agents=8
```

## Limites

- Max 25 agents simultanés
- Tâches doivent être indépendantes ou avec dépendances explicites
- Memory et I/O partagés avec locking

## Prompt

Quand l'utilisateur tape `/parallel "[tâche]"`:

1. Analyser la tâche pour identifier les sous-tâches
2. Vérifier que les sous-tâches sont parallélisables
3. Déterminer le nombre optimal d'agents si non spécifié
4. Créer les worktrees Git pour isolation
5. Lancer les agents en parallèle
6. Monitorer la progression en temps réel
7. Synchroniser aux barriers
8. Merger les résultats
9. Nettoyer les worktrees
10. Reporter le speedup obtenu
