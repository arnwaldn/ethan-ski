# /learn-video - Apprendre depuis YouTube

## Syntaxe
```
/learn-video "[youtube-url]"
/learn-video "[youtube-url]" --focus="[topic]"
```

## Description
Extrait et analyse le contenu d'une video YouTube pour identifier patterns, best practices et connaissances techniques. Sauvegarde automatiquement dans Hindsight.

## Exemples

### Tutoriel Simple
```
/learn-video "https://youtube.com/watch?v=dQw4w9WgXcQ"
```

### Avec Focus Specifique
```
/learn-video "https://youtube.com/watch?v=..." --focus="React hooks"
/learn-video "https://youtu.be/..." --focus="architecture patterns"
```

### Videos Recommandees
```
# Next.js / React
/learn-video "https://youtube.com/watch?v=..." --focus="server components"

# System Design
/learn-video "https://youtube.com/watch?v=..." --focus="scalability"

# UI/UX
/learn-video "https://youtube.com/watch?v=..." --focus="design patterns"
```

## Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                      /learn-video                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. VALIDATION URL                                           │
│     └── youtube.com | youtu.be | shorts                      │
│                           ↓                                  │
│  2. EXTRACTION TRANSCRIPT                                    │
│     └── youtube-transcript-api (multi-langues)               │
│                           ↓                                  │
│  3. ANALYSE LLM                                              │
│     └── Patterns, technologies, best practices               │
│                           ↓                                  │
│  4. STRUCTURATION                                            │
│     └── Resume actionnable + points cles                     │
│                           ↓                                  │
│  5. PERSISTENCE HINDSIGHT                                    │
│     └── bank: patterns | tutorials                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Output

```markdown
## VIDEO ANALYSIS: [Title]

**URL**: https://youtube.com/watch?v=...
**Channel**: [Channel Name]
**Langue**: EN

---

### RESUME
[Description 2-3 phrases du contenu]

### TECHNOLOGIES MENTIONNEES
- React 19
- Next.js 15
- TypeScript
- Tailwind CSS

### PATTERNS & BEST PRACTICES
1. **[Pattern Name]**: [Explication courte]
2. **[Pattern Name]**: [Explication courte]
3. **[Pattern Name]**: [Explication courte]

### POINTS CLES A RETENIR
- Point important 1
- Point important 2
- Point important 3

### CODE SNIPPETS (si presents)
```[language]
// Code extrait de la video
```

### APPLICABILITE PROJETS
- Utiliser pour: [type de projet]
- Stack recommande: [technologies]

---

*Sauvegarde: Hindsight bank=patterns*
*Agent: video-researcher*
```

## Options

| Option | Usage | Description |
|--------|-------|-------------|
| `--focus` | `--focus="hooks"` | Concentrer l'analyse sur un sujet |
| `--lang` | `--lang="fr"` | Forcer une langue de transcript |
| `--save-to` | `--save-to="tutorials"` | Bank Hindsight cible |
| `--no-save` | `--no-save` | Analyser sans sauvegarder |

## Types de Videos

| Type | Channels Exemple | Ce qu'on extrait |
|------|------------------|------------------|
| **Tutoriels** | Fireship, Traversy | Code patterns, snippets |
| **Conferences** | Next.js Conf, ReactConf | Architecture, roadmap |
| **System Design** | ByteByteGo | Patterns scalabilite |
| **UI/UX** | DesignCourse | Design patterns |
| **DevOps** | TechWorld Nana | CI/CD, infra |

## Gestion Erreurs

| Erreur | Cause | Solution |
|--------|-------|----------|
| `No transcript` | Pas de sous-titres | Essayer autre video |
| `Video unavailable` | Video privee/supprimee | Verifier URL |
| `Invalid URL` | Format incorrect | Utiliser format standard |

## Integration

### Avec /research
```
/research "React patterns" --include-youtube
```
Ajoute automatiquement des videos comme source.

### Avec Hindsight
```javascript
// Rappeler les learnings video
mcp__hindsight__hindsight_recall({
  bank: 'patterns',
  query: 'React server components from video'
})
```

## Agent
Uses: `agents/research/video-researcher.md`

## Metriques

| Metrique | Valeur |
|----------|--------|
| Temps total | ~30-60 sec |
| Precision | ~85% |
| Langues | EN, FR, ES, DE, ... |
| Max duree video | ~2h |

---

*ULTRA-CREATE v21.3 - Video Learning Command*
