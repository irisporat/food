import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type AppEnv = {
  recipes_db: D1Database;
} & Record<string, unknown>;

export const getDb = async () => {
  const context = await getCloudflareContext();
  const env = context.env as any;
  const db = env.recipes_db as D1Database;
  
  if (!db) {
    throw new Error("D1 binding 'recipes_db' not found");
  }

  return drizzle(db, { schema });
};
