import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { skills, skillVersions, skillMarketplace, skillInstallations, skillRatings } from "../drizzle/skills-schema";
import { eq, desc, and } from "drizzle-orm";

export const skillsRouter = router({
  // Create new skill
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        category: z.enum(["agent", "workflow", "integration", "tool"]),
        systemPrompt: z.string().optional(),
        inputSchema: z.record(z.string(), z.any()).optional(),
        outputSchema: z.record(z.string(), z.any()).optional(),
        parameters: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db
        .insert(skills)
        .values({
          name: input.name,
          description: input.description,
          category: input.category,
          version: "1.0.0",
          author: ctx.user.name || "Unknown",
          authorId: ctx.user.id,
          systemPrompt: input.systemPrompt,
          inputSchema: input.inputSchema,
          outputSchema: input.outputSchema,
          parameters: input.parameters,
          status: "draft",
        })
        .execute();

      return { id: result[0].insertId, version: "1.0.0" };
    }),

  // Get skill by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const skill = await db
        .select()
        .from(skills)
        .where(eq(skills.id, input.id))
        .limit(1)
        .execute();

      return skill.length > 0 ? skill[0] : null;
    }),

  // List skills with filtering
  list: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        isPublic: z.boolean().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let conditions = [];

      if (input.category) {
        conditions.push(eq(skills.category, input.category));
      }

      if (input.isPublic !== undefined) {
        conditions.push(eq(skills.isPublic, input.isPublic));
      }

      if (input.search) {
        conditions.push(eq(skills.name, input.search));
      }

      const whereClause = conditions.length > 0 ? and(conditions[0], ...conditions.slice(1)) : undefined;

      const result = await db
        .select()
        .from(skills)
        .where(whereClause)
        .orderBy(desc(skills.createdAt))
        .limit(input.limit)
        .offset(input.offset)
        .execute();

      return result;
    }),

  // Publish skill to marketplace
  publish: protectedProcedure
    .input(
      z.object({
        skillId: z.number(),
        title: z.string(),
        description: z.string(),
        isPaid: z.boolean().optional(),
        price: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const skill = await db
        .select()
        .from(skills)
        .where(and(eq(skills.id, input.skillId), eq(skills.authorId, ctx.user.id)))
        .limit(1)
        .execute();

      if (skill.length === 0) throw new Error("Skill not found or unauthorized");

      // Update skill status
      await db
        .update(skills)
        .set({ status: "published", isPublic: true, publishedAt: new Date() })
        .where(eq(skills.id, input.skillId))
        .execute();

      // Create marketplace listing
      const result = await db
        .insert(skillMarketplace)
        .values({
          skillId: input.skillId,
          title: input.title,
          description: input.description,
          isPaid: input.isPaid || false,
          price: input.price,
          isVisible: true,
        })
        .execute();

      return { success: true, listingId: result[0].insertId };
    }),

  // Install skill
  install: protectedProcedure
    .input(
      z.object({
        skillId: z.number(),
        projectId: z.number().optional(),
        configuration: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const skill = await db
        .select()
        .from(skills)
        .where(eq(skills.id, input.skillId))
        .limit(1)
        .execute();

      if (skill.length === 0) throw new Error("Skill not found");

      const result = await db
        .insert(skillInstallations)
        .values({
          skillId: input.skillId,
          userId: ctx.user.id,
          projectId: input.projectId,
          version: skill[0].version,
          configuration: input.configuration,
          isActive: true,
        })
        .execute();

      return { success: true, installationId: result[0].insertId };
    }),

  // Rate skill
  rate: protectedProcedure
    .input(
      z.object({
        skillId: z.number(),
        rating: z.number().min(1).max(5),
        review: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db
        .insert(skillRatings)
        .values({
          skillId: input.skillId,
          userId: ctx.user.id,
          rating: input.rating,
          review: input.review,
        })
        .execute();

      return { success: true, ratingId: result[0].insertId };
    }),

  // Get marketplace listings
  marketplace: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        sortBy: z.enum(["rating", "downloads", "newest"]).default("rating"),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db
        .select()
        .from(skillMarketplace)
        .where(eq(skillMarketplace.isVisible, true))
        .orderBy(desc(skillMarketplace.isFeatured))
        .limit(input.limit)
        .offset(input.offset)
        .execute();

      return result;
    }),

  // Create skill version
  createVersion: protectedProcedure
    .input(
      z.object({
        skillId: z.number(),
        version: z.string(),
        systemPrompt: z.string().optional(),
        inputSchema: z.record(z.string(), z.any()).optional(),
        outputSchema: z.record(z.string(), z.any()).optional(),
        parameters: z.record(z.string(), z.any()).optional(),
        changelog: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const skill = await db
        .select()
        .from(skills)
        .where(and(eq(skills.id, input.skillId), eq(skills.authorId, ctx.user.id)))
        .limit(1)
        .execute();

      if (skill.length === 0) throw new Error("Skill not found or unauthorized");

      const result = await db
        .insert(skillVersions)
        .values({
          skillId: input.skillId,
          version: input.version,
          systemPrompt: input.systemPrompt,
          inputSchema: input.inputSchema,
          outputSchema: input.outputSchema,
          parameters: input.parameters,
          changelog: input.changelog,
          status: "draft",
        })
        .execute();

      return { success: true, versionId: result[0].insertId };
    }),

  // Get user's installed skills
  myInstalled: protectedProcedure
    .input(z.object({ projectId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db
        .select({
          installation: skillInstallations,
          skill: skills,
        })
        .from(skillInstallations)
        .innerJoin(skills, eq(skillInstallations.skillId, skills.id))
        .where(
          input.projectId
            ? and(eq(skillInstallations.userId, ctx.user.id), eq(skillInstallations.projectId, input.projectId))
            : eq(skillInstallations.userId, ctx.user.id)
        )
        .execute();

      return result;
    }),
});

export type SkillsRouter = typeof skillsRouter;
