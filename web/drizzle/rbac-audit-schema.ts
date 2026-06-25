import { sqliteTable, text, integer, timestamp, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

/**
 * Role-Based Access Control (RBAC) Roles
 */
export const roles = sqliteTable("roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description"),
  permissions: text("permissions"), // JSON array of permission strings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * User Role Assignments
 */
export const userRoles = sqliteTable(
  "user_roles",
  {
    userId: integer("user_id").notNull(),
    roleId: integer("role_id").notNull(),
    workspaceId: integer("workspace_id"), // Optional: role scoped to workspace
    assignedAt: timestamp("assigned_at").defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.roleId, table.workspaceId || 0] }),
  })
);

/**
 * Permissions Registry
 */
export const permissions = sqliteTable("permissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description"),
  category: text("category"), // e.g., "agents", "projects", "admin"
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * Audit Logs - Track all sensitive actions
 */
export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(), // e.g., "CREATE_AGENT", "DELETE_PROJECT", "UPDATE_SETTINGS"
  resourceType: text("resource_type").notNull(), // e.g., "agent", "project", "user"
  resourceId: integer("resource_id"),
  resourceName: text("resource_name"),
  changes: text("changes"), // JSON object with before/after values
  status: text("status", { enum: ["success", "failure"] }).default("success"),
  errorMessage: text("error_message"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
  workspaceId: integer("workspace_id"),
});

/**
 * Sensitive Data Access Log
 */
export const sensitiveAccessLogs = sqliteTable("sensitive_access_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  dataType: text("data_type").notNull(), // e.g., "api_key", "secret", "credential"
  action: text("action").notNull(), // "read", "write", "delete"
  resourceId: integer("resource_id"),
  timestamp: timestamp("timestamp").defaultNow(),
  ipAddress: text("ip_address"),
});

/**
 * Access Control Lists (ACL) for Projects/Workspaces
 */
export const accessControlLists = sqliteTable(
  "access_control_lists",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    resourceType: text("resource_type").notNull(), // "project", "workspace", "agent"
    resourceId: integer("resource_id").notNull(),
    userId: integer("user_id"),
    roleId: integer("role_id"),
    permission: text("permission").notNull(), // "read", "write", "admin", "delete"
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.resourceType, table.resourceId, table.userId || 0, table.roleId || 0] }),
  })
);

/**
 * Relations
 */
export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  roles: many(roles),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one({ ref: () => auditLogs, columns: [auditLogs.userId], references: [auditLogs.userId] }),
}));
