# ULTRA-CREATE v21.5 - Verification complete 3D Tools
$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Magenta
Write-Host "  ULTRA-CREATE v21.5 - 3D Tools Check   " -ForegroundColor Magenta
Write-Host "=========================================" -ForegroundColor Magenta
Write-Host ""

$AllOK = $true

# ============================================
# 1. BLENDER
# ============================================
Write-Host "=== BLENDER ===" -ForegroundColor Cyan

# Blender executable
$BlenderExe = "C:\Program Files\Blender Foundation\Blender 5.0\blender.exe"
if (Test-Path $BlenderExe) {
    Write-Host "[OK] Blender 5.0 installe" -ForegroundColor Green
} else {
    Write-Host "[X] Blender 5.0 non trouve" -ForegroundColor Red
    $AllOK = $false
}

# Blender addon
$AddonPath = "$env:APPDATA\Blender Foundation\Blender\5.0\scripts\addons\blender_mcp\__init__.py"
if (Test-Path $AddonPath) {
    $Size = (Get-Item $AddonPath).Length
    Write-Host "[OK] BlenderMCP addon installe ($Size bytes)" -ForegroundColor Green
} else {
    Write-Host "[X] BlenderMCP addon non trouve" -ForegroundColor Red
    $AllOK = $false
}

# Blender preferences (addon enabled)
$PrefPath = "$env:APPDATA\Blender Foundation\Blender\5.0\config\userpref.blend"
if (Test-Path $PrefPath) {
    Write-Host "[OK] Preferences Blender sauvegardees" -ForegroundColor Green
} else {
    Write-Host "[?] Preferences Blender non trouvees" -ForegroundColor Yellow
}

# UV package manager
$uvExists = Get-Command "uv" -ErrorAction SilentlyContinue
if ($uvExists) {
    Write-Host "[OK] uv package manager installe" -ForegroundColor Green
} else {
    Write-Host "[?] uv non installe (sera installe au premier usage)" -ForegroundColor Yellow
}

# Test file created
$TestFile = "C:\Claude-Code-Creation\exports\blender_mcp_test.blend"
if (Test-Path $TestFile) {
    Write-Host "[OK] Fichier test Blender existe" -ForegroundColor Green
} else {
    Write-Host "[?] Fichier test non trouve" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# 2. UNITY
# ============================================
Write-Host "=== UNITY ===" -ForegroundColor Cyan

# Unity Hub
$UnityHubPaths = @(
    "C:\Program Files\Unity Hub\Unity Hub.exe",
    "$env:LOCALAPPDATA\Programs\Unity Hub\Unity Hub.exe"
)
$UnityHubFound = $false
foreach ($p in $UnityHubPaths) {
    if (Test-Path $p) {
        Write-Host "[OK] Unity Hub installe" -ForegroundColor Green
        $UnityHubFound = $true
        break
    }
}
if (-not $UnityHubFound) {
    Write-Host "[X] Unity Hub non trouve" -ForegroundColor Red
    $AllOK = $false
}

# Unity Editor
$EditorPath = "C:\Program Files\Unity\Hub\Editor"
if (Test-Path $EditorPath) {
    $Editors = Get-ChildItem $EditorPath -Directory
    foreach ($e in $Editors) {
        Write-Host "[OK] Unity Editor: $($e.Name)" -ForegroundColor Green
    }
} else {
    Write-Host "[X] Aucun Unity Editor installe" -ForegroundColor Red
    $AllOK = $false
}

# Unity project with MCP
$ProjectPath = "C:\Users\arnau\Setup Guide In-Editor Tutorial"
$ManifestPath = "$ProjectPath\Packages\manifest.json"
if (Test-Path $ManifestPath) {
    $Manifest = Get-Content $ManifestPath -Raw
    if ($Manifest -match "mcp-unity") {
        Write-Host "[OK] Unity MCP package configure dans projet" -ForegroundColor Green
    } else {
        Write-Host "[X] Unity MCP package non trouve dans manifest" -ForegroundColor Red
        $AllOK = $false
    }
} else {
    Write-Host "[?] Projet Unity non trouve" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# 3. MCP CONFIGURATION
# ============================================
Write-Host "=== MCP CONFIGURATION ===" -ForegroundColor Cyan

$McpConfig = "C:\Claude-Code-Creation\.mcp.json"
if (Test-Path $McpConfig) {
    $Config = Get-Content $McpConfig -Raw

    if ($Config -match '"blender"') {
        Write-Host "[OK] Blender MCP configure dans .mcp.json" -ForegroundColor Green
    } else {
        Write-Host "[X] Blender MCP non configure" -ForegroundColor Red
        $AllOK = $false
    }

    if ($Config -match '"unity"') {
        Write-Host "[OK] Unity MCP configure dans .mcp.json" -ForegroundColor Green
    } else {
        Write-Host "[X] Unity MCP non configure" -ForegroundColor Red
        $AllOK = $false
    }
} else {
    Write-Host "[X] .mcp.json non trouve" -ForegroundColor Red
    $AllOK = $false
}

Write-Host ""

# ============================================
# 4. ULTRA-CREATE FILES
# ============================================
Write-Host "=== ULTRA-CREATE v21.5 FILES ===" -ForegroundColor Cyan

$Files = @{
    "CLAUDE.md" = "C:\Claude-Code-Creation\CLAUDE.md"
    "Agent 3D Artist" = "C:\Claude-Code-Creation\agents\visual\3d-artist.md"
    "Command /3d" = "C:\Claude-Code-Creation\commands\3d.md"
    "Slash command /3d" = "C:\Claude-Code-Creation\.claude\commands\3d.md"
    "Game Architect (updated)" = "C:\Claude-Code-Creation\agents\game\game-architect.md"
    "Setup script" = "C:\Claude-Code-Creation\scripts\setup-3d-tools.ps1"
}

foreach ($Name in $Files.Keys) {
    $Path = $Files[$Name]
    if (Test-Path $Path) {
        Write-Host "[OK] $Name" -ForegroundColor Green
    } else {
        Write-Host "[X] $Name manquant" -ForegroundColor Red
        $AllOK = $false
    }
}

# Check CLAUDE.md version
$ClaudeMd = Get-Content "C:\Claude-Code-Creation\CLAUDE.md" -Raw -ErrorAction SilentlyContinue
if ($ClaudeMd -match "v21\.5") {
    Write-Host "[OK] CLAUDE.md version 21.5" -ForegroundColor Green
} else {
    Write-Host "[?] CLAUDE.md version non 21.5" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# 5. SUMMARY
# ============================================
Write-Host "=========================================" -ForegroundColor Magenta
if ($AllOK) {
    Write-Host "  STATUS: TOUT EST OK !                 " -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Pret a utiliser:" -ForegroundColor Cyan
    Write-Host "  /3d asset 'medieval sword'"
    Write-Host "  /3d character 'robot warrior'"
    Write-Host "  /game 3d 'RPG fantasy'"
    Write-Host ""
    Write-Host "Note: Pour utiliser Blender MCP en temps reel:" -ForegroundColor Yellow
    Write-Host "  1. Ouvrir Blender 5.0"
    Write-Host "  2. Panneau N > BlenderMCP > Start Server"
} else {
    Write-Host "  STATUS: PROBLEMES DETECTES            " -ForegroundColor Red
    Write-Host "=========================================" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Executez: .\scripts\setup-3d-tools.ps1" -ForegroundColor Yellow
}
Write-Host ""
