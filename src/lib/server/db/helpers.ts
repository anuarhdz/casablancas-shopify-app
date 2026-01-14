import { error } from "@sveltejs/kit"
import type { RequestEvent } from "@sveltejs/kit"
import { db, client, withUserContext, withSystemContext } from "./index"

/**
 * User context type for RLS
 */
export type UserContext = {
  userId: string
  role: string | null
}

/**
 * Get user context from SvelteKit event
 * Throws 401 if user is not authenticated
 */
export function getUserContext(event: RequestEvent): UserContext {
  if (!event.locals.user) {
    throw error(401, "Authentication required")
  }

  return {
    userId: event.locals.user.id,
    role: event.locals.user.role ?? null,
  }
}

/**
 * Get user context or null if not authenticated
 */
export function getUserContextOrNull(event: RequestEvent): UserContext | null {
  if (!event.locals.user) {
    return null
  }

  return {
    userId: event.locals.user.id,
    role: event.locals.user.role ?? null,
  }
}

/**
 * Execute database query with user context from event
 * Automatically throws 401 if not authenticated
 * Use this for user-initiated operations
 */
export async function dbWithUser<T>(
  event: RequestEvent,
  callback: () => Promise<T>
): Promise<T> {
  const context = getUserContext(event)
  return withUserContext(context, callback)
}

/**
 * Execute database query with system context (bypasses RLS)
 * Use this for system operations like Shopify sync, auth operations
 */
export async function dbWithSystem<T>(callback: () => Promise<T>): Promise<T> {
  return withSystemContext(callback)
}

/**
 * Check if user has required role
 * Throws 401 if not authenticated, 403 if insufficient permissions
 */
export function requireRole(event: RequestEvent, allowedRoles: string[]) {
  const user = event.locals.user

  if (!user) {
    throw error(401, "Authentication required")
  }

  const userRole = user.role ?? "user"

  if (!allowedRoles.includes(userRole)) {
    throw error(403, "Insufficient permissions")
  }
}

// Re-export db for convenience
export { db }
