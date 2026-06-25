import { sqliteTable, text, integer, real, timestamp, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

/**
 * Knowledge Base Documents
 */
export const knowledgeDocuments = sqliteTable("knowledge_documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  workspaceId: integer("workspace_id"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type", { enum: ["pdf", "docx", "txt", "csv", "xlsx", "markdown", "image", "audio", "video", "url", "github", "notion"] }).notNull(),
  fileUrl: text("file_url"),
  mimeType: text("mime_type"),
  size: integer("size"), // in bytes
  category: text("category"),
  tags: text("tags"), // JSON array
  summary: text("summary"), // AI-generated summary
  embedding: text("embedding"), // Vector embedding for semantic search
  version: integer("version").default(1),
  isPublic: integer("is_public", { mode: "boolean" }).default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

/**
 * Document Versions
 */
export const documentVersions = sqliteTable("document_versions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  documentId: integer("document_id").notNull(),
  version: integer("version").notNull(),
  content: text("content").notNull(),
  changes: text("changes"), // JSON diff
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * Document Tags
 */
export const documentTags = sqliteTable(
  "document_tags",
  {
    documentId: integer("document_id").notNull(),
    tag: text("tag").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.documentId, table.tag] }),
  })
);

/**
 * Knowledge Collections
 */
export const knowledgeCollections = sqliteTable("knowledge_collections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  isPublic: integer("is_public", { mode: "boolean" }).default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Collection Items
 */
export const collectionDocuments = sqliteTable(
  "collection_documents",
  {
    collectionId: integer("collection_id").notNull(),
    documentId: integer("document_id").notNull(),
    order: integer("order").default(0),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.collectionId, table.documentId] }),
  })
);

/**
 * Duplicate Detection
 */
export const duplicateDocuments = sqliteTable(
  "duplicate_documents",
  {
    documentId1: integer("document_id_1").notNull(),
    documentId2: integer("document_id_2").notNull(),
    similarity: real("similarity").notNull(), // 0-1 score
    detectedAt: timestamp("detected_at").defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.documentId1, table.documentId2] }),
  })
);

/**
 * OCR Results
 */
export const ocrResults = sqliteTable("ocr_results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  documentId: integer("document_id").notNull(),
  pageNumber: integer("page_number"),
  extractedText: text("extracted_text").notNull(),
  confidence: real("confidence"), // 0-1 confidence score
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * Search Index
 */
export const searchIndex = sqliteTable("search_index", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  documentId: integer("document_id").notNull(),
  term: text("term").notNull(),
  frequency: integer("frequency").default(1),
  position: integer("position"),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * Relations
 */
export const knowledgeDocumentsRelations = relations(knowledgeDocuments, ({ many }) => ({
  versions: many(documentVersions),
  tags: many(documentTags),
  collections: many(collectionDocuments),
  duplicates: many(duplicateDocuments),
  ocrResults: many(ocrResults),
  searchIndex: many(searchIndex),
}));

export const documentVersionsRelations = relations(documentVersions, ({ one }) => ({
  document: one(knowledgeDocuments, {
    fields: [documentVersions.documentId],
    references: [knowledgeDocuments.id],
  }),
}));

export const collectionDocumentsRelations = relations(collectionDocuments, ({ one }) => ({
  collection: one(knowledgeCollections, {
    fields: [collectionDocuments.collectionId],
    references: [knowledgeCollections.id],
  }),
  document: one(knowledgeDocuments, {
    fields: [collectionDocuments.documentId],
    references: [knowledgeDocuments.id],
  }),
}));
