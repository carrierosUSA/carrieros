/**
 * AI Payroll prep pipeline — reviewable statement + missing evidence flags.
 * Never sends payment without approval (foundation only).
 */

import { listPayrollSettlements } from "@/lib/data/finance-store";
import { getDriverById } from "@/lib/data/drivers";
import type { DriverPayrollSettlement } from "@/lib/types/finance";

export type PayrollPrepEvidenceFlag = {
  code:
    | "missing_pod"
    | "missing_miles"
    | "missing_fuel_receipt"
    | "unverified_detention"
    | "driver_inactive";
  message: string;
  severity: "info" | "warning" | "critical";
};

export type PayrollPrepLine = {
  settlementId: string;
  driverId: string;
  driverName: string;
  periodLabel: string;
  gross: number;
  deductions: number;
  net: number;
  status: DriverPayrollSettlement["status"];
  evidenceFlags: PayrollPrepEvidenceFlag[];
};

export type PayrollPrepStatement = {
  tenantId: string;
  companyId: string;
  preparedAt: string;
  /** Always true until a human approves payment send. */
  paymentBlockedUntilApproval: true;
  lines: PayrollPrepLine[];
  totals: { gross: number; deductions: number; net: number };
  missingEvidenceCount: number;
  summary: string;
};

function flagsForSettlement(
  row: DriverPayrollSettlement,
): PayrollPrepEvidenceFlag[] {
  const flags: PayrollPrepEvidenceFlag[] = [];
  const driver = getDriverById(row.driverId);

  if (!driver || driver.status !== "active") {
    flags.push({
      code: "driver_inactive",
      message: "Driver is missing or not active — verify before paying.",
      severity: "critical",
    });
  }
  if (!row.miles || row.miles <= 0) {
    flags.push({
      code: "missing_miles",
      message: "Miles not recorded on settlement.",
      severity: "warning",
    });
  }
  if (row.detention > 0) {
    flags.push({
      code: "unverified_detention",
      message: "Detention amount present — confirm supporting evidence.",
      severity: "warning",
    });
  }
  if (row.fuelAdvance > 0) {
    flags.push({
      code: "missing_fuel_receipt",
      message: "Fuel advance on file — confirm receipts before final pay.",
      severity: "info",
    });
  }
  if (row.status === "draft" || row.status === "ready") {
    flags.push({
      code: "missing_pod",
      message: "Settlement not paid yet — confirm load docs before pay.",
      severity: "info",
    });
  }

  return flags;
}

export function preparePayrollStatement(input: {
  tenantId: string;
  companyId: string;
}): PayrollPrepStatement {
  const settlements = listPayrollSettlements(input.tenantId);
  const lines: PayrollPrepLine[] = settlements.map((row) => {
    const driver = getDriverById(row.driverId);
    return {
      settlementId: row.id,
      driverId: row.driverId,
      driverName: driver?.name ?? row.driverName,
      periodLabel: row.period,
      gross: row.grossPay,
      deductions: row.deductions,
      net: row.netPay,
      status: row.status,
      evidenceFlags: flagsForSettlement(row),
    };
  });

  const totals = lines.reduce(
    (acc, line) => ({
      gross: acc.gross + line.gross,
      deductions: acc.deductions + line.deductions,
      net: acc.net + line.net,
    }),
    { gross: 0, deductions: 0, net: 0 },
  );

  const missingEvidenceCount = lines.reduce(
    (n, line) =>
      n + line.evidenceFlags.filter((f) => f.severity !== "info").length,
    0,
  );

  return {
    tenantId: input.tenantId,
    companyId: input.companyId,
    preparedAt: new Date().toISOString(),
    paymentBlockedUntilApproval: true,
    lines,
    totals,
    missingEvidenceCount,
    summary:
      lines.length === 0
        ? "No payroll settlements available to prepare."
        : `Prepared ${lines.length} settlement line(s). Payment is blocked until human approval — Alph will never send pay automatically.`,
  };
}
