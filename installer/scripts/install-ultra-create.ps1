# ============================================================================
# ULTRA-CREATE v21.4 - Script Principal d'Installation
# ============================================================================
# Ce script orchestre l'installation complete du systeme ULTRA-CREATE
# Auteur: ULTRA-CREATE System
# Version: 21.4
# ============================================================================

param(
    [switch]$SkipDependencies,
    [switch]$SkipCreativeTools,
    [switch]$SkipMobileDesktop,
    [switch]$Silent,
    [string]$InstallPath = "C:\Claude-Code-Creation"
)

# Configuration
$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue"
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogFile = "$InstallPath\installer\install.log"
$StartTime = Get-Date

# ============================================================================
# FONCTIONS UTILITAIRES
# ============================================================================

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"

    # Couleurs selon niveau
    switch ($Level) {
        "INFO"    { Write-Host $LogMessage -ForegroundColor Cyan }
        "SUCCESS" { Write-Host $LogMessage -ForegroundColor Green }
        "WARNING" { Write-Host $LogMessage -ForegroundColor Yellow }
        "ERROR"   { Write-Host $LogMessage -ForegroundColor Red }
        default   { Write-Host $LogMessage }
    }

    # Ecrire dans le fichier log
    if (Test-Path (Split-Path $LogFile -Parent)) {
        Add-Content -Path $LogFile -Value $LogMessage
    }
}

function Show-Banner {
    $Banner = @"

    ██╗   ██╗██╗  ████████╗██████╗  █████╗
    ██║   ██║██║  ╚══██╔══╝██╔══██╗██╔══██╗
    ██║   ██║██║     ██║   ██████╔╝███████║
    ██║   ██║██║     ██║   ██╔══██╗██╔══██║
    ╚██████╔╝███████╗██║   ██║  ██║██║  ██║
     ╚═════╝ ╚══════╝╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝

    CREATE v21.4 - Installation System
    Autonomous Professional Development System

"@
    Write-Host $Banner -ForegroundColor Magenta
}

function Test-Administrator {
    $CurrentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $Principal = New-Object Security.Principal.WindowsPrincipal($CurrentUser)
    return $Principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Test-Prerequisites {
    Write-Log "Verification des prerequis systeme..."

    # Verifier Windows 10/11
    $OSVersion = [System.Environment]::OSVersion.Version
    if ($OSVersion.Major -lt 10) {
        throw "Windows 10 ou 11 requis. Version detectee: $($OSVersion.Major).$($OSVersion.Minor)"
    }
    Write-Log "Windows version: $($OSVersion.Major).$($OSVersion.Minor)" "SUCCESS"

    # Verifier droits admin
    if (-not (Test-Administrator)) {
        throw "Droits administrateur requis. Relancez en tant qu'administrateur."
    }
    Write-Log "Droits administrateur: OK" "SUCCESS"

    # Verifier espace disque (10 GB minimum)
    $Drive = (Get-Item $InstallPath -ErrorAction SilentlyContinue)?.PSDrive.Name
    if (-not $Drive) { $Drive = "C" }
    $FreeSpace = (Get-PSDrive $Drive).Free / 1GB
    if ($FreeSpace -lt 10) {
        throw "Espace disque insuffisant. Requis: 10 GB, Disponible: $([math]::Round($FreeSpace, 2)) GB"
    }
    Write-Log "Espace disque disponible: $([math]::Round($FreeSpace, 2)) GB" "SUCCESS"

    # Verifier winget
    $WingetPath = Get-Command winget -ErrorAction SilentlyContinue
    if (-not $WingetPath) {
        Write-Log "winget non trouve, tentative d'installation..." "WARNING"
        # Installer winget via Microsoft Store
        Add-AppxPackage -RegisterByFamilyName -MainPackage Microsoft.DesktopAppInstaller_8wekyb3d8bbwe -ErrorAction SilentlyContinue
    }
    Write-Log "winget: OK" "SUCCESS"

    # Verifier PowerShell version
    if ($PSVersionTable.PSVersion.Major -lt 5) {
        throw "PowerShell 5.0+ requis. Version: $($PSVersionTable.PSVersion)"
    }
    Write-Log "PowerShell version: $($PSVersionTable.PSVersion)" "SUCCESS"

    return $true
}

function Test-CommandExists {
    param([string]$Command)
    return (Get-Command $Command -ErrorAction SilentlyContinue) -ne $null
}

function Install-WithWinget {
    param(
        [string]$PackageId,
        [string]$Name
    )

    Write-Log "Installation de $Name..."

    try {
        $Result = winget install --id $PackageId --silent --accept-source-agreements --accept-package-agreements 2>&1
        if ($LASTEXITCODE -eq 0 -or $Result -match "already installed") {
            Write-Log "$Name installe avec succes" "SUCCESS"
            return $true
        } else {
            Write-Log "Echec installation $Name : $Result" "WARNING"
            return $false
        }
    } catch {
        Write-Log "Erreur installation $Name : $_" "ERROR"
        return $false
    }
}

function Refresh-Environment {
    Write-Log "Actualisation des variables d'environnement..."

    $Env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("Path", "User")

    # Recharger les variables
    foreach ($Level in "Machine", "User") {
        [Environment]::GetEnvironmentVariables($Level).GetEnumerator() | ForEach-Object {
            if ($_.Name -ne "Path") {
                Set-Item -Path "Env:$($_.Name)" -Value $_.Value -ErrorAction SilentlyContinue
            }
        }
    }
}

# ============================================================================
# INSTALLATION PRINCIPALE
# ============================================================================

function Start-Installation {
    Show-Banner

    Write-Log "=========================================="
    Write-Log "ULTRA-CREATE v21.4 - Installation"
    Write-Log "=========================================="
    Write-Log "Repertoire: $InstallPath"
    Write-Log "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-Log "=========================================="

    # Phase 1: Prerequisites
    Write-Log ""
    Write-Log "=== PHASE 1: VERIFICATION PREREQUIS ===" "INFO"
    Test-Prerequisites

    # Phase 2: Installation Tier 1 - Runtime
    if (-not $SkipDependencies) {
        Write-Log ""
        Write-Log "=== PHASE 2: TIER 1 - RUNTIME ===" "INFO"
        & "$ScriptPath\install-tier1-runtime.ps1" -InstallPath $InstallPath
        Refresh-Environment
    }

    # Phase 3: Installation Tier 2 - DevTools
    if (-not $SkipDependencies) {
        Write-Log ""
        Write-Log "=== PHASE 3: TIER 2 - DEVTOOLS ===" "INFO"
        & "$ScriptPath\install-tier2-devtools.ps1" -InstallPath $InstallPath
        Refresh-Environment
    }

    # Phase 4: Installation Tier 3 - Creative
    if (-not $SkipCreativeTools) {
        Write-Log ""
        Write-Log "=== PHASE 4: TIER 3 - CREATIVE ===" "INFO"
        & "$ScriptPath\install-tier3-creative.ps1" -InstallPath $InstallPath
    }

    # Phase 5: Installation Tier 4 - Deployment
    if (-not $SkipDependencies) {
        Write-Log ""
        Write-Log "=== PHASE 5: TIER 4 - DEPLOYMENT ===" "INFO"
        & "$ScriptPath\install-tier4-deployment.ps1" -InstallPath $InstallPath
        Refresh-Environment
    }

    # Phase 6: Installation Tier 5 - Mobile/Desktop
    if (-not $SkipMobileDesktop) {
        Write-Log ""
        Write-Log "=== PHASE 6: TIER 5 - MOBILE/DESKTOP ===" "INFO"
        & "$ScriptPath\install-tier5-mobile-desktop.ps1" -InstallPath $InstallPath
    }

    # Phase 7: Configuration VS Code
    Write-Log ""
    Write-Log "=== PHASE 7: CONFIGURATION VS CODE ===" "INFO"
    & "$ScriptPath\configure-vscode.ps1" -InstallPath $InstallPath

    # Phase 8: Configuration Claude MCP
    Write-Log ""
    Write-Log "=== PHASE 8: CONFIGURATION MCP ===" "INFO"
    & "$ScriptPath\configure-claude-mcp.ps1" -InstallPath $InstallPath

    # Phase 9: Setup Hindsight
    Write-Log ""
    Write-Log "=== PHASE 9: SETUP HINDSIGHT ===" "INFO"
    & "$ScriptPath\setup-hindsight.ps1" -InstallPath $InstallPath

    # Phase 10: Post-Installation
    Write-Log ""
    Write-Log "=== PHASE 10: POST-INSTALLATION ===" "INFO"
    & "$ScriptPath\post-install.ps1" -InstallPath $InstallPath

    # Phase 11: Verification
    Write-Log ""
    Write-Log "=== PHASE 11: VERIFICATION ===" "INFO"
    & "$ScriptPath\verify-installation.ps1" -InstallPath $InstallPath

    # Resume final
    $EndTime = Get-Date
    $Duration = $EndTime - $StartTime

    Write-Log ""
    Write-Log "=========================================="
    Write-Log "INSTALLATION TERMINEE" "SUCCESS"
    Write-Log "=========================================="
    Write-Log "Duree: $($Duration.ToString('hh\:mm\:ss'))"
    Write-Log "Log: $LogFile"
    Write-Log ""
    Write-Log "Pour demarrer ULTRA-CREATE:"
    Write-Log "  1. Ouvrir un nouveau terminal"
    Write-Log "  2. Taper: claude"
    Write-Log "  3. Puis: /wake"
    Write-Log "=========================================="
}

# ============================================================================
# EXECUTION
# ============================================================================

try {
    Start-Installation
    exit 0
} catch {
    Write-Log "ERREUR FATALE: $_" "ERROR"
    Write-Log "Stack: $($_.ScriptStackTrace)" "ERROR"
    exit 1
}
