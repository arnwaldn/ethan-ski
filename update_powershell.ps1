# PowerShell Update Script
Write-Host "=== DIAGNOSTIC POWERSHELL ===" -ForegroundColor Cyan

# Current version
Write-Host "`n[1] Version actuelle:" -ForegroundColor Yellow
$PSVersionTable.PSVersion

# Check for PowerShell 7
Write-Host "`n[2] PowerShell 7 installe:" -ForegroundColor Yellow
$ps7 = Get-Command pwsh -ErrorAction SilentlyContinue
if ($ps7) {
    Write-Host "Oui - " -NoNewline
    & pwsh -Version
} else {
    Write-Host "Non installe"
}

# Check winget
Write-Host "`n[3] Winget disponible:" -ForegroundColor Yellow
$winget = Get-Command winget -ErrorAction SilentlyContinue
if ($winget) {
    Write-Host "Oui"
    Write-Host "`n[4] Versions PowerShell disponibles:" -ForegroundColor Yellow
    winget search Microsoft.PowerShell --source winget
} else {
    Write-Host "Non - Installation manuelle requise"
}

Write-Host "`n=== FIN DIAGNOSTIC ===" -ForegroundColor Cyan
