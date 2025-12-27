# /papers - Recherche Papers Scientifiques ArXiv

## Syntaxe
```
/papers "[query]"
/papers "[query]" --category="cs.AI"
```

## Description
Recherche et analyse des papers scientifiques sur ArXiv pour identifier innovations, methodologies, et avancees techniques pertinentes pour le developpement.

## Exemples

### Recherche Simple
```
/papers "large language models agents"
```

### Par Categorie
```
/papers "retrieval augmented generation" --category="cs.CL"
/papers "code generation" --category="cs.SE"
```

### Filtres Avances
```
/papers "multi-agent systems" --since="2024-06" --max=20
/papers "transformer architecture" --author="Vaswani"
```

## Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                        /papers                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. RECHERCHE                                                │
│     └── ArXiv API → Papers pertinents                       │
│                           ↓                                  │
│  2. FILTRAGE                                                 │
│     └── Score relevance + date + citations                   │
│                           ↓                                  │
│  3. ANALYSE                                                  │
│     └── Abstracts → Contributions, methodologie              │
│                           ↓                                  │
│  4. SYNTHESE                                                 │
│     └── Resume + Applicabilite pratique                      │
│                           ↓                                  │
│  5. PERSISTENCE                                              │
│     └── Hindsight → bank: research                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Output

```markdown
## ARXIV RESEARCH: "LLM agents"

**Recherche**: "large language models agents"
**Resultats**: 10 papers
**Categories**: cs.AI, cs.CL, cs.LG

---

### TOP PAPERS

#### 1. ReAct: Synergizing Reasoning and Acting in LLMs
**Authors**: Yao, Zhao, Yu, et al.
**Date**: 2023-10-06
**ArXiv**: 2210.03629
**PDF**: https://arxiv.org/pdf/2210.03629

**Resume**:
Propose ReAct, un paradigme combinant raisonnement
et actions dans les LLMs pour resoudre des taches
complexes de maniere interactive.

**Contributions**:
- Fusion reasoning + acting
- Benchmarks QA et decision-making
- Interpretabilite amelioree

**Applicabilite**:
- Pattern pour agents autonomes
- Integration avec tools/APIs

---

#### 2. Toolformer: LLMs Can Teach Themselves
**Authors**: Schick, Dwivedi-Yu, et al.
**Date**: 2023-02-09
...

---

### SYNTHESE GLOBALE

**Tendances 2024**:
1. Agents multi-outils
2. Raisonnement multi-etapes
3. Self-correction patterns

**Technologies Emergentes**:
- ReAct pattern
- Tool-use fine-tuning
- Memory-augmented LLMs

**Recommandations**:
- [ ] Implementer ReAct pattern
- [ ] Ajouter tool-use capabilities
- [ ] Explorer memory mechanisms

---

*Sauvegarde: Hindsight bank=research*
```

## Categories ArXiv

| Code | Domaine | Usage |
|------|---------|-------|
| `cs.AI` | Intelligence Artificielle | Agents, reasoning |
| `cs.CL` | Computation & Language | NLP, LLMs |
| `cs.LG` | Machine Learning | Training, models |
| `cs.SE` | Software Engineering | Code gen, testing |
| `cs.CV` | Computer Vision | Image, multimodal |
| `cs.DC` | Distributed Computing | Scalability |
| `cs.DB` | Databases | Data, storage |
| `cs.HC` | Human-Computer Interaction | UX, interfaces |

## Options

| Option | Usage | Description |
|--------|-------|-------------|
| `--category` | `--category="cs.AI"` | Filtrer categorie |
| `--max` | `--max=20` | Nombre resultats |
| `--since` | `--since="2024-01"` | Depuis date |
| `--author` | `--author="Hinton"` | Par auteur |
| `--download` | Flag | Telecharger PDFs |
| `--save-to` | `--save-to="patterns"` | Bank cible |

## Queries Recommandees

### AI/ML
```
/papers "large language models"
/papers "prompt engineering" --category="cs.CL"
/papers "RAG retrieval augmented" --since="2024"
```

### Development
```
/papers "code generation LLM" --category="cs.SE"
/papers "automated testing AI"
/papers "software architecture LLM"
```

### Agents
```
/papers "autonomous agents LLM"
/papers "multi-agent systems"
/papers "tool-use language models"
```

## Integration

### Avec /research
```
/research "React patterns" --sources=github,arxiv,web
```

### Avec /learn-pdf
```
/papers "transformers" → trouve paper → /learn-pdf [pdf_url]
```

### Avec Hindsight
```javascript
mcp__hindsight__hindsight_recall({
  bank: 'research',
  query: 'LLM agents papers'
})
```

## Agent
Uses: `agents/research/arxiv-researcher.md`

## Metriques

| Metrique | Valeur |
|----------|--------|
| Temps recherche | ~5-10 sec |
| Temps analyse | ~30-60 sec |
| Max papers | 50 |
| Categories | 40+ |
| Precision | ~85% |

---

*ULTRA-CREATE v21.4 - ArXiv Research Command*
