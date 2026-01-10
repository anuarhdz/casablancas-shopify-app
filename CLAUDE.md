# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SvelteKit 2 application integrated with Shopify Admin API. Uses Svelte 5 with TypeScript, Tailwind CSS 4, and pnpm for package management.

## Common Commands

### Development

```bash
pnpm dev              # Start development server
pnpm dev -- --open    # Start dev server and open browser
pnpm build            # Create production build
pnpm preview          # Preview production build
```

### Code Quality

```bash
pnpm check            # Type-check with svelte-check
pnpm check:watch      # Type-check in watch mode
pnpm lint             # Run prettier and eslint checks
pnpm format           # Format all files with prettier
```

### GraphQL Code Generation

```bash
pnpm codegen          # Generate TypeScript types from Shopify GraphQL schema
```

This must be run whenever GraphQL queries are added or modified. Generated files go to `types/` directory:

- `admin.generated.d.ts` - Generated types for queries
- `admin.types.d.ts` - Full Admin API type definitions
- `admin.schema.json` - GraphQL schema introspection

### Database

```bash
pnpm db:generate      # Generate Drizzle migrations from schema
pnpm db:migrate       # Run Supabase migrations
pnpm db:push          # Push schema directly to database
```

Database schema lives in `src/lib/server/db/schema.ts`. After modifying schema:

1. Run `pnpm db:generate` to create migration files in `supabase/migrations/`
2. Run `pnpm db:migrate` to apply migrations to database

### Development Tunnel

```bash
pnpm tunnel           # Expose local dev server via ngrok (for Shopify webhooks)
```

## Architecture

### Shopify Integration Pattern

**Client Setup** (`src/lib/shopify.ts`):

- Initializes Shopify Admin API client using `@shopify/admin-api-client`
- Credentials come from environment variables with `PRIVATE_` prefix (see `.env`)
- All API functions return `{ success: boolean, data: any }` response pattern

**GraphQL Query Organization**:

- Queries live in `src/lib/queries/` (e.g., `orders.ts`, `products.ts`)
- Mutations live in `src/lib/mutations/` (e.g., `products.ts`)
- Use `/* GraphQL */` and `#graphql` comments for proper syntax highlighting and codegen
- Query format:
  ```typescript
  export const MY_QUERY = /* GraphQL */ `
    #graphql
    query MyQuery {
      ...
    }
  `
  ```

**Data Flow**:

1. Define GraphQL queries/mutations in `src/lib/queries/` or `src/lib/mutations/`
2. Create API wrapper functions in `src/lib/shopify.ts`
3. Call from `+page.server.ts`, `+layout.server.ts` loaders, or API routes
4. Run `pnpm codegen` to generate types

**Bulk Operations Pattern**:

For large datasets, use Shopify's bulk operations API:

1. Start bulk operation via mutation (e.g., `BULK_PRODUCTS_MUTATION`)
2. Poll operation status with `pollBulkOperationById()` from `src/lib/shopify.ts`
3. When complete, download JSONL file from returned URL
4. Stream and process JSONL using `streamJsonlFromUrl()` from `src/lib/stream-jsonl.ts`
5. Process each record with type-specific handlers (see `src/lib/server/db/bulk-record.ts`)

Example: `src/routes/api/sync/products/+server.ts` demonstrates this pattern

### SvelteKit Routing

- `+page.server.ts` - Page-specific server load functions
- `+layout.server.ts` - Layout-level server load functions (shared across routes)
- `+server.ts` - API routes (e.g., `src/routes/api/sync/products/+server.ts`)
- Server-side data fetching only (Shopify Admin API requires private credentials)

API routes export `GET`, `POST`, etc. request handlers and return `json()` or `error()` responses.

### Environment Variables

Required variables in `.env`:

**Shopify:**
- `PRIVATE_SHOPIFY_API_KEY` - Shopify API key
- `PRIVATE_SHOPIFY_API_SECRET` - Shopify API secret
- `PRIVATE_SHOPIFY_ADMIN_API_ACCESS_TOKEN` - Admin API access token
- `PRIVATE_SHOPIFY_STORE_DOMAIN` - Store domain (e.g., `example.myshopify.com`)
- `PRIVATE_SHOPIFY_API_VERSION` - API version (e.g., `2026-01`)
- `PRIVATE_SHOPIFY_APP_URL` - App URL

**Database:**
- `DATABASE_URL` - PostgreSQL connection string (for Supabase/Drizzle)

All Shopify variables use `PRIVATE_` prefix to ensure they're only available server-side via `$env/static/private`.

## GraphQL Configuration

`graphql.config.ts` configures Shopify's codegen preset:

- Uses Shopify Admin API schema from `shopify.dev/admin-graphql-direct-proxy`
- Automatically extracts GraphQL queries from code using `pluckConfig`
- Generates types to `types/` directory
- Ignores `types/` in ESLint (see `eslint.config.js`)

### Database Layer

**Stack**: Drizzle ORM + PostgreSQL (via Supabase)

**Database Client** (`src/lib/server/db/index.ts`):
- Exports `db` instance configured with postgres driver
- Schema imported from `src/lib/server/db/schema.ts`

**Schema Structure** (`src/lib/server/db/schema.ts`):
- Tables: `product`, `productVariant`, `productMedia`, `bulkOperation`
- Uses Drizzle relations for type-safe joins
- Exports typed insert/select types (e.g., `InsertProduct`, `SelectProduct`)

**Migration Workflow**:
1. Modify schema in `src/lib/server/db/schema.ts`
2. Run `pnpm db:generate` to create migration SQL files
3. Migrations are created in `supabase/migrations/` with auto-generated names
4. Run `pnpm db:migrate` to apply to database

**Query Pattern**:
```typescript
import { db } from "$lib/server/db"
import { product } from "$lib/server/db/schema"

// Upsert pattern used throughout codebase
await db
  .insert(product)
  .values(values)
  .onConflictDoUpdate({
    target: product.id,
    set: { /* fields to update */ }
  })
```

## UI Components

Uses shadcn-svelte component library (bits-ui primitives). Components are in `src/lib/components/ui/` and follow the shadcn pattern of being copied into the project (not installed as dependencies).

## Svelte 5 Specifics

This project uses Svelte 5. When writing components:

- Use runes (`$state`, `$derived`, `$effect`, etc.) for reactivity
- Component props use `let { propName } = $props()`
- No `export let` syntax from Svelte 4
