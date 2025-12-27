#!/usr/bin/env node
/**
 * ULTRA-CREATE v19.2 - Auto-Start Hindsight Hook
 *
 * Automatically starts Hindsight Docker containers when Claude Code starts.
 * Triggered by: PreToolUse hook (runs before first tool use)
 *
 * This ensures Hindsight is always available for memory operations.
 */

const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const HINDSIGHT_URL = 'http://localhost:8888';
const LOCK_FILE = path.join(__dirname, '..', '..', '.ultra-state', 'hindsight-started.lock');
const STATE_DIR = path.join(__dirname, '..', '..', '.ultra-state');

// Check if Hindsight is already running
function checkHindsightHealth() {
  return new Promise((resolve) => {
    const req = http.get(`${HINDSIGHT_URL}/health`, { timeout: 2000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.status === 'healthy');
        } catch {
          resolve(false);
        }
      });
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

// Check if Docker is running
function isDockerRunning() {
  try {
    execSync('docker version', { stdio: 'pipe', timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

// Check if we already tried to start in this session
function alreadyStartedThisSession() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      const stat = fs.statSync(LOCK_FILE);
      const ageMs = Date.now() - stat.mtimeMs;
      // Lock valid for 1 hour
      if (ageMs < 3600000) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

// Mark as started
function markStarted() {
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true });
    fs.writeFileSync(LOCK_FILE, new Date().toISOString());
  } catch {
    // Ignore
  }
}

// Start Hindsight using PowerShell script
function startHindsight() {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'start-hindsight.ps1');

    if (!fs.existsSync(scriptPath)) {
      console.error('[HINDSIGHT] Start script not found');
      resolve(false);
      return;
    }

    const ps = spawn('powershell.exe', [
      '-ExecutionPolicy', 'Bypass',
      '-File', scriptPath
    ], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    });

    ps.unref();

    // Give it time to start
    setTimeout(() => resolve(true), 5000);
  });
}

// Main
async function main() {
  // Skip if already tried this session
  if (alreadyStartedThisSession()) {
    process.exit(0);
  }

  // Check if already running
  const isRunning = await checkHindsightHealth();
  if (isRunning) {
    markStarted();
    console.error('[HINDSIGHT] Already running');
    process.exit(0);
  }

  // Check Docker
  if (!isDockerRunning()) {
    console.error('[HINDSIGHT] Docker not running - cannot auto-start');
    markStarted(); // Don't retry
    process.exit(0);
  }

  // Start Hindsight
  console.error('[HINDSIGHT] Starting automatically...');
  await startHindsight();

  // Verify
  let attempts = 0;
  while (attempts < 10) {
    await new Promise(r => setTimeout(r, 2000));
    const running = await checkHindsightHealth();
    if (running) {
      console.error('[HINDSIGHT] Started successfully');
      markStarted();

      // Output for Claude
      console.log(JSON.stringify({
        hindsightAutoStart: {
          success: true,
          message: 'Hindsight memory server started automatically'
        }
      }));
      process.exit(0);
    }
    attempts++;
  }

  console.error('[HINDSIGHT] Failed to start after 10 attempts');
  markStarted(); // Don't retry
  process.exit(0);
}

main().catch(() => process.exit(0));
