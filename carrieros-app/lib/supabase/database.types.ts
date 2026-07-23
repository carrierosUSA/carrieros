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
    };
    Views: Record<string, never>;
    Functions: { current_company_id: { Args: Record<PropertyKey, never>; Returns: string } };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
