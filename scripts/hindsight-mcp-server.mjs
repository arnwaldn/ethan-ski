#!/usr/bin/env node
/**
 * Hindsight MCP Server - Native integration for Claude Code
 * Connects to Hindsight API running on localhost:8888
 *
 * Tools: recall, retain, reflect, list_banks, get_stats
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const HINDSIGHT_BASE_URL = process.env.HINDSIGHT_URL || 'http://localhost:8888';
const DEFAULT_BANK = process.env.HINDSIGHT_DEFAULT_BANK || 'ultra-dev-memory';

// Helper to make API requests
async function apiRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${HINDSIGHT_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error ${response.status}: ${error}`);
    }
    return await response.json();
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Hindsight not running. Start with: docker start hindsight hindsight-postgres');
    }
    throw error;
  }
}

// Create MCP server
const server = new Server(
  {
    name: 'hindsight',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'hindsight_recall',
        description: 'Recall memories from Hindsight. Use this to search for previously learned patterns, error solutions, or project context.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'What to search for in memory',
            },
            bank: {
              type: 'string',
              description: 'Memory bank to search (default: ultra-dev-memory). Options: ultra-dev-memory, errors, patterns, skills, projects, trading-brain',
              default: DEFAULT_BANK,
            },
            top_k: {
              type: 'number',
              description: 'Number of results to return (default: 5)',
              default: 5,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'hindsight_retain',
        description: 'Store new memories in Hindsight. Use this to save learned patterns, error solutions, or important discoveries.',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'The information to remember',
            },
            bank: {
              type: 'string',
              description: 'Memory bank to store in (default: ultra-dev-memory)',
              default: DEFAULT_BANK,
            },
            context: {
              type: 'string',
              description: 'Optional context about the memory',
            },
          },
          required: ['content'],
        },
      },
      {
        name: 'hindsight_reflect',
        description: 'Get insights and reflections from stored memories. Use this to understand patterns across multiple memories.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'What to reflect on',
            },
            bank: {
              type: 'string',
              description: 'Memory bank to reflect on (default: ultra-dev-memory)',
              default: DEFAULT_BANK,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'hindsight_list_banks',
        description: 'List all available memory banks in Hindsight.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'hindsight_stats',
        description: 'Get statistics for a memory bank.',
        inputSchema: {
          type: 'object',
          properties: {
            bank: {
              type: 'string',
              description: 'Memory bank to get stats for (default: ultra-dev-memory)',
              default: DEFAULT_BANK,
            },
          },
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'hindsight_recall': {
        const bank = args.bank || DEFAULT_BANK;
        const result = await apiRequest(
          `/v1/default/banks/${bank}/memories/recall`,
          'POST',
          {
            query: args.query,
            top_k: args.top_k || 5,
          }
        );

        if (!result.results || result.results.length === 0) {
          return {
            content: [{ type: 'text', text: `No memories found for query: "${args.query}"` }],
          };
        }

        const memories = result.results.map((r, i) =>
          `[${i + 1}] ${r.text}\n   Entities: ${r.entities?.join(', ') || 'none'}\n   Date: ${r.occurred_start || 'unknown'}`
        ).join('\n\n');

        return {
          content: [{ type: 'text', text: `Found ${result.results.length} memories:\n\n${memories}` }],
        };
      }

      case 'hindsight_retain': {
        const bank = args.bank || DEFAULT_BANK;
        const result = await apiRequest(
          `/v1/default/banks/${bank}/memories`,
          'POST',
          {
            items: [{
              content: args.content,
              context: args.context || '',
              document_id: `claude-session-${Date.now()}`
            }],
            async: false
          }
        );

        return {
          content: [{ type: 'text', text: `Memory stored successfully in bank "${bank}". Document ID: ${result.documents?.[0] || 'created'}` }],
        };
      }

      case 'hindsight_reflect': {
        const bank = args.bank || DEFAULT_BANK;
        const result = await apiRequest(
          `/v1/default/banks/${bank}/reflect`,
          'POST',
          {
            query: args.query,
          }
        );

        return {
          content: [{ type: 'text', text: result.reflection || 'No reflection available' }],
        };
      }

      case 'hindsight_list_banks': {
        const result = await apiRequest('/v1/default/banks');
        const banks = result.banks.map(b =>
          `- ${b.bank_id}: created ${new Date(b.created_at).toLocaleDateString()}`
        ).join('\n');

        return {
          content: [{ type: 'text', text: `Available memory banks:\n${banks}` }],
        };
      }

      case 'hindsight_stats': {
        const bank = args.bank || DEFAULT_BANK;
        const result = await apiRequest(`/v1/default/banks/${bank}/stats`);

        return {
          content: [{
            type: 'text',
            text: `Stats for "${bank}":\n${JSON.stringify(result, null, 2)}`
          }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Hindsight MCP Server running');
}

main().catch(console.error);
