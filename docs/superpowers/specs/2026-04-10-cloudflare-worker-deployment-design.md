# Cloudflare Worker Deployment Design

**Date:** 2026-04-10
**Status:** Approved

## Summary

Set up the existing Next.js 15 App Router recipe app to deploy to Cloudflare Workers using `@opennextjs/cloudflare`. The app requires support for both SSR pages and API routes, with a D1 database binding stubbed out for future use.

## Architecture

The app stays as a Next.js 15 App Router project. `@opennextjs/cloudflare` acts as the build adapter, and `wrangler` is the local dev + deploy CLI. The output is a Cloudflare Worker that serves SSR pages and API routes from a single Worker script, with static assets served via Cloudflare's asset pipeline.

```
Next.js App Router
      ↓  (build)
@opennextjs/cloudflare
      ↓  (output)
Cloudflare Worker  ←→  D1 (future)
      ↑
  wrangler dev (local) / wrangler deploy (prod)
```

## New Dependencies

| Package | Type | Purpose |
|---------|------|---------|
| `@opennextjs/cloudflare` | dependency | Build adapter for Cloudflare Workers |
| `wrangler` | devDependency | Local dev server + deploy CLI |

## New Files

### `wrangler.toml`

Worker configuration file. Includes:
- Worker name (`food`)
- Compatibility date and flags (`nodejs_compat` required by OpenNext)
- Main entry point pointing to OpenNext's output
- Assets directory binding
- Commented-out D1 binding ready to activate later

```toml
name = "food"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]
main = ".open-next/worker.js"

[assets]
directory = ".open-next/assets"

# Uncomment and fill in when D1 database is ready:
# [[d1_databases]]
# binding = "DB"
# database_name = "food-db"
# database_id = "YOUR_DATABASE_ID"
```

### `.dev.vars`

Local environment variables for `wrangler dev`. Gitignored. Empty initially but ready for secrets.

## Changes to Existing Files

### `package.json`

Add two scripts:

```json
"preview": "opennextjs-cloudflare build && wrangler dev",
"deploy": "opennextjs-cloudflare build && wrangler deploy"
```

### `.gitignore`

Add `.dev.vars` and `.open-next/` to the ignore list.

## Dev & Deploy Workflow

| Task | Command |
|------|---------|
| Local Next.js dev (fast iteration) | `npm run dev` |
| Local Worker preview (production-like) | `npm run preview` |
| Deploy to Cloudflare | `npm run deploy` |

## D1 Integration (Future)

When D1 is added, the workflow is:
1. Create the D1 database via `wrangler d1 create food-db`
2. Uncomment the `[[d1_databases]]` block in `wrangler.toml` and fill in the `database_id`
3. Access the binding in API routes via `getRequestContext().env.DB`

## Out of Scope

- Creating API routes or SSR pages (no app logic changes)
- D1 schema or migrations
- CI/CD pipeline setup
- Custom domain configuration
