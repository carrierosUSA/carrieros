export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Row = Record<string, unknown>;
type Table<T extends Row> = { Row: T; Insert: Partial<T>; Update: Partial<T>; Relationships: [] };

export type Database = {
  public: {
    Tables: {
      documents: Table<Row>;
      document_versions: Table<Row>;
      document_ocr_results: Table<Row>;
      document_ocr_fields: Table<Row>;
      document_proposed_actions: Table<Row>;
      document_approvals: Table<Row>;
      document_audit_history: Table<Row>;
      loads: Table<Row>;
      load_stops: Table<Row>;
      load_assignments: Table<Row>;
      load_events: Table<Row>;
      load_notes: Table<Row>;
      load_financials: Table<Row>;
      load_detention_evidence: Table<Row>;
    };
    Views: Record<string, never>;
    Functions: {
      current_company_id: { Args: Record<PropertyKey, never>; Returns: string };
      document_intake_company_id: { Args: Record<PropertyKey, never>; Returns: string };
      current_business_role: { Args: Record<PropertyKey, never>; Returns: string };
      can_read_load: { Args: { p_load_id: string }; Returns: boolean };
      confirm_document_review: {
        Args: { p_document_id: string; p_ocr_result_id: string; p_proposed_action_id: string; p_corrections: Json };
        Returns: string;
      };
      create_load_from_confirmed_rate_confirmation: {
        Args: { p_document_id: string };
        Returns: string;
      };
      record_verified_load_update: {
        Args: {
          p_load_id: string;
          p_expected_status: string;
          p_next_status: string | null;
          p_location: string | null;
          p_eta: string | null;
          p_exception_summary: string | null;
          p_note: string | null;
          p_request_id: string;
        };
        Returns: string;
      };
      list_assignable_company_drivers: {
        Args: Record<PropertyKey, never>;
        Returns: { user_id: string; display_name: string }[];
      };
      assign_verified_load: {
        Args: {
          p_load_id: string;
          p_driver_user_id: string;
          p_truck_unit: string;
          p_trailer_unit: string | null;
          p_equipment_fit_verified: boolean;
          p_hos_verified: boolean;
          p_safety_verified: boolean;
          p_note: string | null;
          p_request_id: string;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
