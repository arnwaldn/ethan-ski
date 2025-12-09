# Commande: /research

## Description
Lance une recherche approfondie multi-sources sur un sujet technique.

## Usage
```
/research [sujet]
```

## Exemples
```
/research best practices authentication 2025
/research react server components vs client
/research prisma vs drizzle performance
```

## Workflow

### 1. Analyse de la requête
- Identifier les mots-clés principaux
- Déterminer le type de recherche (comparaison, best practices, tutorial, etc.)
- Générer des queries alternatives

### 2. Recherche multi-sources
- GitHub repos et discussions
- Documentation officielle
- Stack Overflow
- Articles techniques récents
- npm/PyPI pour packages

### 3. Analyse et synthèse
- Scoring de pertinence des sources
- Cross-référencement des informations
- Identification des consensus et divergences

### 4. Rapport structuré
```markdown
## Recherche: [SUJET]

### Synthèse
[2-3 phrases résumant les findings principaux]

### Points Clés
1. [Finding 1]
2. [Finding 2]
3. [Finding 3]

### Recommandations
- [Recommandation 1]
- [Recommandation 2]

### Sources
| Source | Type | Fiabilité |
|--------|------|-----------|
| [URL] | [Doc/Article/Repo] | [Haute/Moyenne] |

### Prochaines Étapes
- [ ] Action suggérée 1
- [ ] Action suggérée 2
```

## Agent utilisé
- `deep-researcher` (principal)
- `tech-scout` (support)
