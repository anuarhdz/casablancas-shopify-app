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

## Architecture

### Shopify Integration Pattern

**Client Setup** (`src/lib/shopify.ts`):

- Initializes Shopify Admin API client using `@shopify/admin-api-client`
- Credentials come from environment variables with `PRIVATE_` prefix (see `.env`)
- All API functions return `{ success: boolean, data: any }` response pattern

**GraphQL Query Organization**:

- Queries live in `src/lib/queries/` (e.g., `orders.ts`)
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

1. Define GraphQL queries in `src/lib/queries/`
2. Create API wrapper functions in `src/lib/shopify.ts`
3. Call from `+page.server.ts` or `+layout.server.ts` loaders
4. Run `pnpm codegen` to generate types

### SvelteKit Routing

- `+page.server.ts` - Page-specific server load functions
- `+layout.server.ts` - Layout-level server load functions (shared across routes)
- Server-side data fetching only (Shopify Admin API requires private credentials)

### Environment Variables

Required variables in `.env`:

- `PRIVATE_SHOPIFY_API_KEY` - Shopify API key
- `PRIVATE_SHOPIFY_API_SECRET` - Shopify API secret
- `PRIVATE_SHOPIFY_ADMIN_API_ACCESS_TOKEN` - Admin API access token
- `PRIVATE_SHOPIFY_STORE_DOMAIN` - Store domain (e.g., `example.myshopify.com`)
- `PRIVATE_SHOPIFY_API_VERSION` - API version (e.g., `2026-01`)
- `PRIVATE_SHOPIFY_APP_URL` - App URL

All use `PRIVATE_` prefix to ensure they're only available server-side via `$env/static/private`.

## GraphQL Configuration

`graphql.config.ts` configures Shopify's codegen preset:

- Uses Shopify Admin API schema from `shopify.dev/admin-graphql-direct-proxy`
- Automatically extracts GraphQL queries from code using `pluckConfig`
- Generates types to `types/` directory
- Ignores `types/` in ESLint (see `eslint.config.js`)

## Svelte 5 Specifics

This project uses Svelte 5. When writing components:

- Use runes (`$state`, `$derived`, `$effect`, etc.) for reactivity
- Component props use `let { propName } = $props()`
- No `export let` syntax from Svelte 4
