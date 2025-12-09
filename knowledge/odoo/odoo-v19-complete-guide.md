# Guide Complet Odoo v19 pour Développeurs

## 1. Introduction à Odoo v19

### Nouveautés Odoo v19
- **Python 3.10+** requis (minimum)
- **PostgreSQL 15+** recommandé
- Améliorations performances ORM
- Nouveau système de vues dynamiques
- Meilleure gestion du multi-company
- API REST native améliorée
- Support WebSocket pour temps réel

### Architecture Odoo

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Web UI    │  │  REST API   │  │  External Systems   │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
└─────────┼────────────────┼─────────────────────┼────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Odoo Server                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    HTTP Layer                            ││
│  │  Werkzeug + Controllers + JSON-RPC + XML-RPC            ││
│  └────────────────────────┬────────────────────────────────┘│
│                           │                                  │
│  ┌────────────────────────▼────────────────────────────────┐│
│  │                   Business Logic                         ││
│  │  Models + Views + Actions + Wizards + Reports           ││
│  └────────────────────────┬────────────────────────────────┘│
│                           │                                  │
│  ┌────────────────────────▼────────────────────────────────┐│
│  │                      ORM Layer                           ││
│  │  Fields + Methods + Constraints + Computed + Related    ││
│  └────────────────────────┬────────────────────────────────┘│
│                           │                                  │
│  ┌────────────────────────▼────────────────────────────────┐│
│  │                   Database Layer                         ││
│  │  PostgreSQL + Queries + Indexes + Transactions          ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 2. Structure d'un Module Odoo

### Structure de Fichiers Standard

```
mon_module/
├── __init__.py                 # Import des packages Python
├── __manifest__.py             # Métadonnées du module
├── models/                     # Modèles de données (ORM)
│   ├── __init__.py
│   ├── mon_modele.py
│   └── res_partner.py          # Extension modèle existant
├── views/                      # Vues XML
│   ├── mon_modele_views.xml
│   ├── res_partner_views.xml
│   └── menus.xml
├── security/                   # Sécurité et permissions
│   ├── ir.model.access.csv     # ACL
│   └── security.xml            # Groupes et règles
├── data/                       # Données initiales
│   ├── data.xml
│   └── sequences.xml
├── demo/                       # Données de démonstration
│   └── demo.xml
├── controllers/                # Controllers HTTP
│   ├── __init__.py
│   └── main.py
├── wizards/                    # Assistants (transient models)
│   ├── __init__.py
│   └── mon_wizard.py
├── reports/                    # Rapports QWeb
│   ├── report_templates.xml
│   └── report_actions.xml
├── static/                     # Fichiers statiques
│   ├── description/
│   │   ├── icon.png            # Icône du module (128x128)
│   │   └── index.html          # Description HTML
│   └── src/
│       ├── js/
│       ├── css/
│       └── xml/
├── i18n/                       # Traductions
│   └── fr.po
├── tests/                      # Tests unitaires
│   ├── __init__.py
│   └── test_mon_modele.py
└── README.md                   # Documentation
```

### Manifest (__manifest__.py)

```python
{
    'name': 'Mon Module',
    'version': '19.0.1.0.0',
    'category': 'Sales/CRM',
    'summary': 'Description courte du module',
    'description': '''
        Description Longue
        ==================
        * Fonctionnalité 1
        * Fonctionnalité 2
    ''',
    'author': 'Mon Entreprise',
    'website': 'https://www.monentreprise.com',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'sale',
        'account',
        'mail',
    ],
    'external_dependencies': {
        'python': ['requests', 'pydantic'],
    },
    'data': [
        # Sécurité en premier
        'security/security.xml',
        'security/ir.model.access.csv',
        # Puis les données
        'data/sequences.xml',
        'data/data.xml',
        # Puis les vues
        'views/mon_modele_views.xml',
        'views/menus.xml',
        # Wizards
        'wizards/mon_wizard_views.xml',
        # Reports
        'reports/report_templates.xml',
    ],
    'demo': [
        'demo/demo.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'mon_module/static/src/js/**/*',
            'mon_module/static/src/css/**/*',
            'mon_module/static/src/xml/**/*',
        ],
    },
    'installable': True,
    'application': True,
    'auto_install': False,
    'post_init_hook': 'post_init_hook',
    'uninstall_hook': 'uninstall_hook',
}
```

## 3. ORM Odoo - Référence Complète

### Types de Modèles

```python
from odoo import models, fields, api

# Model standard (persistant en base)
class MonModele(models.Model):
    _name = 'mon.modele'
    _description = 'Description'

# Model transient (temporaire, pour wizards)
class MonWizard(models.TransientModel):
    _name = 'mon.wizard'
    _description = 'Assistant'

# Model abstrait (pas de table, pour héritage)
class MonMixin(models.AbstractModel):
    _name = 'mon.mixin'
    _description = 'Mixin'
```

### Types de Champs Complets

```python
from odoo import models, fields, api
from odoo.exceptions import ValidationError, UserError

class ExempleComplet(models.Model):
    _name = 'exemple.complet'
    _description = 'Exemple de tous les types de champs'
    _order = 'sequence, name'
    _rec_name = 'display_name'

    # === CHAMPS SIMPLES ===

    # Char - Chaîne courte
    name = fields.Char(
        string='Nom',
        required=True,
        index=True,
        translate=True,
        size=100,  # Limite de caractères
        trim=True,  # Supprime espaces
        tracking=True,  # Historique modifications
    )

    # Text - Texte long
    description = fields.Text(
        string='Description',
        translate=True,
    )

    # Html - Contenu HTML
    content = fields.Html(
        string='Contenu',
        sanitize=True,
        sanitize_attributes=True,
        sanitize_style=True,
        strip_classes=True,
    )

    # Boolean
    active = fields.Boolean(
        string='Actif',
        default=True,
    )

    # Integer
    sequence = fields.Integer(
        string='Séquence',
        default=10,
    )

    # Float
    amount = fields.Float(
        string='Montant',
        digits=(16, 2),  # Précision
        default=0.0,
    )

    # Monetary (avec devise)
    price = fields.Monetary(
        string='Prix',
        currency_field='currency_id',
    )
    currency_id = fields.Many2one(
        'res.currency',
        string='Devise',
        default=lambda self: self.env.company.currency_id,
    )

    # Date
    date = fields.Date(
        string='Date',
        default=fields.Date.today,
        # default=fields.Date.context_today,  # Avec timezone
    )

    # Datetime
    datetime = fields.Datetime(
        string='Date et Heure',
        default=fields.Datetime.now,
    )

    # Selection
    state = fields.Selection(
        selection=[
            ('draft', 'Brouillon'),
            ('confirmed', 'Confirmé'),
            ('done', 'Terminé'),
            ('cancelled', 'Annulé'),
        ],
        string='État',
        default='draft',
        required=True,
        copy=False,
        tracking=True,
    )

    # Binary (fichiers, images)
    image = fields.Binary(
        string='Image',
        attachment=True,  # Stocké comme pièce jointe
    )
    image_filename = fields.Char(string='Nom du fichier')

    # Image avec redimensionnement
    image_1920 = fields.Image(
        string='Image HD',
        max_width=1920,
        max_height=1920,
    )
    image_128 = fields.Image(
        string='Thumbnail',
        related='image_1920',
        max_width=128,
        max_height=128,
        store=True,
    )

    # === CHAMPS RELATIONNELS ===

    # Many2one (FK)
    partner_id = fields.Many2one(
        comodel_name='res.partner',
        string='Client',
        required=True,
        ondelete='restrict',  # restrict, cascade, set null
        index=True,
        domain="[('is_company', '=', True)]",
        context={'show_email': True},
        check_company=True,
    )

    # One2many (reverse FK)
    line_ids = fields.One2many(
        comodel_name='exemple.complet.line',
        inverse_name='parent_id',
        string='Lignes',
        copy=True,
    )

    # Many2many
    tag_ids = fields.Many2many(
        comodel_name='exemple.tag',
        relation='exemple_complet_tag_rel',  # Table pivot
        column1='exemple_id',
        column2='tag_id',
        string='Tags',
    )

    # === CHAMPS CALCULÉS ===

    # Computed (calculé à la volée)
    total = fields.Float(
        string='Total',
        compute='_compute_total',
        store=True,  # Stocké en base (recalculé si dépendances changent)
        readonly=True,
    )

    # Computed inverse (modifiable)
    total_with_tax = fields.Float(
        string='Total TTC',
        compute='_compute_total_with_tax',
        inverse='_inverse_total_with_tax',
        store=True,
    )

    # Related (champ d'un modèle lié)
    partner_email = fields.Char(
        string='Email client',
        related='partner_id.email',
        readonly=True,  # False si on veut pouvoir modifier
        store=False,  # True pour indexer/rechercher
    )

    # === CHAMPS SPÉCIAUX ===

    # Company (multi-société)
    company_id = fields.Many2one(
        'res.company',
        string='Société',
        required=True,
        default=lambda self: self.env.company,
        index=True,
    )

    # User
    user_id = fields.Many2one(
        'res.users',
        string='Responsable',
        default=lambda self: self.env.user,
        tracking=True,
    )

    # Reference (lien polymorphique)
    ref = fields.Reference(
        selection=[
            ('sale.order', 'Commande'),
            ('account.move', 'Facture'),
        ],
        string='Référence',
    )

    # === MÉTHODES COMPUTE ===

    @api.depends('line_ids.subtotal')
    def _compute_total(self):
        for record in self:
            record.total = sum(record.line_ids.mapped('subtotal'))

    @api.depends('total')
    def _compute_total_with_tax(self):
        for record in self:
            record.total_with_tax = record.total * 1.20  # TVA 20%

    def _inverse_total_with_tax(self):
        for record in self:
            record.total = record.total_with_tax / 1.20

    # === CONTRAINTES ===

    _sql_constraints = [
        ('name_unique', 'UNIQUE(name, company_id)', 'Le nom doit être unique!'),
        ('amount_positive', 'CHECK(amount >= 0)', 'Le montant doit être positif!'),
    ]

    @api.constrains('date', 'datetime')
    def _check_dates(self):
        for record in self:
            if record.date and record.datetime:
                if record.date > record.datetime.date():
                    raise ValidationError("La date ne peut pas être après la date/heure!")

    # === ONCHANGE ===

    @api.onchange('partner_id')
    def _onchange_partner_id(self):
        if self.partner_id:
            self.currency_id = self.partner_id.currency_id
            return {
                'warning': {
                    'title': 'Attention',
                    'message': 'Client sélectionné: %s' % self.partner_id.name,
                },
                'domain': {
                    'user_id': [('company_id', '=', self.partner_id.company_id.id)],
                },
            }

    # === MÉTHODES CRUD ===

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', 'New') == 'New':
                vals['name'] = self.env['ir.sequence'].next_by_code('exemple.complet')
        return super().create(vals_list)

    def write(self, vals):
        # Vérifications avant écriture
        if 'state' in vals and vals['state'] == 'done':
            for record in self:
                if not record.line_ids:
                    raise UserError("Impossible de terminer sans lignes!")
        return super().write(vals)

    def unlink(self):
        for record in self:
            if record.state not in ('draft', 'cancelled'):
                raise UserError("Suppression interdite pour les enregistrements confirmés!")
        return super().unlink()

    def copy(self, default=None):
        default = dict(default or {})
        default['name'] = '%s (copie)' % self.name
        return super().copy(default)

    # === MÉTHODES MÉTIER ===

    def action_confirm(self):
        for record in self:
            if record.state != 'draft':
                raise UserError("Seuls les brouillons peuvent être confirmés!")
            record.state = 'confirmed'
        return True

    def action_done(self):
        self.write({'state': 'done'})

    def action_cancel(self):
        self.write({'state': 'cancelled'})

    def action_draft(self):
        self.write({'state': 'draft'})
```

### Méthodes de Recherche

```python
# search() - Retourne des recordsets
records = self.env['res.partner'].search([
    ('is_company', '=', True),
    ('country_id.code', '=', 'FR'),
    '|',
    ('email', 'ilike', '@gmail.com'),
    ('email', 'ilike', '@outlook.com'),
], order='name ASC', limit=100, offset=0)

# search_count() - Compte uniquement
count = self.env['res.partner'].search_count([('active', '=', True)])

# search_read() - Search + Read en une requête
data = self.env['res.partner'].search_read(
    domain=[('is_company', '=', True)],
    fields=['name', 'email', 'phone'],
    limit=10,
)

# read_group() - Agrégation (GROUP BY)
results = self.env['sale.order'].read_group(
    domain=[('state', '=', 'sale')],
    fields=['partner_id', 'amount_total:sum'],
    groupby=['partner_id'],
    orderby='amount_total DESC',
    limit=10,
)

# browse() - Récupérer par IDs
records = self.env['res.partner'].browse([1, 2, 3])

# name_search() - Recherche par nom (autocomplete)
results = self.env['res.partner'].name_search(
    name='Dupont',
    args=[('is_company', '=', False)],
    operator='ilike',
    limit=10,
)
```

### Opérateurs de Domaine

| Opérateur | Description | Exemple |
|-----------|-------------|---------|
| `=` | Égal | `('state', '=', 'draft')` |
| `!=` | Différent | `('state', '!=', 'cancelled')` |
| `>`, `>=`, `<`, `<=` | Comparaison | `('amount', '>', 100)` |
| `like` | Contient (sensible casse) | `('name', 'like', 'test')` |
| `ilike` | Contient (insensible casse) | `('email', 'ilike', '@gmail')` |
| `=like` | Pattern SQL | `('code', '=like', 'SO%')` |
| `=ilike` | Pattern SQL (insensible) | `('code', '=ilike', 'so%')` |
| `in` | Dans la liste | `('state', 'in', ['draft', 'sent'])` |
| `not in` | Pas dans la liste | `('state', 'not in', ['cancelled'])` |
| `child_of` | Enfant de (hiérarchie) | `('parent_id', 'child_of', 5)` |
| `parent_of` | Parent de | `('id', 'parent_of', [10, 11])` |
| `&` | ET (implicite) | `('a', '=', 1), ('b', '=', 2)` |
| `\|` | OU | `'\|', ('a', '=', 1), ('b', '=', 2)` |
| `!` | NON | `'!', ('active', '=', True)` |

## 4. Sécurité Odoo

### Groupes d'Utilisateurs

```xml
<!-- security/security.xml -->
<odoo>
    <!-- Catégorie -->
    <record id="module_category_mon_module" model="ir.module.category">
        <field name="name">Mon Module</field>
        <field name="sequence">100</field>
    </record>

    <!-- Groupe Utilisateur -->
    <record id="group_user" model="res.groups">
        <field name="name">Utilisateur</field>
        <field name="category_id" ref="module_category_mon_module"/>
    </record>

    <!-- Groupe Manager (inclut Utilisateur) -->
    <record id="group_manager" model="res.groups">
        <field name="name">Manager</field>
        <field name="category_id" ref="module_category_mon_module"/>
        <field name="implied_ids" eval="[(4, ref('group_user'))]"/>
        <field name="users" eval="[(4, ref('base.user_root')), (4, ref('base.user_admin'))]"/>
    </record>
</odoo>
```

### Access Control Lists (ACL)

```csv
# security/ir.model.access.csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_mon_modele_user,mon.modele.user,model_mon_modele,group_user,1,0,0,0
access_mon_modele_manager,mon.modele.manager,model_mon_modele,group_manager,1,1,1,1
access_mon_modele_line_user,mon.modele.line.user,model_mon_modele_line,group_user,1,0,0,0
access_mon_modele_line_manager,mon.modele.line.manager,model_mon_modele_line,group_manager,1,1,1,1
```

### Record Rules (Row-Level Security)

```xml
<!-- security/security.xml -->
<odoo>
    <!-- Règle multi-société -->
    <record id="rule_mon_modele_company" model="ir.rule">
        <field name="name">Mon Modèle: Multi-Société</field>
        <field name="model_id" ref="model_mon_modele"/>
        <field name="domain_force">[
            '|',
            ('company_id', '=', False),
            ('company_id', 'in', company_ids)
        ]</field>
    </record>

    <!-- Règle: Utilisateur voit ses propres enregistrements -->
    <record id="rule_mon_modele_user_own" model="ir.rule">
        <field name="name">Mon Modèle: Propres enregistrements</field>
        <field name="model_id" ref="model_mon_modele"/>
        <field name="groups" eval="[(4, ref('group_user'))]"/>
        <field name="domain_force">[('user_id', '=', user.id)]</field>
        <field name="perm_read" eval="True"/>
        <field name="perm_write" eval="True"/>
        <field name="perm_create" eval="True"/>
        <field name="perm_unlink" eval="False"/>
    </record>

    <!-- Règle: Manager voit tout -->
    <record id="rule_mon_modele_manager_all" model="ir.rule">
        <field name="name">Mon Modèle: Manager - Tout</field>
        <field name="model_id" ref="model_mon_modele"/>
        <field name="groups" eval="[(4, ref('group_manager'))]"/>
        <field name="domain_force">[(1, '=', 1)]</field>
    </record>
</odoo>
```

## 5. Tests Odoo

### Structure des Tests

```python
# tests/__init__.py
from . import test_mon_modele
from . import test_integration

# tests/test_mon_modele.py
from odoo.tests.common import TransactionCase, tagged
from odoo.exceptions import ValidationError, UserError
from unittest.mock import patch, MagicMock

@tagged('post_install', '-at_install')
class TestMonModele(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # Création données de test
        cls.partner = cls.env['res.partner'].create({
            'name': 'Test Partner',
            'email': 'test@example.com',
        })
        cls.product = cls.env['product.product'].create({
            'name': 'Test Product',
            'list_price': 100.0,
        })

    def test_create_record(self):
        """Test création d'enregistrement"""
        record = self.env['mon.modele'].create({
            'name': 'Test',
            'partner_id': self.partner.id,
        })
        self.assertTrue(record.id)
        self.assertEqual(record.state, 'draft')

    def test_compute_total(self):
        """Test calcul du total"""
        record = self.env['mon.modele'].create({
            'name': 'Test',
            'partner_id': self.partner.id,
            'line_ids': [
                (0, 0, {'product_id': self.product.id, 'quantity': 2, 'price_unit': 100}),
                (0, 0, {'product_id': self.product.id, 'quantity': 1, 'price_unit': 50}),
            ],
        })
        self.assertEqual(record.total, 250.0)

    def test_action_confirm(self):
        """Test confirmation"""
        record = self.env['mon.modele'].create({
            'name': 'Test',
            'partner_id': self.partner.id,
        })
        record.action_confirm()
        self.assertEqual(record.state, 'confirmed')

    def test_constraint_amount_positive(self):
        """Test contrainte montant positif"""
        with self.assertRaises(ValidationError):
            self.env['mon.modele'].create({
                'name': 'Test',
                'partner_id': self.partner.id,
                'amount': -100,
            })

    def test_unlink_confirmed_raises_error(self):
        """Test suppression enregistrement confirmé"""
        record = self.env['mon.modele'].create({
            'name': 'Test',
            'partner_id': self.partner.id,
        })
        record.action_confirm()
        with self.assertRaises(UserError):
            record.unlink()

    @patch('odoo.addons.mon_module.models.mon_modele.requests.get')
    def test_api_call(self, mock_get):
        """Test appel API avec mock"""
        mock_response = MagicMock()
        mock_response.json.return_value = {'data': [{'id': 1}]}
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        record = self.env['mon.modele'].create({
            'name': 'Test',
            'partner_id': self.partner.id,
        })
        result = record.fetch_external_data()

        mock_get.assert_called_once()
        self.assertEqual(len(result), 1)
```

### Exécution des Tests

```bash
# Tous les tests du module
./odoo-bin -c odoo.conf -d test_db --test-enable -i mon_module --stop-after-init

# Tests spécifiques
./odoo-bin -c odoo.conf -d test_db --test-tags /mon_module

# Tests avec couverture
coverage run ./odoo-bin -c odoo.conf -d test_db --test-enable -i mon_module --stop-after-init
coverage report -m
coverage html
```

## 6. Déploiement Odoo SH

### Structure pour Odoo.sh

```
mon-projet/
├── .gitignore
├── requirements.txt          # Dépendances Python
├── mon_module/               # Module principal
│   ├── __init__.py
│   ├── __manifest__.py
│   └── ...
├── autre_module/             # Autres modules
└── .odoo.sh/                 # Configuration Odoo.sh (optionnel)
    └── config.yml
```

### Configuration requirements.txt

```txt
# requirements.txt
requests>=2.28.0
pydantic>=2.0.0
python-dateutil>=2.8.0
pytz>=2023.3
```

### Variables d'Environnement Odoo.sh

```python
import os

# Récupérer les variables d'environnement
API_KEY = os.environ.get('OCTORATE_API_KEY', '')
API_SECRET = os.environ.get('OCTORATE_API_SECRET', '')
WEBHOOK_SECRET = os.environ.get('OCTORATE_WEBHOOK_SECRET', '')
```

## 7. Bonnes Pratiques

### Performance
1. **Éviter N+1 queries** : Utiliser `prefetch_fields` ou `mapped()`
2. **Stocker les computed fields** si utilisés dans les recherches/filtres
3. **Utiliser `read_group()`** pour les agrégations
4. **Limiter les `search()`** avec `limit` quand possible
5. **Utiliser `with_context(prefetch_fields=False)`** pour les gros volumes

### Sécurité
1. **Toujours définir les ACL** pour chaque modèle
2. **Utiliser `sudo()` avec parcimonie** et revenir au contexte normal
3. **Valider les webhooks** avec HMAC
4. **Ne jamais logger** les données sensibles
5. **Utiliser `escape()`** pour le contenu HTML

### Maintenabilité
1. **Un modèle par fichier**
2. **Préfixer les champs custom** avec `x_`
3. **Documenter les méthodes** avec docstrings
4. **Écrire des tests** pour chaque fonctionnalité critique
5. **Suivre les conventions** de nommage Odoo

### Code Style
```python
# Imports groupés
from odoo import api, fields, models, _
from odoo.exceptions import UserError, ValidationError
from odoo.tools import float_compare, float_is_zero

# Puis imports standards
import logging
import json
from datetime import datetime, timedelta

_logger = logging.getLogger(__name__)
```
