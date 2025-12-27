# Claude Skills Directory

Ce dossier est réservé pour les skills Claude Code personnalisés.

## Qu'est-ce qu'un Skill?

Un skill est une capacité spécialisée que Claude peut invoquer pour des tâches spécifiques.

## Skills Disponibles

Actuellement, le système utilise les super-agents dans `agents/super-agents/` comme skills:

- `fullstack-super` - Développement full-stack
- `ui-super` - Création d'interfaces
- `backend-super` - Développement backend
- `research-super` - Recherche approfondie
- `quality-super` - Audit qualité
- `deploy-super` - Déploiement

## Créer un Skill

Pour créer un nouveau skill, ajoutez un fichier `.md` dans ce dossier avec:

```markdown
# Skill: [Nom]

## Description
[Ce que fait le skill]

## Trigger
[Quand l'invoquer]

## Actions
[Liste des actions]
```
