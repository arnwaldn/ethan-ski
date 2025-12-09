# Odoo Module Audit

Perform a comprehensive audit of an Odoo module.

## Instructions

When invoked, the user should provide:
1. **Path to the module** to audit
2. **Audit type**: full, security, performance, or code-quality

## Audit Process

### 1. Security Audit
Consult: `knowledge/odoo/odoo-security-guide.md`

Check for:
- [ ] SQL injection vulnerabilities (raw SQL without parameters)
- [ ] XSS vulnerabilities in HTML fields
- [ ] Proper access control (ir.model.access.csv)
- [ ] Record rules for multi-company/user isolation
- [ ] No hardcoded credentials
- [ ] Proper use of sudo()
- [ ] CSRF protection on controllers
- [ ] Input validation on public endpoints

### 2. Performance Audit
Consult: `knowledge/odoo/odoo-performance-guide.md`

Check for:
- [ ] N+1 query patterns
- [ ] Missing indexes on filtered fields
- [ ] Large computed fields without store=True
- [ ] Inefficient search domains
- [ ] Missing prefetch patterns
- [ ] Unnecessary sudo() calls

### 3. Code Quality Audit
Consult: `knowledge/odoo/odoo-oca-standards-guide.md`

Check for:
- [ ] OCA code style compliance
- [ ] Proper docstrings
- [ ] Correct import order
- [ ] No deprecated API usage
- [ ] Translation strings wrapped with _()
- [ ] Proper exception handling
- [ ] Test coverage

### 4. Architecture Audit
Check for:
- [ ] Proper model inheritance (delegation vs extension)
- [ ] Correct field types
- [ ] Proper use of related/computed fields
- [ ] Separation of concerns
- [ ] Reusability patterns

## Output Format

Provide a detailed report with:

```
# Module Audit Report: [module_name]

## Summary
- Security Score: X/10
- Performance Score: X/10
- Code Quality Score: X/10
- Overall Score: X/10

## Critical Issues
[List critical issues that must be fixed]

## Warnings
[List warnings that should be addressed]

## Recommendations
[List recommendations for improvement]

## Detailed Findings
[Detailed analysis with code references]
```
