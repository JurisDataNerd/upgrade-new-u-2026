import { Elysia, t } from "elysia";
import { db } from "../db";
import { questions } from "../db/schema";
import { eq, sql, desc, and } from "drizzle-orm";
import { requireAdmin, authMiddleware } from "../middleware/auth";

export const questionRoutes = new Elysia({ prefix: "/api/questions" })
  .use(authMiddleware)

  // GET /api/questions/random — Get randomized question set for games
  .get("/random", async ({ query }) => {
    const category = query.category || "";
    const difficulty = query.difficulty || "";
    const count = Number(query.count) || 5;

    let q = db.select().from(questions).where(eq(questions.status, "ACTIVE")).$dynamic();

    const conditions = [eq(questions.status, "ACTIVE")];
    if (category) conditions.push(eq(questions.category, category));
    if (difficulty) conditions.push(eq(questions.difficulty, difficulty as any));

    q = q.where(and(...conditions));

    const pool = await q.limit(100);
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, count);

    return {
      success: true,
      data: shuffled.map((sq) => ({
        id: sq.id,
        category: sq.category,
        difficulty: sq.difficulty,
        questionText: sq.questionText,
        type: sq.type,
        options: sq.options,
        baseScore: sq.baseScore,
      })),
    };
  })

  // Admin Routes
  .use(requireAdmin)

  // GET /api/questions — List questions with filters and pagination
  .get("/", async ({ query }) => {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 20;
    const offset = (page - 1) * pageSize;
    const category = query.category || "";
    const difficulty = query.difficulty || "";
    const status = query.status || "";

    let q = db.select().from(questions).$dynamic();

    const conditions = [];
    if (category) conditions.push(eq(questions.category, category));
    if (difficulty) conditions.push(eq(questions.difficulty, difficulty as any));
    if (status) conditions.push(eq(questions.status, status as any));

    if (conditions.length > 0) {
      q = q.where(and(...conditions));
    }

    const data = await q.orderBy(desc(questions.createdAt)).limit(pageSize).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(questions);

    return {
      success: true,
      data,
      meta: { page, pageSize, total: Number(count) },
    };
  })

  // GET /api/questions/categories — Get distinct categories
  .get("/categories", async () => {
    const result = await db
      .selectDistinct({ category: questions.category })
      .from(questions)
      .where(sql`${questions.category} IS NOT NULL`);

    const categories = result.map((r) => r.category).filter(Boolean);
    return { success: true, data: categories };
  })

  // GET /api/questions/:id — Get single question
  .get("/:id", async ({ params, set }) => {
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, params.id))
      .limit(1);

    if (!question) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Question not found" } };
    }
    return { success: true, data: question };
  })

  // POST /api/questions/bulk-import — Bulk import questions
  .post(
    "/bulk-import",
    async ({ body, user }) => {
      const { items } = body;
      if (!items || items.length === 0) {
        return { success: true, count: 0, message: "No items to import" };
      }

      const inserts = items.map((item) => ({
        category: item.category || null,
        difficulty: (item.difficulty as any) || "MEDIUM",
        questionText: item.questionText,
        type: (item.type as any) || "MULTIPLE_CHOICE",
        options: item.options || [],
        correctAnswer: item.correctAnswer,
        explanation: item.explanation || null,
        baseScore: item.baseScore ?? 10,
        tags: item.tags || [],
        status: "ACTIVE" as any,
        createdBy: user?.userId || null,
      }));

      const created = await db.insert(questions).values(inserts).returning({ id: questions.id });

      return {
        success: true,
        count: created.length,
        message: `Successfully imported ${created.length} questions into Question Bank`,
      };
    },
    {
      body: t.Object({
        items: t.Array(
          t.Object({
            category: t.Optional(t.String()),
            difficulty: t.Optional(t.String()),
            questionText: t.String({ minLength: 1 }),
            type: t.Optional(t.String()),
            options: t.Array(t.Any()),
            correctAnswer: t.String({ minLength: 1 }),
            explanation: t.Optional(t.String()),
            baseScore: t.Optional(t.Number()),
            tags: t.Optional(t.Array(t.String())),
          })
        ),
      }),
    }
  )

  // POST /api/questions — Create single question
  .post(
    "/",
    async ({ body, user }) => {
      const [question] = await db
        .insert(questions)
        .values({
          category: body.category || null,
          difficulty: body.difficulty as any,
          questionText: body.questionText,
          type: (body.type as any) || "MULTIPLE_CHOICE",
          options: body.options || [],
          correctAnswer: body.correctAnswer,
          explanation: body.explanation || null,
          baseScore: body.baseScore ?? 10,
          tags: body.tags || [],
          status: (body.status as any) || "ACTIVE",
          createdBy: user?.userId || null,
        })
        .returning();

      return { success: true, data: question };
    },
    {
      body: t.Object({
        category: t.Optional(t.String()),
        difficulty: t.String(),
        questionText: t.String({ minLength: 1 }),
        type: t.Optional(t.String()),
        options: t.Array(t.Any()),
        correctAnswer: t.String({ minLength: 1 }),
        explanation: t.Optional(t.String()),
        baseScore: t.Optional(t.Number()),
        tags: t.Optional(t.Array(t.String())),
        status: t.Optional(t.String()),
      }),
    }
  )

  // PUT /api/questions/:id — Update question
  .put(
    "/:id",
    async ({ params, body, set }) => {
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (body.category !== undefined) updates.category = body.category;
      if (body.difficulty) updates.difficulty = body.difficulty;
      if (body.questionText) updates.questionText = body.questionText;
      if (body.type) updates.type = body.type;
      if (body.options !== undefined) updates.options = body.options;
      if (body.correctAnswer) updates.correctAnswer = body.correctAnswer;
      if (body.explanation !== undefined) updates.explanation = body.explanation;
      if (body.baseScore !== undefined) updates.baseScore = body.baseScore;
      if (body.tags !== undefined) updates.tags = body.tags;
      if (body.status) updates.status = body.status;

      const [question] = await db
        .update(questions)
        .set(updates)
        .where(eq(questions.id, params.id))
        .returning();

      if (!question) {
        set.status = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "Question not found" } };
      }

      return { success: true, data: question };
    },
    {
      body: t.Object({
        category: t.Optional(t.Nullable(t.String())),
        difficulty: t.Optional(t.String()),
        questionText: t.Optional(t.String()),
        type: t.Optional(t.String()),
        options: t.Optional(t.Array(t.Any())),
        correctAnswer: t.Optional(t.String()),
        explanation: t.Optional(t.Nullable(t.String())),
        baseScore: t.Optional(t.Number()),
        tags: t.Optional(t.Array(t.String())),
        status: t.Optional(t.String()),
      }),
    }
  )

  // DELETE /api/questions/:id — Delete question
  .delete("/:id", async ({ params, set }) => {
    const [question] = await db
      .delete(questions)
      .where(eq(questions.id, params.id))
      .returning({ id: questions.id });

    if (!question) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Question not found" } };
    }

    return { success: true, data: { id: question.id } };
  });
