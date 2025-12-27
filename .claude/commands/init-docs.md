# /init-docs - Initialize Project Documentation

Initializes the tripartite documentation system (PLANNING.md, TASK.md, KNOWLEDGE.md) in a project.

## Usage

```
/init-docs [project-path]
```

## What It Does

1. Creates `docs/` directory in project root
2. Copies and customizes:
   - `PLANNING.md` - Architecture & absolute rules
   - `TASK.md` - Current tasks & backlog
   - `KNOWLEDGE.md` - Accumulated insights
3. Pre-fills project information if CLAUDE.md exists

## Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `project-path` | Path to project root | Current directory |

## Example

```
/init-docs C:\Projects\my-saas
```

Creates:
```
C:\Projects\my-saas\
└── docs\
    ├── PLANNING.md
    ├── TASK.md
    └── KNOWLEDGE.md
```

## Template Source

Templates from: `C:\Claude-Code-Creation\templates\project-docs\`

## Integration

### With PDCA Cycle
- **PLANNING.md**: Updated during PLAN phase
- **TASK.md**: Updated during DO phase
- **KNOWLEDGE.md**: Updated during ACT phase

### With Hindsight
Key learnings from KNOWLEDGE.md should be synced to Hindsight:
```javascript
mcp__hindsight__hindsight_retain({
  bank: 'projects',
  content: '[project] - [learning from KNOWLEDGE.md]',
  context: 'Project knowledge'
})
```

## Customization

After initialization, customize each file:

1. **PLANNING.md**:
   - Fill in tech stack
   - Define architecture decisions
   - Set absolute rules

2. **TASK.md**:
   - Add current sprint tasks
   - Define backlog

3. **KNOWLEDGE.md**:
   - Add project-specific patterns
   - Document known issues

## Related Commands

| Command | Description |
|---------|-------------|
| `/turbo` | Create new project with docs |
| `/scaffold` | Create project structure |
| `/learn` | Save learning to Hindsight |
