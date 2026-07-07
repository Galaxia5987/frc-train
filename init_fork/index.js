const { initializeTaskBranches } = require('./branch-manager');
const { createPullRequests } = require('./pr-manager');
const { protectMainBranch } = require("./branch-protection")

function main() {
    const language = process.env.LANGUAGE || process.argv[2];
    const githubRepo = process.env.GITHUB_REPOSITORY;

    if (!language) {
        console.error('Error: Please specify a language (e.g., node index.js kotlin)');
        process.exit(1);
    }

    if (!githubRepo) {
        console.error('Error: GITHUB_REPOSITORY environment variable is missing.');
        process.exit(1);
    }

    const repoRoot = process.cwd();

    console.log('Initializing Task Branches...');
    initializeTaskBranches(repoRoot, language);

    console.log('Creating Pull Requests...');
    createPullRequests(githubRepo);

    console.log('Setting up branch protection rules...')
    protectMainBranch(githubRepo);

    console.log('\nFork initialization and PR creation complete.');
}

main();