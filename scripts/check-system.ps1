# ULTRA-CREATE v20.0 - System Check
Write-Host "`n=== ULTRA-CREATE v20.0 - VERIFICATION SYSTEME ===" -ForegroundColor Cyan
Write-Host ""

# 1. Variables d'environnement
Write-Host "[1] VARIABLES D'ENVIRONNEMENT (persistantes)" -ForegroundColor Yellow
$envVars = @(
    'SUPABASE_ACCESS_TOKEN',
    'EXA_API_KEY',
    'GITLAB_TOKEN',
    'HUGGINGFACE_API_KEY',
    'FIRECRAWL_API_KEY'
)

foreach ($var in $envVars) {
    $val = [Environment]::GetEnvironmentVariable($var, 'User')
    if ($val) {
        $masked = $val.Substring(0, [Math]::Min(8, $val.Length)) + "..."
        Write-Host "    OK: $var = $masked" -ForegroundColor Green
    } else {
        Write-Host "    MANQUANT: $var" -ForegroundColor Red
    }
}

# 2. Docker Hindsight
Write-Host "`n[2] HINDSIGHT (memoire persistante)" -ForegroundColor Yellow
try {
    $containers = docker ps --filter "name=hindsight" --format "{{.Names}}: {{.Status}}" 2>$null
    if ($containers) {
        $containers | ForEach-Object { Write-Host "    OK: $_" -ForegroundColor Green }
    } else {
        Write-Host "    ARRETE: Hindsight non demarre" -ForegroundColor Red
    }
} catch {
    Write-Host "    ERREUR: Docker non accessible" -ForegroundColor Red
}

# 3. Fichiers de config
Write-Host "`n[3] FICHIERS DE CONFIGURATION" -ForegroundColor Yellow
$configs = @(
    'C:\Users\arnau\.claude\settings.json',
    'C:\Users\arnau\.claude\CLAUDE.md',
    'C:\Claude-Code-Creation\CLAUDE.md',
    'C:\Claude-Code-Creation\.claude\settings.json'
)

foreach ($cfg in $configs) {
    if (Test-Path $cfg) {
        Write-Host "    OK: $cfg" -ForegroundColor Green
    } else {
        Write-Host "    MANQUANT: $cfg" -ForegroundColor Red
    }
}

# 4. MCPs count
Write-Host "`n[4] MCPs CONFIGURES" -ForegroundColor Yellow
try {
    $settings = Get-Content 'C:\Users\arnau\.claude\settings.json' -Raw | ConvertFrom-Json
    $mcpCount = ($settings.mcpServers | Get-Member -MemberType NoteProperty).Count
    Write-Host "    OK: $mcpCount MCPs dans settings.json" -ForegroundColor Green
} catch {
    Write-Host "    ERREUR: Impossible de lire settings.json" -ForegroundColor Red
}

# 5. Hooks
Write-Host "`n[5] HOOKS ACTIFS" -ForegroundColor Yellow
try {
    $hooks = $settings.hooks
    $stopCount = $hooks.Stop.Count
    $postCount = $hooks.PostToolUse.Count
    Write-Host "    OK: Stop=$stopCount, PostToolUse=$postCount" -ForegroundColor Green
} catch {
    Write-Host "    ERREUR: Impossible de lire les hooks" -ForegroundColor Red
}

Write-Host "`n=== FIN VERIFICATION ===" -ForegroundColor Cyan
