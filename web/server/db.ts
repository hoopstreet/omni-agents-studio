import { eq, and, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  chats,
  messages,
  agents,
  tasks,
  projects,
  knowledgeDocs,
  libraryTemplates,
  scheduledJobs,
  taskLogs,
  pinnedItems,
  type Chat,
  type Message,
  type Agent,
  type Task,
  type Project,
  type KnowledgeDoc,
  type LibraryTemplate,
  type ScheduledJob,
  type TaskLog,
  type PinnedItem,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== Chat queries =====
export async function createChat(data: {
  userId: number;
  title?: string;
  model?: string;
  agentId?: number;
  projectId?: number;
  systemPrompt?: string;
}): Promise<Chat> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(chats).values(data);
  return { id: result[0].insertId as number, ...data } as Chat;
}

export async function getChatsByUserId(userId: number): Promise<Chat[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(chats)
    .where(eq(chats.userId, userId))
    .orderBy(desc(chats.updatedAt));
}

export async function getChatById(chatId: number): Promise<Chat | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(chats)
    .where(eq(chats.id, chatId))
    .limit(1);

  return result[0];
}

// ===== Message queries =====
export async function createMessage(data: {
  chatId: number;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: Record<string, unknown>;
}): Promise<Message> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(messages).values(data);
  return { id: result[0].insertId as number, ...data, createdAt: new Date() } as Message;
}

export async function getMessagesByChatId(chatId: number): Promise<Message[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(asc(messages.createdAt));
}

// ===== Agent queries =====
export async function createAgent(data: {
  userId: number;
  name: string;
  systemPrompt: string;
  model?: string;
  description?: string;
  tools?: unknown;
  category?: string;
  projectId?: number;
}): Promise<Agent> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(agents).values(data);
  return { id: result[0].insertId as number, ...data, status: "idle", isTemplate: false, createdAt: new Date(), updatedAt: new Date() } as Agent;
}

export async function getAgentsByUserId(userId: number): Promise<Agent[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(agents)
    .where(eq(agents.userId, userId))
    .orderBy(desc(agents.createdAt));
}

export async function getAgentById(agentId: number): Promise<Agent | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(agents)
    .where(eq(agents.id, agentId))
    .limit(1);

  return result[0];
}

export async function updateAgentStatus(
  agentId: number,
  status: "idle" | "running" | "paused"
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(agents).set({ status }).where(eq(agents.id, agentId));
}

// ===== Task queries =====
export async function createTask(data: {
  userId: number;
  agentId: number;
  title: string;
  description?: string;
  projectId?: number;
  chatId?: number;
  status?: "pending" | "running" | "completed" | "failed" | "cancelled";
}): Promise<Task> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(tasks).values(data);
  return { id: result[0].insertId as number, ...data, createdAt: new Date(), updatedAt: new Date() } as Task;
}

export async function getTasksByUserId(userId: number): Promise<Task[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(desc(tasks.createdAt));
}

export async function getTaskById(taskId: number): Promise<Task | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);

  return result[0];
}

export async function updateTaskStatus(
  taskId: number,
  status: "pending" | "running" | "completed" | "failed" | "cancelled",
  result?: string,
  error?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const updateData: Record<string, unknown> = { status };
  if (result) updateData.result = result;
  if (error) updateData.error = error;
  if (status === "running") updateData.startedAt = new Date();
  if (status === "completed" || status === "failed") updateData.completedAt = new Date();

  await db.update(tasks).set(updateData).where(eq(tasks.id, taskId));
}

// ===== Task Log queries =====
export async function addTaskLog(
  taskId: number,
  message: string,
  level: "info" | "warning" | "error" | "debug" = "info"
): Promise<TaskLog> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(taskLogs).values({ taskId, message, level });
  return { id: result[0].insertId as number, taskId, message, level, createdAt: new Date() } as TaskLog;
}

export async function getTaskLogsByTaskId(taskId: number): Promise<TaskLog[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(taskLogs)
    .where(eq(taskLogs.taskId, taskId))
    .orderBy(asc(taskLogs.createdAt));
}

// ===== Project queries =====
export async function createProject(data: {
  userId: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}): Promise<Project> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(projects).values(data);
  return { id: result[0].insertId as number, ...data, createdAt: new Date(), updatedAt: new Date() } as Project;
}

export async function getProjectsByUserId(userId: number): Promise<Project[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt));
}

export async function getProjectById(projectId: number): Promise<Project | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  return result[0];
}

// ===== Knowledge Doc queries =====
export async function createKnowledgeDoc(data: {
  userId: number;
  title: string;
  fileType: string;
  fileKey: string;
  fileUrl?: string;
  fileSize?: number;
  summary?: string;
  tags?: string[];
  projectId?: number;
}): Promise<KnowledgeDoc> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(knowledgeDocs).values(data);
  return { id: result[0].insertId as number, ...data, createdAt: new Date(), updatedAt: new Date() } as KnowledgeDoc;
}

export async function getKnowledgeDocsByUserId(userId: number): Promise<KnowledgeDoc[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(knowledgeDocs)
    .where(eq(knowledgeDocs.userId, userId))
    .orderBy(desc(knowledgeDocs.createdAt));
}

export async function deleteKnowledgeDoc(docId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(knowledgeDocs).where(eq(knowledgeDocs.id, docId));
}

// ===== Library Template queries =====
export async function getLibraryTemplates(
  category?: string,
  type?: "agent" | "prompt" | "workflow"
): Promise<LibraryTemplate[]> {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(libraryTemplates);

  if (category && type) {
    query = query.where(
      and(eq(libraryTemplates.category, category), eq(libraryTemplates.type, type))
    ) as any;
  } else if (category) {
    query = query.where(eq(libraryTemplates.category, category)) as any;
  } else if (type) {
    query = query.where(eq(libraryTemplates.type, type)) as any;
  }

  return query.orderBy(desc(libraryTemplates.downloads));
}

// ===== Scheduled Job queries =====
export async function createScheduledJob(data: {
  userId: number;
  agentId: number;
  name: string;
  cronExpression: string;
  description?: string;
  projectId?: number;
  isEnabled?: boolean;
}): Promise<ScheduledJob> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(scheduledJobs).values(data);
  return { id: result[0].insertId as number, ...data, createdAt: new Date(), updatedAt: new Date() } as ScheduledJob;
}

export async function getScheduledJobsByUserId(userId: number): Promise<ScheduledJob[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(scheduledJobs)
    .where(eq(scheduledJobs.userId, userId))
    .orderBy(desc(scheduledJobs.createdAt));
}

export async function getScheduledJobById(jobId: number): Promise<ScheduledJob | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(scheduledJobs)
    .where(eq(scheduledJobs.id, jobId))
    .limit(1);

  return result[0];
}

export async function updateScheduledJob(
  jobId: number,
  data: Partial<ScheduledJob>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(scheduledJobs).set(data).where(eq(scheduledJobs.id, jobId));
}

export async function deleteScheduledJob(jobId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(scheduledJobs).where(eq(scheduledJobs.id, jobId));
}

// ===== Pinned Items queries =====
export async function getPinnedItemsByUserId(userId: number): Promise<PinnedItem[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(pinnedItems)
    .where(eq(pinnedItems.userId, userId))
    .orderBy(asc(pinnedItems.order));
}

export async function addPinnedItem(
  userId: number,
  itemType: "chat" | "agent" | "project",
  itemId: number
): Promise<PinnedItem> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(pinnedItems).values({ userId, itemType, itemId });
  return { id: result[0].insertId as number, userId, itemType, itemId, order: 0, createdAt: new Date() } as PinnedItem;
}

export async function removePinnedItem(itemId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(pinnedItems).where(eq(pinnedItems.id, itemId));
}
