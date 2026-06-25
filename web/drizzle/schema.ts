import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, bigint, primaryKey } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Projects table
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 7 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// Chats table
export const chats = mysqlTable("chats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  title: varchar("title", { length: 255 }),
  agentId: int("agentId"),
  model: varchar("model", { length: 100 }).default("auto"),
  systemPrompt: text("systemPrompt"),
  isPinned: boolean("isPinned").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Chat = typeof chats.$inferSelect;
export type InsertChat = typeof chats.$inferInsert;

// Messages table
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  chatId: int("chatId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Agents table
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  systemPrompt: text("systemPrompt").notNull(),
  model: varchar("model", { length: 100 }).default("auto"),
  tools: json("tools"),
  category: varchar("category", { length: 50 }),
  isTemplate: boolean("isTemplate").default(false),
  status: mysqlEnum("status", ["idle", "running", "paused"]).default("idle"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

// Tasks table
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  agentId: int("agentId").notNull(),
  projectId: int("projectId"),
  chatId: int("chatId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed", "cancelled"]).default("pending"),
  result: text("result"),
  error: text("error"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// Task logs table
export const taskLogs = mysqlTable("taskLogs", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  level: mysqlEnum("level", ["info", "warning", "error", "debug"]).default("info"),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TaskLog = typeof taskLogs.$inferSelect;
export type InsertTaskLog = typeof taskLogs.$inferInsert;

// Knowledge documents table
export const knowledgeDocs = mysqlTable("knowledgeDocs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  title: varchar("title", { length: 255 }).notNull(),
  fileType: varchar("fileType", { length: 50 }).notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull(),
  fileUrl: text("fileUrl"),
  fileSize: bigint("fileSize", { mode: "number" }),
  summary: text("summary"),
  tags: json("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KnowledgeDoc = typeof knowledgeDocs.$inferSelect;
export type InsertKnowledgeDoc = typeof knowledgeDocs.$inferInsert;

// Library templates table
export const libraryTemplates = mysqlTable("libraryTemplates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  type: mysqlEnum("type", ["agent", "prompt", "workflow"]).notNull(),
  content: json("content").notNull(),
  icon: varchar("icon", { length: 50 }),
  downloads: int("downloads").default(0),
  rating: int("rating").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LibraryTemplate = typeof libraryTemplates.$inferSelect;
export type InsertLibraryTemplate = typeof libraryTemplates.$inferInsert;

// Scheduled jobs table
export const scheduledJobs = mysqlTable("scheduledJobs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  agentId: int("agentId").notNull(),
  projectId: int("projectId"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  cronExpression: varchar("cronExpression", { length: 100 }).notNull(),
  isEnabled: boolean("isEnabled").default(true),
  lastRunAt: timestamp("lastRunAt"),
  nextRunAt: timestamp("nextRunAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScheduledJob = typeof scheduledJobs.$inferSelect;
export type InsertScheduledJob = typeof scheduledJobs.$inferInsert;

// Pinned items table
export const pinnedItems = mysqlTable("pinnedItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  itemType: mysqlEnum("itemType", ["chat", "agent", "project"]).notNull(),
  itemId: int("itemId").notNull(),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PinnedItem = typeof pinnedItems.$inferSelect;
export type InsertPinnedItem = typeof pinnedItems.$inferInsert;


// ===== PHASE 11: Advanced Knowledge Base Intelligence =====

export const knowledgeTags = mysqlTable("knowledgeTags", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tag: varchar("tag", { length: 100 }).notNull(),
  color: varchar("color", { length: 7 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type KnowledgeTag = typeof knowledgeTags.$inferSelect;
export type InsertKnowledgeTag = typeof knowledgeTags.$inferInsert;

export const documentTags = mysqlTable("documentTags", {
  documentId: int("documentId").notNull(),
  tagId: int("tagId").notNull(),
});

export const documentVersions = mysqlTable("documentVersions", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull(),
  version: int("version").notNull(),
  content: text("content"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
});

export type DocumentVersion = typeof documentVersions.$inferSelect;
export type InsertDocumentVersion = typeof documentVersions.$inferInsert;

export const documentSummaries = mysqlTable("documentSummaries", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull().unique(),
  summary: text("summary"),
  keywords: text("keywords"),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
});

export type DocumentSummary = typeof documentSummaries.$inferSelect;
export type InsertDocumentSummary = typeof documentSummaries.$inferInsert;

// ===== PHASE 12: Agent Testing Laboratory =====

export const agentTests = mysqlTable("agentTests", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  testName: varchar("testName", { length: 255 }).notNull(),
  testPrompt: text("testPrompt").notNull(),
  expectedOutput: text("expectedOutput"),
  actualOutput: text("actualOutput"),
  costEstimate: varchar("costEstimate", { length: 20 }),
  latency: int("latency"),
  qualityScore: varchar("qualityScore", { length: 10 }),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentTest = typeof agentTests.$inferSelect;
export type InsertAgentTest = typeof agentTests.$inferInsert;

export const agentVersions = mysqlTable("agentVersions", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  version: int("version").notNull(),
  config: json("config"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentVersion = typeof agentVersions.$inferSelect;
export type InsertAgentVersion = typeof agentVersions.$inferInsert;

// ===== PHASE 13: Multi-Agent Orchestration System =====

export const agentTeams = mysqlTable("agentTeams", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  supervisorAgentId: int("supervisorAgentId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentTeam = typeof agentTeams.$inferSelect;
export type InsertAgentTeam = typeof agentTeams.$inferInsert;

export const agentTeamMembers = mysqlTable("agentTeamMembers", {
  teamId: int("teamId").notNull(),
  agentId: int("agentId").notNull(),
  role: mysqlEnum("role", ["supervisor", "worker"]).default("worker"),
});

export const workflows = mysqlTable("workflows", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  definition: json("definition"),
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = typeof workflows.$inferInsert;

// ===== PHASE 14: Professional Workspace System =====

export const workspaces = mysqlTable("workspaces", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  settings: json("settings"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = typeof workspaces.$inferInsert;

export const workspaceMembers = mysqlTable("workspaceMembers", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["admin", "editor", "viewer"]).default("viewer"),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type InsertWorkspaceMember = typeof workspaceMembers.$inferInsert;

export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 255 }),
  resourceType: varchar("resourceType", { length: 100 }),
  resourceId: int("resourceId"),
  changes: json("changes"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ===== PHASE 15: AI Marketplace =====

export const marketplaceItems = mysqlTable("marketplaceItems", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["agent", "skill", "prompt", "template"]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  author: int("author"),
  rating: varchar("rating", { length: 10 }),
  downloads: int("downloads").default(0),
  verified: boolean("verified").default(false),
  featured: boolean("featured").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MarketplaceItem = typeof marketplaceItems.$inferSelect;
export type InsertMarketplaceItem = typeof marketplaceItems.$inferInsert;

export const marketplaceRatings = mysqlTable("marketplaceRatings", {
  id: int("id").autoincrement().primaryKey(),
  itemId: int("itemId").notNull(),
  userId: int("userId").notNull(),
  rating: int("rating"),
  review: text("review"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MarketplaceRating = typeof marketplaceRatings.$inferSelect;
export type InsertMarketplaceRating = typeof marketplaceRatings.$inferInsert;

// ===== PHASE 16: Automation & Scheduling Engine =====

export const automationWorkflows = mysqlTable("automationWorkflows", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  trigger: varchar("trigger", { length: 100 }),
  triggerConfig: json("triggerConfig"),
  actions: json("actions"),
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AutomationWorkflow = typeof automationWorkflows.$inferSelect;
export type InsertAutomationWorkflow = typeof automationWorkflows.$inferInsert;

export const automationExecutions = mysqlTable("automationExecutions", {
  id: int("id").autoincrement().primaryKey(),
  workflowId: int("workflowId").notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending"),
  result: json("result"),
  executedAt: timestamp("executedAt").defaultNow().notNull(),
});

export type AutomationExecution = typeof automationExecutions.$inferSelect;
export type InsertAutomationExecution = typeof automationExecutions.$inferInsert;

// ===== PHASE 17: Enterprise Analytics Center =====

export const analyticsEvents = mysqlTable("analyticsEvents", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  eventType: varchar("eventType", { length: 100 }),
  userId: int("userId"),
  agentId: int("agentId"),
  metadata: json("metadata"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

export const analyticsReports = mysqlTable("analyticsReports", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  name: varchar("name", { length: 255 }),
  type: varchar("type", { length: 100 }),
  config: json("config"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsReport = typeof analyticsReports.$inferSelect;
export type InsertAnalyticsReport = typeof analyticsReports.$inferInsert;

// ===== PHASE 18: Connector Ecosystem =====

export const connectors = mysqlTable("connectors", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  type: varchar("type", { length: 100 }),
  name: varchar("name", { length: 255 }),
  config: json("config"),
  credentials: json("credentials"),
  status: mysqlEnum("status", ["connected", "disconnected", "error"]).default("disconnected"),
  lastSync: timestamp("lastSync"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Connector = typeof connectors.$inferSelect;
export type InsertConnector = typeof connectors.$inferInsert;

export const connectorSyncs = mysqlTable("connectorSyncs", {
  id: int("id").autoincrement().primaryKey(),
  connectorId: int("connectorId").notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending"),
  itemsProcessed: int("itemsProcessed"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
});

export type ConnectorSync = typeof connectorSyncs.$inferSelect;
export type InsertConnectorSync = typeof connectorSyncs.$inferInsert;

// ===== PHASE 19: Omni AI Command Center =====

export const modelRoutingConfig = mysqlTable("modelRoutingConfig", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  taskType: varchar("taskType", { length: 100 }),
  preferredModel: varchar("preferredModel", { length: 100 }),
  fallbackModels: json("fallbackModels"),
  costLimit: varchar("costLimit", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ModelRoutingConfig = typeof modelRoutingConfig.$inferSelect;
export type InsertModelRoutingConfig = typeof modelRoutingConfig.$inferInsert;

export const modelBenchmarks = mysqlTable("modelBenchmarks", {
  id: int("id").autoincrement().primaryKey(),
  model: varchar("model", { length: 100 }),
  taskType: varchar("taskType", { length: 100 }),
  avgLatency: int("avgLatency"),
  avgCost: varchar("avgCost", { length: 20 }),
  qualityScore: varchar("qualityScore", { length: 10 }),
  lastUpdated: timestamp("lastUpdated").defaultNow().notNull(),
});

export type ModelBenchmark = typeof modelBenchmarks.$inferSelect;
export type InsertModelBenchmark = typeof modelBenchmarks.$inferInsert;

// ===== PHASE 20: Omni-Agents Studio 3.0 Ultimate System =====

export const memoryStore = mysqlTable("memoryStore", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["user", "agent", "workspace"]),
  entityId: int("entityId"),
  key: varchar("key", { length: 255 }),
  value: text("value"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MemoryStoreEntry = typeof memoryStore.$inferSelect;
export type InsertMemoryStoreEntry = typeof memoryStore.$inferInsert;

export const knowledgeGraph = mysqlTable("knowledgeGraph", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  source: varchar("source", { length: 255 }),
  target: varchar("target", { length: 255 }),
  relationship: varchar("relationship", { length: 100 }),
  weight: varchar("weight", { length: 10 }),
});

export type KnowledgeGraphEntry = typeof knowledgeGraph.$inferSelect;
export type InsertKnowledgeGraphEntry = typeof knowledgeGraph.$inferInsert;

export const apiKeys = mysqlTable("apiKeys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }),
  key: varchar("key", { length: 255 }).notNull().unique(),
  permissions: json("permissions"),
  lastUsed: timestamp("lastUsed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;
