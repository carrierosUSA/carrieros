# 50 — AI / Embeddings Readiness

**Status:** Future design — **do not add vector indexes to Phase B OLTP tables**.
**Constitution:** AI MAY extract/summarize/recommend; MUST NEVER auto-approve critical actions.

---

## 1. Principle

Keep today’s OLTP path fast. Semantic search and embeddings are a **sidecar**, not columns on `loads` / `documents` hot rows.

```text
documents / loads / …   (OLTP, indexed as today)
        │
        └── document_embeddings / entity_embeddings  (optional later)
                 · company_id
                 · entity_type, entity_id
                 · model_id, dims, embedding vector
                 · content_hash, created_at
```

---

## 2. Recommended future tables (NOT APPLIED)

| Table | Purpose |
|-------|---------|
| `entity_embeddings` | Polymorphic embeddings for search/RAG over docs, loads notes, parties |
| `embedding_jobs` | Async queue: pending → completed / failed |

**Columns (conceptual):** `id`, `company_id`, `entity_type`, `entity_id`, `source` (`document_version`, `ocr_text`, `notes`), `model_id`, `dimensions`, `embedding` (pgvector), `content_hash`, `created_at`, `deleted_at`.

**Indexes (later):**

- `(company_id, entity_type, entity_id)` unique per model
- Vector index (HNSW/IVFFlat) **only after** row count justifies build cost
- Partial: `WHERE deleted_at IS NULL`

---

## 3. Performance guardrails

| Guardrail | Why |
|-----------|-----|
| Async job only | Never block insert/update of business rows on embedding API |
| Separate table | Vacuum/index bloat isolated from dispatch board |
| Content hash skip | Avoid re-embed unchanged text |
| Tenant filter first | Always `company_id = …` before vector distance |
| No embedding in `SELECT *` boards | Detail / search endpoints only |
| Optional schema / tablespace later | Extreme scale only |

---

## 4. Existing AI tables (ship with Phase D)

Already designed in [50-documents-ai.md](../50-documents-ai.md):

- `ai_recommendations` — confidence + `approval_state`
- `document_ocr_results` / `document_ocr_fields` — extraction with verification
- `ai_insight_snapshots` — rebuildable display cache

These are sufficient for Alph assist without vectors. Add embeddings when product search/RAG requires them.

---

## 5. Security

- Embeddings inherit RLS via `company_id`
- Do not embed secrets, full SSN, raw bank numbers
- Prompts / retrieved chunks stay single-tenant
- Approval still human for critical `recommendation_type` values

---

## 6. SQL stub

[sql/04_embeddings_future.sql](./sql/04_embeddings_future.sql) — **NOT APPLIED**; apply only after pgvector decision + product need.
