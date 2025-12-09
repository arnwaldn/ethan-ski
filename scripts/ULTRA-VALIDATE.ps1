# ULTRA-VALIDATE.ps1
# Script de validation automatique de projet

param(
    [Parameter(Position=0)]
    [string]$Path = ".",

    [Parameter()]
    [switch]$Quick,

    [Parameter()]
    [switch]$Full,

    [Parameter()]
    [switch]$Fix
)

$ErrorActionPreference = "Continue"

# Couleurs
function Write-Success { param($msg) Write-Host $msg -ForegroundColor Green }
function Write-Error { param($msg) Write-Host $msg -ForegroundColor Red }
function Write-Warning { param($msg) Write-Host $msg -ForegroundColor Yellow }
function Write-Info { param($msg) Write-Host $msg -ForegroundColor Cyan }

Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "       ULTRA-VALIDATE - Quality Check       " -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""

# Se positionner dans le dossier
Set-Location $Path

# Vérifier que c'est un projet Node
if (-not (Test-Path "package.json")) {
    Write-Error "Erreur: package.json non trouve dans $Path"
    exit 1
}

$results = @()
$startTime = Get-Date

# Fonction pour executer une commande et capturer le resultat
function Test-Command {
    param(
        [string]$Name,
        [string]$Command,
        [bool]$Required = $true
    )

    Write-Info "Running: $Name..."
    $cmdStart = Get-Date

    try {
        $output = Invoke-Expression $Command 2>&1
        $exitCode = $LASTEXITCODE
        $duration = ((Get-Date) - $cmdStart).TotalSeconds

        if ($exitCode -eq 0) {
            Write-Success "  OK ($([math]::Round($duration, 1))s)"
            return @{
                Name = $Name
                Passed = $true
                Duration = $duration
                Message = "Success"
            }
        } else {
            Write-Error "  FAILED ($([math]::Round($duration, 1))s)"
            if ($Required) {
                Write-Host "  $output" -ForegroundColor Gray
            }
            return @{
                Name = $Name
                Passed = $false
                Duration = $duration
                Message = $output | Out-String
            }
        }
    } catch {
        $duration = ((Get-Date) - $cmdStart).TotalSeconds
        Write-Warning "  SKIPPED (command not found)"
        return @{
            Name = $Name
            Passed = $true
            Duration = $duration
            Message = "Skipped"
            Skipped = $true
        }
    }
}

# Detecter le package manager
$pm = "npm"
if (Test-Path "pnpm-lock.yaml") { $pm = "pnpm" }
elseif (Test-Path "yarn.lock") { $pm = "yarn" }

Write-Info "Package manager: $pm"
Write-Host ""

# === PHASE 1: Quick Checks ===
Write-Host "--- Phase 1: Quick Checks ---" -ForegroundColor Yellow

# TypeScript Check
if (Test-Path "tsconfig.json") {
    if ($Fix) {
        $results += Test-Command "TypeScript" "$pm run typecheck 2>&1" $false
    } else {
        $results += Test-Command "TypeScript" "npx tsc --noEmit 2>&1"
    }
}

# Lint
$lintCmd = if ($Fix) { "$pm run lint:fix 2>&1" } else { "$pm run lint 2>&1" }
$results += Test-Command "ESLint" $lintCmd $false

# Format Check
if ($Fix) {
    $results += Test-Command "Prettier" "$pm run format 2>&1" $false
} else {
    $results += Test-Command "Prettier" "npx prettier --check . 2>&1" $false
}

if ($Quick) {
    # Afficher resultats et sortir
    Write-Host ""
    Write-Host "--- Results ---" -ForegroundColor Yellow
    $passed = ($results | Where-Object { $_.Passed }).Count
    $total = $results.Count
    Write-Host "Passed: $passed/$total"

    if ($passed -eq $total) {
        Write-Success "All quick checks passed!"
        exit 0
    } else {
        Write-Error "Some checks failed."
        exit 1
    }
}

# === PHASE 2: Tests ===
Write-Host ""
Write-Host "--- Phase 2: Tests ---" -ForegroundColor Yellow

# Unit Tests
$testCmd = "$pm test -- --run 2>&1"
if (Test-Path "vitest.config.ts" -or Test-Path "vitest.config.js") {
    $testCmd = "npx vitest --run 2>&1"
} elseif (Test-Path "jest.config.js" -or Test-Path "jest.config.ts") {
    $testCmd = "npx jest --passWithNoTests 2>&1"
}
$results += Test-Command "Unit Tests" $testCmd $false

# === PHASE 3: Build ===
Write-Host ""
Write-Host "--- Phase 3: Build ---" -ForegroundColor Yellow

$results += Test-Command "Build" "$pm run build 2>&1"

if (-not $Full) {
    # Afficher resultats et sortir
    Write-Host ""
    Write-Host "--- Results ---" -ForegroundColor Yellow
    $passed = ($results | Where-Object { $_.Passed }).Count
    $total = $results.Count
    $skipped = ($results | Where-Object { $_.Skipped }).Count

    Write-Host "Passed: $passed/$total (Skipped: $skipped)"

    $totalDuration = ((Get-Date) - $startTime).TotalSeconds
    Write-Host "Total time: $([math]::Round($totalDuration, 1))s"

    if (($results | Where-Object { -not $_.Passed -and -not $_.Skipped }).Count -eq 0) {
        Write-Success "Validation passed!"
        exit 0
    } else {
        Write-Error "Validation failed."
        exit 1
    }
}

# === PHASE 4: Full Checks ===
Write-Host ""
Write-Host "--- Phase 4: Security & Performance ---" -ForegroundColor Yellow

# Security Audit
$results += Test-Command "Security Audit" "$pm audit --audit-level=high 2>&1" $false

# Bundle Analysis (if next.js)
if (Test-Path "next.config.js" -or Test-Path "next.config.ts" -or Test-Path "next.config.mjs") {
    $results += Test-Command "Bundle Analysis" "npx @next/bundle-analyzer 2>&1" $false
}

# === Final Results ===
Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "              VALIDATION REPORT             " -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""

foreach ($result in $results) {
    $icon = if ($result.Passed) { "[PASS]" } elseif ($result.Skipped) { "[SKIP]" } else { "[FAIL]" }
    $color = if ($result.Passed) { "Green" } elseif ($result.Skipped) { "Yellow" } else { "Red" }
    Write-Host "$icon $($result.Name) ($([math]::Round($result.Duration, 1))s)" -ForegroundColor $color
}

Write-Host ""
$passed = ($results | Where-Object { $_.Passed }).Count
$failed = ($results | Where-Object { -not $_.Passed -and -not $_.Skipped }).Count
$skipped = ($results | Where-Object { $_.Skipped }).Count
$total = $results.Count

Write-Host "Summary: $passed passed, $failed failed, $skipped skipped"

$totalDuration = ((Get-Date) - $startTime).TotalSeconds
Write-Host "Total time: $([math]::Round($totalDuration, 1))s"

if ($failed -eq 0) {
    Write-Host ""
    Write-Success "Validation PASSED!"
    exit 0
} else {
    Write-Host ""
    Write-Error "Validation FAILED!"
    exit 1
}
