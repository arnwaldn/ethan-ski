# =============================================================================
# ULTRA-CREATE v17.0 - Hindsight Memory Sync
# =============================================================================
# Usage:
#   .\hindsight-sync.ps1 -Action status
#   .\hindsight-sync.ps1 -Action retain -Bank trading -Content "EURUSD support at 1.0850"
#   .\hindsight-sync.ps1 -Action recall -Bank trading -Query "What are the support levels?"
#   .\hindsight-sync.ps1 -Action reflect -Bank trading -Query "What trading patterns work best?"
# =============================================================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("status", "retain", "recall", "reflect", "banks", "health")]
    [string]$Action = "status",

    [Parameter(Mandatory=$false)]
    [ValidateSet("trading", "development", "user_preferences", "world_facts", "experiences", "skills")]
    [string]$Bank = "development",

    [Parameter(Mandatory=$false)]
    [string]$Content = "",

    [Parameter(Mandatory=$false)]
    [string]$Query = "",

    [Parameter(Mandatory=$false)]
    [string]$Context = ""
)

$ErrorActionPreference = "Stop"

# Configuration
$HindsightUrl = "http://localhost:8888"
$ConfigPath = "$PSScriptRoot\..\config\hindsight-config.json"

# Load config
$Config = $null
if (Test-Path $ConfigPath) {
    $Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
    $HindsightUrl = $Config.server.url
}

# Bank ID mapping
$BankIds = @{
    "trading" = "ultra-trading-memory"
    "development" = "ultra-dev-memory"
    "user_preferences" = "ultra-user-memory"
    "world_facts" = "ultra-world-memory"
    "experiences" = "ultra-experiences-memory"
    "skills" = "ultra-skills-memory"
}

# Colors
function Write-Success { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Error { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }
function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Warn { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }

# Banner
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║           ULTRA-CREATE v17.0 - Hindsight Memory Sync             ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# Health check
function Test-Hindsight {
    try {
        $response = Invoke-RestMethod -Uri "$HindsightUrl/health" -Method Get -TimeoutSec 5
        return $true
    } catch {
        return $false
    }
}

# Execute action
switch ($Action) {
    "status" {
        Write-Info "Checking Hindsight status..."
        if (Test-Hindsight) {
            Write-Success "Hindsight is running at $HindsightUrl"
            Write-Host "  UI: http://localhost:9999" -ForegroundColor Gray
        } else {
            Write-Error "Hindsight is not available"
            Write-Info "Start with: .\start-hindsight.ps1"
            exit 1
        }
    }

    "health" {
        if (Test-Hindsight) {
            $health = Invoke-RestMethod -Uri "$HindsightUrl/health" -Method Get
            Write-Success "Hindsight Health:"
            $health | ConvertTo-Json -Depth 3 | Write-Host
        } else {
            Write-Error "Hindsight is not responding"
            exit 1
        }
    }

    "banks" {
        Write-Info "Available Memory Banks:"
        Write-Host ""
        foreach ($key in $BankIds.Keys) {
            Write-Host "  $key" -ForegroundColor Yellow -NoNewline
            Write-Host " -> $($BankIds[$key])" -ForegroundColor Gray
        }
        Write-Host ""
    }

    "retain" {
        if ([string]::IsNullOrEmpty($Content)) {
            Write-Error "Content is required for retain action"
            Write-Host "Usage: .\hindsight-sync.ps1 -Action retain -Bank trading -Content 'Your content here'"
            exit 1
        }

        if (-not (Test-Hindsight)) {
            Write-Error "Hindsight is not available"
            exit 1
        }

        $bankId = $BankIds[$Bank]
        Write-Info "Retaining to bank: $Bank ($bankId)"

        $body = @{
            bank_id = $bankId
            content = $Content
            timestamp = (Get-Date -Format "o")
        }

        if (-not [string]::IsNullOrEmpty($Context)) {
            $body.context = $Context
        }

        try {
            $response = Invoke-RestMethod -Uri "$HindsightUrl/retain" -Method Post `
                -ContentType "application/json" `
                -Body ($body | ConvertTo-Json)

            Write-Success "Memory retained successfully"
            Write-Host "  Bank: $Bank" -ForegroundColor Gray
            Write-Host "  Content: $($Content.Substring(0, [Math]::Min(50, $Content.Length)))..." -ForegroundColor Gray
        } catch {
            Write-Error "Failed to retain: $_"
            exit 1
        }
    }

    "recall" {
        if ([string]::IsNullOrEmpty($Query)) {
            Write-Error "Query is required for recall action"
            Write-Host "Usage: .\hindsight-sync.ps1 -Action recall -Bank trading -Query 'Your query here'"
            exit 1
        }

        if (-not (Test-Hindsight)) {
            Write-Error "Hindsight is not available"
            exit 1
        }

        $bankId = $BankIds[$Bank]
        Write-Info "Recalling from bank: $Bank ($bankId)"
        Write-Info "Query: $Query"

        $body = @{
            bank_id = $bankId
            query = $Query
            max_tokens = 4000
        }

        try {
            $response = Invoke-RestMethod -Uri "$HindsightUrl/recall" -Method Post `
                -ContentType "application/json" `
                -Body ($body | ConvertTo-Json)

            Write-Success "Recall successful"
            Write-Host ""
            Write-Host "Results:" -ForegroundColor Yellow
            $response | ConvertTo-Json -Depth 5 | Write-Host
        } catch {
            Write-Error "Failed to recall: $_"
            exit 1
        }
    }

    "reflect" {
        if ([string]::IsNullOrEmpty($Query)) {
            $Query = "What patterns have worked best? What should I remember?"
        }

        if (-not (Test-Hindsight)) {
            Write-Error "Hindsight is not available"
            exit 1
        }

        $bankId = $BankIds[$Bank]
        Write-Info "Reflecting on bank: $Bank ($bankId)"
        Write-Info "Query: $Query"

        $body = @{
            bank_id = $bankId
            query = $Query
        }

        try {
            $response = Invoke-RestMethod -Uri "$HindsightUrl/reflect" -Method Post `
                -ContentType "application/json" `
                -Body ($body | ConvertTo-Json)

            Write-Success "Reflection complete"
            Write-Host ""
            Write-Host "Insights:" -ForegroundColor Yellow
            $response | ConvertTo-Json -Depth 5 | Write-Host
        } catch {
            Write-Error "Failed to reflect: $_"
            exit 1
        }
    }
}

Write-Host ""
