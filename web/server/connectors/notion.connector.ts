import { APIKeyConnector, ConnectorConfig } from "./base.connector";

export class NotionConnector extends APIKeyConnector {
  private baseUrl = "https://api.notion.com/v1";

  constructor(userId: number) {
    const config: ConnectorConfig = {
      id: "notion",
      name: "Notion",
      type: "productivity",
      description: "Notion - Workspace and documentation",
      authType: "api_key",
      baseUrl: "https://api.notion.com/v1",
      requiredFields: ["apiKey"],
    };
    super(config, userId);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/users/me`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Notion-Version": "2022-06-28",
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async sync(): Promise<{ success: boolean; itemsSynced: number; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page_size: 100,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to sync pages");
      }

      const data = (await response.json()) as any;
      const results = data.results || [];

      return {
        success: true,
        itemsSynced: results.length,
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
    return ["list_pages", "get_page", "create_page", "update_page", "query_database"];
  }

  async executeAction(action: string, params: Record<string, any>): Promise<any> {
    switch (action) {
      case "list_pages":
        return this.listPages();
      case "get_page":
        return this.getPage(params.pageId);
      case "create_page":
        return this.createPage(params.parentId, params.title, params.content);
      case "update_page":
        return this.updatePage(params.pageId, params.content);
      case "query_database":
        return this.queryDatabase(params.databaseId, params.filters);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async listPages(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page_size: 100,
        filter: {
          value: "page",
          property: "object",
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to list pages");
    }

    return response.json();
  }

  private async getPage(pageId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/pages/${pageId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Notion-Version": "2022-06-28",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get page");
    }

    return response.json();
  }

  private async createPage(parentId: string, title: string, content: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/pages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: {
          page_id: parentId,
        },
        properties: {
          title: {
            title: [
              {
                text: {
                  content: title,
                },
              },
            ],
          },
        },
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              text: [
                {
                  type: "text",
                  text: {
                    content,
                  },
                },
              ],
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create page");
    }

    return response.json();
  }

  private async updatePage(pageId: string, content: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/blocks/${pageId}/children`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              text: [
                {
                  type: "text",
                  text: {
                    content,
                  },
                },
              ],
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update page");
    }

    return response.json();
  }

  private async queryDatabase(databaseId: string, filters?: Record<string, any>): Promise<any> {
    const response = await fetch(`${this.baseUrl}/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: filters || {},
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to query database");
    }

    return response.json();
  }
}
