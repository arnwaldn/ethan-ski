# ULTRA-TEST.ps1 - Script de tests automatisés
# Usage: .\ULTRA-TEST.ps1 -Type "unit|e2e|all"

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("unit", "e2e", "all", "coverage")]
    [string]$Type = "all",

    [switch]$Watch,
    [switch]$UI
)

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ULTRA-TEST v10.0" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Vérifier la présence des outils de test
$hasVitest = Test-Path "node_modules/vitest"
$hasPlaywright = Test-Path "node_modules/@playwright/test"
$hasJest = Test-Path "node_modules/jest"

Write-Host "Test frameworks detected:" -ForegroundColor Yellow
if ($hasVitest) { Write-Host "  - Vitest" -ForegroundColor Green }
if ($hasPlaywright) { Write-Host "  - Playwright" -ForegroundColor Green }
if ($hasJest) { Write-Host "  - Jest" -ForegroundColor Green }

# Lancer les tests
switch ($Type) {
    "unit" {
        Write-Host "`nRunning unit tests..." -ForegroundColor Green
        if ($hasVitest) {
            if ($Watch) {
                pnpm vitest watch
            } elseif ($UI) {
                pnpm vitest --ui
            } else {
                pnpm vitest run
            }
        } elseif ($hasJest) {
            if ($Watch) {
                pnpm jest --watch
            } else {
                pnpm jest
            }
        }
    }
    "e2e" {
        Write-Host "`nRunning E2E tests..." -ForegroundColor Green
        if ($hasPlaywright) {
            if ($UI) {
                pnpm playwright test --ui
            } else {
                pnpm playwright test
            }
        }
    }
    "coverage" {
        Write-Host "`nRunning tests with coverage..." -ForegroundColor Green
        if ($hasVitest) {
            pnpm vitest run --coverage
        } elseif ($hasJest) {
            pnpm jest --coverage
        }
    }
    "all" {
        Write-Host "`nRunning all tests..." -ForegroundColor Green

        if ($hasVitest) {
            Write-Host "`n--- Unit Tests (Vitest) ---" -ForegroundColor Yellow
            pnpm vitest run
        }

        if ($hasPlaywright) {
            Write-Host "`n--- E2E Tests (Playwright) ---" -ForegroundColor Yellow
            pnpm playwright test
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Tests complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
