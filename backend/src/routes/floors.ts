import { Elysia, t } from "elysia";
import { db } from "../db";
import { floors, locations } from "../db/schema";
import { eq, asc, sql } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth";

export const floorRoutes = new Elysia({
  prefix: "/api/floors",
  detail: {
    tags: ["Floors & Campus Layout"],
  },
})
  .use(requireAdmin)

  // GET /api/floors — List all 9 floors with location counts
  .get("/", async () => {
    const allFloors = await db.select().from(floors).orderBy(asc(floors.number));

    const locationCounts = await db
      .select({
        floorId: locations.floorId,
        count: sql<number>`count(*)`,
      })
      .from(locations)
      .groupBy(locations.floorId);

    const countMap = new Map(locationCounts.map((c) => [c.floorId, Number(c.count)]));

    const data = allFloors.map((f) => ({
      ...f,
      locationCount: countMap.get(f.id) || 0,
    }));

    return { success: true, data };
  })

  // GET /api/floors/locations — List all locations across all floors (for floor management UI)
  .get("/locations", async () => {
    const allLocations = await db
      .select({
        id: locations.id,
        code: locations.code,
        name: locations.name,
        description: locations.description,
        floorId: locations.floorId,
        floorNumber: floors.number,
        floorName: floors.name,
        qrCode: locations.qrCode,
        capacity: locations.capacity,
        status: locations.status,
        createdAt: locations.createdAt,
      })
      .from(locations)
      .innerJoin(floors, eq(locations.floorId, floors.id))
      .orderBy(asc(floors.number), asc(locations.code));

    return { success: true, data: allLocations };
  })

  // POST /api/floors/locations — Create location from floor number
  .post(
    "/locations",
    async ({ body, set }) => {
      // Find floor by floorNumber or floorId
      let floorId = body.floorId;
      if (!floorId && body.floorNumber) {
        const [targetFloor] = await db
          .select({ id: floors.id })
          .from(floors)
          .where(eq(floors.number, Number(body.floorNumber)))
          .limit(1);
        if (targetFloor) floorId = targetFloor.id;
      }

      if (!floorId) {
        set.status = 400;
        return { success: false, error: { code: "FLOOR_REQUIRED", message: "Lantai tidak ditemukan" } };
      }

      const generatedCode = body.code?.toUpperCase().trim() || `POS-L${body.floorNumber || 1}-${Date.now().toString().slice(-4)}`;

      const [location] = await db
        .insert(locations)
        .values({
          code: generatedCode,
          name: body.name.trim(),
          description: body.description?.trim() || null,
          floorId: floorId,
          qrCode: body.qrCode?.trim() || generatedCode,
          capacity: body.capacity || 10,
          status: (body.status as any) || "ACTIVE",
        })
        .returning();

      return { success: true, data: location };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        floorNumber: t.Optional(t.Number()),
        floorId: t.Optional(t.String()),
        code: t.Optional(t.String()),
        capacity: t.Optional(t.Number()),
        description: t.Optional(t.Nullable(t.String())),
        status: t.Optional(t.String()),
        qrCode: t.Optional(t.String()),
      }),
    }
  )

  // PUT /api/floors/locations/:id — Update location
  .put(
    "/locations/:id",
    async ({ params, body, set }) => {
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (body.name) updates.name = body.name.trim();
      if (body.description !== undefined) updates.description = body.description?.trim() || null;
      if (body.capacity !== undefined) updates.capacity = body.capacity;
      if (body.status) updates.status = body.status;

      if (body.floorNumber) {
        const [targetFloor] = await db
          .select({ id: floors.id })
          .from(floors)
          .where(eq(floors.number, Number(body.floorNumber)))
          .limit(1);
        if (targetFloor) updates.floorId = targetFloor.id;
      }

      const [location] = await db.update(locations).set(updates).where(eq(locations.id, params.id)).returning();
      if (!location) {
        set.status = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "Location not found" } };
      }

      return { success: true, data: location };
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        floorNumber: t.Optional(t.Number()),
        capacity: t.Optional(t.Number()),
        description: t.Optional(t.Nullable(t.String())),
        status: t.Optional(t.String()),
      }),
    }
  )

  // DELETE /api/floors/locations/:id — Delete location
  .delete("/locations/:id", async ({ params, set }) => {
    const [location] = await db.delete(locations).where(eq(locations.id, params.id)).returning({ id: locations.id });
    if (!location) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Location not found" } };
    }
    return { success: true, data: { id: location.id } };
  })

  // GET /api/floors/:id — Get floor by ID with its locations
  .get("/:id", async ({ params, set }) => {
    // Check if params.id is a UUID (36 chars) or numeric
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id);
    if (!isUUID) {
      // Try finding by floor number
      const num = parseInt(params.id, 10);
      if (!isNaN(num)) {
        const [floorByNum] = await db.select().from(floors).where(eq(floors.number, num)).limit(1);
        if (floorByNum) {
          const floorLocations = await db
            .select()
            .from(locations)
            .where(eq(locations.floorId, floorByNum.id))
            .orderBy(asc(locations.code));
          return { success: true, data: { ...floorByNum, locations: floorLocations } };
        }
      }
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Floor not found" } };
    }

    const [floor] = await db.select().from(floors).where(eq(floors.id, params.id)).limit(1);
    if (!floor) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Floor not found" } };
    }

    const floorLocations = await db
      .select()
      .from(locations)
      .where(eq(locations.floorId, params.id))
      .orderBy(asc(locations.code));

    return { success: true, data: { ...floor, locations: floorLocations } };
  })

  // POST /api/floors — Create new floor
  .post(
    "/",
    async ({ body, set }) => {
      const existing = await db.select().from(floors).where(eq(floors.number, body.number)).limit(1);
      if (existing.length > 0) {
        set.status = 409;
        return { success: false, error: { code: "FLOOR_EXISTS", message: "Floor number already exists" } };
      }
      const [floor] = await db
        .insert(floors)
        .values({
          number: body.number,
          name: body.name.trim(),
          description: body.description?.trim() || null,
        })
        .returning();
      return { success: true, data: floor };
    },
    {
      body: t.Object({
        number: t.Number(),
        name: t.String({ minLength: 1 }),
        description: t.Optional(t.String()),
      }),
    }
  )

  // PUT /api/floors/:id — Update floor
  .put(
    "/:id",
    async ({ params, body, set }) => {
      const updates: Record<string, unknown> = {};
      if (body.number !== undefined) updates.number = body.number;
      if (body.name) updates.name = body.name.trim();
      if (body.description !== undefined) updates.description = body.description?.trim() || null;

      const [floor] = await db
        .update(floors)
        .set(updates)
        .where(eq(floors.id, params.id))
        .returning();

      if (!floor) {
        set.status = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "Floor not found" } };
      }
      return { success: true, data: floor };
    },
    {
      body: t.Object({
        number: t.Optional(t.Number()),
        name: t.Optional(t.String()),
        description: t.Optional(t.Nullable(t.String())),
      }),
    }
  )

  // DELETE /api/floors/:id — Delete floor
  .delete("/:id", async ({ params, set }) => {
    const [floor] = await db.delete(floors).where(eq(floors.id, params.id)).returning({ id: floors.id });
    if (!floor) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Floor not found" } };
    }
    return { success: true, data: { id: floor.id } };
  });
