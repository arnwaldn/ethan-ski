# PERSISTENCE CHECKLIST - ULTRA-CREATE v13.0

## GARANTIE D'ACCES COMPLET A CHAQUE SESSION

Ce document explique ce qui est automatiquement accessible et ce qui doit etre charge manuellement.

---

## 1. ACCES AUTOMATIQUE (Toujours disponible)

### CLAUDE.md Global
- **Fichier:** `C:\Users\arnau\.claude\CLAUDE.md`
- **Charge:** Automatiquement au demarrage de chaque session Claude Code
- **Contient:** Identite ULTRA-CREATE v13.0, matrice decision, agents, templates, modes, stack

### Fichiers Systeme
- **Tous les fichiers** dans `C:\Claude-Code-Creation\` sont accessibles via les outils Read/Write/Edit
- **148 fichiers markdown** disponibles (agents, knowledge, templates)

### MCP Servers Toujours Actifs
| MCP | Statut | Usage |
|-----|--------|-------|
| **memory** | AUTO | Knowledge graph persistant |
| **filesystem** | AUTO | Acces fichiers |
| **sequential-thinking** | AUTO | Raisonnement structure |
| **postgres** | AUTO | Base de donnees |
| **puppeteer** | AUTO | Browser automation |
| **notion** | AUTO | Integration Notion |
| **git** | AUTO | Operations Git |
| **github** | PARTIEL | API GitHub (token valide) |

---

## 2. ACCES SUR DEMANDE (Charger si necessaire)

### MCP Memory - Knowledge Graph Complet
Pour charger toute la memoire persistante:
```
mcp__memory__open_nodes(["ULTRA-CREATE-SYSTEM-v13", "DEVIN-PATTERNS", "VISUAL-DEVELOPMENT", "V13-AGENTS-NEW", "V13-TEMPLATES-NEW"])
```

### Entites Memoire Disponibles (63 entites)
- ULTRA-CREATE-SYSTEM-v13
- DEVIN-PATTERNS
- VISUAL-DEVELOPMENT
- V13-AGENTS-NEW
- V13-TEMPLATES-NEW
- V13-MCPS-NEW
- Trading-Brain-Project
- MCP-AccountActions
- MCP-TechnicalAnalysis
- SWARM-INTELLIGENCE
- ... et 53 autres

---

## 3. CONFIGURATION REQUISE (Tokens API)

### MCPs Necessitant Configuration
| MCP | Variable | Statut |
|-----|----------|--------|
| **figma** | FIGMA_ACCESS_TOKEN | A configurer |
| **supabase** | SUPABASE_ACCESS_TOKEN | A configurer |
| **e2b** | E2B_API_KEY | A configurer |
| **octomind** | OCTOMIND_API_KEY | A configurer |

### MCPs Fonctionnels
| MCP | Statut | Notes |
|-----|--------|-------|
| memory | OK | Graph 63 entites |
| postgres | OK | PostgreSQL 16.10 |
| notion | OK | Bot "claude crea" |
| puppeteer | OK | Navigation fonctionne |
| sequential-thinking | OK | Raisonnement actif |
| github | PARTIEL | Token present mais permissions limitees |

### MCPs A Installer
| MCP | Commande | Raison |
|-----|----------|--------|
| playwright | `npx playwright install` | Browsers manquants |

---

## 4. VERIFICATION RAPIDE

### Commande de Test Systeme
Au debut d'une session, pour verifier que tout fonctionne:

```bash
# 1. Verifier CLAUDE.md charge
# (automatique - visible dans system context)

# 2. Verifier MCP Memory
mcp__memory__search_nodes("ULTRA-CREATE")

# 3. Verifier fichiers accessibles
ls C:\Claude-Code-Creation\agents\

# 4. Verifier MCP operationnels
mcp__postgres__query("SELECT 1")
```

---

## 5. RESOLUTION PROBLEMES

### Si MCP Memory ne repond pas
```bash
# Redemarrer Claude Code
# Ou verifier ~/.claude.json pour configuration MCP
```

### Si fichiers non accessibles
```bash
# Verifier chemin existe
ls "C:\Claude-Code-Creation\"

# Verifier permissions
# (Claude Code a acces a C:\Users\arnau)
```

### Si GitHub ne fonctionne pas
```bash
# Token dans ~/.claude.json
# Verifier permissions du token (repo, read:org)
```

---

## 6. RESUME PERSISTANCE

| Element | Persistance | Methode |
|---------|-------------|---------|
| CLAUDE.md | PERMANENT | Fichier charge automatiquement |
| Agents/Knowledge/Templates | PERMANENT | Fichiers sur disque |
| MCP Memory (entities) | PERMANENT | SQLite persistant |
| MCP Servers | PERMANENT | Configuration ~/.claude.json |
| Conversation context | SESSION | Perdu entre sessions |
| Todo lists | SESSION | Perdu entre sessions |
| Variables locales | SESSION | Perdu entre sessions |

---

## 7. POUR GARANTIR ACCES TOTAL

### Option A: Debut de Session (Recommande)
Simplement dire: "Charge tout le systeme ULTRA-CREATE"

Je ferai automatiquement:
1. Lecture MCP Memory
2. Verification fichiers
3. Test MCPs critiques

### Option B: Commande Explicite
```
mcp__memory__read_graph()
```
Cela affiche toutes les 63 entites et leurs relations.

### Option C: Deja Fait Automatiquement
Comme CLAUDE.md est charge automatiquement, j'ai deja:
- Identite ULTRA-CREATE v13.0
- Matrice de decision complete
- Liste des 70+ agents
- 9 templates
- 9 modes
- Stack technique 2025

---

**Conclusion:** L'acces est garanti par conception. CLAUDE.md est toujours charge, MCP Memory est persistant, et les fichiers sont toujours accessibles.

La seule chose non persistante est le contexte de conversation lui-meme, qui est resume lors de depassement de limite.

---

**Date:** 2025-12-09
**Version:** ULTRA-CREATE v13.0
