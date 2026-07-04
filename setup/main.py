import argparse
import logging
import sys

from setup.GithubActionsManager import GitHubAPIError, GitHubActionsManager

# Configure polished logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("GitHubActionManager")


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Enable Actions, set a secret, and dispatch a GitHub workflow.")
    parser.add_argument("-t", "--token", required=True, help="GitHub Personal Access Token (PAT)")
    parser.add_argument("-r", "--repo", required=True, help="Repository name in 'owner/repo' format")
    parser.add_argument("-w", "--workflow", default="init_fork.yml", help="Workflow filename (default: init_fork.yml)")
    return parser.parse_args()


def main() -> None:
    args = parse_arguments()
    manager = GitHubActionsManager(logger=logger, token=args.token, repo=args.repo)

    try:
        manager.enable_repo_actions()

        manager.set_secret(secret_name="USER_PAT", secret_value=args.token)

        manager.dispatch_workflow(workflow_name=args.workflow, branch="main")
            
        logger.info("GitHub Action setup and dispatch completed successfully.")

    except GitHubAPIError as e:
        logger.error(f"Execution failed: {e}")
        sys.exit(1)
    except Exception as e:
        logger.critical(f"An unexpected error occurred: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()