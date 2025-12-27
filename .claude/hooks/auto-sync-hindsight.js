#!/usr/bin/env node
/**
 * ULTRA-CREATE v19.2 - Auto-Sync Hindsight Hook
 *
 * Automatically syncs learnings to Hindsight after significant events:
 * - Error solutions found
 * - Patterns discovered
 * - Successful completions
 *
 * Triggered by: PostToolUse, Stop hooks
 */

const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const HINDSIGHT_URL = 'http://localhost:8888';
const STATE_DIR = path.join(__dirname, '..', '..', '.ultra-state');

// v22.1 - Aligned with CLAUDE.md bank names
const MEMORY_BANKS = {
  errors: 'errors',
  patterns: 'patterns',
  development: 'ultra-dev-memory',
  documents: 'documents',
  research: 'research'
};

// HTTP helper (non-blocking)
function syncToHindsight(bank, content, context = '') {
  const bankId = MEMORY_BANKS[bank] || MEMORY_BANKS.development;

  const body = JSON.stringify({
    items: [{
      content: content,
      metadata: {
        bank,
        context,
        timestamp: new Date().toISOString(),
        source: 'auto-hook'
      }
    }]
  });

  const url = new URL(`/v1/default/banks/${bankId}/memories`, HINDSIGHT_URL);

  const req = http.request({
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    },
    timeout: 3000
  });

  req.on('error', () => {}); // Silently fail - don't block
  req.write(body);
  req.end();
}

// Read stdin for hook input
async function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    const rl = readline.createInterface({ input: process.stdin });
    rl.on('line', line => data += line);
    rl.on('close', () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve(null);
      }
    });
    // Timeout after 100ms if no input
    setTimeout(() => { rl.close(); resolve(null); }, 100);
  });
}

// Load pending syncs
async function loadPendingSync() {
  try {
    const content = await fs.readFile(path.join(STATE_DIR, 'pending-sync.json'), 'utf-8');
    return JSON.parse(content);
  } catch {
    return { items: [] };
  }
}

// Save pending syncs
async function savePendingSync(pending) {
  await fs.mkdir(STATE_DIR, { recursive: true });
  await fs.writeFile(
    path.join(STATE_DIR, 'pending-sync.json'),
    JSON.stringify(pending, null, 2)
  );
}

// Check if Hindsight is online
async function isHindsightOnline() {
  return new Promise((resolve) => {
    const req = http.get(`${HINDSIGHT_URL}/health`, { timeout: 1000 }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

// Main hook logic
async function main() {
  const input = await readStdin();

  // Check for pending syncs first
  const pending = await loadPendingSync();
  const online = await isHindsightOnline();

  if (online && pending.items.length > 0) {
    // Sync pending items
    for (const item of pending.items) {
      syncToHindsight(item.bank, item.content, item.context);
    }
    pending.items = [];
    await savePendingSync(pending);
  }

  if (!input) {
    process.exit(0);
  }

  const { tool_name, tool_input, tool_response, hook_event } = input;

  // Determine what to sync based on the event
  let syncItem = null;

  // Error patterns - always valuable
  if (tool_response?.error || tool_response?.stderr?.includes('error')) {
    const errorContent = `ERROR in ${tool_name}: ${tool_response.error || tool_response.stderr}`;
    if (tool_response.success !== false) {
      // Error was resolved
      syncItem = {
        bank: 'errors',
        content: `RESOLVED: ${errorContent}\nSOLUTION: Check ${tool_input?.file_path || 'context'}`,
        context: JSON.stringify(tool_input).substring(0, 500)
      };
    }
  }

  // Successful edits with significant changes
  if (tool_name === 'Edit' && tool_response?.success) {
    const filePath = tool_input?.file_path || '';
    const ext = path.extname(filePath);

    // Track patterns for key file types
    if (['.ts', '.tsx', '.js', '.jsx', '.py', '.rs'].includes(ext)) {
      const changePreview = (tool_input?.new_string || '').substring(0, 200);
      if (changePreview.length > 50) {
        syncItem = {
          bank: 'patterns',
          content: `PATTERN in ${ext} file: ${path.basename(filePath)}\nChange: ${changePreview}`,
          context: filePath
        };
      }
    }
  }

  // Session end - sync summary
  if (hook_event === 'Stop') {
    const stats = await fs.readFile(path.join(STATE_DIR, 'edit-stats.json'), 'utf-8')
      .then(JSON.parse)
      .catch(() => null);

    if (stats && stats.totalEdits > 0) {
      syncItem = {
        bank: 'development',
        content: `SESSION SUMMARY: ${stats.totalEdits} edits across ${Object.keys(stats.byExtension).length} file types. Recent: ${stats.recentFiles.slice(0, 5).join(', ')}`,
        context: 'session-end'
      };
    }
  }

  // Queue or sync immediately
  if (syncItem) {
    if (online) {
      syncToHindsight(syncItem.bank, syncItem.content, syncItem.context);
    } else {
      pending.items.push(syncItem);
      if (pending.items.length > 50) {
        pending.items = pending.items.slice(-50); // Keep last 50
      }
      await savePendingSync(pending);
    }
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
