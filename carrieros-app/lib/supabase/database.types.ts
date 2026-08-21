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
      load_document_links: Table<Row>;
      load_payments: Table<Row>;
      fleet_assets: Table<Row>;
      fleet_asset_events: Table<Row>;
      driver_profiles: Table<Row>;
      driver_profile_events: Table<Row>;
      maintenance_work_orders: Table<Row>;
      maintenance_work_order_events: Table<Row>;
      driver_pay_rates: Table<Row>;
      driver_settlements: Table<Row>;
      driver_settlement_loads: Table<Row>;
      driver_settlement_events: Table<Row>;
      carrier_company_profiles: Table<Row>;
      carrier_company_profile_events: Table<Row>;
      fuel_purchase_records: Table<Row>;
      ifta_mileage_records: Table<Row>;
      ifta_record_events: Table<Row>;
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
      list_verified_closure_documents: {
        Args: { p_load_id: string };
        Returns: { document_id: string; title: string; document_type: string }[];
      };
      get_load_closure_readiness: {
        Args: { p_load_id: string };
        Returns: { has_verified_pod: boolean; has_verified_invoice: boolean; ready_to_close: boolean }[];
      };
      link_verified_closure_document: {
        Args: { p_load_id: string; p_document_id: string; p_request_id: string };
        Returns: string;
      };
      close_verified_load: {
        Args: { p_load_id: string; p_expected_status: string; p_exceptions_resolved: boolean; p_note: string | null; p_request_id: string };
        Returns: string;
      };
      list_finance_receivables: {
        Args: Record<PropertyKey, never>;
        Returns: Row[];
      };
      record_verified_invoice: {
        Args: { p_load_id: string; p_invoice_number: string; p_issued_at: string; p_payment_terms_days: number; p_request_id: string };
        Returns: string;
      };
      record_verified_payment: {
        Args: { p_load_id: string; p_amount_cents: number; p_paid_at: string; p_payment_reference: string; p_note: string | null; p_request_id: string };
        Returns: string;
      };
      list_verified_fleet_assets: { Args: Record<PropertyKey, never>; Returns: Row[] };
      save_verified_fleet_asset: {
        Args: { p_asset_id: string | null; p_asset_type: string; p_unit_number: string; p_vin: string; p_year: number | null; p_make: string | null; p_model: string | null; p_status: string; p_annual_inspection_expires_on: string; p_registration_expires_on: string; p_is_reefer: boolean; p_note: string | null; p_request_id: string };
        Returns: string;
      };
      list_verified_driver_profiles: { Args: Record<PropertyKey, never>; Returns: Row[] };
      list_unprofiled_company_drivers: { Args: Record<PropertyKey, never>; Returns: Row[] };
      save_verified_driver_profile: {
        Args: { p_profile_id:string|null;p_driver_user_id:string;p_cdl_state:string;p_cdl_last_four:string;p_cdl_expires_on:string;p_medical_card_expires_on:string;p_hired_on:string|null;p_status:string;p_note:string|null;p_request_id:string };
        Returns: string;
      };
      list_verified_maintenance_orders:{Args:Record<PropertyKey,never>;Returns:Row[]};
      save_verified_maintenance_order:{Args:{p_order_id:string|null;p_asset_id:string;p_category:string;p_severity:string;p_status:string;p_title:string;p_description:string;p_reported_odometer:number|null;p_opened_at:string;p_due_on:string|null;p_completion_note:string|null;p_service_provider:string|null;p_next_service_due_on:string|null;p_next_service_due_odometer:number|null;p_request_id:string};Returns:string};
      list_verified_driver_pay_rates:{Args:Record<PropertyKey,never>;Returns:Row[]};
      list_unsettled_payroll_loads:{Args:Record<PropertyKey,never>;Returns:Row[]};
      list_verified_driver_settlements:{Args:Record<PropertyKey,never>;Returns:Row[]};
      save_verified_driver_pay_rate:{Args:{p_driver_user_id:string;p_cents_per_mile:number;p_effective_on:string;p_note:string|null;p_request_id:string};Returns:string};
      approve_verified_driver_settlement:{Args:{p_driver_user_id:string;p_period_start:string;p_period_end:string;p_load_ids:string[];p_extras_cents:number;p_deductions_cents:number;p_adjustment_note:string|null;p_request_id:string};Returns:string};
      record_verified_driver_settlement_payment:{Args:{p_settlement_id:string;p_paid_at:string;p_payment_reference:string;p_request_id:string};Returns:string};
      get_verified_company_profile:{Args:Record<PropertyKey,never>;Returns:Row[]};
      list_verified_company_team:{Args:Record<PropertyKey,never>;Returns:Row[]};
      save_verified_company_profile:{Args:{p_legal_name:string;p_dba_name:string|null;p_usdot_number:string|null;p_mc_number:string|null;p_contact_email:string|null;p_contact_phone:string|null;p_timezone:string;p_ai_partner_name:string;p_note:string|null;p_request_id:string};Returns:string};
      list_ifta_trucks:{Args:Record<PropertyKey,never>;Returns:Row[]};list_verified_fuel_receipts:{Args:Record<PropertyKey,never>;Returns:Row[]};
      list_ifta_quarter_summary:{Args:{p_year:number;p_quarter:number};Returns:Row[]};list_ifta_quarter_records:{Args:{p_year:number;p_quarter:number};Returns:Row[]};
      record_verified_fuel_purchase:{Args:{p_asset_id:string;p_purchased_at:string;p_jurisdiction:string;p_gallons:number;p_total_cost_cents:number;p_vendor:string|null;p_odometer_miles:number|null;p_source:string;p_receipt_document_id:string|null;p_note:string|null;p_request_id:string};Returns:string};
      record_verified_ifta_mileage:{Args:{p_asset_id:string;p_trip_date:string;p_jurisdiction:string;p_total_miles:number;p_taxable_miles:number;p_source:string;p_evidence_document_id:string|null;p_note:string|null;p_request_id:string};Returns:string};
      void_verified_ifta_record:{Args:{p_record_kind:string;p_record_id:string;p_reason:string;p_request_id:string};Returns:string};
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
