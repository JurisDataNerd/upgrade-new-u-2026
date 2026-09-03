import { Elysia, t } from "elysia";
import { db } from "../db";
import { routes, routeStops, locations, floors, teams, stages } from "../db/schema";
import { eq, asc, sql, inArray } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth";

export const routeRoutes = new Elysia({ prefix: "/api/routes" })
  .use(requireAdmin)

  // GET /api/routes — List routes with stop counts and assigned team counts
  .get("/", async ({ query }) => {
    const stageId = query.stageId || "";
    let q = db
      .select({
        id: routes.id,
        name: routes.name,
        stageId: routes.stageId,
        stageName: stages.name,
        status: routes.status,
        createdAt: routes.createdAt,
        updatedAt: routes.updatedAt,
      })
      .from(routes)
      .leftJoin(stages, eq(routes.stageId, stages.id))
      .$dynamic();

    if (stageId) {
      q = q.where(eq(routes.stageId, stageId));
    }
    const allRoutes = await q.orderBy(routes.name);

    if (allRoutes.length === 0) {
      return { success: true, data: [] };
    }

    const routeIds = allRoutes.map((r) => r.id);

    // Aggregate stops count
    const stopCounts = await db
      .select({
        routeId: routeStops.routeId,
        count: sql<number>`count(*)`,
      })
      .from(routeStops)
      .where(inArray(routeStops.routeId, routeIds))
      .groupBy(routeStops.routeId);

    // Aggregate teams assigned count
    const teamCounts = await db
      .select({
        routeId: teams.routeId,
        count: sql<number>`count(*)`,
      })
      .from(teams)
      .where(inArray(teams.routeId, routeIds))
      .groupBy(teams.routeId);

    const stopMap = new Map(stopCounts.map((s) => [s.routeId, Number(s.count)]));
    const teamMap = new Map(teamCounts.map((t) => [t.routeId, Number(t.count)]));

    const data = allRoutes.map((r) => ({
      ...r,
      stopCount: stopMap.get(r.id) || 0,
      assignedTeamCount: teamMap.get(r.id) || 0,
    }));

    return { success: true, data };
  })

  // GET /api/routes/:id — Single route with ordered stops and location details
  .get("/:id", async ({ params, set }) => {
    const [route] = await db
      .select({
        id: routes.id,
        name: routes.name,
        stageId: routes.stageId,
        stageName: stages.name,
        status: routes.status,
        createdAt: routes.createdAt,
        updatedAt: routes.updatedAt,
      })
      .from(routes)
      .leftJoin(stages, eq(routes.stageId, stages.id))
      .where(eq(routes.id, params.id))
      .limit(1);

    if (!route) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Route not found" } };
    }

    const stops = await db
      .select({
        id: routeStops.id,
        order: routeStops.order,
        isRequired: routeStops.isRequired,
        estimatedDurationMin: routeStops.estimatedDurationMin,
        locationId: routeStops.locationId,
        locationCode: locations.code,
        locationName: locations.name,
        qrCode: locations.qrCode,
        floorNumber: floors.number,
        floorName: floors.name,
      })
      .from(routeStops)
      .innerJoin(locations, eq(routeStops.locationId, locations.id))
      .innerJoin(floors, eq(locations.floorId, floors.id))
      .where(eq(routeStops.routeId, params.id))
      .orderBy(asc(routeStops.order));

    return { success: true, data: { ...route, stops } };
  })

  // POST /api/routes — Create new route
  .post(
    "/",
    async ({ body }) => {
      const [route] = await db
        .insert(routes)
        .values({
          name: body.name.trim(),
          stageId: body.stageId,
        })
        .returning();
      return { success: true, data: route };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        stageId: t.String(),
      }),
    }
  )

  // PUT /api/routes/:id — Update route
  .put(
    "/:id",
    async ({ params, body, set }) => {
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (body.name) updates.name = body.name.trim();
      if (body.status) updates.status = body.status;
      if (body.stageId) updates.stageId = body.stageId;

      const [route] = await db.update(routes).set(updates).where(eq(routes.id, params.id)).returning();
      if (!route) {
        set.status = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "Route not found" } };
      }
      return { success: true, data: route };
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        stageId: t.Optional(t.String()),
        status: t.Optional(t.String()),
      }),
    }
  )

  // DELETE /api/routes/:id — Delete route and stops
  .delete("/:id", async ({ params, set }) => {
    await db.delete(routeStops).where(eq(routeStops.routeId, params.id));
    const [route] = await db.delete(routes).where(eq(routes.id, params.id)).returning({ id: routes.id });
    if (!route) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Route not found" } };
    }
    return { success: true, data: { id: route.id } };
  })

  // POST /api/routes/:id/stops — Add stop to route
  .post(
    "/:id/stops",
    async ({ params, body }) => {
      const [stop] = await db
        .insert(routeStops)
        .values({
          routeId: params.id,
          locationId: body.locationId,
          order: body.order,
          isRequired: body.isRequired ?? true,
          estimatedDurationMin: body.estimatedDurationMin || 15,
        })
        .returning();
      return { success: true, data: stop };
    },
    {
      body: t.Object({
        locationId: t.String(),
        order: t.Number(),
        isRequired: t.Optional(t.Boolean()),
        estimatedDurationMin: t.Optional(t.Number()),
      }),
    }
  )

  // POST /api/routes/:id/reorder-stops — Reorder all stops for a route
  .post(
    "/:id/reorder-stops",
    async ({ params, body }) => {
      const { stops } = body;
      for (const item of stops) {
        await db
          .update(routeStops)
          .set({ order: item.order })
          .where(eq(routeStops.id, item.stopId));
      }
      return { success: true, message: "Route stops reordered successfully" };
    },
    {
      body: t.Object({
        stops: t.Array(
          t.Object({
            stopId: t.String(),
            order: t.Number(),
          })
        ),
      }),
    }
  )

  // DELETE /api/routes/:id/stops/:stopId
  .delete("/:id/stops/:stopId", async ({ params, set }) => {
    const [stop] = await db
      .delete(routeStops)
      .where(eq(routeStops.id, params.stopId))
      .returning({ id: routeStops.id });
    if (!stop) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Route stop not found" } };
    }
    return { success: true, data: { id: stop.id } };
  });
