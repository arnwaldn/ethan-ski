# Odoo Migration Assistant

Assist with Odoo version migrations.

## Instructions

When invoked, ask the user for:
1. **Source version** (e.g., 16.0, 17.0, 18.0)
2. **Target version** (e.g., 17.0, 18.0, 19.0)
3. **Module path** or **specific file** to migrate

## Migration Process

Consult: `knowledge/odoo/odoo-migration-guide.md`

### 1. Analyze Breaking Changes

For each version jump, identify:

**Odoo 16 → 17:**
- OWL 1.x → OWL 2.x migration
- `attrs` → `invisible`, `readonly`, `required`
- `states` → domain-based visibility
- New asset bundle system

**Odoo 17 → 18:**
- Further OWL refinements
- New form view features
- API deprecations

**Odoo 18 → 19:**
- Latest ORM changes
- New field types
- Controller updates

### 2. Create Migration Scripts

Generate migration scripts in `migrations/X.X.X.X.X/`:

```python
# migrations/17.0.1.0.0/pre-migrate.py
def migrate(cr, version):
    # Pre-migration logic
    pass

# migrations/17.0.1.0.0/post-migrate.py
def migrate(cr, version):
    # Post-migration logic
    pass
```

### 3. Update Code

Transform code patterns:

**Python Models:**
- Update deprecated decorators
- Fix API changes
- Update method signatures

**XML Views:**
- Replace deprecated attributes
- Update QWeb syntax
- Fix view inheritance

**JavaScript:**
- Migrate to OWL 2.x syntax
- Update imports
- Fix component patterns

### 4. Validate

After migration:
- Run the odoo-validator
- Execute test suite
- Check for deprecation warnings

## Output

Provide:
1. List of required changes
2. Generated migration scripts
3. Updated code files
4. Post-migration checklist

## Example Usage

```
User: Migrate my_module from 16.0 to 19.0
Assistant: [Analyzes module, identifies changes, creates migration path through 17.0 and 18.0]
```
