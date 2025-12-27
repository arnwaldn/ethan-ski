# /profile - GitHub Profile README Generator

Génère des GitHub Profile READMEs professionnels avec badges, stats et sections modulaires.

## Usage
```
/profile                           # Génération interactive
/profile "[nom]" --style=elaborate
/profile --github=username         # Auto-fetch depuis GitHub API
```

## Styles Disponibles

| Style | Description |
|-------|-------------|
| `elaborate` | Complet avec toutes les sections, animations, stats |
| `minimal` | Minimaliste et épuré, texte simple |
| `dynamic` | Avec stats temps réel, WakaTime, Spotify |
| `code-styled` | Style terminal/code avec blocs de code |
| `multimedia` | Avec GIFs, animations, icons stylisés |
| `tabular` | Format tableau structuré |
| `default` | Style standard équilibré |

## Informations Collectées

### Mode Interactif
1. **Nom complet** - Ex: "John Doe"
2. **Username GitHub** - Ex: "johndoe"
3. **Titre/Rôle** - Ex: "Full Stack Developer"
4. **Bio courte** - Ex: "Passionate about building great software"
5. **Localisation** - Ex: "San Francisco, CA"
6. **Email** - Ex: "john@example.com"
7. **LinkedIn** - Ex: "johndoe"
8. **Twitter** - Ex: "@johndoe"
9. **Technologies** - Ex: "JavaScript, TypeScript, React, Node.js"

### Mode GitHub (--github=username)
Récupère automatiquement depuis l'API GitHub:
- Nom, bio, localisation
- Repos publics, followers
- Langages utilisés

## Sections Générées

### Toujours Inclus
- Header avec nom et greeting animé
- Badges sociaux (LinkedIn, Twitter, Email)
- Section About Me
- Tech Stack avec badges (50+ technologies)
- GitHub Stats cards
- Profile views counter

### Selon le Style
| Section | elaborate | minimal | dynamic | code-styled | multimedia | tabular | default |
|---------|-----------|---------|---------|-------------|------------|---------|---------|
| Typing animation | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Contribution graph | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Trophées GitHub | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Featured projects | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| WakaTime stats | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Spotify widget | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| GIFs/Animations | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Tables structurées | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

## Exemples

### Style Elaborate (Complet)
```
/profile "John Doe" --style=elaborate
```
Génère un profil complet avec:
- Header animé (capsule-render)
- Typing SVG animation
- Tous les badges sociaux
- Tech stack complet
- GitHub stats + streak + top langs
- Contribution graph
- Trophées
- Featured projects

### Style Minimal
```
/profile "John Doe" --style=minimal
```
Génère un profil épuré:
- Simple greeting
- Bio courte
- Tech stack inline
- Stats basiques

### Style Dynamic
```
/profile "John Doe" --style=dynamic
```
Génère un profil avec données temps réel:
- WakaTime coding stats
- Spotify "Now Playing"
- Activity graph
- Stats actualisées

### Depuis GitHub
```
/profile --github=johndoe
```
Récupère les infos GitHub et génère automatiquement.

## Template Utilisé

Le template source se trouve dans:
```
templates/github-profile/
├── profile-template.md     # Template principal
├── sections/               # Sections modulaires
│   ├── header.md
│   ├── social-badges.md
│   ├── about-me.md
│   ├── tech-stack.md
│   ├── github-stats.md
│   ├── projects.md
│   └── contact.md
└── examples/               # 7 styles pré-faits
    ├── elaborate.md
    ├── minimal.md
    ├── dynamic.md
    ├── code-styled.md
    ├── multimedia.md
    ├── tabular.md
    └── default.md
```

## Services Externes Utilisés

| Service | URL | Usage |
|---------|-----|-------|
| shields.io | shields.io | Badges personnalisés |
| simple-icons | simpleicons.org | Logos technologies |
| github-readme-stats | github.com/anuraghazra | Stats cards |
| streak-stats | streak-stats.demolab.com | Streak counter |
| github-profile-trophy | github.com/ryo-ma | Trophées |
| readme-typing-svg | github.com/DenverCoder1 | Typing animation |
| capsule-render | github.com/kyechan99 | Headers/footers animés |
| skillicons.dev | skillicons.dev | Icons technologies |

## Output Attendu

```
✅ GitHub Profile README généré

📁 Fichier: profile-readme.md

📋 Sections incluses:
- Header avec greeting animé
- Badges sociaux (4)
- About Me
- Tech Stack (12 technologies)
- GitHub Stats (3 cards)
- Featured Projects (2)
- Contact CTA

🎨 Style: elaborate

📝 Instructions:
1. Créez un repo avec votre username GitHub (ex: johndoe/johndoe)
2. Copiez le contenu généré dans README.md
3. Push vers GitHub
4. Le README apparaîtra sur votre profil!

🔗 Prévisualisation: Copié dans le presse-papier
```

## Agent Utilisé

Cette commande utilise les templates et sections modulaires pour assembler le README final selon le style choisi.
