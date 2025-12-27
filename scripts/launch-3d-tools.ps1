# ULTRA-CREATE v21.5 - Launch 3D Tools for Claude
# This script starts Blender and Unity with MCP servers ready

param(
    [switch]$Blender,
    [switch]$Unity,
    [switch]$Both,
    [switch]$Status
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Magenta
Write-Host "  ULTRA-CREATE v21.5 - 3D Tools Launcher" -ForegroundColor Magenta
Write-Host "=========================================" -ForegroundColor Magenta
Write-Host ""

# ============================================
# STATUS CHECK
# ============================================
if ($Status) {
    Write-Host "=== Status des outils 3D ===" -ForegroundColor Cyan

    # Check if Blender is running
    $BlenderProc = Get-Process -Name "blender" -ErrorAction SilentlyContinue
    if ($BlenderProc) {
        Write-Host "[RUNNING] Blender est ouvert (PID: $($BlenderProc.Id))" -ForegroundColor Green
    } else {
        Write-Host "[STOPPED] Blender n'est pas ouvert" -ForegroundColor Yellow
    }

    # Check if Unity is running
    $UnityProc = Get-Process -Name "Unity" -ErrorAction SilentlyContinue
    if ($UnityProc) {
        Write-Host "[RUNNING] Unity est ouvert (PID: $($UnityProc.Id))" -ForegroundColor Green
    } else {
        Write-Host "[STOPPED] Unity n'est pas ouvert" -ForegroundColor Yellow
    }

    # Check if Unity Hub is running
    $HubProc = Get-Process -Name "Unity Hub" -ErrorAction SilentlyContinue
    if ($HubProc) {
        Write-Host "[RUNNING] Unity Hub est ouvert" -ForegroundColor Green
    } else {
        Write-Host "[STOPPED] Unity Hub n'est pas ouvert" -ForegroundColor Yellow
    }

    Write-Host ""
    exit
}

# If no specific flag, launch both
if (-not $Blender -and -not $Unity -and -not $Both) {
    $Both = $true
}

# ============================================
# LAUNCH BLENDER
# ============================================
if ($Blender -or $Both) {
    Write-Host "=== Lancement Blender ===" -ForegroundColor Cyan

    $BlenderExe = "C:\Program Files\Blender Foundation\Blender 5.0\blender.exe"
    $StartupScript = "C:\Claude-Code-Creation\scripts\start-blender-server.py"

    if (Test-Path $BlenderExe) {
        # Check if already running
        $BlenderProc = Get-Process -Name "blender" -ErrorAction SilentlyContinue
        if ($BlenderProc) {
            Write-Host "[INFO] Blender est deja ouvert" -ForegroundColor Yellow
        } else {
            Write-Host "[INFO] Demarrage de Blender avec serveur MCP..." -ForegroundColor Yellow

            # Launch Blender with startup script (GUI mode for server)
            Start-Process -FilePath $BlenderExe -ArgumentList "--python", $StartupScript -WindowStyle Normal

            Write-Host "[OK] Blender demarre" -ForegroundColor Green
            Write-Host "[INFO] Attendez que Blender s'ouvre completement" -ForegroundColor Gray
            Write-Host "[INFO] Le serveur MCP sera actif automatiquement" -ForegroundColor Gray
        }
    } else {
        Write-Host "[ERROR] Blender non trouve: $BlenderExe" -ForegroundColor Red
    }

    Write-Host ""
}

# ============================================
# LAUNCH UNITY
# ============================================
if ($Unity -or $Both) {
    Write-Host "=== Lancement Unity ===" -ForegroundColor Cyan

    # Unity Hub path
    $UnityHub = "C:\Program Files\Unity Hub\Unity Hub.exe"

    # Project with MCP configured
    $ProjectPath = "C:\Users\arnau\Setup Guide In-Editor Tutorial"

    # Unity Editor path (latest version)
    $UnityEditor = "C:\Program Files\Unity\Hub\Editor\6000.3.2f1\Editor\Unity.exe"

    if (Test-Path $UnityEditor) {
        # Check if already running
        $UnityProc = Get-Process -Name "Unity" -ErrorAction SilentlyContinue
        if ($UnityProc) {
            Write-Host "[INFO] Unity est deja ouvert" -ForegroundColor Yellow
        } else {
            Write-Host "[INFO] Demarrage de Unity avec projet MCP..." -ForegroundColor Yellow

            if (Test-Path $ProjectPath) {
                # Launch Unity with the MCP-configured project
                Start-Process -FilePath $UnityEditor -ArgumentList "-projectPath", $ProjectPath -WindowStyle Normal

                Write-Host "[OK] Unity demarre avec projet: $ProjectPath" -ForegroundColor Green
                Write-Host "[INFO] Le package MCP sera charge automatiquement" -ForegroundColor Gray
            } else {
                # Just launch Unity Hub
                Start-Process -FilePath $UnityHub
                Write-Host "[OK] Unity Hub demarre" -ForegroundColor Green
                Write-Host "[INFO] Ouvrez un projet avec le package MCP installe" -ForegroundColor Yellow
            }
        }
    } elseif (Test-Path $UnityHub) {
        Start-Process -FilePath $UnityHub
        Write-Host "[OK] Unity Hub demarre" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Unity non trouve" -ForegroundColor Red
    }

    Write-Host ""
}

# ============================================
# SUMMARY
# ============================================
Write-Host "=========================================" -ForegroundColor Magenta
Write-Host "  Outils 3D en cours de demarrage       " -ForegroundColor Magenta
Write-Host "=========================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Attendez quelques secondes que les applications s'ouvrent." -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour Blender:" -ForegroundColor Yellow
Write-Host "  - Le serveur MCP demarre automatiquement"
Write-Host "  - Verifiez le panneau N > BlenderMCP"
Write-Host ""
Write-Host "Pour Unity:" -ForegroundColor Yellow
Write-Host "  - Le package MCP se charge avec le projet"
Write-Host "  - Le serveur demarre automatiquement"
Write-Host ""
Write-Host "Une fois ouverts, Claude peut utiliser:" -ForegroundColor Green
Write-Host "  /3d asset 'sword'"
Write-Host "  /3d character 'robot'"
Write-Host "  /game 3d 'RPG'"
Write-Host ""
