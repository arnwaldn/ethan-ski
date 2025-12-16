/**
 * ULTRA-CREATE v18.2 - Hindsight Memory Adapter
 *
 * Bridges ULTRA-CREATE to Hindsight biomimetic memory system
 * Uses official @vectorize-io/hindsight-client when available
 *
 * IMPORTANT: Hindsight is NOT an MCP server. Start it separately:
 *   .\scripts\start-hindsight.ps1
 *
 * Usage:
 *   const memory = require('./hindsight-adapter');
 *   await memory.retain('world', 'Next.js 15 uses App Router by default');
 *   const results = await memory.recall('How to use Next.js routing?');
 *   const insights = await memory.reflect('What patterns work best for React?');
 */

const http = require('http');
const https = require('https');

// Try to load official client, fall back to custom implementation
let OfficialClient = null;
try {
  OfficialClient = require('@vectorize-io/hindsight-client').HindsightClient;
  console.log('[Hindsight] Using official @vectorize-io/hindsight-client');
} catch {
  console.log('[Hindsight] Official client not found, using built-in HTTP adapter');
  console.log('[Hindsight] To install: npm install @vectorize-io/hindsight-client');
}

class HindsightAdapter {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || process.env.HINDSIGHT_URL || 'http://localhost:8888';
    this.timeout = options.timeout || 30000;

    // Use official client if available
    if (OfficialClient) {
      this.client = new OfficialClient({ baseUrl: this.baseUrl });
    } else {
      this.client = null;
    }

    // Memory bank IDs - aligned with Hindsight's biomimetic types
    // World = Facts about the world
    // Experiences = Agent's own experiences
    // Opinions = Beliefs with confidence scores
    // Observations = Complex mental models from reflection
    this.banks = {
      // Core biomimetic types
      world: 'ultra-world-memory',
      experiences: 'ultra-experiences-memory',
      opinions: 'ultra-opinions-memory',
      observations: 'ultra-observations-memory',

      // ULTRA-CREATE specific banks
      skills: 'ultra-skills-memory',
      trading: 'ultra-trading-memory',
      development: 'ultra-dev-memory',
      user_preferences: 'ultra-user-memory'
    };
  }

  /**
   * Make HTTP request to Hindsight API (fallback when official client unavailable)
   */
  async _httpRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: this.timeout
      };

      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = data ? JSON.parse(data) : {};
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(json);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${json.message || json.detail || data}`));
            }
          } catch (e) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ raw: data });
            } else {
              reject(new Error(`Invalid JSON response: ${data}`));
            }
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  /**
   * Check if Hindsight server is running
   */
  async isAvailable() {
    try {
      await this._httpRequest('GET', '/health');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get server health status
   */
  async health() {
    return await this._httpRequest('GET', '/health');
  }

  /**
   * RETAIN - Store information in memory
   *
   * This is how the agent "remembers" new information.
   * Hindsight will automatically extract entities, relationships, and temporal data.
   *
   * @param {string} type - Memory type: 'world', 'experiences', 'skills', 'trading', 'development'
   * @param {string} content - Information to remember
   * @param {object} options - Additional options (context, timestamp)
   * @returns {object} Retention result
   *
   * Examples:
   *   await memory.retain('world', 'Supabase uses PostgreSQL under the hood');
   *   await memory.retain('experiences', 'Build failed: missing dependency lodash', { context: 'npm install' });
   *   await memory.retain('skills', 'Always use Context7 before generating framework code');
   */
  async retain(type, content, options = {}) {
    const bankId = this.banks[type] || this.banks.world;

    const body = {
      bank_id: bankId,
      content: content,
      timestamp: options.timestamp || new Date().toISOString(),
      ...options
    };

    console.log(`[Hindsight] RETAIN → ${type}: "${content.substring(0, 60)}${content.length > 60 ? '...' : ''}"`);

    if (this.client) {
      return await this.client.retain(bankId, content, options);
    }
    return await this._httpRequest('POST', '/retain', body);
  }

  /**
   * RECALL - Retrieve memories matching a query
   *
   * Performs multi-strategy retrieval:
   * - Semantic: Vector similarity
   * - Keyword: BM25 exact matching
   * - Graph: Entity/temporal/causal links
   * - Temporal: Time range filtering
   *
   * @param {string} query - Search query
   * @param {object} options - Additional options (bank, max_tokens)
   * @returns {object} Recall results
   *
   * Examples:
   *   await memory.recall('How to handle authentication in Next.js?');
   *   await memory.recall('What errors happened with Stripe?', { bank: 'experiences' });
   */
  async recall(query, options = {}) {
    const bankId = options.bank ? this.banks[options.bank] : null;

    const body = {
      query: query,
      max_tokens: options.max_tokens || 4000
    };

    if (bankId) {
      body.bank_id = bankId;
    }

    console.log(`[Hindsight] RECALL ← "${query.substring(0, 60)}${query.length > 60 ? '...' : ''}"`);

    if (this.client) {
      return await this.client.recall(bankId || 'ultra-world-memory', query);
    }
    return await this._httpRequest('POST', '/recall', body);
  }

  /**
   * REFLECT - Generate insights from memories
   *
   * This is where learning happens. Reflect analyzes existing memories
   * to form new opinions and observations - higher-order knowledge.
   *
   * @param {string} query - Reflection prompt
   * @param {object} options - Additional options (bank)
   * @returns {object} Reflection results with opinions/observations
   *
   * Examples:
   *   await memory.reflect('What patterns work best for React components?');
   *   await memory.reflect('What should I avoid when deploying to production?');
   */
  async reflect(query, options = {}) {
    const bankId = options.bank ? this.banks[options.bank] : this.banks.development;

    const body = {
      bank_id: bankId,
      query: query
    };

    console.log(`[Hindsight] REFLECT ◊ "${query.substring(0, 60)}${query.length > 60 ? '...' : ''}"`);

    if (this.client) {
      return await this.client.reflect(bankId, query);
    }
    return await this._httpRequest('POST', '/reflect', body);
  }

  // =========================================================================
  // ULTRA-CREATE Specific Methods - High-Level Abstractions
  // =========================================================================

  /**
   * Record a successful operation (stored as experience)
   */
  async recordSuccess(operation, details) {
    return await this.retain('experiences',
      `SUCCESS: ${operation} - ${details}`,
      { context: 'operation_success', outcome: 'success' }
    );
  }

  /**
   * Record a failed operation with optional solution (stored as experience)
   */
  async recordFailure(operation, error, solution = null) {
    let content = `FAILURE: ${operation} - Error: ${error}`;
    if (solution) {
      content += ` - Solution: ${solution}`;
    }
    return await this.retain('experiences', content, {
      context: 'operation_failure',
      outcome: 'failure',
      has_solution: !!solution
    });
  }

  /**
   * Record a learned pattern/skill (stored as opinion with confidence)
   */
  async recordSkill(skill, confidence = 0.9) {
    return await this.retain('skills', skill, {
      context: 'learned_skill',
      confidence: confidence
    });
  }

  /**
   * Record a world fact (framework/API info)
   */
  async recordFact(fact, source = null) {
    return await this.retain('world', fact, {
      context: source ? `source: ${source}` : 'world_fact'
    });
  }

  /**
   * Get relevant context before starting a task
   * Called automatically when recall_before_task is enabled
   */
  async getTaskContext(taskDescription) {
    const results = await this.recall(taskDescription);
    return {
      memories: results,
      summary: `Found ${results.memories?.length || results.length || 0} relevant memories`
    };
  }

  /**
   * Generate insights after a session
   * Helps the agent learn from its experiences
   */
  async generateSessionInsights(sessionSummary) {
    return await this.reflect(
      `Based on this session: ${sessionSummary}. What patterns should I remember? What worked well? What should I do differently next time?`,
      { bank: 'experiences' }
    );
  }

  /**
   * Trading-specific: Record market analysis
   */
  async recordMarketAnalysis(pair, analysis, levels = {}) {
    const content = `${pair}: ${analysis}` +
      (levels.support ? ` | Support: ${levels.support}` : '') +
      (levels.resistance ? ` | Resistance: ${levels.resistance}` : '');

    return await this.retain('trading', content, {
      context: 'market_analysis',
      pair: pair,
      ...levels
    });
  }

  /**
   * Development-specific: Record a code pattern
   */
  async recordCodePattern(pattern, example, framework = null) {
    const content = `Pattern: ${pattern}` +
      (framework ? ` (${framework})` : '') +
      ` | Example: ${example}`;

    return await this.retain('development', content, {
      context: 'code_pattern',
      framework: framework
    });
  }
}

// Export singleton instance
const adapter = new HindsightAdapter();

module.exports = adapter;
module.exports.HindsightAdapter = HindsightAdapter;

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const printUsage = () => {
    console.log(`
ULTRA-CREATE v18.2 - Hindsight Memory Adapter

IMPORTANT: Start Hindsight first with: .\\scripts\\start-hindsight.ps1

Commands:
  status                        Check if Hindsight is running
  retain <type> <content>       Store a memory
  recall <query>                Retrieve relevant memories
  reflect <query>               Generate insights from memories

Memory Types:
  world         Facts about frameworks, APIs, tools
  experiences   Success/failure records
  skills        Learned patterns and best practices
  trading       Market analysis (if applicable)
  development   Code patterns and solutions

Examples:
  node hindsight-adapter.js status
  node hindsight-adapter.js retain world "Next.js 15 uses App Router by default"
  node hindsight-adapter.js retain experiences "SUCCESS: Deployed to Vercel in 30s"
  node hindsight-adapter.js recall "How to use Next.js routing?"
  node hindsight-adapter.js reflect "What React patterns work best?"
    `);
  };

  (async () => {
    switch (command) {
      case 'status':
        const available = await adapter.isAvailable();
        if (available) {
          console.log('✓ Hindsight is running at', adapter.baseUrl);
          const health = await adapter.health();
          console.log('  Health:', JSON.stringify(health));
        } else {
          console.log('✗ Hindsight is not available');
          console.log('  Start with: .\\scripts\\start-hindsight.ps1');
        }
        process.exit(available ? 0 : 1);
        break;

      case 'retain':
        if (args.length < 3) {
          console.log('Usage: node hindsight-adapter.js retain <type> <content>');
          console.log('Types: world, experiences, skills, trading, development');
          process.exit(1);
        }
        const retainResult = await adapter.retain(args[1], args.slice(2).join(' '));
        console.log('✓ Memory retained');
        if (retainResult) console.log(JSON.stringify(retainResult, null, 2));
        break;

      case 'recall':
        if (args.length < 2) {
          console.log('Usage: node hindsight-adapter.js recall <query>');
          process.exit(1);
        }
        const recallResults = await adapter.recall(args.slice(1).join(' '));
        console.log('✓ Recall results:');
        console.log(JSON.stringify(recallResults, null, 2));
        break;

      case 'reflect':
        if (args.length < 2) {
          console.log('Usage: node hindsight-adapter.js reflect <query>');
          process.exit(1);
        }
        const insights = await adapter.reflect(args.slice(1).join(' '));
        console.log('✓ Reflection insights:');
        console.log(JSON.stringify(insights, null, 2));
        break;

      default:
        printUsage();
    }
  })().catch(err => {
    console.error('Error:', err.message);
    console.log('\nIs Hindsight running? Start with: .\\scripts\\start-hindsight.ps1');
    process.exit(1);
  });
}
