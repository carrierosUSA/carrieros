export type AlphIntentId =
  | "show_loads"
  | "find_drivers"
  | "generate_payroll"
  | "generate_ifta"
  | "create_invoice"
  | "replay_truck"
  | "show_maintenance"
  | "find_unpaid_invoices"
  | "best_broker"
  | "top_profit_truck"
  | "loads_missing_pod"
  | "open_driver"
  | "open_load"
  | "open_broker"
  | "show_compliance"
  | "open_settings"
  | "show_fleet"
  | "show_brokers"
  | "show_documents"
  | "show_finance"
  | "show_analytics"
  | "open_truck"
  | "morning_briefing"
  | "eld_is_supported"
  | "eld_why_not_connected"
  | "eld_what_to_ask"
  | "eld_request_reviewed"
  | "eld_which_support_data"
  | "eld_when_available"
  | "support_help"
  | "support_setup"
  | "support_issue_status"
  | "open_dispatch"
  | "assign_driver"
  | "show_cash_flow"
  | "who_owes_money"
  | "show_expiring"
  | "why_profit_down"
  | "why_fleet_health"
  | "driver_performance"
  | "show_maintenance_due"
  | "upload_pod"
  | "show_workforce"
  | "find_candidates"
  | "open_workforce_ai"
  | "show_workforce_jobs"
  | "show_wallet"
  | "open_wallet_passport"
  | "open_wallet_ai"
  | "wallet_share"
  | "show_network"
  | "open_network_directory"
  | "open_network_ai"
  | "open_network_identity"
  | "open_platform"
  | "open_migration"
  | "start_import"
  | "open_app_store"
  | "open_command_center"
  | "create_load"
  | "pay_invoice"
  | "schedule_maintenance"
  | "open_translation"
  | "open_security"
  | "open_automation"
  | "open_exchange"
  | "open_exchange_ai"
  | "exchange_shop"
  | "open_alph_copilot"
  | "open_driver_alph"
  | "open_dispatcher_alph"
  | "open_safety_alph"
  | "open_maintenance_alph"
  | "open_accounting_alph"
  | "open_owner_alph"
  | "assign_best_driver"
  | "find_reload"
  | "handle_payroll"
  | "show_todays_profit"
  | "find_truck_wash"
  | "unknown";

export type AlphEntities = {
  city?: string;
  state?: string;
  truckUnit?: string;
  driverName?: string;
  brokerName?: string;
  loadReference?: string;
  days?: number;
  status?: string;
  dateHint?: "today" | "week" | "month";
  query?: string;
};

export type AlphParsedCommand = {
  raw: string;
  intent: AlphIntentId;
  entities: AlphEntities;
  confidence: number;
};

export type AlphResultAction = {
  label: string;
  href: string;
  primary?: boolean;
};

export type AlphResultType = "navigate" | "answer" | "action" | "clarify";

export type AlphResult = {
  type: AlphResultType;
  title: string;
  body?: string;
  href?: string;
  confidence: number;
  intent: AlphIntentId;
  data?: Record<string, unknown>;
  actions?: AlphResultAction[];
};

export type AlphAgentId =
  | "dispatch"
  | "finance"
  | "safety"
  | "maintenance";

export type AlphAgentStatus = "coming_soon" | "ready" | "online";

export type AlphAgent = {
  id: AlphAgentId;
  name: string;
  description: string;
  status: AlphAgentStatus;
  statusLabel: string;
};

export type AlphCommand = {
  id: string;
  text: string;
  ranAt: string;
  resultTitle?: string;
};

export type AlphIntentDefinition = {
  id: AlphIntentId;
  label: string;
  examples: string[];
  keywords: string[];
};
