# Profil Utilisateur - ULTRA-CREATE

## Instructions
Ce fichier stocke les préférences et le contexte utilisateur pour personnaliser mes réponses et actions.
**Mettez à jour ce fichier avec vos préférences pour une expérience optimale.**

---

## Identité
```yaml
nom: "[Votre nom]"
role: "[Développeur/Designer/Entrepreneur/etc]"
experience: "[Junior/Mid/Senior]"
langue_preferee: "français"
```

## Préférences Techniques

### Stack Préférée
```yaml
frontend:
  framework: "Next.js"        # Next.js | Nuxt | SvelteKit | Astro
  ui_library: "shadcn/ui"     # shadcn/ui | MUI | Chakra | Mantine
  styling: "TailwindCSS"      # TailwindCSS | CSS Modules | Styled Components
  state: "Zustand"            # Zustand | Redux | Jotai | Recoil

backend:
  runtime: "Node.js"          # Node.js | Python | Go | Rust
  database: "Supabase"        # Supabase | PostgreSQL | MongoDB | MySQL
  orm: "Prisma"               # Prisma | Drizzle | TypeORM | Sequelize
  auth: "Supabase Auth"       # Supabase Auth | Clerk | Auth.js | Custom

mobile:
  framework: "Expo"           # Expo | React Native CLI | Flutter

desktop:
  framework: "Tauri"          # Tauri | Electron

deployment:
  platform: "Vercel"          # Vercel | Netlify | Railway | AWS
  ci_cd: "GitHub Actions"     # GitHub Actions | GitLab CI | CircleCI
```

### Conventions de Code
```yaml
naming:
  components: "PascalCase"    # PascalCase | kebab-case
  files: "kebab-case"         # kebab-case | camelCase | PascalCase
  variables: "camelCase"      # camelCase | snake_case
  constants: "UPPER_SNAKE"    # UPPER_SNAKE | camelCase

formatting:
  indent: 2                   # 2 | 4 | tabs
  quotes: "double"            # single | double
  semicolons: true            # true | false
  trailing_comma: "es5"       # none | es5 | all

typescript:
  strict: true
  explicit_return_types: false
  prefer_interfaces: true     # interfaces vs types
```

### Préférences de Projet
```yaml
structure:
  src_directory: true         # Utiliser src/ ou pas
  feature_based: false        # Structure par feature ou par type

testing:
  unit_framework: "Vitest"    # Vitest | Jest
  e2e_framework: "Playwright" # Playwright | Cypress
  coverage_target: 80         # Pourcentage minimum

documentation:
  readme: true
  jsdoc: false               # Commenter les fonctions
  changelog: false
```

## Préférences de Workflow

### Style de Communication
```yaml
verbosity: "concise"          # concise | detailed | minimal
explanations: true            # Expliquer les choix techniques
code_comments: "minimal"      # none | minimal | detailed
language: "français"          # français | english
```

### Automatisation
```yaml
auto_commit: false            # Commit automatique après changements
auto_test: true              # Lancer tests après modifications
auto_lint: true              # Lint automatique
auto_format: true            # Format automatique
```

## Projets Fréquents

### Types de Projets Habituels
```yaml
- type: "saas"
  frequency: "souvent"
  features_default: ["auth", "billing", "dashboard"]

- type: "landing"
  frequency: "souvent"
  features_default: ["hero", "features", "pricing", "cta"]

- type: "ecommerce"
  frequency: "parfois"
  features_default: ["products", "cart", "checkout"]
```

## Contexte Business

### Domaines d'Activité
```yaml
industries:
  - "[Votre industrie 1]"
  - "[Votre industrie 2]"

target_users:
  - "[Type d'utilisateur cible]"

monetization:
  model: "subscription"       # subscription | one-time | freemium
  payment_provider: "Stripe"
```

## Historique (Auto-rempli)

### Derniers Projets Créés
```yaml
# Automatiquement mis à jour après chaque projet
projects: []
```

### Patterns Préférés Détectés
```yaml
# Automatiquement détectés au fil du temps
patterns: []
```

### Erreurs Fréquentes à Éviter
```yaml
# Automatiquement ajoutées
errors_to_avoid: []
```

---

## Comment Utiliser Ce Fichier

1. **Remplissez vos préférences** dans les sections ci-dessus
2. **Je les utiliserai automatiquement** pour tous vos projets
3. **Mettez à jour** quand vos préférences changent

## Commande pour Mettre à Jour
```
/profile update
```

## Commande pour Voir le Profil Actif
```
/profile show
```
