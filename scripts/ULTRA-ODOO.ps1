<#
.SYNOPSIS
    ULTRA-ODOO - Odoo Module Generator
.DESCRIPTION
    Creates professional Odoo modules with proper structure and boilerplate code.
.PARAMETER Name
    Module name (e.g., "hotel_management")
.PARAMETER Type
    Module type: basic, integration, industry
.PARAMETER Industry
    Industry template: hospitality, manufacturing, retail, accounting
.PARAMETER OutputPath
    Output directory for the module
.EXAMPLE
    .\ULTRA-ODOO.ps1 -Name "hotel_pms" -Type "industry" -Industry "hospitality"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Name,

    [Parameter(Mandatory=$false)]
    [ValidateSet("basic", "integration", "industry")]
    [string]$Type = "basic",

    [Parameter(Mandatory=$false)]
    [ValidateSet("hospitality", "manufacturing", "retail", "accounting")]
    [string]$Industry,

    [Parameter(Mandatory=$false)]
    [string]$OutputPath = ".",

    [Parameter(Mandatory=$false)]
    [string]$Author = "Your Company",

    [Parameter(Mandatory=$false)]
    [string]$Version = "19.0.1.0.0"
)

# Colors
$colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
}

function Write-Status {
    param([string]$Message, [string]$Type = "Info")
    Write-Host "[$Type] $Message" -ForegroundColor $colors[$Type]
}

function New-OdooModule {
    param(
        [string]$ModuleName,
        [string]$ModuleType,
        [string]$IndustryType,
        [string]$BasePath
    )

    $modulePath = Join-Path $BasePath $ModuleName

    # Create directory structure
    Write-Status "Creating module structure for $ModuleName..." "Info"

    $directories = @(
        "",
        "models",
        "views",
        "security",
        "data",
        "demo",
        "wizards",
        "reports",
        "controllers",
        "tests",
        "static/description",
        "static/src/js",
        "static/src/xml",
        "static/src/scss",
        "i18n"
    )

    foreach ($dir in $directories) {
        $fullPath = Join-Path $modulePath $dir
        if (-not (Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        }
    }

    # Generate __manifest__.py
    $category = switch ($IndustryType) {
        "hospitality" { "Hospitality" }
        "manufacturing" { "Manufacturing" }
        "retail" { "Point of Sale" }
        "accounting" { "Accounting" }
        default { "Tools" }
    }

    $depends = switch ($IndustryType) {
        "hospitality" { "'base', 'mail', 'account', 'sale', 'contacts', 'hr'" }
        "manufacturing" { "'base', 'mail', 'mrp', 'stock', 'quality_control'" }
        "retail" { "'base', 'mail', 'point_of_sale', 'sale', 'stock'" }
        "accounting" { "'base', 'mail', 'account', 'account_accountant'" }
        default { "'base', 'mail'" }
    }

    $manifestContent = @"
# -*- coding: utf-8 -*-
{
    'name': '$($ModuleName -replace '_', ' ' | ForEach-Object { (Get-Culture).TextInfo.ToTitleCase($_) })',
    'version': '$Version',
    'category': '$category',
    'summary': 'Module description here',
    'description': '''
        Long description here
    ''',
    'author': '$Author',
    'website': 'https://yourcompany.com',
    'license': 'LGPL-3',
    'depends': [
        $depends,
    ],
    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        'views/menu_views.xml',
    ],
    'demo': [],
    'assets': {
        'web.assets_backend': [
            '$ModuleName/static/src/js/**/*',
            '$ModuleName/static/src/xml/**/*',
            '$ModuleName/static/src/scss/**/*',
        ],
    },
    'installable': True,
    'application': True,
    'auto_install': False,
}
"@

    Set-Content -Path (Join-Path $modulePath "__manifest__.py") -Value $manifestContent

    # Generate __init__.py files
    $initContent = "# -*- coding: utf-8 -*-`nfrom . import models, wizards, controllers"
    Set-Content -Path (Join-Path $modulePath "__init__.py") -Value $initContent

    $modelsInit = "# -*- coding: utf-8 -*-`n# from . import my_model"
    Set-Content -Path (Join-Path $modulePath "models/__init__.py") -Value $modelsInit

    $wizardsInit = "# -*- coding: utf-8 -*-"
    Set-Content -Path (Join-Path $modulePath "wizards/__init__.py") -Value $wizardsInit

    $controllersInit = "# -*- coding: utf-8 -*-"
    Set-Content -Path (Join-Path $modulePath "controllers/__init__.py") -Value $controllersInit

    $testsInit = "# -*- coding: utf-8 -*-`nfrom . import test_$ModuleName"
    Set-Content -Path (Join-Path $modulePath "tests/__init__.py") -Value $testsInit

    # Generate security files
    $securityXml = @"
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="module_category_$ModuleName" model="ir.module.category">
        <field name="name">$($ModuleName -replace '_', ' ' | ForEach-Object { (Get-Culture).TextInfo.ToTitleCase($_) })</field>
        <field name="sequence">50</field>
    </record>

    <record id="group_user" model="res.groups">
        <field name="name">User</field>
        <field name="category_id" ref="module_category_$ModuleName"/>
        <field name="implied_ids" eval="[(4, ref('base.group_user'))]"/>
    </record>

    <record id="group_manager" model="res.groups">
        <field name="name">Manager</field>
        <field name="category_id" ref="module_category_$ModuleName"/>
        <field name="implied_ids" eval="[(4, ref('group_user'))]"/>
    </record>
</odoo>
"@
    Set-Content -Path (Join-Path $modulePath "security/security.xml") -Value $securityXml

    $accessCsv = @"
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
"@
    Set-Content -Path (Join-Path $modulePath "security/ir.model.access.csv") -Value $accessCsv

    # Generate menu views
    $menuXml = @"
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <menuitem
        id="${ModuleName}_menu_root"
        name="$($ModuleName -replace '_', ' ' | ForEach-Object { (Get-Culture).TextInfo.ToTitleCase($_) })"
        sequence="50"
    />
</odoo>
"@
    Set-Content -Path (Join-Path $modulePath "views/menu_views.xml") -Value $menuXml

    # Generate test file
    $testContent = @"
# -*- coding: utf-8 -*-
from odoo.tests import tagged
from odoo.tests.common import TransactionCase


@tagged('post_install', '-at_install')
class Test$($ModuleName -replace '_', '' | ForEach-Object { (Get-Culture).TextInfo.ToTitleCase($_) })(TransactionCase):
    """Test cases for $ModuleName"""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # Setup test data

    def test_example(self):
        """Example test"""
        self.assertTrue(True)
"@
    Set-Content -Path (Join-Path $modulePath "tests/test_$ModuleName.py") -Value $testContent

    # Generate README.rst
    $readmeContent = @"
$("=" * ($ModuleName.Length))
$ModuleName
$("=" * ($ModuleName.Length))

.. |badge1| image:: https://img.shields.io/badge/maturity-Beta-yellow.png
    :alt: Beta

|badge1|

Description
===========

Module description here.

Configuration
=============

To configure this module:

1. Go to Settings > ...

Usage
=====

To use this module:

1. Go to ...

Bug Tracker
===========

Report bugs at https://github.com/yourcompany/$ModuleName/issues

Credits
=======

Authors
~~~~~~~

* $Author
"@
    Set-Content -Path (Join-Path $modulePath "README.rst") -Value $readmeContent

    Write-Status "Module $ModuleName created successfully at $modulePath" "Success"
    return $modulePath
}

# Main execution
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ULTRA-ODOO Module Generator v1.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    $result = New-OdooModule -ModuleName $Name -ModuleType $Type -IndustryType $Industry -BasePath $OutputPath

    Write-Host ""
    Write-Host "Module created successfully!" -ForegroundColor Green
    Write-Host "Location: $result" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Edit __manifest__.py with your module details" -ForegroundColor White
    Write-Host "  2. Create your models in models/" -ForegroundColor White
    Write-Host "  3. Create your views in views/" -ForegroundColor White
    Write-Host "  4. Add security rules in security/" -ForegroundColor White
    Write-Host "  5. Run: ./odoo-bin -d mydb -i $Name" -ForegroundColor White
}
catch {
    Write-Status "Error: $_" "Error"
    exit 1
}
