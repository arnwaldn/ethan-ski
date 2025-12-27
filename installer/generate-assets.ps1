# Generate Assets for ULTRA-CREATE Installer
$AssetsDir = "C:\Claude-Code-Creation\installer\assets"

# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

# Find ImageMagick
$magickPaths = @(
    "C:\Program Files\ImageMagick-7.1.2-Q16-HDRI\magick.exe",
    "C:\Program Files\ImageMagick-7.1.2-Q16\magick.exe"
)

$magick = $null
foreach ($p in $magickPaths) {
    if (Test-Path $p) {
        $magick = $p
        break
    }
}

# Search in Program Files
if (-not $magick) {
    $found = Get-ChildItem "C:\Program Files\ImageMagick*" -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $testPath = Join-Path $found.FullName "magick.exe"
        if (Test-Path $testPath) {
            $magick = $testPath
        }
    }
}

if (-not $magick) {
    $magick = "magick"
}

Write-Host "Using ImageMagick: $magick" -ForegroundColor Cyan

# Create assets directory
if (-not (Test-Path $AssetsDir)) {
    New-Item -ItemType Directory -Path $AssetsDir -Force | Out-Null
}

# Create icon (256x256) - Simple purple gradient with "U"
Write-Host "Creating icon..." -ForegroundColor Yellow
$iconPath = "$AssetsDir\ultra-create-icon.ico"

try {
    & $magick convert -size 256x256 "gradient:#6366f1-#8b5cf6" -fill white -gravity center -pointsize 160 -font Arial-Bold -annotate 0 "U" -define icon:auto-resize=256,128,64,48,32,16 $iconPath
    Write-Host "Icon created: $iconPath" -ForegroundColor Green
} catch {
    Write-Host "Error creating icon: $_" -ForegroundColor Red
}

# Create wizard image (164x314) - Vertical purple gradient
Write-Host "Creating wizard image..." -ForegroundColor Yellow
$wizardPath = "$AssetsDir\installer-wizard.bmp"

try {
    & $magick convert -size 164x314 "gradient:#6366f1-#8b5cf6" -fill white -gravity north -pointsize 16 -font Arial-Bold -annotate +0+30 "ULTRA" -annotate +0+50 "CREATE" -pointsize 12 -annotate +0+75 "v21.4" -gravity south -pointsize 10 -annotate +0+20 "Autonomous Dev" BMP3:$wizardPath
    Write-Host "Wizard image created: $wizardPath" -ForegroundColor Green
} catch {
    Write-Host "Error creating wizard: $_" -ForegroundColor Red
    # Fallback simple
    & $magick convert -size 164x314 "xc:#6366f1" BMP3:$wizardPath
}

# Create banner (55x55) - Small purple square with "U"
Write-Host "Creating banner..." -ForegroundColor Yellow
$bannerPath = "$AssetsDir\installer-banner.bmp"

try {
    & $magick convert -size 55x55 "gradient:#6366f1-#8b5cf6" -fill white -gravity center -pointsize 36 -font Arial-Bold -annotate 0 "U" BMP3:$bannerPath
    Write-Host "Banner created: $bannerPath" -ForegroundColor Green
} catch {
    Write-Host "Error creating banner: $_" -ForegroundColor Red
    & $magick convert -size 55x55 "xc:#6366f1" BMP3:$bannerPath
}

Write-Host ""
Write-Host "Assets created in: $AssetsDir" -ForegroundColor Green
Get-ChildItem $AssetsDir
