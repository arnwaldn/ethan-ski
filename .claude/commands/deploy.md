# /deploy - Déployer le projet

Déploie le projet actuel sur la plateforme appropriée.

## Usage
```
/deploy [platform]
```

## Plateformes
- `vercel` - Vercel (Next.js, React)
- `netlify` - Netlify (Astro, static)
- `railway` - Railway (full-stack, Docker)
- `cloudflare` - Cloudflare Workers (edge)
- `expo` - App Store + Play Store
- `auto` - Détection automatique

## Workflow
1. Vérification de la qualité (lint, types)
2. Exécution des tests
3. Build de production
4. Déploiement
5. Vérification post-deploy

## Exemples
```
/deploy           # Auto-detect platform
/deploy vercel    # Force Vercel
/deploy expo      # Build + submit to stores
```
