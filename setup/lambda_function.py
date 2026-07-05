import os
import json
import logging
from typing import Any, Dict

from GithubActionsManager import GitHubAPIError, GitHubActionsManager

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Payload structure expected:
    {
        "repo": "owner/repo-name",
        "token": "super-secret-123",
        "workflow_name": "init_fork.yml",
    }
    """
    body = json.loads(event.get("body", "{}"))
    repo = body.get("repo")
    github_token = body.get("token")

    if not github_token:
        return build_response(400, {"error": "Missing mandatory fields: 'token' is required."})

    try:
        gh_manager = GitHubActionsManager(logger=logger, token=github_token, repo=repo)
    except Exception as e:
        logger.exception("Failed to initialize GitHubActionsManager")
        return build_response(500, {"error": f"Initialization failed: {str(e)}"})

    try:
        gh_manager.enable_repo_actions()

        gh_manager.set_secret(secret_name="USER_PAT", secret_value=github_token)

        gh_manager.dispatch_workflow(workflow_name=body.get("workflow_name", "init_fork.yml"), branch="main")
        
        return build_response(200, {"message": "Execution completed successfully."})

    except GitHubAPIError as e:
        # Gracefully catch specific business logic failures from your manager class
        logger.error(f"GitHub API workflow failed: {e}")
        return build_response(502, {"error": f"GitHub Integration Error: {str(e)}"})
        
    except Exception as e:
        # Catch unexpected infrastructure issues
        logger.exception("An unhandled exception occurred during processing.")
        return build_response(500, {"error": "Internal Server Error."})


def build_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """Helper function to build API Gateway compliant responses."""
    return {
        "isBase64Encoded": False,
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': 'https://galaxia5987.github.io',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type'
        },
        "body": json.dumps(body)
    }