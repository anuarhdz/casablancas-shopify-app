# Casablancas App

SvelteKit application integrated with Shopify Admin API for managing store data.

## Tech Stack

- **SvelteKit 2** with Svelte 5
- **TypeScript**
- **Tailwind CSS 4**
- **Shopify Admin API** via `@shopify/admin-api-client`
- **GraphQL Code Generator** for type-safe API queries
- **pnpm** for package management

## Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A Shopify store with Admin API access

## Installation

1. Clone the repository and install dependencies:

```sh
pnpm install
```

2. Create a `.env` file in the root directory with your Shopify credentials:

```sh
# Shopify Admin API Credentials
PRIVATE_SHOPIFY_API_KEY=your_api_key
PRIVATE_SHOPIFY_API_SECRET=your_api_secret
PRIVATE_SHOPIFY_ADMIN_API_ACCESS_TOKEN=your_admin_access_token
PRIVATE_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
PRIVATE_SHOPIFY_API_VERSION=2026-01
PRIVATE_SHOPIFY_APP_URL=https://your-app-url.com
```

3. Generate TypeScript types from the Shopify GraphQL schema:

```sh
pnpm codegen
```

## Shopify Admin API Setup

### Creating a Shopify App

1. Go to your Shopify Partner Dashboard or store admin
2. Create a new app (custom app)
3. Configure Admin API access scopes (e.g., `read_orders`, `write_orders`)
4. Install the app on your store
5. Copy the credentials to your `.env` file:
   - **API Key** → `PRIVATE_SHOPIFY_API_KEY`
   - **API Secret** → `PRIVATE_SHOPIFY_API_SECRET`
   - **Admin API Access Token** → `PRIVATE_SHOPIFY_ADMIN_API_ACCESS_TOKEN`

### API Version

The app is currently configured to use API version `2026-01`. You can change this in:

- `.env` - `PRIVATE_SHOPIFY_API_VERSION`
- `graphql.config.ts` - schema URL

## Development

Start the development server:

```sh
pnpm dev

# or open browser automatically
pnpm dev -- --open
```

The app will be available at `http://localhost:5173`

## GraphQL Code Generation

When you add or modify GraphQL queries:

1. Write your query in `src/lib/queries/` using this format:

```typescript
export const MY_QUERY = /* GraphQL */ `
  #graphql
  query MyQuery {
    # your query
  }
`
```

2. Run codegen to generate TypeScript types:

```sh
pnpm codegen
```

Generated types will be available in `types/admin.generated.d.ts`

## Available Scripts

```sh
pnpm dev              # Start development server
pnpm build            # Create production build
pnpm preview          # Preview production build
pnpm check            # Type-check with svelte-check
pnpm check:watch      # Type-check in watch mode
pnpm lint             # Run prettier and eslint
pnpm format           # Format all files
pnpm codegen          # Generate GraphQL types
```

## Project Structure

```
src/
├── lib/
│   ├── queries/          # GraphQL queries
│   │   └── orders.ts
│   ├── shopify.ts        # Shopify API client & wrapper functions
│   └── index.ts
├── routes/
│   ├── +layout.server.ts # Layout-level data loading
│   ├── +layout.svelte    # Root layout component
│   ├── +page.server.ts   # Page-level data loading
│   └── +page.svelte      # Homepage component
types/                    # Generated GraphQL types (auto-generated)
```

## Deployment

Build the production version:

```sh
pnpm build
```

Preview the build:

```sh
pnpm preview
```

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
