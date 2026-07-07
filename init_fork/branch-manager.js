const fs = require('fs');
const path = require('path');
const { runCommand } = require('./utils');

function initializeTaskBranches(repoRoot, language) {
    const tasksDir = path.join(repoRoot, 'tasks');

    if (!fs.existsSync(tasksDir)) {
        throw new Error(`Tasks directory not found at ${tasksDir}`);
    }

    const backupDir = path.join(repoRoot, '..', 'tasks_backup_temp');
    fs.cpSync(tasksDir, backupDir, { recursive: true });

    try {
        const tasks = fs.readdirSync(backupDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const task of tasks) {
            const langSourcePath = path.join(backupDir, task, language);
            
            if (fs.existsSync(langSourcePath) && fs.statSync(langSourcePath).isDirectory()) {
                const branchName = `tasks/${task}`;
                console.log(`\nProcessing: ${task} (${language}) -> Branch: ${branchName}`);
                
                try {
                    // Create a fresh orphan branch with no history
                    runCommand(`git checkout --orphan ${branchName}`, { stdio: 'ignore' });
                    
                    // Clear all tracked files and working tree artifacts
                    runCommand('git rm -rf .', { stdio: 'ignore' });
                    runCommand('git clean -fdx', { stdio: 'ignore' });
                    
                    // Copy only the language-specific files to the root of the repo
                    fs.cpSync(langSourcePath, repoRoot, { recursive: true });
                    
                    // Add, commit, and push
                    runCommand('git add .', { stdio: 'ignore' });
                    runCommand(`git commit -m "Initialize task: ${task} for ${language}"`);
                    runCommand(`git push origin ${branchName} --force`);
                    
                    console.log(`Successfully pushed ${branchName}`);
                } catch (error) {
                    console.error(`Failed to process ${task}:`, error.message);
                }
            } else {
                console.log(`\nSkipping ${task}: No '${language}' directory found.`);
            }
        }
    } finally {
        if (fs.existsSync(backupDir)) {
            fs.rmSync(backupDir, { recursive: true, force: true });
        }
    }
}

module.exports = { initializeTaskBranches };