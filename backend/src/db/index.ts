import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import postgres from "postgres";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

const usePglite =
  process.env.DATABASE_DRIVER === "pglite" ||
  process.env.USE_PGLITE === "true" ||
  !process.env.DATABASE_URL ||
  process.env.DATABASE_URL.startsWith("pglite");

let dbInstance: any;

if (usePglite) {
  const dataDir = path.resolve(import.meta.dir, "../../data/pglite_db");
  fs.mkdirSync(dataDir, { recursive: true });
  const client = new PGlite(dataDir);

  // Auto-run migration if tables not yet created
  const migrationFile = path.resolve(import.meta.dir, "../../drizzle/0000_freezing_galactus.sql");
  if (fs.existsSync(migrationFile)) {
    try {
      const checkRes = await client.query<{ exists: boolean }>(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users');"
      );
      if (!checkRes.rows[0]?.exists) {
        const sql = fs.readFileSync(migrationFile, "utf8");
        await client.exec(sql);
        console.log("[DB] PGlite schema initialized from migration.");
      }
    } catch (err: any) {
      console.warn("[DB] PGlite table check warning:", err.message);
    }
  }

  dbInstance = drizzlePglite(client, { schema });
} else {
  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString, {
    max: Number(process.env.DB_MAX_CONNECTIONS || 25),
    idle_timeout: 30,
    connect_timeout: 10,
  });
  dbInstance = drizzlePg(client, { schema });
}

export const db = dbInstance;
export type Database = typeof db;
