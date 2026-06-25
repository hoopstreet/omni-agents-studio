import { BaseConnector, ConnectorConfig, ConnectorAuth } from "./base.connector";

export class WebhooksConnector extends BaseConnector {
  constructor(userId: number) {
    const config: ConnectorConfig = {
      id: "webhooks",
      name: "Webhooks",
      type: "custom",
      description: "Custom webhooks for integrations",
      authType: "custom",
      requiredFields: ["webhookUrl"],
    };
    super(config, userId);
  }

  async testConnection(): Promise<boolean> {
    try {
      // Webhooks don't need authentication, just return true
      return true;
    } catch (error) {
      return false;
    }
  }

  async authenticate(credentials: Record<string, any>): Promise<ConnectorAuth> {
    if (!credentials.webhookUrl) {
      throw new Error("Webhook URL required");
    }

    this.auth = {
      credentialId: "",
      metadata: {
        webhookUrl: credentials.webhookUrl,
      },
    };

    return this.auth;
  }

  protected async refreshAuthToken(): Promise<ConnectorAuth> {
    return this.auth!;
  }

  async sync(): Promise<{ success: boolean; itemsSynced: number; error?: string }> {
    return {
      success: true,
      itemsSynced: 0,
    };
  }

  getCapabilities(): string[] {
    return ["send_webhook", "validate_webhook", "list_webhooks", "delete_webhook"];
  }

  async executeAction(action: string, params: Record<string, any>): Promise<any> {
    switch (action) {
      case "send_webhook":
        return this.sendWebhook(params.url, params.data, params.method);
      case "validate_webhook":
        return this.validateWebhook(params.url);
      case "list_webhooks":
        return this.listWebhooks();
      case "delete_webhook":
        return this.deleteWebhook(params.webhookId);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async sendWebhook(
    url: string,
    data: Record<string, any>,
    method: string = "POST"
  ): Promise<any> {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
    };
  }

  private async validateWebhook(url: string): Promise<any> {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test: true,
        }),
      });

      return {
        valid: response.ok,
        status: response.status,
      };
    } catch (error) {
      return {
        valid: false,
        error: (error as Error).message,
      };
    }
  }

  private async listWebhooks(): Promise<any> {
    // In a real implementation, this would query a database
    return {
      webhooks: [
        {
          id: 1,
          url: this.auth?.metadata?.webhookUrl,
          createdAt: new Date().toISOString(),
        },
      ],
    };
  }

  private async deleteWebhook(webhookId: string): Promise<any> {
    return {
      success: true,
      message: "Webhook deleted",
    };
  }
}
