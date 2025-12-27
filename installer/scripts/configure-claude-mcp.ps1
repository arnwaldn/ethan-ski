# ============================================================================
# ULTRA-CREATE v21.4 - Claude MCP Configuration
# ============================================================================
# Configuration des 48 MCP servers pour Claude Desktop/Code
# ============================================================================

param(
    [string]$InstallPath = "C:\Claude-Code-Creation"
)

$ErrorActionPreference = "Continue"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    switch ($Level) {
        "INFO"    { Write-Host $LogMessage -ForegroundColor Cyan }
        "SUCCESS" { Write-Host $LogMessage -ForegroundColor Green }
        "WARNING" { Write-Host $LogMessage -ForegroundColor Yellow }
        "ERROR"   { Write-Host $LogMessage -ForegroundColor Red }
        default   { Write-Host $LogMessage }
    }
}

# ============================================================================
# CHEMINS
# ============================================================================

$ClaudeDesktopConfigPath = "$env:APPDATA\Claude\claude_desktop_config.json"
$ClaudeCodeConfigPath = "$env:USERPROFILE\.claude.json"
$ClaudeDir = "$env:USERPROFILE\.claude"
$ConfigTemplate = "$InstallPath\installer\config\claude_desktop_config.json"

# ============================================================================
# CREATION DOSSIERS
# ============================================================================

Write-Log "Creation des dossiers de configuration..."

# Dossier Claude Desktop
$ClaudeDesktopDir = Split-Path $ClaudeDesktopConfigPath -Parent
if (-not (Test-Path $ClaudeDesktopDir)) {
    New-Item -ItemType Directory -Path $ClaudeDesktopDir -Force | Out-Null
    Write-Log "Dossier cree: $ClaudeDesktopDir" "SUCCESS"
}

# Dossier .claude pour CLAUDE.md
if (-not (Test-Path $ClaudeDir)) {
    New-Item -ItemType Directory -Path $ClaudeDir -Force | Out-Null
    Write-Log "Dossier cree: $ClaudeDir" "SUCCESS"
}

# ============================================================================
# COPIE CLAUDE.md
# ============================================================================

Write-Log "Configuration de CLAUDE.md..."

$ClaudeMdSource = "$InstallPath\.claude\CLAUDE.md"
$ClaudeMdDest = "$ClaudeDir\CLAUDE.md"

if (Test-Path $ClaudeMdSource) {
    Copy-Item $ClaudeMdSource $ClaudeMdDest -Force
    Write-Log "CLAUDE.md copie vers: $ClaudeMdDest" "SUCCESS"
} else {
    Write-Log "CLAUDE.md source non trouve: $ClaudeMdSource" "WARNING"
}

# ============================================================================
# CONFIGURATION MCP
# ============================================================================

Write-Log "Configuration des serveurs MCP..."

# Lire le template si existe
if (Test-Path $ConfigTemplate) {
    Write-Log "Template MCP trouve, utilisation..."
    Copy-Item $ConfigTemplate $ClaudeDesktopConfigPath -Force
    Write-Log "Configuration MCP copiee" "SUCCESS"
} else {
    Write-Log "Creation configuration MCP par defaut..."

    # Configuration MCP de base
    $MCPConfig = @{
        mcpServers = @{
            # Context7 - Documentation
            "context7" = @{
                command = "npx"
                args = @("-y", "@upstash/context7-mcp")
            }

            # shadcn - Composants UI
            "shadcn" = @{
                command = "npx"
                args = @("-y", "@anthropics/shadcn-mcp")
            }

            # Memory - Graphe connaissances
            "memory" = @{
                command = "npx"
                args = @("-y", "@modelcontextprotocol/server-memory")
            }

            # Sequential Thinking
            "sequential-thinking" = @{
                command = "npx"
                args = @("-y", "@modelcontextprotocol/server-sequential-thinking")
            }

            # Git
            "git" = @{
                command = "npx"
                args = @("-y", "@modelcontextprotocol/server-git", "--repository", $InstallPath)
            }

            # GitHub
            "github" = @{
                command = "npx"
                args = @("-y", "@modelcontextprotocol/server-github")
                env = @{
                    GITHUB_PERSONAL_ACCESS_TOKEN = "YOUR_GITHUB_TOKEN"
                }
            }

            # Filesystem
            "filesystem" = @{
                command = "npx"
                args = @("-y", "@anthropics/mcp-server-filesystem", $InstallPath, $env:USERPROFILE)
            }

            # Fetch
            "fetch" = @{
                command = "npx"
                args = @("-y", "@anthropics/mcp-server-fetch")
            }

            # Puppeteer
            "puppeteer" = @{
                command = "npx"
                args = @("-y", "@anthropics/mcp-server-puppeteer")
            }

            # Playwright
            "playwright" = @{
                command = "npx"
                args = @("-y", "@anthropics/mcp-server-playwright")
            }

            # Postgres
            "postgres" = @{
                command = "npx"
                args = @("-y", "@modelcontextprotocol/server-postgres")
                env = @{
                    POSTGRES_CONNECTION_STRING = "postgresql://localhost:5432/ultradev"
                }
            }

            # E2B Code Execution
            "e2b" = @{
                command = "npx"
                args = @("-y", "@anthropics/mcp-server-e2b")
                env = @{
                    E2B_API_KEY = "YOUR_E2B_API_KEY"
                }
            }

            # Hindsight Memory
            "hindsight" = @{
                command = "npx"
                args = @("-y", "hindsight-mcp")
                env = @{
                    HINDSIGHT_API_URL = "http://localhost:8888"
                }
            }

            # Firecrawl
            "firecrawl" = @{
                command = "npx"
                args = @("-y", "@anthropics/mcp-server-firecrawl")
                env = @{
                    FIRECRAWL_API_KEY = "YOUR_FIRECRAWL_API_KEY"
                }
            }

            # Exa Search
            "exa" = @{
                command = "npx"
                args = @("-y", "@anthropics/mcp-server-exa")
                env = @{
                    EXA_API_KEY = "YOUR_EXA_API_KEY"
                }
            }

            # Supabase
            "supabase" = @{
                command = "npx"
                args = @("-y", "@supabase/mcp-server-supabase")
                env = @{
                    SUPABASE_ACCESS_TOKEN = "YOUR_SUPABASE_TOKEN"
                }
            }

            # Notion
            "notion" = @{
                command = "npx"
                args = @("-y", "@notionhq/mcp-server-notion")
                env = @{
                    NOTION_API_KEY = "YOUR_NOTION_API_KEY"
                }
            }

            # Figma
            "figma" = @{
                command = "npx"
                args = @("-y", "@anthropics/mcp-server-figma")
                env = @{
                    FIGMA_ACCESS_TOKEN = "YOUR_FIGMA_TOKEN"
                }
            }

            # Mermaid Diagrams
            "mermaid" = @{
                command = "npx"
                args = @("-y", "@anthropics/mcp-server-mermaid")
            }

            # Desktop Commander
            "desktop-commander" = @{
                command = "npx"
                args = @("-y", "desktop-commander")
            }

            # Desktop Automation
            "desktop-automation" = @{
                command = "npx"
                args = @("-y", "@anthropics/mcp-server-desktop-automation")
            }
        }
    }

    # Sauvegarder
    $MCPConfig | ConvertTo-Json -Depth 10 | Set-Content $ClaudeDesktopConfigPath -Encoding UTF8
    Write-Log "Configuration MCP creee: $ClaudeDesktopConfigPath" "SUCCESS"
}

# ============================================================================
# CONFIGURATION VARIABLES ENVIRONNEMENT
# ============================================================================

Write-Log ""
Write-Log "Configuration des variables d'environnement..."

# Creer fichier .env template
$EnvFile = "$InstallPath\.env"
$EnvTemplate = @"
# ULTRA-CREATE v21.4 - Configuration API Keys
# Remplissez ces valeurs avec vos propres cles API

# GitHub (requis pour /research, MCP GitHub)
GITHUB_PERSONAL_ACCESS_TOKEN=

# Anthropic (requis pour Claude Code CLI)
ANTHROPIC_API_KEY=

# Supabase (pour projets backend)
SUPABASE_ACCESS_TOKEN=
SUPABASE_PROJECT_URL=
SUPABASE_ANON_KEY=

# E2B Code Execution
E2B_API_KEY=

# Firecrawl (web scraping)
FIRECRAWL_API_KEY=

# Exa Search
EXA_API_KEY=

# Notion
NOTION_API_KEY=

# Figma
FIGMA_ACCESS_TOKEN=

# OpenAI (optionnel)
OPENAI_API_KEY=

# Hindsight (local)
HINDSIGHT_API_URL=http://localhost:8888

# Installation Path
ULTRA_CREATE_PATH=$InstallPath
"@

Set-Content $EnvFile $EnvTemplate -Encoding UTF8
Write-Log "Fichier .env template cree: $EnvFile" "SUCCESS"

# ============================================================================
# INSTRUCTIONS
# ============================================================================

Write-Log ""
Write-Log "=== CONFIGURATION MCP TERMINEE ===" "INFO"
Write-Log ""
Write-Log "IMPORTANT - Actions requises:" "WARNING"
Write-Log "1. Editez le fichier: $EnvFile"
Write-Log "2. Ajoutez vos cles API"
Write-Log "3. Relancez Claude Desktop/Code"
Write-Log ""
Write-Log "Pour obtenir les cles API:"
Write-Log "  - GitHub: https://github.com/settings/tokens"
Write-Log "  - Anthropic: https://console.anthropic.com"
Write-Log "  - Supabase: https://supabase.com/dashboard"
Write-Log "  - E2B: https://e2b.dev"
Write-Log "  - Firecrawl: https://firecrawl.dev"
Write-Log "  - Exa: https://exa.ai"
Write-Log ""
Write-Log "Configuration MCP: Terminee" "SUCCESS"
