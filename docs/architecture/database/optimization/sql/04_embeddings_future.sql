-- =============================================================================
-- Transpo.ai Enterprise Database — embeddings sidecar (FUTURE)
-- STATUS: NOT APPLIED — do not run in Phase B
-- Apply only after: product need + pgvector decision + OLTP stable
-- Additive only — separate from hot board tables
-- See: ../50-ai-embeddings.md
-- =============================================================================

-- CREATE EXTENSION IF NOT EXISTS vector;

-- CREATE TABLE IF NOT EXISTS entity_embeddings (
--   id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   company_id    uuid NOT NULL REFERENCES companies(id),
--   entity_type   text NOT NULL,
--   entity_id     uuid NOT NULL,
--   source        text NOT NULL,
--   model_id      text NOT NULL,
--   dimensions    integer NOT NULL,
--   embedding     vector(1536),  -- adjust dims to model
--   content_hash  text NOT NULL,
--   created_at    timestamptz NOT NULL DEFAULT now(),
--   deleted_at    timestamptz,
--   CONSTRAINT entity_embeddings_source_chk
--     CHECK (source IN ('document_version', 'ocr_text', 'notes', 'other'))
-- );

-- CREATE UNIQUE INDEX IF NOT EXISTS entity_embeddings_company_entity_model_uidx
--   ON entity_embeddings (company_id, entity_type, entity_id, model_id)
--   WHERE deleted_at IS NULL;

-- Vector index — build only when row count justifies cost:
-- CREATE INDEX IF NOT EXISTS entity_embeddings_hnsw_idx
--   ON entity_embeddings USING hnsw (embedding vector_cosine_ops);

-- ALTER TABLE entity_embeddings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE entity_embeddings FORCE ROW LEVEL SECURITY;
-- (policies: same tenant pattern as ../30-rls-security.md)
