import { APIKeyConnector, ConnectorConfig } from "./base.connector";

export class OpenRouterConnector extends APIKeyConnector {
  private baseUrl = "https://openrouter.ai/api/v1";

  constructor(userId: number) {
    const config: ConnectorConfig = {
      id: "openrouter",
      name: "OpenRouter",
      type: "ai_provider",
      description: "OpenRouter - Unified AI model routing and cost optimization",
      authType: "api_key",
      baseUrl: "https://openrouter.ai/api/v1",
      requiredFields: ["apiKey"],
    };
    super(config, userId);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error("OpenRouter connection test failed:", error);
      return false;
    }
  }

  async sync(): Promise<{ success: boolean; itemsSynced: number; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch models");
      }

      const data = (await response.json()) as any;
      const models = data.data || [];

      return {
        success: true,
        itemsSynced: models.length,
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
    return ["list_models", "invoke_model", "get_pricing", "check_availability"];
  }

  async executeAction(action: string, params: Record<string, any>): Promise<any> {
    switch (action) {
      case "list_models":
        return this.listModels();
      case "invoke_model":
        return this.invokeModel(params);
      case "get_pricing":
        return this.getPricing(params.modelId);
      case "check_availability":
        return this.checkAvailability(params.modelId);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async listModels(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch models");
    }

    return response.json();
  }

  private async invokeModel(params: Record<string, any>): Promise<any> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        temperature: params.temperature || 0.7,
        max_tokens: params.maxTokens || 2048,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to invoke model");
    }

    return response.json();
  }

  private async getPricing(modelId: string): Promise<any> {
    const models = await this.listModels();
    const model = (models.data || []).find((m: any) => m.id === modelId);

    if (!model) {
      throw new Error("Model not found");
    }

    return {
      modelId,
      inputPrice: model.pricing?.prompt || 0,
      outputPrice: model.pricing?.completion || 0,
    };
  }

  private async checkAvailability(modelId: string): Promise<any> {
    const models = await this.listModels();
    const model = (models.data || []).find((m: any) => m.id === modelId);

    return {
      modelId,
      available: !!model,
      status: model ? "available" : "unavailable",
    };
  }
}
