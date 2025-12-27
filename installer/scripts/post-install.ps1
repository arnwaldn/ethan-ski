# ============================================================================
# ULTRA-CREATE v21.4 - Post-Installation
# ============================================================================
# Finalisation de l'installation
# ============================================================================

param(
    [string]$InstallPath = "C:\Claude-Code-Creation"
)

$ErrorActionPreference = "Continue"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    switch ($Level) {
        "INFO"    { Write-Host $LogMessage -ForegroundColor Cyan }
        "SUCCESS" { Write-Host $LogMessage -ForegroundColor Green }
        "WARNING" { Write-Host $LogMessage -ForegroundColor Yellow }
        "ERROR"   { Write-Host $LogMessage -ForegroundColor Red }
        default   { Write-Host $LogMessage }
    }
}

# ============================================================================
# COPIE CLAUDE.md VERS PROFIL UTILISATEUR
# ============================================================================

Write-Log "Configuration du profil utilisateur..."

$ClaudeDir = "$env:USERPROFILE\.claude"
$ClaudeMdSource = "$InstallPath\.claude\CLAUDE.md"
$ClaudeMdDest = "$ClaudeDir\CLAUDE.md"

# Creer dossier .claude
if (-not (Test-Path $ClaudeDir)) {
    New-Item -ItemType Directory -Path $ClaudeDir -Force | Out-Null
    Write-Log "Dossier .claude cree: $ClaudeDir" "SUCCESS"
}

# Copier CLAUDE.md
if (Test-Path $ClaudeMdSource) {
    Copy-Item $ClaudeMdSource $ClaudeMdDest -Force
    Write-Log "CLAUDE.md copie: $ClaudeMdDest" "SUCCESS"
} else {
    Write-Log "CLAUDE.md source non trouve" "WARNING"
}

# ============================================================================
# CREATION RACCOURCIS BUREAU
# ============================================================================

Write-Log ""
Write-Log "Creation des raccourcis..."

$WScriptShell = New-Object -ComObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$StartMenuPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\ULTRA-CREATE"

# Creer dossier Start Menu
if (-not (Test-Path $StartMenuPath)) {
    New-Item -ItemType Directory -Path $StartMenuPath -Force | Out-Null
}

# Raccourci: ULTRA-CREATE Terminal
$ShortcutPath = "$DesktopPath\ULTRA-CREATE.lnk"
$Shortcut = $WScriptShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "cmd.exe"
$Shortcut.Arguments = "/k cd /d `"$InstallPath`" && claude"
$Shortcut.WorkingDirectory = $InstallPath
$Shortcut.Description = "ULTRA-CREATE v21.4 - Terminal"
$Shortcut.Save()
Write-Log "Raccourci cree: $ShortcutPath" "SUCCESS"

# Raccourci: Ouvrir VS Code
$ShortcutPath = "$DesktopPath\ULTRA-CREATE VS Code.lnk"
$Shortcut = $WScriptShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "code"
$Shortcut.Arguments = "`"$InstallPath`""
$Shortcut.WorkingDirectory = $InstallPath
$Shortcut.Description = "Ouvrir ULTRA-CREATE dans VS Code"
$Shortcut.Save()
Write-Log "Raccourci cree: $ShortcutPath" "SUCCESS"

# Raccourci: Hindsight UI
$ShortcutPath = "$DesktopPath\Hindsight UI.lnk"
$Shortcut = $WScriptShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "cmd.exe"
$Shortcut.Arguments = "/c start http://localhost:9999"
$Shortcut.Description = "Ouvrir Hindsight UI"
$Shortcut.Save()
Write-Log "Raccourci cree: $ShortcutPath" "SUCCESS"

# Raccourcis Start Menu
Copy-Item "$DesktopPath\ULTRA-CREATE.lnk" "$StartMenuPath\" -Force
Copy-Item "$DesktopPath\ULTRA-CREATE VS Code.lnk" "$StartMenuPath\" -Force
Copy-Item "$DesktopPath\Hindsight UI.lnk" "$StartMenuPath\" -Force
Write-Log "Raccourcis Start Menu crees" "SUCCESS"

# ============================================================================
# CONFIGURATION VARIABLES D'ENVIRONNEMENT
# ============================================================================

Write-Log ""
Write-Log "Configuration des variables d'environnement..."

# Ajouter ULTRA_CREATE_PATH
[Environment]::SetEnvironmentVariable("ULTRA_CREATE_PATH", $InstallPath, "User")
$env:ULTRA_CREATE_PATH = $InstallPath
Write-Log "ULTRA_CREATE_PATH = $InstallPath" "SUCCESS"

# Ajouter scripts au PATH
$ScriptsPath = "$InstallPath\scripts"
$CurrentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($CurrentPath -notlike "*$ScriptsPath*") {
    [Environment]::SetEnvironmentVariable("Path", "$CurrentPath;$ScriptsPath", "User")
    Write-Log "Scripts ajoutes au PATH" "SUCCESS"
}

# ============================================================================
# CONFIGURATION POWERSHELL EXECUTION POLICY
# ============================================================================

Write-Log ""
Write-Log "Configuration PowerShell..."

try {
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Log "Execution Policy: RemoteSigned" "SUCCESS"
} catch {
    Write-Log "Execution Policy: Deja configure ou acces refuse" "WARNING"
}

# ============================================================================
# CREATION FICHIER DE DEMARRAGE RAPIDE
# ============================================================================

Write-Log ""
Write-Log "Creation du script de demarrage rapide..."

$QuickStartScript = @"
# ULTRA-CREATE v21.4 - Demarrage Rapide
# Execute ce script pour demarrer tous les services

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  ULTRA-CREATE v21.4 - Demarrage" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# Demarrer Docker si pas en cours
`$DockerRunning = docker info 2>`$null
if (-not `$?) {
    Write-Host "Demarrage de Docker Desktop..." -ForegroundColor Yellow
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "Attente de Docker (60 secondes)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 60
}

# Demarrer Hindsight
Write-Host "Demarrage de Hindsight..." -ForegroundColor Cyan
Set-Location "$InstallPath\hindsight"
docker-compose up -d

Write-Host ""
Write-Host "Services demarres:" -ForegroundColor Green
Write-Host "  Hindsight API: http://localhost:8888"
Write-Host "  Hindsight UI:  http://localhost:9999"
Write-Host ""
Write-Host "Pour utiliser ULTRA-CREATE:" -ForegroundColor Cyan
Write-Host "  1. Ouvrez un terminal"
Write-Host "  2. Tapez: claude"
Write-Host "  3. Puis: /wake"
Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
"@

$QuickStartFile = "$InstallPath\start-ultra-create.ps1"
Set-Content $QuickStartFile $QuickStartScript -Encoding UTF8
Write-Log "Script demarrage rapide: $QuickStartFile" "SUCCESS"

# Version batch
$QuickStartBat = @"
@echo off
echo.
echo ========================================
echo   ULTRA-CREATE v21.4 - Demarrage
echo ========================================
echo.
powershell -ExecutionPolicy Bypass -File "$QuickStartFile"
pause
"@

$QuickStartBatFile = "$InstallPath\start-ultra-create.bat"
Set-Content $QuickStartBatFile $QuickStartBat -Encoding ASCII
Write-Log "Script batch: $QuickStartBatFile" "SUCCESS"

# ============================================================================
# NETTOYAGE
# ============================================================================

Write-Log ""
Write-Log "Nettoyage..."

# Supprimer fichiers temporaires
$TempFiles = @(
    "$env:TEMP\rustup-init.exe"
)

foreach ($File in $TempFiles) {
    if (Test-Path $File) {
        Remove-Item $File -Force -ErrorAction SilentlyContinue
    }
}

Write-Log "Nettoyage termine" "SUCCESS"

# ============================================================================
# RESUME
# ============================================================================

Write-Log ""
Write-Log "=== POST-INSTALLATION TERMINEE ===" "INFO"
Write-Log ""
Write-Log "Raccourcis crees sur le bureau:"
Write-Log "  - ULTRA-CREATE (Terminal)"
Write-Log "  - ULTRA-CREATE VS Code"
Write-Log "  - Hindsight UI"
Write-Log ""
Write-Log "Variables d'environnement:"
Write-Log "  - ULTRA_CREATE_PATH = $InstallPath"
Write-Log ""
Write-Log "Post-installation: Terminee" "SUCCESS"
