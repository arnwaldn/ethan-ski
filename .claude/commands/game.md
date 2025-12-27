# /game Command

Create games with AI-powered design and implementation.

## Usage

```
/game [mode] "description"
```

### Modes

| Mode | Usage | Template | Example |
|------|-------|----------|---------|
| `simple` | Quick 2D web games | `game-web` | `/game simple "tetris clone"` |
| `3d` | 3D web games | `game-3d-web` | `/game 3d "racing game"` |
| `multiplayer` | Online multiplayer | `game-multiplayer` | `/game multiplayer "arena shooter"` |
| `roguelike` | Procedural dungeon | `game-roguelike` | `/game roguelike "dungeon crawler"` |
| `puzzle` | Puzzle mechanics | `game-puzzle` | `/game puzzle "match-3 with combos"` |
| `godot` | Native Godot export | Godot project | `/game godot "platformer"` |
| `full` | Complete production | GDD + Code | `/game full "RPG with crafting"` |
| (auto) | Auto-detect | - | `/game "puzzle game with gems"` |

### Options

| Option | Description | Example |
|--------|-------------|---------|
| `--multiplayer` | Add networking | `/game simple "pong" --multiplayer` |
| `--mobile` | Optimize for touch | `/game puzzle "2048" --mobile` |
| `--physics=matter` | Specify physics | `/game simple "angry birds" --physics=matter` |
| `--procgen` | Add procedural gen | `/game platformer "caves" --procgen` |

## Examples

### Simple 2D Games (Phaser)
```
/game simple "snake game with power-ups"
/game simple "breakout clone"
/game simple "flappy bird style"
/game "memory card matching game"
```

### 3D Web Games (Three.js)
```
/game 3d "racing game with tracks"
/game 3d "first person exploration"
/game 3d "low poly adventure"
/game 3d "3D puzzle with physics"
```

### Multiplayer Games (Colyseus)
```
/game multiplayer "battle royale top-down"
/game multiplayer "co-op dungeon crawler"
/game multiplayer "real-time strategy"
/game multiplayer "racing with 8 players"
```

### Roguelike Games (ECS + rot.js)
```
/game roguelike "dungeon crawler ASCII"
/game roguelike "vampire survivors clone"
/game roguelike "card-based combat"
/game roguelike "sci-fi space station"
```

### Puzzle Games (2048/Match-3)
```
/game puzzle "2048 variant hexagonal"
/game puzzle "match-3 with story"
/game puzzle "sliding tile puzzle"
/game puzzle "word game like wordle"
```

### Godot Export
```
/game godot "2D platformer pixel art"
/game godot "top-down shooter"
/game godot "visual novel"
```

### Full Production
```
/game full "open world RPG with crafting"
/game full "2D platformer with level editor"
/game full "tower defense with waves"
```

## Mode Flows

### Simple/3D/Puzzle (Quick)

1. Parse description
2. Select template and stack
3. Use Context7 for docs
4. Generate playable prototype
5. Output: Ready-to-run code

**Estimated time**: 5-15 minutes

### Multiplayer

1. Parse description
2. Use `game-multiplayer` template
3. Configure server room logic
4. Implement client prediction
5. Setup Docker for local testing
6. Output: Client + Server code

**Estimated time**: 20-30 minutes

### Roguelike

1. Parse description
2. Use `game-roguelike` template
3. Configure ECS components
4. Design dungeon generator
5. Setup loot tables
6. Output: Turn-based roguelike

**Estimated time**: 15-25 minutes

### Full Production

1. Collect detailed inputs:
   - Game type, goal, audience
   - Art style, mood, perspective
   - Platforms, budget, timeline
   - Core mechanics, inspiration

2. Run 4 design perspectives:
   - Story Design
   - Gameplay Design
   - Visual & Audio Design
   - Technical Design

3. Generate Game Design Document

4. Create project with selected engine

5. Output: Complete project structure + GDD

**Estimated time**: 30-60 minutes

## Stack Selection

| Mode/Condition | Stack |
|----------------|-------|
| `simple` / 2D Casual | Phaser 3 |
| `3d` / Web 3D | Three.js + Cannon-es |
| `multiplayer` | Phaser + Colyseus |
| `roguelike` | Phaser + rot.js + ECS |
| `puzzle` | Phaser 3 |
| `godot` | Godot 4 + GDScript |
| `full` + Console/Large | Unity 6 |
| `full` + Open source | Godot 4 |
| 3D assets needed | + Blender |

## MCP Integration

- **Context7**: Documentation for Phaser, Three.js, Godot
- **Unity MCP**: @akiojin/unity-mcp-server
- **Godot MCP**: godot-mcp-cli
- **Blender MCP**: blender-mcp (requires addon)

## Knowledge Base

Reference documentation in `knowledge/gaming/`:

| Category | Topics |
|----------|--------|
| `patterns/` | Game loop, ECS, State machine, Object pooling, Event bus |
| `physics/` | Collision, Platformer physics, Projectile motion |
| `multiplayer/` | Architecture, State sync, Prediction, Lag compensation |
| `procedural/` | Dungeon generation, Terrain, Loot tables |
| `genres/` | Platformer, Roguelike, Puzzle, Shooter |
| `references/` | 2048, Tetris, Snake, BrowserQuest patterns |
| `tools/` | Tiled integration, Sound effects (Bfxr) |

## Specialized Agents

| Agent | File | Expertise |
|-------|------|-----------|
| Phaser Expert | `agents/game/phaser-expert.md` | Phaser 3, tilemaps, physics |
| Three.js Expert | `agents/game/threejs-game-expert.md` | WebGL, shaders, WebXR |
| Godot Expert | `agents/game/godot-expert.md` | GDScript, signals, nodes |
| Networking Expert | `agents/game/networking-expert.md` | Colyseus, prediction |
| Audio Expert | `agents/game/audio-expert.md` | Howler.js, spatial audio |
| Procgen Expert | `agents/game/procgen-expert.md` | BSP, WFC, loot tables |

## Main Agent

Uses: `agents/game/game-architect.md`

---

*ULTRA-CREATE v23.0 - Game Development Command*
