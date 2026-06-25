import { credentialVault } from "../secret-manager";

/**
 * Base Connector Class
 * All connectors inherit from this class
 */

export type ConnectorType =
  | "ai_provider"
  | "productivity"
  | "communication"
  | "storage"
  | "development"
  | "automation"
  | "custom";

export interface ConnectorConfig {
  id: string;
  name: string;
  type: ConnectorType;
  description: string;
  icon?: string;
  authType: "oauth" | "api_key" | "basic" | "custom";
  baseUrl?: string;
  scopes?: string[];
  requiredFields?: string[];
}

export interface ConnectorAuth {
  credentialId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  metadata?: Record<string, any>;
}

export abstract class BaseConnector {
  protected config: ConnectorConfig;
  protected auth: ConnectorAuth | null = null;
  protected userId: number;

  constructor(config: ConnectorConfig, userId: number) {
    this.config = config;
    this.userId = userId;
  }

  /**
   * Initialize connector with credentials
   */
  async initialize(credentialId: string): Promise<boolean> {
    const result = credentialVault.getCredential(credentialId);
    if (!result) {
      throw new Error("Credential not found");
    }

    this.auth = {
      credentialId,
      accessToken: result.value,
      metadata: result.credential.metadata,
    };

    return await this.testConnection();
  }

  /**
   * Test connection to the service
   */
  abstract testConnection(): Promise<boolean>;

  /**
   * Authenticate with the service
   */
  abstract authenticate(credentials: Record<string, any>): Promise<ConnectorAuth>;

  /**
   * Refresh authentication token
   */
  async refreshAuth(): Promise<boolean> {
    if (!this.auth?.refreshToken) {
      return false;
    }

    try {
      const newAuth = await this.refreshAuthToken();
      this.auth = newAuth;
      return true;
    } catch (error) {
      console.error("Failed to refresh auth:", error);
      return false;
    }
  }

  /**
   * Refresh authentication token (to be implemented by subclasses)
   */
  protected abstract refreshAuthToken(): Promise<ConnectorAuth>;

  /**
   * Get connector configuration
   */
  getConfig(): ConnectorConfig {
    return this.config;
  }

  /**
   * Check if connector is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.auth?.accessToken;
  }

  /**
   * Get connector status
   */
  async getStatus(): Promise<{
    connected: boolean;
    authenticated: boolean;
    lastSync?: Date;
    error?: string;
  }> {
    try {
      const connected = await this.testConnection();
      return {
        connected,
        authenticated: this.isAuthenticated(),
      };
    } catch (error) {
      return {
        connected: false,
        authenticated: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Disconnect connector
   */
  async disconnect(): Promise<boolean> {
    if (this.auth?.credentialId) {
      credentialVault.deleteCredential(this.auth.credentialId);
    }
    this.auth = null;
    return true;
  }

  /**
   * Sync data from connector
   */
  abstract sync(): Promise<{ success: boolean; itemsSynced: number; error?: string }>;

  /**
   * Get connector capabilities
   */
  abstract getCapabilities(): string[];

  /**
   * Execute connector action
   */
  abstract executeAction(action: string, params: Record<string, any>): Promise<any>;
}

/**
 * OAuth Connector Base Class
 */
export abstract class OAuthConnector extends BaseConnector {
  protected clientId: string;
  protected clientSecret: string;
  protected redirectUri: string;

  constructor(
    config: ConnectorConfig,
    userId: number,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ) {
    super(config, userId);
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  /**
   * Get OAuth authorization URL
   */
  abstract getAuthorizationUrl(state: string): string;

  /**
   * Exchange authorization code for tokens
   */
  abstract exchangeCodeForToken(code: string): Promise<ConnectorAuth>;

  /**
   * Authenticate with OAuth
   */
  async authenticate(credentials: Record<string, any>): Promise<ConnectorAuth> {
    if (!credentials.code) {
      throw new Error("Authorization code required");
    }

    const auth = await this.exchangeCodeForToken(credentials.code);
    this.auth = auth;

    // Store credentials
    const { credentialId } = credentialVault.storeCredential(
      this.config.name,
      this.config.type,
      auth.accessToken || "",
      {
        refreshToken: auth.refreshToken,
        expiresAt: auth.expiresAt,
        ...auth.metadata,
      },
      this.userId
    );

    this.auth.credentialId = credentialId;
    return this.auth;
  }
}

/**
 * API Key Connector Base Class
 */
export abstract class APIKeyConnector extends BaseConnector {
  protected apiKey: string = "";

  constructor(config: ConnectorConfig, userId: number) {
    super(config, userId);
  }

  /**
   * Authenticate with API key
   */
  async authenticate(credentials: Record<string, any>): Promise<ConnectorAuth> {
    if (!credentials.apiKey) {
      throw new Error("API key required");
    }

    this.apiKey = credentials.apiKey;

    // Validate API key
    const isValid = await this.testConnection();
    if (!isValid) {
      throw new Error("Invalid API key");
    }

    // Store credentials
    const { credentialId } = credentialVault.storeCredential(
      this.config.name,
      this.config.type,
      credentials.apiKey,
      {},
      this.userId
    );

    this.auth = {
      credentialId,
      accessToken: credentials.apiKey,
    };

    return this.auth;
  }

  /**
   * API key doesn't need refresh
   */
  protected async refreshAuthToken(): Promise<ConnectorAuth> {
    return this.auth!;
  }
}

/**
 * Connector Registry
 */
export class ConnectorRegistry {
  private connectors: Map<string, typeof BaseConnector> = new Map();

  register(id: string, connectorClass: typeof BaseConnector): void {
    this.connectors.set(id, connectorClass);
  }

  get(id: string): typeof BaseConnector | undefined {
    return this.connectors.get(id);
  }

  list(): string[] {
    return Array.from(this.connectors.keys());
  }

  create(id: string, userId: number, ...args: any[]): BaseConnector | null {
    const ConnectorClass = this.connectors.get(id);
    if (!ConnectorClass) {
      return null;
    }

    return new (ConnectorClass as any)(userId, ...args);
  }
}

export const connectorRegistry = new ConnectorRegistry();
