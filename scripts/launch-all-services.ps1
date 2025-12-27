# ULTRA-CREATE v21.5 - Launch ALL Services
# Docker (Hindsight) + Blender + Unity

param(
    [switch]$Status,
    [switch]$Stop
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "================================================" -ForegroundColor Magenta
Write-Host "  ULTRA-CREATE v21.5 - Full Services Launcher   " -ForegroundColor Magenta
Write-Host "================================================" -ForegroundColor Magenta
Write-Host ""

# ============================================
# STATUS CHECK
# ============================================
if ($Status) {
    Write-Host "=== Status de tous les services ===" -ForegroundColor Cyan
    Write-Host ""

    # Docker Desktop
    $DockerProc = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
    if ($DockerProc) {
        Write-Host "[RUNNING] Docker Desktop" -ForegroundColor Green
    } else {
        Write-Host "[STOPPED] Docker Desktop" -ForegroundColor Red
    }

    # Docker daemon
    $DockerDaemon = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[RUNNING] Docker daemon" -ForegroundColor Green
    } else {
        Write-Host "[STOPPED] Docker daemon" -ForegroundColor Red
    }

    # Hindsight containers
    $HindsightAPI = docker ps --filter "name=hindsight" --format "{{.Names}}" 2>&1
    if ($HindsightAPI -match "hindsight") {
        Write-Host "[RUNNING] Hindsight containers" -ForegroundColor Green
    } else {
        Write-Host "[STOPPED] Hindsight containers" -ForegroundColor Yellow
    }

    # Blender
    $BlenderProc = Get-Process -Name "blender" -ErrorAction SilentlyContinue
    if ($BlenderProc) {
        Write-Host "[RUNNING] Blender (PID: $($BlenderProc.Id))" -ForegroundColor Green
    } else {
        Write-Host "[STOPPED] Blender" -ForegroundColor Yellow
    }

    # Unity
    $UnityProc = Get-Process -Name "Unity" -ErrorAction SilentlyContinue
    if ($UnityProc) {
        Write-Host "[RUNNING] Unity (PID: $($UnityProc.Id))" -ForegroundColor Green
    } else {
        Write-Host "[STOPPED] Unity" -ForegroundColor Yellow
    }

    Write-Host ""
    exit
}

# ============================================
# STOP ALL
# ============================================
if ($Stop) {
    Write-Host "=== Arret de tous les services ===" -ForegroundColor Yellow

    # Stop Blender
    Stop-Process -Name "blender" -Force -ErrorAction SilentlyContinue
    Write-Host "[OK] Blender arrete" -ForegroundColor Green

    # Stop Unity
    Stop-Process -Name "Unity" -Force -ErrorAction SilentlyContinue
    Write-Host "[OK] Unity arrete" -ForegroundColor Green

    # Stop Hindsight (but keep Docker running)
    docker-compose -f "C:\Claude-Code-Creation\hindsight\docker-compose.yml" down 2>$null
    Write-Host "[OK] Hindsight arrete" -ForegroundColor Green

    Write-Host ""
    exit
}

# ============================================
# 1. DOCKER DESKTOP
# ============================================
Write-Host "=== 1. Docker Desktop ===" -ForegroundColor Cyan

$DockerDesktop = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
if ($DockerDesktop) {
    Write-Host "[OK] Docker Desktop deja en cours" -ForegroundColor Green
} else {
    Write-Host "[INFO] Demarrage Docker Desktop..." -ForegroundColor Yellow

    $DockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $DockerPath) {
        Start-Process -FilePath $DockerPath
        Write-Host "[OK] Docker Desktop demarre" -ForegroundColor Green

        # Wait for Docker to be ready
        Write-Host "[INFO] Attente du daemon Docker..." -ForegroundColor Gray
        $Timeout = 60
        $Counter = 0
        while ($Counter -lt $Timeout) {
            $DockerReady = docker info 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[OK] Docker daemon pret" -ForegroundColor Green
                break
            }
            Start-Sleep -Seconds 2
            $Counter += 2
            Write-Host "." -NoNewline
        }
        Write-Host ""
    } else {
        Write-Host "[ERROR] Docker Desktop non trouve" -ForegroundColor Red
    }
}

Write-Host ""

# ============================================
# 2. HINDSIGHT (Memory)
# ============================================
Write-Host "=== 2. Hindsight (Memoire) ===" -ForegroundColor Cyan

$HindsightRunning = docker ps --filter "name=hindsight" --format "{{.Names}}" 2>&1
if ($HindsightRunning -match "hindsight") {
    Write-Host "[OK] Hindsight deja en cours" -ForegroundColor Green
} else {
    Write-Host "[INFO] Demarrage Hindsight..." -ForegroundColor Yellow

    # Use the existing start-hindsight script
    $HindsightScript = "C:\Claude-Code-Creation\scripts\start-hindsight.ps1"
    if (Test-Path $HindsightScript) {
        & powershell.exe -ExecutionPolicy Bypass -File $HindsightScript -Action start 2>$null

        # Wait a bit for containers to start
        Start-Sleep -Seconds 5

        # Verify
        $HindsightCheck = docker ps --filter "name=hindsight" --format "{{.Names}}" 2>&1
        if ($HindsightCheck -match "hindsight") {
            Write-Host "[OK] Hindsight demarre" -ForegroundColor Green
            Write-Host "     API: http://localhost:8888" -ForegroundColor Gray
            Write-Host "     UI:  http://localhost:9999" -ForegroundColor Gray
        } else {
            Write-Host "[WARNING] Hindsight peut necessiter une configuration manuelle" -ForegroundColor Yellow
        }
    } else {
        Write-Host "[WARNING] Script Hindsight non trouve" -ForegroundColor Yellow
    }
}

Write-Host ""

# ============================================
# 3. BLENDER
# ============================================
Write-Host "=== 3. Blender ===" -ForegroundColor Cyan

$BlenderProc = Get-Process -Name "blender" -ErrorAction SilentlyContinue
if ($BlenderProc) {
    Write-Host "[OK] Blender deja en cours" -ForegroundColor Green
} else {
    $BlenderExe = "C:\Program Files\Blender Foundation\Blender 5.0\blender.exe"
    $StartupScript = "C:\Claude-Code-Creation\scripts\start-blender-server.py"

    if (Test-Path $BlenderExe) {
        Write-Host "[INFO] Demarrage Blender avec serveur MCP..." -ForegroundColor Yellow
        Start-Process -FilePath $BlenderExe -ArgumentList "--python", $StartupScript -WindowStyle Normal
        Write-Host "[OK] Blender demarre" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Blender non trouve" -ForegroundColor Red
    }
}

Write-Host ""

# ============================================
# 4. UNITY (Optional - needs project)
# ============================================
Write-Host "=== 4. Unity ===" -ForegroundColor Cyan

$UnityProc = Get-Process -Name "Unity" -ErrorAction SilentlyContinue
if ($UnityProc) {
    Write-Host "[OK] Unity deja en cours" -ForegroundColor Green
} else {
    $UnityEditor = "C:\Program Files\Unity\Hub\Editor\6000.3.2f1\Editor\Unity.exe"
    $ProjectPath = "C:\Users\arnau\Setup Guide In-Editor Tutorial"

    if ((Test-Path $UnityEditor) -and (Test-Path $ProjectPath)) {
        Write-Host "[INFO] Demarrage Unity..." -ForegroundColor Yellow
        Start-Process -FilePath $UnityEditor -ArgumentList "-projectPath", $ProjectPath -WindowStyle Normal
        Write-Host "[OK] Unity demarre avec projet MCP" -ForegroundColor Green
    } else {
        Write-Host "[SKIP] Unity non demarre (pas de projet configure)" -ForegroundColor Yellow
        Write-Host "       Lancez manuellement si necessaire" -ForegroundColor Gray
    }
}

Write-Host ""

# ============================================
# SUMMARY
# ============================================
Write-Host "================================================" -ForegroundColor Green
Write-Host "  Tous les services sont en cours de demarrage  " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services actifs:" -ForegroundColor Cyan
Write-Host "  - Docker Desktop     → Conteneurs"
Write-Host "  - Hindsight          → Memoire persistante (port 8888)"
Write-Host "  - Blender 5.0        → Creation 3D"
Write-Host "  - Unity 6            → Game engine"
Write-Host ""
Write-Host "Claude peut maintenant utiliser:" -ForegroundColor Yellow
Write-Host "  /wake                → Charger memoire"
Write-Host "  /3d asset 'sword'    → Creer objet 3D"
Write-Host "  /game 3d 'RPG'       → Jeu complet"
Write-Host ""
Write-Host "Verifier status: .\scripts\launch-all-services.ps1 -Status" -ForegroundColor Gray
Write-Host "Arreter tout:    .\scripts\launch-all-services.ps1 -Stop" -ForegroundColor Gray
Write-Host ""
