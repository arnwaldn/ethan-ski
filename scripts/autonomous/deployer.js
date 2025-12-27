#!/usr/bin/env node
/**
 * Deployer - Déploiement automatique des projets
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

class Deployer {
  constructor() {
    this.platforms = {
      vercel: this.deployVercel.bind(this),
      netlify: this.deployNetlify.bind(this),
      cloudflare: this.deployCloudflare.bind(this),
    }
  }

  async deploy(projectPath, platform = 'vercel') {
    console.log(`\n🚀 Déploiement sur ${platform}...`)

    // Vérifier que le projet est buildable
    console.log('📦 Build du projet...')
    try {
      execSync('npm run build', { cwd: projectPath, stdio: 'inherit' })
    } catch (e) {
      throw new Error('Build échoué - déploiement annulé')
    }

    // Déployer selon la plateforme
    const deployFn = this.platforms[platform]
    if (!deployFn) {
      throw new Error(`Plateforme non supportée: ${platform}`)
    }

    return deployFn(projectPath)
  }

  async deployVercel(projectPath) {
    console.log('☁️  Déploiement Vercel...')

    // Vérifier si Vercel CLI est installé
    try {
      execSync('vercel --version', { stdio: 'pipe' })
    } catch {
      console.log('⚠️  Vercel CLI non installé')
      console.log('   npm i -g vercel')
      return { success: false, error: 'Vercel CLI required' }
    }

    try {
      const result = execSync('vercel --prod --yes', {
        cwd: projectPath,
        encoding: 'utf8',
      })

      // Extraire l'URL du déploiement
      const urlMatch = result.match(/https:\/\/[^\s]+\.vercel\.app/)
      const url = urlMatch ? urlMatch[0] : null

      console.log('✅ Déployé:', url)
      return { success: true, url }
    } catch (e) {
      return { success: false, error: e.message }
    }
  }

  async deployNetlify(projectPath) {
    console.log('☁️  Déploiement Netlify...')

    // Vérifier si Netlify CLI est installé
    try {
      execSync('netlify --version', { stdio: 'pipe' })
    } catch {
      console.log('⚠️  Netlify CLI non installé')
      console.log('   npm i -g netlify-cli')
      return { success: false, error: 'Netlify CLI required' }
    }

    try {
      // Déployer en production
      const result = execSync('netlify deploy --prod --dir=.next', {
        cwd: projectPath,
        encoding: 'utf8',
      })

      // Extraire l'URL du déploiement
      const urlMatch = result.match(/https:\/\/[^\s]+\.netlify\.app/)
      const url = urlMatch ? urlMatch[0] : null

      console.log('✅ Déployé:', url)
      return { success: true, url }
    } catch (e) {
      return { success: false, error: e.message }
    }
  }

  async deployCloudflare(projectPath) {
    console.log('☁️  Déploiement Cloudflare Pages...')

    try {
      execSync('wrangler --version', { stdio: 'pipe' })
    } catch {
      console.log('⚠️  Wrangler CLI non installé')
      console.log('   npm i -g wrangler')
      return { success: false, error: 'Wrangler CLI required' }
    }

    try {
      const result = execSync('wrangler pages deploy .next --project-name ' + path.basename(projectPath), {
        cwd: projectPath,
        encoding: 'utf8',
      })

      const urlMatch = result.match(/https:\/\/[^\s]+\.pages\.dev/)
      const url = urlMatch ? urlMatch[0] : null

      console.log('✅ Déployé:', url)
      return { success: true, url }
    } catch (e) {
      return { success: false, error: e.message }
    }
  }
}

module.exports = { Deployer }
