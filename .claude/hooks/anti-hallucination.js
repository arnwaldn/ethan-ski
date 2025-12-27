#!/usr/bin/env node
/**
 * ULTRA-CREATE v20.0 - Anti-Hallucination Hook
 *
 * PostToolUse hook that validates assertions and detects 7 red flags.
 * Triggers after Edit, Write, and Bash operations.
 */

const readline = require('readline');

// 7 Red Flags patterns to detect
const RED_FLAGS = [
  {
    id: 1,
    name: 'Tests pass without output',
    patterns: [
      /tests?\s*(pass|passed|passing)/i,
      /all\s+tests?\s+(pass|work|succeeded)/i
    ],
    requiresEvidence: 'test output'
  },
  {
    id: 2,
    name: 'Everything works without evidence',
    patterns: [
      /everything\s+(works?|is\s+working)/i,
      /all\s+(works?|working|functional)/i,
      /feature\s+(works?|is\s+complete)/i
    ],
    requiresEvidence: 'specific proof'
  },
  {
    id: 3,
    name: 'Complete with failing tests',
    patterns: [
      /implementation\s+complete/i,
      /feature\s+complete/i,
      /done\s+implementing/i
    ],
    checkForContradiction: /fail|error|failed|broken/i
  },
  {
    id: 4,
    name: 'Skipping error messages',
    patterns: [],
    checkOutput: true,
    lookFor: /error:|Error:|ERROR:|exception|Exception/i
  },
  {
    id: 5,
    name: 'Ignoring warnings',
    patterns: [],
    checkOutput: true,
    lookFor: /warning:|Warning:|WARN:|deprecated/i
  },
  {
    id: 6,
    name: 'Hiding failures',
    patterns: [],
    checkOutput: true,
    lookFor: /FAIL|Failed|failure|unsuccessful/i
  },
  {
    id: 7,
    name: 'Uncertain language',
    patterns: [
      /should\s+(work|be\s+fine|be\s+ok)/i,
      /probably\s+(works?|fine|ok|correct)/i,
      /likely\s+(works?|correct|fine)/i,
      /might\s+(work|be\s+ok)/i,
      /i\s+think\s+(it\s+)?works?/i
    ],
    requiresEvidence: 'verification'
  }
];

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

function detectRedFlags(content, output = '') {
  const detected = [];
  const combined = `${content} ${output}`;

  for (const flag of RED_FLAGS) {
    // Check patterns in content
    for (const pattern of flag.patterns) {
      if (pattern.test(content)) {
        // Check if evidence is present
        if (flag.requiresEvidence) {
          const hasEvidence = checkForEvidence(combined, flag.requiresEvidence);
          if (!hasEvidence) {
            detected.push({
              ...flag,
              match: content.match(pattern)?.[0]
            });
          }
        } else if (flag.checkForContradiction) {
          if (flag.checkForContradiction.test(combined)) {
            detected.push({
              ...flag,
              match: content.match(pattern)?.[0],
              contradiction: combined.match(flag.checkForContradiction)?.[0]
            });
          }
        } else {
          detected.push({
            ...flag,
            match: content.match(pattern)?.[0]
          });
        }
        break;
      }
    }

    // Check output for errors/warnings (flags 4-6)
    if (flag.checkOutput && flag.lookFor && output) {
      if (flag.lookFor.test(output)) {
        // Check if the issue is acknowledged in content
        const acknowledged = /acknowledge|noted|fixing|will\s+fix|addressed/i.test(content);
        if (!acknowledged) {
          detected.push({
            ...flag,
            match: output.match(flag.lookFor)?.[0],
            inOutput: true
          });
        }
      }
    }
  }

  return detected;
}

function checkForEvidence(text, evidenceType) {
  const evidencePatterns = {
    'test output': [
      /PASS|FAIL|test.*passed|tests?.*\d+/i,
      /✓|✅|❌|●/,
      /npm\s+test|jest|vitest|pytest/i
    ],
    'specific proof': [
      /\d+\s*(files?|lines?|changes?)/i,
      /src\/|components\/|lib\//,
      /line\s*\d+|:\d+:\d+/
    ],
    'verification': [
      /verified|confirmed|tested|checked/i,
      /output:|result:|evidence:/i
    ]
  };

  const patterns = evidencePatterns[evidenceType] || [];
  return patterns.some(p => p.test(text));
}

function formatWarning(flags) {
  const lines = [
    '',
    '⚠️  ANTI-HALLUCINATION WARNING',
    '═'.repeat(50),
    `Detected ${flags.length} red flag(s):`,
    ''
  ];

  flags.forEach((flag, i) => {
    lines.push(`🚩 Red Flag #${flag.id}: ${flag.name}`);
    if (flag.match) {
      lines.push(`   Found: "${flag.match}"`);
    }
    if (flag.contradiction) {
      lines.push(`   Contradiction: "${flag.contradiction}"`);
    }
    if (flag.inOutput) {
      lines.push(`   In output: "${flag.match}"`);
    }
    if (flag.requiresEvidence) {
      lines.push(`   Missing: ${flag.requiresEvidence}`);
    }
    lines.push('');
  });

  lines.push('═'.repeat(50));
  lines.push('ACTION REQUIRED: Provide evidence or rephrase claims');
  lines.push('');

  return lines.join('\n');
}

async function main() {
  const input = await readStdin();

  if (!input) {
    process.exit(0);
  }

  // Only check after certain tool types
  const checkableTools = ['Edit', 'Write', 'Bash'];
  if (!checkableTools.includes(input.tool_name)) {
    process.exit(0);
  }

  // Get the content that was processed
  const content = input.tool_input?.content ||
                  input.tool_input?.new_string ||
                  input.tool_input?.command || '';

  const output = input.tool_result?.output || '';

  // Detect red flags
  const redFlags = detectRedFlags(content, output);

  if (redFlags.length > 0) {
    // Log warning (non-blocking - informational only)
    console.error(formatWarning(redFlags));

    // Could be made blocking with process.exit(1) if needed
    // For now, just warn
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Anti-hallucination hook error:', err);
  process.exit(0); // Don't block on hook errors
});
