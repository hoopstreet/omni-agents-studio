/**
 * Gateway Key System tRPC Router
 * Handles credential management, rotation, revocation, and reconnection
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { gatewayKeySystem, CredentialProvider } from "./gateway-key.system";
import { TRPCError } from "@trpc/server";

export const gatewayKeyRouter = router({
  /**
   * Store a new credential
   */
  storeCredential: protectedProcedure
    .input(
      z.object({
        provider: z.enum([
          "github",
          "supabase",
          "expo",
          "openrouter",
          "notion",
          "google",
          "slack",
          "discord",
          "telegram",
          "zapier",
          "n8n",
          "make",
          "stripe",
          "shopify",
        ]),
        accountId: z.string(),
        accessToken: z.string(),
        refreshToken: z.string().optional(),
        expiresAt: z.number().optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const credential = await gatewayKeySystem.storeCredential(
          input.provider as CredentialProvider,
          input.accountId,
          input.accessToken,
          input.refreshToken,
          input.expiresAt,
          input.metadata
        );

        return {
          success: true,
          credentialId: credential.id,
          provider: credential.provider,
          accountId: credential.accountId,
          status: credential.status,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to store credential: ${error.message}`,
        });
      }
    }),

  /**
   * Get credential by ID
   */
  getCredential: protectedProcedure
    .input(z.object({ credentialId: z.string() }))
    .query(async ({ input }) => {
      try {
        const credential = await gatewayKeySystem.getCredential(input.credentialId);

        if (!credential) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Credential not found",
          });
        }

        return {
          id: credential.id,
          provider: credential.provider,
          accountId: credential.accountId,
          status: credential.status,
          expiresAt: credential.expiresAt,
          lastRotated: credential.lastRotated,
          createdAt: credential.createdAt,
          updatedAt: credential.updatedAt,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get credential: ${error.message}`,
        });
      }
    }),

  /**
   * List all credentials for a provider
   */
  listByProvider: protectedProcedure
    .input(
      z.object({
        provider: z.enum([
          "github",
          "supabase",
          "expo",
          "openrouter",
          "notion",
          "google",
          "slack",
          "discord",
          "telegram",
          "zapier",
          "n8n",
          "make",
          "stripe",
          "shopify",
        ]),
      })
    )
    .query(async ({ input }) => {
      try {
        const credentials = await gatewayKeySystem.getCredentialsByProvider(
          input.provider as CredentialProvider
        );

        return credentials.map((cred) => ({
          id: cred.id,
          provider: cred.provider,
          accountId: cred.accountId,
          status: cred.status,
          expiresAt: cred.expiresAt,
          lastRotated: cred.lastRotated,
          createdAt: cred.createdAt,
          updatedAt: cred.updatedAt,
        }));
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to list credentials: ${error.message}`,
        });
      }
    }),

  /**
   * Rotate credential token
   */
  rotate: protectedProcedure
    .input(z.object({ credentialId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const success = await gatewayKeySystem.rotateCredential(input.credentialId);

        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to rotate credential",
          });
        }

        return { success: true, message: "Credential rotated successfully" };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to rotate credential: ${error.message}`,
        });
      }
    }),

  /**
   * Revoke credential
   */
  revoke: protectedProcedure
    .input(z.object({ credentialId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const success = await gatewayKeySystem.revokeCredential(input.credentialId);

        if (!success) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Credential not found",
          });
        }

        return { success: true, message: "Credential revoked successfully" };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to revoke credential: ${error.message}`,
        });
      }
    }),

  /**
   * Reconnect credential (revoke old, store new)
   */
  reconnect: protectedProcedure
    .input(
      z.object({
        credentialId: z.string(),
        newAccessToken: z.string(),
        newRefreshToken: z.string().optional(),
        newExpiresAt: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const success = await gatewayKeySystem.reconnectCredential(
          input.credentialId,
          input.newAccessToken,
          input.newRefreshToken,
          input.newExpiresAt
        );

        if (!success) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Credential not found",
          });
        }

        return { success: true, message: "Credential reconnected successfully" };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to reconnect credential: ${error.message}`,
        });
      }
    }),

  /**
   * Get credential status
   */
  getStatus: protectedProcedure
    .input(z.object({ credentialId: z.string() }))
    .query(async ({ input }) => {
      try {
        const credential = await gatewayKeySystem.getCredentialStatus(input.credentialId);

        if (!credential) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Credential not found",
          });
        }

        const now = Date.now();
        const expiresIn = credential.expiresAt ? credential.expiresAt - now : null;
        const isExpired = expiresIn ? expiresIn <= 0 : false;
        const needsRotation = expiresIn ? expiresIn <= 24 * 60 * 60 * 1000 : false; // 24 hours

        return {
          id: credential.id,
          provider: credential.provider,
          accountId: credential.accountId,
          status: credential.status,
          isExpired,
          needsRotation,
          expiresIn,
          expiresAt: credential.expiresAt,
          lastRotated: credential.lastRotated,
          createdAt: credential.createdAt,
          updatedAt: credential.updatedAt,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get credential status: ${error.message}`,
        });
      }
    }),

  /**
   * Get rotation history
   */
  getRotationHistory: protectedProcedure
    .input(
      z.object({
        credentialId: z.string(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        const history = await gatewayKeySystem.getRotationHistory(
          input.credentialId,
          input.limit
        );

        return history.map((event) => ({
          credentialId: event.credentialId,
          provider: event.provider,
          action: event.action,
          timestamp: event.timestamp,
          success: event.success,
          error: event.error,
        }));
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get rotation history: ${error.message}`,
        });
      }
    }),

  /**
   * List all credentials
   */
  listAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      const credentials = await gatewayKeySystem.listCredentials();

      return credentials.map((cred) => ({
        id: cred.id,
        provider: cred.provider,
        accountId: cred.accountId,
        status: cred.status,
        expiresAt: cred.expiresAt,
        lastRotated: cred.lastRotated,
        createdAt: cred.createdAt,
        updatedAt: cred.updatedAt,
      }));
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to list credentials: ${error.message}`,
      });
    }
  }),

  /**
   * Check and rotate expired credentials
   */
  checkExpired: protectedProcedure.mutation(async () => {
    try {
      await gatewayKeySystem.checkAndRotateExpired();
      return { success: true, message: "Expired credentials checked and rotated" };
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to check expired credentials: ${error.message}`,
      });
    }
  }),

  /**
   * Bulk rotate all credentials for a provider
   */
  bulkRotate: protectedProcedure
    .input(
      z.object({
        provider: z.enum([
          "github",
          "supabase",
          "expo",
          "openrouter",
          "notion",
          "google",
          "slack",
          "discord",
          "telegram",
          "zapier",
          "n8n",
          "make",
          "stripe",
          "shopify",
        ]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const credentials = await gatewayKeySystem.getCredentialsByProvider(
          input.provider as CredentialProvider
        );

        const results = await Promise.all(
          credentials.map((cred) => gatewayKeySystem.rotateCredential(cred.id))
        );

        const successful = results.filter((r) => r).length;
        const failed = results.length - successful;

        return {
          success: true,
          message: `Rotated ${successful} credentials, ${failed} failed`,
          successful,
          failed,
          total: results.length,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to bulk rotate credentials: ${error.message}`,
        });
      }
    }),
});
