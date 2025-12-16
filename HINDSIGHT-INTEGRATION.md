# ULTRA-CREATE v18.2 - Hindsight Integration Guide

> **IMPORTANT:** Hindsight est un serveur REST API, PAS un serveur MCP.
> Il doit etre demarre separement avec Docker.

## Quick Start

### Prerequis

1. **Docker Desktop** installe et demarre
2. **OpenAI API Key** dans `.env.secrets`:
   ```
   OPENAI_API_KEY=sk-proj-...
   ```
3. **(Optionnel)** Client officiel pour Node.js:
   ```bash
   npm install @vectorize-io/hindsight-client
   ```

### Demarrage en 3 etapes

```powershell
# 1. Demarrer Hindsight
.\scripts\start-hindsight.ps1

# 2. Verifier le status
.\scripts\start-hindsight.ps1 -Status

# 3. Ouvrir l'interface web (optionnel)
.\scripts\start-hindsight.ps1 -UI
```

**Endpoints:**
- API: http://localhost:8888
- UI: http://localhost:9999

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ULTRA-CREATE v18.2                    │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │ MCP Memory   │    │  Hindsight   │                   │
│  │ (key-value)  │    │ (biomimetic) │                   │
│  │   Simple     │    │   Advanced   │                   │
│  └──────┬───────┘    └──────┬───────┘                   │
│         │                   │                            │
│         │    ┌──────────────▼──────────────┐            │
│         │    │   hindsight-adapter.js      │            │
│         │    │  (Official client + HTTP)   │            │
│         │    └──────────────┬──────────────┘            │
│         │                   │                            │
│         ▼                   ▼                            │
│  ┌──────────────────────────────────────────┐           │
│  │         Persistent Memory Layer          │           │
│  └──────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

**Hindsight vs MCP Memory:**
- **MCP Memory**: Simple key-value, cross-session, via MCP protocol
- **Hindsight**: Biomimetic, semantic search, graph relations, learning via reflect

---

## Utilisation

### Via Node.js Adapter (Recommande)

```javascript
const memory = require('./scripts/hindsight-adapter');

// Verifier la disponibilite
if (await memory.isAvailable()) {
  console.log('Hindsight is running!');
}

// Stocker des informations (RETAIN)
await memory.retain('world', 'Next.js 15 utilise App Router par defaut');
await memory.retain('experiences', 'SUCCESS: Deploy Vercel en 30s');
await memory.retain('skills', 'Toujours utiliser Context7 en premier');

// Methodes helper
await memory.recordSuccess('deploy', 'Deploye sur Vercel en 30s');
await memory.recordFailure('build', 'TypeScript error', 'Ajouter types manquants');
await memory.recordSkill('Pattern: useState + useEffect pour data fetching');
await memory.recordFact('Supabase utilise PostgreSQL', 'Context7');
await memory.recordCodePattern('Form validation', 'Zod + react-hook-form', 'React');

// Recuperer des memoires (RECALL)
const results = await memory.recall('Comment deployer sur Vercel?');
const tradingResults = await memory.recall('Support levels?', { bank: 'trading' });

// Generer des insights (REFLECT)
const insights = await memory.reflect('Quels patterns fonctionnent le mieux?');

// Contexte avant tache
const context = await memory.getTaskContext('Creer formulaire de contact');

// Insights apres session
await memory.generateSessionInsights('Session de creation landing page');
```

### Via CLI

```bash
# Status
node scripts/hindsight-adapter.js status

# Stocker (retain)
node scripts/hindsight-adapter.js retain world "Next.js 15 uses App Router"
node scripts/hindsight-adapter.js retain experiences "SUCCESS: Deployed to Vercel"
node scripts/hindsight-adapter.js retain skills "Always use Context7 first"

# Recuperer (recall)
node scripts/hindsight-adapter.js recall "How to use Next.js routing?"

# Reflechir (reflect)
node scripts/hindsight-adapter.js reflect "What React patterns work best?"
```

### Via PowerShell (hindsight-sync.ps1)

```powershell
# Status
.\scripts\hindsight-sync.ps1 -Action status

# Retain
.\scripts\hindsight-sync.ps1 -Action retain -Bank trading -Content "EURUSD support at 1.0850"

# Recall
.\scripts\hindsight-sync.ps1 -Action recall -Bank development -Query "How to implement auth?"

# Reflect
.\scripts\hindsight-sync.ps1 -Action reflect -Bank trading -Query "What patterns work?"

# Lister les banks
.\scripts\hindsight-sync.ps1 -Action banks
```

### Via API REST Direct

```bash
# Health check
curl http://localhost:8888/health

# Retain
curl -X POST http://localhost:8888/retain \
  -H "Content-Type: application/json" \
  -d '{"bank_id": "ultra-world-memory", "content": "Next.js 15 uses App Router"}'

# Recall
curl -X POST http://localhost:8888/recall \
  -H "Content-Type: application/json" \
  -d '{"query": "How to use Next.js routing?", "max_tokens": 4000}'

# Reflect
curl -X POST http://localhost:8888/reflect \
  -H "Content-Type: application/json" \
  -d '{"bank_id": "ultra-dev-memory", "query": "What patterns work best?"}'
```

---

## Memory Banks

| Bank ID | Alias | Type Biomimetique | Usage |
|---------|-------|-------------------|-------|
| `ultra-world-memory` | world | World Facts | Infos frameworks, APIs, docs |
| `ultra-experiences-memory` | experiences | Experiences | Succes/echecs d'operations |
| `ultra-opinions-memory` | opinions | Opinions | Croyances avec scores de confiance |
| `ultra-observations-memory` | observations | Observations | Modeles mentaux complexes |
| `ultra-skills-memory` | skills | Opinions | Patterns appris, best practices |
| `ultra-trading-memory` | trading | Experiences | Analyses marche, niveaux, patterns |
| `ultra-dev-memory` | development | Experiences | Patterns code, solutions techniques |
| `ultra-user-memory` | user_preferences | World Facts | Preferences utilisateur |

### Types Biomimetiques Hindsight

1. **World Facts**: Faits objectifs sur le monde (frameworks, APIs)
2. **Experiences**: Experiences vecues par l'agent (succes, echecs)
3. **Opinions**: Croyances avec niveau de confiance (0-1)
4. **Observations**: Modeles mentaux issus de la reflexion

---

## Workflow Recommande

### Avant une tache
```javascript
// Recuperer le contexte pertinent
const context = await memory.getTaskContext('Creer formulaire de contact');
console.log(`Found ${context.memories?.length || 0} relevant memories`);
```

### Pendant une tache
```javascript
// Enregistrer les succes
await memory.recordSuccess('component', 'ContactForm cree avec validation Zod');

// Enregistrer les echecs avec solutions
await memory.recordFailure('validation', 'Email regex trop stricte', 'Utiliser validator.js');

// Enregistrer les patterns decouverts
await memory.recordCodePattern('Form submission', 'server action + useFormState', 'Next.js 15');
```

### Apres une session
```javascript
// Generer des insights
const insights = await memory.generateSessionInsights('Session de creation de landing page');
```

---

## Commandes PowerShell

| Commande | Description |
|----------|-------------|
| `.\scripts\start-hindsight.ps1` | Demarrer le serveur |
| `.\scripts\start-hindsight.ps1 -Status` | Verifier le status |
| `.\scripts\start-hindsight.ps1 -Logs` | Voir les logs |
| `.\scripts\start-hindsight.ps1 -UI` | Ouvrir l'interface web |
| `.\scripts\start-hindsight.ps1 -Stop` | Arreter le serveur |
| `.\scripts\start-hindsight.ps1 -Restart` | Redemarrer |
| `.\scripts\start-hindsight.ps1 -Model gpt-4o` | Utiliser un autre modele |

---

## Modeles LLM Supportes

| Modele | Usage | Cout |
|--------|-------|------|
| `gpt-4o-mini` | Par defaut, bon rapport qualite/prix | $ |
| `gpt-4o` | Meilleure qualite d'extraction | $$ |
| `o3-mini` | Raisonnement avance | $$$ |

Changer le modele:
```powershell
.\scripts\start-hindsight.ps1 -Restart -Model gpt-4o
```

---

## Comparaison MCP Memory vs Hindsight

| Fonctionnalite | MCP Memory | Hindsight |
|----------------|------------|-----------|
| **Protocole** | MCP (stdio) | REST API (HTTP) |
| **Stockage** | Key-value | Biomimetique |
| **Recherche** | Exact match | Semantic + Graph + Keyword |
| **Apprentissage** | ❌ | ✅ reflect() |
| **Confiance** | ❌ | ✅ Scores |
| **Relations** | Manuelles | ✅ Auto-extraction |
| **Temporal** | ❌ | ✅ Time queries |
| **UI** | ❌ | ✅ Web dashboard |
| **Setup** | Automatique | Docker requis |

**Recommandation:**
- Utiliser **MCP Memory** pour persistance simple cross-session
- Utiliser **Hindsight** pour apprentissage et recherche semantique

---

## Troubleshooting

### Bug PostgreSQL embarque sur Windows (Decembre 2024)

**Symptome:** Le conteneur demarre puis s'arrete avec "Database migration failed"

```
sqlalchemy.exc.ArgumentError: Expected string or URL object, got None
RuntimeError: Database migration failed
```

**Cause:** Race condition dans Hindsight - les migrations s'executent avant que PostgreSQL soit pret.

**Solutions possibles:**
1. Attendre une mise a jour de Hindsight (issue connue)
2. Utiliser Hindsight avec PostgreSQL externe
3. Utiliser Linux/WSL2 au lieu de Windows natif
4. Utiliser MCP Memory comme alternative simple

**Status:** Le code et la configuration ULTRA-CREATE sont corrects. Le probleme est dans l'image Docker Hindsight.

### Docker non trouve
```
[ERROR] Docker is not running or not installed
```
→ Installer Docker Desktop: https://www.docker.com/products/docker-desktop

### API Key manquante
```
[ERROR] OPENAI_API_KEY not found
```
→ Ajouter dans `.env.secrets`:
```
OPENAI_API_KEY=sk-proj-...
```

### Port deja utilise
```
Error: Port 8888 already in use
```
→ Arreter l'ancien container:
```powershell
.\scripts\start-hindsight.ps1 -Stop
.\scripts\start-hindsight.ps1
```

### Hindsight ne repond pas
```powershell
# Verifier les logs
.\scripts\start-hindsight.ps1 -Logs

# Redemarrer
.\scripts\start-hindsight.ps1 -Restart
```

### Adapter ne trouve pas le client officiel
```
[Hindsight] Official client not found, using built-in HTTP adapter
```
→ Installer le client officiel (optionnel):
```bash
npm install @vectorize-io/hindsight-client
```

---

## Fichiers

| Fichier | Description |
|---------|-------------|
| `config/hindsight-config.json` | Configuration complete |
| `scripts/start-hindsight.ps1` | Script de demarrage Docker |
| `scripts/hindsight-adapter.js` | Adaptateur Node.js (client officiel + HTTP) |
| `scripts/hindsight-sync.ps1` | Script PowerShell pour operations |
| `memory/architecture.md` | Documentation architecture |

---

## Ressources

- **Documentation Hindsight:** https://hindsight.vectorize.io
- **Paper (arXiv):** https://arxiv.org/abs/2512.12818
- **GitHub:** https://github.com/vectorize-io/hindsight
- **Benchmark Explorer:** https://hindsight-benchmarks.vercel.app
- **Client npm:** https://www.npmjs.com/package/@vectorize-io/hindsight-client

---

*ULTRA-CREATE v18.2 - Hindsight Integration*
