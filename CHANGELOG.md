# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Row Level Security (RLS) Implementation - 2026-01-14

Implemented comprehensive PostgreSQL Row Level Security to protect data at the database level.

**Features:**
- 7 PostgreSQL helper functions for context management (`set_app_user`, `is_admin`, etc.)
- 36 RLS policies across 10 database tables
- Role-based access control (admin, staff, user, system)
- Better Auth plugin admin full compatibility
- Helper functions for SvelteKit integration (`dbWithUser`, `dbWithSystem`)

**Security Benefits:**
- Defense in depth: Database-level protection
- Prevents privilege escalation
- Protects against SQL injection
- Audit trail capability

**Tables Protected:**
- Authentication: `user`, `account`, `session`, `verification`
- Shopify: `product`, `product_variant`, `product_media`, `bulk_operation`, `shopify_session`, `shopify_store`

<details>
<summary>Implementation Details</summary>

**Files Created:**
- `src/lib/server/db/helpers.ts` - Context helper functions
- `supabase/migrations/0011_rls_implementation.sql` - Complete RLS migration (650+ lines)
- `docs/decisions/2026-01-14-row-level-security-implementation.md` - ADR
- `docs/guides/2026-01-14-rls-usage-guide.md` - Usage guide
- `docs/architecture/2026-01-14-rls-policies.md` - Architecture documentation
- `docs/testing/2026-01-14-rls-validation-results.md` - Validation results
- `docs/testing/2026-01-14-rls-pending-tests.md` - Test plan

**Files Modified:**
- `src/lib/server/db/index.ts` - Added context wrappers
- `src/lib/server/db/shopify.session.ts` - System context for OAuth
- `src/lib/server/db/bulk-record.ts` - System context for sync
- `src/routes/api/sync/products/+server.ts` - System context for bulk ops

**Architecture Decision:**
- Chose PostgreSQL session variables over JWT for context passing
- Public signup allowed with `role = 'user'` only
- Better Auth admin operations work via RLS policies (not Proxy pattern)

**Known Limitations:**
- Requires developers to use `dbWithUser`/`dbWithSystem` wrappers
- Additional testing required (see docs/testing/2026-01-14-rls-pending-tests.md)

**Performance:**
- Minimal overhead (simple boolean checks)
- Functions are `STABLE` (cacheable within transaction)
- Build time unchanged

**Migration:**
- Applied locally: ✅ 0011_rls_implementation.sql
- Production deployment: Pending

</details>

**Documentation:**
- [ADR: RLS Implementation](./docs/decisions/2026-01-14-row-level-security-implementation.md)
- [Usage Guide](./docs/guides/2026-01-14-rls-usage-guide.md)
- [Architecture Reference](./docs/architecture/2026-01-14-rls-policies.md)

---

## [0.1.0] - 2026-01-XX

### Added
- Initial project setup with SvelteKit 2
- Shopify Admin API integration
- Better Auth with admin plugin
- Drizzle ORM with PostgreSQL (Supabase)
- Product sync from Shopify via bulk operations
- OAuth flow for Shopify authentication

---

## Contributing

When adding entries to this changelog:
1. Add new entries to the "Unreleased" section
2. Use categories: Added, Changed, Deprecated, Removed, Fixed, Security
3. Include implementation details in `<details>` section for non-trivial changes
4. Link to relevant documentation
5. When releasing, move "Unreleased" items to a new version section
