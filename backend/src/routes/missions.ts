import { Elysia, t } from "elysia";
import { db } from "../db";
import { missions, locations, games, floors, stages } from "../db/schema";
import { eq, sql, asc, or, ilike } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth";

export const missionRoutes = new Elysia({
  prefix: "/api/missions",
  detail: {
    tags: ["Missions & Tantangan Pos"],
  },
})
  .use(requireAdmin)

  // GET /api/missions — List all missions with location and game details
  .get("/", async ({ query }) => {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 50;
    const offset = (page - 1) * pageSize;
    const stageId = query.stageId || "";
    const locationId = query.locationId || "";
    const search = query.search?.trim();

    let q = db
      .select({
        id: missions.id,
        name: missions.name,
        description: missions.description,
        type: missions.type,
        locationId: missions.locationId,
        locationCode: locations.code,
        locationName: locations.name,
        floorNumber: floors.number,
        floorName: floors.name,
        stageId: missions.stageId,
        stageName: stages.name,
        gameId: missions.gameId,
        gameName: games.name,
        gameType: games.type,
        order: missions.order,
        isRequired: missions.isRequired,
        timeLimit: missions.timeLimit,
        status: missions.status,
        createdAt: missions.createdAt,
      })
      .from(missions)
      .innerJoin(locations, eq(missions.locationId, locations.id))
      .leftJoin(floors, eq(locations.floorId, floors.id))
      .leftJoin(stages, eq(missions.stageId, stages.id))
      .leftJoin(games, eq(missions.gameId, games.id))
      .$dynamic();

    if (stageId) q = q.where(eq(missions.stageId, stageId));
    if (locationId) q = q.where(eq(missions.locationId, locationId));
    if (search) {
      q = q.where(or(ilike(missions.name, `%${search}%`), ilike(locations.name, `%${search}%`)));
    }

    const data = await q.orderBy(asc(missions.order)).limit(pageSize).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(missions);

    return { success: true, data, meta: { page, pageSize, total: Number(count) } };
  })

  // GET /api/missions/:id — Single mission with full game config
  .get("/:id", async ({ params, set }) => {
    const [mission] = await db
      .select({
        id: missions.id,
        name: missions.name,
        description: missions.description,
        type: missions.type,
        locationId: missions.locationId,
        locationCode: locations.code,
        locationName: locations.name,
        floorNumber: floors.number,
        floorName: floors.name,
        stageId: missions.stageId,
        stageName: stages.name,
        gameId: missions.gameId,
        gameName: games.name,
        gameType: games.type,
        gameConfig: games.config,
        order: missions.order,
        isRequired: missions.isRequired,
        timeLimit: missions.timeLimit,
        status: missions.status,
        createdAt: missions.createdAt,
      })
      .from(missions)
      .innerJoin(locations, eq(missions.locationId, locations.id))
      .leftJoin(floors, eq(locations.floorId, floors.id))
      .leftJoin(stages, eq(missions.stageId, stages.id))
      .leftJoin(games, eq(missions.gameId, games.id))
      .where(eq(missions.id, params.id))
      .limit(1);

    if (!mission) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Mission not found" } };
    }
    return { success: true, data: mission };
  })

  // POST /api/missions — Create mission
  .post(
    "/",
    async ({ body }) => {
      const [mission] = await db
        .insert(missions)
        .values({
          name: body.name.trim(),
          description: body.description?.trim() || null,
          type: (body.type as any) || "MAIN",
          locationId: body.locationId,
          stageId: body.stageId,
          gameId: body.gameId || null,
          order: body.order || 1,
          isRequired: body.isRequired ?? true,
          timeLimit: body.timeLimit || 600,
        })
        .returning();
      return { success: true, data: mission };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        description: t.Optional(t.String()),
        type: t.Optional(t.String()),
        locationId: t.String(),
        stageId: t.String(),
        gameId: t.Optional(t.Nullable(t.String())),
        order: t.Optional(t.Number()),
        isRequired: t.Optional(t.Boolean()),
        timeLimit: t.Optional(t.Number()),
      }),
    }
  )

  // PUT /api/missions/:id — Update mission
  .put(
    "/:id",
    async ({ params, body, set }) => {
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (body.name) updates.name = body.name.trim();
      if (body.description !== undefined) updates.description = body.description?.trim() || null;
      if (body.type) updates.type = body.type;
      if (body.locationId) updates.locationId = body.locationId;
      if (body.stageId) updates.stageId = body.stageId;
      if (body.gameId !== undefined) updates.gameId = body.gameId || null;
      if (body.order !== undefined) updates.order = body.order;
      if (body.isRequired !== undefined) updates.isRequired = body.isRequired;
      if (body.timeLimit !== undefined) updates.timeLimit = body.timeLimit;
      if (body.status) updates.status = body.status;

      const [mission] = await db.update(missions).set(updates).where(eq(missions.id, params.id)).returning();
      if (!mission) {
        set.status = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "Mission not found" } };
      }
      return { success: true, data: mission };
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        description: t.Optional(t.Nullable(t.String())),
        type: t.Optional(t.String()),
        locationId: t.Optional(t.String()),
        stageId: t.Optional(t.String()),
        gameId: t.Optional(t.Nullable(t.String())),
        order: t.Optional(t.Number()),
        isRequired: t.Optional(t.Boolean()),
        timeLimit: t.Optional(t.Number()),
        status: t.Optional(t.String()),
      }),
    }
  )

  // DELETE /api/missions/:id — Delete mission
  .delete("/:id", async ({ params, set }) => {
    const [mission] = await db.delete(missions).where(eq(missions.id, params.id)).returning({ id: missions.id });
    if (!mission) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Mission not found" } };
    }
    return { success: true, data: { id: mission.id } };
  });
