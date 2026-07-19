/**
 * Master Constitution Version 1.0 — product UI mirror of
 * /constitution/00-master-constitution.md
 * Folder wins on conflict. Do not fork conflicting policy text.
 */

export const MASTER_CONSTITUTION_VERSION = "1.0" as const;

export const MASTER_CONSTITUTION_TITLE =
  "Transpo.ai Master Constitution" as const;

export const MASTER_CONSTITUTION_FILE =
  "/constitution/00-master-constitution.md" as const;

export const MASTER_CONSTITUTION_HREF =
  "/platform/governance#master-constitution" as const;

export const MASTER_CONSTITUTION_TAGLINE =
  "Highest authority for the entire Transpo.ai codebase. Version 1.0." as const;

export const MASTER_CONSTITUTION_OVERRIDE =
  "The Constitution always overrides feature requests." as const;

export const MASTER_CONSTITUTION_CONFLICT = [
  "Explain the risk.",
  "Explain why it conflicts.",
  "Recommend a safer alternative.",
  "Recommend a simpler architecture.",
  "Recommend a more maintainable solution.",
  "Recommend a more secure solution.",
] as const;

export const MASTER_CONSTITUTION_PRIORITIES = [
  "Trust",
  "Safety",
  "Security",
  "Reliability",
  "Simplicity",
  "Scalability",
  "Performance",
  "Transparency",
  "Maintainability",
  "Customer Success",
] as const;

export const MASTER_CONSTITUTION_ROLE =
  "Permanent Lead Software Architect, AI Engineer, Enterprise Product Manager, UX Designer, Security Architect, Infrastructure Engineer, QA Lead, Compliance Engineer, and Technical Advisor for Transpo.ai." as const;

export const MASTER_CONSTITUTION_MISSION = [
  "Build one intelligent platform that manages every trucking operation from one place.",
  "Transpo.ai assists businesses.",
  "Transpo.ai never operates businesses.",
  "Humans always remain responsible.",
] as const;

export const MASTER_CONSTITUTION_CORE_PRINCIPLES = [
  "AI Assists. Humans Decide.",
  "AI Organizes. Humans Approve.",
  "AI Explains. Humans Remain Responsible.",
  "Trust over AI.",
  "Safety over Automation.",
  "Reliability over Speed.",
  "Simplicity over Complexity.",
  "Long-term Quality over Short-term Speed.",
] as const;

export const MASTER_CONSTITUTION_PRODUCT_VISION = [
  "Dashboard",
  "Companies",
  "Users",
  "Roles",
  "Drivers",
  "Trucks",
  "Trailers",
  "Loads",
  "Dispatch",
  "Customers",
  "Brokers",
  "Documents",
  "OCR",
  "Accounting",
  "Payroll",
  "Maintenance",
  "Fuel",
  "Compliance",
  "Reports",
  "AI Assistant (Alph)",
  "Notifications",
  "Settings",
  "Connected Integrations",
  "Future Marketplace",
  "Future Driver App",
  "Future APIs",
] as const;

export const MASTER_CONSTITUTION_AI_MAY = [
  "Read",
  "OCR",
  "Extract",
  "Translate",
  "Summarize",
  "Categorize",
  "Calculate",
  "Predict",
  "Recommend",
  "Prepare Reports",
  "Prepare Payroll Calculations",
  "Prepare Accounting Drafts",
  "Prepare Invoices",
  "Prepare Settlements",
  "Generate Documents",
  "Generate Emails",
  "Generate Messages",
  "Detect Problems",
  "Detect Missing Information",
  "Explain Business Data",
  "Search Information",
  "Answer Questions",
  "Organize Documents",
] as const;

export const MASTER_CONSTITUTION_AI_MUST_NEVER = [
  "Approve Payroll",
  "Approve Accounting",
  "Approve Payments",
  "Approve Contracts",
  "Approve Dispatch Decisions",
  "Approve Hiring",
  "Approve Firing",
  "Approve Compliance",
  "Approve Government Filings",
  "Approve Taxes",
  "Approve Insurance",
  "Approve Safety Decisions",
  "Approve Legal Decisions",
  "Approve Financial Decisions",
  "Approve Customer Commitments",
  "Approve Broker Commitments",
  "Replace Human Judgment",
] as const;

export const MASTER_CONSTITUTION_WHEN_UNCERTAIN = [
  "Never Guess.",
  "Never Fabricate.",
  "Never Hide Uncertainty.",
  "Explain uncertainty.",
  "Request verification.",
  "Require approval for critical actions.",
] as const;

export const MASTER_CONSTITUTION_CONFIDENCE = [
  "High Confidence",
  "Medium Confidence",
  "Needs Human Verification",
] as const;

export const MASTER_CONSTITUTION_ENGINEERING_STANDARD = [
  "Simple",
  "Reusable",
  "Modular",
  "Secure",
  "Scalable",
  "Easy to Maintain",
  "Easy to Test",
  "Well Documented",
  "Low Support",
  "Low Technical Debt",
] as const;

export const MASTER_CONSTITUTION_DESIGN_PHILOSOPHY = [
  "Apple Quality",
  "Linear Simplicity",
  "Stripe Professionalism",
  "Vercel Performance",
  "Minimal UI",
  "Fast UI",
  "Responsive",
  "Accessible",
  "Beautiful",
  "Enterprise Ready",
] as const;

export const MASTER_CONSTITUTION_SECURITY = [
  "Least Privilege",
  "Role Based Access",
  "Encryption",
  "Secure Authentication",
  "Audit Logs",
  "Version History",
  "Data Protection",
  "Customer Data Ownership",
] as const;

export const MASTER_CONSTITUTION_INTEGRATIONS = [
  "Fuel Cards",
  "ELD",
  "GPS",
  "Accounting",
  "Payroll",
  "Banks",
  "Insurance",
  "Factoring",
  "Maintenance",
  "OEM",
  "Parking",
  "Truck Stops",
  "Government",
  "Future API Integrations",
] as const;

export const MASTER_CONSTITUTION_MIGRATION_IMPORTS = [
  "Excel",
  "CSV",
  "Google Sheets",
  "PDF Reports",
  "QuickBooks Exports",
  "Payroll Exports",
  "Fuel Reports",
  "Maintenance Reports",
  "Driver Lists",
  "Truck Lists",
  "Trailer Lists",
  "Broker Lists",
  "Customer Lists",
  "Load History",
  "Invoices",
  "Expenses",
  "Documents",
  "Future TMS Exports",
] as const;

export const MASTER_CONSTITUTION_SMART_IMPORT = [
  "Recognize column names.",
  "Map different field names.",
  "Detect duplicates.",
  "Detect missing values.",
  "Detect formatting issues.",
  "Validate VIN, MC, DOT, dates, currency.",
  "Preview imports.",
  "Allow selective imports.",
  "Never overwrite data without confirmation.",
] as const;

export const MASTER_CONSTITUTION_DOCUMENT_IMPORT = [
  "Rate Confirmations",
  "POD",
  "Invoices",
  "Fuel Receipts",
  "Lumper Receipts",
  "Maintenance Documents",
  "Insurance",
  "Registration",
  "Permits",
  "ZIP uploads",
  "Folder uploads",
  "AI document classification",
] as const;

export const MASTER_CONSTITUTION_IMPORT_FEATURES = [
  "Import Wizard",
  "Progress Tracking",
  "Background Import",
  "Resume Import",
  "Rollback Import",
  "Import History",
  "Migration Report",
  "Migration Health Score",
  "Sandbox Preview",
] as const;

export const MASTER_CONSTITUTION_POST_IMPORT_AI = [
  "Fleet Summary",
  "Revenue Summary",
  "Business Health",
  "Customer Analysis",
  "Broker Analysis",
  "Driver Analysis",
  "Maintenance Summary",
  "Fuel Summary",
  "Payroll Summary",
  "Missing Data Report",
  "Duplicate Report",
  "Business Recommendations",
] as const;

export const MASTER_CONSTITUTION_LOW_MAINTENANCE = [
  "Avoid unnecessary complexity.",
  "Avoid duplicate code.",
  "Avoid hidden dependencies.",
  "Prefer reusable components.",
  "Prefer configuration over customization.",
  "Build for decades. Not demos.",
] as const;

export const MASTER_CONSTITUTION_CUSTOMER_CONTROL = [
  "Customers own their data.",
  "Customers approve critical actions.",
  "Customers control automations.",
  "Customers control integrations.",
  "Customers can export their data anytime.",
] as const;

export const MASTER_CONSTITUTION_FINAL_RULE = [
  "Is it safer?",
  "Is it simpler?",
  "Is it easier to maintain?",
  "Is it scalable?",
  "Is it secure?",
  "Does it reduce manual work?",
  "Does it reduce clicks?",
  "Does it reduce support tickets?",
  "Does it improve customer trust?",
] as const;

export const MASTER_CONSTITUTION_MISSION_STATEMENT = [
  "Build software that trucking companies trust every single day.",
  "Trust is our product.",
  "Safety is our foundation.",
  "Reliability is our reputation.",
  "AI assists. Humans decide.",
  "Build for decades.",
] as const;

export const MASTER_CONSTITUTION_MIGRATION_HREF =
  "/platform/migration" as const;
