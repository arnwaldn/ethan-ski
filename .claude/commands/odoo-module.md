# Odoo Module Creation

Create a new Odoo v19 module with professional structure.

## Instructions

When invoked, ask the user for:
1. **Module name** (e.g., hotel_management, inventory_tracker)
2. **Module type**: basic, integration, or industry-specific
3. **Industry** (if applicable): hospitality, manufacturing, retail, accounting
4. **Key features** to implement

Then:

1. **Consult the relevant knowledge base**:
   - `knowledge/odoo/odoo-v19-complete-guide.md`
   - `knowledge/odoo/odoo-oca-standards-guide.md`
   - Relevant agent file from `.claude/agents/odoo/`

2. **Create the module structure**:
   ```
   module_name/
   ├── __manifest__.py
   ├── __init__.py
   ├── README.rst
   ├── models/
   │   ├── __init__.py
   │   └── main_model.py
   ├── views/
   │   ├── main_model_views.xml
   │   └── menu_views.xml
   ├── security/
   │   ├── security.xml
   │   └── ir.model.access.csv
   ├── data/
   ├── demo/
   ├── wizards/
   ├── controllers/
   ├── tests/
   │   ├── __init__.py
   │   └── test_module.py
   ├── static/
   │   └── description/
   └── i18n/
   ```

3. **Follow OCA standards**:
   - Proper copyright headers
   - Import order (stdlib, third-party, odoo, odoo.addons)
   - Use `_` for translatable strings
   - Type annotations where applicable
   - Comprehensive docstrings

4. **Implement requested features** with:
   - Proper ORM usage (models, fields, decorators)
   - Security (ACL, record rules)
   - Form and list views with proper UX
   - Tests for critical functionality

5. **Validate** using the odoo-validator.ps1 script logic.

## Quality Checklist

- [ ] __manifest__.py complete with all required fields
- [ ] Security groups and access rights defined
- [ ] Views follow Odoo v19 best practices
- [ ] No deprecated syntax (attrs, states)
- [ ] README.rst with proper documentation
- [ ] At least basic test coverage
