const { execSync } = require('child_process');

/**
 * Safely executes a shell command.
 * @param {string} command - The command to run.
 * @param {object} options - Configuration for execSync.
 * @param {boolean} options.returnOutput - If true, returns the stdout instead of printing it.
 * @param {boolean} options.ignoreError - If true, catches the error and returns null.
 */
function runCommand(command, options = {}) {
    const { returnOutput, ignoreError, ...execOptions } = options;
    
    try {
        const output = execSync(command, {
            encoding: 'utf8',
            stdio: returnOutput ? 'pipe' : 'inherit',
            ...execOptions
        });
        return returnOutput && output ? output.trim() : null;
    } catch (error) {
        if (ignoreError) return null;
        throw error;
    }
}

module.exports = { runCommand };