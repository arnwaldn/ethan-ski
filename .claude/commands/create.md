# /create - Création Autonome de Projet

## Mode Autonome ULTRA-CREATE

Tu es en mode **création autonome**. Crée un projet complet sans intervention humaine.

## Instructions

1. **Analyser** la demande: $ARGUMENTS
2. **Déterminer** le type de projet (saas, landing, api, mobile)
3. **Utiliser** le template approprié depuis `C:\Claude-Code-Creation\templates\`
4. **Personnaliser** avec les variables du projet
5. **Valider** automatiquement avec pre-deploy.js
6. **Rapporter** le résultat

## Workflow Obligatoire

### Étape 1: Context7 (TOUJOURS)
Récupère la documentation à jour du framework principal avant de coder.

### Étape 2: Template Engine
```javascript
// Utilise le système de templates
const { AutonomousOrchestrator } = require('./scripts/autonomous/orchestrator')
const orchestrator = new AutonomousOrchestrator()
await orchestrator.createProject(description, projectName)
```

### Étape 3: Personnalisation
Remplace toutes les variables {{VAR}} dans les fichiers générés.

### Étape 4: Validation
Exécute `node scripts/hooks/pre-deploy.js <project-path>` pour valider.

### Étape 5: Rapport
Affiche:
- ✅ Fichiers créés
- 📁 Chemin du projet
- 📝 Commandes pour démarrer

## Types de Projet

| Type | Template | Temps estimé |
|------|----------|--------------|
| saas | Dashboard + Auth + Billing | 15-20 min |
| landing | Hero + Features + Pricing | 10-15 min |
| api | REST + Validation + Auth | 10-15 min |

## Exemple

```
/create saas "Application de gestion de factures pour freelances"
```

Résultat: Projet complet avec dashboard, auth Clerk, billing Stripe.
