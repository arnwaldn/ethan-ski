# ============================================================================
# ULTRA-CREATE v21.4 - Tier 3: Creative Tools Installation
# ============================================================================
# Blender, Figma Desktop
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

# ============================================================================
# BLENDER
# ============================================================================
Write-Log "--- BLENDER ---"

$BlenderPaths = @(
    "C:\Program Files\Blender Foundation\Blender 4.2\blender.exe",
    "C:\Program Files\Blender Foundation\Blender 4.1\blender.exe",
    "C:\Program Files\Blender Foundation\Blender 4.0\blender.exe",
    "C:\Program Files\Blender Foundation\Blender\blender.exe"
)

$BlenderInstalled = $false
foreach ($Path in $BlenderPaths) {
    if (Test-Path $Path) {
        $BlenderInstalled = $true
        Write-Log "Blender trouve: $Path" "SUCCESS"
        break
    }
}

if (-not $BlenderInstalled) {
    Install-WithWinget "BlenderFoundation.Blender" "Blender"
}

# ============================================================================
# FIGMA DESKTOP
# ============================================================================
Write-Log "--- FIGMA DESKTOP ---"

$FigmaPaths = @(
    "$env:LOCALAPPDATA\Figma\Figma.exe",
    "C:\Program Files\Figma\Figma.exe",
    "$env:LOCALAPPDATA\Programs\Figma\Figma.exe"
)

$FigmaInstalled = $false
foreach ($Path in $FigmaPaths) {
    if (Test-Path $Path) {
        $FigmaInstalled = $true
        Write-Log "Figma trouve: $Path" "SUCCESS"
        break
    }
}

if (-not $FigmaInstalled) {
    Install-WithWinget "Figma.Figma" "Figma Desktop"
}

# ============================================================================
# IMAGEMAGICK (pour manipulation images)
# ============================================================================
Write-Log "--- IMAGEMAGICK ---"

if (Get-Command "magick" -ErrorAction SilentlyContinue) {
    Write-Log "ImageMagick deja installe" "SUCCESS"
} else {
    Install-WithWinget "ImageMagick.ImageMagick" "ImageMagick"
}

# ============================================================================
# FFMPEG (pour video/audio)
# ============================================================================
Write-Log "--- FFMPEG ---"

if (Get-Command "ffmpeg" -ErrorAction SilentlyContinue) {
    Write-Log "FFmpeg deja installe" "SUCCESS"
} else {
    Install-WithWinget "Gyan.FFmpeg" "FFmpeg"
}

# ============================================================================
# VERIFICATION FINALE
# ============================================================================
Write-Log ""
Write-Log "=== VERIFICATION TIER 3 ===" "INFO"

$BlenderFound = $false
foreach ($Path in $BlenderPaths) {
    if (Test-Path $Path) { $BlenderFound = $true; break }
}

$FigmaFound = $false
foreach ($Path in $FigmaPaths) {
    if (Test-Path $Path) { $FigmaFound = $true; break }
}

$Results = @{
    "Blender"     = $BlenderFound
    "Figma"       = $FigmaFound
    "ImageMagick" = (Get-Command "magick" -ErrorAction SilentlyContinue) -ne $null
    "FFmpeg"      = (Get-Command "ffmpeg" -ErrorAction SilentlyContinue) -ne $null
}

foreach ($Item in $Results.GetEnumerator()) {
    if ($Item.Value) {
        Write-Log "$($Item.Key): OK" "SUCCESS"
    } else {
        Write-Log "$($Item.Key): A verifier" "WARNING"
    }
}

Write-Log "Tier 3 Creative: Installation terminee" "SUCCESS"
