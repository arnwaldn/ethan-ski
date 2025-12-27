#!/usr/bin/env node
/**
 * Template Engine - Génère des projets à partir des templates
 */

const fs = require('fs')
const path = require('path')

class TemplateEngine {
  constructor(templatesDir) {
    this.templatesDir = templatesDir
  }

  // Copier récursivement avec remplacement de variables
  async generate(templateType, destPath, variables) {
    const srcPath = path.join(this.templatesDir, templateType)
    
    if (!fs.existsSync(srcPath)) {
      throw new Error(`Template non trouvé: ${templateType}`)
    }

    fs.mkdirSync(destPath, { recursive: true })
    await this.copyDir(srcPath, destPath, variables)
    
    return destPath
  }

  async copyDir(src, dest, variables) {
    const entries = fs.readdirSync(src, { withFileTypes: true })

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name)
      const destPath = path.join(dest, entry.name)

      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true })
        await this.copyDir(srcPath, destPath, variables)
      } else {
        await this.copyFile(srcPath, destPath, variables)
      }
    }
  }

  async copyFile(src, dest, variables) {
    const ext = path.extname(src)
    const textExts = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.html', '.prisma', '.env']

    if (textExts.includes(ext) || src.endsWith('.example')) {
      // Fichier texte - remplacer les variables
      let content = fs.readFileSync(src, 'utf8')
      content = this.replaceVariables(content, variables)
      fs.writeFileSync(dest, content)
    } else {
      // Fichier binaire - copie directe
      fs.copyFileSync(src, dest)
    }
  }

  replaceVariables(content, variables) {
    let result = content
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      result = result.replace(regex, value)
    }
    return result
  }
}

module.exports = { TemplateEngine }
