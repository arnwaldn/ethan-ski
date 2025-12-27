# ============================================================================
# ULTRA-CREATE v21.4 - Tier 4: Deployment CLIs Installation
# ============================================================================
# Vercel, Netlify, Railway, Wrangler, Supabase, Firebase
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

function Install-NpmGlobal {
    param([string]$Package, [string]$Name, [string]$Command = $null)

    if (-not $Command) { $Command = $Package }

    Write-Log "Installation de $Name..."
    try {
        if (Test-CommandExists $Command) {
            Write-Log "$Name deja installe" "SUCCESS"
            return $true
        }

        npm install -g $Package 2>&1 | Out-Null

        # Refresh PATH
        $Env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
                    [System.Environment]::GetEnvironmentVariable("Path", "User")

        if (Test-CommandExists $Command) {
            Write-Log "$Name: OK" "SUCCESS"
            return $true
        } else {
            Write-Log "$Name: Installe (verifier apres redemarrage)" "WARNING"
            return $true
        }
    } catch {
        Write-Log "Erreur $Name : $_" "ERROR"
        return $false
    }
}

# ============================================================================
# VERCEL CLI
# ============================================================================
Write-Log "--- VERCEL CLI ---"
Install-NpmGlobal "vercel" "Vercel CLI"

# ============================================================================
# NETLIFY CLI
# ============================================================================
Write-Log "--- NETLIFY CLI ---"
Install-NpmGlobal "netlify-cli" "Netlify CLI" "netlify"

# ============================================================================
# RAILWAY CLI
# ============================================================================
Write-Log "--- RAILWAY CLI ---"
Install-NpmGlobal "@railway/cli" "Railway CLI" "railway"

# ============================================================================
# WRANGLER (Cloudflare Workers)
# ============================================================================
Write-Log "--- WRANGLER ---"
Install-NpmGlobal "wrangler" "Wrangler (Cloudflare)"

# ============================================================================
# SUPABASE CLI
# ============================================================================
Write-Log "--- SUPABASE CLI ---"
Install-NpmGlobal "supabase" "Supabase CLI"

# ============================================================================
# FIREBASE CLI
# ============================================================================
Write-Log "--- FIREBASE CLI ---"
Install-NpmGlobal "firebase-tools" "Firebase CLI" "firebase"

# ============================================================================
# AWS CLI (via winget)
# ============================================================================
Write-Log "--- AWS CLI ---"
if (Test-CommandExists "aws") {
    Write-Log "AWS CLI deja installe" "SUCCESS"
} else {
    Write-Log "Installation AWS CLI..."
    try {
        winget install --id Amazon.AWSCLI --silent --accept-source-agreements --accept-package-agreements 2>&1 | Out-Null
        Write-Log "AWS CLI: OK" "SUCCESS"
    } catch {
        Write-Log "AWS CLI: A installer manuellement si necessaire" "WARNING"
    }
}

# ============================================================================
# VERIFICATION FINALE
# ============================================================================
Write-Log ""
Write-Log "=== VERIFICATION TIER 4 ===" "INFO"

# Refresh PATH
$Env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
            [System.Environment]::GetEnvironmentVariable("Path", "User")

$Results = @{
    "Vercel"   = Test-CommandExists "vercel"
    "Netlify"  = Test-CommandExists "netlify"
    "Railway"  = Test-CommandExists "railway"
    "Wrangler" = Test-CommandExists "wrangler"
    "Supabase" = Test-CommandExists "supabase"
    "Firebase" = Test-CommandExists "firebase"
    "AWS CLI"  = Test-CommandExists "aws"
}

foreach ($Item in $Results.GetEnumerator()) {
    if ($Item.Value) {
        Write-Log "$($Item.Key): OK" "SUCCESS"
    } else {
        Write-Log "$($Item.Key): A verifier apres redemarrage" "WARNING"
    }
}

Write-Log "Tier 4 Deployment: Installation terminee" "SUCCESS"
