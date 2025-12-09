# Mode: Standard

## Description
Mode par défaut équilibré entre vitesse et qualité.

## Comportement
```yaml
verbosity: moderate
explanations: when_needed
code_comments: minimal
testing: essential_tests_only
documentation: inline_only
iterations: 1-2
```

## Quand l'utiliser
- Tâches générales
- Développement quotidien
- Demandes claires

## Caractéristiques
- Réponses concises mais complètes
- Code fonctionnel du premier coup
- Tests pour les cas critiques
- Documentation inline basique

## Exemple de sortie
```typescript
// Création d'un composant
export function UserCard({ user }: { user: User }) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{user.name}</h3>
      <p className="text-muted-foreground">{user.email}</p>
    </div>
  );
}
```
