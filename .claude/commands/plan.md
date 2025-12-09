# Commande: /plan

## Description
Active le mode planification pour créer un plan d'implémentation détaillé.

## Usage
```
/plan [description du projet/feature]
```

## Exemples
```
/plan Système de notifications push pour l'app mobile
/plan Migration de Express vers Hono
/plan Feature de collaboration en temps réel
```

## Workflow

### 1. Analyse des Besoins
- Comprendre l'objectif
- Identifier les contraintes
- Lister les dépendances

### 2. Exploration
- Analyser le code existant
- Identifier les points d'intégration
- Rechercher les best practices

### 3. Architecture
- Concevoir la solution
- Créer les diagrammes nécessaires
- Définir les interfaces

### 4. Plan d'Implémentation
```markdown
# Plan: [Titre]

## Contexte
[Description du contexte et objectif]

## Architecture Proposée
[Diagramme Mermaid]

## Phases d'Implémentation

### Phase 1: [Nom] (Priorité: Haute)
**Objectif:** [Description]

**Tâches:**
1. [ ] Tâche 1
   - Fichiers: `path/to/file.ts`
   - Détails: [Description technique]

2. [ ] Tâche 2
   - Fichiers: `path/to/file.ts`
   - Détails: [Description technique]

**Validation:**
- [ ] Critère de succès 1
- [ ] Critère de succès 2

### Phase 2: [Nom] (Priorité: Moyenne)
...

## Risques et Mitigations
| Risque | Impact | Mitigation |
|--------|--------|------------|
| [Risque] | [Haut/Moyen] | [Solution] |

## Dépendances
- [ ] Package X à installer
- [ ] Configuration Y à faire

## Questions Ouvertes
1. [Question nécessitant clarification]
```

## Modes Associés
- Active automatiquement le mode `architect`
- Transition vers mode `autonomous` pour exécution

## Agents utilisés
- `orchestrator` (Queen)
- `deep-researcher`
- Agents spécialisés selon le domaine
