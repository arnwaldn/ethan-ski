# MCP Servers Recommandés pour ULTRA-CREATE

## Serveurs Actuellement Connectés

| Serveur | Status | Usage |
|---------|--------|-------|
| filesystem | ✅ Actif | Manipulation fichiers |
| memory | ✅ Actif | Mémoire persistante |
| git | ✅ Actif | Opérations Git |
| github | ✅ Actif | API GitHub |
| sequential-thinking | ✅ Actif | Raisonnement structuré |
| e2b | ⚠️ API Key requise | Sandbox Python |
| fetch | ✅ Actif | Web fetching |
| vscode | ❌ Extension requise | Contrôle VS Code |

## Serveurs Recommandés à Ajouter

### Haute Priorité

#### 1. Puppeteer MCP
**Usage:** Automation navigateur, tests E2E, screenshots
```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-puppeteer"]
    }
  }
}
```
**Cas d'usage:**
- Générer des screenshots de preview
- Tests E2E automatisés
- Scraping pour recherche

#### 2. Playwright MCP
**Usage:** Tests E2E plus robustes, multi-navigateurs
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-playwright"]
    }
  }
}
```
**Avantages:**
- Plus rapide que Puppeteer
- Meilleure gestion des selecteurs
- Multi-navigateurs (Chrome, Firefox, Safari)

#### 3. Figma MCP (Design-to-Code)
**Usage:** Convertir designs Figma en code
```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your-token"
      }
    }
  }
}
```
**Capacités:**
- Lire les designs Figma
- Extraire les styles (couleurs, typo, spacing)
- Générer du code React/Tailwind

### Moyenne Priorité

#### 4. Notion MCP
**Usage:** Documentation automatique
```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-notion"],
      "env": {
        "NOTION_API_KEY": "your-key"
      }
    }
  }
}
```
**Cas d'usage:**
- Créer documentation projet automatiquement
- Sync des tâches avec Notion
- Générer des specs techniques

#### 5. Supabase MCP
**Usage:** Gestion database directe
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "your-url",
        "SUPABASE_SERVICE_KEY": "your-key"
      }
    }
  }
}
```
**Capacités:**
- Créer/modifier tables
- Exécuter des migrations
- Gérer les policies RLS

#### 6. Postgres MCP
**Usage:** Requêtes SQL directes
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://..."
      }
    }
  }
}
```

### Basse Priorité (Nice to Have)

#### 7. Slack MCP
**Usage:** Notifications de progression
```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-slack"],
      "env": {
        "SLACK_TOKEN": "your-token"
      }
    }
  }
}
```

#### 8. n8n MCP
**Usage:** Workflows d'automatisation
```json
{
  "mcpServers": {
    "n8n": {
      "command": "npx",
      "args": ["-y", "n8n-mcp"]
    }
  }
}
```

#### 9. Sentry MCP
**Usage:** Monitoring d'erreurs
```json
{
  "mcpServers": {
    "sentry": {
      "command": "npx",
      "args": ["-y", "@sentry/mcp-server"],
      "env": {
        "SENTRY_DSN": "your-dsn"
      }
    }
  }
}
```

## Installation Complète Recommandée

Ajouter dans `~/.claude/settings.json` ou `.claude/settings.json` du projet :

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-filesystem", "/"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-memory"]
    },
    "git": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-git"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-puppeteer"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-sequential-thinking"]
    }
  }
}
```

## Vérification des MCP

Commande pour tester les MCP actifs :
```bash
claude --mcp-debug
```

## Sources

- [Top 10 MCP Servers for Claude Code](https://apidog.com/blog/top-10-mcp-servers-for-claude-code/)
- [Best MCP Servers - MCPcat](https://mcpcat.io/guides/best-mcp-servers-for-claude-code/)
- [Docker MCP Toolkit](https://www.docker.com/blog/top-mcp-servers-2025/)
- [The 22 Best MCP Servers 2025](https://desktopcommander.app/blog/2025/11/25/best-mcp-servers/)
