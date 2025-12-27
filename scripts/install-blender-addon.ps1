# Install BlenderMCP Addon for Blender 5.0
$ErrorActionPreference = "Stop"

Write-Host "=== Installation BlenderMCP Addon ===" -ForegroundColor Cyan

# Blender 5.0 addon path
$AddonPath = "$env:APPDATA\Blender Foundation\Blender\5.0\scripts\addons\blender_mcp"

# Create directory
if (-not (Test-Path $AddonPath)) {
    New-Item -ItemType Directory -Path $AddonPath -Force | Out-Null
    Write-Host "Dossier cree: $AddonPath" -ForegroundColor Green
}

# Download addon from GitHub
$AddonUrl = "https://raw.githubusercontent.com/ahujasid/blender-mcp/main/addon.py"
$TargetFile = "$AddonPath\__init__.py"

Write-Host "Telechargement addon depuis GitHub..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $AddonUrl -OutFile $TargetFile -UseBasicParsing
    Write-Host "Addon telecharge: $TargetFile" -ForegroundColor Green
} catch {
    Write-Host "Erreur telechargement: $_" -ForegroundColor Red
    exit 1
}

# Verify file
if (Test-Path $TargetFile) {
    $Size = (Get-Item $TargetFile).Length
    Write-Host "Fichier OK: $Size bytes" -ForegroundColor Green
} else {
    Write-Host "Fichier non trouve apres telechargement" -ForegroundColor Red
    exit 1
}

# Install uv if needed (for blender-mcp server)
Write-Host ""
Write-Host "Verification uv (package manager)..." -ForegroundColor Yellow
$uvExists = Get-Command "uv" -ErrorAction SilentlyContinue
if (-not $uvExists) {
    Write-Host "Installation de uv..." -ForegroundColor Yellow
    try {
        irm https://astral.sh/uv/install.ps1 | iex
        Write-Host "uv installe" -ForegroundColor Green
    } catch {
        Write-Host "Erreur installation uv: $_" -ForegroundColor Red
    }
}

# Test blender-mcp
Write-Host ""
Write-Host "Test blender-mcp server..." -ForegroundColor Yellow
try {
    $result = & uvx blender-mcp --help 2>&1
    if ($LASTEXITCODE -eq 0 -or $result -match "blender") {
        Write-Host "blender-mcp server: OK" -ForegroundColor Green
    }
} catch {
    Write-Host "blender-mcp sera installe au premier usage" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Installation terminee ===" -ForegroundColor Green
Write-Host ""
Write-Host "ETAPES SUIVANTES dans Blender:" -ForegroundColor Cyan
Write-Host "1. Ouvrir Blender 5.0"
Write-Host "2. Edit > Preferences > Add-ons"
Write-Host "3. Rechercher 'BlenderMCP' et l'activer"
Write-Host "4. Panneau lateral (N) > Onglet 'BlenderMCP' > Start Server"
Write-Host ""
