# ============================================================================
# ULTRA-CREATE v21.4 - Creation des Assets pour l'Installateur
# ============================================================================
# Ce script cree les images necessaires pour Inno Setup
# Necessite ImageMagick installe
# ============================================================================

$AssetsDir = "$PSScriptRoot\assets"

# Creer le dossier assets s'il n'existe pas
if (-not (Test-Path $AssetsDir)) {
    New-Item -ItemType Directory -Path $AssetsDir -Force | Out-Null
}

Write-Host "Creation des assets pour l'installateur ULTRA-CREATE..." -ForegroundColor Cyan

# Verifier ImageMagick
$MagickExists = Get-Command "magick" -ErrorAction SilentlyContinue
if (-not $MagickExists) {
    Write-Host ""
    Write-Host "ImageMagick non trouve. Installation avec winget..." -ForegroundColor Yellow
    winget install --id ImageMagick.ImageMagick --silent --accept-source-agreements --accept-package-agreements

    # Refresh PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("Path", "User")
}

# ============================================================================
# CREATION ICONE (256x256 ICO)
# ============================================================================

Write-Host ""
Write-Host "Creation de l'icone..." -ForegroundColor Cyan

$IconPath = "$AssetsDir\ultra-create-icon.ico"
$IconSvg = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="48" fill="url(#bg)"/>
  <text x="128" y="160" font-family="Arial Black" font-size="120" fill="white" text-anchor="middle" font-weight="bold">U</text>
</svg>
"@

$SvgPath = "$AssetsDir\icon.svg"
$IconSvg | Out-File -FilePath $SvgPath -Encoding UTF8

try {
    # Convertir SVG en ICO avec plusieurs tailles
    magick convert $SvgPath -define icon:auto-resize=256,128,64,48,32,16 $IconPath 2>$null
    if (Test-Path $IconPath) {
        Write-Host "Icone creee: $IconPath" -ForegroundColor Green
    }
} catch {
    Write-Host "Erreur creation icone. Creation d'un placeholder..." -ForegroundColor Yellow

    # Creer une icone simple avec magick
    magick convert -size 256x256 xc:"#6366f1" -fill white -gravity center -pointsize 120 -font "Arial-Black" -annotate 0 "U" -define icon:auto-resize=256,128,64,48,32,16 $IconPath 2>$null
}

# ============================================================================
# CREATION WIZARD IMAGE (164x314 BMP)
# ============================================================================

Write-Host ""
Write-Host "Creation de l'image wizard..." -ForegroundColor Cyan

$WizardPath = "$AssetsDir\installer-wizard.bmp"

try {
    # Image verticale avec gradient et texte
    magick convert -size 164x314 gradient:"#6366f1-#8b5cf6" `
        -fill white -gravity north -pointsize 14 -font "Arial-Bold" -annotate +0+20 "ULTRA" `
        -fill white -gravity north -pointsize 14 -font "Arial-Bold" -annotate +0+40 "CREATE" `
        -fill white -gravity north -pointsize 10 -font "Arial" -annotate +0+60 "v21.4" `
        -fill white -gravity south -pointsize 9 -font "Arial" -annotate +0+10 "Development" `
        BMP3:$WizardPath 2>$null

    if (Test-Path $WizardPath) {
        Write-Host "Image wizard creee: $WizardPath" -ForegroundColor Green
    }
} catch {
    # Fallback: image simple
    magick convert -size 164x314 xc:"#6366f1" BMP3:$WizardPath 2>$null
    Write-Host "Image wizard placeholder creee" -ForegroundColor Yellow
}

# ============================================================================
# CREATION BANNER IMAGE (55x55 BMP)
# ============================================================================

Write-Host ""
Write-Host "Creation de la banniere..." -ForegroundColor Cyan

$BannerPath = "$AssetsDir\installer-banner.bmp"

try {
    # Petite image carree avec "U"
    magick convert -size 55x55 gradient:"#6366f1-#8b5cf6" `
        -fill white -gravity center -pointsize 36 -font "Arial-Black" -annotate 0 "U" `
        BMP3:$BannerPath 2>$null

    if (Test-Path $BannerPath) {
        Write-Host "Banniere creee: $BannerPath" -ForegroundColor Green
    }
} catch {
    # Fallback
    magick convert -size 55x55 xc:"#6366f1" BMP3:$BannerPath 2>$null
    Write-Host "Banniere placeholder creee" -ForegroundColor Yellow
}

# ============================================================================
# NETTOYAGE
# ============================================================================

# Supprimer le SVG temporaire
if (Test-Path $SvgPath) {
    Remove-Item $SvgPath -Force
}

# ============================================================================
# RESUME
# ============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Assets crees dans: $AssetsDir" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$Assets = Get-ChildItem $AssetsDir -File
foreach ($Asset in $Assets) {
    Write-Host "  - $($Asset.Name) ($([math]::Round($Asset.Length/1KB, 1)) KB)" -ForegroundColor White
}

Write-Host ""
Write-Host "Pour compiler l'installateur:" -ForegroundColor Yellow
Write-Host "  1. Installez Inno Setup 6.x" -ForegroundColor White
Write-Host "  2. Ouvrez: ultra-create-installer.iss" -ForegroundColor White
Write-Host "  3. Compilez avec Ctrl+F9" -ForegroundColor White
Write-Host ""
