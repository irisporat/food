import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/4e627b50fad1671efb86bdede8d2603c2274cb3d52e5dad49ffd842875b8498e.sqlite",
  },
});
