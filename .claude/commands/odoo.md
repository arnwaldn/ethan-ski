# Commande /odoo - Création de Modules Odoo v19

## Description
Cette commande génère des modules Odoo v19 professionnels avec une structure complète et des bonnes pratiques intégrées.

## Usage
```
/odoo [type] [nom_module] [description]
```

## Types Disponibles

### 1. `module` - Module Complet
Crée un module Odoo complet avec:
- Structure de fichiers standard
- Modèle principal + lignes
- Vues (form, tree, kanban, search, calendar, pivot, graph)
- Sécurité (groupes, ACL, record rules)
- Configuration (res.config.settings)
- Séquences et données

```
/odoo module hotel_booking "Gestion des réservations hôtelières"
```

### 2. `integration` - Module d'Intégration API
Crée un module avec connecteur API externe:
- Client API avec retry et rate limiting
- Controller webhook avec validation HMAC
- Data Mapper pour transformation
- Sync service bidirectionnel
- Jobs cron pour sync périodique
- Logs d'intégration

```
/odoo integration octorate_integration "Intégration avec Octorate PMS"
```

### 3. `extension` - Extension de Module Existant
Étend un module Odoo standard:
- Héritage de modèles (_inherit)
- Extension de vues (xpath)
- Champs personnalisés (x_*)

```
/odoo extension sale_hospitality "Extension ventes pour hôtellerie"
```

## Ressources Utilisées

### Agents
- `odoo-expert.md` - Expertise ORM, vues, sécurité
- `integration-expert.md` - Webhooks, API, sync
- `hospitality-expert.md` - Domaine hôtelier (si pertinent)

### Knowledge Base
- `knowledge/odoo/odoo-v19-complete-guide.md`
- `knowledge/odoo/odoo-api-integration.md`
- `knowledge/odoo/templates/module-skeleton/`

### Mémoire
- `ODOO-EXPERTISE-v19`
- `INTEGRATION-PATTERNS`
- `HOSPITALITY-DOMAIN`

## Workflow de Génération

1. **Analyse** - Comprendre les besoins
2. **Structure** - Créer l'arborescence du module
3. **Modèles** - Générer les classes Python
4. **Vues** - Créer les fichiers XML
5. **Sécurité** - Configurer groupes et ACL
6. **Tests** - Écrire les tests unitaires
7. **Documentation** - README et commentaires

## Standards Appliqués

### Nommage
- Module: `snake_case` (ex: `octorate_integration`)
- Modèle: `dot.notation` (ex: `octorate.booking`)
- Champs custom: préfixe `x_` (ex: `x_octorate_id`)
- Vues: `view_model_type` (ex: `view_booking_form`)

### Sécurité
- Toujours définir les ACL
- Record rules pour multi-company
- Groupes avec hiérarchie (user < manager)
- Validation des webhooks (HMAC-SHA256)

### Performance
- `store=True` uniquement si nécessaire
- Indexes sur les champs de recherche
- `limit` sur les `search()`
- Traitement async pour webhooks

### Qualité
- Docstrings sur les méthodes
- Logging structuré
- Gestion des erreurs (UserError, ValidationError)
- Tests avec couverture >80%

## Exemple Complet

```
/odoo integration octorate_integration "Intégration bidirectionnelle Octorate PMS"
```

Génère:
```
octorate_integration/
├── __init__.py
├── __manifest__.py
├── models/
│   ├── __init__.py
│   ├── octorate_config.py
│   ├── octorate_log.py
│   ├── octorate_booking.py
│   ├── res_partner.py
│   └── sale_order.py
├── controllers/
│   ├── __init__.py
│   └── webhook.py
├── services/
│   ├── __init__.py
│   ├── api_client.py
│   ├── data_mapper.py
│   └── sync_service.py
├── views/
│   ├── octorate_config_views.xml
│   ├── octorate_log_views.xml
│   ├── res_partner_views.xml
│   ├── sale_order_views.xml
│   └── menu_views.xml
├── security/
│   ├── security.xml
│   └── ir.model.access.csv
├── data/
│   ├── ir_sequence_data.xml
│   └── ir_cron_data.xml
├── tests/
│   ├── __init__.py
│   ├── test_api_client.py
│   ├── test_data_mapper.py
│   └── test_webhook.py
├── static/
│   └── description/
│       └── icon.png
└── README.md
```

## Checklist Post-Génération

- [ ] Vérifier le `__manifest__.py` (dépendances, version)
- [ ] Configurer les credentials API (secrets)
- [ ] Tester la connexion API
- [ ] Lancer les tests (`./odoo-bin --test-enable`)
- [ ] Vérifier la sécurité (ACL, record rules)
- [ ] Installer sur environnement de dev Odoo SH
