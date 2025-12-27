# ============================================================================
# ULTRA-CREATE v21.4 - Verification Installation
# ============================================================================
# Verifie que tous les composants sont correctement installes
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

# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
            [System.Environment]::GetEnvironmentVariable("Path", "User")

# ============================================================================
# VERIFICATION DES FICHIERS ULTRA-CREATE
# ============================================================================

Write-Log "=== VERIFICATION FICHIERS ULTRA-CREATE ===" "INFO"

$RequiredDirs = @(
    "agents",
    "commands",
    ".claude",
    "scripts",
    "knowledge",
    "templates",
    "workflows"
)

$DirResults = @{}
foreach ($Dir in $RequiredDirs) {
    $Path = Join-Path $InstallPath $Dir
    $Exists = Test-Path $Path
    $DirResults[$Dir] = $Exists
    if ($Exists) {
        $Count = (Get-ChildItem $Path -Recurse -File -ErrorAction SilentlyContinue).Count
        Write-Log "$Dir : OK ($Count fichiers)" "SUCCESS"
    } else {
        Write-Log "$Dir : MANQUANT" "ERROR"
    }
}

# ============================================================================
# VERIFICATION RUNTIME (Tier 1)
# ============================================================================

Write-Log ""
Write-Log "=== VERIFICATION TIER 1: RUNTIME ===" "INFO"

$Tier1 = @{
    "Node.js" = @{ Command = "node"; Version = "node --version" }
    "npm"     = @{ Command = "npm"; Version = "npm --version" }
    "Python"  = @{ Command = "python"; Version = "python --version" }
    "pip"     = @{ Command = "pip"; Version = "pip --version" }
    "Git"     = @{ Command = "git"; Version = "git --version" }
    "Docker"  = @{ Command = "docker"; Version = "docker --version" }
}

$Tier1Results = @{}
foreach ($Tool in $Tier1.GetEnumerator()) {
    $Exists = Test-CommandExists $Tool.Value.Command
    $Tier1Results[$Tool.Key] = $Exists
    if ($Exists) {
        try {
            $Ver = Invoke-Expression $Tool.Value.Version 2>&1 | Select-Object -First 1
            Write-Log "$($Tool.Key): $Ver" "SUCCESS"
        } catch {
            Write-Log "$($Tool.Key): OK" "SUCCESS"
        }
    } else {
        Write-Log "$($Tool.Key): NON INSTALLE" "WARNING"
    }
}

# ============================================================================
# VERIFICATION DEVTOOLS (Tier 2)
# ============================================================================

Write-Log ""
Write-Log "=== VERIFICATION TIER 2: DEVTOOLS ===" "INFO"

$Tier2 = @{
    "VS Code"    = @{ Command = "code"; Version = "code --version" }
    "pnpm"       = @{ Command = "pnpm"; Version = "pnpm --version" }
    "Claude CLI" = @{ Command = "claude"; Version = "claude --version" }
    "GitHub CLI" = @{ Command = "gh"; Version = "gh --version" }
}

$Tier2Results = @{}
foreach ($Tool in $Tier2.GetEnumerator()) {
    $Exists = Test-CommandExists $Tool.Value.Command
    $Tier2Results[$Tool.Key] = $Exists
    if ($Exists) {
        try {
            $Ver = Invoke-Expression $Tool.Value.Version 2>&1 | Select-Object -First 1
            Write-Log "$($Tool.Key): $Ver" "SUCCESS"
        } catch {
            Write-Log "$($Tool.Key): OK" "SUCCESS"
        }
    } else {
        Write-Log "$($Tool.Key): NON INSTALLE" "WARNING"
    }
}

# ============================================================================
# VERIFICATION CREATIVE (Tier 3)
# ============================================================================

Write-Log ""
Write-Log "=== VERIFICATION TIER 3: CREATIVE ===" "INFO"

$BlenderPaths = @(
    "C:\Program Files\Blender Foundation\Blender 4.2\blender.exe",
    "C:\Program Files\Blender Foundation\Blender 4.1\blender.exe",
    "C:\Program Files\Blender Foundation\Blender\blender.exe"
)

$BlenderFound = $false
foreach ($Path in $BlenderPaths) {
    if (Test-Path $Path) {
        $BlenderFound = $true
        Write-Log "Blender: $Path" "SUCCESS"
        break
    }
}
if (-not $BlenderFound) {
    Write-Log "Blender: NON TROUVE" "WARNING"
}

$FigmaPaths = @(
    "$env:LOCALAPPDATA\Figma\Figma.exe",
    "C:\Program Files\Figma\Figma.exe"
)

$FigmaFound = $false
foreach ($Path in $FigmaPaths) {
    if (Test-Path $Path) {
        $FigmaFound = $true
        Write-Log "Figma: $Path" "SUCCESS"
        break
    }
}
if (-not $FigmaFound) {
    Write-Log "Figma: NON TROUVE" "WARNING"
}

# ============================================================================
# VERIFICATION DEPLOYMENT (Tier 4)
# ============================================================================

Write-Log ""
Write-Log "=== VERIFICATION TIER 4: DEPLOYMENT ===" "INFO"

$Tier4 = @("vercel", "netlify", "railway", "wrangler", "supabase", "firebase")

foreach ($Tool in $Tier4) {
    if (Test-CommandExists $Tool) {
        Write-Log "$Tool : OK" "SUCCESS"
    } else {
        Write-Log "$Tool : NON INSTALLE" "WARNING"
    }
}

# ============================================================================
# VERIFICATION MOBILE/DESKTOP (Tier 5)
# ============================================================================

Write-Log ""
Write-Log "=== VERIFICATION TIER 5: MOBILE/DESKTOP ===" "INFO"

$Tier5 = @{
    "Expo CLI"     = "expo"
    "EAS CLI"      = "eas"
    "React Native" = "react-native"
    "Rust"         = "rustc"
    "Cargo"        = "cargo"
    "Java"         = "java"
}

foreach ($Tool in $Tier5.GetEnumerator()) {
    if (Test-CommandExists $Tool.Value) {
        Write-Log "$($Tool.Key): OK" "SUCCESS"
    } else {
        Write-Log "$($Tool.Key): NON INSTALLE" "WARNING"
    }
}

# ============================================================================
# VERIFICATION CONFIGURATION
# ============================================================================

Write-Log ""
Write-Log "=== VERIFICATION CONFIGURATION ===" "INFO"

# CLAUDE.md
$ClaudeMd = "$env:USERPROFILE\.claude\CLAUDE.md"
if (Test-Path $ClaudeMd) {
    Write-Log "CLAUDE.md: $ClaudeMd" "SUCCESS"
} else {
    Write-Log "CLAUDE.md: NON TROUVE" "WARNING"
}

# MCP Config
$MCPConfig = "$env:APPDATA\Claude\claude_desktop_config.json"
if (Test-Path $MCPConfig) {
    Write-Log "MCP Config: $MCPConfig" "SUCCESS"
} else {
    Write-Log "MCP Config: NON TROUVE" "WARNING"
}

# Hindsight
$HindsightDir = "$InstallPath\hindsight"
if (Test-Path "$HindsightDir\docker-compose.yml") {
    Write-Log "Hindsight Config: OK" "SUCCESS"
} else {
    Write-Log "Hindsight Config: NON TROUVE" "WARNING"
}

# ============================================================================
# VERIFICATION SERVICES
# ============================================================================

Write-Log ""
Write-Log "=== VERIFICATION SERVICES ===" "INFO"

# Docker
if (Test-CommandExists "docker") {
    try {
        $DockerInfo = docker info 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Log "Docker: En cours d'execution" "SUCCESS"
        } else {
            Write-Log "Docker: Installe mais non demarre" "WARNING"
        }
    } catch {
        Write-Log "Docker: Erreur verification" "WARNING"
    }
} else {
    Write-Log "Docker: NON INSTALLE" "WARNING"
}

# Hindsight API
try {
    $Response = Invoke-WebRequest -Uri "http://localhost:8888/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($Response.StatusCode -eq 200) {
        Write-Log "Hindsight API: En ligne (port 8888)" "SUCCESS"
    }
} catch {
    Write-Log "Hindsight API: Non accessible (demarrez avec start-hindsight.bat)" "WARNING"
}

# Hindsight UI
try {
    $Response = Invoke-WebRequest -Uri "http://localhost:9999" -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($Response.StatusCode -eq 200) {
        Write-Log "Hindsight UI: En ligne (port 9999)" "SUCCESS"
    }
} catch {
    Write-Log "Hindsight UI: Non accessible" "WARNING"
}

# ============================================================================
# RAPPORT FINAL
# ============================================================================

Write-Log ""
Write-Log "========================================" "INFO"
Write-Log "       RAPPORT DE VERIFICATION" "INFO"
Write-Log "========================================" "INFO"

# Compter les resultats
$TotalChecks = 0
$PassedChecks = 0
$WarningChecks = 0

# Tier 1
foreach ($Item in $Tier1Results.GetEnumerator()) {
    $TotalChecks++
    if ($Item.Value) { $PassedChecks++ } else { $WarningChecks++ }
}

# Tier 2
foreach ($Item in $Tier2Results.GetEnumerator()) {
    $TotalChecks++
    if ($Item.Value) { $PassedChecks++ } else { $WarningChecks++ }
}

# Fichiers
foreach ($Item in $DirResults.GetEnumerator()) {
    $TotalChecks++
    if ($Item.Value) { $PassedChecks++ } else { $WarningChecks++ }
}

$Score = [math]::Round(($PassedChecks / $TotalChecks) * 100, 1)

Write-Log ""
Write-Log "Resultats:"
Write-Log "  Total verifications: $TotalChecks"
Write-Log "  Reussies: $PassedChecks" "SUCCESS"
Write-Log "  Avertissements: $WarningChecks" "WARNING"
Write-Log "  Score: $Score%" $(if ($Score -ge 80) { "SUCCESS" } elseif ($Score -ge 60) { "WARNING" } else { "ERROR" })

Write-Log ""
if ($Score -ge 90) {
    Write-Log "INSTALLATION COMPLETE - Systeme pret!" "SUCCESS"
} elseif ($Score -ge 70) {
    Write-Log "INSTALLATION PARTIELLE - Certains composants manquants" "WARNING"
    Write-Log "Un redemarrage peut resoudre certains problemes" "INFO"
} else {
    Write-Log "INSTALLATION INCOMPLETE - Verifiez les erreurs ci-dessus" "ERROR"
}

Write-Log ""
Write-Log "Pour demarrer ULTRA-CREATE:" "INFO"
Write-Log "  1. Ouvrez un nouveau terminal (important!)"
Write-Log "  2. Tapez: claude"
Write-Log "  3. Puis: /wake"
Write-Log ""
Write-Log "========================================" "INFO"

# Sauvegarder rapport
$ReportFile = "$InstallPath\installer\verification-report.txt"
$Report = @"
ULTRA-CREATE v21.4 - Rapport de Verification
Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Score: $Score%
Reussies: $PassedChecks / $TotalChecks
Avertissements: $WarningChecks

Chemin installation: $InstallPath
"@

Set-Content $ReportFile $Report -Encoding UTF8
Write-Log "Rapport sauvegarde: $ReportFile" "INFO"
