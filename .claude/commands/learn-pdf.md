# /learn-pdf - Analyser un Document PDF

## Syntaxe
```
/learn-pdf "[path]"
/learn-pdf "[path]" --focus="[topic]"
```

## Description
Extrait et analyse le contenu d'un document PDF pour identifier patterns, connaissances techniques, et informations structurees. Sauvegarde automatiquement dans Hindsight.

## Exemples

### Analyse Simple
```
/learn-pdf "C:\docs\architecture.pdf"
```

### Avec Focus Specifique
```
/learn-pdf "C:\docs\api-spec.pdf" --focus="endpoints"
/learn-pdf "C:\docs\security.pdf" --focus="authentication"
```

### Pages Specifiques
```
/learn-pdf "C:\docs\manual.pdf" --pages="1-20"
/learn-pdf "C:\docs\book.pdf" --pages="50-75"
```

## Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                      /learn-pdf                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. VALIDATION                                               │
│     └── Verifier fichier existe + format PDF                │
│                           ↓                                  │
│  2. EXTRACTION                                               │
│     └── PyMuPDF via E2B → Texte + Structure                 │
│                           ↓                                  │
│  3. ANALYSE LLM                                              │
│     └── Resume, patterns, technologies                       │
│                           ↓                                  │
│  4. STRUCTURATION                                            │
│     └── Format actionnable + points cles                     │
│                           ↓                                  │
│  5. PERSISTENCE                                              │
│     └── Hindsight → bank: documents                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Output

```markdown
## PDF ANALYSIS: [Title]

**Fichier**: architecture-guide.pdf
**Pages**: 45 pages
**Type**: Technical Documentation
**Auteur**: Tech Team

---

### RESUME
Guide complet de l'architecture microservices avec focus
sur la scalabilite et la resilience des systemes distribues.

### STRUCTURE
1. Introduction - Page 1
2. Architecture Overview - Page 5
3. Service Communication - Page 15
4. Data Management - Page 25
5. Deployment - Page 35

### TECHNOLOGIES
- Kubernetes
- Docker
- gRPC
- PostgreSQL
- Redis

### POINTS CLES
- Pattern Circuit Breaker pour resilience
- Event sourcing pour audit trail
- CQRS pour separation read/write
- Service mesh avec Istio
- Observability avec Prometheus/Grafana

### TABLES IMPORTANTES
| Service | Port | Protocol |
|---------|------|----------|
| API GW | 8080 | REST |
| Auth | 8081 | gRPC |
| Data | 5432 | PostgreSQL |

### APPLICABILITE
- Utiliser pour: Architecture microservices
- Stack: Kubernetes + Docker
- Pattern: Event-driven

---

*Sauvegarde: Hindsight bank=documents*
*Agent: pdf-researcher*
```

## Options

| Option | Usage | Description |
|--------|-------|-------------|
| `--focus` | `--focus="security"` | Concentrer l'analyse |
| `--pages` | `--pages="1-10"` | Limiter aux pages |
| `--extract-images` | Flag | Extraire les images |
| `--ocr` | Flag | OCR pour PDFs scannes |
| `--save-to` | `--save-to="patterns"` | Bank Hindsight cible |
| `--no-save` | Flag | Analyser sans sauvegarder |

## Types de PDFs

| Type | Ce qu'on extrait |
|------|------------------|
| **Documentation** | Patterns, endpoints, configs |
| **Papers** | Methodologie, resultats |
| **Manuels** | Procedures, etapes |
| **Specs** | Requirements, contraintes |
| **Ebooks** | Chapitres, code snippets |

## Gestion Erreurs

| Erreur | Cause | Solution |
|--------|-------|----------|
| `File not found` | Chemin incorrect | Verifier path |
| `Encrypted PDF` | PDF protege | Fournir mot de passe |
| `No text layer` | PDF image | Utiliser --ocr |
| `File too large` | >50MB | Utiliser --pages |

## Integration

### Avec /research
```
/research "microservices" → trouve PDF → /learn-pdf auto
```

### Avec Hindsight
```javascript
// Rappeler analyses PDF
mcp__hindsight__hindsight_recall({
  bank: 'documents',
  query: 'architecture microservices'
})
```

## Agent
Uses: `agents/research/pdf-researcher.md`

## Metriques

| Metrique | Valeur |
|----------|--------|
| Temps total | ~30-60 sec |
| Max pages | 500 |
| Max taille | 50MB |
| Precision | ~90% |
| Langues | Multi |

---

*ULTRA-CREATE v21.4 - PDF Learning Command*
