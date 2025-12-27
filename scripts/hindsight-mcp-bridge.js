#!/usr/bin/env node
/**
 * ULTRA-CREATE v19.2 - Hindsight MCP Bridge
 *
 * Transforms Hindsight HTTP API into MCP-compatible stdio interface
 * This allows Claude to call Hindsight directly via MCP protocol
 *
 * Tools exposed:
 * - hindsight_retain: Save memory to a bank
 * - hindsight_recall: Query memories from a bank
 * - hindsight_reflect: Get AI-powered insights from memories
 * - hindsight_status: Check Hindsight server status
 * - hindsight_banks: List available memory banks
 */

const http = require('http');
const readline = require('readline');

const HINDSIGHT_URL = 'http://localhost:8888';

const MEMORY_BANKS = {
  development: 'ultra-dev-memory',
  trading: 'ultra-trading-memory',
  user_preferences: 'ultra-user-memory',
  world_facts: 'ultra-world-memory',
  experiences: 'ultra-experiences-memory',
  skills: 'ultra-skills-memory',
  errors: 'ultra-errors-memory',
  patterns: 'ultra-patterns-memory',
  projects: 'ultra-projects-memory'
};

// MCP Protocol helpers
function sendResponse(id, result) {
  const response = { jsonrpc: '2.0', id, result };
  console.log(JSON.stringify(response));
}

function sendError(id, code, message) {
  const response = { jsonrpc: '2.0', id, error: { code, message } };
  console.log(JSON.stringify(response));
}

// HTTP request helper
function httpRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, HINDSIGHT_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Tool implementations
async function hindsightStatus() {
  try {
    const result = await httpRequest('GET', '/health');
    return {
      online: true,
      status: result.data.status || 'healthy',
      database: result.data.database || 'connected',
      url: HINDSIGHT_URL,
      banks: Object.keys(MEMORY_BANKS)
    };
  } catch (err) {
    return {
      online: false,
      error: err.message,
      suggestion: 'Run: .\\scripts\\start-hindsight.ps1'
    };
  }
}

async function hindsightRetain(bank, content, context = '', metadata = {}) {
  const bankId = MEMORY_BANKS[bank] || MEMORY_BANKS.development;

  const body = {
    items: [{
      content: content,
      metadata: {
        bank: bank,
        context: context,
        timestamp: new Date().toISOString(),
        source: 'claude-code',
        ...metadata
      }
    }]
  };

  try {
    const result = await httpRequest('POST', `/v1/default/banks/${bankId}/memories`, body);
    return {
      success: result.data?.success || result.status === 200,
      bank: bank,
      bankId: bankId,
      content_preview: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      response: result.data
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function hindsightRecall(bank, query, maxResults = 10) {
  const bankId = MEMORY_BANKS[bank] || MEMORY_BANKS.development;

  const body = {
    query: query,
    max_memories: maxResults,
    metadata_filter: {}
  };

  try {
    const result = await httpRequest('POST', `/v1/default/banks/${bankId}/memories/recall`, body);
    return {
      success: true,
      bank: bank,
      query: query,
      memories: result.data.memories || result.data || [],
      count: (result.data.memories || result.data || []).length
    };
  } catch (err) {
    return { success: false, error: err.message, memories: [] };
  }
}

async function hindsightReflect(bank, query) {
  const bankId = MEMORY_BANKS[bank] || MEMORY_BANKS.development;

  const body = { query: query };

  try {
    const result = await httpRequest('POST', `/v1/default/banks/${bankId}/reflect`, body);
    return {
      success: true,
      bank: bank,
      query: query,
      insights: result.data.insights || result.data.reflection || result.data
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function hindsightBanks() {
  return {
    banks: Object.entries(MEMORY_BANKS).map(([name, id]) => ({
      name,
      id,
      description: getBankDescription(name)
    }))
  };
}

function getBankDescription(name) {
  const descriptions = {
    development: 'Code patterns, solutions, technical learnings',
    trading: 'Trading strategies, market patterns, indicators',
    user_preferences: 'User preferences and settings',
    world_facts: 'General knowledge and facts',
    experiences: 'Past experiences and outcomes',
    skills: 'Learned skills and techniques',
    errors: 'Error solutions and debugging patterns',
    patterns: 'Reusable code and design patterns',
    projects: 'Project-specific memories and context'
  };
  return descriptions[name] || 'General memory bank';
}

// MCP Tool definitions
const TOOLS = {
  hindsight_status: {
    description: 'Check if Hindsight memory server is online and get its status',
    inputSchema: { type: 'object', properties: {} }
  },
  hindsight_banks: {
    description: 'List all available Hindsight memory banks',
    inputSchema: { type: 'object', properties: {} }
  },
  hindsight_retain: {
    description: 'Save a memory to Hindsight. Use for patterns, solutions, learnings.',
    inputSchema: {
      type: 'object',
      properties: {
        bank: {
          type: 'string',
          enum: Object.keys(MEMORY_BANKS),
          description: 'Memory bank to save to'
        },
        content: {
          type: 'string',
          description: 'Content to remember'
        },
        context: {
          type: 'string',
          description: 'Additional context (optional)'
        }
      },
      required: ['bank', 'content']
    }
  },
  hindsight_recall: {
    description: 'Query memories from Hindsight. Use to find past solutions or patterns.',
    inputSchema: {
      type: 'object',
      properties: {
        bank: {
          type: 'string',
          enum: Object.keys(MEMORY_BANKS),
          description: 'Memory bank to query'
        },
        query: {
          type: 'string',
          description: 'Search query'
        },
        maxResults: {
          type: 'number',
          description: 'Maximum results (default: 10)'
        }
      },
      required: ['bank', 'query']
    }
  },
  hindsight_reflect: {
    description: 'Get AI-powered insights from memories in a bank',
    inputSchema: {
      type: 'object',
      properties: {
        bank: {
          type: 'string',
          enum: Object.keys(MEMORY_BANKS),
          description: 'Memory bank to reflect on'
        },
        query: {
          type: 'string',
          description: 'What to reflect about'
        }
      },
      required: ['bank', 'query']
    }
  }
};

// Handle MCP requests
async function handleRequest(request) {
  const { id, method, params } = request;

  switch (method) {
    case 'initialize':
      return sendResponse(id, {
        protocolVersion: '2024-11-05',
        serverInfo: { name: 'hindsight-mcp-bridge', version: '1.0.0' },
        capabilities: { tools: {} }
      });

    case 'tools/list':
      return sendResponse(id, {
        tools: Object.entries(TOOLS).map(([name, def]) => ({
          name,
          description: def.description,
          inputSchema: def.inputSchema
        }))
      });

    case 'tools/call':
      const { name, arguments: args } = params;
      let result;

      switch (name) {
        case 'hindsight_status':
          result = await hindsightStatus();
          break;
        case 'hindsight_banks':
          result = hindsightBanks();
          break;
        case 'hindsight_retain':
          result = await hindsightRetain(args.bank, args.content, args.context || '');
          break;
        case 'hindsight_recall':
          result = await hindsightRecall(args.bank, args.query, args.maxResults || 10);
          break;
        case 'hindsight_reflect':
          result = await hindsightReflect(args.bank, args.query);
          break;
        default:
          return sendError(id, -32601, `Unknown tool: ${name}`);
      }

      return sendResponse(id, { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] });

    case 'notifications/initialized':
      // Client initialized, no response needed
      return;

    default:
      return sendError(id, -32601, `Unknown method: ${method}`);
  }
}

// Main loop - read JSON-RPC from stdin
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });

rl.on('line', async (line) => {
  try {
    const request = JSON.parse(line);
    await handleRequest(request);
  } catch (err) {
    console.error(JSON.stringify({ jsonrpc: '2.0', error: { code: -32700, message: err.message } }));
  }
});

// Prevent process from exiting
process.stdin.resume();
