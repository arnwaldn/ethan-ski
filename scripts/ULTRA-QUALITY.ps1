# ULTRA-QUALITY.ps1 - Audit qualité complet
# Usage: .\ULTRA-QUALITY.ps1

param(
    [switch]$Fix,
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ULTRA-QUALITY v10.0" -ForegroundColor Cyan
Write-Host "  Complete Quality Audit" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$score = 0
$maxScore = 0

function Add-Check {
    param($name, $passed, $points = 10)
    $script:maxScore += $points
    if ($passed) {
        $script:score += $points
        Write-Host "[PASS] $name" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] $name" -ForegroundColor Red
    }
}

# 1. TypeScript Check
Write-Host "`n--- TypeScript ---" -ForegroundColor Yellow
$tsResult = pnpm tsc --noEmit 2>&1
$tsPass = $LASTEXITCODE -eq 0
Add-Check "TypeScript compilation" $tsPass 15

# 2. ESLint Check
Write-Host "`n--- Linting ---" -ForegroundColor Yellow
if ($Fix) {
    pnpm eslint . --fix 2>&1 | Out-Null
}
$lintResult = pnpm eslint . 2>&1
$lintPass = $LASTEXITCODE -eq 0
Add-Check "ESLint" $lintPass 15

# 3. Prettier Check
Write-Host "`n--- Formatting ---" -ForegroundColor Yellow
if ($Fix) {
    pnpm prettier --write . 2>&1 | Out-Null
}
$prettierResult = pnpm prettier --check . 2>&1
$prettierPass = $LASTEXITCODE -eq 0
Add-Check "Prettier formatting" $prettierPass 10

# 4. Security Audit
Write-Host "`n--- Security ---" -ForegroundColor Yellow
$auditResult = npm audit --audit-level=high 2>&1
$auditPass = $LASTEXITCODE -eq 0
Add-Check "npm audit (no high/critical)" $auditPass 20

# 5. Build Check
Write-Host "`n--- Build ---" -ForegroundColor Yellow
$buildResult = pnpm build 2>&1
$buildPass = $LASTEXITCODE -eq 0
Add-Check "Production build" $buildPass 20

# 6. Tests Check
Write-Host "`n--- Tests ---" -ForegroundColor Yellow
$testResult = pnpm test 2>&1
$testPass = $LASTEXITCODE -eq 0
Add-Check "Tests passing" $testPass 20

# Calculate Score
$percentage = [math]::Round(($score / $maxScore) * 100)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  QUALITY SCORE: $percentage% ($score/$maxScore)" -ForegroundColor $(if ($percentage -ge 80) { "Green" } elseif ($percentage -ge 60) { "Yellow" } else { "Red" })
Write-Host "========================================" -ForegroundColor Cyan

if ($percentage -ge 90) {
    Write-Host "`n  Excellent! Ready for production." -ForegroundColor Green
} elseif ($percentage -ge 70) {
    Write-Host "`n  Good, but some improvements needed." -ForegroundColor Yellow
} else {
    Write-Host "`n  Needs significant improvements." -ForegroundColor Red
}
