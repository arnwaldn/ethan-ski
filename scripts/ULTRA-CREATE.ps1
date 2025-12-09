# ULTRA-CREATE.ps1 - Script de création de projets autonome
# Usage: .\ULTRA-CREATE.ps1 -Name "MonProjet" -Type "web|mobile|desktop|api|saas"

param(
    [Parameter(Mandatory=$true)]
    [string]$Name,

    [Parameter(Mandatory=$true)]
    [ValidateSet("web", "mobile", "desktop", "api", "saas", "ecommerce", "dashboard", "landing")]
    [string]$Type,

    [string]$Template = "default",
    [switch]$Quick,
    [switch]$NoGit,
    [switch]$NoDeps
)

$ErrorActionPreference = "Stop"
$BaseDir = "C:\Claude-Code-Creation\projects"
$ProjectDir = Join-Path $BaseDir $Name

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ULTRA-CREATE v10.0" -ForegroundColor Cyan
Write-Host "  Creating: $Name ($Type)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Créer le dossier projets si nécessaire
if (-not (Test-Path $BaseDir)) {
    New-Item -ItemType Directory -Path $BaseDir -Force | Out-Null
}

# Vérifier si le projet existe déjà
if (Test-Path $ProjectDir) {
    Write-Host "Project already exists: $ProjectDir" -ForegroundColor Yellow
    $overwrite = Read-Host "Overwrite? (y/N)"
    if ($overwrite -ne "y") {
        Write-Host "Aborted." -ForegroundColor Red
        exit 1
    }
    Remove-Item -Recurse -Force $ProjectDir
}

# Création selon le type
switch ($Type) {
    "web" {
        Write-Host "Creating Next.js web application..." -ForegroundColor Green
        npx create-next-app@latest $ProjectDir --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
    }
    "saas" {
        Write-Host "Creating SaaS application with auth & payments..." -ForegroundColor Green
        npx create-next-app@latest $ProjectDir --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
        Set-Location $ProjectDir
        pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs stripe @stripe/stripe-js zod react-hook-form @hookform/resolvers zustand @tanstack/react-query
        pnpm add -D prisma @types/stripe
    }
    "ecommerce" {
        Write-Host "Creating E-commerce application..." -ForegroundColor Green
        npx create-next-app@latest $ProjectDir --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
        Set-Location $ProjectDir
        pnpm add @supabase/supabase-js stripe @stripe/stripe-js zustand @tanstack/react-query
    }
    "dashboard" {
        Write-Host "Creating Admin Dashboard..." -ForegroundColor Green
        npx create-next-app@latest $ProjectDir --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
        Set-Location $ProjectDir
        pnpm add recharts @tanstack/react-table zustand @tanstack/react-query date-fns
    }
    "landing" {
        Write-Host "Creating Landing Page..." -ForegroundColor Green
        npx create-next-app@latest $ProjectDir --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
        Set-Location $ProjectDir
        pnpm add framer-motion
    }
    "mobile" {
        Write-Host "Creating Expo mobile application..." -ForegroundColor Green
        npx create-expo-app@latest $ProjectDir --template blank-typescript
        Set-Location $ProjectDir
        npx expo install expo-router expo-linking expo-constants expo-status-bar
        pnpm add zustand @tanstack/react-query
    }
    "desktop" {
        Write-Host "Creating Tauri desktop application..." -ForegroundColor Green
        npm create tauri-app@latest $ProjectDir -- --template react-ts
        Set-Location $ProjectDir
        pnpm add zustand @tanstack/react-query
    }
    "api" {
        Write-Host "Creating FastAPI backend..." -ForegroundColor Green
        New-Item -ItemType Directory -Path $ProjectDir -Force | Out-Null
        Set-Location $ProjectDir
        python -m venv venv
        .\venv\Scripts\Activate.ps1
        pip install fastapi uvicorn sqlalchemy pydantic python-dotenv
    }
}

# Installer shadcn/ui pour les projets web
if ($Type -in @("web", "saas", "ecommerce", "dashboard", "landing")) {
    Write-Host "`nInstalling shadcn/ui components..." -ForegroundColor Green
    Set-Location $ProjectDir
    npx shadcn@latest init -y
    npx shadcn@latest add button card input label form dialog dropdown-menu avatar badge separator sheet tabs toast
}

# Initialiser Git
if (-not $NoGit) {
    Write-Host "`nInitializing Git repository..." -ForegroundColor Green
    Set-Location $ProjectDir
    git init
    git add .
    git commit -m "Initial commit - Created with ULTRA-CREATE v10.0"
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Project created successfully!" -ForegroundColor Green
Write-Host "  Location: $ProjectDir" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  cd $ProjectDir" -ForegroundColor White
Write-Host "  code ." -ForegroundColor White
Write-Host "  pnpm dev" -ForegroundColor White
