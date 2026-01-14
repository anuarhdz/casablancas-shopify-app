# RLS Implementation - Pending Tests

**Date:** 2026-01-14
**Status:** ⏳ Pending Execution
**Purpose:** Comprehensive test plan for RLS implementation validation

## Overview

This document contains all pending tests that should be executed to fully validate the RLS implementation. Tests are divided into:
1. **SQL Tests** - Execute in Supabase Studio SQL Editor
2. **Manual Application Tests** - Test through the application UI
3. **Integration Tests** - Automated tests (future)

---

## Part 1: SQL Tests (Supabase Studio)

### Prerequisites

Before running these tests, you need multiple test users:

```sql
-- Create test users (run with system context or as postgres)
-- Note: In production, these would be created via Better Auth signup

-- 1. Create admin user (if not exists)
INSERT INTO "user" (id, name, email, "email_verified", role, banned, "created_at", "updated_at")
VALUES
  ('test-admin-001', 'Admin User', 'admin@test.com', true, 'admin', false, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- 2. Create staff user
INSERT INTO "user" (id, name, email, "email_verified", role, banned, "created_at", "updated_at")
VALUES
  ('test-staff-001', 'Staff User', 'staff@test.com', true, 'staff', false, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET role = 'staff';

-- 3. Create regular user
INSERT INTO "user" (id, name, email, "email_verified", role, banned, "created_at", "updated_at")
VALUES
  ('test-user-001', 'Regular User', 'user@test.com', true, 'user', false, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET role = 'user';

-- Verify users created
SELECT id, email, role FROM "user" WHERE email LIKE '%@test.com';
```

---

### Test Suite 1: Context Functions

#### Test 1.1: Set and Read Admin Context
```sql
-- Set admin context
SELECT set_app_user('test-admin-001', 'admin');

-- Verify context set correctly
SELECT
  current_app_user_id() as user_id,
  current_app_user_role() as role,
  is_admin() as is_admin,
  is_staff_or_admin() as is_staff_or_admin,
  is_system() as is_system;

-- Expected Result:
-- user_id: 'test-admin-001'
-- role: 'admin'
-- is_admin: true
-- is_staff_or_admin: true
-- is_system: false
```
**Status:** [ ] Pass [ ] Fail

---

#### Test 1.2: Set and Read Staff Context
```sql
-- Set staff context
SELECT set_app_user('test-staff-001', 'staff');

-- Verify context
SELECT
  current_app_user_id() as user_id,
  current_app_user_role() as role,
  is_admin() as is_admin,
  is_staff_or_admin() as is_staff_or_admin,
  is_system() as is_system;

-- Expected Result:
-- user_id: 'test-staff-001'
-- role: 'staff'
-- is_admin: false
-- is_staff_or_admin: true
-- is_system: false
```
**Status:** [ ] Pass [ ] Fail

---

#### Test 1.3: Set and Read System Context
```sql
-- Set system context
SELECT set_system_user();

-- Verify context
SELECT
  current_app_user_id() as user_id,
  current_app_user_role() as role,
  is_admin() as is_admin,
  is_system() as is_system;

-- Expected Result:
-- user_id: 'system'
-- role: 'system'
-- is_admin: false (system has its own privileges)
-- is_system: true
```
**Status:** [ ] Pass [ ] Fail

---

### Test Suite 2: Product Access Policies

#### Test 2.1: Staff Can View Products
```sql
-- Set staff context
SELECT set_app_user('test-staff-001', 'staff');

-- Try to select products
SELECT id, title, status FROM product LIMIT 5;

-- Expected: Should return products (or empty if no products exist)
-- Should NOT throw RLS error
```
**Status:** [ ] Pass [ ] Fail

---

#### Test 2.2: Staff Cannot Insert Products
```sql
-- Set staff context
SELECT set_app_user('test-staff-001', 'staff');

-- Try to insert product
INSERT INTO product (id, title, handle, status)
VALUES ('test-prod-001', 'Test Product Staff', 'test-product-staff', 'ACTIVE');

-- Expected: ERROR - new row violates row-level security policy
```
**Status:** [ ] Pass [ ] Fail

**Cleanup:**
```sql
-- If test somehow passed, clean up
SELECT set_system_user();
DELETE FROM product WHERE id = 'test-prod-001';
```

---

#### Test 2.3: Admin Can Insert Products
```sql
-- Set admin context
SELECT set_app_user('test-admin-001', 'admin');

-- Try to insert product
INSERT INTO product (id, title, handle, status)
VALUES ('test-prod-002', 'Test Product Admin', 'test-product-admin', 'ACTIVE');

-- Expected: Success (1 row inserted)

-- Verify it was inserted
SELECT id, title FROM product WHERE id = 'test-prod-002';
```
**Status:** [ ] Pass [ ] Fail

**Cleanup:**
```sql
-- Clean up test product
SELECT set_system_user();
DELETE FROM product WHERE id = 'test-prod-002';
```

---

#### Test 2.4: Regular User Cannot View Products
```sql
-- Set user context
SELECT set_app_user('test-user-001', 'user');

-- Try to select products
SELECT id, title FROM product LIMIT 5;

-- Expected: Returns 0 rows (not an error, just no rows match the policy)
-- Policy requires is_staff_or_admin() which is false for regular users
```
**Status:** [ ] Pass [ ] Fail

---

#### Test 2.5: System Can Insert Products
```sql
-- Set system context
SELECT set_system_user();

-- Insert product
INSERT INTO product (id, title, handle, status)
VALUES ('test-prod-003', 'Test Product System', 'test-product-system', 'ACTIVE');

-- Expected: Success

-- Verify
SELECT id, title FROM product WHERE id = 'test-prod-003';
```
**Status:** [ ] Pass [ ] Fail

**Cleanup:**
```sql
DELETE FROM product WHERE id = 'test-prod-003';
```

---

### Test Suite 3: User Table Policies

#### Test 3.1: Admin Can View All Users
```sql
-- Set admin context
SELECT set_app_user('test-admin-001', 'admin');

-- View all users
SELECT id, email, role FROM "user" ORDER BY "created_at" DESC;

-- Expected: Should see all users including test users
```
**Status:** [ ] Pass [ ] Fail

---

#### Test 3.2: Staff Can Only View Own Profile
```sql
-- Set staff context
SELECT set_app_user('test-staff-001', 'staff');

-- Try to view all users
SELECT id, email, role FROM "user";

-- Expected: Should only see test-staff-001 (1 row)
```
**Status:** [ ] Pass [ ] Fail

---

#### Test 3.3: User Cannot Modify Own Role
```sql
-- Set user context
SELECT set_app_user('test-user-001', 'user');

-- Try to escalate privileges
UPDATE "user"
SET role = 'admin'
WHERE id = 'test-user-001';

-- Expected: ERROR - new row violates row-level security policy
-- (user_update_own policy prevents role modification)
```
**Status:** [ ] Pass [ ] Fail

---

#### Test 3.4: User Can Update Own Name
```sql
-- Set user context
SELECT set_app_user('test-user-001', 'user');

-- Update own name
UPDATE "user"
SET name = 'Updated User Name'
WHERE id = 'test-user-001';

-- Expected: Success (1 row updated)

-- Verify
SELECT id, name FROM "user" WHERE id = 'test-user-001';
```
**Status:** [ ] Pass [ ] Fail

**Cleanup:**
```sql
SELECT set_system_user();
UPDATE "user" SET name = 'Regular User' WHERE id = 'test-user-001';
```

---

#### Test 3.5: Admin Can Update User Role
```sql
-- Set admin context
SELECT set_app_user('test-admin-001', 'admin');

-- Update staff user to admin
UPDATE "user"
SET role = 'admin'
WHERE id = 'test-staff-001';

-- Expected: Success

-- Verify
SELECT id, email, role FROM "user" WHERE id = 'test-staff-001';

-- Revert
UPDATE "user" SET role = 'staff' WHERE id = 'test-staff-001';
```
**Status:** [ ] Pass [ ] Fail

---

#### Test 3.6: Admin Can Ban User
```sql
-- Set admin context
SELECT set_app_user('test-admin-001', 'admin');

-- Ban user
UPDATE "user"
SET
  banned = true,
  ban_reason = 'Test ban',
  ban_expires = NOW() + INTERVAL '1 day'
WHERE id = 'test-user-001';

-- Expected: Success

-- Verify
SELECT id, email, banned, ban_reason FROM "user" WHERE id = 'test-user-001';

-- Unban
UPDATE "user"
SET banned = false, ban_reason = NULL, ban_expires = NULL
WHERE id = 'test-user-001';
```
**Status:** [ ] Pass [ ] Fail

---

### Test Suite 4: Session Management

#### Test 4.1: User Can View Own Sessions
```sql
-- First, create a test session for user
SELECT set_system_user();
INSERT INTO session (id, "user_id", token, "expires_at", "ip_address", "user_agent")
VALUES ('test-sess-001', 'test-user-001', 'test-token-001', NOW() + INTERVAL '1 day', '127.0.0.1', 'Test Browser');

-- Set user context
SELECT set_app_user('test-user-001', 'user');

-- View own sessions
SELECT id, "user_id", token FROM session WHERE "user_id" = 'test-user-001';

-- Expected: Should see test-sess-001
```
**Status:** [ ] Pass [ ] Fail

**Cleanup:**
```sql
SELECT set_system_user();
DELETE FROM session WHERE id = 'test-sess-001';
```

---

#### Test 4.2: Admin Can View All Sessions
```sql
-- Create sessions for multiple users
SELECT set_system_user();
INSERT INTO session (id, "user_id", token, "expires_at")
VALUES
  ('test-sess-002', 'test-admin-001', 'admin-token', NOW() + INTERVAL '1 day'),
  ('test-sess-003', 'test-staff-001', 'staff-token', NOW() + INTERVAL '1 day'),
  ('test-sess-004', 'test-user-001', 'user-token', NOW() + INTERVAL '1 day');

-- Set admin context
SELECT set_app_user('test-admin-001', 'admin');

-- View all sessions
SELECT id, "user_id" FROM session WHERE id LIKE 'test-sess-%';

-- Expected: Should see all 3 sessions
```
**Status:** [ ] Pass [ ] Fail

**Cleanup:**
```sql
SELECT set_system_user();
DELETE FROM session WHERE id LIKE 'test-sess-%';
```

---

#### Test 4.3: Admin Can Revoke Any User's Session
```sql
-- Create session
SELECT set_system_user();
INSERT INTO session (id, "user_id", token, "expires_at")
VALUES ('test-sess-005', 'test-staff-001', 'revoke-test', NOW() + INTERVAL '1 day');

-- Set admin context
SELECT set_app_user('test-admin-001', 'admin');

-- Revoke staff session
DELETE FROM session WHERE id = 'test-sess-005';

-- Expected: Success (1 row deleted)
```
**Status:** [ ] Pass [ ] Fail

---

#### Test 4.4: User Cannot Revoke Other User's Session
```sql
-- Create session for admin
SELECT set_system_user();
INSERT INTO session (id, "user_id", token, "expires_at")
VALUES ('test-sess-006', 'test-admin-001', 'admin-session', NOW() + INTERVAL '1 day');

-- Set regular user context
SELECT set_app_user('test-user-001', 'user');

-- Try to delete admin's session
DELETE FROM session WHERE id = 'test-sess-006';

-- Expected: 0 rows deleted (policy prevents it)

-- Verify session still exists
SELECT set_system_user();
SELECT id FROM session WHERE id = 'test-sess-006';
```
**Status:** [ ] Pass [ ] Fail

**Cleanup:**
```sql
SELECT set_system_user();
DELETE FROM session WHERE id = 'test-sess-006';
```

---

### Test Suite 5: Public Signup

#### Test 5.1: Public Can Create User with Role 'user'
```sql
-- Clear context (simulate unauthenticated request)
-- Note: In SQL Editor, we can't truly clear context, so just don't set it

-- Insert new user with role 'user'
INSERT INTO "user" (id, name, email, "email_verified", role)
VALUES ('test-public-001', 'Public Signup', 'public@test.com', false, 'user');

-- Expected: Success
-- This simulates Better Auth signup

-- Verify
SELECT id, email, role FROM "user" WHERE id = 'test-public-001';
```
**Status:** [ ] Pass [ ] Fail

**Cleanup:**
```sql
SELECT set_system_user();
DELETE FROM "user" WHERE id = 'test-public-001';
```

---

#### Test 5.2: Public Cannot Create Admin User
```sql
-- Try to create admin via public signup
INSERT INTO "user" (id, name, email, "email_verified", role)
VALUES ('test-public-002', 'Hacker Admin', 'hacker@test.com', false, 'admin');

-- Expected: ERROR - new row violates row-level security policy
-- user_insert_public_signup only allows role = 'user' or NULL
```
**Status:** [ ] Pass [ ] Fail

---

### Test Suite 6: Verification Table (Public Access)

#### Test 6.1: Public Can Read Verifications
```sql
-- Create verification token
SELECT set_system_user();
INSERT INTO verification (id, identifier, value, "expires_at")
VALUES ('test-verif-001', 'test@example.com', 'ABC123', NOW() + INTERVAL '1 hour');

-- Clear context
-- Try to read as public
SELECT id, identifier, value FROM verification WHERE id = 'test-verif-001';

-- Expected: Success (verification_select_public policy allows it)
```
**Status:** [ ] Pass [ ] Fail

**Cleanup:**
```sql
SELECT set_system_user();
DELETE FROM verification WHERE id = 'test-verif-001';
```

---

### Test Suite 7: Shopify Data (System Only)

#### Test 7.1: Admin Cannot Modify Shopify Session
```sql
-- Set admin context
SELECT set_app_user('test-admin-001', 'admin');

-- Try to insert Shopify session
INSERT INTO shopify_session (shop, "access_token", scope)
VALUES ('test-shop.myshopify.com', 'fake-token', 'read_products');

-- Expected: ERROR - new row violates row-level security policy
-- Only system can modify shopify_session
```
**Status:** [ ] Pass [ ] Fail

---

#### Test 7.2: System Can Modify Shopify Session
```sql
-- Set system context
SELECT set_system_user();

-- Insert Shopify session
INSERT INTO shopify_session (shop, "access_token", scope)
VALUES ('test-shop.myshopify.com', 'test-token', 'read_products');

-- Expected: Success

-- Verify
SELECT shop, scope FROM shopify_session WHERE shop = 'test-shop.myshopify.com';
```
**Status:** [ ] Pass [ ] Fail

**Cleanup:**
```sql
DELETE FROM shopify_session WHERE shop = 'test-shop.myshopify.com';
```

---

## Part 2: Manual Application Tests

### Prerequisites
- Local development server running (`pnpm dev`)
- At least 2 users created:
  - Admin user (with `role = 'admin'`)
  - Staff user (with `role = 'staff'`)

---

### Test Suite A: Admin User Flow

#### Test A.1: Admin Login
**Steps:**
1. Navigate to `/login`
2. Login with admin credentials
3. Verify redirected to homepage

**Expected:** ✅ Login successful
**Status:** [ ] Pass [ ] Fail

---

#### Test A.2: Admin View Products
**Steps:**
1. Login as admin
2. Navigate to `/products`
3. Verify products list displays

**Expected:** ✅ Products visible
**Status:** [ ] Pass [ ] Fail

---

#### Test A.3: Admin Create Product (if UI exists)
**Steps:**
1. Login as admin
2. Navigate to products page
3. Click "Create Product" (if button exists)
4. Fill in product details
5. Submit form

**Expected:** ✅ Product created successfully
**Status:** [ ] Pass [ ] Fail [ ] N/A (UI doesn't exist)

---

#### Test A.4: Admin View Users
**Steps:**
1. Login as admin
2. Navigate to `/account` or user management page
3. Verify can see list of users

**Expected:** ✅ Can see all users
**Status:** [ ] Pass [ ] Fail [ ] N/A (UI doesn't exist)

---

#### Test A.5: Admin Use Better Auth Operations
**Steps:**
1. Open browser console
2. Try calling admin operations:
```javascript
// In browser console (if Better Auth client is exposed)
await auth.createUser({
  email: 'newstaff@test.com',
  password: 'SecurePass123!',
  name: 'New Staff',
  role: 'staff'
})
```

**Expected:** ✅ User created successfully
**Status:** [ ] Pass [ ] Fail [ ] N/A (needs API endpoint)

---

### Test Suite B: Staff User Flow

#### Test B.1: Staff Login
**Steps:**
1. Navigate to `/login`
2. Login with staff credentials
3. Verify redirected to homepage

**Expected:** ✅ Login successful
**Status:** [ ] Pass [ ] Fail

---

#### Test B.2: Staff View Products
**Steps:**
1. Login as staff
2. Navigate to `/products`
3. Verify products list displays

**Expected:** ✅ Products visible (read-only)
**Status:** [ ] Pass [ ] Fail

---

#### Test B.3: Staff Cannot Create Product
**Steps:**
1. Login as staff
2. Navigate to products page
3. If "Create Product" button exists, verify it's disabled or hidden
4. If accessible, try creating product via API:
```javascript
// In browser console
const response = await fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'test',
    title: 'Test Product',
    handle: 'test',
    status: 'ACTIVE'
  })
})
console.log(await response.json())
```

**Expected:** ❌ Error 500 or 403 (RLS policy violation)
**Status:** [ ] Pass [ ] Fail

---

#### Test B.4: Staff Cannot View Other Users
**Steps:**
1. Login as staff
2. Navigate to user management page (if exists)
3. Verify can only see own profile

**Expected:** ✅ Can only see own profile
**Status:** [ ] Pass [ ] Fail [ ] N/A (UI doesn't exist)

---

### Test Suite C: Shopify Sync Operations

#### Test C.1: Shopify OAuth Flow
**Steps:**
1. Navigate to `/api/auth?shop=YOUR_SHOP.myshopify.com`
2. Complete OAuth flow
3. Verify redirected back to app
4. Check Supabase Studio: `SELECT * FROM shopify_session`

**Expected:** ✅ Session saved in database
**Status:** [ ] Pass [ ] Fail

---

#### Test C.2: Shopify Product Sync
**Steps:**
1. Ensure OAuth completed (Test C.1)
2. Trigger product sync: `POST /api/sync/products`
3. Check response for bulk operation ID
4. Poll status: `POST /api/sync/products/status/[id]`
5. Verify products imported to database

**Expected:** ✅ Products synced successfully
**Status:** [ ] Pass [ ] Fail

---

#### Test C.3: Bulk Operation Saved
**Steps:**
1. After sync (Test C.2)
2. Check Supabase Studio: `SELECT * FROM bulk_operation`
3. Verify operation record exists

**Expected:** ✅ Bulk operation record saved
**Status:** [ ] Pass [ ] Fail

---

### Test Suite D: Better Auth Signup

#### Test D.1: Public Signup
**Steps:**
1. Navigate to `/register`
2. Fill in signup form:
   - Email: `newuser@test.com`
   - Password: `SecurePassword123!`
   - Name: `Test User`
3. Submit form

**Expected:** ✅ Account created with `role = 'user'`
**Status:** [ ] Pass [ ] Fail

**Verification:**
```sql
SELECT id, email, role FROM "user" WHERE email = 'newuser@test.com';
-- Should show role = 'user'
```

---

#### Test D.2: New User Cannot Access Products
**Steps:**
1. Signup as new user (Test D.1)
2. Login with new credentials
3. Navigate to `/products`

**Expected:** ❌ No products visible or access denied
**Status:** [ ] Pass [ ] Fail

---

## Part 3: Integration Tests (Future)

These tests should be automated using Vitest/Playwright:

### Test Suite I: Unit Tests

```typescript
// tests/rls/context.test.ts
describe('RLS Context Functions', () => {
  test('withUserContext sets user context correctly', async () => {
    // Test implementation
  })

  test('withSystemContext bypasses RLS', async () => {
    // Test implementation
  })

  test('requireRole throws for unauthorized users', async () => {
    // Test implementation
  })
})
```

### Test Suite II: Integration Tests

```typescript
// tests/rls/policies.test.ts
describe('RLS Policies', () => {
  test('admin can CRUD products', async () => {
    // Test implementation
  })

  test('staff can view but not modify products', async () => {
    // Test implementation
  })

  test('users cannot escalate privileges', async () => {
    // Test implementation
  })
})
```

---

## Test Execution Checklist

### SQL Tests
- [ ] Suite 1: Context Functions (3 tests)
- [ ] Suite 2: Product Access (5 tests)
- [ ] Suite 3: User Table (6 tests)
- [ ] Suite 4: Session Management (4 tests)
- [ ] Suite 5: Public Signup (2 tests)
- [ ] Suite 6: Verification (1 test)
- [ ] Suite 7: Shopify Data (2 tests)

**Total SQL Tests:** 23

### Manual Application Tests
- [ ] Suite A: Admin Flow (5 tests)
- [ ] Suite B: Staff Flow (4 tests)
- [ ] Suite C: Shopify Sync (3 tests)
- [ ] Suite D: Better Auth Signup (2 tests)

**Total Manual Tests:** 14

### Integration Tests
- [ ] Suite I: Unit Tests (future)
- [ ] Suite II: Integration Tests (future)

---

## Test Results Summary

**Date Executed:** ___________

| Suite | Tests | Passed | Failed | N/A |
|-------|-------|--------|--------|-----|
| SQL Context Functions | 3 | ___ | ___ | ___ |
| SQL Product Access | 5 | ___ | ___ | ___ |
| SQL User Table | 6 | ___ | ___ | ___ |
| SQL Session Management | 4 | ___ | ___ | ___ |
| SQL Public Signup | 2 | ___ | ___ | ___ |
| SQL Verification | 1 | ___ | ___ | ___ |
| SQL Shopify Data | 2 | ___ | ___ | ___ |
| Manual Admin Flow | 5 | ___ | ___ | ___ |
| Manual Staff Flow | 4 | ___ | ___ | ___ |
| Manual Shopify Sync | 3 | ___ | ___ | ___ |
| Manual Auth Signup | 2 | ___ | ___ | ___ |
| **TOTAL** | **37** | **___** | **___** | **___** |

---

## Issues Found

| Issue # | Description | Severity | Status |
|---------|-------------|----------|--------|
| | | | |

---

## Related Documentation

- [Implementation ADR](../decisions/2026-01-14-row-level-security-implementation.md)
- [Usage Guide](../guides/2026-01-14-rls-usage-guide.md)
- [RLS Policies Architecture](../architecture/2026-01-14-rls-policies.md)
- [Validation Results](./2026-01-14-rls-validation-results.md)
