import { APIKeyConnector, ConnectorConfig } from "./base.connector";

export class MakeConnector extends APIKeyConnector {
  private baseUrl = "https://api.integromat.com/v1";

  constructor(userId: number) {
    const config: ConnectorConfig = {
      id: "make",
      name: "Make",
      type: "automation",
      description: "Make - Visual workflow automation",
      authType: "api_key",
      baseUrl: "https://api.integromat.com/v1",
      requiredFields: ["apiKey"],
    };
    super(config, userId);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/scenarios`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async sync(): Promise<{ success: boolean; itemsSynced: number; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/scenarios`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to sync scenarios");
      }

      const data = (await response.json()) as any;
      const scenarios = data.scenarios || [];

      return {
        success: true,
        itemsSynced: scenarios.length,
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
    return ["list_scenarios", "get_scenario", "create_scenario", "run_scenario", "delete_scenario"];
  }

  async executeAction(action: string, params: Record<string, any>): Promise<any> {
    switch (action) {
      case "list_scenarios":
        return this.listScenarios();
      case "get_scenario":
        return this.getScenario(params.scenarioId);
      case "create_scenario":
        return this.createScenario(params.name, params.modules);
      case "run_scenario":
        return this.runScenario(params.scenarioId);
      case "delete_scenario":
        return this.deleteScenario(params.scenarioId);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async listScenarios(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/scenarios`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to list scenarios");
    }

    return response.json();
  }

  private async getScenario(scenarioId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/scenarios/${scenarioId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get scenario");
    }

    return response.json();
  }

  private async createScenario(name: string, modules: any[]): Promise<any> {
    const response = await fetch(`${this.baseUrl}/scenarios`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        modules,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create scenario");
    }

    return response.json();
  }

  private async runScenario(scenarioId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/scenarios/${scenarioId}/run`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to run scenario");
    }

    return response.json();
  }

  private async deleteScenario(scenarioId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/scenarios/${scenarioId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    return response.ok;
  }
}
