# /browser - Browser Automation Command

## Syntaxe
```
/browser [mode] "[instruction]"
/browser [url]
```

## Modes

| Mode | Usage | Description |
|------|-------|-------------|
| `observe` | `/browser observe "url"` | Screenshot + analyse sans modification |
| `interact` | `/browser interact "faire X sur url"` | Actions avec confirmations |
| `automate` | `/browser automate "workflow complet"` | Multi-etapes autonome |
| `scrape` | `/browser scrape "extraire X de url"` | Extraction de donnees |
| `test` | `/browser test "verifier X sur url"` | Tests automatises |
| `connect` | `/browser connect` | Connecter au Chrome de l'utilisateur |

## Exemples

### Mode Observe
```
/browser observe "https://amazon.fr/dp/B0..."
```
→ Screenshot + structure de la page + elements interactifs

### Mode Interact
```
/browser interact "connecte-toi a github avec [email]"
/browser interact "remplis le formulaire de contact sur example.com"
```
→ Actions guidees avec confirmation avant soumission

### Mode Automate
```
/browser automate "
1. Va sur mon-saas.com
2. Connecte-toi
3. Va dans Settings > Export
4. Telecharge le CSV
"
```
→ Workflow complet avec checkpoints

### Mode Scrape
```
/browser scrape "prix de tous les produits sur shop.com/category"
/browser scrape "liste des articles de blog.com avec titre et date"
```
→ Extraction structuree en JSON

### Mode Test
```
/browser test "verifie que le bouton login fonctionne sur app.com"
/browser test "verifie le responsive de landing.com"
```
→ Tests avec rapport pass/fail

### Mode Connect
```
/browser connect
```
→ Se connecte au Chrome ouvert (port 9222)
→ Necessite: `chrome --remote-debugging-port=9222`

## Workflow Interne

```
1. PARSE instruction
   ↓
2. SELECT MCP (Playwright par defaut, Puppeteer si connect)
   ↓
3. NAVIGATE vers URL
   ↓
4. SCREENSHOT initial
   ↓
5. EXECUTE actions
   ├── Si action sensible → CONFIRM avec utilisateur
   ↓
6. SCREENSHOT final
   ↓
7. RETURN rapport structure
```

## MCPs Utilises

### Playwright (par defaut)
- Plus stable et moderne
- Headless browser integre
- Support multi-navigateur

### Puppeteer (mode connect)
- Connexion au Chrome existant
- Acces aux sessions/cookies utilisateur
- Debug visuel possible

## Securite

### Confirmation Automatique Pour:
- Soumission de formulaires
- Paiements/achats
- Suppression de contenu
- Publication
- Modifications de compte

### Refuse Automatiquement:
- Sites bancaires non autorises
- Telechargements suspects
- Actions sur sites adultes
- Bots sur reseaux sociaux sans auth

## Output

### Rapport Observe
```markdown
## Page Analysis: [url]

**Title**: ...
**Screenshot**: [link]

### Interactive Elements
- Buttons: 12
- Forms: 2
- Links: 45

### Key Selectors
- Login: #login-btn
- Search: input[name="q"]
- Submit: button[type="submit"]
```

### Rapport Interact
```markdown
## Interaction Report

**URL**: [url]
**Actions**: 5
**Status**: Success

### Steps
1. Navigate → OK
2. Fill email → OK
3. Fill password → OK
4. [Confirmed] Submit → OK
5. Verify login → OK

**Screenshots**: [before] [after]
```

### Rapport Scrape
```json
{
  "url": "...",
  "extracted_at": "...",
  "count": 25,
  "data": [
    {"title": "...", "price": "...", "url": "..."},
    ...
  ]
}
```

## Integration

### Avec Firecrawl (scraping avance)
```
/browser scrape "..." --deep
```
→ Utilise Firecrawl pour crawl multi-pages

### Avec Hindsight (memoire)
Toutes les actions sont loggees:
```javascript
hindsight_retain({
  bank: 'browser-actions',
  content: 'Action X on URL Y',
  context: 'browser automation'
})
```

### Avec E2B (code execution)
```
/browser automate "..." --with-code
```
→ Peut executer du code Python/JS pour traitement

## Tips

1. **Selecteurs robustes**: Preferer `[data-testid]` ou `[aria-label]` aux classes CSS
2. **Attentes**: Le browser attend automatiquement le chargement
3. **Screenshots**: Toujours pris avant/apres pour debug
4. **Erreurs**: En cas d'echec, screenshot + DOM sauvegarde

## Dependances

- MCP Playwright OU Puppeteer
- Agent: `agents/browser/browser-agent.md`
- Optional: Firecrawl pour deep scraping

## Version
- Command: 1.0.0
- Inspired by: Claude for Chrome
