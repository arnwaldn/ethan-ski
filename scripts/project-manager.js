/**
 * ULTRA-CREATE Project Manager v1.0
 * Système de persistance des projets et contexte
 *
 * Fonctionnalités:
 * - Création/gestion de projets persistants
 * - Historique des modifications
 * - Suivi des erreurs
 * - Contexte inter-sessions
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, '..', 'data', 'projects.db');
const STATE_DIR = path.join(__dirname, '..', '.ultra-state');

// Initialisation de la base de données
function initDatabase() {
  const db = new Database(DB_PATH);

  db.exec(`
    -- Table des projets
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      stack TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      path TEXT,
      config TEXT
    );

    -- Table des décisions prises
    CREATE TABLE IF NOT EXISTS decisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      reasoning TEXT,
      alternatives TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    -- Table des fichiers modifiés
    CREATE TABLE IF NOT EXISTS file_changes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      file_path TEXT NOT NULL,
      action TEXT NOT NULL,
      before_hash TEXT,
      after_hash TEXT,
      diff TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    -- Table des erreurs rencontrées
    CREATE TABLE IF NOT EXISTS errors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      stack_trace TEXT,
      resolution TEXT,
      resolved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    -- Table des sessions de travail
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ended_at DATETIME,
      summary TEXT,
      tokens_used INTEGER DEFAULT 0,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    -- Table de suivi des coûts API
    CREATE TABLE IF NOT EXISTS api_costs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT,
      service TEXT NOT NULL,
      operation TEXT,
      units_used REAL,
      estimated_cost REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Index pour performances
    CREATE INDEX IF NOT EXISTS idx_decisions_project ON decisions(project_id);
    CREATE INDEX IF NOT EXISTS idx_file_changes_project ON file_changes(project_id);
    CREATE INDEX IF NOT EXISTS idx_errors_project ON errors(project_id);
    CREATE INDEX IF NOT EXISTS idx_api_costs_service ON api_costs(service);
  `);

  return db;
}

class ProjectManager {
  constructor() {
    this.db = initDatabase();
  }

  // Créer un nouveau projet
  createProject(name, options = {}) {
    const id = crypto.randomUUID();
    const projectPath = path.join(STATE_DIR, id);

    // Créer le répertoire d'état du projet
    fs.mkdirSync(projectPath, { recursive: true });

    // Insérer dans la DB
    const stmt = this.db.prepare(`
      INSERT INTO projects (id, name, description, stack, path, config)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      name,
      options.description || '',
      options.stack || 'nextjs-supabase',
      projectPath,
      JSON.stringify(options.config || {})
    );

    // Créer les fichiers d'état initiaux
    this.saveState(id, {
      context: {},
      currentPhase: 'init',
      completedTasks: [],
      pendingTasks: []
    });

    console.log(`Project created: ${id}`);
    return id;
  }

  // Sauvegarder l'état du projet
  saveState(projectId, state) {
    const statePath = path.join(STATE_DIR, projectId, 'state.json');
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

    // Mettre à jour updated_at
    this.db.prepare('UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(projectId);
  }

  // Charger l'état du projet
  loadState(projectId) {
    const statePath = path.join(STATE_DIR, projectId, 'state.json');
    if (fs.existsSync(statePath)) {
      return JSON.parse(fs.readFileSync(statePath, 'utf8'));
    }
    return null;
  }

  // Enregistrer une décision
  recordDecision(projectId, type, description, reasoning = '', alternatives = []) {
    const stmt = this.db.prepare(`
      INSERT INTO decisions (project_id, type, description, reasoning, alternatives)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(projectId, type, description, reasoning, JSON.stringify(alternatives));
  }

  // Enregistrer une modification de fichier
  recordFileChange(projectId, filePath, action, beforeContent = null, afterContent = null) {
    const beforeHash = beforeContent ? crypto.createHash('md5').update(beforeContent).digest('hex') : null;
    const afterHash = afterContent ? crypto.createHash('md5').update(afterContent).digest('hex') : null;

    const stmt = this.db.prepare(`
      INSERT INTO file_changes (project_id, file_path, action, before_hash, after_hash)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(projectId, filePath, action, beforeHash, afterHash);
  }

  // Enregistrer une erreur
  recordError(projectId, type, message, stackTrace = '') {
    const stmt = this.db.prepare(`
      INSERT INTO errors (project_id, type, message, stack_trace)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(projectId, type, message, stackTrace).lastInsertRowid;
  }

  // Marquer une erreur comme résolue
  resolveError(errorId, resolution) {
    const stmt = this.db.prepare(`
      UPDATE errors
      SET resolved = 1, resolution = ?, resolved_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(resolution, errorId);
  }

  // Enregistrer un coût API
  recordApiCost(service, operation, unitsUsed, estimatedCost, projectId = null) {
    const stmt = this.db.prepare(`
      INSERT INTO api_costs (project_id, service, operation, units_used, estimated_cost)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(projectId, service, operation, unitsUsed, estimatedCost);
  }

  // Obtenir le résumé des coûts
  getCostSummary(days = 30) {
    const stmt = this.db.prepare(`
      SELECT
        service,
        SUM(units_used) as total_units,
        SUM(estimated_cost) as total_cost,
        COUNT(*) as operations
      FROM api_costs
      WHERE created_at > datetime('now', '-' || ? || ' days')
      GROUP BY service
      ORDER BY total_cost DESC
    `);
    return stmt.all(days);
  }

  // Obtenir l'historique d'un projet
  getProjectHistory(projectId) {
    return {
      decisions: this.db.prepare('SELECT * FROM decisions WHERE project_id = ? ORDER BY created_at DESC').all(projectId),
      fileChanges: this.db.prepare('SELECT * FROM file_changes WHERE project_id = ? ORDER BY created_at DESC').all(projectId),
      errors: this.db.prepare('SELECT * FROM errors WHERE project_id = ? ORDER BY created_at DESC').all(projectId)
    };
  }

  // Lister tous les projets
  listProjects() {
    return this.db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all();
  }

  // Obtenir un projet par ID
  getProject(projectId) {
    return this.db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
  }

  // Générer un rapport de projet
  generateReport(projectId) {
    const project = this.getProject(projectId);
    const history = this.getProjectHistory(projectId);
    const state = this.loadState(projectId);

    return {
      project,
      state,
      statistics: {
        totalDecisions: history.decisions.length,
        totalFileChanges: history.fileChanges.length,
        totalErrors: history.errors.length,
        unresolvedErrors: history.errors.filter(e => !e.resolved).length
      },
      recentActivity: {
        decisions: history.decisions.slice(0, 10),
        fileChanges: history.fileChanges.slice(0, 10),
        errors: history.errors.slice(0, 10)
      }
    };
  }

  close() {
    this.db.close();
  }
}

// Export pour utilisation
module.exports = { ProjectManager, initDatabase };

// CLI si exécuté directement
if (require.main === module) {
  const pm = new ProjectManager();
  const args = process.argv.slice(2);

  switch(args[0]) {
    case 'create':
      const id = pm.createProject(args[1] || 'New Project', {
        description: args[2] || '',
        stack: args[3] || 'nextjs-supabase'
      });
      console.log(`Created project: ${id}`);
      break;
    case 'list':
      console.table(pm.listProjects());
      break;
    case 'costs':
      console.table(pm.getCostSummary(parseInt(args[1]) || 30));
      break;
    case 'report':
      console.log(JSON.stringify(pm.generateReport(args[1]), null, 2));
      break;
    default:
      console.log(`
ULTRA-CREATE Project Manager

Usage:
  node project-manager.js create <name> [description] [stack]
  node project-manager.js list
  node project-manager.js costs [days]
  node project-manager.js report <project-id>
      `);
  }

  pm.close();
}
