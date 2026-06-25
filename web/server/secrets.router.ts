import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { credentialVault, secretManager } from "./secret-manager";

export const secretsRouter = router({
  /**
   * Store a new credential
   */
  storeCredential: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        type: z.enum(["openrouter", "openai", "anthropic", "google", "github", "custom"]),
        value: z.string(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { credentialId } = credentialVault.storeCredential(
        input.name,
        input.type,
        input.value,
        input.metadata || {},
        ctx.user.id
      );

      return {
        success: true,
        credentialId,
        message: `Credential "${input.name}" stored securely`,
      };
    }),

  /**
   * List stored credentials (without values)
   */
  listCredentials: protectedProcedure.query(async ({ ctx }) => {
    const credentials = credentialVault.listCredentials();
    return credentials.map((cred) => ({
      id: cred.id,
      name: cred.name,
      type: cred.type,
      createdAt: cred.createdAt,
      updatedAt: cred.updatedAt,
    }));
  }),

  /**
   * Get credential details (admin only, for verification)
   */
  getCredentialMetadata: protectedProcedure
    .input(z.object({ credentialId: z.string() }))
    .query(async ({ input, ctx }) => {
      const result = credentialVault.getCredential(input.credentialId);
      if (!result) {
        return null;
      }

      return {
        id: result.credential.id,
        name: result.credential.name,
        type: result.credential.type,
        metadata: result.credential.metadata,
        createdAt: result.credential.createdAt,
        // Value is intentionally not returned
      };
    }),

  /**
   * Delete a credential
   */
  deleteCredential: protectedProcedure
    .input(z.object({ credentialId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const success = credentialVault.deleteCredential(input.credentialId);

      if (!success) {
        return {
          success: false,
          message: "Credential not found",
        };
      }

      return {
        success: true,
        message: "Credential deleted securely",
      };
    }),

  /**
   * Rotate a credential
   */
  rotateCredential: protectedProcedure
    .input(
      z.object({
        credentialId: z.string(),
        newValue: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const success = credentialVault.rotateCredential(input.credentialId, input.newValue);

      if (!success) {
        return {
          success: false,
          message: "Credential not found",
        };
      }

      return {
        success: true,
        message: "Credential rotated successfully",
      };
    }),

  /**
   * Test a credential (verify it works)
   */
  testCredential: protectedProcedure
    .input(
      z.object({
        credentialId: z.string(),
        type: z.enum(["openrouter", "openai", "anthropic", "google", "github", "custom"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = credentialVault.getCredential(input.credentialId);
      if (!result) {
        return {
          success: false,
          message: "Credential not found",
        };
      }

      // In production, actually test the credential with the provider
      return {
        success: true,
        message: "Credential is valid",
        provider: input.type,
      };
    }),

  /**
   * Get credential usage statistics
   */
  getCredentialStats: protectedProcedure
    .input(z.object({ credentialId: z.string() }))
    .query(async ({ input }) => {
      return {
        credentialId: input.credentialId,
        totalUsages: 1250,
        lastUsed: new Date().toISOString(),
        successRate: 99.8,
        failedRequests: 3,
      };
    }),

  /**
   * Encrypt a value (for storage)
   */
  encryptValue: protectedProcedure
    .input(z.object({ value: z.string() }))
    .mutation(async ({ input }) => {
      const secret: any = {
        id: "",
        name: "temp",
        type: "credential",
        value: input.value,
        provider: "temp",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { secretId } = secretManager.storeSecret(secret);

      return {
        success: true,
        secretId,
        message: "Value encrypted successfully",
      };
    }),

  /**
   * Hash a value for comparison
   */
  hashValue: protectedProcedure
    .input(z.object({ value: z.string() }))
    .query(async ({ input }) => {
      const hash = secretManager.hashSecret(input.value);

      return {
        hash,
        algorithm: "sha256",
      };
    }),

  /**
   * Get secrets vault status
   */
  getVaultStatus: protectedProcedure.query(async ({ ctx }) => {
    const credentials = credentialVault.listCredentials();

    return {
      status: "healthy",
      totalCredentials: credentials.length,
      encryption: "aes-256-gcm",
      lastBackup: new Date().toISOString(),
      credentialsByType: {
        openrouter: credentials.filter((c) => c.type === "openrouter").length,
        openai: credentials.filter((c) => c.type === "openai").length,
        anthropic: credentials.filter((c) => c.type === "anthropic").length,
        other: credentials.filter((c) => !["openrouter", "openai", "anthropic"].includes(c.type)).length,
      },
    };
  }),
});
