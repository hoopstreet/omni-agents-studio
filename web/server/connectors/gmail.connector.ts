import { OAuthConnector, ConnectorConfig, ConnectorAuth } from "./base.connector";

export class GmailConnector extends OAuthConnector {
  private baseUrl = "https://www.googleapis.com/gmail/v1";

  constructor(userId: number, clientId: string, clientSecret: string, redirectUri: string) {
    const config: ConnectorConfig = {
      id: "gmail",
      name: "Gmail",
      type: "communication",
      description: "Gmail - Email management and automation",
      authType: "oauth",
      baseUrl: "https://www.googleapis.com/gmail/v1",
      scopes: [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.modify",
      ],
    };
    super(config, userId, clientId, clientSecret, redirectUri);
  }

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: this.config.scopes!.join(" "),
      state,
      access_type: "offline",
      prompt: "consent",
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<ConnectorAuth> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });

    if (!response.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const data = (await response.json()) as any;

    return {
      credentialId: "",
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/users/me/profile`, {
        headers: {
          Authorization: `Bearer ${this.auth?.accessToken}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  protected async refreshAuthToken(): Promise<ConnectorAuth> {
    if (!this.auth?.refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.auth.refreshToken,
        grant_type: "refresh_token",
      }).toString(),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = (await response.json()) as any;

    return {
      credentialId: this.auth.credentialId,
      accessToken: data.access_token,
      refreshToken: this.auth.refreshToken,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
  }

  async sync(): Promise<{ success: boolean; itemsSynced: number; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/users/me/messages?maxResults=100`, {
        headers: {
          Authorization: `Bearer ${this.auth?.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to sync emails");
      }

      const data = (await response.json()) as any;
      const messages = data.messages || [];

      return {
        success: true,
        itemsSynced: messages.length,
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
    return ["list_emails", "send_email", "read_email", "delete_email", "create_draft"];
  }

  async executeAction(action: string, params: Record<string, any>): Promise<any> {
    switch (action) {
      case "list_emails":
        return this.listEmails(params.query, params.maxResults);
      case "send_email":
        return this.sendEmail(params.to, params.subject, params.body);
      case "read_email":
        return this.readEmail(params.messageId);
      case "delete_email":
        return this.deleteEmail(params.messageId);
      case "create_draft":
        return this.createDraft(params.to, params.subject, params.body);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async listEmails(query?: string, maxResults: number = 10): Promise<any> {
    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
    });

    if (query) {
      params.append("q", query);
    }

    const response = await fetch(`${this.baseUrl}/users/me/messages?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${this.auth?.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to list emails");
    }

    return response.json();
  }

  private async sendEmail(to: string, subject: string, body: string): Promise<any> {
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "",
      body,
    ].join("\r\n");

    const encodedMessage = Buffer.from(message).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");

    const response = await fetch(`${this.baseUrl}/users/me/messages/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.auth?.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send email");
    }

    return response.json();
  }

  private async readEmail(messageId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/users/me/messages/${messageId}`, {
      headers: {
        Authorization: `Bearer ${this.auth?.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to read email");
    }

    return response.json();
  }

  private async deleteEmail(messageId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/users/me/messages/${messageId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.auth?.accessToken}`,
      },
    });

    return response.ok;
  }

  private async createDraft(to: string, subject: string, body: string): Promise<any> {
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "",
      body,
    ].join("\r\n");

    const encodedMessage = Buffer.from(message).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");

    const response = await fetch(`${this.baseUrl}/users/me/drafts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.auth?.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          raw: encodedMessage,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create draft");
    }

    return response.json();
  }
}
