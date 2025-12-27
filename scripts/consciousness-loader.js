#!/usr/bin/env node
/**
 * ULTRA-CREATE v19.2 - Consciousness Loader
 *
 * Automatically loads complete system awareness at session start.
 * Combines: MCP Memory + Hindsight + Local State + System Inventory
 *
 * Outputs a comprehensive consciousness payload for Claude.
 */

const fs = require('fs').promises;
const path = require('path');
const http = require('http');

const BASE_DIR = path.join(__dirname, '..');
const STATE_DIR = path.join(BASE_DIR, '.ultra-state');
const HINDSIGHT_URL = 'http://localhost:8888';

// HTTP helper
function httpRequest(method, urlPath, body = null, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, HINDSIGHT_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: { 'Content-Type': 'application/json' },
      timeout
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ ok: true, data: JSON.parse(data) });
        } catch {
          resolve({ ok: true, data });
        }
      });
    });

    req.on('error', () => resolve({ ok: false, error: 'Connection failed' }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'Timeout' }); });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Count files in directory
async function countFiles(dir, pattern = '*') {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true, recursive: true });
    return entries.filter(e => e.isFile()).length;
  } catch {
    return 0;
  }
}

// Count items in directory (non-recursive)
async function countDir(dir) {
  try {
    const entries = await fs.readdir(dir);
    return entries.length;
  } catch {
    return 0;
  }
}

// Load local state files
async function loadLocalState() {
  const state = {};
  const files = ['current-project.json', 'error-solutions.json', 'learned-patterns.json', 'session-history.json', 'edit-stats.json'];

  for (const file of files) {
    try {
      const content = await fs.readFile(path.join(STATE_DIR, file), 'utf-8');
      state[file.replace('.json', '')] = JSON.parse(content);
    } catch {
      // File doesn't exist yet
    }
  }

  return state;
}

// Check Hindsight status
async function checkHindsight() {
  const result = await httpRequest('GET', '/health');
  if (result.ok) {
    return {
      online: true,
      status: result.data.status || 'healthy',
      database: result.data.database || 'connected'
    };
  }
  return { online: false, reason: result.error };
}

// Recall recent memories from Hindsight
async function recallRecentMemories() {
  const banks = ['development', 'patterns', 'errors', 'projects'];
  const memories = {};

  for (const bank of banks) {
    const bankId = `ultra-${bank === 'development' ? 'dev' : bank}-memory`;
    const result = await httpRequest('POST', `/v1/default/banks/${bankId}/memories/recall`, {
      query: 'recent important learnings patterns solutions',
      max_memories: 5
    });

    if (result.ok && result.data) {
      memories[bank] = result.data.memories || result.data || [];
    }
  }

  return memories;
}

// Build system inventory
async function buildInventory() {
  const inventory = {
    version: 'ULTRA-CREATE v19.2',
    base: BASE_DIR,
    timestamp: new Date().toISOString()
  };

  // Count agents
  const agentCategories = await fs.readdir(path.join(BASE_DIR, 'agents')).catch(() => []);
  let agentCount = 0;
  for (const cat of agentCategories) {
    const catPath = path.join(BASE_DIR, 'agents', cat);
    const stat = await fs.stat(catPath).catch(() => null);
    if (stat?.isDirectory()) {
      agentCount += await countDir(catPath);
    }
  }
  inventory.agents = { count: agentCount, categories: agentCategories.length };

  // Count other components
  inventory.commands = await countDir(path.join(BASE_DIR, '.claude', 'commands'));
  inventory.templates = await countDir(path.join(BASE_DIR, 'templates'));
  inventory.workflows = await countDir(path.join(BASE_DIR, 'workflows'));
  inventory.knowledge = await countFiles(path.join(BASE_DIR, 'knowledge'));
  inventory.scripts = await countDir(path.join(BASE_DIR, 'scripts'));

  // Read MCP config
  try {
    const mcpConfig = await fs.readFile(path.join(BASE_DIR, '.mcp.json'), 'utf-8');
    const mcps = JSON.parse(mcpConfig);
    inventory.mcps = Object.keys(mcps.mcpServers || {}).length;
  } catch {
    inventory.mcps = 0;
  }

  return inventory;
}

// Main consciousness loader
async function loadConsciousness() {
  console.error('[CONSCIOUSNESS] Loading system awareness...');

  const consciousness = {
    loaded_at: new Date().toISOString(),
    system: {},
    memory: {},
    state: {},
    capabilities: {}
  };

  // 1. System Inventory
  consciousness.system = await buildInventory();
  console.error(`[CONSCIOUSNESS] System: ${consciousness.system.agents.count} agents, ${consciousness.system.mcps} MCPs`);

  // 2. Hindsight Status & Memories
  consciousness.memory.hindsight = await checkHindsight();
  if (consciousness.memory.hindsight.online) {
    consciousness.memory.recent = await recallRecentMemories();
    console.error('[CONSCIOUSNESS] Hindsight: ONLINE - memories loaded');
  } else {
    console.error('[CONSCIOUSNESS] Hindsight: OFFLINE');
  }

  // 3. Local State
  consciousness.state = await loadLocalState();
  console.error(`[CONSCIOUSNESS] Local state: ${Object.keys(consciousness.state).length} files`);

  // 4. Capabilities summary
  consciousness.capabilities = {
    creation: ['web', 'mobile', 'desktop', 'api', 'saas', 'ecommerce'],
    stack: ['Next.js 15', 'React 19', 'TypeScript 5.7', 'TailwindCSS 4', 'Supabase', 'Prisma 6'],
    ui: 'shadcn/ui (59+ components)',
    docs: 'Context7 (always fresh)',
    memory: consciousness.memory.hindsight.online ? 'Hindsight + MCP Memory' : 'MCP Memory only',
    gain: '3-4x vs manual'
  };

  // Output for hook consumption
  const output = {
    consciousness: consciousness,
    summary: `ULTRA-CREATE v19.2 | ${consciousness.system.agents.count} agents | ${consciousness.system.mcps} MCPs | Hindsight: ${consciousness.memory.hindsight.online ? 'ON' : 'OFF'}`
  };

  console.log(JSON.stringify(output, null, 2));
  return consciousness;
}

// Run
loadConsciousness().catch(err => {
  console.error('[CONSCIOUSNESS] Error:', err.message);
  process.exit(1);
});
