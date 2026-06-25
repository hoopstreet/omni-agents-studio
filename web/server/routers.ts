import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { analyticsRouter } from "./analytics.router";
import { exportRouter } from "./export.router";
import { openrouterRouter } from "./openrouter.router";
import { marketplaceRouter } from "./marketplace.router";
import { rbacRouter } from "./rbac.router";
import { secretsRouter } from "./secrets.router";
import { knowledgeRouter } from "./knowledge.router";
import { agentTestingRouter } from "./agent-testing.router";
import { multiAgentRouter } from "./multi-agent.router";
import { workspaceRouter } from "./workspace.router";
import { automationRouter } from "./automation.router";
import { analyticsAdvancedRouter } from "./analytics.advanced.router";
import { connectorsRouter } from "./connectors.router";
import { omniCommandCenterRouter } from "./omni-command-center.router";
import { omniUltimateRouter } from "./omni-ultimate.router";
import { connectorsManagementRouter } from "./connectors.management.router";
import { gatewayKeyRouter } from "./gateway-key.router";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  openrouter: openrouterRouter,
  marketplace: marketplaceRouter,
  rbac: rbacRouter,
  secrets: secretsRouter,
  gatewayKey: gatewayKeyRouter,
  knowledge: knowledgeRouter,
  agentTesting: agentTestingRouter,
  multiAgent: multiAgentRouter,
  workspace: workspaceRouter,
  automation: automationRouter,
  analyticsAdvanced: analyticsAdvancedRouter,
  connectors: connectorsRouter,
  connectorsManagement: connectorsManagementRouter,
  omniCommandCenter: omniCommandCenterRouter,
  omniUltimate: omniUltimateRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ===== Chat Procedures =====
  chat: router({
    create: protectedProcedure
      .input(
        z.object({
          title: z.string().optional(),
          model: z.string().optional(),
          agentId: z.number().optional(),
          projectId: z.number().optional(),
          systemPrompt: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.createChat({
          userId: ctx.user.id,
          ...input,
        });
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getChatsByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ chatId: z.number() }))
      .query(async ({ input }) => {
        return db.getChatById(input.chatId);
      }),

    sendMessage: protectedProcedure
      .input(
        z.object({
          chatId: z.number(),
          content: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Add user message
        await db.createMessage({
          chatId: input.chatId,
          role: "user",
          content: input.content,
        });

        try {
          // Get chat context (model, system prompt, agent)
          const chat = await db.getChatById(input.chatId);
          if (!chat) throw new Error("Chat not found");

          // Get conversation history for multi-turn support
          const messageHistory = await db.getMessagesByChatId(input.chatId);

          // Build messages array for LLM, including system prompt
          const llmMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];

          // Add system prompt if available
          if (chat.systemPrompt) {
            llmMessages.push({
              role: "system",
              content: chat.systemPrompt,
            });
          }

          // Add conversation history (excluding the current user message which we just added)
          messageHistory.forEach((msg) => {
            if (msg.role === "user" || msg.role === "assistant") {
              llmMessages.push({
                role: msg.role,
                content: msg.content,
              });
            }
          });

          // Call real LLM with multi-turn context
          const { invokeLLM } = await import("./_core/llm");
          const llmResponse = await invokeLLM({
            model: chat.model || "auto",
            messages: llmMessages,
            maxTokens: 2048,
          });

          // Extract response content
          const responseContent =
            llmResponse.choices[0]?.message?.content || "No response generated";
          const responseText =
            typeof responseContent === "string"
              ? responseContent
              : JSON.stringify(responseContent);

          // Save assistant message to database
          const assistantMessage = await db.createMessage({
            chatId: input.chatId,
            role: "assistant",
            content: responseText,
            metadata: {
              model: llmResponse.model,
              usage: llmResponse.usage,
            },
          });

          return assistantMessage;
        } catch (error) {
          console.error("Error in chat.sendMessage:", error);
          // Save error message to database
          const errorMessage = await db.createMessage({
            chatId: input.chatId,
            role: "assistant",
            content: `I encountered an error processing your request: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
            metadata: { error: true },
          });
          throw error;
        }
      }),

    getMessages: protectedProcedure
      .input(z.object({ chatId: z.number() }))
      .query(async ({ input }) => {
        return db.getMessagesByChatId(input.chatId);
      }),
  }),

  // ===== Agent Procedures =====
  agents: router({
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          systemPrompt: z.string(),
          model: z.string().optional(),
          description: z.string().optional(),
          tools: z.unknown().optional(),
          category: z.string().optional(),
          projectId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.createAgent({
          userId: ctx.user.id,
          ...input,
        });
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getAgentsByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ agentId: z.number() }))
      .query(async ({ input }) => {
        return db.getAgentById(input.agentId);
      }),

    run: protectedProcedure
      .input(z.object({ agentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Update agent status to running
        await db.updateAgentStatus(input.agentId, "running");

        // Create a task for this agent execution
        const task = await db.createTask({
          userId: ctx.user.id,
          agentId: input.agentId,
          title: `Agent execution`,
          status: "running",
        });

        return task;
      }),
  }),

  // ===== Task Procedures =====
  tasks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getTasksByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .query(async ({ input }) => {
        return db.getTaskById(input.taskId);
      }),

    getLogs: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .query(async ({ input }) => {
        return db.getTaskLogsByTaskId(input.taskId);
      }),

    addLog: protectedProcedure
      .input(
        z.object({
          taskId: z.number(),
          message: z.string(),
          level: z.enum(["info", "warning", "error", "debug"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.addTaskLog(input.taskId, input.message, input.level);
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          taskId: z.number(),
          status: z.enum(["pending", "running", "completed", "failed", "cancelled"]),
          result: z.string().optional(),
          error: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateTaskStatus(
          input.taskId,
          input.status,
          input.result,
          input.error
        );
        return { success: true };
      }),
  }),

  // ===== Project Procedures =====
  projects: router({
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          icon: z.string().optional(),
          color: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.createProject({
          userId: ctx.user.id,
          ...input,
        });
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getProjectsByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return db.getProjectById(input.projectId);
      }),
  }),

  // ===== Knowledge Procedures (merged with knowledgeRouter) =====

  // ===== Library Procedures =====
  library: router({
    getTemplates: publicProcedure
      .input(
        z.object({
          category: z.string().optional(),
          type: z.enum(["agent", "prompt", "workflow"]).optional(),
        })
      )
      .query(async ({ input }) => {
        return db.getLibraryTemplates(input.category, input.type);
      }),
  }),

  // ===== Scheduled Job Procedures =====
  scheduled: router({
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          agentId: z.number(),
          cronExpression: z.string(),
          description: z.string().optional(),
          projectId: z.number().optional(),
          isEnabled: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.createScheduledJob({
          userId: ctx.user.id,
          ...input,
        });
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getScheduledJobsByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ input }) => {
        return db.getScheduledJobById(input.jobId);
      }),

    update: protectedProcedure
      .input(
        z.object({
          jobId: z.number(),
          isEnabled: z.boolean().optional(),
          name: z.string().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { jobId, ...updateData } = input;
        await db.updateScheduledJob(jobId, updateData);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteScheduledJob(input.jobId);
        return { success: true };
      }),
  }),

    // ===== Pinned Items Procedures =====
  pinned: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getPinnedItemsByUserId(ctx.user.id);
    }),
    add: protectedProcedure
      .input(
        z.object({
          itemType: z.enum(["chat", "agent", "project"]),
          itemId: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.addPinnedItem(ctx.user.id, input.itemType, input.itemId);
      }),
    remove: protectedProcedure
      .input(z.object({ itemId: z.number() }))
      .mutation(async ({ input }) => {
        await db.removePinnedItem(input.itemId);
        return { success: true };
      }),
  }),
  // ===== Analytics Procedures =====
  analytics: analyticsRouter,
  // ===== Export Procedures =====
  export: exportRouter,
});

export type AppRouter = typeof appRouter;
