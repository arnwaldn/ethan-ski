# ============================================================================
# ULTRA-CREATE v21.5 - 3D Tools Setup (Blender MCP + Unity MCP)
# ============================================================================

param(
    [switch]$BlenderOnly,
    [switch]$UnityOnly,
    [switch]$Check
)

$ErrorActionPreference = "Continue"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "HH:mm:ss"
    switch ($Level) {
        "INFO"    { Write-Host "[$Timestamp] $Message" -ForegroundColor Cyan }
        "SUCCESS" { Write-Host "[$Timestamp] $Message" -ForegroundColor Green }
        "WARNING" { Write-Host "[$Timestamp] $Message" -ForegroundColor Yellow }
        "ERROR"   { Write-Host "[$Timestamp] $Message" -ForegroundColor Red }
    }
}

function Get-BlenderPath {
    $Paths = @(
        "C:\Program Files\Blender Foundation\Blender 4.3\blender.exe",
        "C:\Program Files\Blender Foundation\Blender 4.2\blender.exe",
        "C:\Program Files\Blender Foundation\Blender 4.1\blender.exe",
        "C:\Program Files\Blender Foundation\Blender 4.0\blender.exe",
        "C:\Program Files\Blender Foundation\Blender\blender.exe"
    )
    foreach ($Path in $Paths) {
        if (Test-Path $Path) { return $Path }
    }
    return $null
}

function Get-BlenderAddonPath {
    $BlenderPath = Get-BlenderPath
    if (-not $BlenderPath) { return $null }

    $Version = [regex]::Match($BlenderPath, "Blender (\d+\.\d+)").Groups[1].Value
    if (-not $Version) { $Version = "4.2" }

    return "$env:APPDATA\Blender Foundation\Blender\$Version\scripts\addons"
}

# ============================================================================
# CHECK MODE
# ============================================================================
if ($Check) {
    Write-Host ""
    Write-Host "=== ULTRA-CREATE 3D Tools Status ===" -ForegroundColor Magenta
    Write-Host ""

    # Blender
    $BlenderPath = Get-BlenderPath
    if ($BlenderPath) {
        Write-Log "Blender: $BlenderPath" "SUCCESS"
    } else {
        Write-Log "Blender: Non installe" "ERROR"
    }

    # Blender Addon
    $AddonPath = Get-BlenderAddonPath
    if ($AddonPath -and (Test-Path "$AddonPath\blender_mcp")) {
        Write-Log "Blender MCP Addon: Installe" "SUCCESS"
    } else {
        Write-Log "Blender MCP Addon: Non installe" "WARNING"
    }

    # Blender MCP Server
    $BlenderMCP = & uvx blender-mcp --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Blender MCP Server: OK" "SUCCESS"
    } else {
        Write-Log "Blender MCP Server: Non installe (uvx blender-mcp)" "WARNING"
    }

    # Unity Hub
    $UnityHubPaths = @(
        "C:\Program Files\Unity Hub\Unity Hub.exe",
        "$env:LOCALAPPDATA\Programs\Unity Hub\Unity Hub.exe"
    )
    $UnityHubFound = $false
    foreach ($Path in $UnityHubPaths) {
        if (Test-Path $Path) {
            Write-Log "Unity Hub: $Path" "SUCCESS"
            $UnityHubFound = $true
            break
        }
    }
    if (-not $UnityHubFound) {
        Write-Log "Unity Hub: Non installe" "WARNING"
    }

    # Unity MCP
    $UnityMCP = npm list -g mcp-unity 2>$null
    if ($UnityMCP -match "mcp-unity") {
        Write-Log "Unity MCP Server: OK" "SUCCESS"
    } else {
        Write-Log "Unity MCP Server: Non installe (npm i -g mcp-unity)" "WARNING"
    }

    Write-Host ""
    exit
}

# ============================================================================
# BLENDER MCP SETUP
# ============================================================================
if (-not $UnityOnly) {
    Write-Host ""
    Write-Host "=== BLENDER MCP SETUP ===" -ForegroundColor Magenta
    Write-Host ""

    # 1. Check Blender installation
    $BlenderPath = Get-BlenderPath
    if (-not $BlenderPath) {
        Write-Log "Blender non trouve. Installation via winget..." "WARNING"
        winget install --id BlenderFoundation.Blender --silent --accept-source-agreements
        $BlenderPath = Get-BlenderPath
    }

    if ($BlenderPath) {
        Write-Log "Blender trouve: $BlenderPath" "SUCCESS"
    } else {
        Write-Log "Impossible d'installer Blender. Installez manuellement." "ERROR"
        exit 1
    }

    # 2. Install Blender MCP Server
    Write-Log "Installation Blender MCP Server..."
    try {
        # Ensure uv is installed
        if (-not (Get-Command "uv" -ErrorAction SilentlyContinue)) {
            Write-Log "Installation de uv (package manager)..."
            irm https://astral.sh/uv/install.ps1 | iex
        }

        # Test blender-mcp
        $TestResult = & uvx blender-mcp --help 2>&1
        Write-Log "Blender MCP Server: OK" "SUCCESS"
    } catch {
        Write-Log "Erreur installation Blender MCP: $_" "ERROR"
    }

    # 3. Download and install Blender addon
    Write-Log "Installation addon Blender..."
    $AddonPath = Get-BlenderAddonPath

    if ($AddonPath) {
        # Create addons directory if not exists
        if (-not (Test-Path $AddonPath)) {
            New-Item -ItemType Directory -Path $AddonPath -Force | Out-Null
        }

        # Download addon from GitHub
        $AddonUrl = "https://raw.githubusercontent.com/ahujasid/blender-mcp/main/addon.py"
        $AddonDir = "$AddonPath\blender_mcp"

        if (-not (Test-Path $AddonDir)) {
            New-Item -ItemType Directory -Path $AddonDir -Force | Out-Null
        }

        try {
            Invoke-WebRequest -Uri $AddonUrl -OutFile "$AddonDir\__init__.py"
            Write-Log "Addon telecharge: $AddonDir" "SUCCESS"
            Write-Log "IMPORTANT: Activez l'addon dans Blender > Preferences > Add-ons > 'BlenderMCP'" "WARNING"
        } catch {
            Write-Log "Erreur telechargement addon: $_" "ERROR"
            Write-Log "Installez manuellement depuis: https://github.com/ahujasid/blender-mcp" "WARNING"
        }
    }

    Write-Host ""
    Write-Log "=== Instructions Blender ===" "INFO"
    Write-Host "1. Ouvrir Blender"
    Write-Host "2. Edit > Preferences > Add-ons"
    Write-Host "3. Rechercher 'BlenderMCP'"
    Write-Host "4. Cocher pour activer"
    Write-Host "5. Dans le panneau lateral (N), onglet 'BlenderMCP' > Start Server"
    Write-Host ""
}

# ============================================================================
# UNITY MCP SETUP
# ============================================================================
if (-not $BlenderOnly) {
    Write-Host ""
    Write-Host "=== UNITY MCP SETUP ===" -ForegroundColor Magenta
    Write-Host ""

    # 1. Check Unity Hub
    $UnityHubPaths = @(
        "C:\Program Files\Unity Hub\Unity Hub.exe",
        "$env:LOCALAPPDATA\Programs\Unity Hub\Unity Hub.exe"
    )
    $UnityHubFound = $false
    foreach ($Path in $UnityHubPaths) {
        if (Test-Path $Path) {
            Write-Log "Unity Hub trouve: $Path" "SUCCESS"
            $UnityHubFound = $true
            break
        }
    }

    if (-not $UnityHubFound) {
        Write-Log "Unity Hub non trouve. Installation recommandee depuis unity.com" "WARNING"
    }

    # 2. Install Unity MCP Server
    Write-Log "Installation Unity MCP Server..."
    try {
        npm install -g mcp-unity
        Write-Log "Unity MCP Server: OK" "SUCCESS"
    } catch {
        Write-Log "Erreur: $_" "ERROR"
    }

    Write-Host ""
    Write-Log "=== Instructions Unity ===" "INFO"
    Write-Host "1. Ouvrir Unity Hub"
    Write-Host "2. Installer Unity 2022.3 LTS ou plus recent"
    Write-Host "3. Creer ou ouvrir un projet"
    Write-Host "4. Window > Package Manager"
    Write-Host "5. + > Add package from git URL:"
    Write-Host "   https://github.com/CoderGamester/mcp-unity.git"
    Write-Host "6. Le serveur MCP demarre automatiquement"
    Write-Host ""
}

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host ""
Write-Host "=== SETUP COMPLETE ===" -ForegroundColor Green
Write-Host ""
Write-Host "Pour verifier l'installation:"
Write-Host "  .\scripts\setup-3d-tools.ps1 -Check"
Write-Host ""
Write-Host "Utilisation:"
Write-Host "  /3d asset 'medieval sword'"
Write-Host "  /3d character 'robot warrior'"
Write-Host "  /3d scene 'fantasy dungeon'"
Write-Host "  /game 3d 'RPG adventure'"
Write-Host ""
