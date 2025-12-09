# Mode: Speed

## Description
Mode optimisé pour la vitesse maximale de livraison.

## Comportement
```yaml
verbosity: minimal
explanations: none
code_comments: none
testing: skip
documentation: skip
iterations: 1
focus: working_code_fast
```

## Quand l'utiliser
- Prototypes rapides
- POC / Démos
- Urgences
- Scripts one-shot
- Exploration technique

## Caractéristiques
- Code fonctionnel direct
- Pas d'explications
- Pas de tests
- Minimal viable

## Format de sortie
```typescript
// Direct, pas de commentaires superflus
export async function createUser(data: CreateUserInput) {
  return db.user.create({ data: { ...data, password: await hash(data.password) } });
}

export async function getUser(id: string) {
  return db.user.findUnique({ where: { id } });
}

export async function updateUser(id: string, data: UpdateUserInput) {
  return db.user.update({ where: { id }, data });
}

export async function deleteUser(id: string) {
  return db.user.delete({ where: { id } });
}
```

## Limites
- Pas pour la production critique
- Refactoring nécessaire après
- Tests à ajouter plus tard
- Documentation à compléter

## Exemple d'interaction
User: "API CRUD pour les produits, vite"
Assistant: [Génère immédiatement le code complet sans explications]
