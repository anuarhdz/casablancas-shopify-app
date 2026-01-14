# Row Level Security - Policies Architecture

**Date:** 2026-01-14
**Type:** Architecture Documentation

## Overview

This document describes the complete RLS policy architecture for the application, including all PostgreSQL functions, policies, and their interactions.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SvelteKit Application                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐      ┌──────────────┐     ┌──────────────┐  │
│  │ Page Loaders │      │  API Routes  │     │ Better Auth  │  │
│  └──────┬───────┘      └──────┬───────┘     └──────┬───────┘  │
│         │                     │                     │           │
│         └─────────────────────┼─────────────────────┘           │
│                               │                                 │
│                    ┌──────────▼──────────┐                      │
│                    │  DB Helper Functions │                     │
│                    │  - dbWithUser()      │                     │
│                    │  - dbWithSystem()    │                     │
│                    │  - requireRole()     │                     │
│                    └──────────┬───────────┘                     │
│                               │                                 │
└───────────────────────────────┼─────────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │ withUserContext() OR  │
                    │ withSystemContext()   │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │  PostgreSQL Session   │
                    │  Variables:           │
                    │  - app.current_user_id│
                    │  - app.current_user_role │
                    └───────────┬───────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                      PostgreSQL Database                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              RLS Helper Functions                       │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  • current_app_user_id() → TEXT                        │    │
│  │  • current_app_user_role() → TEXT                      │    │
│  │  • is_admin() → BOOLEAN (checks DB role)               │    │
│  │  • is_staff_or_admin() → BOOLEAN                       │    │
│  │  • is_system() → BOOLEAN                               │    │
│  └────────────────────────────────────────────────────────┘    │
│                               ▲                                 │
│                               │                                 │
│  ┌────────────────────────────┴───────────────────────────┐    │
│  │                  RLS Policies (36 total)                │    │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  • user (7 policies)                                    │   │
│  │  • account (4 policies)                                 │   │
│  │  • session (4 policies)                                 │   │
│  │  • verification (3 policies)                            │   │
│  │  • product (4 policies)                                 │   │
│  │  • product_variant (4 policies)                         │   │
│  │  • product_media (4 policies)                           │   │
│  │  • bulk_operation (2 policies)                          │   │
│  │  • shopify_session (2 policies)                         │   │
│  │  • shopify_store (2 policies)                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## PostgreSQL Functions

### Context Management Functions

#### `set_app_user(user_id TEXT, user_role TEXT)`
**Purpose:** Sets the current user context for the PostgreSQL session
**Returns:** `void`
**Security:** `SECURITY DEFINER`

```sql
PERFORM set_config('app.current_user_id', user_id, false);
PERFORM set_config('app.current_user_role', COALESCE(user_role, 'user'), false);
```

**Called by:** Application layer via `withUserContext()`

#### `set_system_user()`
**Purpose:** Sets system context (bypasses RLS)
**Returns:** `void`
**Security:** `SECURITY DEFINER`

```sql
PERFORM set_config('app.current_user_id', 'system', false);
PERFORM set_config('app.current_user_role', 'system', false);
```

**Called by:** Application layer via `withSystemContext()`

### Context Reading Functions

#### `current_app_user_id()`
**Purpose:** Gets the current user ID from session variables
**Returns:** `TEXT` (null if not set)
**Stability:** `STABLE`

```sql
RETURN current_setting('app.current_user_id', true);
```

#### `current_app_user_role()`
**Purpose:** Gets the current user role from session variables
**Returns:** `TEXT` (defaults to 'anonymous' if not set)
**Stability:** `STABLE`

```sql
RETURN COALESCE(current_setting('app.current_user_role', true), 'anonymous');
```

### Authorization Check Functions

#### `is_admin()`
**Purpose:** Checks if current user is admin (checks both session and DB)
**Returns:** `BOOLEAN`
**Stability:** `STABLE`

**Logic:**
1. Check session role → If 'admin', return true
2. If 'system', return false (system has separate privileges)
3. Query `user` table for actual role
4. Return true if DB role is 'admin'

**Critical for:** Better Auth admin plugin operations

#### `is_staff_or_admin()`
**Purpose:** Checks if current user is staff or admin
**Returns:** `BOOLEAN`
**Stability:** `STABLE`

**Logic:** Similar to `is_admin()` but checks for both 'admin' and 'staff' roles

#### `is_system()`
**Purpose:** Checks if current context is system
**Returns:** `BOOLEAN`
**Stability:** `STABLE`

```sql
RETURN current_app_user_role() = 'system';
```

## RLS Policies by Table

### User Table (7 policies)

| Policy Name | Command | Check | Purpose |
|-------------|---------|-------|---------|
| `user_select` | SELECT | `id = current_app_user_id() OR is_admin() OR is_system()` | Users see own profile, admins see all |
| `user_insert_public_signup` | INSERT | `role IS NULL OR role = 'user'` | Allow public signup with user role only |
| `user_insert_admin` | INSERT | `is_admin()` | Admins can create users with any role |
| `user_update_own` | UPDATE | `id = current_app_user_id()` + protected fields check | Users can update own profile (except role/ban fields) |
| `user_update_admin` | UPDATE | `is_admin()` | Admins can update any user |
| `user_delete_admin` | DELETE | `is_admin()` | Admins can delete users |
| `user_system_all` | ALL | `is_system()` | System bypasses all checks |

**Protected Fields** (users cannot modify):
- `role`
- `banned`
- `ban_reason`
- `ban_expires`

### Account Table (4 policies)

| Policy Name | Command | Check | Purpose |
|-------------|---------|-------|---------|
| `account_select_own` | SELECT | `user_id = current_app_user_id() OR is_admin() OR is_system()` | Users see own accounts, admins see all |
| `account_insert` | INSERT | `is_system() OR user_id = current_app_user_id()` | System and users can create accounts (signup) |
| `account_update` | UPDATE | `is_system() OR user_id = current_app_user_id()` | System and users can update own accounts |
| `account_delete_admin` | DELETE | `is_admin() OR is_system()` | Admins can delete accounts (user management) |

### Session Table (4 policies)

| Policy Name | Command | Check | Purpose |
|-------------|---------|-------|---------|
| `session_select` | SELECT | `user_id = current_app_user_id() OR is_admin() OR is_system()` | Users see own sessions, admins see all |
| `session_insert` | INSERT | `is_system() OR user_id = current_app_user_id()` | System and users can create sessions (login) |
| `session_update` | UPDATE | `is_system()` | Only system can update sessions |
| `session_delete` | DELETE | `user_id = current_app_user_id() OR is_admin() OR is_system()` | Users delete own, admins delete any (revoke) |

### Verification Table (3 policies)

| Policy Name | Command | Check | Purpose |
|-------------|---------|-------|---------|
| `verification_select_public` | SELECT | `true` | Public can read verification codes |
| `verification_insert_public` | INSERT | `true` | Public can create verification requests |
| `verification_all` | ALL | `is_system()` | System has full control |

**Note:** Public access needed for Better Auth email verification flow

### Product Table (4 policies)

| Policy Name | Command | Check | Purpose |
|-------------|---------|-------|---------|
| `product_select` | SELECT | `is_staff_or_admin() OR is_system()` | Staff and admins can view products |
| `product_insert` | INSERT | `is_admin() OR is_system()` | Only admins and system can create products |
| `product_update` | UPDATE | `is_admin() OR is_system()` | Only admins and system can update products |
| `product_delete` | DELETE | `is_admin() OR is_system()` | Only admins and system can delete products |

### Product Variant Table (4 policies)

Identical structure to Product table:
- `product_variant_select` → Staff can view
- `product_variant_insert/update/delete` → Admin/system only

### Product Media Table (4 policies)

Identical structure to Product table:
- `product_media_select` → Staff can view
- `product_media_insert/update/delete` → Admin/system only

### Bulk Operation Table (2 policies)

| Policy Name | Command | Check | Purpose |
|-------------|---------|-------|---------|
| `bulk_operation_select` | SELECT | `is_admin() OR is_system()` | Admins can view bulk operations |
| `bulk_operation_all` | ALL | `is_system()` | Only system can manage bulk operations |

### Shopify Session Table (2 policies)

| Policy Name | Command | Check | Purpose |
|-------------|---------|-------|---------|
| `shopify_session_select` | SELECT | `is_admin() OR is_system()` | Admins can view Shopify OAuth config |
| `shopify_session_all` | ALL | `is_system()` | Only system can manage Shopify sessions |

### Shopify Store Table (2 policies)

Identical structure to Shopify Session table:
- `shopify_store_select` → Admins can view
- `shopify_store_all` → System only

## Policy Evaluation Flow

### Example: Staff User Viewing Products

```
1. Request: GET /products
   ↓
2. hooks.server.ts extracts user from Better Auth
   event.locals.user = { id: "staff-123", role: "staff" }
   ↓
3. +page.server.ts calls dbWithUser(event, callback)
   ↓
4. withUserContext() calls PostgreSQL:
   SELECT set_app_user('staff-123', 'staff')
   ↓
5. Query executed: SELECT * FROM product
   ↓
6. PostgreSQL evaluates policy "product_select"
   USING (is_staff_or_admin() OR is_system())
   ↓
7. is_staff_or_admin() checks:
   - Session role = 'staff' → TRUE
   - Returns TRUE
   ↓
8. Policy PASSES → Rows returned to application
   ↓
9. Response: Products displayed to user
```

### Example: Staff User Trying to Create Product (Fails)

```
1. Request: POST /api/products
   ↓
2. User context set: { id: "staff-123", role: "staff" }
   ↓
3. Query executed: INSERT INTO product VALUES (...)
   ↓
4. PostgreSQL evaluates policy "product_insert"
   WITH CHECK (is_admin() OR is_system())
   ↓
5. is_admin() checks:
   - Session role = 'staff' → Continue
   - Query user table: SELECT role FROM user WHERE id = 'staff-123'
   - DB role = 'staff' → FALSE
   - Returns FALSE
   ↓
6. is_system() checks:
   - Session role = 'staff' ≠ 'system' → FALSE
   ↓
7. Policy FAILS → Error thrown
   ↓
8. Response: 500 "new row violates row-level security policy"
```

### Example: System Context for Shopify Sync

```
1. Request: POST /api/sync/products
   ↓
2. API route calls dbWithSystem(callback)
   ↓
3. withSystemContext() calls PostgreSQL:
   SELECT set_system_user()
   ↓
4. Query executed: INSERT INTO product VALUES (...)
   ↓
5. PostgreSQL evaluates policy "product_insert"
   WITH CHECK (is_admin() OR is_system())
   ↓
6. is_system() checks:
   - Session role = 'system' → TRUE
   - Returns TRUE
   ↓
7. Policy PASSES → Row inserted
   ↓
8. Response: Success
```

## Better Auth Admin Plugin Integration

### How Admin Operations Work

When an admin user (with `role = 'admin'` in DB) calls admin plugin functions:

```typescript
await auth.api.createUser({ body: { email, password, role: "staff" } })
```

**Flow:**
1. Better Auth verifies the requesting user is admin (checks `adminUserIds` or role)
2. Better Auth calls Drizzle to insert into `user` table
3. Application has set user context: `set_app_user('admin-id', 'admin')`
4. Policy `user_insert_admin` is evaluated: `WITH CHECK (is_admin())`
5. `is_admin()` returns TRUE (because session role is 'admin' AND DB role is 'admin')
6. Insert succeeds

### Admin Operations Supported

All these work because policies allow admins:

- ✅ `createUser()` → `user_insert_admin` policy
- ✅ `banUser()` → `user_update_admin` policy
- ✅ `setRole()` → `user_update_admin` policy
- ✅ `listUserSessions()` → `session_select` policy
- ✅ `revokeUserSession()` → `session_delete` policy
- ✅ `removeUser()` → `user_delete_admin` policy

## Security Considerations

### Defense in Depth

RLS provides database-level security even if:
- Application code has bugs
- Developer forgets to check permissions
- SQL injection vulnerability exists

### Transaction Isolation

Session variables are **transaction-scoped**, not connection-scoped:
- Each request gets a fresh transaction
- Context cannot leak between requests
- Connection pooling is safe

### Role Escalation Prevention

Users cannot escalate their own roles:
- `user_update_own` policy prevents modifying `role` field
- Only admins can call `setRole()`
- Only system can create users with non-'user' roles (except admins)

### Public Signup Security

`user_insert_public_signup` allows public signup but:
- Only allows `role = 'user'` or `NULL`
- Cannot create admins or staff via this policy
- Admins must be created via `user_insert_admin` policy

## Performance Impact

### Minimal Overhead

RLS policies add minimal performance overhead because:
1. Functions are `STABLE` (cacheable within transaction)
2. Simple boolean checks (no complex joins)
3. `is_admin()` only queries DB once per transaction
4. PostgreSQL optimizes policy evaluation

### Monitoring

To check if RLS is impacting performance:

```sql
-- With RLS enabled
EXPLAIN ANALYZE SELECT * FROM product;

-- Temporarily bypass RLS to compare
SET ROLE postgres;
EXPLAIN ANALYZE SELECT * FROM product;
RESET ROLE;
```

## Migration Files

### Main Migration
`supabase/migrations/0011_rls_implementation.sql` (650+ lines)

**Sections:**
1. Helper functions (7 functions)
2. Enable RLS on all tables
3. User table policies
4. Account table policies
5. Session table policies
6. Verification table policies
7. Product table policies
8. Product variant table policies
9. Product media table policies
10. Bulk operation table policies
11. Shopify session table policies
12. Shopify store table policies
13. Assign roles to existing users

## Testing Strategy

See [RLS Pending Tests](../testing/2026-01-14-rls-pending-tests.md) for complete test plan.

## Related Documentation

- [Implementation ADR](../decisions/2026-01-14-row-level-security-implementation.md)
- [Usage Guide](../guides/2026-01-14-rls-usage-guide.md)
- [Validation Results](../testing/2026-01-14-rls-validation-results.md)
