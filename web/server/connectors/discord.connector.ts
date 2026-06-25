import { APIKeyConnector, ConnectorConfig } from "./base.connector";

export class DiscordConnector extends APIKeyConnector {
  private baseUrl = "https://discord.com/api/v10";

  constructor(userId: number) {
    const config: ConnectorConfig = {
      id: "discord",
      name: "Discord",
      type: "communication",
      description: "Discord - Community and messaging",
      authType: "api_key",
      baseUrl: "https://discord.com/api/v10",
      requiredFields: ["apiKey"],
    };
    super(config, userId);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/users/@me`, {
        headers: {
          Authorization: `Bot ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async sync(): Promise<{ success: boolean; itemsSynced: number; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/users/@me/guilds`, {
        headers: {
          Authorization: `Bot ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to sync servers");
      }

      const guilds = (await response.json()) as any[];

      return {
        success: true,
        itemsSynced: guilds.length,
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
    return ["send_message", "list_channels", "create_channel", "list_guilds", "get_user"];
  }

  async executeAction(action: string, params: Record<string, any>): Promise<any> {
    switch (action) {
      case "send_message":
        return this.sendMessage(params.channelId, params.content);
      case "list_channels":
        return this.listChannels(params.guildId);
      case "create_channel":
        return this.createChannel(params.guildId, params.name);
      case "list_guilds":
        return this.listGuilds();
      case "get_user":
        return this.getUser(params.userId);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async sendMessage(channelId: string, content: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/channels/${channelId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    return response.json();
  }

  private async listChannels(guildId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/guilds/${guildId}/channels`, {
      headers: {
        Authorization: `Bot ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to list channels");
    }

    return response.json();
  }

  private async createChannel(guildId: string, name: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/guilds/${guildId}/channels`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        type: 0, // Text channel
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create channel");
    }

    return response.json();
  }

  private async listGuilds(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/users/@me/guilds`, {
      headers: {
        Authorization: `Bot ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to list guilds");
    }

    return response.json();
  }

  private async getUser(userId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/users/${userId}`, {
      headers: {
        Authorization: `Bot ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get user");
    }

    return response.json();
  }
}
