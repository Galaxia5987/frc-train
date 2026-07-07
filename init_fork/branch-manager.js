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
            .map(dirent => dirent.name)
            // Force 'main' to be processed first so other branches can use it as a base
            .sort((a, b) => {
                if (a === 'main') return -1;
                if (b === 'main') return 1;
                return a.localeCompare(b);
            });

        for (const task of tasks) {
            const langSourcePath = path.join(backupDir, task, language);
            
            if (fs.existsSync(langSourcePath) && fs.statSync(langSourcePath).isDirectory()) {
                const branchName = `tasks/${task}`;
                console.log(`\nProcessing: ${task} (${language}) -> Branch: ${branchName}`);
                
                try {
                    if (task === 'main') {
                        // The main task branch is the root, so it starts fresh
                        runCommand(`git checkout --orphan ${branchName}`, { stdio: 'ignore' });
                    } else {
                        // Subsequent tasks branch off tasks/main to establish shared commit history
                        runCommand('git checkout tasks/main', { stdio: 'ignore' });
                        runCommand(`git checkout -b ${branchName}`, { stdio: 'ignore' });
                    }
                    
                    // Clear existing tracked files in the index to prepare for the new task state
                    runCommand('git rm -rf .', { stdio: 'ignore' });
                    runCommand('git clean -fdx', { stdio: 'ignore' });
                    
                    fs.cpSync(langSourcePath, repoRoot, { recursive: true });
                    
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