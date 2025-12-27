# Commande: /agency

## Description
Lance une analyse multi-agents avec equipe hierarchique (CEO/CTO/PM/Dev/Client).

## Usage
```
/agency [type] "[description du projet]"
```

## Types Disponibles

### /agency saas
Analyse complete pour projet SaaS
```bash
/agency saas "Plateforme de gestion de projets avec IA"
```

### /agency startup
Analyse pour lancement de startup
```bash
/agency startup "App mobile fitness avec coaching IA"
```

### /agency feature
Analyse pour nouvelle fonctionnalite
```bash
/agency feature "Ajouter systeme de paiement Stripe"
```

### /agency audit
Audit complet d'un projet existant
```bash
/agency audit "C:/mon-projet"
```

## Workflow

### Phase 1: CEO - Analyse Strategique
```yaml
agent: Project Director (CEO)
outputs:
  - Analyse de faisabilite
  - Evaluation budget
  - Decision Go/No-Go
  - Recommandations strategiques
```

### Phase 2: CTO - Specification Technique
```yaml
agent: Technical Architect (CTO)
outputs:
  - Architecture proposee
  - Stack technologique
  - Scalabilite
  - Considerations securite
```

### Phase 3: PM - Roadmap Produit
```yaml
agent: Product Manager (PM)
outputs:
  - Features prioritisees
  - Roadmap phases
  - Sprint planning
  - User stories
```

### Phase 4: Dev - Plan Implementation
```yaml
agent: Lead Developer
outputs:
  - Estimation effort
  - Plan technique detaille
  - Dependances
  - Risques techniques
```

### Phase 5: Client - Strategie Go-to-Market
```yaml
agent: Client Success Manager
outputs:
  - Plan de lancement
  - Strategie acquisition
  - Metriques succes
  - Plan communication
```

## Output Format

```markdown
# Agency Analysis: [Projet]

## Tab 1: Analyse Strategique (CEO)
[Vision et decision]

## Tab 2: Specification Technique (CTO)
[Architecture et tech]

## Tab 3: Roadmap Produit (PM)
[Features et planning]

## Tab 4: Plan Implementation (Dev)
[Details techniques]

## Tab 5: Strategie Lancement (Client)
[Go-to-market]

## Synthese
[Recommandations consolidees]
```

## Options

```bash
--quick          # Analyse rapide (CEO + CTO seulement)
--full           # Analyse complete tous les agents
--focus=[agent]  # Focus sur un agent specifique
--export=pdf     # Exporter en PDF
```

## Agent Utilise
- `services-agency` (equipe complete)
- Integration avec PM Agent pour validation

## Integration Hindsight
Sauvegarde automatique:
- Patterns de projets similaires
- Estimations pour futurs projets
- Apprentissages d'analyses precedentes
