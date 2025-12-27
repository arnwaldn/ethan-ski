# {{APP_NAME}} - Landing Page

Landing page moderne et responsive avec Next.js 15.

## Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** Tailwind CSS 4
- **Animations:** Framer Motion
- **Icons:** Lucide React

## Installation

```bash
npm install
npm run dev
```

## Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
└── components/
    ├── navbar.tsx
    ├── hero.tsx
    ├── features.tsx
    ├── pricing.tsx
    ├── cta.tsx
    └── footer.tsx
```

## Personnalisation

Remplacez les variables {{VAR}} dans les fichiers:
- `{{APP_NAME}}` - Nom de l'app
- `{{APP_TAGLINE}}` - Tagline courte
- `{{APP_HEADLINE}}` - Titre principal
- `{{APP_DESCRIPTION}}` - Description

## Déploiement

```bash
npm run build
# Deploy sur Vercel
```
