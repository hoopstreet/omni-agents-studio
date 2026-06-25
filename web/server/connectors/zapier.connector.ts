import { APIKeyConnector, ConnectorConfig } from "./base.connector";

export class ZapierConnector extends APIKeyConnector {
  private baseUrl = "https://api.zapier.com/v1";

  constructor(userId: number) {
    const config: ConnectorConfig = {
      id: "zapier",
      name: "Zapier",
      type: "automation",
      description: "Zapier - Workflow automation and integration",
      authType: "api_key",
      baseUrl: "https://api.zapier.com/v1",
      requiredFields: ["apiKey"],
    };
    super(config, userId);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/zaps`, {
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
      const response = await fetch(`${this.baseUrl}/zaps`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to sync zaps");
      }

      const data = (await response.json()) as any;
      const zaps = data.objects || [];

      return {
        success: true,
        itemsSynced: zaps.length,
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
    return ["list_zaps", "create_zap", "trigger_zap", "pause_zap", "resume_zap"];
  }

  async executeAction(action: string, params: Record<string, any>): Promise<any> {
    switch (action) {
      case "list_zaps":
        return this.listZaps();
      case "create_zap":
        return this.createZap(params.name, params.trigger, params.action);
      case "trigger_zap":
        return this.triggerZap(params.zapId, params.data);
      case "pause_zap":
        return this.pauseZap(params.zapId);
      case "resume_zap":
        return this.resumeZap(params.zapId);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async listZaps(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/zaps`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to list zaps");
    }

    return response.json();
  }

  private async createZap(name: string, trigger: string, action: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/zaps`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: name,
        trigger,
        action,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create zap");
    }

    return response.json();
  }

  private async triggerZap(zapId: string, data: Record<string, any>): Promise<any> {
    const response = await fetch(`${this.baseUrl}/zaps/${zapId}/trigger`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to trigger zap");
    }

    return response.json();
  }

  private async pauseZap(zapId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/zaps/${zapId}/pause`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to pause zap");
    }

    return response.json();
  }

  private async resumeZap(zapId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/zaps/${zapId}/resume`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to resume zap");
    }

    return response.json();
  }
}
