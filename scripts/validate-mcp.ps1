# ============================================
# ULTRA-CREATE v16.0 - MCP Server Validator
# ============================================
# Usage: .\scripts\validate-mcp.ps1 [-Profile <name>] [-Verbose]
#
# Validates MCP server availability and configuration
# ============================================

param(
    [string]$Profile = "minimal",
    [switch]$Verbose,
    [switch]$All
)

$ErrorActionPreference = "Continue"
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent $scriptPath

# Colors
function Write-Success { param($msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Failure { param($msg) Write-Host "  [FAIL] $msg" -ForegroundColor Red }
function Write-Info { param($msg) Write-Host "  [INFO] $msg" -ForegroundColor Cyan }
function Write-Warn { param($msg) Write-Host "  [WARN] $msg" -ForegroundColor Yellow }

Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "  ULTRA-CREATE v16.0 - MCP Validator" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""

# Load MCP config
$mcpConfigPath = Join-Path $rootPath ".mcp.json"
if (-not (Test-Path $mcpConfigPath)) {
    Write-Failure "MCP config not found: $mcpConfigPath"
    exit 1
}

$mcpConfig = Get-Content $mcpConfigPath -Raw | ConvertFrom-Json
$servers = $mcpConfig.mcpServers.PSObject.Properties

# Load profiles if checking specific profile
$profileServers = @()
if (-not $All) {
    $profilesPath = Join-Path $rootPath "config\mcp-profiles.json"
    if (Test-Path $profilesPath) {
        $profiles = Get-Content $profilesPath -Raw | ConvertFrom-Json
        if ($profiles.profiles.PSObject.Properties[$Profile]) {
            $profileServers = $profiles.profiles.$Profile.servers
            Write-Info "Checking profile: $Profile ($($profileServers.Count) servers)"
        } else {
            Write-Warn "Profile '$Profile' not found, checking all servers"
            $All = $true
        }
    } else {
        Write-Warn "Profiles config not found, checking all servers"
        $All = $true
    }
}

Write-Host ""
Write-Host "Validating MCP Servers..." -ForegroundColor Yellow
Write-Host "-----------------------------------------"

$totalServers = 0
$successCount = 0
$failCount = 0
$skipCount = 0

foreach ($server in $servers) {
    $name = $server.Name
    $config = $server.Value
    $command = $config.command
    $args = $config.args -join " "

    # Skip if not in profile (unless -All)
    if (-not $All -and $profileServers.Count -gt 0 -and $name -notin $profileServers) {
        $skipCount++
        if ($Verbose) {
            Write-Host "  [SKIP] $name (not in profile)" -ForegroundColor DarkGray
        }
        continue
    }

    $totalServers++

    # Check if command exists
    $commandExists = $false
    try {
        $null = Get-Command $command -ErrorAction Stop
        $commandExists = $true
    } catch {
        # Try with where.exe
        $result = & where.exe $command 2>$null
        if ($result) { $commandExists = $true }
    }

    if ($commandExists) {
        # Check for missing env vars
        $missingEnv = @()
        if ($config.env) {
            foreach ($envVar in $config.env.PSObject.Properties) {
                $value = $envVar.Value
                if ($value -match '^\$\{(\w+)\}$') {
                    $varName = $matches[1]
                    if (-not [Environment]::GetEnvironmentVariable($varName)) {
                        $missingEnv += $varName
                    }
                }
                elseif ($value -match 'REPLACE_WITH|YOUR_') {
                    $missingEnv += $envVar.Name
                }
            }
        }

        if ($missingEnv.Count -gt 0) {
            Write-Warn "$name - missing env: $($missingEnv -join ', ')"
            $successCount++  # Command exists but config incomplete
        } else {
            Write-Success "$name"
            $successCount++
        }

        if ($Verbose) {
            Write-Host "       Command: $command $args" -ForegroundColor DarkGray
        }
    } else {
        Write-Failure "$name - command not found: $command"
        $failCount++
    }
}

Write-Host ""
Write-Host "-----------------------------------------"
Write-Host "Results:" -ForegroundColor Yellow
Write-Host "  Total checked: $totalServers"
Write-Success "Available: $successCount"
if ($failCount -gt 0) { Write-Failure "Failed: $failCount" }
if ($skipCount -gt 0) { Write-Info "Skipped: $skipCount" }

Write-Host ""

# Check for exposed secrets
Write-Host "Security Check..." -ForegroundColor Yellow
Write-Host "-----------------------------------------"

$exposedSecrets = @()
foreach ($server in $servers) {
    if ($server.Value.env) {
        foreach ($envVar in $server.Value.env.PSObject.Properties) {
            $value = $envVar.Value
            # Check for hardcoded tokens (not env vars)
            if ($value -notmatch '^\$\{' -and $value.Length -gt 20) {
                if ($value -match '^(ghp_|sk_|sk-|ntn_|sntryu_|r8_|hf_|phx_|re_|lin_api_|fc-)') {
                    $exposedSecrets += @{
                        Server = $server.Name
                        Key = $envVar.Name
                        Preview = $value.Substring(0, [Math]::Min(10, $value.Length)) + "..."
                    }
                }
            }
        }
    }
}

if ($exposedSecrets.Count -gt 0) {
    Write-Failure "SECURITY WARNING: $($exposedSecrets.Count) exposed API keys found!"
    Write-Host ""
    foreach ($secret in $exposedSecrets) {
        Write-Host "  - $($secret.Server): $($secret.Key) = $($secret.Preview)" -ForegroundColor Red
    }
    Write-Host ""
    Write-Warn "Move these to .env.secrets and use `${VAR_NAME}` syntax in .mcp.json"
} else {
    Write-Success "No exposed secrets detected"
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "  Validation complete" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""

# Exit code
if ($failCount -gt 0 -or $exposedSecrets.Count -gt 0) {
    exit 1
} else {
    exit 0
}
