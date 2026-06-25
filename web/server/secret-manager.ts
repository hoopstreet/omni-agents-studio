import crypto from "crypto";

/**
 * Secret Manager with encryption support
 * Handles secure storage and retrieval of sensitive credentials
 */

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");

interface EncryptedSecret {
  encrypted: string;
  iv: string;
  authTag: string;
}

interface Secret {
  id: string;
  name: string;
  type: "api_key" | "password" | "token" | "credential";
  value: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
}

class SecretManager {
  private secrets: Map<string, EncryptedSecret> = new Map();

  /**
   * Encrypt a secret value
   */
  private encrypt(value: string): EncryptedSecret {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(ENCRYPTION_KEY, "hex");

    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
    let encrypted = cipher.update(value, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString("hex"),
      authTag: authTag.toString("hex"),
    };
  }

  /**
   * Decrypt a secret value
   */
  private decrypt(encryptedSecret: EncryptedSecret): string {
    const key = Buffer.from(ENCRYPTION_KEY, "hex");
    const iv = Buffer.from(encryptedSecret.iv, "hex");
    const authTag = Buffer.from(encryptedSecret.authTag, "hex");

    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedSecret.encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  /**
   * Store a secret
   */
  storeSecret(secret: Secret): { success: boolean; secretId: string } {
    const secretId = `secret_${crypto.randomBytes(8).toString("hex")}`;
    const encrypted = this.encrypt(secret.value);

    this.secrets.set(secretId, encrypted);

    return {
      success: true,
      secretId,
    };
  }

  /**
   * Retrieve a secret
   */
  retrieveSecret(secretId: string): string | null {
    const encrypted = this.secrets.get(secretId);
    if (!encrypted) return null;

    try {
      return this.decrypt(encrypted);
    } catch (error) {
      console.error("Failed to decrypt secret:", error);
      return null;
    }
  }

  /**
   * Delete a secret
   */
  deleteSecret(secretId: string): boolean {
    return this.secrets.delete(secretId);
  }

  /**
   * List secret metadata (without values)
   */
  listSecrets(): Array<{ id: string; name: string; type: string; provider: string }> {
    return Array.from(this.secrets.keys()).map((id) => ({
      id,
      name: `Secret ${id.substring(0, 8)}`,
      type: "api_key",
      provider: "unknown",
    }));
  }

  /**
   * Rotate a secret
   */
  rotateSecret(secretId: string, newValue: string): boolean {
    if (!this.secrets.has(secretId)) return false;

    const encrypted = this.encrypt(newValue);
    this.secrets.set(secretId, encrypted);

    return true;
  }

  /**
   * Hash a secret for comparison (without storing plaintext)
   */
  hashSecret(value: string): string {
    return crypto.createHash("sha256").update(value).digest("hex");
  }

  /**
   * Verify a secret against a hash
   */
  verifySecret(value: string, hash: string): boolean {
    return this.hashSecret(value) === hash;
  }
}

// Export singleton instance
export const secretManager = new SecretManager();

/**
 * Secure credential storage with audit logging
 */
export interface StoredCredential {
  id: string;
  name: string;
  type: "openrouter" | "openai" | "anthropic" | "google" | "github" | "custom";
  secretId: string; // Reference to encrypted secret
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
}

class CredentialVault {
  private credentials: Map<string, StoredCredential> = new Map();

  /**
   * Store a credential
   */
  storeCredential(
    name: string,
    type: string,
    value: string,
    metadata: Record<string, any>,
    userId: number
  ): { success: boolean; credentialId: string } {
    const secret: Secret = {
      id: "",
      name,
      type: "credential",
      value,
      provider: type,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { secretId } = secretManager.storeSecret(secret);

    const credentialId = `cred_${crypto.randomBytes(8).toString("hex")}`;
    const credential: StoredCredential = {
      id: credentialId,
      name,
      type: type as any,
      secretId,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
    };

    this.credentials.set(credentialId, credential);

    return {
      success: true,
      credentialId,
    };
  }

  /**
   * Retrieve a credential
   */
  getCredential(credentialId: string): { credential: StoredCredential; value: string } | null {
    const credential = this.credentials.get(credentialId);
    if (!credential) return null;

    const value = secretManager.retrieveSecret(credential.secretId);
    if (!value) return null;

    return { credential, value };
  }

  /**
   * List credentials (without values)
   */
  listCredentials(): StoredCredential[] {
    return Array.from(this.credentials.values()).map((cred) => ({
      ...cred,
      // Ensure value is not included
    }));
  }

  /**
   * Delete a credential
   */
  deleteCredential(credentialId: string): boolean {
    const credential = this.credentials.get(credentialId);
    if (!credential) return false;

    secretManager.deleteSecret(credential.secretId);
    return this.credentials.delete(credentialId);
  }

  /**
   * Rotate a credential
   */
  rotateCredential(credentialId: string, newValue: string): boolean {
    const credential = this.credentials.get(credentialId);
    if (!credential) return false;

    return secretManager.rotateSecret(credential.secretId, newValue);
  }
}

// Export singleton instance
export const credentialVault = new CredentialVault();
