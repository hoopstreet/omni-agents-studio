import { sqliteTable, text, integer, real, timestamp, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

/**
 * Marketplace Items (Agents, Skills, Prompts, Templates)
 */
export const marketplaceItems = sqliteTable("marketplace_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", { enum: ["agent", "skill", "prompt", "template"] }).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon"), // URL to icon/image
  authorId: integer("author_id").notNull(),
  authorName: text("author_name").notNull(),
  version: text("version").notNull().default("1.0.0"),
  category: text("category").notNull(),
  tags: text("tags"), // JSON array of tags
  content: text("content").notNull(), // JSON content (agent config, skill definition, etc.)
  featured: integer("featured", { mode: "boolean" }).default(false),
  verified: integer("verified", { mode: "boolean" }).default(false),
  downloads: integer("downloads").default(0),
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  isPublic: integer("is_public", { mode: "boolean" }).default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Marketplace Item Reviews and Ratings
 */
export const marketplaceReviews = sqliteTable("marketplace_reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: integer("item_id").notNull(),
  userId: integer("user_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  helpful: integer("helpful").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * User Marketplace Installations/Downloads
 */
export const marketplaceInstallations = sqliteTable("marketplace_installations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: integer("item_id").notNull(),
  userId: integer("user_id").notNull(),
  installedAt: timestamp("installed_at").defaultNow(),
  version: text("version").notNull(),
});

/**
 * Marketplace Collections (Featured, Trending, etc.)
 */
export const marketplaceCollections = sqliteTable("marketplace_collections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type", { enum: ["featured", "trending", "new", "popular", "curated"] }).notNull(),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * Items in Collections (Many-to-Many)
 */
export const collectionItems = sqliteTable(
  "collection_items",
  {
    collectionId: integer("collection_id").notNull(),
    itemId: integer("item_id").notNull(),
    order: integer("order").default(0),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.collectionId, table.itemId] }),
  })
);

/**
 * Marketplace Analytics
 */
export const marketplaceAnalytics = sqliteTable("marketplace_analytics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: integer("item_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  views: integer("views").default(0),
  downloads: integer("downloads").default(0),
  ratings: integer("ratings").default(0),
  avgRating: real("avg_rating").default(0),
});

/**
 * Relations
 */
export const marketplaceItemsRelations = relations(marketplaceItems, ({ many }) => ({
  reviews: many(marketplaceReviews),
  installations: many(marketplaceInstallations),
  analytics: many(marketplaceAnalytics),
  collections: many(collectionItems),
}));

export const marketplaceReviewsRelations = relations(marketplaceReviews, ({ one }) => ({
  item: one(marketplaceItems, {
    fields: [marketplaceReviews.itemId],
    references: [marketplaceItems.id],
  }),
}));

export const marketplaceInstallationsRelations = relations(
  marketplaceInstallations,
  ({ one }) => ({
    item: one(marketplaceItems, {
      fields: [marketplaceInstallations.itemId],
      references: [marketplaceItems.id],
    }),
  })
);

export const collectionItemsRelations = relations(collectionItems, ({ one }) => ({
  collection: one(marketplaceCollections, {
    fields: [collectionItems.collectionId],
    references: [marketplaceCollections.id],
  }),
  item: one(marketplaceItems, {
    fields: [collectionItems.itemId],
    references: [marketplaceItems.id],
  }),
}));

export const marketplaceAnalyticsRelations = relations(marketplaceAnalytics, ({ one }) => ({
  item: one(marketplaceItems, {
    fields: [marketplaceAnalytics.itemId],
    references: [marketplaceItems.id],
  }),
}));
