# ULTRA-CREATE v21.4 - Installateur Windows

## Description

Cet installateur permet d'installer **ULTRA-CREATE v21.4** sur n'importe quel PC Windows avec toutes les dépendances nécessaires.

## Contenu de l'Installation

### Composants ULTRA-CREATE
- **110 Agents** spécialisés (développement, recherche, UI/UX, etc.)
- **39 Commandes** (/wake, /turbo, /research, /papers, etc.)
- **26 Scripts** (PowerShell, JavaScript, Batch)
- **48 MCP Servers** pré-configurés
- **Templates** et **Workflows** prêts à l'emploi

### Logiciels Installés

#### Tier 1: Runtime (Obligatoire)
| Logiciel | Version | Usage |
|----------|---------|-------|
| Node.js | 20 LTS | Runtime JavaScript, npm |
| Python | 3.12 | Scripts, APIs, E2B |
| Git | Latest | Contrôle de version |
| Docker Desktop | Latest | Hindsight, conteneurs |

#### Tier 2: Outils Dev (Obligatoire)
| Logiciel | Version | Usage |
|----------|---------|-------|
| VS Code | Latest | Éditeur principal |
| Claude Code CLI | Latest | Interface Claude |
| pnpm | Latest | Package manager rapide |
| GitHub CLI | Latest | Interactions GitHub |

#### Tier 3: Outils Créatifs (Optionnel)
| Logiciel | Version | Usage |
|----------|---------|-------|
| Blender | 4.2+ | 3D pour jeux, assets |
| Figma Desktop | Latest | Design UI/UX |
| ImageMagick | Latest | Manipulation images |
| FFmpeg | Latest | Vidéo/Audio |

#### Tier 4: Deployment (Obligatoire)
| Logiciel | Version | Usage |
|----------|---------|-------|
| Vercel CLI | Latest | Deploy Next.js |
| Netlify CLI | Latest | Deploy static |
| Railway CLI | Latest | Deploy fullstack |
| Wrangler | Latest | Cloudflare Workers |
| Supabase CLI | Latest | Backend |
| Firebase CLI | Latest | Google Cloud |

#### Tier 5: Mobile/Desktop (Optionnel)
| Logiciel | Version | Usage |
|----------|---------|-------|
| Expo CLI | Latest | Apps React Native |
| Rust | Latest | Tauri desktop apps |
| Android Studio | Latest | Émulateur Android |
| OpenJDK | 17 | Build Android |

## Configuration Requise

### Minimum
- Windows 10 ou 11 (64-bit)
- 8 GB RAM
- 10 GB espace disque libre
- Connexion Internet

### Recommandé
- Windows 11
- 16 GB RAM
- 20 GB espace disque SSD
- Connexion Internet rapide

## Installation

### Méthode 1: Installateur .exe (Recommandé)

1. Téléchargez `ULTRA-CREATE-Setup-v21.4.exe`
2. Exécutez en tant qu'administrateur
3. Suivez les instructions
4. Attendez l'installation (~15-30 min)
5. Redémarrez votre PC

### Méthode 2: Scripts PowerShell (Avancé)

```powershell
# Depuis le dossier installer/
Set-ExecutionPolicy Bypass -Scope Process -Force
.\scripts\install-ultra-create.ps1
```

## Compilation de l'Installateur

### Prérequis
- [Inno Setup 6.x](https://jrsoftware.org/isinfo.php)

### Étapes

1. Installez Inno Setup 6.x
2. Ouvrez `ultra-create-installer.iss`
3. Compilez (Ctrl+F9)
4. L'installateur sera créé dans `output/`

### Assets Requis

Avant de compiler, créez les fichiers suivants dans `assets/`:

- `ultra-create-icon.ico` - Icône 256x256
- `installer-wizard.bmp` - Image 164x314
- `installer-banner.bmp` - Image 55x55

## Structure des Fichiers

```
installer/
├── ultra-create-installer.iss    # Script Inno Setup
├── scripts/
│   ├── install-ultra-create.ps1  # Orchestrateur principal
│   ├── install-tier1-runtime.ps1 # Node, Python, Git, Docker
│   ├── install-tier2-devtools.ps1# VS Code, Claude CLI, pnpm
│   ├── install-tier3-creative.ps1# Blender, Figma
│   ├── install-tier4-deployment.ps1# Vercel, Netlify, etc.
│   ├── install-tier5-mobile-desktop.ps1# Expo, Rust
│   ├── configure-vscode.ps1      # Extensions VS Code
│   ├── configure-claude-mcp.ps1  # Config 48 MCPs
│   ├── setup-hindsight.ps1       # Docker Hindsight
│   ├── post-install.ps1          # Finalisation
│   └── verify-installation.ps1   # Vérification
├── config/
│   ├── claude_desktop_config.json# Config MCP
│   └── vscode-extensions.json    # Extensions VS Code
├── assets/
│   ├── ultra-create-icon.ico     # Icône
│   ├── installer-wizard.bmp      # Image wizard
│   └── installer-banner.bmp      # Bannière
├── output/                       # Installateur compilé
└── README-INSTALLER.md           # Cette documentation
```

## Post-Installation

### Configuration API Keys

Après installation, éditez le fichier `.env` :

```
C:\Claude-Code-Creation\.env
```

Ajoutez vos clés API :
- `GITHUB_PERSONAL_ACCESS_TOKEN` - [GitHub Settings](https://github.com/settings/tokens)
- `ANTHROPIC_API_KEY` - [Anthropic Console](https://console.anthropic.com)
- `SUPABASE_ACCESS_TOKEN` - [Supabase Dashboard](https://supabase.com/dashboard)
- Autres selon vos besoins

### Premier Démarrage

1. Ouvrez un nouveau terminal (important!)
2. Tapez : `claude`
3. Puis : `/wake`

### Vérification

Exécutez le script de vérification :

```powershell
C:\Claude-Code-Creation\installer\scripts\verify-installation.ps1
```

## Désinstallation

Utilisez "Ajout/Suppression de programmes" Windows ou :
- Menu Démarrer → ULTRA-CREATE → Désinstaller

## Dépannage

### Docker ne démarre pas
- Windows Home : WSL2 requis, exécutez `wsl --install`
- Windows Pro/Enterprise : Activez Hyper-V

### Claude CLI non reconnu
- Fermez et rouvrez le terminal
- Vérifiez : `npm list -g @anthropic-ai/claude-code`

### Hindsight non accessible
```powershell
cd C:\Claude-Code-Creation\hindsight
docker-compose up -d
```

### Extensions VS Code non installées
```powershell
code --install-extension dbaeumer.vscode-eslint
# Répétez pour chaque extension manquante
```

## Support

- Issues : [GitHub Issues](https://github.com/ultra-create/issues)
- Documentation : `C:\Claude-Code-Creation\knowledge\`

## Licence

ULTRA-CREATE v21.4 - Système de Développement Autonome

---

*Généré par ULTRA-CREATE v21.4*
