; ============================================================================
; ULTRA-CREATE v21.4 - Inno Setup Installer Script
; ============================================================================
; Compile avec Inno Setup 6.x pour creer ULTRA-CREATE-Setup-v21.4.exe
; ============================================================================

#define MyAppName "ULTRA-CREATE"
#define MyAppVersion "21.4"
#define MyAppPublisher "ULTRA-CREATE System"
#define MyAppURL "https://github.com/ultra-create"
#define MyAppExeName "claude.exe"

[Setup]
; Informations application
AppId={{8A7F9E12-4B3C-5D6E-7F8A-9B0C1D2E3F4A}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} v{#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; Repertoire d'installation (fixe)
DefaultDirName=C:\Claude-Code-Creation
DisableDirPage=yes
DefaultGroupName={#MyAppName}

; Fichier de sortie
OutputDir=output
OutputBaseFilename=ULTRA-CREATE-Setup-v{#MyAppVersion}

; Compression maximale
Compression=lzma2/ultra64
SolidCompression=yes
LZMANumBlockThreads=4

; Privileges administrateur requis
PrivilegesRequired=admin
PrivilegesRequiredOverridesAllowed=dialog

; Apparence
WizardStyle=modern
WizardSizePercent=120
SetupIconFile=assets\ultra-create-icon.ico
WizardImageFile=assets\installer-wizard.bmp
WizardSmallImageFile=assets\installer-banner.bmp

; Autres options
AllowNoIcons=yes
DisableProgramGroupPage=yes
LicenseFile=..\LICENSE
Uninstallable=yes
UninstallDisplayIcon={app}\installer\assets\ultra-create-icon.ico
UninstallDisplayName={#MyAppName} v{#MyAppVersion}

; Version Windows minimum
MinVersion=10.0

[Languages]
Name: "french"; MessagesFile: "compiler:Languages\French.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Messages]
french.BeveledLabel=ULTRA-CREATE v21.4 - Systeme de Developpement Autonome
english.BeveledLabel=ULTRA-CREATE v21.4 - Autonomous Development System

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"
Name: "installcreative"; Description: "Installer les outils creatifs (Blender, Figma)"; GroupDescription: "Options:"; Flags: checkedonce
Name: "installmobile"; Description: "Installer les outils Mobile/Desktop (Expo, Rust, Tauri)"; GroupDescription: "Options:"; Flags: checkedonce

[Files]
; ========================================
; FICHIERS ULTRA-CREATE PRINCIPAUX
; ========================================

; Agents (110 fichiers)
Source: "..\agents\*"; DestDir: "{app}\agents"; Flags: recursesubdirs createallsubdirs; Excludes: "*.bak,*.tmp"

; Commands (39 fichiers)
Source: "..\commands\*"; DestDir: "{app}\commands"; Flags: recursesubdirs createallsubdirs; Excludes: "*.bak,*.tmp"

; Configuration Claude
Source: "..\.claude\*"; DestDir: "{app}\.claude"; Flags: recursesubdirs createallsubdirs; Excludes: "*.bak,*.tmp"

; Scripts (26 fichiers)
Source: "..\scripts\*"; DestDir: "{app}\scripts"; Flags: recursesubdirs createallsubdirs; Excludes: "*.bak,*.tmp"

; Knowledge Base
Source: "..\knowledge\*"; DestDir: "{app}\knowledge"; Flags: recursesubdirs createallsubdirs skipifsourcedoesntexist; Excludes: "*.bak,*.tmp"

; Templates
Source: "..\templates\*"; DestDir: "{app}\templates"; Flags: recursesubdirs createallsubdirs skipifsourcedoesntexist; Excludes: "*.bak,*.tmp"

; Workflows
Source: "..\workflows\*"; DestDir: "{app}\workflows"; Flags: recursesubdirs createallsubdirs skipifsourcedoesntexist; Excludes: "*.bak,*.tmp"

; Config
Source: "..\config\*"; DestDir: "{app}\config"; Flags: recursesubdirs createallsubdirs skipifsourcedoesntexist; Excludes: "*.bak,*.tmp"

; Fichiers racine
Source: "..\*.md"; DestDir: "{app}"; Excludes: "*.bak,*.tmp"
Source: "..\*.json"; DestDir: "{app}"; Excludes: "package-lock.json,*.bak,*.tmp"

; ========================================
; SCRIPTS D'INSTALLATION
; ========================================

; Scripts PowerShell
Source: "scripts\*"; DestDir: "{app}\installer\scripts"; Flags: recursesubdirs createallsubdirs

; Fichiers de configuration
Source: "config\*"; DestDir: "{app}\installer\config"; Flags: recursesubdirs createallsubdirs

; Assets
Source: "assets\*"; DestDir: "{app}\installer\assets"; Flags: recursesubdirs createallsubdirs skipifsourcedoesntexist

[Dirs]
; Creer les dossiers necessaires
Name: "{app}\hindsight"
Name: "{app}\projects"
Name: "{app}\logs"

[Icons]
; Raccourci Bureau
Name: "{autodesktop}\ULTRA-CREATE"; Filename: "cmd.exe"; Parameters: "/k cd /d ""{app}"" && claude"; WorkingDir: "{app}"; IconFilename: "{app}\installer\assets\ultra-create-icon.ico"; Comment: "ULTRA-CREATE v21.4 Terminal"; Tasks: desktopicon
Name: "{autodesktop}\ULTRA-CREATE VS Code"; Filename: "code"; Parameters: """{app}"""; WorkingDir: "{app}"; Comment: "Ouvrir ULTRA-CREATE dans VS Code"; Tasks: desktopicon

; Menu Demarrer
Name: "{group}\ULTRA-CREATE Terminal"; Filename: "cmd.exe"; Parameters: "/k cd /d ""{app}"" && claude"; WorkingDir: "{app}"; IconFilename: "{app}\installer\assets\ultra-create-icon.ico"
Name: "{group}\ULTRA-CREATE VS Code"; Filename: "code"; Parameters: """{app}"""; WorkingDir: "{app}"
Name: "{group}\Hindsight UI"; Filename: "cmd.exe"; Parameters: "/c start http://localhost:9999"; Comment: "Ouvrir Hindsight UI"
Name: "{group}\Demarrer Services"; Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\start-ultra-create.ps1"""; WorkingDir: "{app}"
Name: "{group}\Documentation"; Filename: "{app}\README.md"
Name: "{group}\Desinstaller"; Filename: "{uninstallexe}"

[Run]
; ========================================
; EXECUTION POST-INSTALLATION
; ========================================

; Script principal d'installation
Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\installer\scripts\install-ultra-create.ps1"" -InstallPath ""{app}"""; StatusMsg: "Installation des dependances et configuration..."; Flags: runhidden waituntilterminated

; Script d'installation outils creatifs (si selectionne)
Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\installer\scripts\install-tier3-creative.ps1"" -InstallPath ""{app}"""; StatusMsg: "Installation des outils creatifs..."; Flags: runhidden waituntilterminated; Tasks: installcreative

; Script d'installation mobile/desktop (si selectionne)
Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\installer\scripts\install-tier5-mobile-desktop.ps1"" -InstallPath ""{app}"""; StatusMsg: "Installation des outils Mobile/Desktop..."; Flags: runhidden waituntilterminated; Tasks: installmobile

; Verification finale
Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\installer\scripts\verify-installation.ps1"" -InstallPath ""{app}"""; StatusMsg: "Verification de l'installation..."; Flags: runhidden waituntilterminated

; Ouvrir le rapport de verification (optionnel)
Filename: "notepad.exe"; Parameters: """{app}\installer\verification-report.txt"""; Description: "Voir le rapport d'installation"; Flags: postinstall nowait skipifsilent unchecked

; Lancer ULTRA-CREATE (optionnel)
Filename: "cmd.exe"; Parameters: "/k cd /d ""{app}"" && echo. && echo ======================================== && echo   ULTRA-CREATE v21.4 installe! && echo ======================================== && echo. && echo Pour demarrer, tapez: claude && echo Puis: /wake && echo. && claude"; Description: "Lancer ULTRA-CREATE maintenant"; Flags: postinstall nowait skipifsilent

[UninstallRun]
; Arreter les services avant desinstallation
Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -Command ""cd '{app}\hindsight'; docker-compose down 2>$null"""; Flags: runhidden waituntilterminated

[UninstallDelete]
; Supprimer les fichiers generes
Type: filesandordirs; Name: "{app}\hindsight"
Type: filesandordirs; Name: "{app}\logs"
Type: filesandordirs; Name: "{app}\node_modules"
Type: filesandordirs; Name: "{app}\.next"
Type: filesandordirs; Name: "{app}\dist"

[Registry]
; Ajouter variable d'environnement
Root: HKCU; Subkey: "Environment"; ValueType: string; ValueName: "ULTRA_CREATE_PATH"; ValueData: "{app}"; Flags: uninsdeletevalue

[Code]
// ULTRA-CREATE v21.4 - Code Pascal simplifie

function InitializeSetup(): Boolean;
begin
  Result := True;
  // Verification Windows 10+
  if GetWindowsVersion < $0A000000 then
  begin
    MsgBox('ULTRA-CREATE necessite Windows 10 ou superieur.', mbError, MB_OK);
    Result := False;
  end;
end;
