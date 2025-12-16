#!/usr/bin/env node
/**
 * ULTRA-CREATE v19.0 - Post-Edit Learning Hook
 *
 * After successful edits, records patterns for learning:
 * - Tracks file types edited
 * - Records successful patterns
 * - Updates session history
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const STATE_DIR = path.join(__dirname, '..', '..', '.ultra-state');

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
  });
}

async function loadState(stateId) {
  try {
    const content = await fs.readFile(path.join(STATE_DIR, `${stateId}.json`), 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function saveState(stateId, state) {
  try {
    await fs.mkdir(STATE_DIR, { recursive: true });
    await fs.writeFile(
      path.join(STATE_DIR, `${stateId}.json`),
      JSON.stringify(state, null, 2)
    );
  } catch (err) {
    console.error('Failed to save state:', err.message);
  }
}

async function main() {
  const input = await readStdin();
  if (!input) {
    process.exit(0);
  }

  const toolName = input.tool_name;
  const toolInput = input.tool_input || {};
  const toolResponse = input.tool_response || {};
  const filePath = toolInput.file_path || toolInput.path || '';

  // Only track successful operations
  if (!toolResponse.success && toolResponse.success !== undefined) {
    process.exit(0);
  }

  // Track edit statistics
  let stats = await loadState('edit-stats') || {
    projectId: 'edit-stats',
    updatedAt: new Date().toISOString(),
    totalEdits: 0,
    byExtension: {},
    recentFiles: []
  };

  stats.totalEdits++;
  stats.updatedAt = new Date().toISOString();

  // Track by extension
  const ext = path.extname(filePath) || 'unknown';
  stats.byExtension[ext] = (stats.byExtension[ext] || 0) + 1;

  // Track recent files (last 20)
  if (filePath && !stats.recentFiles.includes(filePath)) {
    stats.recentFiles.unshift(filePath);
    if (stats.recentFiles.length > 20) {
      stats.recentFiles = stats.recentFiles.slice(0, 20);
    }
  }

  await saveState('edit-stats', stats);

  // Output for Claude (optional context)
  const output = {
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: `📊 Edit #${stats.totalEdits} | ${ext} files: ${stats.byExtension[ext]}`
    }
  };
  console.log(JSON.stringify(output));

  process.exit(0);
}

main().catch(err => {
  console.error('Hook error:', err.message);
  process.exit(0);
});
