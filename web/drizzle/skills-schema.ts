import { int, text, timestamp, varchar, boolean, json, mysqlTable, mysqlEnum } from "drizzle-orm/mysql-core";

/**
 * Bundle 1: Reusable Skills System
 * Skill Creator, Registry, Templates, Versioning, Marketplace
 */

// Skills Registry - Core skill definitions
export const skills = mysqlTable("skills", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(), // "agent", "workflow", "integration", "tool"
  version: varchar("version", { length: 50 }).default("1.0.0").notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  authorId: int("authorId").notNull(),
  
  // Skill configuration
  systemPrompt: text("systemPrompt"),
  inputSchema: json("inputSchema"), // JSON schema for inputs
  outputSchema: json("outputSchema"), // JSON schema for outputs
  parameters: json("parameters"), // Configurable parameters
  
  // Marketplace metadata
  isPublic: boolean("isPublic").default(false),
  isVerified: boolean("isVerified").default(false),
  rating: int("rating").default(0), // 0-5 stars
  ratingCount: int("ratingCount").default(0),
  downloadCount: int("downloadCount").default(0),
  
  // Status
  status: mysqlEnum("status", ["draft", "published", "archived", "deprecated"]).default("draft"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  publishedAt: timestamp("publishedAt"),
});

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = typeof skills.$inferInsert;

// Skill Versions - Track version history
export const skillVersions = mysqlTable("skillVersions", {
  id: int("id").autoincrement().primaryKey(),
  skillId: int("skillId").notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  
  // Version data
  systemPrompt: text("systemPrompt"),
  inputSchema: json("inputSchema"),
  outputSchema: json("outputSchema"),
  parameters: json("parameters"),
  
  // Changelog
  changelog: text("changelog"),
  
  // Status
  status: mysqlEnum("status", ["draft", "released", "deprecated"]).default("draft"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  releasedAt: timestamp("releasedAt"),
});

export type SkillVersion = typeof skillVersions.$inferSelect;
export type InsertSkillVersion = typeof skillVersions.$inferInsert;

// Skill Templates - Pre-built skill templates
export const skillTemplates = mysqlTable("skillTemplates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  
  // Template configuration
  baseSkillId: int("baseSkillId"),
  templateData: json("templateData"), // Template structure
  defaultParameters: json("defaultParameters"),
  
  // Metadata
  tags: json("tags"), // Array of tags
  icon: varchar("icon", { length: 255 }),
  
  // Status
  isActive: boolean("isActive").default(true),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SkillTemplate = typeof skillTemplates.$inferSelect;
export type InsertSkillTemplate = typeof skillTemplates.$inferInsert;

// Skill Marketplace - Marketplace listings
export const skillMarketplace = mysqlTable("skillMarketplace", {
  id: int("id").autoincrement().primaryKey(),
  skillId: int("skillId").notNull(),
  
  // Marketplace metadata
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  longDescription: text("longDescription"),
  
  // Pricing (if applicable)
  isPaid: boolean("isPaid").default(false),
  price: int("price"), // In cents
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Ratings and reviews
  averageRating: int("averageRating").default(0),
  totalReviews: int("totalReviews").default(0),
  
  // Featured status
  isFeatured: boolean("isFeatured").default(false),
  featuredUntil: timestamp("featuredUntil"),
  
  // Visibility
  isVisible: boolean("isVisible").default(true),
  
  // Timestamps
  listedAt: timestamp("listedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SkillMarketplace = typeof skillMarketplace.$inferSelect;
export type InsertSkillMarketplace = typeof skillMarketplace.$inferInsert;

// Skill Installations - Track installed skills
export const skillInstallations = mysqlTable("skillInstallations", {
  id: int("id").autoincrement().primaryKey(),
  skillId: int("skillId").notNull(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  
  // Installation details
  version: varchar("version", { length: 50 }).notNull(),
  configuration: json("configuration"), // User-specific configuration
  
  // Status
  isActive: boolean("isActive").default(true),
  
  // Timestamps
  installedAt: timestamp("installedAt").defaultNow().notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SkillInstallation = typeof skillInstallations.$inferSelect;
export type InsertSkillInstallation = typeof skillInstallations.$inferInsert;

// Skill Ratings - User ratings and reviews
export const skillRatings = mysqlTable("skillRatings", {
  id: int("id").autoincrement().primaryKey(),
  skillId: int("skillId").notNull(),
  userId: int("userId").notNull(),
  
  // Rating data
  rating: int("rating").notNull(), // 1-5
  review: text("review"),
  
  // Metadata
  isVerifiedPurchase: boolean("isVerifiedPurchase").default(false),
  helpfulCount: int("helpfulCount").default(0),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SkillRating = typeof skillRatings.$inferSelect;
export type InsertSkillRating = typeof skillRatings.$inferInsert;

// Skill Dependencies - Track skill dependencies
export const skillDependencies = mysqlTable("skillDependencies", {
  id: int("id").autoincrement().primaryKey(),
  skillId: int("skillId").notNull(),
  dependencySkillId: int("dependencySkillId").notNull(),
  
  // Dependency version requirement
  minVersion: varchar("minVersion", { length: 50 }),
  maxVersion: varchar("maxVersion", { length: 50 }),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SkillDependency = typeof skillDependencies.$inferSelect;
export type InsertSkillDependency = typeof skillDependencies.$inferInsert;

// Skill Usage Analytics - Track skill usage
export const skillUsageAnalytics = mysqlTable("skillUsageAnalytics", {
  id: int("id").autoincrement().primaryKey(),
  skillId: int("skillId").notNull(),
  userId: int("userId").notNull(),
  
  // Usage data
  executionCount: int("executionCount").default(0),
  successCount: int("successCount").default(0),
  failureCount: int("failureCount").default(0),
  averageExecutionTime: int("averageExecutionTime"), // milliseconds
  
  // Cost tracking
  totalTokensUsed: int("totalTokensUsed").default(0),
  estimatedCost: int("estimatedCost"), // in cents
  
  // Period
  period: varchar("period", { length: 20 }).default("daily"), // daily, weekly, monthly
  
  // Timestamps
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SkillUsageAnalytics = typeof skillUsageAnalytics.$inferSelect;
export type InsertSkillUsageAnalytics = typeof skillUsageAnalytics.$inferInsert;
