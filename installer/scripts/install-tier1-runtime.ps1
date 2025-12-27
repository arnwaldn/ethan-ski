# ============================================================================
# ULTRA-CREATE v21.4 - Tier 1: Runtime Installation
# ============================================================================
# Node.js, Python, Git, Docker Desktop
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

function Test-CommandExists {
    param([string]$Command)
    return (Get-Command $Command -ErrorAction SilentlyContinue) -ne $null
}

function Install-WithWinget {
    param([string]$PackageId, [string]$Name)
    Write-Log "Installation de $Name ($PackageId)..."
    try {
        $Result = winget install --id $PackageId --silent --accept-source-agreements --accept-package-agreements 2>&1
        if ($LASTEXITCODE -eq 0 -or $Result -match "already installed" -or $Result -match "No available upgrade") {
            Write-Log "$Name: OK" "SUCCESS"
            return $true
        } else {
            Write-Log "$Name: Installation peut necessiter redemarrage" "WARNING"
            return $true
        }
    } catch {
        Write-Log "Erreur $Name : $_" "ERROR"
        return $false
    }
}

# ============================================================================
# NODE.JS LTS
# ============================================================================
Write-Log "--- NODE.JS ---"
if (Test-CommandExists "node") {
    $NodeVersion = node --version
    Write-Log "Node.js deja installe: $NodeVersion" "SUCCESS"
} else {
    Install-WithWinget "OpenJS.NodeJS.LTS" "Node.js LTS"
}

# ============================================================================
# PYTHON 3.12
# ============================================================================
Write-Log "--- PYTHON ---"
if (Test-CommandExists "python") {
    $PythonVersion = python --version 2>&1
    Write-Log "Python deja installe: $PythonVersion" "SUCCESS"
} else {
    Install-WithWinget "Python.Python.3.12" "Python 3.12"
}

# ============================================================================
# GIT
# ============================================================================
Write-Log "--- GIT ---"
if (Test-CommandExists "git") {
    $GitVersion = git --version
    Write-Log "Git deja installe: $GitVersion" "SUCCESS"
} else {
    Install-WithWinget "Git.Git" "Git"
}

# ============================================================================
# DOCKER DESKTOP
# ============================================================================
Write-Log "--- DOCKER DESKTOP ---"

# Verifier si Docker est installe
$DockerInstalled = Test-Path "C:\Program Files\Docker\Docker\Docker Desktop.exe"
if ($DockerInstalled) {
    Write-Log "Docker Desktop deja installe" "SUCCESS"
} else {
    # Verifier Windows Edition pour Hyper-V
    $WindowsEdition = (Get-WmiObject -Class Win32_OperatingSystem).Caption
    if ($WindowsEdition -match "Home") {
        Write-Log "Windows Home detecte - Docker Desktop utilisera WSL2" "WARNING"
        Write-Log "WSL2 sera configure automatiquement" "INFO"

        # Activer WSL si pas deja fait
        Write-Log "Activation de WSL..."
        dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart 2>$null
        dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart 2>$null

        # Installer WSL2
        wsl --install -d Ubuntu --no-launch 2>$null
        wsl --set-default-version 2 2>$null
    }

    Install-WithWinget "Docker.DockerDesktop" "Docker Desktop"

    Write-Log "Docker Desktop necessite un redemarrage pour finaliser l'installation" "WARNING"
    Write-Log "Apres redemarrage, lancez Docker Desktop manuellement" "INFO"
}

# ============================================================================
# VERIFICATION FINALE
# ============================================================================
Write-Log ""
Write-Log "=== VERIFICATION TIER 1 ===" "INFO"

$Results = @{
    "Node.js" = Test-CommandExists "node"
    "npm"     = Test-CommandExists "npm"
    "Python"  = Test-CommandExists "python"
    "pip"     = Test-CommandExists "pip"
    "Git"     = Test-CommandExists "git"
    "Docker"  = Test-Path "C:\Program Files\Docker\Docker\Docker Desktop.exe"
}

foreach ($Item in $Results.GetEnumerator()) {
    if ($Item.Value) {
        Write-Log "$($Item.Key): OK" "SUCCESS"
    } else {
        Write-Log "$($Item.Key): A verifier apres redemarrage" "WARNING"
    }
}

Write-Log "Tier 1 Runtime: Installation terminee" "SUCCESS"
