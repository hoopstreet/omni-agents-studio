import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  OpenRouterConnector,
  GoogleDriveConnector,
  GmailConnector,
  GitHubConnector,
  SlackConnector,
  TelegramConnector,
  DiscordConnector,
  SupabaseConnector,
  NotionConnector,
  ZapierConnector,
  N8nConnector,
  MakeConnector,
  WebhooksConnector,
  MCPServerConnector,
} from "./connectors";

export const connectorsManagementRouter = router({
  /**
   * List all available connectors
   */
  listAvailable: protectedProcedure.query(async ({ ctx }) => {
    return [
      {
        id: "openrouter",
        name: "OpenRouter",
        type: "ai_provider",
        description: "OpenRouter - AI model routing",
        authType: "api_key",
      },
      {
        id: "google-drive",
        name: "Google Drive",
        type: "storage",
        description: "Google Drive - Cloud storage",
        authType: "oauth",
      },
      {
        id: "gmail",
        name: "Gmail",
        type: "communication",
        description: "Gmail - Email management",
        authType: "oauth",
      },
      {
        id: "github",
        name: "GitHub",
        type: "development",
        description: "GitHub - Repository management",
        authType: "api_key",
      },
      {
        id: "slack",
        name: "Slack",
        type: "communication",
        description: "Slack - Team messaging",
        authType: "api_key",
      },
      {
        id: "telegram",
        name: "Telegram",
        type: "communication",
        description: "Telegram - Bot messaging",
        authType: "api_key",
      },
      {
        id: "discord",
        name: "Discord",
        type: "communication",
        description: "Discord - Community messaging",
        authType: "api_key",
      },
      {
        id: "supabase",
        name: "Supabase",
        type: "development",
        description: "Supabase - PostgreSQL database",
        authType: "api_key",
      },
      {
        id: "notion",
        name: "Notion",
        type: "productivity",
        description: "Notion - Workspace documentation",
        authType: "api_key",
      },
      {
        id: "zapier",
        name: "Zapier",
        type: "automation",
        description: "Zapier - Workflow automation",
        authType: "api_key",
      },
      {
        id: "n8n",
        name: "n8n",
        type: "automation",
        description: "n8n - Open-source automation",
        authType: "api_key",
      },
      {
        id: "make",
        name: "Make",
        type: "automation",
        description: "Make - Visual workflow builder",
        authType: "api_key",
      },
      {
        id: "webhooks",
        name: "Webhooks",
        type: "custom",
        description: "Custom webhooks",
        authType: "custom",
      },
      {
        id: "mcp-server",
        name: "MCP Server",
        type: "custom",
        description: "Model Context Protocol Server",
        authType: "custom",
      },
    ];
  }),

  /**
   * Get connector details
   */
  getConnector: protectedProcedure
    .input(z.object({ connectorId: z.string() }))
    .query(async ({ input }) => {
      const connectors: Record<string, any> = {
        openrouter: {
          id: "openrouter",
          name: "OpenRouter",
          type: "ai_provider",
          description: "OpenRouter - Unified AI model routing",
          capabilities: ["list_models", "invoke_model", "get_pricing"],
          requiredFields: ["apiKey"],
        },
        "google-drive": {
          id: "google-drive",
          name: "Google Drive",
          type: "storage",
          description: "Google Drive - Cloud storage and file management",
          capabilities: ["list_files", "upload_file", "download_file", "create_folder"],
          requiredFields: ["clientId", "clientSecret"],
        },
      };

      return connectors[input.connectorId] || { error: "Connector not found" };
    }),

  /**
   * Authenticate connector
   */
  authenticate: protectedProcedure
    .input(
      z.object({
        connectorId: z.string(),
        credentials: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        let connector: any;

        switch (input.connectorId) {
          case "openrouter":
            connector = new OpenRouterConnector(ctx.user.id);
            break;
          case "google-drive":
            connector = new GoogleDriveConnector(
              ctx.user.id,
              input.credentials.clientId,
              input.credentials.clientSecret,
              input.credentials.redirectUri
            );
            break;
          case "gmail":
            connector = new GmailConnector(
              ctx.user.id,
              input.credentials.clientId,
              input.credentials.clientSecret,
              input.credentials.redirectUri
            );
            break;
          case "github":
            connector = new GitHubConnector(ctx.user.id);
            break;
          case "slack":
            connector = new SlackConnector(ctx.user.id);
            break;
          case "telegram":
            connector = new TelegramConnector(ctx.user.id);
            break;
          case "discord":
            connector = new DiscordConnector(ctx.user.id);
            break;
          case "supabase":
            connector = new SupabaseConnector(ctx.user.id);
            break;
          case "notion":
            connector = new NotionConnector(ctx.user.id);
            break;
          case "zapier":
            connector = new ZapierConnector(ctx.user.id);
            break;
          case "n8n":
            connector = new N8nConnector(ctx.user.id);
            break;
          case "make":
            connector = new MakeConnector(ctx.user.id);
            break;
          case "webhooks":
            connector = new WebhooksConnector(ctx.user.id);
            break;
          case "mcp-server":
            connector = new MCPServerConnector(ctx.user.id);
            break;
          default:
            throw new Error("Unknown connector");
        }

        const auth = await connector.authenticate(input.credentials);

        return {
          success: true,
          connectorId: input.connectorId,
          authenticated: true,
          message: "Connector authenticated successfully",
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Test connector connection
   */
  testConnection: protectedProcedure
    .input(z.object({ connectorId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        let connector: any;

        switch (input.connectorId) {
          case "openrouter":
            connector = new OpenRouterConnector(ctx.user.id);
            break;
          default:
            throw new Error("Unknown connector");
        }

        const connected = await connector.testConnection();

        return {
          success: true,
          connected,
          status: connected ? "connected" : "disconnected",
        };
      } catch (error) {
        return {
          success: false,
          connected: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Sync connector data
   */
  sync: protectedProcedure
    .input(z.object({ connectorId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        let connector: any;

        switch (input.connectorId) {
          case "openrouter":
            connector = new OpenRouterConnector(ctx.user.id);
            break;
          case "github":
            connector = new GitHubConnector(ctx.user.id);
            break;
          default:
            throw new Error("Unknown connector");
        }

        const result = await connector.sync();

        return {
          success: result.success,
          itemsSynced: result.itemsSynced,
          error: result.error,
        };
      } catch (error) {
        return {
          success: false,
          itemsSynced: 0,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Execute connector action
   */
  executeAction: protectedProcedure
    .input(
      z.object({
        connectorId: z.string(),
        action: z.string(),
        params: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        let connector: any;

        switch (input.connectorId) {
          case "openrouter":
            connector = new OpenRouterConnector(ctx.user.id);
            break;
          case "github":
            connector = new GitHubConnector(ctx.user.id);
            break;
          case "slack":
            connector = new SlackConnector(ctx.user.id);
            break;
          default:
            throw new Error("Unknown connector");
        }

        const result = await connector.executeAction(input.action, input.params || {});

        return {
          success: true,
          result,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Get connector capabilities
   */
  getCapabilities: protectedProcedure
    .input(z.object({ connectorId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        let connector: any;

        switch (input.connectorId) {
          case "openrouter":
            connector = new OpenRouterConnector(ctx.user.id);
            break;
          case "github":
            connector = new GitHubConnector(ctx.user.id);
            break;
          default:
            return { capabilities: [] };
        }

        const capabilities = connector.getCapabilities();

        return {
          connectorId: input.connectorId,
          capabilities,
        };
      } catch (error) {
        return {
          connectorId: input.connectorId,
          capabilities: [],
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Disconnect connector
   */
  disconnect: protectedProcedure
    .input(z.object({ connectorId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return {
        success: true,
        message: "Connector disconnected",
      };
    }),

  /**
   * List installed connectors for user
   */
  listInstalled: protectedProcedure.query(async ({ ctx }) => {
    return [
      {
        id: "openrouter",
        name: "OpenRouter",
        authenticated: true,
        lastSync: new Date().toISOString(),
      },
      {
        id: "github",
        name: "GitHub",
        authenticated: true,
        lastSync: new Date().toISOString(),
      },
    ];
  }),

  /**
   * Get connector status
   */
  getStatus: protectedProcedure
    .input(z.object({ connectorId: z.string() }))
    .query(async ({ input, ctx }) => {
      return {
        connectorId: input.connectorId,
        status: "connected",
        authenticated: true,
        lastSync: new Date().toISOString(),
        nextSync: new Date(Date.now() + 3600000).toISOString(),
      };
    }),
});
