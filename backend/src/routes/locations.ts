import { Elysia, t } from "elysia";
import { db } from "../db";
import {
  locations,
  floors,
  missions,
  gameSessions,
  teams,
  teamMembers,
  routes,
  routeStops,
  games,
  users,
} from "../db/schema";
import { eq, sql, asc, or, ilike, inArray, and } from "drizzle-orm";
import { requireAdmin, authMiddleware, requireUser } from "../middleware/auth";
import { broadcastLocationOccupancy } from "../realtime";

export const locationRoutes = new Elysia({
  prefix: "/api/locations",
  detail: {
    tags: ["Locations & Pos Checkpoints"],
  },
})
  .use(authMiddleware)

  // POST /api/locations/validate-qr — Full QR Validation Chain for Participants & Buddies
  .use(requireUser)
  .post(
    "/validate-qr",
    async ({ body, user, set }) => {
      const { qrCode } = body;
      const cleanQr = qrCode.trim().toUpperCase();

      // 1. Validate Location by QR Code / Code
      const [location] = await db
        .select({
          id: locations.id,
          code: locations.code,
          name: locations.name,
          description: locations.description,
          floorId: locations.floorId,
          floorNumber: floors.number,
          floorName: floors.name,
          capacity: locations.capacity,
          status: locations.status,
        })
        .from(locations)
        .innerJoin(floors, eq(locations.floorId, floors.id))
        .where(or(eq(locations.qrCode, cleanQr), eq(locations.code, cleanQr)))
        .limit(1);

      if (!location) {
        set.status = 404;
        return {
          success: false,
          validationStatus: "INVALID_QR",
          error: { code: "LOCATION_NOT_FOUND", message: `QR Code '${cleanQr}' tidak dikenali dalam sistem kampus.` },
        };
      }

      // 2. Validate User & Team Membership
      let teamId = user?.teamId;
      if (!teamId && user?.userId) {
        const [membership] = await db
          .select({ teamId: teamMembers.teamId })
          .from(teamMembers)
          .where(eq(teamMembers.userId, user.userId))
          .limit(1);
        teamId = membership?.teamId;
      }

      if (!teamId) {
        set.status = 403;
        return {
          success: false,
          validationStatus: "NO_TEAM",
          error: { code: "NO_TEAM", message: "Anda belum terdaftar dalam tim petualang manapun." },
        };
      }

      const [team] = await db
        .select({
          id: teams.id,
          name: teams.name,
          code: teams.code,
          routeId: teams.routeId,
        })
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1);

      // 3. Validate Route & Route Stops
      let isRouteStop = false;
      let stopOrder = null;

      if (team?.routeId) {
        const [stop] = await db
          .select({ order: routeStops.order })
          .from(routeStops)
          .where(and(eq(routeStops.routeId, team.routeId), eq(routeStops.locationId, location.id)))
          .limit(1);

        if (stop) {
          isRouteStop = true;
          stopOrder = stop.order;
        }
      }

      // 4. Validate Location Occupancy
      if (location.status === "LOCKED") {
        return {
          success: false,
          validationStatus: "LOCATION_LOCKED",
          error: { code: "LOCATION_LOCKED", message: `Pos ${location.name} sedang dikunci oleh Game Master.` },
        };
      }

      if (location.status === "OCCUPIED") {
        // Check if our team is the one currently in session
        const [activeSession] = await db
          .select({ id: gameSessions.id, teamId: gameSessions.teamId })
          .from(gameSessions)
          .where(and(eq(gameSessions.locationId, location.id), eq(gameSessions.status, "ACTIVE")))
          .limit(1);

        if (activeSession && activeSession.teamId !== teamId) {
          return {
            success: false,
            validationStatus: "LOCATION_OCCUPIED",
            error: {
              code: "LOCATION_OCCUPIED",
              message: `Pos ${location.name} sedang dimainkan oleh tim lain. Harap tunggu sebentar.`,
            },
          };
        }
      }

      // 5. Fetch Active Mission & Game for this Location
      const [mission] = await db
        .select({
          id: missions.id,
          name: missions.name,
          description: missions.description,
          type: missions.type,
          timeLimit: missions.timeLimit,
          gameId: missions.gameId,
          gameName: games.name,
          gameType: games.type,
          gameInstructions: games.instructions,
        })
        .from(missions)
        .leftJoin(games, eq(missions.gameId, games.id))
        .where(and(eq(missions.locationId, location.id), eq(missions.status, "ACTIVE")))
        .limit(1);

      return {
        success: true,
        validationStatus: "VALID",
        data: {
          location: {
            id: location.id,
            code: location.code,
            name: location.name,
            floorNumber: location.floorNumber,
            floorName: location.floorName,
            status: location.status,
          },
          team: {
            id: team?.id,
            name: team?.name,
            code: team?.code,
          },
          routeInfo: {
            isRouteStop,
            stopOrder,
          },
          mission: mission || null,
        },
      };
    },
    {
      body: t.Object({
        qrCode: t.String({ minLength: 1 }),
      }),
    }
  )

  // POST /api/locations/:id/occupancy — Location Occupancy State Machine (AVAILABLE, RESERVED, OCCUPIED, LOCKED, COMPLETED)
  .post(
    "/:id/occupancy",
    async ({ params, body, set }) => {
      const validStatuses = ["AVAILABLE", "RESERVED", "OCCUPIED", "LOCKED", "COMPLETED"];
      if (!validStatuses.includes(body.status)) {
        set.status = 400;
        return { success: false, error: { code: "INVALID_STATUS", message: "Invalid occupancy status" } };
      }

      const [updated] = await db
        .update(locations)
        .set({ status: body.status as any, updatedAt: new Date() })
        .where(eq(locations.id, params.id))
        .returning();

      if (!updated) {
        set.status = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "Location not found" } };
      }

      return { success: true, data: updated };
    },
    {
      body: t.Object({
        status: t.String(),
      }),
    }
  )

  // Admin Routes
  .use(requireAdmin)

  // GET /api/locations — List locations with floor details, mission count, and current occupancy
  .get("/", async ({ query }) => {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 50;
    const offset = (page - 1) * pageSize;
    const floorId = query.floorId || "";
    const search = query.search?.trim();

    let q = db
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
      .$dynamic();

    if (floorId) {
      q = q.where(eq(locations.floorId, floorId));
    }
    if (search) {
      q = q.where(or(ilike(locations.name, `%${search}%`), ilike(locations.code, `%${search}%`)));
    }

    const baseLocations = await q.orderBy(asc(floors.number), asc(locations.code)).limit(pageSize).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(locations);

    if (baseLocations.length === 0) {
      return { success: true, data: [], meta: { page, pageSize, total: Number(count) } };
    }

    const locationIds = baseLocations.map((l) => l.id);

    // Aggregate missions per location
    const missionCounts = await db
      .select({
        locationId: missions.locationId,
        count: sql<number>`count(*)`,
      })
      .from(missions)
      .where(inArray(missions.locationId, locationIds))
      .groupBy(missions.locationId);

    // Aggregate active game sessions / occupancy per location
    const activeSessions = await db
      .select({
        locationId: missions.locationId,
        activeCount: sql<number>`count(distinct ${gameSessions.teamId})`,
      })
      .from(gameSessions)
      .innerJoin(missions, eq(gameSessions.missionId, missions.id))
      .where(eq(gameSessions.status, "ACTIVE"))
      .groupBy(missions.locationId);

    const missionMap = new Map(missionCounts.map((m) => [m.locationId, Number(m.count)]));
    const occupancyMap = new Map(activeSessions.map((s) => [s.locationId, Number(s.activeCount)]));

    const data = baseLocations.map((loc) => {
      const activeTeams = occupancyMap.get(loc.id) || 0;
      return {
        ...loc,
        missionCount: missionMap.get(loc.id) || 0,
        currentOccupancy: activeTeams,
        isOccupied: activeTeams >= loc.capacity,
      };
    });

    return { success: true, data, meta: { page, pageSize, total: Number(count) } };
  })

  // GET /api/locations/:id — Single location with full mission list
  .get("/:id", async ({ params, set }) => {
    const [location] = await db
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
      .where(eq(locations.id, params.id))
      .limit(1);

    if (!location) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Location not found" } };
    }

    const locationMissions = await db
      .select()
      .from(missions)
      .where(eq(missions.locationId, params.id))
      .orderBy(asc(missions.order));

    return {
      success: true,
      data: {
        ...location,
        missions: locationMissions,
      },
    };
  })

  // POST /api/locations — Create location with unique code & QR mapping
  .post(
    "/",
    async ({ body, set }) => {
      const existing = await db
        .select()
        .from(locations)
        .where(eq(locations.code, body.code.toUpperCase().trim()))
        .limit(1);

      if (existing.length > 0) {
        set.status = 409;
        return { success: false, error: { code: "CODE_EXISTS", message: "Location code already exists" } };
      }

      const [location] = await db
        .insert(locations)
        .values({
          code: body.code.toUpperCase().trim(),
          name: body.name.trim(),
          description: body.description?.trim() || null,
          floorId: body.floorId,
          qrCode: body.qrCode?.trim() || body.code.toUpperCase().trim(),
          capacity: body.capacity || 1,
        })
        .returning();

      return { success: true, data: location };
    },
    {
      body: t.Object({
        code: t.String({ minLength: 1 }),
        name: t.String({ minLength: 1 }),
        description: t.Optional(t.String()),
        floorId: t.String(),
        qrCode: t.Optional(t.String()),
        capacity: t.Optional(t.Number()),
      }),
    }
  )

  // PUT /api/locations/:id — Update location
  .put(
    "/:id",
    async ({ params, body, set }) => {
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (body.name) updates.name = body.name.trim();
      if (body.description !== undefined) updates.description = body.description?.trim() || null;
      if (body.capacity !== undefined) updates.capacity = body.capacity;
      if (body.status) updates.status = body.status;
      if (body.qrCode) updates.qrCode = body.qrCode.trim();
      if (body.floorId) updates.floorId = body.floorId;

      const [location] = await db.update(locations).set(updates).where(eq(locations.id, params.id)).returning();
      if (!location) {
        set.status = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "Location not found" } };
      }

      if (body.status) {
        broadcastLocationOccupancy(location.id, location.status, { name: location.name, code: location.code });
      }

      return { success: true, data: location };
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        description: t.Optional(t.Nullable(t.String())),
        capacity: t.Optional(t.Number()),
        status: t.Optional(t.String()),
        qrCode: t.Optional(t.String()),
        floorId: t.Optional(t.String()),
      }),
    }
  )

  // POST /api/locations/:id/occupancy — State machine transition with realtime broadcast
  .post(
    "/:id/occupancy",
    async ({ params, body, set }) => {
      const [location] = await db
        .update(locations)
        .set({ status: body.status as any, updatedAt: new Date() })
        .where(eq(locations.id, params.id))
        .returning();

      if (!location) {
        set.status = 404;
        return { success: false, error: { code: "NOT_FOUND", message: "Location not found" } };
      }

      broadcastLocationOccupancy(location.id, location.status, { name: location.name, code: location.code });

      return { success: true, data: location, message: `Status lokasi diubah menjadi ${body.status}` };
    },
    {
      body: t.Object({
        status: t.String(),
      }),
    }
  )

  // DELETE /api/locations/:id — Delete location
  .delete("/:id", async ({ params, set }) => {
    const [location] = await db.delete(locations).where(eq(locations.id, params.id)).returning({ id: locations.id });
    if (!location) {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Location not found" } };
    }
    return { success: true, data: { id: location.id } };
  });
