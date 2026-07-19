-- =============================================================================
-- Transpo.ai Enterprise Database — RLS helpers & example policies
-- STATUS: NOT APPLIED — documentation / future apply only
-- Requires: companies, users, company_memberships (+ target tenant tables)
-- Additive only — do not DROP POLICY unless replacing with reviewed equivalent
-- Pattern details: ../30-rls-security.md
-- =============================================================================

CREATE OR REPLACE FUNCTION auth_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(
    coalesce(
      auth.jwt() ->> 'company_id',
      current_setting('app.company_id', true)
    ),
    ''
  )::uuid;
$$;

CREATE OR REPLACE FUNCTION auth_has_company(p_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM company_memberships m
    JOIN users u ON u.id = m.user_id
    WHERE m.company_id = p_company_id
      AND m.status = 'active'
      AND m.deleted_at IS NULL
      AND u.auth_user_id = (SELECT auth.uid())
      AND u.deleted_at IS NULL
  );
$$;

-- ----- Example: loads (repeat pattern for every tenant table) -----
-- ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE loads FORCE ROW LEVEL SECURITY;
--
-- CREATE POLICY loads_select ON loads
--   FOR SELECT TO authenticated
--   USING (
--     company_id = (SELECT auth_company_id())
--     AND deleted_at IS NULL
--     AND (SELECT auth_has_company(company_id))
--   );
--
-- CREATE POLICY loads_insert ON loads
--   FOR INSERT TO authenticated
--   WITH CHECK (
--     company_id = (SELECT auth_company_id())
--     AND (SELECT auth_has_company(company_id))
--   );
--
-- CREATE POLICY loads_update ON loads
--   FOR UPDATE TO authenticated
--   USING (
--     company_id = (SELECT auth_company_id())
--     AND (SELECT auth_has_company(company_id))
--   )
--   WITH CHECK (
--     company_id = (SELECT auth_company_id())
--   );

-- Global catalogs: SELECT for authenticated; writes via service role only
-- ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY permissions_select ON permissions
--   FOR SELECT TO authenticated
--   USING (true);
