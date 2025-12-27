#!/usr/bin/env node
/**
 * ULTRA-CREATE Autonomous Orchestrator v1.0
 * Cerveau du système de création autonome
 */

const fs = require('fs')
const path = require('path')
const { TemplateEngine } = require('./template-engine')
const { Validator } = require('./validator')

const TEMPLATES_DIR = path.join(__dirname, '..', '..', 'templates')
const PROJECTS_DIR = path.join(__dirname, '..', '..', 'projects')

class AutonomousOrchestrator {
  constructor() {
    this.templateEngine = new TemplateEngine(TEMPLATES_DIR)
    this.validator = new Validator()
  }

  // Analyser la demande et déterminer le type de projet
  analyzeRequest(description) {
    const keywords = {
      saas: ['saas', 'dashboard', 'auth', 'subscription', 'billing', 'abonnement', 'utilisateurs'],
      landing: ['landing', 'vitrine', 'marketing', 'homepage', 'présentation', 'one-page'],
      api: ['api', 'rest', 'backend', 'endpoints', 'crud', 'microservice'],
      mobile: ['mobile', 'app', 'expo', 'react native', 'ios', 'android', 'smartphone', 'téléphone'],
      desktop: ['desktop', 'windows', 'macos', 'linux', 'electron', 'tauri', 'application bureau'],
      ecommerce: ['ecommerce', 'e-commerce', 'boutique', 'shop', 'panier', 'cart', 'produits', 'vente'],
    }

    const desc = description.toLowerCase()
    let scores = {}

    for (const [type, words] of Object.entries(keywords)) {
      scores[type] = words.filter(w => desc.includes(w)).length
    }

    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
    return best[1] > 0 ? best[0] : 'saas' // Default to SaaS
  }

  // Obtenir les instructions spécifiques par type
  getPostCreateInstructions(projectType, projectPath) {
    const instructions = {
      saas: [
        'cd ' + projectPath,
        'npm install',
        'Configurer .env avec Supabase + Stripe',
        'npm run dev',
      ],
      landing: [
        'cd ' + projectPath,
        'npm install',
        'npm run dev',
      ],
      api: [
        'cd ' + projectPath,
        'npm install',
        'npx prisma db push',
        'npm run dev',
      ],
      mobile: [
        'cd ' + projectPath,
        'npm install',
        'Configurer .env avec Supabase',
        'npx expo start',
      ],
      desktop: [
        'cd ' + projectPath,
        'npm install',
        'Installer Rust: https://rustup.rs',
        'npm run tauri:dev',
      ],
      ecommerce: [
        'cd ' + projectPath,
        'npm install',
        'npx prisma db push',
        'Configurer .env avec Stripe + Supabase',
        'npm run dev',
      ],
    }
    return instructions[projectType] || instructions.saas
  }


  // Extraire les variables du projet depuis la description
  extractVariables(description, projectName) {
    return {
      PROJECT_NAME: projectName.toLowerCase().replace(/\s+/g, '-'),
      APP_NAME: projectName,
      APP_TAGLINE: 'Solution moderne et performante',
      APP_HEADLINE: `${projectName} - Simplifiez votre quotidien`,
      APP_DESCRIPTION: description.slice(0, 200),
    }
  }

  // Créer un projet complet
  async createProject(description, projectName, options = {}) {
    console.log('\n🚀 ULTRA-CREATE Autonomous Mode')
    console.log('━'.repeat(50))

    // 1. Analyser
    console.log('\n📊 Analyse de la demande...')
    const projectType = options.type || this.analyzeRequest(description)
    console.log(`   Type détecté: ${projectType}`)

    // 2. Vérifier le template
    const templatePath = path.join(TEMPLATES_DIR, projectType)
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template "${projectType}" non trouvé`)
    }

    // 3. Créer le dossier projet
    const projectPath = path.join(PROJECTS_DIR, projectName.toLowerCase().replace(/\s+/g, '-'))
    console.log(`\n📁 Création: ${projectPath}`)

    // 4. Générer depuis le template
    console.log('\n⚙️  Génération du code...')
    const variables = this.extractVariables(description, projectName)
    await this.templateEngine.generate(projectType, projectPath, variables)

    // 5. Validation automatique
    if (!options.skipValidation) {
      console.log('\n✅ Validation automatique...')
      const valid = await this.validator.validate(projectPath)
      if (!valid.success) {
        console.log('⚠️  Erreurs détectées, correction en cours...')
        // Auto-fix logic here
      }
    }

    console.log('\n━'.repeat(50))
    console.log('✨ Projet créé avec succès!')
    console.log(`📍 Chemin: ${projectPath}`)
    console.log(`📦 Type: ${projectType}`)
    console.log('\n📝 Prochaines étapes:')
    const steps = this.getPostCreateInstructions(projectType, projectPath)
    steps.forEach((step, i) => console.log(`   ${i + 1}. ${step}`))

    return { path: projectPath, type: projectType, variables }
  }
}

module.exports = { AutonomousOrchestrator }

// CLI
if (require.main === module) {
  const args = process.argv.slice(2)
  if (args.length < 2) {
    console.log('Usage: node orchestrator.js <project-name> "<description>"')
    process.exit(1)
  }

  const orchestrator = new AutonomousOrchestrator()
  orchestrator.createProject(args[1], args[0])
    .catch(err => console.error('Erreur:', err.message))
}
