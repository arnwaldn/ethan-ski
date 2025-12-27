# ============================================================================
# ULTRA-CREATE v21.4 - Tier 5: Mobile & Desktop Dev Installation
# ============================================================================
# Expo CLI, React Native, Rust (Tauri), Android Studio
# ============================================================================

param(
    [string]$InstallPath = "C:\Claude-Code-Creation",
    [switch]$SkipAndroidStudio
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
        $Env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
                    [System.Environment]::GetEnvironmentVariable("Path", "User")
        Write-Log "$Name: OK" "SUCCESS"
        return $true
    } catch {
        Write-Log "Erreur $Name : $_" "ERROR"
        return $false
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
# EXPO CLI
# ============================================================================
Write-Log "--- EXPO CLI ---"
Install-NpmGlobal "expo-cli" "Expo CLI" "expo"

# ============================================================================
# EAS CLI (Expo Application Services)
# ============================================================================
Write-Log "--- EAS CLI ---"
Install-NpmGlobal "eas-cli" "EAS CLI" "eas"

# ============================================================================
# REACT NATIVE CLI
# ============================================================================
Write-Log "--- REACT NATIVE CLI ---"
Install-NpmGlobal "react-native-cli" "React Native CLI" "react-native"

# ============================================================================
# RUST (pour Tauri)
# ============================================================================
Write-Log "--- RUST ---"

if (Test-CommandExists "rustc") {
    $RustVersion = rustc --version
    Write-Log "Rust deja installe: $RustVersion" "SUCCESS"
} else {
    Write-Log "Installation de Rust via rustup..."
    try {
        # Telecharger et executer rustup-init
        $RustupUrl = "https://win.rustup.rs/x86_64"
        $RustupPath = "$env:TEMP\rustup-init.exe"

        Invoke-WebRequest -Uri $RustupUrl -OutFile $RustupPath -UseBasicParsing

        # Installer Rust en mode silencieux
        & $RustupPath -y --default-toolchain stable 2>&1 | Out-Null

        # Ajouter au PATH
        $CargoPath = "$env:USERPROFILE\.cargo\bin"
        if (Test-Path $CargoPath) {
            $CurrentPath = [Environment]::GetEnvironmentVariable("Path", "User")
            if ($CurrentPath -notlike "*$CargoPath*") {
                [Environment]::SetEnvironmentVariable("Path", "$CurrentPath;$CargoPath", "User")
            }
            $env:Path = "$env:Path;$CargoPath"
        }

        Write-Log "Rust: OK" "SUCCESS"
    } catch {
        Write-Log "Rust: Erreur installation - $($_)" "ERROR"
    }
}

# ============================================================================
# TAURI CLI
# ============================================================================
Write-Log "--- TAURI CLI ---"

if (Test-CommandExists "cargo") {
    Write-Log "Installation Tauri CLI via cargo..."
    try {
        cargo install tauri-cli 2>&1 | Out-Null
        Write-Log "Tauri CLI: OK" "SUCCESS"
    } catch {
        Write-Log "Tauri CLI: A verifier" "WARNING"
    }
} else {
    Write-Log "Tauri CLI: Rust requis, installation differee" "WARNING"
}

# ============================================================================
# ANDROID STUDIO (Optionnel - ~1GB)
# ============================================================================
if (-not $SkipAndroidStudio) {
    Write-Log "--- ANDROID STUDIO ---"

    $AndroidStudioPaths = @(
        "C:\Program Files\Android\Android Studio\bin\studio64.exe",
        "$env:LOCALAPPDATA\Programs\Android Studio\bin\studio64.exe"
    )

    $AndroidStudioInstalled = $false
    foreach ($Path in $AndroidStudioPaths) {
        if (Test-Path $Path) {
            $AndroidStudioInstalled = $true
            Write-Log "Android Studio trouve: $Path" "SUCCESS"
            break
        }
    }

    if (-not $AndroidStudioInstalled) {
        Write-Log "Android Studio: Installation (~1GB)..."
        Write-Log "Ceci peut prendre plusieurs minutes..." "INFO"
        Install-WithWinget "Google.AndroidStudio" "Android Studio"
    }

    # Configuration ANDROID_HOME
    $AndroidSdkPath = "$env:LOCALAPPDATA\Android\Sdk"
    if (Test-Path $AndroidSdkPath) {
        [Environment]::SetEnvironmentVariable("ANDROID_HOME", $AndroidSdkPath, "User")
        $env:ANDROID_HOME = $AndroidSdkPath
        Write-Log "ANDROID_HOME configure: $AndroidSdkPath" "SUCCESS"
    }
} else {
    Write-Log "Android Studio: Installation ignoree (--SkipAndroidStudio)" "INFO"
}

# ============================================================================
# JAVA JDK (requis pour Android)
# ============================================================================
Write-Log "--- JAVA JDK ---"

if (Test-CommandExists "java") {
    $JavaVersion = java -version 2>&1 | Select-Object -First 1
    Write-Log "Java deja installe" "SUCCESS"
} else {
    Install-WithWinget "Microsoft.OpenJDK.17" "OpenJDK 17"
}

# ============================================================================
# VERIFICATION FINALE
# ============================================================================
Write-Log ""
Write-Log "=== VERIFICATION TIER 5 ===" "INFO"

$Env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
            [System.Environment]::GetEnvironmentVariable("Path", "User")

$Results = @{
    "Expo CLI"       = Test-CommandExists "expo"
    "EAS CLI"        = Test-CommandExists "eas"
    "React Native"   = Test-CommandExists "react-native"
    "Rust"           = Test-CommandExists "rustc"
    "Cargo"          = Test-CommandExists "cargo"
    "Java"           = Test-CommandExists "java"
}

foreach ($Item in $Results.GetEnumerator()) {
    if ($Item.Value) {
        Write-Log "$($Item.Key): OK" "SUCCESS"
    } else {
        Write-Log "$($Item.Key): A verifier apres redemarrage" "WARNING"
    }
}

Write-Log "Tier 5 Mobile/Desktop: Installation terminee" "SUCCESS"
