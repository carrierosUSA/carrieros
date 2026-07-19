-- =============================================================================
-- Transpo.ai Enterprise Database — standard helpers
-- STATUS: NOT APPLIED — documentation / future apply only
-- DO NOT RUN until design approval + Phase B foundation tables exist
-- Additive only — no DROP / no destructive ALTER
-- =============================================================================

-- Enable useful extensions (idempotent)
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- optional alternative

-- Keep updated_at honest on mutable tables
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Example binding (repeat per mutable table after CREATE TABLE):
-- CREATE TRIGGER loads_set_updated_at
--   BEFORE UPDATE ON loads
--   FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Optional: bump optimistic concurrency version
CREATE OR REPLACE FUNCTION bump_row_version()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.version IS NOT DISTINCT FROM OLD.version THEN
    NEW.version := COALESCE(OLD.version, 1) + 1;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Example:
-- CREATE TRIGGER loads_bump_version
--   BEFORE UPDATE ON loads
--   FOR EACH ROW EXECUTE FUNCTION bump_row_version();
