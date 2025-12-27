# Detect Blender and Unity paths
$ErrorActionPreference = "SilentlyContinue"

Write-Host "=== Detection des outils 3D ===" -ForegroundColor Cyan

# Blender
$BlenderPaths = @(
    "C:\Program Files\Blender Foundation\Blender 4.3",
    "C:\Program Files\Blender Foundation\Blender 4.2",
    "C:\Program Files\Blender Foundation\Blender 4.1",
    "C:\Program Files\Blender Foundation\Blender 4.0",
    "C:\Program Files\Blender Foundation\Blender"
)
$BlenderFound = $null
foreach ($p in $BlenderPaths) {
    if (Test-Path $p) {
        $BlenderFound = $p
        Write-Host "Blender: $p" -ForegroundColor Green
        break
    }
}
if (-not $BlenderFound) {
    Write-Host "Blender: Non trouve" -ForegroundColor Red
}

# Blender exe
$BlenderExe = Get-ChildItem "C:\Program Files\Blender Foundation" -Recurse -Filter "blender.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($BlenderExe) {
    Write-Host "Blender exe: $($BlenderExe.FullName)" -ForegroundColor Green
}

# Blender version for addon path
if ($BlenderFound) {
    $Version = [regex]::Match($BlenderFound, "Blender (\d+\.\d+)").Groups[1].Value
    if ($Version) {
        $AddonPath = "$env:APPDATA\Blender Foundation\Blender\$Version\scripts\addons"
        Write-Host "Addon path: $AddonPath" -ForegroundColor Yellow
    }
}

Write-Host ""

# Unity Hub
$UnityHubPaths = @(
    "C:\Program Files\Unity Hub\Unity Hub.exe",
    "$env:LOCALAPPDATA\Programs\Unity Hub\Unity Hub.exe"
)
$UnityHubFound = $null
foreach ($p in $UnityHubPaths) {
    if (Test-Path $p) {
        $UnityHubFound = $p
        Write-Host "Unity Hub: $p" -ForegroundColor Green
        break
    }
}
if (-not $UnityHubFound) {
    Write-Host "Unity Hub: Non trouve" -ForegroundColor Red
}

# Unity Editors
$EditorPath = "C:\Program Files\Unity\Hub\Editor"
if (Test-Path $EditorPath) {
    Write-Host "Unity Editors installes:" -ForegroundColor Green
    Get-ChildItem $EditorPath -Directory | ForEach-Object {
        Write-Host "  - $($_.Name)" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "=== Fin detection ===" -ForegroundColor Cyan
