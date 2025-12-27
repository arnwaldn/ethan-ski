# /email - Automatisation Email Gmail

## Syntaxe
```
/email [action] [options]
```

## Description
Automatisation des communications email professionnelles avec Gmail. Lecture, composition, recherche et resume intelligents.

## Actions

### read - Lire Emails
```
/email read                      # 10 derniers
/email read --unread             # Non lus
/email read --from="client@"     # Par expediteur
/email read --subject="projet"   # Par sujet
/email read --since="today"      # Depuis date
```

### compose - Composer Email
```
/email compose --to="dest@email.com" --subject="Sujet"
/email compose --template="followup" --to="client@"
/email compose --reply-to="[message_id]"
```

### search - Rechercher
```
/email search "facture janvier"
/email search --from="boss@" --has="attachment"
/email search --label="important"
```

### summarize - Resumer
```
/email summarize                 # Resume inbox
/email summarize --unread        # Resume non lus
/email summarize --thread="[id]" # Resume conversation
```

## Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                        /email                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. CONNEXION                                                │
│     └── Gmail API OAuth2                                     │
│                           ↓                                  │
│  2. ACTION                                                   │
│     └── Read / Compose / Search / Reply                      │
│                           ↓                                  │
│  3. ANALYSE                                                  │
│     └── LLM pour contenu intelligent                         │
│                           ↓                                  │
│  4. EXECUTION                                                │
│     └── Envoyer / Sauvegarder / Archiver                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Templates

### followup - Suivi
```
/email compose --template="followup" --to="client@" --project="Alpha"
```
```
Subject: Suivi - Projet Alpha

Bonjour,

Je me permets de revenir vers vous concernant le projet Alpha.
[CONTENU]

Restant a votre disposition,
[SIGNATURE]
```

### meeting - Reunion
```
/email compose --template="meeting" --to="team@" --subject="Sprint Review"
```

### update - Mise a Jour
```
/email compose --template="update" --to="stakeholders@" --project="Beta"
```

### intro - Introduction
```
/email compose --template="intro" --to="contact@" --context="Partenariat"
```

## Output

### /email read
```markdown
## INBOX SUMMARY

**Non lus**: 5
**Aujourd'hui**: 12
**Urgents**: 2

### Emails Recents

1. **[URGENT]** De: boss@company.com
   Sujet: Deadline projet demain
   Date: Aujourd'hui 14:30
   Preview: "Nous devons finaliser..."

2. De: client@external.com
   Sujet: Question facturation
   Date: Aujourd'hui 10:15
   Preview: "Bonjour, concernant..."

3. De: newsletter@tech.com
   Sujet: Weekly digest
   Date: Hier 18:00
   [Newsletter - Low priority]
```

### /email compose
```markdown
## EMAIL PREVIEW

**To**: destinataire@email.com
**Subject**: Suivi projet Alpha

---
Bonjour,

Je me permets de revenir vers vous concernant
le projet Alpha. Les derniers developpements
montrent une progression satisfaisante.

Cordialement,
[Signature]
---

Actions: [Envoyer] [Modifier] [Annuler]
```

### /email summarize
```markdown
## INBOX DIGEST

### Urgents (2)
- **Deadline projet** (boss@) - Action requise avant demain
- **Bug critique** (dev@) - Necessite review immediate

### En attente de reponse (3)
- Question facturation (client@) - Depuis 2 jours
- Proposition partenariat (partner@) - Depuis 1 semaine
- Feedback design (designer@) - Depuis 3 jours

### Informatifs (5)
- Newsletter tech, updates produit, etc.

### Recommandations
1. Repondre a "Deadline projet" en priorite
2. Relancer "Question facturation"
```

## Options

| Option | Usage | Description |
|--------|-------|-------------|
| `--unread` | Flag | Emails non lus |
| `--from` | `--from="email@"` | Filtrer expediteur |
| `--to` | `--to="email@"` | Destinataire |
| `--subject` | `--subject="text"` | Sujet |
| `--since` | `--since="today"` | Depuis date |
| `--template` | `--template="followup"` | Template email |
| `--label` | `--label="important"` | Par label |
| `--has` | `--has="attachment"` | Avec piece jointe |
| `--max` | `--max=20` | Nombre max |

## Configuration Requise

### Prerequisites
1. Compte Google Cloud Console
2. Gmail API activee
3. OAuth2 credentials configurees
4. Token.json genere

### Permissions
```yaml
scopes:
  - gmail.readonly   # Lecture
  - gmail.send       # Envoi
  - gmail.compose    # Brouillons
```

## Securite

```yaml
rules:
  - Confirmation avant envoi bulk
  - Pas de stockage credentials en clair
  - Rate limiting (50 emails/heure)
  - Logs de toutes les actions
```

## Integration

### Avec Hindsight
```javascript
// Sauvegarder communications importantes
mcp__hindsight__hindsight_retain({
  bank: 'communications',
  content: 'Email client X: discussion prix...',
  context: 'Projet Alpha'
})
```

## Agent
Uses: `agents/automation/email-agent.md`

## Metriques

| Metrique | Valeur |
|----------|--------|
| Temps lecture | ~2-5 sec |
| Temps envoi | ~1-2 sec |
| Max emails/req | 100 |
| Templates | 10+ |

---

*ULTRA-CREATE v21.4 - Email Automation Command*
