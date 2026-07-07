const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const language = process.env.LANGUAGE || process.argv[2];

if (!language) {
    console.error('Error: Please specify a language (e.g., node init-tasks.js kotlin)');
    process.exit(1);
}

const repoRoot = process.cwd();
const tasksDir = path.join(repoRoot, 'tasks');

if (!fs.existsSync(tasksDir)) {
    console.error(`Error: Tasks directory not found at ${tasksDir}`);
    process.exit(1);
}

const backupDir = path.join(repoRoot, '..', 'tasks_backup_temp');
fs.cpSync(tasksDir, backupDir, { recursive: true });

const tasks = fs.readdirSync(backupDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

for (const task of tasks) {
    const langSourcePath = path.join(backupDir, task, language);
    
    if (fs.existsSync(langSourcePath) && fs.statSync(langSourcePath).isDirectory()) {
        const branchName = `tasks/${task}`;
        console.log(`\n Processing: ${task} (${language}) -> Branch: ${branchName}`);
        
        try {
            // Create a fresh orphan branch with no history
            execSync(`git checkout --orphan ${branchName}`, { stdio: 'ignore' });
            
            // Clear all tracked files and working tree artifacts
            execSync('git rm -rf .', { stdio: 'ignore' });
            execSync('git clean -fdx', { stdio: 'ignore' });
            
            // Copy only the language-specific files to the root of the repo
            fs.cpSync(langSourcePath, repoRoot, { recursive: true });
            
            // Add, commit, and push
            execSync('git add .', { stdio: 'ignore' });
            execSync(`git commit -m "Initialize task: ${task} for ${language}"`, { stdio: 'inherit' });
            execSync(`git push origin ${branchName} --force`, { stdio: 'inherit' });
            
            console.log(`Successfully pushed ${branchName}`);
        } catch (error) {
            console.error(`Failed to process ${task}:`, error.message);
        }
    } else {
        console.log(`\nSkipping ${task}: No '${language}' directory found.`);
    }
}

// Cleanup the external backup
fs.rmSync(backupDir, { recursive: true, force: true });
console.log('\nFork initialization complete.');