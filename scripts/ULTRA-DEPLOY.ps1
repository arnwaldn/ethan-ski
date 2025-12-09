# ULTRA-DEPLOY.ps1 - Script de déploiement multi-plateforme
# Usage: .\ULTRA-DEPLOY.ps1 -Platform "vercel|netlify|railway|cloudflare"

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("vercel", "netlify", "railway", "cloudflare", "auto")]
    [string]$Platform = "auto",

    [switch]$Production,
    [switch]$Preview
)

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ULTRA-DEPLOY v10.0" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Détecter le type de projet
function Detect-ProjectType {
    if (Test-Path "next.config.js" -or Test-Path "next.config.mjs" -or Test-Path "next.config.ts") {
        return "nextjs"
    }
    if (Test-Path "nuxt.config.ts") {
        return "nuxt"
    }
    if (Test-Path "astro.config.mjs") {
        return "astro"
    }
    if (Test-Path "app.json" -and (Get-Content "app.json" | Select-String "expo")) {
        return "expo"
    }
    if (Test-Path "tauri.conf.json") {
        return "tauri"
    }
    if (Test-Path "requirements.txt" -or Test-Path "pyproject.toml") {
        return "python"
    }
    return "unknown"
}

$projectType = Detect-ProjectType
Write-Host "Detected project type: $projectType" -ForegroundColor Yellow

# Auto-select platform
if ($Platform -eq "auto") {
    switch ($projectType) {
        "nextjs" { $Platform = "vercel" }
        "nuxt" { $Platform = "vercel" }
        "astro" { $Platform = "netlify" }
        "python" { $Platform = "railway" }
        default { $Platform = "vercel" }
    }
    Write-Host "Auto-selected platform: $Platform" -ForegroundColor Yellow
}

# Build avant déploiement
Write-Host "`nBuilding project..." -ForegroundColor Green
switch ($projectType) {
    "nextjs" { pnpm build }
    "nuxt" { pnpm build }
    "astro" { pnpm build }
    "expo" { eas build --platform all }
    "tauri" { pnpm tauri build }
}

# Déployer
Write-Host "`nDeploying to $Platform..." -ForegroundColor Green

$deployArgs = if ($Production) { "--prod" } elseif ($Preview) { "--preview" } else { "" }

switch ($Platform) {
    "vercel" {
        if ($Production) {
            vercel --prod
        } else {
            vercel
        }
    }
    "netlify" {
        if ($Production) {
            netlify deploy --prod
        } else {
            netlify deploy
        }
    }
    "railway" {
        railway up
    }
    "cloudflare" {
        wrangler deploy
    }
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Deployment complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
