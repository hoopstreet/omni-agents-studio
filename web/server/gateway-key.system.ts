/**
 * Unified Gateway Key System
 * Manages automatic credential rotation, revocation, and reconnection
 * Supports: GitHub, Supabase, Expo, OpenRouter, Notion, Google, Slack, Discord, Telegram, etc.
 */

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { ENV } from "./_core/env";

// Types
export type CredentialProvider =
  | "github"
  | "supabase"
  | "expo"
  | "openrouter"
  | "notion"
  | "google"
  | "slack"
  | "discord"
  | "telegram"
  | "zapier"
  | "n8n"
  | "make"
  | "stripe"
  | "shopify";

export interface GatewayCredential {
  id: string;
  provider: CredentialProvider;
  accountId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  rotationInterval?: number; // in milliseconds
  lastRotated?: number;
  status: "active" | "expired" | "revoked" | "pending";
  encryptionKey: string;
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface RotationConfig {
  provider: CredentialProvider;
  rotationInterval: number; // milliseconds
  gracePeriod: number; // milliseconds before expiry to rotate
  maxRetries: number;
  retryDelay: number; // milliseconds
}

export interface CredentialRotationEvent {
  credentialId: string;
  provider: CredentialProvider;
  action: "rotated" | "revoked" | "reconnected" | "expired";
  timestamp: number;
  success: boolean;
  error?: string;
}

/**
 * Unified Gateway Key System
 * Manages all credentials with automatic rotation and revocation
 */
export class GatewayKeySystem {
  private supabase;
  private encryptionKey: string;
  private rotationConfigs: Map<CredentialProvider, RotationConfig>;
  private rotationTimers: Map<string, NodeJS.Timeout>;
  private eventLog: CredentialRotationEvent[];

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );
    this.encryptionKey = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");
    this.rotationConfigs = new Map();
    this.rotationTimers = new Map();
    this.eventLog = [];

    this.initializeRotationConfigs();
  }

  /**
   * Initialize rotation configurations for all providers
   */
  private initializeRotationConfigs(): void {
    const configs: Record<CredentialProvider, RotationConfig> = {
      github: {
        provider: "github",
        rotationInterval: 30 * 24 * 60 * 60 * 1000, // 30 days
        gracePeriod: 24 * 60 * 60 * 1000, // 1 day before expiry
        maxRetries: 3,
        retryDelay: 5000,
      },
      supabase: {
        provider: "supabase",
        rotationInterval: 90 * 24 * 60 * 60 * 1000, // 90 days
        gracePeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxRetries: 3,
        retryDelay: 5000,
      },
      expo: {
        provider: "expo",
        rotationInterval: 60 * 24 * 60 * 60 * 1000, // 60 days
        gracePeriod: 7 * 24 * 60 * 60 * 1000,
        maxRetries: 3,
        retryDelay: 5000,
      },
      openrouter: {
        provider: "openrouter",
        rotationInterval: 45 * 24 * 60 * 60 * 1000, // 45 days
        gracePeriod: 5 * 24 * 60 * 60 * 1000,
        maxRetries: 3,
        retryDelay: 5000,
      },
      notion: {
        provider: "notion",
        rotationInterval: 30 * 24 * 60 * 60 * 1000,
        gracePeriod: 24 * 60 * 60 * 1000,
        maxRetries: 3,
        retryDelay: 5000,
      },
      google: {
        provider: "google",
        rotationInterval: 60 * 24 * 60 * 60 * 1000,
        gracePeriod: 7 * 24 * 60 * 60 * 1000,
        maxRetries: 3,
        retryDelay: 5000,
      },
      slack: {
        provider: "slack",
        rotationInterval: 30 * 24 * 60 * 60 * 1000,
        gracePeriod: 24 * 60 * 60 * 1000,
        maxRetries: 3,
        retryDelay: 5000,
      },
      discord: {
        provider: "discord",
        rotationInterval: 30 * 24 * 60 * 60 * 1000,
        gracePeriod: 24 * 60 * 60 * 1000,
        maxRetries: 3,
        retryDelay: 5000,
      },
      telegram: {
        provider: "telegram",
        rotationInterval: 90 * 24 * 60 * 60 * 1000,
        gracePeriod: 7 * 24 * 60 * 60 * 1000,
        maxRetries: 3,
        retryDelay: 5000,
      },
      zapier: {
        provider: "zapier",
        rotationInterval: 30 * 24 * 60 * 60 * 1000,
        gracePeriod: 24 * 60 * 60 * 1000,
        maxRetries: 3,
        retryDelay: 5000,
      },
      n8n: {
        provider: "n8n",
        rotationInterval: 30 * 24 * 60 * 60 * 1000,
        gracePeriod: 24 * 60 * 60 * 1000,
        maxRetries: 3,
        retryDelay: 5000,
      },
      make: {
        provider: "make",
        rotationInterval: 30 * 24 * 60 * 60 * 1000,
        gracePeriod: 24 * 60 * 60 * 1000,
        maxRetries: 3,
        retryDelay: 5000,
      },
      stripe: {
        provider: "stripe",
        rotationInterval: 90 * 24 * 60 * 60 * 1000,
        gracePeriod: 7 * 24 * 60 * 60 * 1000,
        maxRetries: 3,
        retryDelay: 5000,
      },
      shopify: {
        provider: "shopify",
        rotationInterval: 90 * 24 * 60 * 60 * 1000,
        gracePeriod: 7 * 24 * 60 * 60 * 1000,
        maxRetries: 3,
        retryDelay: 5000,
      },
    };

    for (const [provider, config] of Object.entries(configs)) {
      this.rotationConfigs.set(provider as CredentialProvider, config);
    }
  }

  /**
   * Encrypt sensitive data
   */
  private encrypt(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(this.encryptionKey, "hex"), iv);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  }

  /**
   * Decrypt sensitive data
   */
  private decrypt(encryptedData: string): string {
    const [iv, authTag, encrypted] = encryptedData.split(":");
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      Buffer.from(this.encryptionKey, "hex"),
      Buffer.from(iv, "hex")
    );
    decipher.setAuthTag(Buffer.from(authTag, "hex"));
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  /**
   * Store credential in vault
   */
  async storeCredential(
    provider: CredentialProvider,
    accountId: string,
    accessToken: string,
    refreshToken?: string,
    expiresAt?: number,
    metadata?: Record<string, any>
  ): Promise<GatewayCredential> {
    const credential: GatewayCredential = {
      id: crypto.randomUUID(),
      provider,
      accountId,
      accessToken: this.encrypt(accessToken),
      refreshToken: refreshToken ? this.encrypt(refreshToken) : undefined,
      expiresAt,
      rotationInterval: this.rotationConfigs.get(provider)?.rotationInterval,
      lastRotated: Date.now(),
      status: "active",
      encryptionKey: this.encryptionKey,
      metadata,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const { data, error } = await this.supabase
      .from("gateway_credentials")
      .insert([credential])
      .select();

    if (error) throw new Error(`Failed to store credential: ${error.message}`);

    // Schedule rotation
    this.scheduleRotation(credential.id, provider);

    return data?.[0] || credential;
  }

  /**
   * Retrieve credential from vault
   */
  async getCredential(credentialId: string): Promise<GatewayCredential | null> {
    const { data, error } = await this.supabase
      .from("gateway_credentials")
      .select("*")
      .eq("id", credentialId)
      .single();

    if (error || !data) return null;

    return {
      ...data,
      accessToken: this.decrypt(data.accessToken),
      refreshToken: data.refreshToken ? this.decrypt(data.refreshToken) : undefined,
    };
  }

  /**
   * Get all credentials for a provider
   */
  async getCredentialsByProvider(provider: CredentialProvider): Promise<GatewayCredential[]> {
    const { data, error }: any = await this.supabase
      .from("gateway_credentials")
      .select("*")
      .eq("provider", provider)
      .eq("status", "active");

    if (error) return [];

    return data.map((cred: any) => ({
      ...cred,
      accessToken: this.decrypt(cred.accessToken),
      refreshToken: cred.refreshToken ? this.decrypt(cred.refreshToken) : undefined,
    }));
  }

  /**
   * Rotate credential token
   */
  async rotateCredential(credentialId: string): Promise<boolean> {
    const credential = await this.getCredential(credentialId);
    if (!credential) return false;

    const config = this.rotationConfigs.get(credential.provider);
    if (!config) return false;

    let retries = 0;
    while (retries < config.maxRetries) {
      try {
        const newToken = await this.refreshToken(credential);
        if (newToken) {
          await this.updateCredential(credentialId, {
            accessToken: newToken,
            lastRotated: Date.now(),
            status: "active",
          });

          this.logEvent({
            credentialId,
            provider: credential.provider,
            action: "rotated",
            timestamp: Date.now(),
            success: true,
          });

          return true;
        }
      } catch (error) {
        retries++;
        if (retries < config.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, config.retryDelay));
        }
      }
    }

    this.logEvent({
      credentialId,
      provider: credential.provider,
      action: "rotated",
      timestamp: Date.now(),
      success: false,
      error: "Max retries exceeded",
    });

    return false;
  }

  /**
   * Refresh token from provider
   */
  private async refreshToken(credential: GatewayCredential): Promise<string | null> {
    // Implementation depends on provider
    // This is a placeholder - actual implementation would call provider APIs
    switch (credential.provider) {
      case "github":
        return await this.refreshGitHubToken(credential);
      case "google":
        return await this.refreshGoogleToken(credential);
      case "supabase":
        return await this.refreshSupabaseToken(credential);
      // Add more providers as needed
      default:
        return null;
    }
  }

  /**
   * Refresh GitHub token
   */
  private async refreshGitHubToken(credential: GatewayCredential): Promise<string | null> {
    // GitHub doesn't support token refresh - would need to re-authenticate
    // For now, return existing token
    return credential.accessToken;
  }

  /**
   * Refresh Google token
   */
  private async refreshGoogleToken(credential: GatewayCredential): Promise<string | null> {
    if (!credential.refreshToken) return null;

    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_API_KEY || "",
          client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
          refresh_token: credential.refreshToken,
          grant_type: "refresh_token",
        }).toString(),
      });

      const data = await response.json();
      return data.access_token || null;
    } catch (error: any) {
      return null;
    }
  }

  /**
   * Refresh Supabase token
   */
  private async refreshSupabaseToken(credential: GatewayCredential): Promise<string | null> {
    if (!credential.refreshToken) return null;

    try {
      const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.SUPABASE_KEY || "",
        },
        body: JSON.stringify({ refresh_token: credential.refreshToken }),
      });

      const data = await response.json();
      return data.access_token || null;
    } catch (error: any) {
      return null;
    }
  }

  /**
   * Revoke credential
   */
  async revokeCredential(credentialId: string): Promise<boolean> {
    const credential = await this.getCredential(credentialId);
    if (!credential) return false;

    const { error } = await this.supabase
      .from("gateway_credentials")
      .update({ status: "revoked", updatedAt: Date.now() })
      .eq("id", credentialId);

    if (error) return false;

    // Clear rotation timer
    const timer = this.rotationTimers.get(credentialId);
    if (timer) clearTimeout(timer);
    this.rotationTimers.delete(credentialId);

    this.logEvent({
      credentialId,
      provider: credential.provider,
      action: "revoked",
      timestamp: Date.now(),
      success: true,
    });

    return true;
  }

  /**
   * Reconnect credential (revoke old, store new)
   */
  async reconnectCredential(
    credentialId: string,
    newAccessToken: string,
    newRefreshToken?: string,
    newExpiresAt?: number
  ): Promise<boolean> {
    const credential = await this.getCredential(credentialId);
    if (!credential) return false;

    // Revoke old credential
    await this.revokeCredential(credentialId);

    // Store new credential
    await this.storeCredential(
      credential.provider,
      credential.accountId,
      newAccessToken,
      newRefreshToken,
      newExpiresAt,
      credential.metadata
    );

    this.logEvent({
      credentialId,
      provider: credential.provider,
      action: "reconnected",
      timestamp: Date.now(),
      success: true,
    });

    return true;
  }

  /**
   * Update credential
   */
  private async updateCredential(
    credentialId: string,
    updates: Partial<GatewayCredential>
  ): Promise<boolean> {
    const { error } = await this.supabase
      .from("gateway_credentials")
      .update({ ...updates, updatedAt: Date.now() })
      .eq("id", credentialId);

    return !error;
  }

  /**
   * Schedule automatic rotation
   */
  private scheduleRotation(credentialId: string, provider: CredentialProvider): void {
    const config = this.rotationConfigs.get(provider);
    if (!config) return;

    const rotationDelay = config.rotationInterval - config.gracePeriod;

    const timer = setTimeout(async () => {
      await this.rotateCredential(credentialId);
      // Reschedule for next rotation
      this.scheduleRotation(credentialId, provider);
    }, rotationDelay);

    this.rotationTimers.set(credentialId, timer);
  }

  /**
   * Log rotation event
   */
  private async logEvent(event: CredentialRotationEvent): Promise<void> {
    this.eventLog.push(event);

    // Store in database
    try {
      await this.supabase.from("gateway_rotation_logs").insert([event]);
    } catch (error: any) {
      console.error("Failed to log rotation event:", error);
    }
  }

  /**
   * Get rotation history
   */
  async getRotationHistory(credentialId: string, limit = 50): Promise<CredentialRotationEvent[]> {
    const { data, error } = await this.supabase
      .from("gateway_rotation_logs")
      .select("*")
      .eq("credentialId", credentialId)
      .order("timestamp", { ascending: false })
      .limit(limit);

    return error ? [] : data || [];
  }

  /**
   * Check and rotate expired credentials
   */
  async checkAndRotateExpired(): Promise<void> {
    const { data, error }: any = await this.supabase
      .from("gateway_credentials")
      .select("*")
      .eq("status", "active")
      .lt("expiresAt", Date.now());

    if (error || !data) return;

    for (const credential of data) {
      await this.rotateCredential(credential.id);
    }
  }

  /**
   * Get credential status
   */
  async getCredentialStatus(credentialId: string): Promise<GatewayCredential | null> {
    return this.getCredential(credentialId);
  }

  /**
   * List all credentials
   */
  async listCredentials(userId?: string): Promise<GatewayCredential[]> {
    let query = this.supabase.from("gateway_credentials").select("*").eq("status", "active");

    if (userId) {
      query = query.eq("userId", userId);
    }

    const { data, error }: any = await query;

    if (error) return [];

    return data.map((cred: any) => ({
      ...cred,
      accessToken: this.decrypt(cred.accessToken),
      refreshToken: cred.refreshToken ? this.decrypt(cred.refreshToken) : undefined,
    }));
  }
}

// Export singleton instance
export const gatewayKeySystem = new GatewayKeySystem();
