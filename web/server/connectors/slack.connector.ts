import { APIKeyConnector, ConnectorConfig } from "./base.connector";

export class SlackConnector extends APIKeyConnector {
  private baseUrl = "https://slack.com/api";

  constructor(userId: number) {
    const config: ConnectorConfig = {
      id: "slack",
      name: "Slack",
      type: "communication",
      description: "Slack - Team messaging and collaboration",
      authType: "api_key",
      baseUrl: "https://slack.com/api",
      requiredFields: ["apiKey"],
    };
    super(config, userId);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth.test`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      const data = (await response.json()) as any;
      return data.ok === true;
    } catch (error) {
      return false;
    }
  }

  async sync(): Promise<{ success: boolean; itemsSynced: number; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations.list?limit=100`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to sync channels");
      }

      const data = (await response.json()) as any;
      const channels = data.channels || [];

      return {
        success: true,
        itemsSynced: channels.length,
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
    return ["list_channels", "send_message", "read_messages", "create_channel", "invite_user"];
  }

  async executeAction(action: string, params: Record<string, any>): Promise<any> {
    switch (action) {
      case "list_channels":
        return this.listChannels();
      case "send_message":
        return this.sendMessage(params.channelId, params.text);
      case "read_messages":
        return this.readMessages(params.channelId, params.limit);
      case "create_channel":
        return this.createChannel(params.name);
      case "invite_user":
        return this.inviteUser(params.channelId, params.userId);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async listChannels(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/conversations.list?limit=100`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to list channels");
    }

    return response.json();
  }

  private async sendMessage(channelId: string, text: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/chat.postMessage`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel: channelId,
        text,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    return response.json();
  }

  private async readMessages(channelId: string, limit: number = 50): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/conversations.history?channel=${channelId}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to read messages");
    }

    return response.json();
  }

  private async createChannel(name: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/conversations.create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create channel");
    }

    return response.json();
  }

  private async inviteUser(channelId: string, userId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/conversations.invite`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel: channelId,
        users: userId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to invite user");
    }

    return response.json();
  }
}
