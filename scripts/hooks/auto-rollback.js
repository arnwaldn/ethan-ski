#!/usr/bin/env node
/**
 * ULTRA-CREATE Auto Rollback System v1.0
 * Sauvegarde automatique et rollback en cas d'erreur
 *
 * Fonctionnalités:
 * - Snapshot avant modifications majeures
 * - Rollback automatique si tests échouent
 * - Historique des snapshots avec cleanup
 * - Restauration sélective par fichier
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SNAPSHOTS_DIR = path.join(__dirname, '..', '..', '.ultra-state', 'snapshots');
const MAX_SNAPSHOTS = 20;  // Garder les 20 derniers snapshots

// Couleurs terminal
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
  success: (msg) => console.log(`${colors.green}[OK]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`)
};

class AutoRollback {
  constructor(projectPath) {
    this.projectPath = projectPath || process.cwd();
    this.snapshotsDir = path.join(SNAPSHOTS_DIR, this.getProjectId());
    this.ensureSnapshotDir();
  }

  getProjectId() {
    // Utiliser le nom du dossier ou générer un ID
    return path.basename(this.projectPath).replace(/[^a-zA-Z0-9-_]/g, '_');
  }

  ensureSnapshotDir() {
    fs.mkdirSync(this.snapshotsDir, { recursive: true });
  }

  // Obtenir tous les fichiers trackés (Git ou tous)
  getTrackedFiles() {
    try {
      // Essayer Git d'abord
      const gitFiles = execSync('git ls-files', {
        cwd: this.projectPath,
        encoding: 'utf8'
      }).trim().split('\n').filter(f => f);

      return gitFiles;
    } catch {
      // Fallback: tous les fichiers (exclure node_modules, etc.)
      const excluded = ['node_modules', '.git', '.next', 'dist', 'build', '.ultra-state'];
      const files = [];

      const walk = (dir, base = '') => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relPath = path.join(base, entry.name);

          if (excluded.some(ex => relPath.startsWith(ex))) continue;

          if (entry.isDirectory()) {
            walk(fullPath, relPath);
          } else if (entry.isFile()) {
            files.push(relPath);
          }
        }
      };

      walk(this.projectPath);
      return files;
    }
  }

  // Créer un snapshot
  createSnapshot(description = 'Manual snapshot') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const snapshotId = `${timestamp}_${crypto.randomBytes(4).toString('hex')}`;
    const snapshotPath = path.join(this.snapshotsDir, snapshotId);

    fs.mkdirSync(snapshotPath, { recursive: true });

    const files = this.getTrackedFiles();
    const manifest = {
      id: snapshotId,
      description,
      createdAt: new Date().toISOString(),
      projectPath: this.projectPath,
      files: []
    };

    log.info(`Creating snapshot: ${snapshotId}`);
    log.info(`Files to backup: ${files.length}`);

    for (const file of files) {
      const srcPath = path.join(this.projectPath, file);
      const destPath = path.join(snapshotPath, file);

      try {
        if (fs.existsSync(srcPath)) {
          fs.mkdirSync(path.dirname(destPath), { recursive: true });
          fs.copyFileSync(srcPath, destPath);

          const content = fs.readFileSync(srcPath);
          manifest.files.push({
            path: file,
            hash: crypto.createHash('md5').update(content).digest('hex'),
            size: content.length
          });
        }
      } catch (err) {
        log.warn(`Could not backup: ${file}`);
      }
    }

    // Sauvegarder le manifest
    fs.writeFileSync(
      path.join(snapshotPath, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    log.success(`Snapshot created: ${snapshotId}`);
    log.info(`Backed up ${manifest.files.length} files`);

    // Cleanup des vieux snapshots
    this.cleanupOldSnapshots();

    return snapshotId;
  }

  // Lister les snapshots disponibles
  listSnapshots() {
    const snapshots = [];

    if (!fs.existsSync(this.snapshotsDir)) return snapshots;

    const dirs = fs.readdirSync(this.snapshotsDir, { withFileTypes: true });
    for (const dir of dirs) {
      if (!dir.isDirectory()) continue;

      const manifestPath = path.join(this.snapshotsDir, dir.name, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        snapshots.push({
          id: manifest.id,
          description: manifest.description,
          createdAt: manifest.createdAt,
          fileCount: manifest.files.length
        });
      }
    }

    return snapshots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Restaurer un snapshot
  restore(snapshotId, options = {}) {
    const snapshotPath = path.join(this.snapshotsDir, snapshotId);
    const manifestPath = path.join(snapshotPath, 'manifest.json');

    if (!fs.existsSync(manifestPath)) {
      log.error(`Snapshot not found: ${snapshotId}`);
      return false;
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    log.info(`Restoring snapshot: ${snapshotId}`);
    log.info(`Description: ${manifest.description}`);
    log.info(`Created: ${manifest.createdAt}`);

    // Créer un snapshot de sauvegarde avant restore
    if (!options.noBackup) {
      log.info('Creating backup before restore...');
      this.createSnapshot('Pre-rollback backup');
    }

    let restored = 0;
    let failed = 0;

    for (const file of manifest.files) {
      const srcPath = path.join(snapshotPath, file.path);
      const destPath = path.join(this.projectPath, file.path);

      try {
        if (fs.existsSync(srcPath)) {
          fs.mkdirSync(path.dirname(destPath), { recursive: true });
          fs.copyFileSync(srcPath, destPath);
          restored++;
        }
      } catch (err) {
        log.warn(`Could not restore: ${file.path}`);
        failed++;
      }
    }

    log.success(`Restored ${restored} files`);
    if (failed > 0) log.warn(`Failed to restore ${failed} files`);

    return true;
  }

  // Rollback au dernier snapshot
  rollbackToLast() {
    const snapshots = this.listSnapshots();
    if (snapshots.length === 0) {
      log.error('No snapshots available');
      return false;
    }

    // Le premier est le plus récent (celui qu'on vient de créer en backup)
    // On veut le deuxième (l'état d'avant)
    const targetSnapshot = snapshots.length > 1 ? snapshots[1] : snapshots[0];
    return this.restore(targetSnapshot.id);
  }

  // Cleanup des vieux snapshots
  cleanupOldSnapshots() {
    const snapshots = this.listSnapshots();

    if (snapshots.length > MAX_SNAPSHOTS) {
      const toDelete = snapshots.slice(MAX_SNAPSHOTS);
      for (const snapshot of toDelete) {
        const snapshotPath = path.join(this.snapshotsDir, snapshot.id);
        fs.rmSync(snapshotPath, { recursive: true, force: true });
        log.info(`Deleted old snapshot: ${snapshot.id}`);
      }
    }
  }

  // Comparer snapshot avec état actuel
  diff(snapshotId) {
    const snapshotPath = path.join(this.snapshotsDir, snapshotId);
    const manifestPath = path.join(snapshotPath, 'manifest.json');

    if (!fs.existsSync(manifestPath)) {
      log.error(`Snapshot not found: ${snapshotId}`);
      return null;
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const currentFiles = this.getTrackedFiles();

    const diff = {
      modified: [],
      added: [],
      deleted: []
    };

    // Fichiers dans le snapshot
    const snapshotFileMap = new Map(manifest.files.map(f => [f.path, f]));

    // Vérifier les modifications et suppressions
    for (const [filePath, snapshotFile] of snapshotFileMap) {
      const currentPath = path.join(this.projectPath, filePath);

      if (!fs.existsSync(currentPath)) {
        diff.deleted.push(filePath);
      } else {
        const currentContent = fs.readFileSync(currentPath);
        const currentHash = crypto.createHash('md5').update(currentContent).digest('hex');

        if (currentHash !== snapshotFile.hash) {
          diff.modified.push(filePath);
        }
      }
    }

    // Fichiers ajoutés (présents maintenant mais pas dans snapshot)
    for (const file of currentFiles) {
      if (!snapshotFileMap.has(file)) {
        diff.added.push(file);
      }
    }

    return diff;
  }

  // Wrapper pour exécuter avec auto-rollback si échec
  async executeWithRollback(action, description = 'Auto-rollback operation') {
    log.info('Creating pre-operation snapshot...');
    const snapshotId = this.createSnapshot(description);

    try {
      log.info('Executing operation...');
      await action();
      log.success('Operation completed successfully');
      return true;
    } catch (error) {
      log.error(`Operation failed: ${error.message}`);
      log.warn('Initiating automatic rollback...');

      this.restore(snapshotId, { noBackup: true });
      log.success('Rollback completed');

      throw error;
    }
  }
}

// Export
module.exports = { AutoRollback };

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const projectPath = args[1] || process.cwd();
  const rollback = new AutoRollback(projectPath);

  switch(args[0]) {
    case 'snapshot':
      const id = rollback.createSnapshot(args[2] || 'CLI snapshot');
      console.log(`\nSnapshot ID: ${id}`);
      break;

    case 'list':
      console.log('\nAvailable snapshots:');
      console.log('─'.repeat(80));
      const snapshots = rollback.listSnapshots();
      if (snapshots.length === 0) {
        console.log('No snapshots found');
      } else {
        snapshots.forEach((s, i) => {
          console.log(`${i + 1}. ${s.id}`);
          console.log(`   ${s.description}`);
          console.log(`   ${s.createdAt} | ${s.fileCount} files`);
          console.log('');
        });
      }
      break;

    case 'restore':
      if (!args[2]) {
        console.log('Usage: auto-rollback.js restore <snapshot-id>');
        process.exit(1);
      }
      rollback.restore(args[2]);
      break;

    case 'rollback':
      rollback.rollbackToLast();
      break;

    case 'diff':
      if (!args[2]) {
        console.log('Usage: auto-rollback.js diff <snapshot-id>');
        process.exit(1);
      }
      const diff = rollback.diff(args[2]);
      if (diff) {
        console.log('\nChanges since snapshot:');
        console.log(`Modified: ${diff.modified.length} files`);
        diff.modified.forEach(f => console.log(`  M ${f}`));
        console.log(`Added: ${diff.added.length} files`);
        diff.added.forEach(f => console.log(`  A ${f}`));
        console.log(`Deleted: ${diff.deleted.length} files`);
        diff.deleted.forEach(f => console.log(`  D ${f}`));
      }
      break;

    default:
      console.log(`
ULTRA-CREATE Auto Rollback System

Usage:
  node auto-rollback.js snapshot [path] [description]  - Create a snapshot
  node auto-rollback.js list [path]                    - List all snapshots
  node auto-rollback.js restore <snapshot-id> [path]   - Restore a snapshot
  node auto-rollback.js rollback [path]                - Rollback to last snapshot
  node auto-rollback.js diff <snapshot-id> [path]      - Show changes since snapshot
      `);
  }
}
