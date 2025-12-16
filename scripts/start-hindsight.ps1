# =============================================================================
# ULTRA-CREATE v17.0 - Hindsight Memory Server Startup
# =============================================================================

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
$CONTAINER_NAME = "ultra-create-hindsight"
$API_PORT = 8888
$UI_PORT = 9999
$DATA_DIR = "$env:USERPROFILE\.hindsight-ultra-create"
$ENV_FILE = "$PSScriptRoot\..\.env.secrets"

# Colors
function Write-Success { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Error { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }
function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Warn { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }

# Banner
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║          ULTRA-CREATE v17.0 - Hindsight Memory Server            ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
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

    $container = docker ps -a --filter "name=$CONTAINER_NAME" --format "{{.Status}}" 2>$null

    if ($container) {
        if ($container -like "Up*") {
            Write-Success "Hindsight is running"
            Write-Host "  API: http://localhost:$API_PORT" -ForegroundColor Gray
            Write-Host "  UI:  http://localhost:$UI_PORT" -ForegroundColor Gray

            # Health check
            try {
                $health = Invoke-RestMethod -Uri "http://localhost:$API_PORT/health" -TimeoutSec 5
                Write-Success "API Health: OK"
            } catch {
                Write-Warn "API not responding yet - starting up"
            }
        } else {
            Write-Warn "Hindsight container exists but is stopped"
            Write-Info "Run: .\start-hindsight.ps1 to start"
        }
    } else {
        Write-Info "Hindsight is not running"
        Write-Info "Run: .\start-hindsight.ps1 to start"
    }
    exit 0
}

# Stop
if ($Stop) {
    Write-Info "Stopping Hindsight..."
    docker stop $CONTAINER_NAME 2>$null
    docker rm $CONTAINER_NAME 2>$null
    Write-Success "Hindsight stopped"
    exit 0
}

# Logs
if ($Logs) {
    Write-Info "Showing Hindsight logs - press Ctrl+C to exit..."
    docker logs -f $CONTAINER_NAME
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
    docker stop $CONTAINER_NAME 2>$null
    docker rm $CONTAINER_NAME 2>$null
}

# Check prerequisites
if (-not (Test-Docker)) {
    Write-Error "Docker is not running or not installed"
    Write-Info "Install Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
}

# Check if already running
$existing = docker ps --filter "name=$CONTAINER_NAME" --format "{{.Names}}" 2>$null
if ($existing -eq $CONTAINER_NAME) {
    Write-Success "Hindsight is already running"
    Write-Host "  API: http://localhost:$API_PORT" -ForegroundColor Gray
    Write-Host "  UI:  http://localhost:$UI_PORT" -ForegroundColor Gray
    Write-Info "Use -Restart to restart, -Stop to stop"
    exit 0
}

# Remove stopped container if exists
docker rm $CONTAINER_NAME 2>$null | Out-Null

# Get API Key
$apiKey = Get-OpenAIKey
Write-Success "OpenAI API Key loaded"

# Create data directory
if (-not (Test-Path $DATA_DIR)) {
    New-Item -ItemType Directory -Path $DATA_DIR -Force | Out-Null
    Write-Success "Created data directory: $DATA_DIR"
}

# Start Hindsight
Write-Info "Starting Hindsight server..."
Write-Info "Model: $Model"

$dockerCmd = @(
    "run", "-d",
    "--name", $CONTAINER_NAME,
    "-p", "${API_PORT}:8888",
    "-p", "${UI_PORT}:9999",
    "-e", "HINDSIGHT_API_LLM_PROVIDER=openai",
    "-e", "HINDSIGHT_API_LLM_API_KEY=$apiKey",
    "-e", "HINDSIGHT_API_LLM_MODEL=$Model",
    "-e", "HINDSIGHT_PG0_STARTUP_TIMEOUT=60",
    "--pull", "always",
    "ghcr.io/vectorize-io/hindsight:latest"
)

try {
    $containerId = & docker @dockerCmd
    Write-Success "Hindsight container started: $($containerId.Substring(0, 12))"
} catch {
    Write-Error "Failed to start Hindsight: $_"
    exit 1
}

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
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Success "Hindsight Memory Server is running!"
Write-Host ""
Write-Host "  API Endpoint: " -NoNewline; Write-Host "http://localhost:$API_PORT" -ForegroundColor Yellow
Write-Host "  Web UI:       " -NoNewline; Write-Host "http://localhost:$UI_PORT" -ForegroundColor Yellow
Write-Host "  Data:         " -NoNewline; Write-Host "$DATA_DIR" -ForegroundColor Gray
Write-Host ""
Write-Host "  Commands:" -ForegroundColor Cyan
Write-Host "    .\start-hindsight.ps1 -Status   # Check status"
Write-Host "    .\start-hindsight.ps1 -Logs     # View logs"
Write-Host "    .\start-hindsight.ps1 -UI       # Open web UI"
Write-Host "    .\start-hindsight.ps1 -Stop     # Stop server"
Write-Host "    .\start-hindsight.ps1 -Restart  # Restart server"
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
