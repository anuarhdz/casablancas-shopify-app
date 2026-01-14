# Documentation Index

This directory contains all project documentation organized by category.

## 📁 Directory Structure

```
docs/
├── decisions/          # Architecture Decision Records (ADRs)
├── architecture/       # System architecture and design
├── guides/            # How-to guides and best practices
└── testing/           # Test plans and validation results
```

---

## 🎯 Decisions (ADRs)

Architecture Decision Records documenting key technical decisions:

- **[2026-01-14 - Row Level Security Implementation](./decisions/2026-01-14-row-level-security-implementation.md)**
  - Implementation of PostgreSQL RLS for database-level security
  - Compatible with Better Auth plugin admin
  - Covers roles, policies, and technical architecture

---

## 🏗️ Architecture

System architecture documentation, diagrams, and database structure:

- **[2026-01-14 - RLS Policies Architecture](./architecture/2026-01-14-rls-policies.md)**
  - Complete RLS policy architecture
  - PostgreSQL functions and their interactions
  - Policy evaluation flows and examples
  - Better Auth admin plugin integration

---

## 📖 Guides

Step-by-step guides for developers:

- **[2026-01-14 - RLS Usage Guide](./guides/2026-01-14-rls-usage-guide.md)**
  - How to use RLS in page loaders and API routes
  - Helper functions reference (`dbWithUser`, `dbWithSystem`)
  - Role permissions matrix
  - Common patterns and best practices
  - Troubleshooting guide

---

## 🧪 Testing

Test plans, validation results, and QA documentation:

- **[2026-01-14 - RLS Validation Results](./testing/2026-01-14-rls-validation-results.md)**
  - Initial RLS implementation validation
  - PostgreSQL function verification
  - RLS policies verification (36 policies)
  - Build and migration validation

- **[2026-01-14 - RLS Pending Tests](./testing/2026-01-14-rls-pending-tests.md)**
  - Comprehensive test plan for RLS
  - SQL tests (23 tests in Supabase Studio)
  - Manual application tests (14 tests)
  - Future integration tests

---

## 🔍 Quick Links by Topic

### Row Level Security (RLS)
- [ADR: RLS Implementation](./decisions/2026-01-14-row-level-security-implementation.md) - Why and how we implemented RLS
- [Usage Guide](./guides/2026-01-14-rls-usage-guide.md) - How to use RLS in your code
- [Architecture](./architecture/2026-01-14-rls-policies.md) - Technical deep dive
- [Validation Results](./testing/2026-01-14-rls-validation-results.md) - What's been tested
- [Pending Tests](./testing/2026-01-14-rls-pending-tests.md) - What needs testing

### Better Auth Integration
- [RLS Implementation ADR](./decisions/2026-01-14-row-level-security-implementation.md#better-auth-compatibility) - Better Auth plugin admin compatibility
- [Usage Guide - Admin Operations](./guides/2026-01-14-rls-usage-guide.md#better-auth-admin-plugin-integration) - How to use admin plugin with RLS
- [Architecture - Integration](./architecture/2026-01-14-rls-policies.md#better-auth-admin-plugin-integration) - Technical details

### Database & Supabase
- [RLS Policies Architecture](./architecture/2026-01-14-rls-policies.md) - Complete policy reference
- [Usage Guide - Troubleshooting](./guides/2026-01-14-rls-usage-guide.md#troubleshooting) - Common database issues

---

## 📝 Contributing to Documentation

### Documentation Standards

1. **Naming Convention:** `YYYY-MM-DD-descriptive-name.md`
2. **Always update this index** when adding new documentation
3. **Link related docs** at the bottom of each document
4. **Use collapsible sections** (`<details>`) for long outputs/examples
5. **Include date and status** at the top of each document

### Document Types

#### ADR (Architecture Decision Record)
**Location:** `docs/decisions/`
**Template:**
- Context (why decision needed)
- Decision (what was chosen)
- Alternatives Considered
- Consequences
- Status

#### Architecture Documentation
**Location:** `docs/architecture/`
**Template:**
- Overview/Diagrams
- Technical Details
- Component Interactions
- Related Systems

#### Guides
**Location:** `docs/guides/`
**Template:**
- Quick Start
- Step-by-step instructions
- Common patterns
- Best practices
- Troubleshooting

#### Testing Documentation
**Location:** `docs/testing/`
**Template:**
- Test objectives
- Prerequisites
- Test cases with expected results
- Status tracking
- Results summary

---

## 🔄 Recently Updated

- **2026-01-14:** Initial RLS documentation suite created
  - Implementation ADR
  - Usage guide
  - Architecture documentation
  - Validation results
  - Pending test plan

---

## 📚 External Resources

- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Better Auth Admin Plugin](https://www.better-auth.com/docs/plugins/admin)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
