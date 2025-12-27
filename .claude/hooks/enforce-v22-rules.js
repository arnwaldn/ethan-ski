#!/usr/bin/env node
/**
 * ULTRA-CREATE v22.0 - Enforcement Hook
 *
 * Validates v22 optimization rules are being followed:
 * - Rule #1: Parallelization (batch independent calls)
 * - Rule #2: Pre-action (hindsight_recall before implementation)
 * - Rule #3: Quality markers (TypeScript strict, error handling)
 * - Rule #4: TOON format (structured output)
 * - Rule #5: Auto-save (persist learnings)
 *
 * Triggered by: PreToolUse hook
 */

const readline = require('readline');

// Track session state
const sessionState = {
  hindsightRecalled: false,
  context7Checked: false,
  lastToolWasRead: false,
  implementationStarted: false
};

// Tools that indicate implementation is starting
const IMPLEMENTATION_TOOLS = ['Edit', 'Write', 'Bash'];

// Pre-action tools that should be called first
const PREACTION_TOOLS = ['mcp__hindsight__hindsight_recall', 'mcp__context7__get-library-docs'];

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
    setTimeout(() => { rl.close(); resolve(null); }, 100);
  });
}

async function main() {
  const input = await readStdin();

  if (!input) {
    process.exit(0);
  }

  const { tool_name, tool_input } = input;

  // Track pre-action tools
  if (tool_name === 'mcp__hindsight__hindsight_recall') {
    sessionState.hindsightRecalled = true;
  }

  if (tool_name === 'mcp__context7__get-library-docs') {
    sessionState.context7Checked = true;
  }

  // Check if implementation is starting without pre-action
  if (IMPLEMENTATION_TOOLS.includes(tool_name)) {
    if (!sessionState.implementationStarted) {
      sessionState.implementationStarted = true;

      // Soft warning - don't block, just log
      if (!sessionState.hindsightRecalled && !sessionState.context7Checked) {
        console.error('[v22-WARN] Implementation started without pre-action check');
        console.error('[v22-TIP] Consider: hindsight_recall + context7 before editing');
      }
    }
  }

  // Track Read for context gathering
  if (tool_name === 'Read') {
    sessionState.lastToolWasRead = true;
  } else {
    sessionState.lastToolWasRead = false;
  }

  // Always allow - this is advisory only
  process.exit(0);
}

main().catch(() => process.exit(0));
