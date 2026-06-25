import { OAuthConnector, ConnectorConfig, ConnectorAuth } from "./base.connector";

export class GoogleDriveConnector extends OAuthConnector {
  private baseUrl = "https://www.googleapis.com/drive/v3";

  constructor(userId: number, clientId: string, clientSecret: string, redirectUri: string) {
    const config: ConnectorConfig = {
      id: "google-drive",
      name: "Google Drive",
      type: "storage",
      description: "Google Drive - Cloud storage and file management",
      authType: "oauth",
      baseUrl: "https://www.googleapis.com/drive/v3",
      scopes: [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
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
      const response = await fetch(`${this.baseUrl}/about?fields=user`, {
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
      const response = await fetch(
        `${this.baseUrl}/files?pageSize=100&fields=files(id,name,mimeType,modifiedTime)`,
        {
          headers: {
            Authorization: `Bearer ${this.auth?.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to sync files");
      }

      const data = (await response.json()) as any;
      const files = data.files || [];

      return {
        success: true,
        itemsSynced: files.length,
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
    return ["list_files", "upload_file", "download_file", "delete_file", "create_folder"];
  }

  async executeAction(action: string, params: Record<string, any>): Promise<any> {
    switch (action) {
      case "list_files":
        return this.listFiles(params.folderId);
      case "upload_file":
        return this.uploadFile(params.fileName, params.content);
      case "download_file":
        return this.downloadFile(params.fileId);
      case "delete_file":
        return this.deleteFile(params.fileId);
      case "create_folder":
        return this.createFolder(params.folderName);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async listFiles(folderId?: string): Promise<any> {
    const query = folderId ? `parents='${folderId}' and trashed=false` : "trashed=false";
    const response = await fetch(
      `${this.baseUrl}/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,modifiedTime)`,
      {
        headers: {
          Authorization: `Bearer ${this.auth?.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to list files");
    }

    return response.json();
  }

  private async uploadFile(fileName: string, content: string): Promise<any> {
    const metadata = {
      name: fileName,
    };

    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append("file", new Blob([content]));

    const response = await fetch(`${this.baseUrl}/files?uploadType=multipart`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.auth?.accessToken}`,
      },
      body: form,
    });

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    return response.json();
  }

  private async downloadFile(fileId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/files/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${this.auth?.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to download file");
    }

    return response.blob();
  }

  private async deleteFile(fileId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/files/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.auth?.accessToken}`,
      },
    });

    return response.ok;
  }

  private async createFolder(folderName: string): Promise<any> {
    const metadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    };

    const response = await fetch(`${this.baseUrl}/files?fields=id,name`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.auth?.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      throw new Error("Failed to create folder");
    }

    return response.json();
  }
}
