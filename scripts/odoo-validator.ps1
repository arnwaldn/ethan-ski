<#
.SYNOPSIS
    Odoo Module Validator
.DESCRIPTION
    Validates Odoo module structure, code quality, and compliance with OCA standards.
.PARAMETER ModulePath
    Path to the Odoo module to validate
.PARAMETER Fix
    Attempt to fix issues automatically
.EXAMPLE
    .\odoo-validator.ps1 -ModulePath ".\my_module"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$ModulePath,

    [Parameter(Mandatory=$false)]
    [switch]$Fix,

    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

$script:errors = @()
$script:warnings = @()
$script:passed = @()

function Add-Error {
    param([string]$Message)
    $script:errors += $Message
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Add-Warning {
    param([string]$Message)
    $script:warnings += $Message
    Write-Host "[WARN]  $Message" -ForegroundColor Yellow
}

function Add-Pass {
    param([string]$Message)
    $script:passed += $Message
    if ($Verbose) {
        Write-Host "[PASS]  $Message" -ForegroundColor Green
    }
}

function Test-ModuleStructure {
    param([string]$Path)

    Write-Host "`nChecking module structure..." -ForegroundColor Cyan

    # Required files
    $requiredFiles = @(
        "__manifest__.py",
        "__init__.py",
        "README.rst"
    )

    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $Path $file
        if (Test-Path $filePath) {
            Add-Pass "Required file exists: $file"
        } else {
            if ($file -eq "README.rst") {
                Add-Warning "Missing recommended file: $file"
            } else {
                Add-Error "Missing required file: $file"
            }
        }
    }

    # Required directories
    $requiredDirs = @("models", "views", "security")

    foreach ($dir in $requiredDirs) {
        $dirPath = Join-Path $Path $dir
        if (Test-Path $dirPath) {
            Add-Pass "Required directory exists: $dir"
        } else {
            Add-Warning "Missing directory: $dir"
        }
    }

    # Check security files
    $accessFile = Join-Path $Path "security/ir.model.access.csv"
    if (Test-Path $accessFile) {
        Add-Pass "Security file exists: ir.model.access.csv"
    } else {
        Add-Warning "Missing security file: ir.model.access.csv"
    }

    # Check static folder
    $staticPath = Join-Path $Path "static/description"
    if (Test-Path $staticPath) {
        $iconPath = Join-Path $staticPath "icon.png"
        if (Test-Path $iconPath) {
            Add-Pass "Module icon exists"
        } else {
            Add-Warning "Missing module icon: static/description/icon.png"
        }
    }
}

function Test-ManifestFile {
    param([string]$Path)

    Write-Host "`nChecking __manifest__.py..." -ForegroundColor Cyan

    $manifestPath = Join-Path $Path "__manifest__.py"
    if (-not (Test-Path $manifestPath)) {
        Add-Error "Cannot find __manifest__.py"
        return
    }

    $content = Get-Content $manifestPath -Raw

    # Required fields
    $requiredFields = @("name", "version", "license", "depends")
    foreach ($field in $requiredFields) {
        if ($content -match "'$field':" -or $content -match '"' + $field + '":') {
            Add-Pass "Manifest has required field: $field"
        } else {
            Add-Error "Manifest missing required field: $field"
        }
    }

    # Version format
    if ($content -match "'version':\s*'(\d+\.\d+\.\d+\.\d+\.\d+)'") {
        Add-Pass "Version format is correct: $($Matches[1])"
    } else {
        Add-Warning "Version should follow format: XX.0.X.X.X"
    }

    # License check
    if ($content -match "'license':\s*'(LGPL-3|AGPL-3)'") {
        Add-Pass "License is valid: $($Matches[1])"
    } else {
        Add-Warning "License should be LGPL-3 or AGPL-3"
    }

    # Author check
    if ($content -match "'author':") {
        Add-Pass "Author field present"
    } else {
        Add-Warning "Missing author field"
    }
}

function Test-PythonFiles {
    param([string]$Path)

    Write-Host "`nChecking Python files..." -ForegroundColor Cyan

    $pyFiles = Get-ChildItem -Path $Path -Filter "*.py" -Recurse

    foreach ($file in $pyFiles) {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue

        if (-not $content) { continue }

        $relativePath = $file.FullName.Replace($Path, "").TrimStart("\")

        # Check encoding declaration (not needed in Python 3, but good practice)
        # if ($content -notmatch "# -\*- coding: utf-8 -\*-") {
        #     Add-Warning "$relativePath: Missing UTF-8 encoding declaration"
        # }

        # Check for print statements
        if ($content -match "(?<!#.*)print\s*\(") {
            Add-Warning "$relativePath: Contains print() statements (use logging)"
        }

        # Check for import order
        if ($content -match "from odoo import" -and $content -match "import os|import sys|import re") {
            $odooImportPos = $content.IndexOf("from odoo import")
            $stdImportPos = [Math]::Min(
                $(if ($content.IndexOf("import os") -ge 0) { $content.IndexOf("import os") } else { 999999 }),
                $(if ($content.IndexOf("import sys") -ge 0) { $content.IndexOf("import sys") } else { 999999 })
            )
            if ($stdImportPos -gt $odooImportPos -and $stdImportPos -ne 999999) {
                Add-Warning "$relativePath: Standard imports should come before Odoo imports"
            }
        }

        # Check for SQL injection vulnerabilities
        if ($content -match "execute\s*\(\s*[\"'].*%s" -and $content -match "% \(") {
            Add-Warning "$relativePath: Potential SQL injection - use parameterized queries"
        }

        # Check for hardcoded credentials
        if ($content -match "password\s*=\s*[\"'][^\"']+[\"']" -and $content -notmatch "password.*=.*False") {
            Add-Error "$relativePath: Possible hardcoded password detected"
        }

        Add-Pass "Checked: $relativePath"
    }
}

function Test-XmlFiles {
    param([string]$Path)

    Write-Host "`nChecking XML files..." -ForegroundColor Cyan

    $xmlFiles = Get-ChildItem -Path $Path -Filter "*.xml" -Recurse

    foreach ($file in $xmlFiles) {
        $relativePath = $file.FullName.Replace($Path, "").TrimStart("\")

        try {
            [xml]$xml = Get-Content $file.FullName
            Add-Pass "Valid XML: $relativePath"

            # Check for deprecated attributes
            $content = Get-Content $file.FullName -Raw
            if ($content -match 'attrs=') {
                Add-Warning "$relativePath: 'attrs' attribute is deprecated in Odoo 17+, use 'invisible', 'readonly', 'required'"
            }
            if ($content -match 'states=') {
                Add-Warning "$relativePath: 'states' attribute is deprecated, use 'invisible' with domain"
            }
        }
        catch {
            Add-Error "Invalid XML: $relativePath - $($_.Exception.Message)"
        }
    }
}

function Test-TranslationFiles {
    param([string]$Path)

    Write-Host "`nChecking translation files..." -ForegroundColor Cyan

    $i18nPath = Join-Path $Path "i18n"
    if (-not (Test-Path $i18nPath)) {
        Add-Warning "No i18n directory found"
        return
    }

    $potFile = Get-ChildItem -Path $i18nPath -Filter "*.pot" | Select-Object -First 1
    if (-not $potFile) {
        Add-Warning "No .pot template file found in i18n/"
    } else {
        Add-Pass "Translation template exists: $($potFile.Name)"
    }

    $poFiles = Get-ChildItem -Path $i18nPath -Filter "*.po"
    if ($poFiles.Count -eq 0) {
        Add-Warning "No translation files (.po) found"
    } else {
        foreach ($po in $poFiles) {
            Add-Pass "Translation file: $($po.Name)"
        }
    }
}

# Main execution
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Odoo Module Validator v1.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Validating: $ModulePath" -ForegroundColor White

if (-not (Test-Path $ModulePath)) {
    Write-Host "Error: Module path does not exist!" -ForegroundColor Red
    exit 1
}

# Run all checks
Test-ModuleStructure -Path $ModulePath
Test-ManifestFile -Path $ModulePath
Test-PythonFiles -Path $ModulePath
Test-XmlFiles -Path $ModulePath
Test-TranslationFiles -Path $ModulePath

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Validation Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Passed:   $($script:passed.Count)" -ForegroundColor Green
Write-Host "Warnings: $($script:warnings.Count)" -ForegroundColor Yellow
Write-Host "Errors:   $($script:errors.Count)" -ForegroundColor Red
Write-Host ""

if ($script:errors.Count -gt 0) {
    Write-Host "Module has errors that need to be fixed!" -ForegroundColor Red
    exit 1
} elseif ($script:warnings.Count -gt 0) {
    Write-Host "Module has warnings - review recommended" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "Module validation passed!" -ForegroundColor Green
    exit 0
}
