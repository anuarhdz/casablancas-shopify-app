import { ApiType, pluckConfig, preset } from "@shopify/api-codegen-preset"

export default {
  schema: "https://shopify.dev/admin-graphql-direct-proxy/2026-01",
  documents: ["./**/*.{js,ts,jsx,tsx}"],
  projects: {
    default: {
      schema: "https://shopify.dev/admin-graphql-direct-proxy/2026-01",
      documents: ["./**/*.{js,ts,jsx,tsx}"],
      extensions: {
        codegen: {
          pluckConfig,
          generates: {
            "./types/admin.schema.json": {
              plugins: ["introspection"],
              config: { minify: true },
            },
            "./types/admin.types.d.ts": {
              plugins: ["typescript"],
            },
            "./types/admin.generated.d.ts": {
              preset,
              presetConfig: {
                apiType: ApiType.Admin,
              },
            },
          },
        },
      },
    },
  },
}
