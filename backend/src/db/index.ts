import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgres://genius:genius2026@localhost:5432/genius_2026";

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
export type Database = typeof db;
