import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgres://genius:genius2026@localhost:5432/genius_2026";

const client = postgres(connectionString, {
  max: Number(process.env.DB_MAX_CONNECTIONS || 25),
  idle_timeout: 30,
  connect_timeout: 10,
});
export const db = drizzle(client, { schema });
export type Database = typeof db;
