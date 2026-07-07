const fs = require('fs');
const path = require('path');
const { runCommand } = require('./utils');

function protectMainBranch(githubRepo) {
    console.log('\nApplying branch protection rules to tasks/main...');
    
    const payload = {
        required_status_checks: null,
        required_pull_request_reviews: {},
        allow_force_pushes: true,
        allow_deletions: true,
        allow_fork_syncing: true,
        enforce_admins: false,
        restrictions: null,
        lock_branch: true
    };

    const tempFilePath = path.join(process.cwd(), '.temp_protection_payload.json');
    fs.writeFileSync(tempFilePath, JSON.stringify(payload), 'utf8');

    try {
        const endpoint = `/repos/${githubRepo}/branches/tasks/main/protection`;
        
        const cmd = [
            'gh api',
            '--method PUT',
            '-H "Accept: application/vnd.github+json"',
            '-H "X-GitHub-Api-Version: 2026-03-10"',
            endpoint,
            `--input "${tempFilePath}"`
        ].join(' ');

        runCommand(cmd);
        console.log('Successfully applied branch protection to tasks/main.');
    } catch (error) {
        console.error('Failed to apply branch protection:', error.message);
    } finally {
        // Ensure cleanup of the temporary file regardless of success or failure
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
}

module.exports = { protectMainBranch };