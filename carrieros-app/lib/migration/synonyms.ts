/**
 * Trucking synonym dictionary for AI column mapping.
 * Keys are canonical target fields; values are source header synonyms.
 */
export const FIELD_SYNONYMS: Record<string, string[]> = {
  name: [
    "name",
    "driver name",
    "driver",
    "operator",
    "full name",
    "employee name",
    "driver full name",
  ],
  phone: ["phone", "phone number", "mobile", "cell", "telephone", "contact phone"],
  email: ["email", "e-mail", "email address", "driver email"],
  licenseNumber: [
    "license",
    "license number",
    "cdl",
    "cdl number",
    "license #",
    "dl number",
  ],
  licenseState: ["license state", "cdl state", "state", "lic state"],
  licenseClass: ["license class", "cdl class", "class"],
  licenseExpiresAt: [
    "license expires",
    "cdl expiration",
    "license expiry",
    "cdl exp",
  ],
  medicalExpiresAt: [
    "medical expires",
    "med card",
    "medical expiration",
    "dot medical",
  ],
  hireDate: ["hire date", "hired", "start date", "date hired"],
  status: ["status", "driver status", "active", "equipment status"],
  location: ["location", "city", "home city", "current location"],
  homeTerminal: ["home terminal", "terminal", "yard", "base"],

  unitNumber: [
    "unit",
    "unit number",
    "unit #",
    "truck #",
    "truck number",
    "truck#",
    "tractor",
    "unit no",
    "truck unit",
  ],
  vin: ["vin", "vehicle identification", "vin number"],
  make: ["make", "manufacturer", "brand"],
  model: ["model"],
  year: ["year", "model year", "yr"],
  licensePlate: ["plate", "license plate", "tag", "lp"],
  mileage: ["mileage", "odometer", "miles", "odo"],

  type: ["type", "trailer type", "equipment type"],

  reference: [
    "reference",
    "load #",
    "load number",
    "load id",
    "pro number",
    "bol",
    "shipment",
  ],
  originCity: ["origin city", "pickup city", "from city", "origin"],
  originState: ["origin state", "pickup state", "from state"],
  destinationCity: [
    "destination city",
    "delivery city",
    "to city",
    "dest city",
    "destination",
  ],
  destinationState: ["destination state", "delivery state", "to state", "dest state"],
  pickupDate: ["pickup", "pickup date", "pu date", "ship date"],
  deliveryDate: ["delivery", "delivery date", "del date", "drop date"],
  rate: ["rate", "linehaul", "amount", "load rate", "revenue"],
  broker: ["broker", "broker name", "brokerage"],
  customer: ["customer", "customer name", "client", "shipper", "bill to"],

  contact: ["contact", "contact name", "primary contact"],
  city: ["city"],
  state: ["state", "st"],
  mcNumber: ["mc", "mc number", "mc #", "mcn", "authority"],
  dotNumber: ["dot", "dot number", "dot #", "usdot"],

  invoiceNumber: ["invoice", "invoice number", "invoice #", "inv #"],
  loadReference: ["load reference", "load #", "load number", "pro"],
  amount: ["amount", "total", "total amount", "invoice amount", "cost"],
  dueDate: ["due date", "due", "payment due"],

  driverName: ["driver name", "driver", "operator", "payee"],
  period: ["period", "pay period", "week", "settlement period"],
  grossPay: ["gross", "gross pay", "gross amount"],
  deductions: ["deductions", "deduct", "advances"],
  netPay: ["net", "net pay", "net amount"],

  date: ["date", "txn date", "transaction date", "service date"],
  truckUnit: ["truck", "truck #", "unit", "unit number", "tractor"],
  gallons: ["gallons", "gals", "qty", "quantity"],
  vendor: ["vendor", "merchant", "station", "shop"],
  description: ["description", "desc", "notes", "work performed"],
  category: ["category", "expense type", "type"],
  notes: ["notes", "comment", "memo"],
  fileName: ["file", "file name", "document", "filename"],
  loadCount: ["loads", "load count", "trips"],
};

export function normalizeHeader(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[_./\\]+/g, " ")
    .replace(/#/g, " #")
    .replace(/\s+/g, " ");
}
