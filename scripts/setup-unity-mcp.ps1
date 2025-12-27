# Setup Unity MCP for ULTRA-CREATE
$ErrorActionPreference = "Continue"

Write-Host "=== Setup Unity MCP ===" -ForegroundColor Cyan

# Find Unity projects
Write-Host ""
Write-Host "Recherche projets Unity..." -ForegroundColor Yellow

$UnityProjects = @()

# Common locations
$SearchPaths = @(
    "C:\Users\arnau\Documents",
    "C:\Users\arnau\Unity Projects",
    "C:\Users\arnau",
    "D:\Unity",
    "D:\Projects"
)

foreach ($SearchPath in $SearchPaths) {
    if (Test-Path $SearchPath) {
        $Found = Get-ChildItem -Path $SearchPath -Filter "ProjectSettings" -Directory -Recurse -Depth 3 -ErrorAction SilentlyContinue
        foreach ($Item in $Found) {
            $ProjectPath = Split-Path $Item.FullName -Parent
            $ManifestPath = Join-Path $ProjectPath "Packages\manifest.json"
            if (Test-Path $ManifestPath) {
                $UnityProjects += $ProjectPath
                Write-Host "  Trouve: $ProjectPath" -ForegroundColor Green
            }
        }
    }
}

if ($UnityProjects.Count -eq 0) {
    Write-Host "  Aucun projet Unity trouve" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pour creer un nouveau projet avec Unity MCP:" -ForegroundColor Cyan
    Write-Host "1. Ouvrir Unity Hub"
    Write-Host "2. Creer nouveau projet (3D ou 2D)"
    Write-Host "3. Une fois ouvert, Window > Package Manager"
    Write-Host "4. + > Add package from git URL"
    Write-Host "5. Coller: https://github.com/CoderGamester/mcp-unity.git"
    Write-Host ""

    # Create template manifest for future projects
    $TemplatePath = "C:\Claude-Code-Creation\templates\unity-mcp"
    if (-not (Test-Path $TemplatePath)) {
        New-Item -ItemType Directory -Path $TemplatePath -Force | Out-Null
    }

    $ManifestContent = @'
{
  "dependencies": {
    "com.codergamester.mcp-unity": "https://github.com/CoderGamester/mcp-unity.git",
    "com.unity.collab-proxy": "2.6.0",
    "com.unity.feature.development": "1.0.2",
    "com.unity.textmeshpro": "3.2.0-pre.10",
    "com.unity.timeline": "1.8.7",
    "com.unity.ugui": "2.0.0",
    "com.unity.visualscripting": "1.9.4"
  }
}
'@

    $ManifestContent | Out-File -FilePath "$TemplatePath\manifest.json" -Encoding UTF8
    Write-Host "Template manifest cree: $TemplatePath\manifest.json" -ForegroundColor Green
    Write-Host "Copiez ce fichier dans Packages/ de votre projet Unity" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Projets trouves: $($UnityProjects.Count)" -ForegroundColor Green

    foreach ($Project in $UnityProjects) {
        $ManifestPath = Join-Path $Project "Packages\manifest.json"

        Write-Host ""
        Write-Host "Projet: $Project" -ForegroundColor Cyan

        # Read manifest
        $Manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json

        # Check if MCP already installed
        if ($Manifest.dependencies.'com.codergamester.mcp-unity') {
            Write-Host "  Unity MCP: Deja installe" -ForegroundColor Green
        } else {
            Write-Host "  Unity MCP: Non installe" -ForegroundColor Yellow
            Write-Host "  Ajout du package..." -ForegroundColor Yellow

            # Add MCP dependency
            $Manifest.dependencies | Add-Member -NotePropertyName "com.codergamester.mcp-unity" -NotePropertyValue "https://github.com/CoderGamester/mcp-unity.git" -Force

            # Backup original
            Copy-Item $ManifestPath "$ManifestPath.backup"

            # Save updated manifest
            $Manifest | ConvertTo-Json -Depth 10 | Out-File $ManifestPath -Encoding UTF8

            Write-Host "  Unity MCP: AJOUTE" -ForegroundColor Green
            Write-Host "  Backup: $ManifestPath.backup" -ForegroundColor Gray
            Write-Host "  Ouvrez le projet dans Unity pour finaliser l'installation" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "=== Setup termine ===" -ForegroundColor Green
