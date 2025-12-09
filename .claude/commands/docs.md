# /docs - Génération de Documentation

Génère automatiquement la documentation du projet.

## Usage
```
/docs [type] [target]
```

## Types de Documentation

### readme - README.md complet
```
/docs readme
```
Génère un README avec:
- Description du projet
- Installation
- Usage
- Structure du projet
- Variables d'environnement
- Contributing guide

### api - Documentation API
```
/docs api app/api/
```
Génère:
- Liste des endpoints
- Paramètres requis
- Exemples de requêtes
- Réponses possibles

### components - Documentation composants
```
/docs components src/components/
```
Génère pour chaque composant:
- Description
- Props avec types
- Exemples d'utilisation

### types - Documentation TypeScript
```
/docs types src/types/
```
Génère:
- Liste des interfaces
- Description des champs
- Relations entre types

### full - Documentation complète
```
/docs full
```
Génère tout: README + API + Components + Types

## Output

### Exemple README généré
```markdown
# MonProjet

Application SaaS de gestion de tâches avec équipes.

## Features

- Authentification (Email + OAuth)
- Gestion d'équipes
- Tâches avec priorités et tags
- Dashboard analytics

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm
- Compte Supabase

### Installation
\`\`\`bash
git clone https://github.com/user/monprojet
cd monprojet
pnpm install
cp .env.example .env.local
\`\`\`

### Development
\`\`\`bash
pnpm dev
\`\`\`

Open http://localhost:3000

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Supabase connection | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | Yes |
| `STRIPE_SECRET_KEY` | Stripe API key | Yes |

## Project Structure

\`\`\`
├── app/              # Next.js App Router
│   ├── (auth)/      # Auth pages
│   ├── (dashboard)/ # Protected pages
│   └── api/         # API routes
├── components/       # React components
├── lib/             # Utilities
└── prisma/          # Database schema
\`\`\`

## API Reference

See [API Documentation](./docs/api.md)

## License

MIT
```

## Options

```
--format md|html|json   # Format de sortie
--output [path]         # Chemin de sortie
--include-private       # Inclure éléments privés
--verbose              # Plus de détails
```

## Intégration CI/CD

```yaml
# .github/workflows/docs.yml
name: Generate Docs
on:
  push:
    branches: [main]
jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm docs:generate
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```
