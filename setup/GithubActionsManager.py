import base64
import logging
from typing import Tuple

import requests
from requests.exceptions import RequestException
from nacl import encoding, public

class GitHubAPIError(Exception):
    """Custom exception raised for GitHub API interaction failures."""
    pass


class GitHubActionsManager:
    """Manages GitHub API interactions for workflows and repository secrets."""

    def __init__(self, logger: logging.Logger, token: str, repo: str | None, api_version: str = "2026-03-10") -> None:
        self.logger = logger
        self.repo = repo
        
        # Use a session to persist headers and optimize connection pooling
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": api_version
        })
        
        if not repo:
            self.user = self.fetch_user_info()
            self.repo = f"{self.user}/frc-train"
            
        self.base_url = f"https://api.github.com/repos/{self.repo}"
            
            
    def fetch_user_info(self):
        response = self.session.get("https://api.github.com/user")
        response.raise_for_status()
        return response.json().get('login')
            

    @staticmethod
    def encrypt_secret(public_key: str, secret_value: str) -> str:
        """Encrypt a string using the repository's public key via libsodium (pynacl)."""
        try:
            public_key_bytes = encoding.Base64Encoder.decode(public_key.encode("utf-8"))
            sealed_box = public.SealedBox(public.PublicKey(public_key_bytes))
            encrypted = sealed_box.encrypt(secret_value.encode("utf-8"))
            return base64.b64encode(encrypted).decode("utf-8")
        except Exception as e:
            raise GitHubAPIError(f"Failed to encrypt the secret via pynacl: {e}")

    def enable_repo_actions(self) -> None:
        """Enable GitHub Actions permissions for the repository."""
        url = f"{self.base_url}/actions/permissions"
        self.logger.info(f"Attempting to enable Actions permissions for '{self.repo}'...")
        
        try:
            response = self.session.put(url, json={"enabled": True})
            response.raise_for_status()  # Automatically raises RequestException for 4xx/5xx responses
            
            if response.status_code == 204:
                self.logger.info("Successfully enabled Actions permissions.")
            else:
                raise GitHubAPIError(f"Unexpected status code {response.status_code} while enabling actions.")
                
        except RequestException as e:
            raise GitHubAPIError(f"Network error or API rejection while enabling actions: {e}")

    def get_public_key(self) -> Tuple[str, str]:
        """Retrieve the repository's public key for secret encryption."""
        url = f"{self.base_url}/actions/secrets/public-key"
        self.logger.info(f"Retrieving public key for '{self.repo}'...")
        
        try:
            response = self.session.get(url)
            response.raise_for_status()
            
            data = response.json()
            return data["key_id"], data["key"]
            
        except RequestException as e:
            raise GitHubAPIError(f"Failed to retrieve public key: {e}")
        except KeyError as e:
            raise GitHubAPIError(f"Unexpected response format missing key: {e}")

    def set_secret(self, secret_name: str, secret_value: str) -> None:
        """Encrypt and set a repository secret."""
        # This will bubble up GitHubAPIError if it fails
        key_id, public_key = self.get_public_key()
        
        self.logger.info(f"Setting secret '{secret_name}' in '{self.repo}'...")
        encrypted_value = self.encrypt_secret(public_key, secret_value)
        
        url = f"{self.base_url}/actions/secrets/{secret_name}"
        payload = {
            "encrypted_value": encrypted_value,
            "key_id": key_id
        }
        
        try:
            response = self.session.put(url, json=payload)
            response.raise_for_status()
            
            if response.status_code in (201, 204):
                self.logger.info(f"Successfully configured the '{secret_name}' secret.")
            else:
                raise GitHubAPIError(f"Unexpected status code {response.status_code} while setting secret.")
                
        except RequestException as e:
            raise GitHubAPIError(f"Failed to set secret '{secret_name}': {e}")

    def dispatch_workflow(self, workflow_name: str, branch: str) -> None:
        """Dispatch a specific workflow on a target branch."""
        url = f"{self.base_url}/actions/workflows/{workflow_name}/dispatches"
        self.logger.info(f"Dispatching workflow '{workflow_name}' on branch '{branch}'...")
        
        try:
            response = self.session.post(url, json={"ref": branch})
            response.raise_for_status()
            
            if response.status_code == 200:
                self.logger.info("Successfully dispatched the workflow.")
            else:
                raise GitHubAPIError(f"Unexpected status code {response.status_code} while dispatching workflow.")
                
        except RequestException as e:
            raise GitHubAPIError(f"Failed to dispatch workflow: {e}")