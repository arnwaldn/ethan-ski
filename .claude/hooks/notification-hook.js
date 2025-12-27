/**
 * ULTRA-CREATE v20.0 - Notification Hook
 * Détecte quand notifier l'utilisateur et déclenche les alertes
 *
 * Triggers:
 * - Stop: Tâche terminée
 * - PostToolUse (AskUserQuestion): Validation requise
 * - PostToolUse (Edit/Write avec erreur): Erreur détectée
 */

const { execSync } = require('child_process');
const path = require('path');

// Chemin vers le script de notification
const NOTIFICATION_SCRIPT = 'C:\\Claude-Code-Creation\\scripts\\notification-system.ps1';

/**
 * Envoie une notification
 */
function sendNotification(type, message = '') {
    try {
        const cmd = `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${NOTIFICATION_SCRIPT}" -Type ${type}${message ? ` -Message "${message.replace(/"/g, '\\"')}"` : ''}`;
        execSync(cmd, {
            stdio: 'inherit',
            timeout: 10000
        });
    } catch (error) {
        // Silently fail - don't interrupt Claude's work
        console.error(`[Notification] Error: ${error.message}`);
    }
}

/**
 * Analyse le contexte pour déterminer si une notification est nécessaire
 */
function analyzeContext(hookType, data) {
    // Hook Stop - Tâche terminée
    if (hookType === 'Stop') {
        const reason = data.stop_hook_active ? 'stop_requested' : 'natural_end';
        if (reason === 'natural_end') {
            return { notify: true, type: 'complete', message: 'Claude a terminé sa tâche' };
        }
        return { notify: false };
    }

    // Hook PostToolUse
    if (hookType === 'PostToolUse') {
        const toolName = data.tool_name || '';
        const toolResult = data.tool_result || '';

        // AskUserQuestion - Validation requise
        if (toolName === 'AskUserQuestion') {
            return {
                notify: true,
                type: 'validation',
                message: 'Claude attend votre réponse'
            };
        }

        // Erreur détectée dans le résultat
        if (toolResult.includes('error') || toolResult.includes('Error') ||
            toolResult.includes('failed') || toolResult.includes('FAILED')) {
            return {
                notify: true,
                type: 'error',
                message: 'Une erreur a été détectée'
            };
        }

        // Bash avec exit code non-zero
        if (toolName === 'Bash' && data.exit_code && data.exit_code !== 0) {
            return {
                notify: true,
                type: 'attention',
                message: `Commande terminée avec code ${data.exit_code}`
            };
        }
    }

    // Hook Notification (si implémenté dans le futur)
    if (hookType === 'Notification') {
        return {
            notify: true,
            type: data.level || 'info',
            message: data.message || 'Notification'
        };
    }

    return { notify: false };
}

/**
 * Point d'entrée du hook
 */
function main() {
    try {
        // Lire les données du hook depuis stdin
        let inputData = '';
        const fs = require('fs');
        const fd = fs.openSync(0, 'r');
        const buf = Buffer.alloc(10000);
        let n;
        while ((n = fs.readSync(fd, buf)) > 0) {
            inputData += buf.toString('utf8', 0, n);
        }
        fs.closeSync(fd);

        const hookData = JSON.parse(inputData || '{}');
        const hookType = process.env.CLAUDE_HOOK_TYPE || hookData.hook_type || 'Unknown';

        // Analyser et notifier si nécessaire
        const result = analyzeContext(hookType, hookData);

        if (result.notify) {
            sendNotification(result.type, result.message);
        }

        // Toujours continuer (ne pas bloquer Claude)
        process.exit(0);

    } catch (error) {
        // En cas d'erreur, continuer silencieusement
        console.error(`[NotificationHook] Error: ${error.message}`);
        process.exit(0);
    }
}

// Exécuter
main();
