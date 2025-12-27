<#
.SYNOPSIS
    Verifie le statut de Docker MCP Toolkit et Model Runner
.DESCRIPTION
    Script de diagnostic pour Docker MCP integration avec ULTRA-CREATE v19.1
.EXAMPLE
    .\check-docker-mcp.ps1
    .\check-docker-mcp.ps1 -EnableModelRunner
#>

param(
    [switch]$EnableModelRunner,
    [switch]$ListModels
)

$ErrorActionPreference = "Continue"

Write-Host "`n=== ULTRA-CREATE v19.1 - Docker MCP Check ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check Docker Desktop
Write-Host "[1/5] Docker Desktop..." -ForegroundColor Yellow
$dockerVersion = docker --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK: $dockerVersion" -ForegroundColor Green
} else {
    Write-Host "  ERREUR: Docker Desktop non installe ou non demarre" -ForegroundColor Red
    exit 1
}

# 2. Check Docker running
Write-Host "[2/5] Docker service..." -ForegroundColor Yellow
$dockerInfo = docker info 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK: Docker service actif" -ForegroundColor Green
} else {
    Write-Host "  ERREUR: Docker service non actif - demarrer Docker Desktop" -ForegroundColor Red
    exit 1
}

# 3. Check MCP Gateway
Write-Host "[3/5] MCP Gateway..." -ForegroundColor Yellow
$mcpHelp = docker mcp --help 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK: Docker MCP disponible" -ForegroundColor Green
    Write-Host "  Commandes: docker mcp gateway run" -ForegroundColor Gray
} else {
    Write-Host "  INFO: MCP Toolkit non active" -ForegroundColor Yellow
    Write-Host "  Pour activer: Docker Desktop > Settings > Beta features > MCP Toolkit" -ForegroundColor Gray
}

# 4. Check Model Runner
Write-Host "[4/5] Model Runner..." -ForegroundColor Yellow
$modelHelp = docker model --help 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK: Model Runner disponible" -ForegroundColor Green

    if ($ListModels) {
        Write-Host "`n  Modeles disponibles:" -ForegroundColor Cyan
        docker model list 2>$null | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
    }
} else {
    Write-Host "  INFO: Model Runner non active" -ForegroundColor Yellow
    Write-Host "  Pour activer: docker desktop enable model-runner" -ForegroundColor Gray

    if ($EnableModelRunner) {
        Write-Host "`n  Activation de Model Runner..." -ForegroundColor Yellow
        docker desktop enable model-runner 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  OK: Model Runner active!" -ForegroundColor Green
        } else {
            Write-Host "  ERREUR: Impossible d'activer Model Runner" -ForegroundColor Red
        }
    }
}

# 5. Check .mcp.json config
Write-Host "[5/5] Configuration .mcp.json..." -ForegroundColor Yellow
$mcpConfig = "C:\Claude-Code-Creation\.mcp.json"
if (Test-Path $mcpConfig) {
    $config = Get-Content $mcpConfig | ConvertFrom-Json
    if ($config.mcpServers.'docker-mcp') {
        Write-Host "  OK: docker-mcp configure dans .mcp.json" -ForegroundColor Green
    } else {
        Write-Host "  ATTENTION: docker-mcp non configure" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ERREUR: .mcp.json non trouve" -ForegroundColor Red
}

# Summary
Write-Host "`n=== Resume ===" -ForegroundColor Cyan
Write-Host "Docker Desktop: OK" -ForegroundColor Green
Write-Host "MCP Toolkit: Activer dans Settings > Beta features" -ForegroundColor $(if ($mcpHelp) { "Green" } else { "Yellow" })
Write-Host "Model Runner: $( if ($modelHelp) { 'OK' } else { 'docker desktop enable model-runner' })" -ForegroundColor $(if ($modelHelp) { "Green" } else { "Yellow" })
Write-Host ""

Write-Host "Ressources:" -ForegroundColor Gray
Write-Host "  - MCP Catalog: https://hub.docker.com/mcp" -ForegroundColor Gray
Write-Host "  - Documentation: https://docs.docker.com/ai/mcp-catalog-and-toolkit/" -ForegroundColor Gray
Write-Host ""
