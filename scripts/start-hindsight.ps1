# =============================================================================
# ULTRA-CREATE v19.1 - Hindsight Memory Server Startup
# =============================================================================
# Configuration utilisant PostgreSQL externe (embedded pg0 buggy sur Windows)

param(
    [switch]$Stop,
    [switch]$Restart,
    [switch]$Status,
    [switch]$Logs,
    [switch]$UI,
    [string]$Model = "gpt-4o-mini"
)

$ErrorActionPreference = "Stop"

# Configuration
$HINDSIGHT_CONTAINER = "hindsight"
$POSTGRES_CONTAINER = "hindsight-postgres"
$NETWORK_NAME = "hindsight-network"
$API_PORT = 8888
$UI_PORT = 9999
$PG_PORT = 5433
$ENV_FILE = "$PSScriptRoot\..\.env.secrets"

# PostgreSQL Configuration
$PG_USER = "hindsight"
$PG_PASSWORD = "hindsight123"
$PG_DATABASE = "hindsight"

# Colors
function Write-Success { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Error { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }
function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Warn { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }

# Banner
Write-Host ""
Write-Host "======================================================================" -ForegroundColor Magenta
Write-Host "          ULTRA-CREATE v19.1 - Hindsight Memory Server               " -ForegroundColor Magenta
Write-Host "======================================================================" -ForegroundColor Magenta
Write-Host ""

# Load OpenAI API Key from .env.secrets
function Get-OpenAIKey {
    if (Test-Path $ENV_FILE) {
        $content = Get-Content $ENV_FILE -Raw
        if ($content -match 'OPENAI_API_KEY=(.+)') {
            return $matches[1].Trim()
        }
    }

    # Fallback to environment variable
    if ($env:OPENAI_API_KEY) {
        return $env:OPENAI_API_KEY
    }

    Write-Error "OPENAI_API_KEY not found in .env.secrets or environment"
    Write-Info "Add OPENAI_API_KEY=sk-... to C:\Claude-Code-Creation\.env.secrets"
    exit 1
}

# Check Docker
function Test-Docker {
    try {
        $null = docker version 2>&1
        return $true
    } catch {
        return $false
    }
}

# Status
if ($Status) {
    Write-Info "Checking Hindsight status..."

    $pgStatus = docker ps --filter "name=$POSTGRES_CONTAINER" --format "{{.Status}}" 2>$null
    $hsStatus = docker ps --filter "name=$HINDSIGHT_CONTAINER" --format "{{.Status}}" 2>$null

    Write-Host ""
    if ($pgStatus -like "Up*") {
        Write-Success "PostgreSQL: Running (port $PG_PORT)"
    } else {
        Write-Warn "PostgreSQL: Not running"
    }

    if ($hsStatus -like "Up*") {
        Write-Success "Hindsight: Running"
        Write-Host "  API: http://localhost:$API_PORT" -ForegroundColor Gray
        Write-Host "  UI:  http://localhost:$UI_PORT" -ForegroundColor Gray

        # Health check
        try {
            $health = Invoke-RestMethod -Uri "http://localhost:$API_PORT/health" -TimeoutSec 5
            Write-Success "API Health: OK"
        } catch {
            Write-Warn "API not responding - may be starting up"
        }
    } else {
        Write-Warn "Hindsight: Not running"
    }

    Write-Host ""
    Write-Info "Use: .\start-hindsight.ps1 to start all services"
    exit 0
}

# Stop
if ($Stop) {
    Write-Info "Stopping Hindsight services..."
    docker stop $HINDSIGHT_CONTAINER 2>$null
    docker rm $HINDSIGHT_CONTAINER 2>$null
    docker stop $POSTGRES_CONTAINER 2>$null
    docker rm $POSTGRES_CONTAINER 2>$null
    docker network rm $NETWORK_NAME 2>$null
    Write-Success "Hindsight services stopped"
    exit 0
}

# Logs
if ($Logs) {
    Write-Info "Showing Hindsight logs - press Ctrl+C to exit..."
    docker logs -f $HINDSIGHT_CONTAINER
    exit 0
}

# Open UI
if ($UI) {
    Write-Info "Opening Hindsight UI..."
    Start-Process "http://localhost:$UI_PORT"
    exit 0
}

# Restart
if ($Restart) {
    Write-Info "Restarting Hindsight..."
    docker stop $HINDSIGHT_CONTAINER 2>$null
    docker rm $HINDSIGHT_CONTAINER 2>$null
}

# Check prerequisites
if (-not (Test-Docker)) {
    Write-Error "Docker is not running or not installed"
    Write-Info "Install Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
}

# Check if already running
$existing = docker ps --filter "name=$HINDSIGHT_CONTAINER" --format "{{.Names}}" 2>$null
if ($existing -eq $HINDSIGHT_CONTAINER) {
    Write-Success "Hindsight is already running"
    Write-Host "  API: http://localhost:$API_PORT" -ForegroundColor Gray
    Write-Host "  UI:  http://localhost:$UI_PORT" -ForegroundColor Gray
    Write-Info "Use -Restart to restart, -Stop to stop"
    exit 0
}

# Get API Key
$apiKey = Get-OpenAIKey
Write-Success "OpenAI API Key loaded"

# Create network if not exists
$networkExists = docker network ls --filter "name=$NETWORK_NAME" --format "{{.Name}}" 2>$null
if ($networkExists -ne $NETWORK_NAME) {
    Write-Info "Creating Docker network..."
    docker network create $NETWORK_NAME | Out-Null
    Write-Success "Network created: $NETWORK_NAME"
}

# Start PostgreSQL if not running
$pgRunning = docker ps --filter "name=$POSTGRES_CONTAINER" --format "{{.Names}}" 2>$null
if ($pgRunning -ne $POSTGRES_CONTAINER) {
    # Remove stopped container if exists
    docker rm $POSTGRES_CONTAINER 2>$null | Out-Null

    Write-Info "Starting PostgreSQL with pgvector..."
    docker run -d `
        --name $POSTGRES_CONTAINER `
        --network $NETWORK_NAME `
        -e POSTGRES_USER=$PG_USER `
        -e POSTGRES_PASSWORD=$PG_PASSWORD `
        -e POSTGRES_DB=$PG_DATABASE `
        -p "${PG_PORT}:5432" `
        -v hindsight-postgres-data:/var/lib/postgresql/data `
        pgvector/pgvector:pg16 | Out-Null

    Write-Success "PostgreSQL started (port $PG_PORT)"

    # Wait for PostgreSQL
    Write-Info "Waiting for PostgreSQL to be ready..."
    Start-Sleep -Seconds 5
}

# Remove stopped Hindsight container if exists
docker rm $HINDSIGHT_CONTAINER 2>$null | Out-Null

# Start Hindsight
Write-Info "Starting Hindsight server..."
Write-Info "Model: $Model"

$DATABASE_URL = "postgresql://${PG_USER}:${PG_PASSWORD}@${POSTGRES_CONTAINER}:5432/${PG_DATABASE}"

docker run -d `
    --name $HINDSIGHT_CONTAINER `
    --network $NETWORK_NAME `
    -p "${API_PORT}:8888" `
    -p "${UI_PORT}:9999" `
    -e HINDSIGHT_API_LLM_PROVIDER=openai `
    -e HINDSIGHT_API_LLM_API_KEY=$apiKey `
    -e HINDSIGHT_API_LLM_MODEL=$Model `
    -e HINDSIGHT_API_DATABASE_URL=$DATABASE_URL `
    --pull always `
    ghcr.io/vectorize-io/hindsight:latest | Out-Null

Write-Success "Hindsight container started"

# Wait for startup
Write-Info "Waiting for Hindsight to initialize..."
$maxAttempts = 30
$attempt = 0

while ($attempt -lt $maxAttempts) {
    Start-Sleep -Seconds 2
    $attempt++

    try {
        $health = Invoke-RestMethod -Uri "http://localhost:$API_PORT/health" -TimeoutSec 2
        Write-Success "Hindsight is ready!"
        break
    } catch {
        Write-Host "." -NoNewline
    }
}

Write-Host ""

if ($attempt -ge $maxAttempts) {
    Write-Warn "Hindsight taking longer than expected to start"
    Write-Info "Check logs with: .\start-hindsight.ps1 -Logs"
}

# Summary
Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Success "Hindsight Memory Server is running!"
Write-Host ""
Write-Host "  API Endpoint: " -NoNewline; Write-Host "http://localhost:$API_PORT" -ForegroundColor Yellow
Write-Host "  Web UI:       " -NoNewline; Write-Host "http://localhost:$UI_PORT" -ForegroundColor Yellow
Write-Host "  API Docs:     " -NoNewline; Write-Host "http://localhost:$API_PORT/docs" -ForegroundColor Yellow
Write-Host ""
Write-Host "  API Endpoints (v1):" -ForegroundColor Cyan
Write-Host "    POST /v1/default/banks/{id}/memories        # Retain"
Write-Host "    POST /v1/default/banks/{id}/memories/recall # Recall"
Write-Host "    POST /v1/default/banks/{id}/reflect         # Reflect"
Write-Host ""
Write-Host "  Commands:" -ForegroundColor Cyan
Write-Host "    .\start-hindsight.ps1 -Status   # Check status"
Write-Host "    .\start-hindsight.ps1 -Logs     # View logs"
Write-Host "    .\start-hindsight.ps1 -UI       # Open web UI"
Write-Host "    .\start-hindsight.ps1 -Stop     # Stop all services"
Write-Host "    .\start-hindsight.ps1 -Restart  # Restart Hindsight"
Write-Host "======================================================================" -ForegroundColor Green
