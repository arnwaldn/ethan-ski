# ============================================================================
# ULTRA-CREATE v21.4 - Hindsight Setup
# ============================================================================
# Configuration de Hindsight (memoire persistante via Docker)
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

function Test-DockerRunning {
    try {
        $Result = docker info 2>&1
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

# ============================================================================
# VERIFICATION DOCKER
# ============================================================================

Write-Log "Verification de Docker..."

if (-not (Test-CommandExists "docker")) {
    Write-Log "Docker non trouve. Hindsight necessite Docker Desktop." "WARNING"
    Write-Log "Installez Docker Desktop et relancez ce script." "INFO"
    exit 0
}

# Verifier si Docker est en cours d'execution
if (-not (Test-DockerRunning)) {
    Write-Log "Docker n'est pas en cours d'execution." "WARNING"
    Write-Log "Tentative de demarrage de Docker Desktop..." "INFO"

    # Essayer de demarrer Docker Desktop
    $DockerExe = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $DockerExe) {
        Start-Process $DockerExe
        Write-Log "Docker Desktop demarre. Attente de 30 secondes..." "INFO"
        Start-Sleep -Seconds 30

        # Re-verifier
        if (-not (Test-DockerRunning)) {
            Write-Log "Docker n'a pas demarre correctement." "WARNING"
            Write-Log "Demarrez Docker Desktop manuellement et relancez ce script." "INFO"
            exit 0
        }
    } else {
        Write-Log "Docker Desktop non trouve. Installation requise." "ERROR"
        exit 0
    }
}

Write-Log "Docker est operationnel" "SUCCESS"

# ============================================================================
# CONFIGURATION HINDSIGHT
# ============================================================================

Write-Log ""
Write-Log "Configuration de Hindsight..."

$HindsightDir = "$InstallPath\hindsight"

# Creer le dossier Hindsight
if (-not (Test-Path $HindsightDir)) {
    New-Item -ItemType Directory -Path $HindsightDir -Force | Out-Null
    Write-Log "Dossier cree: $HindsightDir" "SUCCESS"
}

# Docker Compose pour Hindsight
$DockerCompose = @"
version: '3.8'

services:
  hindsight-db:
    image: postgres:15-alpine
    container_name: hindsight-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: hindsight
      POSTGRES_PASSWORD: hindsight_password
      POSTGRES_DB: hindsight
    volumes:
      - hindsight_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U hindsight"]
      interval: 10s
      timeout: 5s
      retries: 5

  hindsight-api:
    image: ghcr.io/hindsight-dev/hindsight-server:latest
    container_name: hindsight-api
    restart: unless-stopped
    depends_on:
      hindsight-db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://hindsight:hindsight_password@hindsight-db:5432/hindsight
      PORT: 8888
    ports:
      - "8888:8888"

  hindsight-ui:
    image: ghcr.io/hindsight-dev/hindsight-ui:latest
    container_name: hindsight-ui
    restart: unless-stopped
    depends_on:
      - hindsight-api
    environment:
      API_URL: http://hindsight-api:8888
    ports:
      - "9999:3000"

volumes:
  hindsight_data:
    driver: local
"@

$DockerComposeFile = "$HindsightDir\docker-compose.yml"
Set-Content $DockerComposeFile $DockerCompose -Encoding UTF8
Write-Log "docker-compose.yml cree: $DockerComposeFile" "SUCCESS"

# ============================================================================
# SCRIPT DE DEMARRAGE
# ============================================================================

$StartScript = @"
@echo off
echo ============================================
echo ULTRA-CREATE - Demarrage Hindsight
echo ============================================
cd /d "$HindsightDir"
docker-compose up -d
echo.
echo Hindsight demarre:
echo   API: http://localhost:8888
echo   UI:  http://localhost:9999
echo.
pause
"@

$StartScriptFile = "$HindsightDir\start-hindsight.bat"
Set-Content $StartScriptFile $StartScript -Encoding ASCII
Write-Log "Script de demarrage cree: $StartScriptFile" "SUCCESS"

# Script PowerShell
$StartPSScript = @"
# ULTRA-CREATE - Hindsight Startup
Write-Host "Demarrage de Hindsight..." -ForegroundColor Cyan
Set-Location "$HindsightDir"
docker-compose up -d
Write-Host ""
Write-Host "Hindsight demarre:" -ForegroundColor Green
Write-Host "  API: http://localhost:8888"
Write-Host "  UI:  http://localhost:9999"
"@

$StartPSFile = "$HindsightDir\start-hindsight.ps1"
Set-Content $StartPSFile $StartPSScript -Encoding UTF8

# Script d'arret
$StopScript = @"
@echo off
echo Arret de Hindsight...
cd /d "$HindsightDir"
docker-compose down
echo Hindsight arrete.
pause
"@

$StopScriptFile = "$HindsightDir\stop-hindsight.bat"
Set-Content $StopScriptFile $StopScript -Encoding ASCII
Write-Log "Script d'arret cree: $StopScriptFile" "SUCCESS"

# ============================================================================
# DEMARRAGE HINDSIGHT
# ============================================================================

Write-Log ""
Write-Log "Demarrage de Hindsight..."

try {
    Set-Location $HindsightDir
    $Result = docker-compose up -d 2>&1
    Write-Log "Conteneurs Hindsight demarres" "SUCCESS"

    # Attendre que les services soient prets
    Write-Log "Attente des services (30 secondes)..."
    Start-Sleep -Seconds 30

    # Verifier les conteneurs
    $Containers = docker ps --format "{{.Names}}" 2>&1
    if ($Containers -match "hindsight") {
        Write-Log "Conteneurs Hindsight actifs" "SUCCESS"
    } else {
        Write-Log "Conteneurs Hindsight: verification requise" "WARNING"
    }
} catch {
    Write-Log "Erreur demarrage Hindsight: $_" "ERROR"
    Write-Log "Executez manuellement: cd $HindsightDir && docker-compose up -d" "INFO"
}

# ============================================================================
# CREATION BANQUES MEMOIRE
# ============================================================================

Write-Log ""
Write-Log "Creation des banques memoire par defaut..."

# Attendre que l'API soit prete
Start-Sleep -Seconds 5

$Banks = @(
    "ultra-dev-memory",
    "errors",
    "patterns",
    "projects",
    "documents",
    "research"
)

foreach ($Bank in $Banks) {
    try {
        $Body = @{ bank = $Bank } | ConvertTo-Json
        $Response = Invoke-RestMethod -Uri "http://localhost:8888/api/banks" -Method Post -Body $Body -ContentType "application/json" -ErrorAction SilentlyContinue
        Write-Log "Bank creee: $Bank" "SUCCESS"
    } catch {
        # La banque existe peut-etre deja
        Write-Log "Bank $Bank : Deja existante ou API non prete" "INFO"
    }
}

# ============================================================================
# RESUME
# ============================================================================

Write-Log ""
Write-Log "=== HINDSIGHT SETUP TERMINE ===" "INFO"
Write-Log ""
Write-Log "Services Hindsight:"
Write-Log "  API: http://localhost:8888"
Write-Log "  UI:  http://localhost:9999"
Write-Log ""
Write-Log "Pour demarrer/arreter Hindsight:"
Write-Log "  Demarrer: $StartScriptFile"
Write-Log "  Arreter:  $StopScriptFile"
Write-Log ""
Write-Log "Banques memoire disponibles:"
foreach ($Bank in $Banks) {
    Write-Log "  - $Bank"
}
Write-Log ""
Write-Log "Hindsight: Configuration terminee" "SUCCESS"
