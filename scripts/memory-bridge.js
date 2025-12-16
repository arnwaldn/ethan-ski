/**
 * ULTRA-CREATE v19.0 - Memory Bridge
 *
 * Pont entre les différents systèmes de mémoire:
 * - Fichiers locaux (.ultra-state/)
 * - MCP Memory (simple key-value)
 * - Hindsight (biomimétique avancé)
 *
 * Usage:
 *   const bridge = require('./memory-bridge');
 *   await bridge.saveState('my-project', { patterns: [...] });
 *   const state = await bridge.loadState('my-project');
 *   await bridge.syncToMCP({ type: 'pattern', content: '...' });
 */

const fs = require('fs').promises;
const path = require('path');
const http = require('http');

// Configuration
const STATE_DIR = path.join(__dirname, '..', '.ultra-state');
const HINDSIGHT_URL = process.env.HINDSIGHT_URL || 'http://localhost:8888';

class MemoryBridge {
  constructor() {
    this.stateDir = STATE_DIR;
    this.hindsightUrl = HINDSIGHT_URL;
  }

  // =========================================================================
  // LOCAL STATE MANAGEMENT
  // =========================================================================

  /**
   * Ensure state directory exists
   */
  async ensureStateDir() {
    try {
      await fs.mkdir(this.stateDir, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
    }
  }

  /**
   * Save project state to local file
   */
  async saveState(projectId, state) {
    await this.ensureStateDir();
    const filePath = path.join(this.stateDir, `${projectId}.json`);
    const data = {
      projectId,
      updatedAt: new Date().toISOString(),
      ...state
    };
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log(`[MemoryBridge] State saved: ${projectId}`);
    return data;
  }

  /**
   * Load project state from local file
   */
  async loadState(projectId) {
    const filePath = path.join(this.stateDir, `${projectId}.json`);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return null; // No state exists yet
      }
      throw err;
    }
  }

  /**
   * List all saved states
   */
  async listStates() {
    await this.ensureStateDir();
    const files = await fs.readdir(this.stateDir);
    return files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
  }

  // =========================================================================
  // LEARNED PATTERNS MANAGEMENT
  // =========================================================================

  /**
   * Record a learned pattern
   */
  async recordPattern(pattern, context = {}) {
    const patterns = await this.loadState('learned-patterns') || { patterns: [] };
    patterns.patterns.push({
      content: pattern,
      context,
      learnedAt: new Date().toISOString()
    });
    await this.saveState('learned-patterns', patterns);

    // Also try to sync to Hindsight if available
    await this.syncToHindsight('skills', `Pattern: ${pattern}`);

    return patterns;
  }

  /**
   * Get all learned patterns
   */
  async getPatterns() {
    const state = await this.loadState('learned-patterns');
    return state?.patterns || [];
  }

  /**
   * Search patterns by keyword
   */
  async searchPatterns(keyword) {
    const patterns = await this.getPatterns();
    const lower = keyword.toLowerCase();
    return patterns.filter(p =>
      p.content.toLowerCase().includes(lower) ||
      JSON.stringify(p.context).toLowerCase().includes(lower)
    );
  }

  // =========================================================================
  // ERROR-SOLUTION PAIRS
  // =========================================================================

  /**
   * Record an error and its solution
   */
  async recordErrorSolution(error, solution, context = {}) {
    const errorSolutions = await this.loadState('error-solutions') || { pairs: [] };
    errorSolutions.pairs.push({
      error,
      solution,
      context,
      recordedAt: new Date().toISOString()
    });
    await this.saveState('error-solutions', errorSolutions);

    // Sync to Hindsight
    await this.syncToHindsight('experiences',
      `ERROR: ${error} | SOLUTION: ${solution}`
    );

    return errorSolutions;
  }

  /**
   * Find solution for similar error
   */
  async findSolution(errorMessage) {
    const state = await this.loadState('error-solutions');
    if (!state?.pairs) return null;

    const lower = errorMessage.toLowerCase();
    return state.pairs.find(p =>
      p.error.toLowerCase().includes(lower) ||
      lower.includes(p.error.toLowerCase())
    );
  }

  // =========================================================================
  // SESSION HISTORY
  // =========================================================================

  /**
   * Record session summary
   */
  async recordSession(summary, achievements = [], learnings = []) {
    const history = await this.loadState('session-history') || { sessions: [] };
    history.sessions.push({
      summary,
      achievements,
      learnings,
      timestamp: new Date().toISOString()
    });

    // Keep last 50 sessions
    if (history.sessions.length > 50) {
      history.sessions = history.sessions.slice(-50);
    }

    await this.saveState('session-history', history);

    // Generate insights if we have Hindsight
    if (await this.isHindsightAvailable()) {
      await this.reflectOnSessions();
    }

    return history;
  }

  /**
   * Get recent sessions
   */
  async getRecentSessions(limit = 10) {
    const state = await this.loadState('session-history');
    return (state?.sessions || []).slice(-limit);
  }

  // =========================================================================
  // CURRENT PROJECT TRACKING
  // =========================================================================

  /**
   * Set current active project
   */
  async setCurrentProject(projectInfo) {
    await this.saveState('current-project', {
      ...projectInfo,
      activatedAt: new Date().toISOString()
    });
  }

  /**
   * Get current project
   */
  async getCurrentProject() {
    return await this.loadState('current-project');
  }

  // =========================================================================
  // HINDSIGHT INTEGRATION
  // =========================================================================

  /**
   * Check if Hindsight is available
   */
  async isHindsightAvailable() {
    return new Promise((resolve) => {
      const req = http.get(`${this.hindsightUrl}/health`, { timeout: 2000 }, (res) => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  /**
   * Sync content to Hindsight (retain)
   */
  async syncToHindsight(bank, content) {
    if (!await this.isHindsightAvailable()) {
      console.log('[MemoryBridge] Hindsight not available, skipping sync');
      return null;
    }

    const bankIds = {
      world: 'ultra-world-memory',
      experiences: 'ultra-experiences-memory',
      skills: 'ultra-skills-memory',
      trading: 'ultra-trading-memory',
      development: 'ultra-dev-memory'
    };

    const body = JSON.stringify({
      bank_id: bankIds[bank] || bankIds.development,
      content,
      timestamp: new Date().toISOString()
    });

    return new Promise((resolve, reject) => {
      const req = http.request(`${this.hindsightUrl}/retain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve({ raw: data });
          }
        });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  /**
   * Query Hindsight (recall)
   */
  async recallFromHindsight(query, bank = 'development') {
    if (!await this.isHindsightAvailable()) {
      console.log('[MemoryBridge] Hindsight not available');
      return null;
    }

    const bankIds = {
      world: 'ultra-world-memory',
      experiences: 'ultra-experiences-memory',
      skills: 'ultra-skills-memory',
      trading: 'ultra-trading-memory',
      development: 'ultra-dev-memory'
    };

    const body = JSON.stringify({
      bank_id: bankIds[bank],
      query,
      max_tokens: 4000
    });

    return new Promise((resolve, reject) => {
      const req = http.request(`${this.hindsightUrl}/recall`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve({ raw: data });
          }
        });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  /**
   * Generate insights from Hindsight (reflect)
   */
  async reflectOnSessions() {
    if (!await this.isHindsightAvailable()) return null;

    const body = JSON.stringify({
      bank_id: 'ultra-experiences-memory',
      query: 'What patterns have worked well? What should be remembered for future sessions?'
    });

    return new Promise((resolve, reject) => {
      const req = http.request(`${this.hindsightUrl}/reflect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve({ raw: data });
          }
        });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  // =========================================================================
  // MCP MEMORY SYNC (generates commands for Claude to execute)
  // =========================================================================

  /**
   * Generate MCP Memory sync commands
   * Returns the command string that Claude should execute
   */
  generateMCPSyncCommand(entityType, name, observations) {
    return {
      tool: 'mcp__memory__create_entities',
      params: {
        entities: [{
          name,
          entityType,
          observations: Array.isArray(observations) ? observations : [observations]
        }]
      }
    };
  }

  /**
   * Export all local state to MCP-compatible format
   */
  async exportForMCP() {
    const patterns = await this.getPatterns();
    const errorSolutions = await this.loadState('error-solutions');
    const sessions = await this.getRecentSessions(5);

    const entities = [];

    // Export patterns
    patterns.forEach((p, i) => {
      entities.push({
        name: `pattern-${i}`,
        entityType: 'learned_pattern',
        observations: [p.content, `Context: ${JSON.stringify(p.context)}`]
      });
    });

    // Export error-solutions
    if (errorSolutions?.pairs) {
      errorSolutions.pairs.forEach((es, i) => {
        entities.push({
          name: `error-solution-${i}`,
          entityType: 'error_solution',
          observations: [`Error: ${es.error}`, `Solution: ${es.solution}`]
        });
      });
    }

    // Export session summaries
    sessions.forEach((s, i) => {
      entities.push({
        name: `session-${i}`,
        entityType: 'session_summary',
        observations: [s.summary, ...s.achievements, ...s.learnings]
      });
    });

    return entities;
  }
}

// Export singleton instance
const bridge = new MemoryBridge();
module.exports = bridge;
module.exports.MemoryBridge = MemoryBridge;

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const printUsage = () => {
    console.log(`
ULTRA-CREATE v19.0 - Memory Bridge

Commands:
  status                           Check memory systems status
  save <projectId> <json>          Save project state
  load <projectId>                 Load project state
  pattern <content>                Record a learned pattern
  patterns                         List all patterns
  search <keyword>                 Search patterns
  error <error> <solution>         Record error-solution pair
  session <summary>                Record session
  export-mcp                       Export all state for MCP Memory

Examples:
  node memory-bridge.js status
  node memory-bridge.js pattern "Always use Context7 before code generation"
  node memory-bridge.js error "Module not found" "npm install missing-module"
  node memory-bridge.js session "Implemented auth flow with Supabase"
    `);
  };

  (async () => {
    switch (command) {
      case 'status':
        console.log('Memory Bridge Status:');
        console.log('  State Directory:', STATE_DIR);
        const states = await bridge.listStates();
        console.log('  Saved States:', states.length);
        states.forEach(s => console.log(`    - ${s}`));
        const hindsightOk = await bridge.isHindsightAvailable();
        console.log('  Hindsight:', hindsightOk ? '✓ Available' : '✗ Not available');
        break;

      case 'save':
        if (args.length < 3) {
          console.log('Usage: node memory-bridge.js save <projectId> <json>');
          process.exit(1);
        }
        const saveResult = await bridge.saveState(args[1], JSON.parse(args[2]));
        console.log('Saved:', saveResult);
        break;

      case 'load':
        if (!args[1]) {
          console.log('Usage: node memory-bridge.js load <projectId>');
          process.exit(1);
        }
        const loadResult = await bridge.loadState(args[1]);
        console.log(JSON.stringify(loadResult, null, 2));
        break;

      case 'pattern':
        if (!args[1]) {
          console.log('Usage: node memory-bridge.js pattern <content>');
          process.exit(1);
        }
        await bridge.recordPattern(args.slice(1).join(' '));
        console.log('✓ Pattern recorded');
        break;

      case 'patterns':
        const patterns = await bridge.getPatterns();
        console.log('Learned Patterns:');
        patterns.forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.content}`);
          console.log(`     Learned: ${p.learnedAt}`);
        });
        break;

      case 'search':
        if (!args[1]) {
          console.log('Usage: node memory-bridge.js search <keyword>');
          process.exit(1);
        }
        const found = await bridge.searchPatterns(args[1]);
        console.log(`Found ${found.length} patterns:`);
        found.forEach(p => console.log(`  - ${p.content}`));
        break;

      case 'error':
        if (args.length < 3) {
          console.log('Usage: node memory-bridge.js error <error> <solution>');
          process.exit(1);
        }
        await bridge.recordErrorSolution(args[1], args.slice(2).join(' '));
        console.log('✓ Error-solution recorded');
        break;

      case 'session':
        if (!args[1]) {
          console.log('Usage: node memory-bridge.js session <summary>');
          process.exit(1);
        }
        await bridge.recordSession(args.slice(1).join(' '));
        console.log('✓ Session recorded');
        break;

      case 'export-mcp':
        const entities = await bridge.exportForMCP();
        console.log('MCP Memory Export:');
        console.log(JSON.stringify(entities, null, 2));
        break;

      default:
        printUsage();
    }
  })().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}
