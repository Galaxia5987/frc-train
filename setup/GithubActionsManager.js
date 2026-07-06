const axios = require('axios');
const sodium = require('libsodium-wrappers');

class GitHubAPIError extends Error {
    constructor(message) {
        super(message);
        this.name = 'GitHubAPIError';
    }
}

class GitHubActionsManager {
    constructor(token, repo = null, apiVersion = "2026-03-10") {
        this.repo = repo;
        
        this.client = axios.create({
            baseURL: 'https://api.github.com',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": apiVersion
            }
        });
    }

    async init() {
        if (!this.repo) {
            const user = await this.fetchUserInfo();
            this.repo = `${user}/frc-train`;
        }
        this.baseUrl = `/repos/${this.repo}`;
        return this;
    }

    async fetchUserInfo() {
        try {
            const response = await this.client.get('/user');
            return response.data.login;
        } catch (error) {
            throw new GitHubAPIError(`Failed to fetch user info: ${error.message}`);
        }
    }

    static async encryptSecret(publicKey, secretValue) {
        try {
            await sodium.ready;
            const binkey = sodium.from_base64(publicKey, sodium.base64_variants.ORIGINAL);
            const binsec = sodium.from_string(secretValue);
            const encBytes = sodium.crypto_box_seal(binsec, binkey);
            return sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);
        } catch (error) {
            throw new GitHubAPIError(`Failed to encrypt the secret via libsodium: ${error.message}`);
        }
    }

    async enableRepoActions() {
        const url = `${this.baseUrl}/actions/permissions`;
        console.log(`Attempting to enable Actions permissions for '${this.repo}'...`);
        
        try {
            const response = await this.client.put(url, { enabled: true });
            
            if (response.status === 204) {
                console.log("Successfully enabled Actions permissions.");
            } else {
                throw new GitHubAPIError(`Unexpected status code ${response.status} while enabling actions.`);
            }
        } catch (error) {
            throw new GitHubAPIError(`Network error or API rejection while enabling actions: ${error.message}`);
        }
    }

    async getPublicKey() {
        const url = `${this.baseUrl}/actions/secrets/public-key`;
        console.log(`Retrieving public key for '${this.repo}'...`);
        
        try {
            const response = await this.client.get(url);
            
            if (!response.data.key_id || !response.data.key) {
                throw new Error("Unexpected response format missing key.");
            }
            
            return {
                keyId: response.data.key_id,
                key: response.data.key
            };
        } catch (error) {
            throw new GitHubAPIError(`Failed to retrieve public key: ${error.message}`);
        }
    }

    async setSecret(secretName, secretValue) {
        const { keyId, key: publicKey } = await this.getPublicKey();
        
        console.log(`Setting secret '${secretName}' in '${this.repo}'...`);
        const encryptedValue = await GitHubActionsManager.encryptSecret(publicKey, secretValue);
        
        const url = `${this.baseUrl}/actions/secrets/${secretName}`;
        const payload = {
            encrypted_value: encryptedValue,
            key_id: keyId
        };
        
        try {
            const response = await this.client.put(url, payload);
            
            if (response.status === 201 || response.status === 204) {
                console.log(`Successfully configured the '${secretName}' secret.`);
            } else {
                throw new GitHubAPIError(`Unexpected status code ${response.status} while setting secret.`);
            }
        } catch (error) {
            throw new GitHubAPIError(`Failed to set secret '${secretName}': ${error.message}`);
        }
    }

    async dispatchWorkflow(workflowName, branch) {
        const url = `${this.baseUrl}/actions/workflows/${workflowName}/dispatches`;
        console.log(`Dispatching workflow '${workflowName}' on branch '${branch}'...`);
        
        try {
            const response = await this.client.post(url, { ref: branch });
            
            if (response.status === 200 || response.status === 204) {
                console.log("Successfully dispatched the workflow.");
            } else {
                throw new GitHubAPIError(`Unexpected status code ${response.status} while dispatching workflow.`);
            }
        } catch (error) {
            throw new GitHubAPIError(`Failed to dispatch workflow: ${error.message}`);
        }
    }
}

module.exports = {
    GitHubActionsManager,
    GitHubAPIError
};