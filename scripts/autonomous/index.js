#!/usr/bin/env node
/**
 * ULTRA-CREATE Autonomous System v1.0
 * Point d'entrée principal
 */

const { AutonomousOrchestrator } = require('./orchestrator')
const { TemplateEngine } = require('./template-engine')
const { Validator } = require('./validator')
const { Deployer } = require('./deployer')

// Export all modules
module.exports = {
  AutonomousOrchestrator,
  TemplateEngine,
  Validator,
  Deployer,
}

// CLI Mode
if (require.main === module) {
  const args = process.argv.slice(2)
  const command = args[0]

  const orchestrator = new AutonomousOrchestrator()
  const deployer = new Deployer()

  switch (command) {
    case 'create':
      if (args.length < 3) {
        console.log('Usage: node index.js create <name> "<description>"')
        process.exit(1)
      }
      orchestrator.createProject(args[2], args[1])
        .then(r => console.log('\n✅ Projet créé:', r.path))
        .catch(e => console.error('❌ Erreur:', e.message))
      break

    case 'deploy':
      if (args.length < 2) {
        console.log('Usage: node index.js deploy <project-path> [platform]')
        process.exit(1)
      }
      deployer.deploy(args[1], args[2] || 'vercel')
        .then(r => console.log('✅ Déployé:', r.url))
        .catch(e => console.error('❌ Erreur:', e.message))
      break

    default:
      console.log(`
ULTRA-CREATE Autonomous System v1.0

Commands:
  create <name> "<description>"   Créer un nouveau projet
  deploy <path> [platform]        Déployer un projet

Examples:
  node index.js create mon-saas "Application de facturation"
  node index.js deploy ./projects/mon-saas vercel
      `)
  }
}
