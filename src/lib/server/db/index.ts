import { DATABASE_URL } from "$env/static/private"
import * as schema from "$lib/server/db/schema"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

const connectionString = DATABASE_URL
export const client = postgres(connectionString, { prepare: false })

export const db = drizzle(client, { schema })

// Type for user context
export type UserContext = {
  userId: string
  role: string | null
}

/**
 * Execute database operations with user context for RLS
 * Use this for user-initiated operations
 */
export async function withUserContext<T>(
  context: UserContext,
  callback: () => Promise<T>
): Promise<T> {
  // Set user context in PostgreSQL session
  await client`SELECT set_app_user(${context.userId}, ${context.role ?? "user"})`

  try {
    return await callback()
  } finally {
    // Note: Connection will be returned to pool, context is transaction-isolated
  }
}

/**
 * Execute database operations with system context (bypasses RLS)
 * Use this for system operations like Shopify sync, auth operations
 */
export async function withSystemContext<T>(callback: () => Promise<T>): Promise<T> {
  await client`SELECT set_system_user()`

  try {
    return await callback()
  } finally {
    // Note: Connection will be returned to pool, context is transaction-isolated
  }
}
