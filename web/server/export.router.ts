import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { chats, messages, tasks } from "../drizzle/schema";

/**
 * Export Router
 * Handles exporting chat history, analytics, and reports as PDF/CSV
 */

export const exportRouter = router({
  /**
   * Export chat history as CSV
   */
  chatHistoryAsCSV: protectedProcedure
    .input(z.object({
      chatId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get chat and messages
      const chatData = await db.select().from(chats).where(eq(chats.id, input.chatId)).limit(1);
      if (!chatData.length) throw new Error("Chat not found");

      const chatMessages = await db.select().from(messages).where(eq(messages.chatId, input.chatId));

      // Generate CSV content
      const headers = ["Timestamp", "Role", "Message"];
      const rows = chatMessages.map(msg => [
        new Date(msg.createdAt).toISOString(),
        msg.role,
        `"${msg.content.replace(/"/g, '""')}"`, // Escape quotes for CSV
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(",")),
      ].join("\n");

      return {
        filename: `chat-${input.chatId}-${Date.now()}.csv`,
        content: csvContent,
        mimeType: "text/csv",
      };
    }),

  /**
   * Export chat history as JSON
   */
  chatHistoryAsJSON: protectedProcedure
    .input(z.object({
      chatId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const chatData = await db.select().from(chats).where(eq(chats.id, input.chatId)).limit(1);
      if (!chatData.length) throw new Error("Chat not found");

      const chatMessages = await db.select().from(messages).where(eq(messages.chatId, input.chatId));

      const exportData = {
        chat: chatData[0],
        messages: chatMessages,
        exportedAt: new Date().toISOString(),
      };

      return {
        filename: `chat-${input.chatId}-${Date.now()}.json`,
        content: JSON.stringify(exportData, null, 2),
        mimeType: "application/json",
      };
    }),

  /**
   * Export analytics report as CSV
   */
  analyticsReportAsCSV: protectedProcedure
    .input(z.object({
      domain: z.string(),
      metrics: z.array(z.string()).optional(),
    }))
    .query(async ({ ctx, input }) => {
      // In a real implementation, this would fetch analytics data
      // For now, return a template CSV structure

      const headers = ["Metric", "Value", "Date"];
      const rows = [
        ["Traffic", "10000", new Date().toISOString()],
        ["Bounce Rate", "35%", new Date().toISOString()],
        ["Avg Session Duration", "2m 30s", new Date().toISOString()],
        ["Pages per Session", "3.5", new Date().toISOString()],
      ];

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(",")),
      ].join("\n");

      return {
        filename: `analytics-${input.domain}-${Date.now()}.csv`,
        content: csvContent,
        mimeType: "text/csv",
      };
    }),

  /**
   * Export task logs as CSV
   */
  taskLogsAsCSV: protectedProcedure
    .input(z.object({
      taskId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get task and logs
      const taskData = await db.select().from(tasks).where(eq(tasks.id, input.taskId)).limit(1);
      if (!taskData.length) throw new Error("Task not found");

      // In a real implementation, fetch task logs from database
      const headers = ["Timestamp", "Level", "Message"];
      const rows = [
        [new Date().toISOString(), "info", "Task started"],
        [new Date().toISOString(), "info", "Processing input"],
        [new Date().toISOString(), "info", "Task completed"],
      ];

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(",")),
      ].join("\n");

      return {
        filename: `task-logs-${input.taskId}-${Date.now()}.csv`,
        content: csvContent,
        mimeType: "text/csv",
      };
    }),

  /**
   * Generate downloadable URL for exported file
   */
  generateDownloadUrl: protectedProcedure
    .input(z.object({
      filename: z.string(),
      content: z.string(),
      mimeType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Create a data URL that can be downloaded
      const dataUrl = `data:${input.mimeType};base64,${Buffer.from(input.content).toString("base64")}`;

      return {
        url: dataUrl,
        filename: input.filename,
        mimeType: input.mimeType,
      };
    }),
});
