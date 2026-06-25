import { BaseConnector, ConnectorConfig, ConnectorAuth } from "./base.connector";

export class MCPServerConnector extends BaseConnector {
  private serverUrl: string = "";
  private serverPort: number = 0;

  constructor(userId: number) {
    const config: ConnectorConfig = {
      id: "mcp-server",
      name: "MCP Server",
      type: "custom",
      description: "Model Context Protocol (MCP) Server integration",
      authType: "custom",
      requiredFields: ["serverUrl", "serverPort"],
    };
    super(config, userId);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.serverUrl}:${this.serverPort}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async authenticate(credentials: Record<string, any>): Promise<ConnectorAuth> {
    if (!credentials.serverUrl || !credentials.serverPort) {
      throw new Error("Server URL and port required");
    }

    this.serverUrl = credentials.serverUrl;
    this.serverPort = credentials.serverPort;

    this.auth = {
      credentialId: "",
      metadata: {
        serverUrl: credentials.serverUrl,
        serverPort: credentials.serverPort,
      },
    };

    return this.auth;
  }

  protected async refreshAuthToken(): Promise<ConnectorAuth> {
    return this.auth!;
  }

  async sync(): Promise<{ success: boolean; itemsSynced: number; error?: string }> {
    try {
      const response = await fetch(`${this.serverUrl}:${this.serverPort}/tools`);

      if (!response.ok) {
        throw new Error("Failed to sync tools");
      }

      const data = (await response.json()) as any;
      const tools = data.tools || [];

      return {
        success: true,
        itemsSynced: tools.length,
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
    return ["list_tools", "call_tool", "list_resources", "read_resource"];
  }

  async executeAction(action: string, params: Record<string, any>): Promise<any> {
    switch (action) {
      case "list_tools":
        return this.listTools();
      case "call_tool":
        return this.callTool(params.toolName, params.arguments);
      case "list_resources":
        return this.listResources();
      case "read_resource":
        return this.readResource(params.resourceUri);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async listTools(): Promise<any> {
    const response = await fetch(`${this.serverUrl}:${this.serverPort}/tools`);

    if (!response.ok) {
      throw new Error("Failed to list tools");
    }

    return response.json();
  }

  private async callTool(toolName: string, toolArguments: Record<string, any>): Promise<any> {
    const response = await fetch(`${this.serverUrl}:${this.serverPort}/tools/${toolName}/call`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(toolArguments),
    });

    if (!response.ok) {
      throw new Error("Failed to call tool");
    }

    return response.json();
  }

  private async listResources(): Promise<any> {
    const response = await fetch(`${this.serverUrl}:${this.serverPort}/resources`);

    if (!response.ok) {
      throw new Error("Failed to list resources");
    }

    return response.json();
  }

  private async readResource(resourceUri: string): Promise<any> {
    const response = await fetch(
      `${this.serverUrl}:${this.serverPort}/resources/${encodeURIComponent(resourceUri)}`
    );

    if (!response.ok) {
      throw new Error("Failed to read resource");
    }

    return response.json();
  }
}
