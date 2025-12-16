#!/usr/bin/env node
/**
 * ULTRA-CREATE Pre-Deploy Hook v1.0
 * Tests obligatoires avant tout déploiement
 *
 * BLOQUE le déploiement si:
 * - Lint échoue
 * - TypeScript errors
 * - Tests unitaires échouent
 * - Tests E2E échouent (si configurés)
 * - Scan sécurité détecte des vulnérabilités critiques
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[PASS]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[FAIL]${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.cyan}━━━ ${msg} ━━━${colors.reset}`)
};

class PreDeployChecker {
  constructor(projectPath) {
    this.projectPath = projectPath || process.cwd();
    this.results = [];
    this.hasBlockingError = false;
  }

  // Exécuter une commande et retourner le résultat
  exec(command, options = {}) {
    try {
      const result = execSync(command, {
        cwd: this.projectPath,
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options
      });
      return { success: true, output: result };
    } catch (error) {
      return { success: false, output: error.message, error };
    }
  }

  // Vérifier si un fichier/outil existe
  hasFile(filename) {
    return fs.existsSync(path.join(this.projectPath, filename));
  }

  hasTool(command) {
    try {
      execSync(`where ${command}`, { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  // 1. Lint Check (ESLint / Biome)
  async checkLint() {
    log.step('LINT CHECK');

    if (this.hasFile('biome.json') || this.hasFile('biome.jsonc')) {
      log.info('Using Biome for linting...');
      const result = this.exec('npx biome check .', { silent: true });
      if (result.success) {
        log.success('Biome check passed');
        this.results.push({ check: 'lint', passed: true });
      } else {
        log.error('Biome check failed');
        console.log(result.output);
        this.results.push({ check: 'lint', passed: false, error: result.output });
        this.hasBlockingError = true;
      }
    } else if (this.hasFile('.eslintrc.js') || this.hasFile('.eslintrc.json') || this.hasFile('eslint.config.js')) {
      log.info('Using ESLint for linting...');
      const result = this.exec('npx eslint . --ext .js,.jsx,.ts,.tsx --max-warnings 0', { silent: true });
      if (result.success) {
        log.success('ESLint check passed');
        this.results.push({ check: 'lint', passed: true });
      } else {
        log.error('ESLint check failed');
        console.log(result.output);
        this.results.push({ check: 'lint', passed: false, error: result.output });
        this.hasBlockingError = true;
      }
    } else {
      log.warn('No linter configured - SKIPPING (consider adding ESLint or Biome)');
      this.results.push({ check: 'lint', passed: true, skipped: true });
    }
  }

  // 2. TypeScript Check
  async checkTypeScript() {
    log.step('TYPESCRIPT CHECK');

    if (this.hasFile('tsconfig.json')) {
      log.info('Running TypeScript compiler...');
      const result = this.exec('npx tsc --noEmit', { silent: true });
      if (result.success) {
        log.success('TypeScript check passed - no type errors');
        this.results.push({ check: 'typescript', passed: true });
      } else {
        log.error('TypeScript errors found');
        console.log(result.output);
        this.results.push({ check: 'typescript', passed: false, error: result.output });
        this.hasBlockingError = true;
      }
    } else {
      log.warn('No tsconfig.json found - SKIPPING');
      this.results.push({ check: 'typescript', passed: true, skipped: true });
    }
  }

  // 3. Unit Tests (Vitest / Jest)
  async checkUnitTests() {
    log.step('UNIT TESTS');

    const hasVitest = this.hasFile('vitest.config.ts') || this.hasFile('vitest.config.js');
    const hasJest = this.hasFile('jest.config.js') || this.hasFile('jest.config.ts');

    if (hasVitest) {
      log.info('Running Vitest...');
      const result = this.exec('npx vitest run --reporter=verbose', { silent: false });
      if (result.success) {
        log.success('All unit tests passed');
        this.results.push({ check: 'unit-tests', passed: true });
      } else {
        log.error('Unit tests failed');
        this.results.push({ check: 'unit-tests', passed: false });
        this.hasBlockingError = true;
      }
    } else if (hasJest) {
      log.info('Running Jest...');
      const result = this.exec('npx jest --passWithNoTests', { silent: false });
      if (result.success) {
        log.success('All unit tests passed');
        this.results.push({ check: 'unit-tests', passed: true });
      } else {
        log.error('Unit tests failed');
        this.results.push({ check: 'unit-tests', passed: false });
        this.hasBlockingError = true;
      }
    } else {
      log.warn('No test framework configured - SKIPPING');
      this.results.push({ check: 'unit-tests', passed: true, skipped: true });
    }
  }

  // 4. E2E Tests (Playwright)
  async checkE2ETests() {
    log.step('E2E TESTS');

    if (this.hasFile('playwright.config.ts') || this.hasFile('playwright.config.js')) {
      log.info('Running Playwright E2E tests...');
      const result = this.exec('npx playwright test', { silent: false });
      if (result.success) {
        log.success('All E2E tests passed');
        this.results.push({ check: 'e2e-tests', passed: true });
      } else {
        log.error('E2E tests failed');
        this.results.push({ check: 'e2e-tests', passed: false });
        this.hasBlockingError = true;
      }
    } else {
      log.warn('Playwright not configured - SKIPPING');
      this.results.push({ check: 'e2e-tests', passed: true, skipped: true });
    }
  }

  // 5. Security Scan (Semgrep)
  async checkSecurity() {
    log.step('SECURITY SCAN');

    log.info('Running npm audit...');
    const npmAudit = this.exec('npm audit --audit-level=critical', { silent: true });
    if (!npmAudit.success && npmAudit.output.includes('critical')) {
      log.error('Critical vulnerabilities found in dependencies');
      this.results.push({ check: 'npm-audit', passed: false });
      this.hasBlockingError = true;
    } else {
      log.success('No critical vulnerabilities in dependencies');
      this.results.push({ check: 'npm-audit', passed: true });
    }

    // Semgrep si disponible
    if (this.hasTool('semgrep')) {
      log.info('Running Semgrep security scan...');
      const result = this.exec('semgrep --config=auto --error --severity=ERROR .', { silent: true });
      if (result.success) {
        log.success('Semgrep scan passed');
        this.results.push({ check: 'semgrep', passed: true });
      } else {
        log.error('Semgrep found security issues');
        console.log(result.output);
        this.results.push({ check: 'semgrep', passed: false });
        this.hasBlockingError = true;
      }
    } else {
      log.warn('Semgrep not installed - SKIPPING advanced security scan');
      this.results.push({ check: 'semgrep', passed: true, skipped: true });
    }
  }

  // 6. Build Check
  async checkBuild() {
    log.step('BUILD CHECK');

    if (this.hasFile('package.json')) {
      const pkg = JSON.parse(fs.readFileSync(path.join(this.projectPath, 'package.json'), 'utf8'));
      if (pkg.scripts && pkg.scripts.build) {
        log.info('Running build...');
        const result = this.exec('npm run build', { silent: false });
        if (result.success) {
          log.success('Build successful');
          this.results.push({ check: 'build', passed: true });
        } else {
          log.error('Build failed');
          this.results.push({ check: 'build', passed: false });
          this.hasBlockingError = true;
        }
      } else {
        log.warn('No build script in package.json - SKIPPING');
        this.results.push({ check: 'build', passed: true, skipped: true });
      }
    }
  }

  // Exécuter tous les checks
  async runAll() {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           ULTRA-CREATE PRE-DEPLOY VALIDATION                  ║
║                   All checks must pass                        ║
╚═══════════════════════════════════════════════════════════════╝
`);

    log.info(`Project path: ${this.projectPath}`);

    await this.checkLint();
    await this.checkTypeScript();
    await this.checkUnitTests();
    await this.checkE2ETests();
    await this.checkSecurity();
    await this.checkBuild();

    // Résumé final
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                        SUMMARY                                ║
╚═══════════════════════════════════════════════════════════════╝
`);

    this.results.forEach(r => {
      const icon = r.passed ? (r.skipped ? '⊘' : '✓') : '✗';
      const color = r.passed ? (r.skipped ? colors.yellow : colors.green) : colors.red;
      console.log(`  ${color}${icon}${colors.reset} ${r.check}${r.skipped ? ' (skipped)' : ''}`);
    });

    console.log('');

    if (this.hasBlockingError) {
      log.error('═══════════════════════════════════════════════════════════════');
      log.error('  DEPLOY BLOCKED - Fix the errors above before deploying');
      log.error('═══════════════════════════════════════════════════════════════');
      process.exit(1);
    } else {
      log.success('═══════════════════════════════════════════════════════════════');
      log.success('  ALL CHECKS PASSED - Ready to deploy!');
      log.success('═══════════════════════════════════════════════════════════════');
      process.exit(0);
    }
  }
}

// Exécution
const projectPath = process.argv[2] || process.cwd();
const checker = new PreDeployChecker(projectPath);
checker.runAll();
