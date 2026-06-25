import { APIKeyConnector, ConnectorConfig } from "./base.connector";

export class GitHubConnector extends APIKeyConnector {
  private baseUrl = "https://api.github.com";

  constructor(userId: number) {
    const config: ConnectorConfig = {
      id: "github",
      name: "GitHub",
      type: "development",
      description: "GitHub - Repository management and collaboration",
      authType: "api_key",
      baseUrl: "https://api.github.com",
      requiredFields: ["apiKey"],
    };
    super(config, userId);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async sync(): Promise<{ success: boolean; itemsSynced: number; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/user/repos?per_page=100`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to sync repositories");
      }

      const repos = (await response.json()) as any[];

      return {
        success: true,
        itemsSynced: repos.length,
      };
    } catch (error) {
      return {
        success: false,
        itemsSynced: 0,
        error: (error as Error).message,
      };
    }
  }

  getCapabilities(): string[] {
    return ["list_repos", "create_issue", "list_issues", "create_pull_request", "list_pulls"];
  }

  async executeAction(action: string, params: Record<string, any>): Promise<any> {
    switch (action) {
      case "list_repos":
        return this.listRepos();
      case "create_issue":
        return this.createIssue(params.owner, params.repo, params.title, params.body);
      case "list_issues":
        return this.listIssues(params.owner, params.repo);
      case "create_pull_request":
        return this.createPullRequest(
          params.owner,
          params.repo,
          params.title,
          params.head,
          params.base
        );
      case "list_pulls":
        return this.listPullRequests(params.owner, params.repo);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async listRepos(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/user/repos?per_page=100`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to list repositories");
    }

    return response.json();
  }

  private async createIssue(
    owner: string,
    repo: string,
    title: string,
    body: string
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, body }),
    });

    if (!response.ok) {
      throw new Error("Failed to create issue");
    }

    return response.json();
  }

  private async listIssues(owner: string, repo: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues?per_page=100`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to list issues");
    }

    return response.json();
  }

  private async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    head: string,
    base: string
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/pulls`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, head, base }),
    });

    if (!response.ok) {
      throw new Error("Failed to create pull request");
    }

    return response.json();
  }

  private async listPullRequests(owner: string, repo: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/pulls?per_page=100`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to list pull requests");
    }

    return response.json();
  }
}
