const fs = require('fs');
const path = require('path');
const { runCommand } = require('./utils');

function getRemoteTaskBranches() {
    const output = runCommand('git branch -r', { returnOutput: true });
    if (!output) return [];

    return output.split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('origin/'))
        .filter(line => !line.includes('/main') && !line.includes('/HEAD'))
        .map(line => line.replace(/^origin\//, ''));
}

function getTaskMdContent(branchName) {
    const content = runCommand(`git show "origin/${branchName}:TASK.md"`, { 
        returnOutput: true, 
        ignoreError: true,
        stdio: ['ignore', 'pipe', 'ignore']
    });
    
    return content || `This PR was automatically generated for ${branchName}.`;
}

function createPullRequests(githubRepo) {
    console.log('\nChecking out main branch...');
    runCommand('git checkout main', { stdio: 'ignore' });
    
    runCommand('git fetch origin', { stdio: 'ignore' });

    const branches = getRemoteTaskBranches();
    const tempFilePath = path.join(process.cwd(), '.temp_pr_body.md');
    
    for (const branch of branches) {
        console.log(`\nCreating PR for: ${branch}`);
        
        // Use a file to prevent bash escaping errors with multiline markdown
        const prBody = getTaskMdContent(branch);
        fs.writeFileSync(tempFilePath, prBody, 'utf8');
        
        try {
            const cmd = `gh pr create --repo ${githubRepo} --base tasks/main --head "${branch}" --title "Incomplete Task ${branch}" --body-file "${tempFilePath}"`;
            runCommand(cmd, { ignoreError: true });
            console.log(`PR command executed for ${branch}`);
        } catch (error) {
            console.error(`Failed to create PR for ${branch}:`, error.message);
        }
    }
    
    if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
    }
}

module.exports = { createPullRequests };