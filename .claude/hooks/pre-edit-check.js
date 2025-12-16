#!/usr/bin/env node
/**
 * ULTRA-CREATE v19.0 - Pre-Edit Hook
 *
 * Validates file edits before they happen:
 * - Blocks edits to critical files without explicit permission
 * - Warns about large file modifications
 * - Checks for sensitive content
 */

const readline = require('readline');

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

async function main() {
  const input = await readStdin();
  if (!input) {
    process.exit(0);
  }

  const toolInput = input.tool_input || {};
  const filePath = toolInput.file_path || toolInput.path || '';
  const content = toolInput.content || toolInput.new_string || '';

  // Critical files that need explicit permission
  const criticalPatterns = [
    /\.env$/i,
    /\.env\..+$/i,
    /secrets?\./i,
    /credentials/i,
    /\.pem$/i,
    /\.key$/i,
    /password/i
  ];

  // Check if editing a critical file
  for (const pattern of criticalPatterns) {
    if (pattern.test(filePath)) {
      const output = {
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'ask',
          permissionDecisionReason: `⚠️ Editing sensitive file: ${filePath}`
        }
      };
      console.log(JSON.stringify(output));
      process.exit(0);
    }
  }

  // Check for sensitive content being written
  const sensitivePatterns = [
    /sk-[a-zA-Z0-9]{20,}/,  // OpenAI keys
    /ghp_[a-zA-Z0-9]{36}/,   // GitHub tokens
    /password\s*[:=]\s*["'][^"']+["']/i,  // Hardcoded passwords
    /secret\s*[:=]\s*["'][^"']+["']/i     // Hardcoded secrets
  ];

  for (const pattern of sensitivePatterns) {
    if (pattern.test(content)) {
      const output = {
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: '🚫 Detected potential sensitive data in content. Use environment variables instead.'
        }
      };
      console.log(JSON.stringify(output));
      process.exit(0);
    }
  }

  // Warn about very large edits
  if (content.length > 10000) {
    const output = {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: `📦 Large edit detected (${content.length} chars). Confirm?`
      }
    };
    console.log(JSON.stringify(output));
    process.exit(0);
  }

  // Allow the edit
  process.exit(0);
}

main().catch(err => {
  console.error('Hook error:', err.message);
  process.exit(0); // Don't block on hook errors
});
