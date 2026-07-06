const { GitHubActionsManager, GitHubAPIError } = require('./GitHubActionsManager');

function printHelp() {
    console.log(`
Enable Actions, set a secret, and dispatch a GitHub workflow.

Usage: node main.js -t <token> [options]

Options:
  -t, --token <type>     GitHub Personal Access Token (PAT) (Required)
  -r, --repo <type>      Repository name in 'owner/repo' format (Optional)
  -w, --workflow <type>  Workflow filename (Optional, default: "init_fork.yml")
  -h, --help             Display this help message
`);
}

function parseArguments() {
    const rawArgs = process.argv.slice(2);
    const args = {
        workflow: "init_fork.yml" // Default value
    };

    for (let i = 0; i < rawArgs.length; i++) {
        const arg = rawArgs[i];

        switch (arg) {
            case '-t':
            case '--token':
                args.token = rawArgs[++i];
                break;
            case '-r':
            case '--repo':
                args.repo = rawArgs[++i];
                break;
            case '-w':
            case '--workflow':
                args.workflow = rawArgs[++i];
                break;
            case '-h':
            case '--help':
                printHelp();
                process.exit(0);
            default:
                console.warn(`Warning: Unknown argument ignored: ${arg}`);
        }
    }

    if (!args.token) {
        console.error("Error: Missing required argument '-t, --token'.");
        printHelp();
        process.exit(1);
    }

    return args;
}

async function main() {
    const args = parseArguments();
    
    const manager = new GitHubActionsManager(args.token, args.repo);

    try {
        await manager.init();
        await manager.enableRepoActions();
        await manager.setSecret("USER_PAT", args.token);
        await manager.dispatchWorkflow(args.workflow, "main");
            
        console.log("GitHub Action setup and dispatch completed successfully.");

    } catch (error) {
        if (error instanceof GitHubAPIError) {
            console.error(`Execution failed: ${error.message}`);
            process.exit(1);
        } else {
            console.error(`An unexpected error occurred: ${error.message}`);
            console.error(error.stack);
            process.exit(1);
        }
    }
}

if (require.main === module) {
    main();
}