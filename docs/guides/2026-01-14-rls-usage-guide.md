# Row Level Security - Usage Guide

**Date:** 2026-01-14
**Audience:** Developers working on this codebase

## Quick Start

### For Page Loaders (`+page.server.ts`)

```typescript
import { dbWithUser } from "$lib/server/db/helpers"

export const load: PageServerLoad = async (event) => {
  // Automatically uses user context from event.locals.user
  // Throws 401 if not authenticated
  const products = await dbWithUser(event, () =>
    db.select().from(product).limit(20)
  )

  return { products }
}
```

### For API Routes with Authentication

```typescript
import { dbWithUser, requireRole } from "$lib/server/db/helpers"

export const POST: RequestHandler = async (event) => {
  // Ensure user is admin before proceeding
  requireRole(event, ['admin'])

  const data = await event.request.json()

  const newProduct = await dbWithUser(event, () =>
    db.insert(product).values(data).returning()
  )

  return json(newProduct)
}
```

### For System Operations (Shopify Sync, OAuth)

```typescript
import { dbWithSystem } from "$lib/server/db/helpers"

export const POST: RequestHandler = async () => {
  // Bypass RLS for system operations
  const result = await dbWithSystem(() =>
    db.insert(bulkOperation).values(data)
  )

  return json(result)
}
```

## Available Helper Functions

### `dbWithUser(event, callback)`
**Use for:** User-initiated operations
**Throws:** 401 if not authenticated
**Sets context:** `current_app_user_id()` and `current_app_user_role()`

```typescript
const orders = await dbWithUser(event, () =>
  db.select().from(order).where(eq(order.userId, userId))
)
```

### `dbWithSystem(callback)`
**Use for:** System operations that need to bypass RLS
**Sets context:** `role = 'system'`

```typescript
await dbWithSystem(() =>
  db.insert(shopifySession).values(sessionData)
)
```

### `getUserContext(event)`
**Returns:** `{ userId: string, role: string | null }`
**Throws:** 401 if not authenticated

```typescript
const context = getUserContext(event)
console.log(`User ${context.userId} with role ${context.role}`)
```

### `requireRole(event, allowedRoles)`
**Use for:** Role-based access control
**Throws:** 401 if not authenticated, 403 if insufficient permissions

```typescript
requireRole(event, ['admin']) // Only admins
requireRole(event, ['admin', 'staff']) // Admins or staff
```

## Role Permissions Matrix

| Resource | Admin | Staff | User | Anonymous | System |
|----------|-------|-------|------|-----------|--------|
| **Products** | ✅ CRUD | 👁️ View | ❌ | ❌ | ✅ CRUD |
| **Product Variants** | ✅ CRUD | 👁️ View | ❌ | ❌ | ✅ CRUD |
| **Product Media** | ✅ CRUD | 👁️ View | ❌ | ❌ | ✅ CRUD |
| **Users (all)** | ✅ CRUD | ❌ | ❌ | ❌ | ✅ CRUD |
| **Users (own)** | ✅ | ✅ View/Update | ✅ View/Update | ❌ | ✅ |
| **Sessions (all)** | 👁️ View, 🗑️ Delete | ❌ | ❌ | ❌ | ✅ CRUD |
| **Sessions (own)** | ✅ | ✅ View/Delete | ✅ View/Delete | ❌ | ✅ |
| **Bulk Operations** | 👁️ View | ❌ | ❌ | ❌ | ✅ CRUD |
| **Shopify Sessions** | 👁️ View | ❌ | ❌ | ❌ | ✅ CRUD |

Legend: ✅ Full Access | 👁️ Read Only | 🗑️ Delete Only | ❌ No Access

## Common Patterns

### Pattern 1: Protected Page with Role Check

```typescript
// src/routes/(app)/admin/users/+page.server.ts
import { dbWithUser, requireRole } from "$lib/server/db/helpers"

export const load: PageServerLoad = async (event) => {
  // Only admins can access this page
  requireRole(event, ['admin'])

  const users = await dbWithUser(event, () =>
    db.select().from(user).orderBy(desc(user.createdAt))
  )

  return { users }
}
```

### Pattern 2: User Profile Update (Own Only)

```typescript
// src/routes/(app)/account/+server.ts
export const POST: RequestHandler = async (event) => {
  const context = getUserContext(event)
  const data = await event.request.json()

  // RLS ensures user can only update their own profile
  const updated = await dbWithUser(event, () =>
    db.update(user)
      .set({ name: data.name, image: data.image })
      .where(eq(user.id, context.userId))
      .returning()
  )

  return json(updated)
}
```

### Pattern 3: Admin Creates User with Role

```typescript
// Uses Better Auth admin plugin
import { auth } from "$lib/server/auth"

export const POST: RequestHandler = async (event) => {
  requireRole(event, ['admin'])

  // Better Auth handles this through RLS policies
  const newUser = await auth.api.createUser({
    body: {
      email: "staff@example.com",
      password: "secure-password",
      name: "Staff Member",
      role: "staff" // Admin can set any role
    }
  })

  return json(newUser)
}
```

### Pattern 4: Shopify Sync (System Context)

```typescript
// src/routes/api/sync/products/+server.ts
import { dbWithSystem } from "$lib/server/db/helpers"

export const POST: RequestHandler = async () => {
  // Fetch from Shopify API (no RLS needed)
  const shopifyProducts = await fetchShopifyProducts()

  // Save to DB with system context (bypass RLS)
  await dbWithSystem(async () => {
    for (const product of shopifyProducts) {
      await db.insert(product).values(product)
        .onConflictDoUpdate({
          target: product.id,
          set: product
        })
    }
  })

  return json({ success: true })
}
```

## Better Auth Admin Plugin Integration

All Better Auth admin operations work seamlessly with RLS:

### Admin Operations Supported

```typescript
// Create user (any role)
await auth.api.createUser({
  body: { email, password, name, role: "admin" }
})

// Ban user
await auth.api.banUser({
  body: { userId, banReason: "Violation", banExpiresIn: 86400 }
})

// Change user role
await auth.api.setRole({
  body: { userId, role: "staff" }
})

// List user sessions
const sessions = await auth.api.listUserSessions({
  query: { userId }
})

// Revoke user session
await auth.api.revokeUserSession({
  body: { sessionId }
})

// Delete user
await auth.api.removeUser({
  body: { userId }
})
```

### How It Works

Better Auth operations automatically work because:
1. Admin users have `role = 'admin'` in the `user` table
2. RLS policies check `is_admin()` which queries the user table
3. Policies permit admins to do INSERT/UPDATE/DELETE on `user` and `session` tables

## Troubleshooting

### Error: "new row violates row-level security policy"

**Cause:** Trying to insert/update without proper context or permissions

**Solutions:**
1. Check if you're using `dbWithUser()` or `dbWithSystem()`
2. Verify user has correct role in database
3. Check if operation should be using system context

**Example:**
```typescript
// ❌ Wrong - direct db call
await db.insert(product).values(data) // Fails!

// ✅ Correct - with context
await dbWithSystem(() =>
  db.insert(product).values(data)
)
```

### Error: "current_setting: unrecognized configuration parameter"

**Cause:** User context not set before query

**Solution:** Always wrap queries with `dbWithUser()` or `dbWithSystem()`

### Admin Operations Failing

**Cause:** User doesn't actually have `role = 'admin'` in database

**Solution:** Verify in Supabase Studio:
```sql
SELECT id, email, role FROM "user" WHERE email = 'admin@example.com';
```

If role is wrong, update:
```sql
UPDATE "user" SET role = 'admin' WHERE email = 'admin@example.com';
```

### Signup Not Working

**Cause:** RLS blocking public signup

**Solution:** The `user_insert_public_signup` policy should allow this. Verify it exists:
```sql
SELECT * FROM pg_policies
WHERE tablename = 'user'
  AND policyname = 'user_insert_public_signup';
```

## Testing Your Code

### Unit Test Example
```typescript
import { describe, it, expect } from 'vitest'
import { withUserContext, withSystemContext } from '$lib/server/db'

describe('RLS Context', () => {
  it('should set user context correctly', async () => {
    const result = await withUserContext(
      { userId: 'test-123', role: 'admin' },
      async () => {
        // Query to verify context was set
        const [row] = await db.execute(
          sql`SELECT current_app_user_id() as id, current_app_user_role() as role`
        )
        return row
      }
    )

    expect(result.id).toBe('test-123')
    expect(result.role).toBe('admin')
  })
})
```

### Integration Test Example
```typescript
describe('Product Access', () => {
  it('should allow admin to create product', async () => {
    const product = await withUserContext(
      { userId: 'admin-1', role: 'admin' },
      () => db.insert(product).values(testProduct).returning()
    )

    expect(product).toBeDefined()
  })

  it('should prevent staff from creating product', async () => {
    await expect(
      withUserContext(
        { userId: 'staff-1', role: 'staff' },
        () => db.insert(product).values(testProduct)
      )
    ).rejects.toThrow()
  })
})
```

## Best Practices

### ✅ DO

- Always use `dbWithUser()` for user-initiated operations
- Use `dbWithSystem()` for background jobs and sync operations
- Check roles with `requireRole()` for sensitive endpoints
- Test RLS policies with different user roles

### ❌ DON'T

- Don't bypass RLS without good reason
- Don't use `db.*` directly without context wrappers
- Don't hardcode user IDs in queries (use `current_app_user_id()`)
- Don't trust client-side role checks only

## Performance Considerations

RLS policies are evaluated **per row**, so they can impact performance on large queries. However:

- Our policies are simple (mostly function calls)
- PostgreSQL caches function results within a transaction
- Indexes on `user.role` and foreign keys help performance

If you notice slow queries:

```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM product;

-- Check if RLS is the bottleneck
SET role postgres; -- Bypass RLS
EXPLAIN ANALYZE SELECT * FROM product;
```

## Additional Resources

- [Implementation ADR](../decisions/2026-01-14-row-level-security-implementation.md)
- [RLS Policies Architecture](../architecture/2026-01-14-rls-policies.md)
- [Better Auth Admin Plugin Docs](https://www.better-auth.com/docs/plugins/admin)
