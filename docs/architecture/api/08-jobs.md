# 08 — Background Jobs

**Status:** Target design
**Parent backend:** [`../03-backend.md`](../03-backend.md)

---

## Purpose

Move long-running or unreliable work off the request path while preserving AuthZ, tenancy, idempotency, and Constitution gates.

---

## Job families

| Family | Examples | Typical SLA |
|--------|----------|-------------|
| **OCR / documents** | Classify, extract, thumbnail | Minutes |
| **Import / export** | CSV/XLS chunks, report files | Minutes–hours |
| **Reports** | Materialize dashboards, scheduled PDFs | Minutes–hourly |
| **Email / notifications** | Fan-out, digests | Seconds–minutes |
| **Sync** | ELD pull, accounting push | Seconds–minutes |
| **AI assist** | Draft summaries, suggest mappings | Seconds–minutes — **never auto-approve critical** |
| **Webhooks outbound** | Deliver signed events | Seconds–minutes + DLQ |

---

## Job contract

```text
job_id
company_id
type
payload          # no secrets; reference ids
idempotency_key
requested_by     # user_id (or system principal)
permission_snapshot?  # optional; still re-check live perms before critical side effects
status           # queued | running | succeeded | failed | cancelled | needs_approval
attempts
last_error
created_at
run_after
```

---

## AuthZ for jobs

1. Enqueue only if actor has permission **now**.
2. Before side effects, **re-check** membership active + permission still held.
3. Critical outcomes (`migration.commit`, `payroll.finalize`, `ocr.apply_as_source_of_truth`) → status `needs_approval` until human confirms — Alph cannot flip this alone.

---

## API surface

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/jobs/:id` | Status for requester with access |
| `POST /api/v1/jobs/:id/cancel` | Cancel if still queued |
| Domain-specific | e.g. `POST /api/v1/ocr/jobs`, `POST /api/v1/exports` |

Do not expose arbitrary job payload execution endpoints.

---

## Phase 1 vs Phase 2

| Phase | Implementation |
|-------|----------------|
| 1 | Queue table or managed queue; workers in same repo |
| 2 | Separate worker deployable; transactional outbox for events |

**Do not overengineer:** no Kubernetes job mesh until a single pool saturates ([../14-scalability-roadmap.md](../14-scalability-roadmap.md)).

---

## Related

- Idempotency: [07-idempotency.md](./07-idempotency.md)
- OCR/AI: [`../07-ai-ocr-documents.md`](../07-ai-ocr-documents.md)
- Migration Center: Master Constitution + `/platform/migration`
