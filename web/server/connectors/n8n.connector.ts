import { APIKeyConnector, ConnectorConfig } from "./base.connector";

export class N8nConnector extends APIKeyConnector {
  private baseUrl: string = "";

  constructor(userId: number) {
    const config: ConnectorConfig = {
      id: "n8n",
      name: "n8n",
      type: "automation",
      description: "n8n - Open-source workflow automation",
      authType: "api_key",
      requiredFields: ["apiKey", "baseUrl"],
    };
    super(config, userId);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
        headers: {
          "X-N8N-API-KEY": this.apiKey,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async sync(): Promise<{ success: boolean; itemsSynced: number; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
        headers: {
          "X-N8N-API-KEY": this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to sync workflows");
      }

      const data = (await response.json()) as any;
      const workflows = data.data || [];

      return {
        success: true,
        itemsSynced: workflows.length,
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
    return ["list_workflows", "get_workflow", "create_workflow", "execute_workflow", "delete_workflow"];
  }

  async executeAction(action: string, params: Record<string, any>): Promise<any> {
    switch (action) {
      case "list_workflows":
        return this.listWorkflows();
      case "get_workflow":
        return this.getWorkflow(params.workflowId);
      case "create_workflow":
        return this.createWorkflow(params.name, params.nodes);
      case "execute_workflow":
        return this.executeWorkflow(params.workflowId, params.data);
      case "delete_workflow":
        return this.deleteWorkflow(params.workflowId);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async listWorkflows(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
      headers: {
        "X-N8N-API-KEY": this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to list workflows");
    }

    return response.json();
  }

  private async getWorkflow(workflowId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}`, {
      headers: {
        "X-N8N-API-KEY": this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get workflow");
    }

    return response.json();
  }

  private async createWorkflow(name: string, nodes: any[]): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
      method: "POST",
      headers: {
        "X-N8N-API-KEY": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        nodes,
        connections: {},
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create workflow");
    }

    return response.json();
  }

  private async executeWorkflow(workflowId: string, data: Record<string, any>): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}/execute`, {
      method: "POST",
      headers: {
        "X-N8N-API-KEY": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to execute workflow");
    }

    return response.json();
  }

  private async deleteWorkflow(workflowId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}`, {
      method: "DELETE",
      headers: {
        "X-N8N-API-KEY": this.apiKey,
      },
    });

    return response.ok;
  }
}
