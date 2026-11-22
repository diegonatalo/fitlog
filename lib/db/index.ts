import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { assertDevDatabase } from "@/lib/dev-database";
import { hideQueryValues } from "./safe-errors";
import * as schema from "./schema";

// o erro de uma consulta nunca leva os valores dela para o log
hideQueryValues();

// só no `next dev`: a trava não roda no site publicado
if (process.env.NODE_ENV === "development") assertDevDatabase(process.env);

/**
 * One pool per server instance. `DATABASE_URL` is the pooled Neon URL in
 * production and a local Postgres in CI; the pool only connects on the first query.
 */
const globalForDb = globalThis as unknown as { fitlogPool?: Pool };

const pool =
  globalForDb.fitlogPool ??
  new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });

// in dev, hot reloads would open a new pool on every edit
if (process.env.NODE_ENV !== "production") globalForDb.fitlogPool = pool;

export const db = drizzle(pool, { schema });

export type Db = typeof db;
