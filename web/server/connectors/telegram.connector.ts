import { APIKeyConnector, ConnectorConfig } from "./base.connector";

export class TelegramConnector extends APIKeyConnector {
  private baseUrl = "https://api.telegram.org";

  constructor(userId: number) {
    const config: ConnectorConfig = {
      id: "telegram",
      name: "Telegram",
      type: "communication",
      description: "Telegram - Messaging and automation",
      authType: "api_key",
      baseUrl: "https://api.telegram.org",
      requiredFields: ["apiKey"],
    };
    super(config, userId);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/bot${this.apiKey}/getMe`);
      const data = (await response.json()) as any;
      return data.ok === true;
    } catch (error) {
      return false;
    }
  }

  async sync(): Promise<{ success: boolean; itemsSynced: number; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/bot${this.apiKey}/getUpdates?limit=100`);

      if (!response.ok) {
        throw new Error("Failed to sync messages");
      }

      const data = (await response.json()) as any;
      const updates = data.result || [];

      return {
        success: true,
        itemsSynced: updates.length,
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
    return ["send_message", "get_updates", "set_webhook", "get_me", "send_document"];
  }

  async executeAction(action: string, params: Record<string, any>): Promise<any> {
    switch (action) {
      case "send_message":
        return this.sendMessage(params.chatId, params.text);
      case "get_updates":
        return this.getUpdates(params.limit);
      case "set_webhook":
        return this.setWebhook(params.url);
      case "get_me":
        return this.getMe();
      case "send_document":
        return this.sendDocument(params.chatId, params.documentUrl);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async sendMessage(chatId: string, text: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/bot${this.apiKey}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    return response.json();
  }

  private async getUpdates(limit: number = 100): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/bot${this.apiKey}/getUpdates?limit=${limit}`
    );

    if (!response.ok) {
      throw new Error("Failed to get updates");
    }

    return response.json();
  }

  private async setWebhook(url: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/bot${this.apiKey}/setWebhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to set webhook");
    }

    return response.json();
  }

  private async getMe(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/bot${this.apiKey}/getMe`);

    if (!response.ok) {
      throw new Error("Failed to get bot info");
    }

    return response.json();
  }

  private async sendDocument(chatId: string, documentUrl: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/bot${this.apiKey}/sendDocument`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        document: documentUrl,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send document");
    }

    return response.json();
  }
}
