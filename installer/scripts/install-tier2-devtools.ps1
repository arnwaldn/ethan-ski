# ============================================================================
# ULTRA-CREATE v21.4 - Tier 2: DevTools Installation
# ============================================================================
# Claude Code CLI, VS Code, pnpm
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
            Write-Log "$Name: Verification requise" "WARNING"
            return $true
        }
    } catch {
        Write-Log "Erreur $Name : $_" "ERROR"
        return $false
    }
}

function Refresh-Path {
    $Env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("Path", "User")
}

# ============================================================================
# VS CODE
# ============================================================================
Write-Log "--- VS CODE ---"
if (Test-CommandExists "code") {
    Write-Log "VS Code deja installe" "SUCCESS"
} else {
    Install-WithWinget "Microsoft.VisualStudioCode" "Visual Studio Code"
    Refresh-Path
}

# ============================================================================
# PNPM
# ============================================================================
Write-Log "--- PNPM ---"
if (Test-CommandExists "pnpm") {
    $PnpmVersion = pnpm --version
    Write-Log "pnpm deja installe: v$PnpmVersion" "SUCCESS"
} else {
    Write-Log "Installation de pnpm via npm..."
    try {
        npm install -g pnpm 2>&1 | Out-Null
        Refresh-Path
        if (Test-CommandExists "pnpm") {
            Write-Log "pnpm: OK" "SUCCESS"
        } else {
            Write-Log "pnpm: A verifier" "WARNING"
        }
    } catch {
        Write-Log "Erreur pnpm: $_" "ERROR"
    }
}

# ============================================================================
# CLAUDE CODE CLI
# ============================================================================
Write-Log "--- CLAUDE CODE CLI ---"
if (Test-CommandExists "claude") {
    $ClaudeVersion = claude --version 2>&1
    Write-Log "Claude Code CLI deja installe: $ClaudeVersion" "SUCCESS"
} else {
    Write-Log "Installation de Claude Code CLI via npm..."
    try {
        npm install -g @anthropic-ai/claude-code 2>&1 | Out-Null
        Refresh-Path
        if (Test-CommandExists "claude") {
            Write-Log "Claude Code CLI: OK" "SUCCESS"
        } else {
            Write-Log "Claude Code CLI: A verifier apres redemarrage terminal" "WARNING"
        }
    } catch {
        Write-Log "Erreur Claude Code CLI: $_" "ERROR"
    }
}

# ============================================================================
# GITHUB CLI
# ============================================================================
Write-Log "--- GITHUB CLI ---"
if (Test-CommandExists "gh") {
    $GhVersion = gh --version | Select-Object -First 1
    Write-Log "GitHub CLI deja installe: $GhVersion" "SUCCESS"
} else {
    Install-WithWinget "GitHub.cli" "GitHub CLI"
}

# ============================================================================
# VERIFICATION FINALE
# ============================================================================
Write-Log ""
Write-Log "=== VERIFICATION TIER 2 ===" "INFO"

Refresh-Path

$Results = @{
    "VS Code"        = Test-CommandExists "code"
    "pnpm"           = Test-CommandExists "pnpm"
    "Claude CLI"     = Test-CommandExists "claude"
    "GitHub CLI"     = Test-CommandExists "gh"
}

foreach ($Item in $Results.GetEnumerator()) {
    if ($Item.Value) {
        Write-Log "$($Item.Key): OK" "SUCCESS"
    } else {
        Write-Log "$($Item.Key): A verifier apres redemarrage" "WARNING"
    }
}

Write-Log "Tier 2 DevTools: Installation terminee" "SUCCESS"
