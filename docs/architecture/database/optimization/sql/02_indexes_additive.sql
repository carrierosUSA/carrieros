-- =============================================================================
-- Transpo.ai Enterprise Database — additive indexes
-- STATUS: NOT APPLIED — documentation / future apply only
-- Apply ONLY after corresponding tables exist (Phase B–E)
-- Additive only — never DROP INDEX unless proven unused in ops process
-- Full catalog: ../20-indexes.md
-- =============================================================================

-- ----- Identity -----
CREATE INDEX IF NOT EXISTS companies_status_active_idx
  ON companies (status) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_active_uidx
  ON users (email) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS users_auth_user_id_idx
  ON users (auth_user_id);

CREATE UNIQUE INDEX IF NOT EXISTS company_memberships_company_user_uidx
  ON company_memberships (company_id, user_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS company_memberships_user_active_idx
  ON company_memberships (user_id) WHERE status = 'active' AND deleted_at IS NULL;

-- ----- Fleet -----
CREATE INDEX IF NOT EXISTS drivers_company_status_idx
  ON drivers (company_id, status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS drivers_company_operational_status_idx
  ON drivers (company_id, operational_status) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS trucks_company_unit_uidx
  ON trucks (company_id, unit_number) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS trailers_company_unit_uidx
  ON trailers (company_id, unit_number) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS driver_licenses_company_expires_idx
  ON driver_licenses (company_id, expires_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS driver_medical_company_expires_idx
  ON driver_medical_certificates (company_id, expires_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS fuel_records_company_truck_fueled_idx
  ON fuel_records (company_id, truck_id, fueled_at);

CREATE INDEX IF NOT EXISTS maintenance_orders_company_status_due_idx
  ON maintenance_orders (company_id, status, due_at) WHERE deleted_at IS NULL;

-- ----- Operations -----
CREATE INDEX IF NOT EXISTS parties_company_type_status_idx
  ON parties (company_id, type, status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS parties_company_name_idx
  ON parties (company_id, name) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS loads_company_status_pickup_idx
  ON loads (company_id, status, pickup_at) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS loads_company_reference_uidx
  ON loads (company_id, reference) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS loads_company_driver_status_idx
  ON loads (company_id, driver_id, status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS loads_company_broker_pickup_idx
  ON loads (company_id, broker_party_id, pickup_at) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS load_stops_load_sequence_uidx
  ON load_stops (load_id, sequence) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS dispatch_assignments_company_load_status_idx
  ON dispatch_assignments (company_id, load_id, status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS dispatch_assignments_company_driver_status_idx
  ON dispatch_assignments (company_id, driver_id, status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS tracking_positions_company_truck_recorded_idx
  ON tracking_positions (company_id, truck_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS tracking_positions_company_load_recorded_idx
  ON tracking_positions (company_id, load_id, recorded_at DESC);

-- ----- Finance -----
CREATE UNIQUE INDEX IF NOT EXISTS invoices_company_number_uidx
  ON invoices (company_id, invoice_number) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS invoices_company_status_due_idx
  ON invoices (company_id, status, due_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS invoices_company_load_idx
  ON invoices (company_id, load_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS settlements_company_status_period_idx
  ON settlements (company_id, status, period_end) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS expenses_company_status_incurred_idx
  ON expenses (company_id, status, incurred_at) WHERE deleted_at IS NULL;

-- ----- Documents & AI -----
CREATE INDEX IF NOT EXISTS documents_company_type_status_idx
  ON documents (company_id, document_type, status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS documents_company_expires_idx
  ON documents (company_id, expires_at)
  WHERE expires_at IS NOT NULL AND deleted_at IS NULL;

-- CREATE INDEX IF NOT EXISTS documents_search_vector_gin
--   ON documents USING gin (search_vector);

CREATE INDEX IF NOT EXISTS document_links_company_entity_idx
  ON document_links (company_id, entity_type, entity_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ai_recommendations_company_approval_created_idx
  ON ai_recommendations (company_id, approval_state, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ai_recommendations_company_entity_idx
  ON ai_recommendations (company_id, entity_type, entity_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- ----- Comms & audit -----
CREATE INDEX IF NOT EXISTS notifications_company_recipient_created_idx
  ON notifications (company_id, recipient_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS notifications_company_recipient_unread_idx
  ON notifications (company_id, recipient_user_id)
  WHERE read_at IS NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS activity_events_company_entity_occurred_idx
  ON activity_events (company_id, entity_type, entity_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS audit_logs_company_created_idx
  ON audit_logs (company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS audit_logs_company_entity_created_idx
  ON audit_logs (company_id, entity_type, entity_id, created_at DESC);

-- ----- Platform -----
CREATE UNIQUE INDEX IF NOT EXISTS company_settings_company_key_uidx
  ON company_settings (company_id, key) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS integration_outbox_pending_idx
  ON integration_outbox (status, next_attempt_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS migration_jobs_company_status_created_idx
  ON migration_jobs (company_id, status, created_at DESC);
