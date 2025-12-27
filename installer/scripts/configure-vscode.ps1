# ============================================================================
# ULTRA-CREATE v21.4 - VS Code Configuration
# ============================================================================
# Installation automatique des extensions VS Code
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

function Test-CommandExists {
    param([string]$Command)
    return (Get-Command $Command -ErrorAction SilentlyContinue) -ne $null
}

# ============================================================================
# EXTENSIONS VS CODE
# ============================================================================

$Extensions = @(
    # Essentiels
    @{ Id = "dbaeumer.vscode-eslint"; Name = "ESLint" }
    @{ Id = "esbenp.prettier-vscode"; Name = "Prettier" }
    @{ Id = "eamodio.gitlens"; Name = "GitLens" }

    # TypeScript/JavaScript
    @{ Id = "ms-vscode.vscode-typescript-next"; Name = "TypeScript Nightly" }

    # Tailwind CSS
    @{ Id = "bradlc.vscode-tailwindcss"; Name = "Tailwind CSS IntelliSense" }

    # Prisma
    @{ Id = "Prisma.prisma"; Name = "Prisma" }

    # React/Next.js
    @{ Id = "dsznajder.es7-react-js-snippets"; Name = "ES7 React Snippets" }

    # Python
    @{ Id = "ms-python.python"; Name = "Python" }
    @{ Id = "ms-python.vscode-pylance"; Name = "Pylance" }

    # Docker
    @{ Id = "ms-azuretools.vscode-docker"; Name = "Docker" }

    # Markdown
    @{ Id = "yzhang.markdown-all-in-one"; Name = "Markdown All in One" }

    # Git
    @{ Id = "mhutchie.git-graph"; Name = "Git Graph" }

    # Icons
    @{ Id = "vscode-icons-team.vscode-icons"; Name = "VSCode Icons" }

    # Error Lens (voir erreurs inline)
    @{ Id = "usernamehw.errorlens"; Name = "Error Lens" }

    # Auto Rename Tag
    @{ Id = "formulahendry.auto-rename-tag"; Name = "Auto Rename Tag" }

    # Path Intellisense
    @{ Id = "christian-kohler.path-intellisense"; Name = "Path Intellisense" }

    # Import Cost
    @{ Id = "wix.vscode-import-cost"; Name = "Import Cost" }

    # Rest Client (tester APIs)
    @{ Id = "humao.rest-client"; Name = "REST Client" }

    # Thunder Client (alternative Postman)
    @{ Id = "rangav.vscode-thunder-client"; Name = "Thunder Client" }

    # Playwright
    @{ Id = "ms-playwright.playwright"; Name = "Playwright Test" }

    # MDX
    @{ Id = "unifiedjs.vscode-mdx"; Name = "MDX" }

    # Rust
    @{ Id = "rust-lang.rust-analyzer"; Name = "Rust Analyzer" }
)

# ============================================================================
# INSTALLATION DES EXTENSIONS
# ============================================================================

if (-not (Test-CommandExists "code")) {
    Write-Log "VS Code non trouve. Extensions non installees." "WARNING"
    exit 0
}

Write-Log "Installation des extensions VS Code..."
Write-Log "Extensions a installer: $($Extensions.Count)"

$Installed = 0
$Failed = 0

foreach ($Ext in $Extensions) {
    Write-Log "Installation: $($Ext.Name)..."
    try {
        $Result = code --install-extension $Ext.Id --force 2>&1
        if ($LASTEXITCODE -eq 0 -or $Result -match "already installed") {
            Write-Log "$($Ext.Name): OK" "SUCCESS"
            $Installed++
        } else {
            Write-Log "$($Ext.Name): Echec" "WARNING"
            $Failed++
        }
    } catch {
        Write-Log "$($Ext.Name): Erreur - $_" "ERROR"
        $Failed++
    }
}

# ============================================================================
# CONFIGURATION VS CODE SETTINGS
# ============================================================================

Write-Log ""
Write-Log "Configuration des parametres VS Code..."

$VSCodeSettingsPath = "$env:APPDATA\Code\User\settings.json"
$VSCodeSettingsDir = Split-Path $VSCodeSettingsPath -Parent

# Creer le dossier si necessaire
if (-not (Test-Path $VSCodeSettingsDir)) {
    New-Item -ItemType Directory -Path $VSCodeSettingsDir -Force | Out-Null
}

# Parametres recommandes pour ULTRA-CREATE
$Settings = @{
    "editor.formatOnSave" = $true
    "editor.defaultFormatter" = "esbenp.prettier-vscode"
    "editor.tabSize" = 2
    "editor.wordWrap" = "on"
    "editor.minimap.enabled" = $false
    "editor.bracketPairColorization.enabled" = $true

    "typescript.updateImportsOnFileMove.enabled" = "always"
    "javascript.updateImportsOnFileMove.enabled" = "always"

    "tailwindCSS.experimental.classRegex" = @(
        @("cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"),
        @("cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]")
    )

    "files.associations" = @{
        "*.css" = "tailwindcss"
    }

    "emmet.includeLanguages" = @{
        "javascript" = "javascriptreact"
        "typescript" = "typescriptreact"
    }

    "[typescript]" = @{
        "editor.defaultFormatter" = "esbenp.prettier-vscode"
    }

    "[typescriptreact]" = @{
        "editor.defaultFormatter" = "esbenp.prettier-vscode"
    }

    "[javascript]" = @{
        "editor.defaultFormatter" = "esbenp.prettier-vscode"
    }

    "[json]" = @{
        "editor.defaultFormatter" = "esbenp.prettier-vscode"
    }

    "git.autofetch" = $true
    "git.confirmSync" = $false

    "workbench.iconTheme" = "vscode-icons"
    "workbench.startupEditor" = "none"

    "terminal.integrated.defaultProfile.windows" = "PowerShell"
}

# Fusionner avec parametres existants
if (Test-Path $VSCodeSettingsPath) {
    try {
        $ExistingSettings = Get-Content $VSCodeSettingsPath -Raw | ConvertFrom-Json -AsHashtable
        foreach ($Key in $Settings.Keys) {
            $ExistingSettings[$Key] = $Settings[$Key]
        }
        $Settings = $ExistingSettings
    } catch {
        Write-Log "Impossible de lire settings existants, creation nouveau fichier" "WARNING"
    }
}

# Sauvegarder
$Settings | ConvertTo-Json -Depth 10 | Set-Content $VSCodeSettingsPath -Encoding UTF8

Write-Log "Parametres VS Code configures" "SUCCESS"

# ============================================================================
# RESUME
# ============================================================================

Write-Log ""
Write-Log "=== RESUME CONFIGURATION VS CODE ===" "INFO"
Write-Log "Extensions installees: $Installed"
Write-Log "Extensions en echec: $Failed"
Write-Log "Parametres: $VSCodeSettingsPath"
Write-Log "Configuration VS Code: Terminee" "SUCCESS"
