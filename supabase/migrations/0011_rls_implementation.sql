-- =====================================================
-- RLS Implementation for Better Auth + Supabase
-- =====================================================
-- This migration adds Row Level Security to protect data at the database level
-- Compatible with Better Auth plugin admin

-- =====================================================
-- PART 1: Create helper functions
-- =====================================================

-- Function to set current user context
CREATE OR REPLACE FUNCTION set_app_user(user_id TEXT, user_role TEXT)
RETURNS void AS $$
BEGIN
  -- Store user_id and role in PostgreSQL session variables
  PERFORM set_config('app.current_user_id', user_id, false);
  PERFORM set_config('app.current_user_role', COALESCE(user_role, 'user'), false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user ID
CREATE OR REPLACE FUNCTION current_app_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.current_user_id', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get current user role
CREATE OR REPLACE FUNCTION current_app_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(current_setting('app.current_user_role', true), 'anonymous');
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'anonymous';
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if current user is admin
-- Checks both session variable and actual role in user table
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  session_role TEXT;
  db_role TEXT;
  user_id TEXT;
BEGIN
  session_role := current_app_user_role();

  -- If session says admin, return true
  IF session_role = 'admin' THEN
    RETURN true;
  END IF;

  -- If system context, return false (system has its own privileges)
  IF session_role = 'system' THEN
    RETURN false;
  END IF;

  -- Check actual role in database
  user_id := current_app_user_id();
  IF user_id IS NOT NULL THEN
    SELECT role INTO db_role FROM "user" WHERE id = user_id;
    IF db_role = 'admin' THEN
      RETURN true;
    END IF;
  END IF;

  RETURN false;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if current user is staff or admin
CREATE OR REPLACE FUNCTION is_staff_or_admin()
RETURNS BOOLEAN AS $$
DECLARE
  session_role TEXT;
  db_role TEXT;
  user_id TEXT;
BEGIN
  session_role := current_app_user_role();

  -- If session says admin or staff, return true
  IF session_role IN ('admin', 'staff') THEN
    RETURN true;
  END IF;

  -- If system context, return false
  IF session_role = 'system' THEN
    RETURN false;
  END IF;

  -- Check actual role in database
  user_id := current_app_user_id();
  IF user_id IS NOT NULL THEN
    SELECT role INTO db_role FROM "user" WHERE id = user_id;
    IF db_role IN ('admin', 'staff') THEN
      RETURN true;
    END IF;
  END IF;

  RETURN false;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to set system context (bypasses RLS)
CREATE OR REPLACE FUNCTION set_system_user()
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_id', 'system', false);
  PERFORM set_config('app.current_user_role', 'system', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is system
CREATE OR REPLACE FUNCTION is_system()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_app_user_role() = 'system';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- PART 2: Enable RLS on all tables
-- =====================================================

ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_variant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_media" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bulk_operation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shopify_session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shopify_store" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 3: User table policies
-- =====================================================

-- Users can view their own profile, admins can view all
CREATE POLICY "user_select" ON "user"
  FOR SELECT
  USING (
    id = current_app_user_id()
    OR is_admin()
    OR is_system()
  );

-- Users can update their own profile (except role/banned fields)
CREATE POLICY "user_update_own" ON "user"
  FOR UPDATE
  USING (id = current_app_user_id())
  WITH CHECK (
    id = current_app_user_id()
    -- Prevent users from changing these protected fields
    AND role IS NOT DISTINCT FROM (SELECT role FROM "user" WHERE id = current_app_user_id())
    AND banned IS NOT DISTINCT FROM (SELECT banned FROM "user" WHERE id = current_app_user_id())
    AND ban_reason IS NOT DISTINCT FROM (SELECT ban_reason FROM "user" WHERE id = current_app_user_id())
    AND ban_expires IS NOT DISTINCT FROM (SELECT ban_expires FROM "user" WHERE id = current_app_user_id())
  );

-- Admins can update any user (for admin operations like banUser, setRole)
CREATE POLICY "user_update_admin" ON "user"
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can delete users (for removeUser admin operation)
CREATE POLICY "user_delete_admin" ON "user"
  FOR DELETE
  USING (is_admin());

-- System can do anything (for Better Auth internal operations)
CREATE POLICY "user_system_all" ON "user"
  FOR ALL
  USING (is_system())
  WITH CHECK (is_system());

-- Public signup: Allow INSERT for new users with role 'user' or NULL
-- This allows Better Auth signup to work without system context
CREATE POLICY "user_insert_public_signup" ON "user"
  FOR INSERT
  WITH CHECK (
    -- Only allow if role is 'user' or NULL (Better Auth default)
    (role IS NULL OR role = 'user')
  );

-- Admins can insert users with any role (for createUser admin operation)
CREATE POLICY "user_insert_admin" ON "user"
  FOR INSERT
  WITH CHECK (is_admin());

-- =====================================================
-- PART 4: Account table policies
-- =====================================================

-- Users can view their own accounts
CREATE POLICY "account_select_own" ON "account"
  FOR SELECT
  USING (
    user_id = current_app_user_id()
    OR is_admin()
    OR is_system()
  );

-- Admins can delete accounts (for user management)
CREATE POLICY "account_delete_admin" ON "account"
  FOR DELETE
  USING (is_admin() OR is_system());

-- System and public can insert accounts (for signup/OAuth)
CREATE POLICY "account_insert" ON "account"
  FOR INSERT
  WITH CHECK (is_system() OR user_id = current_app_user_id());

-- System can update accounts (for token refresh)
CREATE POLICY "account_update" ON "account"
  FOR UPDATE
  USING (is_system() OR user_id = current_app_user_id())
  WITH CHECK (is_system() OR user_id = current_app_user_id());

-- =====================================================
-- PART 5: Session table policies
-- =====================================================

-- Users can view their own sessions, admins can view all
CREATE POLICY "session_select" ON "session"
  FOR SELECT
  USING (
    user_id = current_app_user_id()
    OR is_admin()
    OR is_system()
  );

-- System can insert sessions (for login)
-- Also allow public insert for Better Auth login
CREATE POLICY "session_insert" ON "session"
  FOR INSERT
  WITH CHECK (is_system() OR user_id = current_app_user_id());

-- System can update sessions
CREATE POLICY "session_update" ON "session"
  FOR UPDATE
  USING (is_system())
  WITH CHECK (is_system());

-- Users can delete their own sessions, admins can delete any (for revokeUserSession)
CREATE POLICY "session_delete" ON "session"
  FOR DELETE
  USING (
    user_id = current_app_user_id()
    OR is_admin()
    OR is_system()
  );

-- =====================================================
-- PART 6: Verification table policies
-- =====================================================

-- System can manage verifications (Better Auth operations)
CREATE POLICY "verification_all" ON "verification"
  FOR ALL
  USING (is_system())
  WITH CHECK (is_system());

-- Public can read verifications by identifier (for email verification)
CREATE POLICY "verification_select_public" ON "verification"
  FOR SELECT
  USING (true);

-- Public can insert verifications (for signup flow)
CREATE POLICY "verification_insert_public" ON "verification"
  FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- PART 7: Product table policies
-- =====================================================

-- Staff and admins can view products
CREATE POLICY "product_select" ON "product"
  FOR SELECT
  USING (is_staff_or_admin() OR is_system());

-- Only admins and system can insert products
CREATE POLICY "product_insert" ON "product"
  FOR INSERT
  WITH CHECK (is_admin() OR is_system());

-- Only admins and system can update products
CREATE POLICY "product_update" ON "product"
  FOR UPDATE
  USING (is_admin() OR is_system())
  WITH CHECK (is_admin() OR is_system());

-- Only admins and system can delete products
CREATE POLICY "product_delete" ON "product"
  FOR DELETE
  USING (is_admin() OR is_system());

-- =====================================================
-- PART 8: ProductVariant table policies
-- =====================================================

-- Staff and admins can view variants
CREATE POLICY "product_variant_select" ON "product_variant"
  FOR SELECT
  USING (is_staff_or_admin() OR is_system());

-- Only admins and system can modify variants
CREATE POLICY "product_variant_insert" ON "product_variant"
  FOR INSERT
  WITH CHECK (is_admin() OR is_system());

CREATE POLICY "product_variant_update" ON "product_variant"
  FOR UPDATE
  USING (is_admin() OR is_system())
  WITH CHECK (is_admin() OR is_system());

CREATE POLICY "product_variant_delete" ON "product_variant"
  FOR DELETE
  USING (is_admin() OR is_system());

-- =====================================================
-- PART 9: ProductMedia table policies
-- =====================================================

-- Staff and admins can view media
CREATE POLICY "product_media_select" ON "product_media"
  FOR SELECT
  USING (is_staff_or_admin() OR is_system());

-- Only admins and system can modify media
CREATE POLICY "product_media_insert" ON "product_media"
  FOR INSERT
  WITH CHECK (is_admin() OR is_system());

CREATE POLICY "product_media_update" ON "product_media"
  FOR UPDATE
  USING (is_admin() OR is_system())
  WITH CHECK (is_admin() OR is_system());

CREATE POLICY "product_media_delete" ON "product_media"
  FOR DELETE
  USING (is_admin() OR is_system());

-- =====================================================
-- PART 10: BulkOperation table policies
-- =====================================================

-- Admins can view bulk operations
CREATE POLICY "bulk_operation_select" ON "bulk_operation"
  FOR SELECT
  USING (is_admin() OR is_system());

-- Only system can manage bulk operations (sync process)
CREATE POLICY "bulk_operation_all" ON "bulk_operation"
  FOR ALL
  USING (is_system())
  WITH CHECK (is_system());

-- =====================================================
-- PART 11: ShopifySession table policies
-- =====================================================

-- Only admins and system can access Shopify sessions
CREATE POLICY "shopify_session_select" ON "shopify_session"
  FOR SELECT
  USING (is_admin() OR is_system());

-- Only system can modify Shopify sessions
CREATE POLICY "shopify_session_all" ON "shopify_session"
  FOR ALL
  USING (is_system())
  WITH CHECK (is_system());

-- =====================================================
-- PART 12: ShopifyStore table policies
-- =====================================================

-- Only admins and system can access store config
CREATE POLICY "shopify_store_select" ON "shopify_store"
  FOR SELECT
  USING (is_admin() OR is_system());

-- Only system can modify store config
CREATE POLICY "shopify_store_all" ON "shopify_store"
  FOR ALL
  USING (is_system())
  WITH CHECK (is_system());

-- =====================================================
-- PART 13: Assign roles to existing users
-- =====================================================

-- Assign 'admin' role to hardcoded admin user
UPDATE "user" SET role = 'admin' WHERE id = 'FUxSVTnAKuMSeJze9cr6O5vGbJuEyvoo';

-- Assign 'user' role to other existing users (Better Auth default)
UPDATE "user" SET role = 'user' WHERE role IS NULL;

-- =====================================================
-- RLS Implementation Complete
-- =====================================================
-- All tables now have Row Level Security enabled
-- PostgreSQL functions provide context checking
-- Policies enforce permissions based on user roles
-- =====================================================
