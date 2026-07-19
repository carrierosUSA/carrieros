# Future-apply SQL stubs

**STATUS: NOT APPLIED — documentation / future apply only**

These files are **additive** drafts aligned with `docs/architecture/database/` catalogs. They are **not** Supabase migrations, are **not** run by CI, and must **not** be applied until:

1. Enterprise database design is explicitly approved
2. Foundation tables from Phase B exist (or are created in the same approved migration set)
3. A human reviews each statement for the target environment

## Rules

- Additive only: `CREATE` / `CREATE INDEX` / `CREATE POLICY` / helpers
- **Never** `DROP TABLE`, `DROP COLUMN`, or destructive `ALTER`
- If a table does not exist yet, skip that section until the catalog DDL lands
- Prefer generating final migrations from the table catalogs; use these as checklists

## Files

| File | Contents |
|------|----------|
| [01_standard_helpers.sql](./01_standard_helpers.sql) | Extensions, `updated_at` trigger function |
| [02_indexes_additive.sql](./02_indexes_additive.sql) | Representative indexes (create after tables) |
| [03_rls_helpers_and_policies.sql](./03_rls_helpers_and_policies.sql) | Auth helpers + example policies |
| [04_embeddings_future.sql](./04_embeddings_future.sql) | Optional embeddings sidecar (later) |
